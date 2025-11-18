/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN USER MANAGEMENT API
 * ═══════════════════════════════════════════════════════════════
 * GET /api/admin/users - List all users (landlords and tenants)
 * POST /api/admin/users - Create new user
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');
const { formatPhoneNumber } = require('@/lib/utils/formatters');

async function listUsers(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    let { role, search, page = 1, limit = 50, status } = req.query;
    
    // Fix: Handle "undefined" string from URLSearchParams
    if (role === 'undefined' || role === 'null') role = undefined;
    if (search === 'undefined' || search === 'null') search = undefined;
    if (status === 'undefined' || status === 'null') status = undefined;

    console.log('[Admin Users API] ==========================================');
    console.log('[Admin Users API] Request params:', { role, search, page, limit, status });
    console.log('[Admin Users API] Admin user making request:', { id: admin?.id, email: admin?.email, role: admin?.role });
    console.log('[Admin Users API] ==========================================');
    
    // DEBUG: Check total admin count in database
    const totalAdminCount = await prisma.admin.count();
    console.log('[Admin Users API] Total admins in database:', totalAdminCount);
    
    // DEBUG: Check if current admin exists
    const currentAdminCheck = await prisma.admin.findUnique({
      where: { id: admin?.id },
      select: { id: true, email: true, role: true, isActive: true, isLocked: true }
    });
    console.log('[Admin Users API] Current admin check:', currentAdminCheck);

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

    // Build where clause
    const where: any = {};

    if (role === 'landlord') {
      // Build where clause for landlords
      const landlordWhere: any = {};
      
      if (search) {
        landlordWhere.OR = [
          { email: { contains: search as string, mode: 'insensitive' } },
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
        ];
      }
      
      // Filter by status (approvalStatus)
      // Note: If status is not provided or is 'all', show all landlords regardless of approvalStatus
      if (status && status !== 'all') {
        if (status === 'active') {
          landlordWhere.approvalStatus = 'APPROVED';
        } else if (status === 'inactive') {
          landlordWhere.approvalStatus = { in: ['REJECTED'] };
        } else if (status === 'pending') {
          landlordWhere.approvalStatus = 'PENDING';
        }
      }
      // If status is 'all' or not provided, don't filter by approvalStatus (show all)
      
      // Get landlords
      const landlords = await prisma.landlord.findMany({
        where: landlordWhere,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          approvalStatus: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              properties: true,
              invitations: true,
            },
          },
        },
      });

      const total = await prisma.landlord.count({
        where: landlordWhere,
      });

      console.log('[Admin Users API] Landlords query result:', { 
        count: landlords.length, 
        total,
        where: landlordWhere 
      });

      return res.status(200).json({
        success: true,
        data: landlords.map(l => ({
          id: l.id,
          email: l.email,
          firstName: l.firstName,
          lastName: l.lastName,
          phone: l.phone ? formatPhoneNumber(l.phone) : null,
          role: 'landlord',
          status: l.approvalStatus === 'APPROVED' ? 'active' : l.approvalStatus === 'PENDING' ? 'pending' : 'inactive',
          createdAt: l.createdAt,
          updatedAt: l.updatedAt,
          propertiesCount: l._count.properties,
          invitationsCount: l._count.invitations,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } else if (role === 'tenant') {
      // Get tenants
      const tenants = await prisma.tenant.findMany({
        where: {
          ...(search && {
            OR: [
              { email: { contains: search as string, mode: 'insensitive' } },
              { firstName: { contains: search as string, mode: 'insensitive' } },
              { lastName: { contains: search as string, mode: 'insensitive' } },
            ],
          }),
          ...(status && { hasAccess: status === 'active' }),
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          hasAccess: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const total = await prisma.tenant.count({
        where: {
          ...(search && {
            OR: [
              { email: { contains: search as string, mode: 'insensitive' } },
              { firstName: { contains: search as string, mode: 'insensitive' } },
              { lastName: { contains: search as string, mode: 'insensitive' } },
            ],
          }),
          ...(status && { hasAccess: status === 'active' }),
        },
      });

      return res.status(200).json({
        success: true,
        data: tenants.map(t => ({
          id: t.id,
          email: t.email,
          firstName: t.firstName,
          lastName: t.lastName,
          phone: t.phone ? formatPhoneNumber(t.phone) : null,
          role: 'tenant',
          status: t.hasAccess ? 'active' : 'inactive',
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } else if (role === 'admin') {
      // Get admins
      const adminWhere: any = {};
      if (search) {
        adminWhere.OR = [
          { email: { contains: search as string, mode: 'insensitive' } },
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
        ];
      }
      // Filter by status for admins
      // Note: Don't filter by status at DB level - filter after RBAC check
      // This ensures we get all admins first, then filter by status after checking RBAC roles
      if (status && status !== 'all') {
        if (status === 'active') {
          adminWhere.isActive = true;
          adminWhere.isLocked = false;
        } else if (status === 'inactive') {
          adminWhere.isActive = false;
        } else if (status === 'locked') {
          adminWhere.isLocked = true;
        }
      }

      // OPTIMIZATION: Fetch admins with RBAC roles in a single query using include
      // This reduces from 2 queries to 1 query (50% reduction)
      const adminsWithRoles = await prisma.admin.findMany({
        where: adminWhere,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          isLocked: true,
          createdAt: true,
          userRoles: {
            where: {
              userType: 'admin',
              isActive: true,
            },
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                },
              },
            },
          },
        },
      });
      
      console.log('[Admin Users API] Admins found (role=admin, optimized):', {
        count: adminsWithRoles.length,
        whereClause: adminWhere,
        admins: adminsWithRoles.map(a => ({ 
          email: a.email, 
          role: a.role, 
          isActive: a.isActive, 
          isLocked: a.isLocked,
          rbacRolesCount: a.userRoles.length
        }))
      });

      // Count will be recalculated after filtering for SUPER_ADMIN
      const total = await prisma.admin.count({
        where: adminWhere,
      });

      // Map to the expected format and extract userRoles
      const admins = adminsWithRoles.map(a => ({
        id: a.id,
        email: a.email,
        firstName: a.firstName,
        lastName: a.lastName,
        phone: a.phone,
        role: a.role,
        isActive: a.isActive,
        isLocked: a.isLocked,
        createdAt: a.createdAt,
      }));
      
      const userRoles = adminsWithRoles.flatMap(a => 
        a.userRoles.map(ur => ({
          userId: a.id,
          userType: 'admin',
          role: ur.role,
        }))
      );
      
      console.log('[Admin Users API] RBAC roles found (optimized query):', {
        count: userRoles.length,
        roles: userRoles.map(ur => ({
          userId: ur.userId,
          roleName: ur.role.name,
          displayName: ur.role.displayName
        }))
      });

      // Group RBAC roles by userId
      const rbacRolesByUserId = userRoles.reduce((acc, ur) => {
        if (!acc[ur.userId]) {
          acc[ur.userId] = [];
        }
        acc[ur.userId].push(ur);
        return acc;
      }, {} as Record<string, typeof userRoles>);

      // Filter to show SUPER_ADMIN and PMC_ADMIN users (either base role or RBAC role)
      let allowedUsers = admins.filter(a => {
        // Check base role first (this is the primary check)
        if (a.role === 'SUPER_ADMIN') {
          console.log('[Admin Users API] Found SUPER_ADMIN by base role:', a.email);
          return true;
        }
        // Check RBAC roles
        const userRBACRoles = rbacRolesByUserId[a.id] || [];
        const hasSuperAdmin = userRBACRoles.some(ur => ur.role.name === 'SUPER_ADMIN');
        const hasPMCAdmin = userRBACRoles.some(ur => ur.role.name === 'PMC_ADMIN');
        if (hasSuperAdmin || hasPMCAdmin) {
          console.log('[Admin Users API] Found admin by RBAC role:', {
            email: a.email,
            baseRole: a.role,
            rbacRoles: userRBACRoles.map(ur => ur.role.name)
          });
          return true;
        }
        // Log admins that don't match
        console.log('[Admin Users API] Admin filtered out:', {
          email: a.email,
          baseRole: a.role,
          rbacRoles: userRBACRoles.map(ur => ur.role.name),
          reason: 'No SUPER_ADMIN base role and no SUPER_ADMIN/PMC_ADMIN RBAC roles'
        });
        return false;
      });
      
      console.log('[Admin Users API] Admin filtering summary (role=admin):', {
        totalAdmins: admins.length,
        allowedUsers: allowedUsers.length,
        rbacRolesFound: userRoles.length,
        adminsWithRBAC: Object.keys(rbacRolesByUserId).length
      });

      // Apply status filter AFTER RBAC check (if status is provided and not 'all')
      if (status && status !== 'all') {
        allowedUsers = allowedUsers.filter(a => {
          if (status === 'active') {
            return a.isActive && !a.isLocked;
          } else if (status === 'inactive') {
            return !a.isActive;
          } else if (status === 'locked') {
            return a.isLocked;
          }
          return true;
        });
      }

      // Apply pagination
      const paginatedUsers = allowedUsers.slice(skip, skip + limitNum);

      console.log('[Admin Users API] Admin query result:', { 
        totalAdmins: admins.length,
        allowedUsers: allowedUsers.length,
        paginatedUsers: paginatedUsers.length,
        skip,
        limit: limitNum,
        status,
        rbacRolesCount: userRoles.length
      });

      return res.status(200).json({
        success: true,
        data: paginatedUsers.map(a => ({
          id: a.id,
          email: a.email,
          firstName: a.firstName,
          lastName: a.lastName,
          phone: a.phone ? formatPhoneNumber(a.phone) : null,
          role: 'admin',
          adminRole: a.role,
          rbacRoles: rbacRolesByUserId[a.id] || [],
          status: a.isActive && !a.isLocked ? 'active' : a.isLocked ? 'locked' : 'inactive',
          createdAt: a.createdAt,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: allowedUsers.length, // Use filtered count
          totalPages: Math.ceil(allowedUsers.length / limitNum),
        },
      });
    } else if (role === 'pmc') {
      // Get PMC Admin users (Admin users with PMC_ADMIN RBAC role)
      // Note: PMC admins are Admin users, not PropertyManagementCompany records
      const adminWhere: any = {};
      
      if (search) {
        adminWhere.OR = [
          { email: { contains: search as string, mode: 'insensitive' } },
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      // OPTIMIZATION: Fetch admins with RBAC roles in a single query using include
      // This reduces from 2 queries to 1 query (50% reduction)
      const adminsWithRoles = await prisma.admin.findMany({
        where: adminWhere,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          isLocked: true,
          createdAt: true,
          userRoles: {
            where: {
              userType: 'admin',
              isActive: true,
            },
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                },
              },
            },
          },
        },
      });

      // Map to the expected format
      const admins = adminsWithRoles.map(a => ({
        id: a.id,
        email: a.email,
        firstName: a.firstName,
        lastName: a.lastName,
        phone: a.phone,
        role: a.role,
        isActive: a.isActive,
        isLocked: a.isLocked,
        createdAt: a.createdAt,
      }));

      // Extract userRoles from the included data
      const userRoles = adminsWithRoles.flatMap(a => 
        a.userRoles.map(ur => ({
          userId: a.id,
          userType: 'admin',
          role: ur.role,
        }))
      );

      // Group RBAC roles by userId
      const rbacRolesByUserId = userRoles.reduce((acc, ur) => {
        if (!acc[ur.userId]) {
          acc[ur.userId] = [];
        }
        acc[ur.userId].push(ur);
        return acc;
      }, {} as Record<string, typeof userRoles>);

      // Filter to show only PMC_ADMIN users (RBAC role)
      let pmcAdmins = admins.filter(a => {
        const userRBACRoles = rbacRolesByUserId[a.id] || [];
        const hasPMCAdmin = userRBACRoles.some(ur => ur.role.name === 'PMC_ADMIN');
        return hasPMCAdmin;
      });

      // Apply status filter AFTER RBAC check
      if (status && status !== 'all') {
        pmcAdmins = pmcAdmins.filter(a => {
          if (status === 'active') {
            return a.isActive && !a.isLocked;
          } else if (status === 'inactive') {
            return !a.isActive;
          } else if (status === 'locked') {
            return a.isLocked;
          }
          return true;
        });
      }

      // Apply pagination
      const paginatedPMCAdmins = pmcAdmins.slice(skip, skip + limitNum);

      console.log('[Admin Users API] PMC Admin query result:', { 
        totalAdmins: admins.length,
        pmcAdmins: pmcAdmins.length,
        paginatedPMCAdmins: paginatedPMCAdmins.length,
        skip,
        limit: limitNum,
        status
      });

      return res.status(200).json({
        success: true,
        data: paginatedPMCAdmins.map(a => ({
          id: a.id,
          email: a.email,
          firstName: a.firstName,
          lastName: a.lastName,
          phone: a.phone ? formatPhoneNumber(a.phone) : null,
          role: 'pmc',
          adminRole: a.role,
          rbacRoles: rbacRolesByUserId[a.id] || [],
          status: a.isActive && !a.isLocked ? 'active' : a.isLocked ? 'locked' : 'inactive',
          createdAt: a.createdAt,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: pmcAdmins.length,
          totalPages: Math.ceil(pmcAdmins.length / limitNum),
        },
      });
    } else {
      // Get all: admins, landlords, PMCs, and tenants
      // Simple approach: Get all users, then filter by status and search in JavaScript
      let admins: any[] = [];
      let landlords: any[] = [];
      let pmcs: any[] = [];
      let tenants: any[] = [];

      try {
        // OPTIMIZATION: Fetch admins with RBAC roles in a single query
        const [adminsWithRoles, landlords, pmcs, tenants] = await Promise.all([
          // Get ALL admins with RBAC roles - no filtering at DB level
          prisma.admin.findMany({
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              role: true,
              isActive: true,
              isLocked: true,
              createdAt: true,
              userRoles: {
                where: {
                  userType: 'admin',
                  isActive: true,
                },
                select: {
                  role: {
                    select: {
                      id: true,
                      name: true,
                      displayName: true,
                    },
                  },
                },
              },
            },
          }),
          // Get ALL landlords - no filtering at DB level
          prisma.landlord.findMany({
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              approvalStatus: true,
              createdAt: true,
              _count: {
                select: {
                  properties: true,
                },
              },
            },
          }),
          // Get ALL PMCs - no filtering at DB level
          prisma.propertyManagementCompany.findMany({
            select: {
              id: true,
              email: true,
              companyName: true,
              phone: true,
              approvalStatus: true,
              createdAt: true,
              _count: {
                select: {
                  pmcRelationships: true,
                },
              },
            },
          }),
          // Get ALL tenants - no filtering at DB level
          prisma.tenant.findMany({
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              hasAccess: true,
              createdAt: true,
            },
          }),
        ]);
      } catch (queryError: any) {
        console.error('[Admin Users] Error in Promise.all queries:', queryError);
        console.error('[Admin Users] Query error details:', {
          message: queryError.message,
          code: queryError.code,
          meta: queryError.meta,
        });
        throw queryError; // Re-throw to be caught by outer catch
      }

      // OPTIMIZATION: Fetch admins with RBAC roles in a single query using include
      // This reduces from 2 queries to 1 query (50% reduction)
      const adminsWithRoles = await prisma.admin.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          isLocked: true,
          createdAt: true,
          userRoles: {
            where: {
              userType: 'admin',
              isActive: true,
            },
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                },
              },
            },
          },
        },
      });
      
      // Map to the expected format
      const admins = adminsWithRoles.map(a => ({
        id: a.id,
        email: a.email,
        firstName: a.firstName,
        lastName: a.lastName,
        phone: a.phone,
        role: a.role,
        isActive: a.isActive,
        isLocked: a.isLocked,
        createdAt: a.createdAt,
      }));
      
      // Extract userRoles from the included data
      const userRoles = adminsWithRoles.flatMap(a => 
        a.userRoles.map(ur => ({
          userId: a.id,
          userType: 'admin',
          role: ur.role,
        }))
      );

      // Group RBAC roles by userId
      const rbacRolesByUserId = userRoles.reduce((acc, ur) => {
        if (!acc[ur.userId]) {
          acc[ur.userId] = [];
        }
        acc[ur.userId].push(ur);
        return acc;
      }, {} as Record<string, typeof userRoles>);

      // Get admin emails to filter out duplicates
      const adminEmails = new Set(admins.map(a => a.email.toLowerCase()));

      // Filter admins to show SUPER_ADMIN and PMC_ADMIN users
      // IMPORTANT: Show admins with base role 'SUPER_ADMIN' OR with RBAC roles SUPER_ADMIN/PMC_ADMIN
      const allowedAdmins = admins.filter(a => {
        // Check base role first (this is the primary check)
        if (a.role === 'SUPER_ADMIN') {
          console.log('[Admin Users API] Found SUPER_ADMIN by base role:', a.email);
          return true;
        }
        // Check RBAC roles
        const userRBACRoles = rbacRolesByUserId[a.id] || [];
        const hasSuperAdmin = userRBACRoles.some(ur => ur.role.name === 'SUPER_ADMIN');
        const hasPMCAdmin = userRBACRoles.some(ur => ur.role.name === 'PMC_ADMIN');
        if (hasSuperAdmin || hasPMCAdmin) {
          console.log('[Admin Users API] Found admin by RBAC role:', {
            email: a.email,
            baseRole: a.role,
            rbacRoles: userRBACRoles.map(ur => ur.role.name)
          });
          return true;
        }
        // Log admins that don't match
        console.log('[Admin Users API] Admin filtered out:', {
          email: a.email,
          baseRole: a.role,
          rbacRoles: userRBACRoles.map(ur => ur.role.name),
          reason: 'No SUPER_ADMIN base role and no SUPER_ADMIN/PMC_ADMIN RBAC roles'
        });
        return false;
      });
      
      console.log('[Admin Users API] Admin filtering summary:', {
        totalAdmins: admins.length,
        allowedAdmins: allowedAdmins.length,
        rbacRolesFound: userRoles.length,
        adminsWithRBAC: Object.keys(rbacRolesByUserId).length
      });

      // Map all users to a unified format (SUPER_ADMIN and PMC_ADMIN admins only - no landlords, PMCs, or tenants)
      const allUsers = [
        ...allowedAdmins.map(a => {
          const userRBACRoles = rbacRolesByUserId[a.id] || [];
          return {
            id: a.id,
            email: a.email,
            firstName: a.firstName,
            lastName: a.lastName,
            phone: a.phone ? formatPhoneNumber(a.phone) : null,
            role: 'admin',
            adminRole: a.role,
            rbacRoles: userRBACRoles,
            rbacRoleNames: userRBACRoles.map(ur => ur.role.name),
            status: a.isActive && !a.isLocked ? 'active' : a.isLocked ? 'locked' : 'inactive',
            createdAt: a.createdAt,
          };
        }),
      ];
      
      console.log('[Admin Users API] All users before filtering:', {
        totalAdmins: admins.length,
        allowedAdmins: allowedAdmins.length,
        allUsersCount: allUsers.length,
        sampleUsers: allUsers.slice(0, 3).map(u => ({
          email: u.email,
          role: u.role,
          adminRole: u.adminRole,
          rbacRoleNames: u.rbacRoleNames,
          status: u.status
        }))
      });

      // Filter by status: WHERE status = 'active' (only if status is provided and not 'all')
      let filteredUsers = allUsers;
      if (status && status !== 'all') {
        filteredUsers = allUsers.filter(u => {
          if (status === 'active') {
            return u.status === 'active';
          } else if (status === 'inactive') {
            return u.status === 'inactive';
          } else if (status === 'pending') {
            return u.status === 'pending';
          } else if (status === 'locked') {
            return u.status === 'locked';
          }
          return true; // No status filter
        });
      }
      
      console.log('[Admin Users API] All users query result:', { 
        totalAdmins: admins.length,
        allowedAdmins: allowedAdmins.length,
        allUsers: allUsers.length,
        filteredUsers: filteredUsers.length,
        status,
        skip,
        limit: limitNum
      });

      // Filter by search: WHERE name LIKE '%AB%' OR email LIKE '%AB%'
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredUsers = filteredUsers.filter(u => {
          const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().trim();
          const email = (u.email || '').toLowerCase();
          const companyName = ((u as any).companyName || '').toLowerCase();
          return name.includes(searchLower) || 
                 email.includes(searchLower) || 
                 companyName.includes(searchLower);
        });
      }

      // Sort by creation date (handle missing dates)
      filteredUsers.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      // Calculate accurate total after filtering
      const total = filteredUsers.length;
      const paginatedUsers = filteredUsers.slice(skip, skip + limitNum);

      return res.status(200).json({
        success: true,
        data: paginatedUsers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }
  } catch (error: any) {
    console.error('[Admin Users] Error listing users:', error);
    console.error('[Admin Users] Error stack:', error.stack);
    console.error('[Admin Users] Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
}

async function createUser(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { role, email, firstName, lastName, phone, ...otherData } = req.body;

    if (!role || !email || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: role, email, firstName, lastName',
      });
    }

    if (role === 'landlord') {
      const landlord = await prisma.landlord.create({
        data: {
          id: `lld_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          landlordId: `LLD${Date.now().toString(36).toUpperCase()}`,
          email: email.toLowerCase(),
          firstName,
          lastName,
          phone: phone || null,
          ...otherData,
        },
      });

      // Log action
      await prisma.adminAuditLog.create({
        data: {
          id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          adminId: admin.id,
          action: 'create_user',
          resource: 'landlord',
          resourceId: landlord.id,
          details: { email: landlord.email },
          ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          success: true,
        },
      });

      return res.status(201).json({
        success: true,
        data: landlord,
      });
    } else if (role === 'tenant') {
      const tenant = await prisma.tenant.create({
        data: {
          id: `tnt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          tenantId: `TNT${Date.now().toString(36).toUpperCase()}`,
          email: email.toLowerCase(),
          firstName,
          lastName,
          phone: phone || null,
          hasAccess: true,
          ...otherData,
        },
      });

      // Log action
      await prisma.adminAuditLog.create({
        data: {
          id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          adminId: admin.id,
          action: 'create_user',
          resource: 'tenant',
          resourceId: tenant.id,
          details: { email: tenant.email },
          ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          success: true,
        },
      });

      return res.status(201).json({
        success: true,
        data: tenant,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be "landlord" or "tenant"',
      });
    }
  } catch (error: any) {
    console.error('[Admin Users] Error creating user:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to create user',
      message: error.message,
    });
  }
}

export default withAdminAuth(async (req: NextApiRequest, res: NextApiResponse, admin: any) => {
  if (req.method === 'GET') {
    return listUsers(req, res, admin);
  } else if (req.method === 'POST') {
    return createUser(req, res, admin);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}, { requireRole: 'SUPER_ADMIN' });


