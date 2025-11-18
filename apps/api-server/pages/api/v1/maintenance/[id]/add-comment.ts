/**
 * Add Maintenance Comment API v1
 * POST /api/v1/maintenance/:id/comments
 * 
 * Domain-Driven, API-First implementation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { maintenanceService } from '@/lib/domains/maintenance';
import { maintenanceCommentAddSchema } from '@/lib/schemas';
import { z } from 'zod';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid maintenance request ID' });
    }

    // Get maintenance request via domain service
    const maintenanceRequest = await maintenanceService.getById(id);
    if (!maintenanceRequest) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    // Check permissions
    if (user.role === 'tenant') {
      if (maintenanceRequest.tenantId !== user.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    } else if (user.role === 'landlord') {
      // Check if maintenance belongs to landlord's property using domain service
      const belongsToLandlord = await maintenanceService.belongsToLandlord(id, user.userId);
      if (!belongsToLandlord) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    // Parse request body
    const data = maintenanceCommentAddSchema.parse(req.body);

    // Get user info for comment author
    let authorEmail = user.email;
    let authorName = user.userName || user.email;
    let authorRole = user.role;

    if (data.authorInfo) {
      authorEmail = data.authorInfo.authorEmail || authorEmail;
      authorName = data.authorInfo.authorName || authorName;
      authorRole = data.authorInfo.authorRole || authorRole;
    }

    // Get user details if available using domain services
    if (user.role === 'landlord') {
      const { landlordService } = await import('@/lib/domains/landlord');
      try {
        const landlord = await landlordService.getById(user.userId);
        if (landlord) {
          authorEmail = landlord.email;
          authorName = `${landlord.firstName} ${landlord.lastName}`;
        }
      } catch (error) {
        // Use defaults if landlord not found
      }
    } else if (user.role === 'tenant') {
      const { tenantService } = await import('@/lib/domains/tenant');
      try {
        const tenant = await tenantService.getById(user.userId);
        if (tenant) {
          authorEmail = tenant.email;
          authorName = `${tenant.firstName} ${tenant.lastName}`;
        }
      } catch (error) {
        // Use defaults if tenant not found
      }
    }

    // Create comment via domain service
    const comment = await maintenanceService.addComment(id, {
      comment: data.comment,
      authorEmail,
      authorName,
      authorRole,
    });

    return res.status(201).json({
      success: true,
      comment: {
        id: comment.id,
        comment: comment.comment,
        authorEmail: comment.authorEmail,
        authorName: comment.authorName,
        authorRole: comment.authorRole,
        createdAt: comment.createdAt,
      },
      message: 'Comment added successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error('[Add Maintenance Comment v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to add comment',
    });
  }
}, { requireRole: ['landlord', 'tenant', 'pmc'], allowedMethods: ['POST'] });

