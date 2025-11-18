/**
 * API Endpoint: Get Organization Usage Statistics
 * GET /api/organizations/usage - Get current usage statistics for organization
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { createErrorResponse, createSuccessResponse, ErrorCodes } from '@/lib/utils/error-response';
import { getOrganizationUsage, checkOrganizationLimits } from '@/lib/utils/organization-helpers';
import { getApiCallStats } from '@/lib/utils/organization-api-tracking';
import { getTrialStatus } from '@/lib/services/trial-handler';
const { prisma } = require('@/lib/prisma');

async function handler(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  if (req.method !== 'GET') {
    const { statusCode, response } = createErrorResponse(ErrorCodes.METHOD_NOT_ALLOWED, 'Method not allowed', 405);
    return res.status(statusCode).json(response);
  }

  try {
    const organizationId = user.organizationId;

    if (!organizationId) {
      const { statusCode, response } = createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'No organization assigned to user',
        400
      );
      return res.status(statusCode).json(response);
    }

    // Get organization limits
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        maxProperties: true,
        maxTenants: true,
        maxUsers: true,
        maxStorageGB: true,
        maxApiCallsPerMonth: true,
      },
    });

    if (!organization) {
      const { statusCode, response } = createErrorResponse(ErrorCodes.NOT_FOUND, 'Organization not found', 404);
      return res.status(statusCode).json(response);
    }

    // Get usage statistics
    const usage = await getOrganizationUsage(prisma, organizationId);
    const limits = await checkOrganizationLimits(prisma, organizationId);
    
    // Get API call statistics
    const apiStats = getApiCallStats(organizationId);
    
    // Get trial status
    const trialStatus = await getTrialStatus(prisma, organizationId);

    // Calculate percentages
    const percentages = {
      properties: organization.maxProperties
        ? Math.round((usage.propertyCount / organization.maxProperties) * 100)
        : null,
      tenants: organization.maxTenants
        ? Math.round((usage.tenantCount / organization.maxTenants) * 100)
        : null,
      users: organization.maxUsers
        ? Math.round((usage.userCount / organization.maxUsers) * 100)
        : null,
      storage: organization.maxStorageGB
        ? Math.round((usage.storageGB / organization.maxStorageGB) * 100)
        : null,
      apiCalls: organization.maxApiCallsPerMonth && apiStats
        ? Math.round((apiStats.count / organization.maxApiCallsPerMonth) * 100)
        : null,
    };

    return res.status(200).json(createSuccessResponse({
      usage: {
        ...usage,
        apiCalls: apiStats?.count || 0,
      },
      limits: {
        maxProperties: organization.maxProperties,
        maxTenants: organization.maxTenants,
        maxUsers: organization.maxUsers,
        maxStorageGB: organization.maxStorageGB,
        maxApiCallsPerMonth: organization.maxApiCallsPerMonth,
      },
      percentages,
      status: {
        withinLimits: limits.withinLimits,
        exceededLimits: limits.exceededLimits,
      },
      apiStats: apiStats ? {
        count: apiStats.count,
        resetAt: apiStats.resetAt,
        remaining: organization.maxApiCallsPerMonth
          ? Math.max(0, organization.maxApiCallsPerMonth - apiStats.count)
          : null,
      } : null,
      trialStatus,
    }));
  } catch (error: any) {
    console.error('[Organizations Usage API] Error:', error);
    const { statusCode, response } = createErrorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Failed to fetch usage statistics',
      500,
      process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
    );
    return res.status(statusCode).json(response);
  }
}

export default withAuth(handler, { allowedMethods: ['GET'] });

