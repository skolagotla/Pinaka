/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN INVITATION MANAGEMENT API
 * ═══════════════════════════════════════════════════════════════
 * GET /api/admin/invitations - List invitations sent by admins
 * POST /api/admin/invitations - Create landlord invitation
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { generateSecureToken } from '@/lib/utils/token-generator';
import { sendLandlordInvitation, sendPMCInvitation } from '@/lib/email';
const { prisma } = require('@/lib/prisma');

async function listInvitations(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { type, status, page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    
    // Validate pagination parameters
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ error: 'Invalid page parameter. Must be a positive number.' });
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      return res.status(400).json({ error: 'Invalid limit parameter. Must be a number between 1 and 1000.' });
    }
    
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      invitedByRole: 'admin',
      invitedBy: admin.id,
    };

    if (type) where.type = type;
    if (status) where.status = status;

    const [invitations, total] = await Promise.all([
      prisma.invitation.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invitation.count({ where }),
    ]);

    // PHASE 2: Use invitation approval fields directly (with fallback to linked user for backward compatibility)
    const invitationsWithStatus = await Promise.all(
      invitations.map(async (inv) => {
        if (inv.status === 'completed') {
          // PHASE 2: First check invitation's own approval fields
          let approvalStatus: string | null = null;
          let approvedBy = inv.approvedBy || null;
          let approvedAt = inv.approvedAt || null;
          let rejectedBy = inv.rejectedBy || null;
          let rejectedAt = inv.rejectedAt || null;
          
          // Determine approval status from invitation fields
          if (inv.approvedBy && inv.approvedAt) {
            approvalStatus = 'APPROVED';
          } else if (inv.rejectedBy && inv.rejectedAt) {
            approvalStatus = 'REJECTED';
          } else {
            // Fallback: Fetch from linked user (for backward compatibility)
            try {
              if (inv.type === 'landlord' && inv.landlordId) {
                const landlord = await prisma.landlord.findUnique({
                  where: { id: inv.landlordId },
                  select: { 
                    approvalStatus: true,
                    approvedBy: true,
                    approvedAt: true,
                    rejectedBy: true,
                    rejectedAt: true,
                  },
                });
                if (landlord) {
                  approvalStatus = landlord.approvalStatus;
                  // Only use linked user data if invitation doesn't have it
                  if (!approvedBy) approvedBy = landlord.approvedBy;
                  if (!approvedAt) approvedAt = landlord.approvedAt;
                  if (!rejectedBy) rejectedBy = landlord.rejectedBy;
                  if (!rejectedAt) rejectedAt = landlord.rejectedAt;
                }
              } else if (inv.type === 'pmc' && inv.pmcId) {
                const pmc = await prisma.propertyManagementCompany.findUnique({
                  where: { id: inv.pmcId },
                  select: { 
                    approvalStatus: true,
                    approvedBy: true,
                    approvedAt: true,
                    rejectedBy: true,
                    rejectedAt: true,
                  },
                });
                if (pmc) {
                  approvalStatus = pmc.approvalStatus;
                  // Only use linked user data if invitation doesn't have it
                  if (!approvedBy) approvedBy = pmc.approvedBy;
                  if (!approvedAt) approvedAt = pmc.approvedAt;
                  if (!rejectedBy) rejectedBy = pmc.rejectedBy;
                  if (!rejectedAt) rejectedAt = pmc.rejectedAt;
                }
              }
            } catch (statusError) {
              console.error('[Admin Invitations] Error fetching approval status for invitation:', inv.id, statusError);
            }
          }
          
          return { 
            ...inv, 
            approvalStatus,
            approvedBy,
            approvedAt,
            rejectedBy,
            rejectedAt,
          };
        }
        return inv;
      })
    );

    // PHASE 1: Filter out approved invitations from main list (unless archive=true)
    const showArchived = req.query.archive === 'true';
    let filteredInvitations = invitationsWithStatus;
    
    if (!showArchived) {
      // Only show pending approvals and non-completed invitations
      filteredInvitations = invitationsWithStatus.filter(inv => {
        // Show if not completed, or if completed but not approved
        return inv.status !== 'completed' || inv.approvalStatus !== 'APPROVED';
      });
    } else {
      // Show only approved invitations when archive=true
      filteredInvitations = invitationsWithStatus.filter(inv => {
        return inv.status === 'completed' && inv.approvalStatus === 'APPROVED';
      });
    }

    // Recalculate total for filtered results
    const filteredTotal = filteredInvitations.length;

    return res.status(200).json({
      success: true,
      data: filteredInvitations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredTotal,
        totalPages: Math.ceil(filteredTotal / limitNum),
      },
      // PHASE 1: Include counts for tabs
      counts: {
        pending: invitationsWithStatus.filter(inv => 
          inv.status !== 'completed' || (inv.status === 'completed' && inv.approvalStatus !== 'APPROVED' && inv.approvalStatus !== 'REJECTED')
        ).length,
        approved: invitationsWithStatus.filter(inv => 
          inv.status === 'completed' && inv.approvalStatus === 'APPROVED'
        ).length,
        rejected: invitationsWithStatus.filter(inv => 
          inv.status === 'completed' && inv.approvalStatus === 'REJECTED'
        ).length,
      },
    });
  } catch (error: any) {
    console.error('[Admin Invitations] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch invitations',
      message: error.message,
    });
  }
}

