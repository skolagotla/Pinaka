/**
 * RBAC Initialize API
 * POST /api/rbac/initialize - Initialize RBAC system (create roles and permissions)
 * 
 * This endpoint runs the RBAC initialization script to:
 * 1. Create all system roles
 * 2. Seed the permission matrix
 * 
 * Only Super Admins can run this.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
// Note: hasPermission import removed for now - will use RBAC permissions after initialization
// import { hasPermission } from '@/lib/rbac';
// import { ResourceCategory, PermissionAction } from '@prisma/client';
import { initializePermissionMatrix } from '@/lib/rbac/permissionMatrix';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // For initialization, only require admin role (since RBAC isn't initialized yet)
    // After initialization, permissions will be enforced
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'You do not have permission to initialize RBAC system. Only admins can do this.' 
      });
    }

    // Initialize RBAC system
    console.log('Initializing RBAC system...');
    await initializePermissionMatrix();

    return res.status(200).json({ 
      success: true, 
      message: 'RBAC system initialized successfully. All system roles and permissions have been created.',
      data: {
        initializedAt: new Date().toISOString(),
        initializedBy: user.userId,
      }
    });
  } catch (error: any) {
    console.error('Error initializing RBAC system:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to initialize RBAC system' 
    });
  }
});

