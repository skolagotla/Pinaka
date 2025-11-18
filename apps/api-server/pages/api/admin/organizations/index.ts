/**
 * API Endpoint: Admin Organization Management
 * GET /api/admin/organizations - List all organizations
 * POST /api/admin/organizations - Create new organization
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { createErrorResponse, createSuccessResponse, ErrorCodes, handlePrismaError } from '@/lib/utils/error-response';
import { getOrganizationUsage } from '@/lib/utils/organization-helpers';
const { prisma } = require('@/lib/prisma');

async function handler(req: NextApiRequest, res: NextApiResponse, admin: any) {
  if (req.method === 'GET') {
    return handleGet(req, res, admin);
  }

  if (req.method === 'POST') {
    return handlePost(req, res, admin);
  }

  const { statusCode, response } = createErrorResponse(ErrorCodes.METHOD_NOT_ALLOWED, 'Method not allowed', 405);
  return res.status(statusCode).json(response);
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { page = '1', limit = '50', status, plan, search } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    
    // Validate pagination parameters
    if (isNaN(pageNum) || pageNum < 1) {
      const { statusCode, response } = createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid page parameter. Must be a positive number.',
        400
      );
      return res.status(statusCode).json(response);
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      const { statusCode, response } = createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid limit parameter. Must be a number between 1 and 1000.',
        400
      );
      return res.status(statusCode).json(response);
    }
    
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (plan) {
      where.plan = plan;
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { subdomain: { contains: search as string, mode: 'insensitive' } },
        { billingEmail: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.organization.count({ where });

    // Get organizations with usage stats
    const organizations = await prisma.organization.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        settings: true,
        _count: {
          select: {
            landlords: true,
            properties: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Enrich with usage statistics
    const organizationsWithUsage = await Promise.all(
      organizations.map(async (org: any) => {
        const usage = await getOrganizationUsage(prisma, org.id);
        return {
          ...org,
          usage,
        };
      })
    );

    return res.status(200).json(createSuccessResponse({
      organizations: organizationsWithUsage,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
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
      'Failed to fetch organizations',
      500,
      process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
    );
    return res.status(statusCode).json(response);
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const {
      name,
      subdomain,
      plan = 'FREE',
      status = 'ACTIVE',
      maxProperties,
      maxTenants,
      maxUsers,
      maxStorageGB,
      maxApiCallsPerMonth,
      billingEmail,
    } = req.body;

    if (!name) {
      const { statusCode, response } = createErrorResponse(
        ErrorCodes.MISSING_REQUIRED_FIELD,
        'Organization name is required',
        400
      );
      return res.status(statusCode).json(response);
    }

    // Check if subdomain is unique (if provided)
    if (subdomain) {
      const existing = await prisma.organization.findUnique({
        where: { subdomain },
      });
      if (existing) {
        const { statusCode, response } = createErrorResponse(
          ErrorCodes.DUPLICATE_ENTRY,
          'Subdomain already exists',
          409
        );
        return res.status(statusCode).json(response);
      }
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name,
        subdomain: subdomain || null,
        plan,
        status,
        maxProperties: maxProperties || null,
        maxTenants: maxTenants || null,
        maxUsers: maxUsers || null,
        maxStorageGB: maxStorageGB || null,
        maxApiCallsPerMonth: maxApiCallsPerMonth || null,
        billingEmail: billingEmail || null,
      },
    });

    // Create default settings
    await prisma.organizationSettings.create({
      data: {
        organizationId: organization.id,
        emailNotifications: true,
        smsNotifications: false,
      },
    });

    return res.status(201).json(createSuccessResponse(organization));
  } catch (error: any) {
    console.error('[Admin Organizations] Error creating organization:', error);
    if (error.code && error.code.startsWith('P')) {
      const { statusCode, response } = handlePrismaError(error);
      return res.status(statusCode).json(response);
    }
    const { statusCode, response } = createErrorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Failed to create organization',
      500,
      process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
    );
    return res.status(statusCode).json(response);
  }
}

export default withAdminAuth(handler, { allowedMethods: ['GET', 'POST'] });