async function createInvitation(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { email, type = 'landlord', expiresInDays = 14, metadata = {} } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    // Restrict invitation types to PMC, Landlord, Vendor, Contractor only (no tenants)
    const allowedTypes = ['landlord', 'pmc', 'vendor', 'contractor'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid invitation type. Allowed types: ${allowedTypes.join(', ')}`,
      });
    }

    // Check if user already exists based on type
    if (type === 'landlord') {
      const existingLandlord = await prisma.landlord.findUnique({ 
        where: { email },
        select: { id: true, email: true, approvalStatus: true, firstName: true, lastName: true }
      });
      if (existingLandlord) {
        const statusMessage = existingLandlord.approvalStatus === 'APPROVED' 
          ? 'An approved landlord account already exists with this email.'
          : existingLandlord.approvalStatus === 'PENDING'
          ? 'A landlord account with this email is pending approval.'
          : 'A landlord account with this email exists but was rejected.';
        
        return res.status(409).json({
          success: false,
          error: statusMessage,
          details: {
            userId: existingLandlord.id,
            approvalStatus: existingLandlord.approvalStatus,
            name: existingLandlord.firstName && existingLandlord.lastName 
              ? `${existingLandlord.firstName} ${existingLandlord.lastName}`
              : null,
          },
        });
      }
    } else if (type === 'pmc') {
      const existingPMC = await prisma.propertyManagementCompany.findUnique({ 
        where: { email },
        select: { id: true, email: true, approvalStatus: true, companyName: true }
      });
      if (existingPMC) {
        const statusMessage = existingPMC.approvalStatus === 'APPROVED' 
          ? 'An approved PMC account already exists with this email.'
          : existingPMC.approvalStatus === 'PENDING'
          ? 'A PMC account with this email is pending approval.'
          : 'A PMC account with this email exists but was rejected.';
        
        return res.status(409).json({
          success: false,
          error: statusMessage,
          details: {
            userId: existingPMC.id,
            approvalStatus: existingPMC.approvalStatus,
            companyName: existingPMC.companyName,
          },
        });
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        type,
        status: { in: ['pending', 'sent', 'opened'] },
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvitation) {
      return res.status(409).json({
        success: false,
        error: 'An active invitation already exists for this email',
      });
    }

    // Generate secure token
    const token = generateSecureToken(32);

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Create invitation with FK tracking
    const invitation = await prisma.invitation.create({
      data: {
        id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        email,
        token,
        type,
        status: 'pending',
        invitedBy: admin.id,
        invitedByRole: 'admin',
        invitedByName: `${admin.firstName} ${admin.lastName}`,
        invitedByEmail: admin.email,
        invitedByAdminId: admin.id, // FK to Admin
        invitationSource: 'admin_dashboard',
        expiresAt,
        metadata: metadata || {},
      },
    });

    // Send invitation email based on type
    try {
      if (type === 'landlord') {
        await sendLandlordInvitation({
          landlordEmail: email,
          landlordName: metadata?.firstName && metadata?.lastName
            ? `${metadata.firstName} ${metadata.lastName}`
            : metadata?.companyName || 'Landlord',
          invitationToken: token,
          inviterName: `${admin.firstName} ${admin.lastName}`,
        });
      } else if (type === 'pmc') {
        await sendPMCInvitation({
          pmcEmail: email,
          pmcName: metadata?.companyName || 'Property Management Company',
          invitationToken: token,
          inviterName: `${admin.firstName} ${admin.lastName}`,
        });
      } else if (type === 'vendor') {
        const { sendVendorInvitation } = require('@/lib/email');
        await sendVendorInvitation({
          vendorEmail: email,
          vendorName: metadata?.businessName || metadata?.contactName || 'Vendor',
          invitationToken: token,
          inviterName: `${admin.firstName} ${admin.lastName}`,
        });
      } else if (type === 'contractor') {
        const { sendContractorInvitation } = require('@/lib/email');
        await sendContractorInvitation({
          contractorEmail: email,
          contractorName: metadata?.businessName || metadata?.contactName || 'Contractor',
          invitationToken: token,
          inviterName: `${admin.firstName} ${admin.lastName}`,
        });
      }

      // Update status to 'sent'
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'sent' },
      });
    } catch (emailError: any) {
      console.error('[Admin Invitations] Email error:', emailError);
      // Don't fail the request if email fails
    }

    // Log action
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        adminId: admin.id,
        action: 'create_invitation',
        resource: 'invitation',
        resourceId: invitation.id,
        details: { email, type },
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: invitation,
    });
  } catch (error: any) {
    console.error('[Admin Invitations] Error creating invitation:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create invitation',
      message: error.message,
    });
  }
}

export default withAdminAuth(async (req: NextApiRequest, res: NextApiResponse, admin: any) => {
  if (req.method === 'GET') {
    return listInvitations(req, res, admin);
  } else if (req.method === 'POST') {
    return createInvitation(req, res, admin);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}, { requireRole: 'super_admin' });

