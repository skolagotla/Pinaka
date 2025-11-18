/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN CONTENT MANAGEMENT
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');

async function listContent(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { type, isPublished, search } = req.query;

    const where: any = {};
    if (type) where.type = type;
    if (isPublished !== undefined) where.isPublished = isPublished === 'true';
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const content = await prisma.contentItem.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error: any) {
    console.error('[Admin Content] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch content',
      message: error.message,
    });
  }
}

async function createContent(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { type, title, content, slug, isPublished, metadata } = req.body;

    if (!type || !title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Type, title, and content are required',
      });
    }

    const contentItem = await prisma.contentItem.create({
      data: {
        id: `content_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        type,
        title,
        content,
        slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
        isPublished: isPublished || false,
        metadata: metadata || {},
        createdBy: admin.id,
        createdByEmail: admin.email,
      },
    });

    // Log action
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        adminId: admin.id,
        action: 'create_content',
        resource: 'content_item',
        resourceId: contentItem.id,
        details: { type, title },
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: contentItem,
    });
  } catch (error: any) {
    console.error('[Admin Content] Error creating content:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create content',
      message: error.message,
    });
  }
}

async function updateContent(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { id } = req.query;
    const updateData: any = {};

    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.content !== undefined) updateData.content = req.body.content;
    if (req.body.slug !== undefined) updateData.slug = req.body.slug;
    if (req.body.isPublished !== undefined) updateData.isPublished = req.body.isPublished;
    if (req.body.metadata !== undefined) updateData.metadata = req.body.metadata;
    updateData.updatedBy = admin.id;
    updateData.updatedByEmail = admin.email;
    updateData.version = { increment: 1 };

    const contentItem = await prisma.contentItem.update({
      where: { id: id as string },
      data: updateData,
    });

    // Log action
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        adminId: admin.id,
        action: 'update_content',
        resource: 'content_item',
        resourceId: contentItem.id,
        details: { changes: updateData },
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: contentItem,
    });
  } catch (error: any) {
    console.error('[Admin Content] Error updating content:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update content',
      message: error.message,
    });
  }
}

async function deleteContent(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { id } = req.query;

    await prisma.contentItem.delete({
      where: { id: id as string },
    });

    // Log action
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        adminId: admin.id,
        action: 'delete_content',
        resource: 'content_item',
        resourceId: id as string,
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error: any) {
    console.error('[Admin Content] Error deleting content:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete content',
      message: error.message,
    });
  }
}

export default withAdminAuth(async (req: NextApiRequest, res: NextApiResponse, admin: any) => {
  if (req.method === 'GET') {
    return listContent(req, res, admin);
  } else if (req.method === 'POST') {
    return createContent(req, res, admin);
  } else if (req.method === 'PATCH') {
    return updateContent(req, res, admin);
  } else if (req.method === 'DELETE') {
    return deleteContent(req, res, admin);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}, { requireRole: 'SUPER_ADMIN' });

