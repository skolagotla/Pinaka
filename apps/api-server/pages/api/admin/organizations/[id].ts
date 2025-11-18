/**
 * API Endpoint: Admin Organization Management (Individual)
 * GET /api/admin/organizations/[id] - Get organization details
 * PATCH /api/admin/organizations/[id] - Update organization
 * DELETE /api/admin/organizations/[id] - Delete organization (soft delete by setting status)
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { createErrorResponse, createSuccessResponse, ErrorCodes, handlePrismaError } from '@/lib/utils/error-response';
import { getOrganizationUsage, checkOrganizationLimits } from '@/lib/utils/organization-helpers';
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

  if (req.method === 'DELETE') {
    return handleDelete(req, res, admin, id);
  }

  const { statusCode, response } = createErrorResponse(ErrorCodes.METHOD_NOT_ALLOWED, 'Method not allowed', 405);
  return res.status(statusCode).json(response);
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, admin: any, id: string) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        settings: true,
        landlords: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            approvalStatus: true,
            createdAt: true,
          },
        },
        properties: {
          select: {
            id: true,
            propertyId: true,
            propertyName: true,
            addressLine1: true,
            city: true,
            createdAt: true,
          },
          take: 10, // Limit to recent properties
        },
        _count: {
          select: {
            landlords: true,
            properties: true,
          },
        },
      },
    });

    if (!organization) {
      const { statusCode, response } = createErrorResponse(ErrorCodes.NOT_FOUND, 'Organization not found', 404);
      return res.status(statusCode).json(response);
    }

    // Get usage statistics
    const usage = await getOrganizationUsage(prisma, id);
    const limits = await checkOrganizationLimits(prisma, id);

    return res.status(200).json(createSuccessResponse({
      ...organization,
      usage,
      limits: {
        withinLimits: limits.withinLimits,
        exceededLimits: limits.exceededLimits,
      },
    }));
  } catch (error: any) {
    console.error('[Admin Organizations] Error:', error);
    if (error.code && error.code.startsWith('P')) {
      const { statusCode, response } = handlePrismaError(error);
      return res.status(statusCode).json(response);
    }
    const { statusCode, response } = createErrorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Failed to fetch organization',
      500,
      process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
    );
    return res.status(statusCode).json(response);
  }
}

async function handlePatch(req: NextApiRequest, res: NextApiResponse, admin: any, id: string) {
  try {
    const {
      name,
      subdomain,
      plan,
      status,
      subscriptionStatus,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      maxProperties,
      maxTenants,
      maxUsers,
      maxStorageGB,
      maxApiCallsPerMonth,
      billingEmail,
      billingAddress,
      billingCity,
      billingState,
      billingPostalCode,
      billingCountry,
      trialEndsAt,
    } = req.body;

    // Verify organization exists
    const existing = await prisma.organization.findUnique({
      where: { id },
    });

    if (!existing) {
      const { statusCode, response } = createErrorResponse(ErrorCodes.NOT_FOUND, 'Organization not found', 404);
      return res.status(statusCode).json(response);
    }

    // Check subdomain uniqueness if changing
    if (subdomain && subdomain !== existing.subdomain) {
      const duplicate = await prisma.organization.findUnique({
        where: { subdomain },
      });
      if (duplicate) {
        const { statusCode, response } = createErrorResponse(
          ErrorCodes.DUPLICATE_ENTRY,
          'Subdomain already exists',
          409
        );
        return res.status(statusCode).json(response);
      }
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (subdomain !== undefined) updateData.subdomain = subdomain;
    if (plan !== undefined) updateData.plan = plan;
    if (status !== undefined) updateData.status = status;
    if (subscriptionStatus !== undefined) updateData.subscriptionStatus = subscriptionStatus;
    if (currentPeriodStart !== undefined) updateData.currentPeriodStart = currentPeriodStart ? new Date(currentPeriodStart) : null;
    if (currentPeriodEnd !== undefined) updateData.currentPeriodEnd = currentPeriodEnd ? new Date(currentPeriodEnd) : null;
    if (cancelAtPeriodEnd !== undefined) updateData.cancelAtPeriodEnd = cancelAtPeriodEnd;
    if (maxProperties !== undefined) updateData.maxProperties = maxProperties;
    if (maxTenants !== undefined) updateData.maxTenants = maxTenants;
    if (maxUsers !== undefined) updateData.maxUsers = maxUsers;
    if (maxStorageGB !== undefined) updateData.maxStorageGB = maxStorageGB;
    if (maxApiCallsPerMonth !== undefined) updateData.maxApiCallsPerMonth = maxApiCallsPerMonth;
    if (billingEmail !== undefined) updateData.billingEmail = billingEmail;
    if (billingAddress !== undefined) updateData.billingAddress = billingAddress;
    if (billingCity !== undefined) updateData.billingCity = billingCity;
    if (billingState !== undefined) updateData.billingState = billingState;
    if (billingPostalCode !== undefined) updateData.billingPostalCode = billingPostalCode;
    if (billingCountry !== undefined) updateData.billingCountry = billingCountry;
    if (trialEndsAt !== undefined) updateData.trialEndsAt = trialEndsAt ? new Date(trialEndsAt) : null;

    const updated = await prisma.organization.update({
      where: { id },
      data: updateData,
      include: {
        settings: true,
      },
    });

    return res.status(200).json(createSuccessResponse(updated));
  } catch (error: any) {
    console.error('[Admin Organizations] Error updating organization:', error);
    if (error.code && error.code.startsWith('P')) {
      const { statusCode, response } = handlePrismaError(error);
      return res.status(statusCode).json(response);
    }
    const { statusCode, response } = createErrorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Failed to update organization',
      500,
      process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
    );
    return res.status(statusCode).json(response);
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, admin: any, id: string) {
  try {
    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      const { statusCode, response } = createErrorResponse(ErrorCodes.NOT_FOUND, 'Organization not found', 404);
      return res.status(statusCode).json(response);
    }

    // Soft delete by setting status to CANCELLED
    // Don't actually delete to preserve data integrity
    const updated = await prisma.organization.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });

    return res.status(200).json(createSuccessResponse({
      message: 'Organization cancelled successfully',
      organization: updated,
    }));
  } catch (error: any) {
    console.error('[Admin Organizations] Error cancelling organization:', error);
    if (error.code && error.code.startsWith('P')) {
      const { statusCode, response } = handlePrismaError(error);
      return res.status(statusCode).json(response);
    }
    const { statusCode, response } = createErrorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Failed to cancel organization',
      500,
      process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
    );
    return res.status(statusCode).json(response);
  }
}

export default withAdminAuth(handler, { allowedMethods: ['GET', 'PATCH', 'DELETE'] });

