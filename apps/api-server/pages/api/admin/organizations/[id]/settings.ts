/**
 * API Endpoint: Admin Organization Settings Management
 * GET /api/admin/organizations/[id]/settings - Get organization settings
 * PATCH /api/admin/organizations/[id]/settings - Update organization settings
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { createErrorResponse, createSuccessResponse, ErrorCodes, handlePrismaError } from '@/lib/utils/error-response';
const { prisma } = require('@/lib/prisma');

async function handler(req: NextApiRequest, res: NextApiResponse, admin: any) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    const { statusCode, response } = createErrorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid organization ID', 400);
    return res.status(statusCode).json(response);
  }

  if (req.method === 'GET') {
    return handleGet(req, res, admin, id);
  }

  if (req.method === 'PATCH') {
    return handlePatch(req, res, admin, id);
  }

  const { statusCode, response } = createErrorResponse(ErrorCodes.METHOD_NOT_ALLOWED, 'Method not allowed', 405);
  return res.status(statusCode).json(response);
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, admin: any, id: string) {
  try {
    const settings = await prisma.organizationSettings.findUnique({
      where: { organizationId: id },
    });

    if (!settings) {
      // Create default settings if they don't exist
      const newSettings = await prisma.organizationSettings.create({
        data: {
          organizationId: id,
          emailNotifications: true,
          smsNotifications: false,
        },
      });
      return res.status(200).json(createSuccessResponse(newSettings));
    }

    return res.status(200).json(createSuccessResponse(settings));
  } catch (error: any) {
    console.error('[Admin Organization Settings] Error:', error);
    if (error.code && error.code.startsWith('P')) {
      const { statusCode, response } = handlePrismaError(error);
      return res.status(statusCode).json(response);
    }
    const { statusCode, response } = createErrorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Failed to fetch settings',
      500,
      process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
    );
    return res.status(statusCode).json(response);
  }
}

async function handlePatch(req: NextApiRequest, res: NextApiResponse, admin: any, id: string) {
  try {
    const {
      logoUrl,
      primaryColor,
      secondaryColor,
      companyName,
      features,
      integrations,
      emailNotifications,
      smsNotifications,
      customDomain,
      customCss,
    } = req.body;

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      const { statusCode, response } = createErrorResponse(ErrorCodes.NOT_FOUND, 'Organization not found', 404);
      return res.status(statusCode).json(response);
    }

    // Check custom domain uniqueness if changing
    if (customDomain) {
      const existing = await prisma.organizationSettings.findFirst({
        where: {
          customDomain,
          organizationId: { not: id },
        },
      });
      if (existing) {
        const { statusCode, response } = createErrorResponse(
          ErrorCodes.DUPLICATE_ENTRY,
          'Custom domain already in use',
          409
        );
        return res.status(statusCode).json(response);
      }
    }

    // Build update data
    const updateData: any = {};
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
    if (secondaryColor !== undefined) updateData.secondaryColor = secondaryColor;
    if (companyName !== undefined) updateData.companyName = companyName;
    if (features !== undefined) updateData.features = features;
    if (integrations !== undefined) updateData.integrations = integrations;
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
    if (smsNotifications !== undefined) updateData.smsNotifications = smsNotifications;
    if (customDomain !== undefined) updateData.customDomain = customDomain;
    if (customCss !== undefined) updateData.customCss = customCss;

    // Upsert settings (create if doesn't exist)
    const settings = await prisma.organizationSettings.upsert({
      where: { organizationId: id },
      update: updateData,
      create: {
        organizationId: id,
        ...updateData,
        emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
        smsNotifications: smsNotifications !== undefined ? smsNotifications : false,
      },
    });

    return res.status(200).json(createSuccessResponse(settings));
  } catch (error: any) {
    console.error('[Admin Organization Settings] Error updating settings:', error);
    if (error.code && error.code.startsWith('P')) {
      const { statusCode, response } = handlePrismaError(error);
      return res.status(statusCode).json(response);
    }
    const { statusCode, response } = createErrorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Failed to update settings',
      500,
      process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
    );
    return res.status(statusCode).json(response);
  }
}

export default withAdminAuth(handler, { allowedMethods: ['GET', 'PATCH'] });

