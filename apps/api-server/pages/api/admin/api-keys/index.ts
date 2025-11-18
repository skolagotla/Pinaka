/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN API KEY MANAGEMENT
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const crypto = require('crypto');
const { prisma } = require('@/lib/prisma');

async function listApiKeys(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { isActive } = req.query;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const apiKeys = await prisma.apiKey.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Don't return the actual key, only show last 4 characters
    const sanitizedKeys = apiKeys.map((key: any) => ({
      ...key,
      key: key.key.substring(0, 8) + '...' + key.key.substring(key.key.length - 4),
    }));

    return res.status(200).json({
      success: true,
      data: sanitizedKeys,
    });
  } catch (error: any) {
    console.error('[Admin API Keys] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch API keys',
      message: error.message,
    });
  }
}

async function createApiKey(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { name, permissions, rateLimit, expiresAt } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required',
      });
    }

    // Generate API key
    const key = `pk_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');

    const apiKey = await prisma.apiKey.create({
      data: {
        id: `apikey_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        name,
        key,
        keyHash,
        permissions: permissions || ['read'],
        rateLimit: rateLimit || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: admin.id,
        createdByEmail: admin.email,
      },
    });

    // Log action
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        adminId: admin.id,
        action: 'create_api_key',
        resource: 'api_key',
        resourceId: apiKey.id,
        details: { name },
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: true,
      },
    });

    // Return the full key only once (for display)
    return res.status(201).json({
      success: true,
      data: apiKey,
      message: 'API key created. Save this key securely - it will not be shown again.',
    });
  } catch (error: any) {
    console.error('[Admin API Keys] Error creating API key:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create API key',
      message: error.message,
    });
  }
}

async function updateApiKey(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { id } = req.query;
    const updateData: any = {};

    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.permissions !== undefined) updateData.permissions = req.body.permissions;
    if (req.body.rateLimit !== undefined) updateData.rateLimit = req.body.rateLimit;
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;
    if (req.body.expiresAt !== undefined) updateData.expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : null;

    const apiKey = await prisma.apiKey.update({
      where: { id: id as string },
      data: updateData,
    });

    // Log action
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        adminId: admin.id,
        action: 'update_api_key',
        resource: 'api_key',
        resourceId: apiKey.id,
        details: { changes: updateData },
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        ...apiKey,
        key: apiKey.key.substring(0, 8) + '...' + apiKey.key.substring(apiKey.key.length - 4),
      },
    });
  } catch (error: any) {
    console.error('[Admin API Keys] Error updating API key:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update API key',
      message: error.message,
    });
  }
}

async function deleteApiKey(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { id } = req.query;

    await prisma.apiKey.delete({
      where: { id: id as string },
    });

    // Log action
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        adminId: admin.id,
        action: 'delete_api_key',
        resource: 'api_key',
        resourceId: id as string,
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'API key deleted successfully',
    });
  } catch (error: any) {
    console.error('[Admin API Keys] Error deleting API key:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete API key',
      message: error.message,
    });
  }
}

export default withAdminAuth(async (req: NextApiRequest, res: NextApiResponse, admin: any) => {
  if (req.method === 'GET') {
    return listApiKeys(req, res, admin);
  } else if (req.method === 'POST') {
    return createApiKey(req, res, admin);
  } else if (req.method === 'PATCH') {
    return updateApiKey(req, res, admin);
  } else if (req.method === 'DELETE') {
    return deleteApiKey(req, res, admin);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}, { requireRole: 'SUPER_ADMIN' });

