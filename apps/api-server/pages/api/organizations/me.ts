/**
 * API Endpoint: Get Current User's Organization
 * GET /api/organizations/me - Get organization details for current user
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
    // Get organizationId from user context
    const organizationId = user.organizationId;

    if (!organizationId) {
      // User doesn't have an organization yet (backward compatibility)
      return res.status(200).json(createSuccessResponse({
        organization: null,
        message: 'No organization assigned. This is normal for shared resources (PMCs, Vendors, Contractors).'
      }));
    }

    // Get organization with settings
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        settings: true,
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

    return res.status(200).json(createSuccessResponse({
      organization: {
        id: organization.id,
        name: organization.name,
        subdomain: organization.subdomain,
        plan: organization.plan,
        status: organization.status,
        subscriptionStatus: organization.subscriptionStatus,
        currentPeriodStart: organization.currentPeriodStart,
        currentPeriodEnd: organization.currentPeriodEnd,
        cancelAtPeriodEnd: organization.cancelAtPeriodEnd,
        trialEndsAt: organization.trialEndsAt,
        settings: organization.settings,
        limits: {
          maxProperties: organization.maxProperties,
          maxTenants: organization.maxTenants,
          maxUsers: organization.maxUsers,
          maxStorageGB: organization.maxStorageGB,
          maxApiCallsPerMonth: organization.maxApiCallsPerMonth,
        },
      },
      usage: {
        ...usage,
        apiCalls: apiStats?.count || 0,
      },
      limits: {
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
    console.error('[Organizations API] Error:', error);
    const { statusCode, response } = createErrorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Failed to fetch organization',
      500,
      process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
    );
    return res.status(statusCode).json(response);
  }
}

export default withAuth(handler, { allowedMethods: ['GET'] });

