/**
 * API endpoint to fetch all reference data
 * GET /api/reference-data
 * Returns all dropdown options and constants from database
 */

import type { NextApiRequest, NextApiResponse } from 'next';
const prismaLib = require('@/lib/prisma');
const apiCache = require('@/lib/utils/api-response-cache').default;
const { createCacheKey } = require('@/lib/utils/api-response-cache');

type ReferenceData = {
  countries: any[];
  regions: any[];
  propertyTypes: any[];
  unitStatuses: any[];
  maintenanceCategories: any[];
  maintenancePriorities: any[];
  maintenanceStatuses: any[];
  leaseStatuses: any[];
  paymentStatuses: any[];
};

const { withCache } = require('@/lib/cache/api-cache-wrapper');

const handler = withCache(
  '/api/reference-data',
  async (req: NextApiRequest, res: NextApiResponse<ReferenceData | { error: string }>) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prisma } = prismaLib;

    // Check cache first (reference data changes infrequently)
    const cacheKey = createCacheKey('/api/reference-data');
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    // Fetch all reference data in parallel
    const [
      countries,
      regions,
      referenceData,
    ] = await Promise.all([
      prisma.country.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          code: true,
          name: true,
        },
      }),
      prisma.region.findMany({
        where: { isActive: true },
        orderBy: [{ countryCode: 'asc' }, { sortOrder: 'asc' }],
        select: {
          countryCode: true,
          code: true,
          name: true,
        },
      }),
      prisma.referenceData.findMany({
        where: { isActive: true },
        orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
      }),
    ]);

    // Group reference data by category
    const propertyTypes = referenceData
      .filter(rd => rd.category === 'property_type')
      .map(rd => ({ name: rd.name, description: rd.description }));
    
    const unitStatuses = referenceData
      .filter(rd => rd.category === 'unit_status')
      .map(rd => ({ name: rd.name, color: rd.color }));
    
    const maintenanceCategories = referenceData
      .filter(rd => rd.category === 'maintenance_category')
      .map(rd => ({ name: rd.name }));
    
    const maintenancePriorities = referenceData
      .filter(rd => rd.category === 'maintenance_priority')
      .map(rd => ({ name: rd.name, color: rd.color }));
    
    const maintenanceStatuses = referenceData
      .filter(rd => rd.category === 'maintenance_status')
      .map(rd => ({ name: rd.name, color: rd.color }));
    
    const leaseStatuses = referenceData
      .filter(rd => rd.category === 'lease_status')
      .map(rd => ({ name: rd.name, color: rd.color }));
    
    const paymentStatuses = referenceData
      .filter(rd => rd.category === 'payment_status')
      .map(rd => ({ name: rd.name, color: rd.color }));

    const responseData = {
      countries,
      regions,
      propertyTypes,
      unitStatuses,
      maintenanceCategories,
      maintenancePriorities,
      maintenanceStatuses,
      leaseStatuses,
      paymentStatuses,
    };

    // Cache response for 1 hour (reference data is relatively static)
    apiCache.setReferenceData(cacheKey, responseData);

    // Cache the response (1 hour TTL - reference data rarely changes)
    await cache.set('api:reference-data', responseData, 3600);
    
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching reference data:', error);
    return res.status(500).json({ error: 'Failed to fetch reference data' });
  }
}

