/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN PLATFORM CONFIGURATION API
 * ═══════════════════════════════════════════════════════════════
 * GET /api/admin/settings - Get platform settings
 * PUT /api/admin/settings - Update platform settings
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');

// Default settings
const defaultSettings = {
  maintenanceMode: false,
  featureFlags: {
    tenantInvitations: true,
    documentVault: true,
    maintenanceRequests: true,
    rentPayments: true,
  },
  email: {
    enabled: true,
    provider: 'gmail',
  },
  notifications: {
    enabled: true,
    channels: ['email'],
  },
};

async function getSettings(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    let settings = await prisma.platformSettings.findUnique({
      where: { id: 'platform_settings' },
    });

    if (!settings) {
      // Create default settings
      settings = await prisma.platformSettings.create({
        data: {
          id: 'platform_settings',
          maintenanceMode: defaultSettings.maintenanceMode,
          featureFlags: defaultSettings.featureFlags,
          email: defaultSettings.email,
          notifications: defaultSettings.notifications,
        },
      });
    }

    // Merge with defaults to ensure all fields exist
    const mergedSettings = {
      maintenanceMode: settings.maintenanceMode ?? defaultSettings.maintenanceMode,
      featureFlags: { ...defaultSettings.featureFlags, ...(settings.featureFlags as any) },
      email: { ...defaultSettings.email, ...(settings.email as any) },
      notifications: { ...defaultSettings.notifications, ...(settings.notifications as any) },
    };

    return res.status(200).json({
      success: true,
      data: mergedSettings,
    });
  } catch (error: any) {
    console.error('[Admin Settings] Error getting settings:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch settings',
      message: error.message,
    });
  }
}

async function updateSettings(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { maintenanceMode, featureFlags, email, notifications } = req.body;

    // Get current settings
    let currentSettings = await prisma.platformSettings.findUnique({
      where: { id: 'platform_settings' },
    });

    const updateData: any = {};

    if (maintenanceMode !== undefined) {
      updateData.maintenanceMode = maintenanceMode;
    }

    if (featureFlags) {
      updateData.featureFlags = {
        ...(currentSettings?.featureFlags as any || defaultSettings.featureFlags),
        ...featureFlags,
      };
    }

    if (email) {
      updateData.email = {
        ...(currentSettings?.email as any || defaultSettings.email),
        ...email,
      };
    }

    if (notifications) {
      updateData.notifications = {
        ...(currentSettings?.notifications as any || defaultSettings.notifications),
        ...notifications,
      };
    }


    // Upsert settings
    const updatedSettings = await prisma.platformSettings.upsert({
      where: { id: 'platform_settings' },
      update: updateData,
      create: {
        id: 'platform_settings',
        maintenanceMode: maintenanceMode ?? defaultSettings.maintenanceMode,
        featureFlags: updateData.featureFlags || defaultSettings.featureFlags,
        email: updateData.email || defaultSettings.email,
        notifications: updateData.notifications || defaultSettings.notifications,
      },
    });

    // Log action
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        adminId: admin.id,
        action: 'update_settings',
        resource: 'platform',
        details: { changes: req.body },
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: true,
      },
    });

    // Merge with defaults for response
    const responseData = {
      maintenanceMode: updatedSettings.maintenanceMode,
      featureFlags: { ...defaultSettings.featureFlags, ...(updatedSettings.featureFlags as any) },
      email: { ...defaultSettings.email, ...(updatedSettings.email as any) },
      notifications: { ...defaultSettings.notifications, ...(updatedSettings.notifications as any) },
    };


    return res.status(200).json({
      success: true,
      data: responseData,
      message: 'Settings updated successfully',
    });
  } catch (error: any) {
    console.error('[Admin Settings] Error updating settings:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update settings',
      message: error.message,
    });
  }
}

export default withAdminAuth(async (req: NextApiRequest, res: NextApiResponse, admin: any) => {
  if (req.method === 'GET') {
    return getSettings(req, res, admin);
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    return updateSettings(req, res, admin);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}, { requireRole: 'super_admin' });

