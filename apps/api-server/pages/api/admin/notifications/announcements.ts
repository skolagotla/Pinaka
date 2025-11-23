/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN NOTIFICATION MANAGEMENT - ANNOUNCEMENTS
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');

async function listAnnouncements(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { activeOnly } = req.query;

    const where: any = {};
    if (activeOnly === 'true') {
      where.isActive = true;
      where.OR = [
        { startDate: null },
        { startDate: { lte: new Date() } },
      ];
      where.OR.push(
        { endDate: null },
        { endDate: { gte: new Date() } }
      );
    }

    const announcements = await prisma.systemAnnouncement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error: any) {
    console.error('[Admin Notifications] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch announcements',
      message: error.message,
    });
  }
}

async function createAnnouncement(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { title, message, type, targetAudience, startDate, endDate, isActive } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Title and message are required',
      });
    }

    const announcement = await prisma.systemAnnouncement.create({
      data: {
        id: `announcement_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        title,
        message,
        type: type || 'info',
        targetAudience: targetAudience || ['all'],
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: admin.id,
        createdByEmail: admin.email,
      },
    });

    // Log action
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        adminId: admin.id,
        action: 'create_announcement',
        resource: 'system_announcement',
        resourceId: announcement.id,
        details: { title },
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: announcement,
    });
  } catch (error: any) {
    console.error('[Admin Notifications] Error creating announcement:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create announcement',
      message: error.message,
    });
  }
}

async function updateAnnouncement(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { id } = req.query;
    const updateData: any = {};

    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.message !== undefined) updateData.message = req.body.message;
    if (req.body.type !== undefined) updateData.type = req.body.type;
    if (req.body.targetAudience !== undefined) updateData.targetAudience = req.body.targetAudience;
    if (req.body.startDate !== undefined) updateData.startDate = req.body.startDate ? new Date(req.body.startDate) : null;
    if (req.body.endDate !== undefined) updateData.endDate = req.body.endDate ? new Date(req.body.endDate) : null;
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;

    const announcement = await prisma.systemAnnouncement.update({
      where: { id: id as string },
      data: updateData,
    });

    // Log action
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        adminId: admin.id,
        action: 'update_announcement',
        resource: 'system_announcement',
        resourceId: announcement.id,
        details: { changes: updateData },
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error: any) {
    console.error('[Admin Notifications] Error updating announcement:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update announcement',
      message: error.message,
    });
  }
}

async function deleteAnnouncement(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { id } = req.query;

    await prisma.systemAnnouncement.delete({
      where: { id: id as string },
    });

    // Log action
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        adminId: admin.id,
        action: 'delete_announcement',
        resource: 'system_announcement',
        resourceId: id as string,
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error: any) {
    console.error('[Admin Notifications] Error deleting announcement:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete announcement',
      message: error.message,
    });
  }
}

export default withAdminAuth(async (req: NextApiRequest, res: NextApiResponse, admin: any) => {
  if (req.method === 'GET') {
    return listAnnouncements(req, res, admin);
  } else if (req.method === 'POST') {
    return createAnnouncement(req, res, admin);
  } else if (req.method === 'PATCH') {
    return updateAnnouncement(req, res, admin);
  } else if (req.method === 'DELETE') {
    return deleteAnnouncement(req, res, admin);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}, { requireRole: 'super_admin' });

