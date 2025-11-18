/**
 * API endpoint to fetch all reference data
 * GET /api/reference-data
 * Returns all dropdown options and constants from database
 */

import type { NextApiRequest, NextApiResponse } from 'next';
const { prisma } = require('@/lib/prisma');

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReferenceData | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    const responseData: ReferenceData = {
      countries: countries || [],
      regions: regions || [],
      propertyTypes: propertyTypes || [],
      unitStatuses: unitStatuses || [],
      maintenanceCategories: maintenanceCategories || [],
      maintenancePriorities: maintenancePriorities || [],
      maintenanceStatuses: maintenanceStatuses || [],
      leaseStatuses: leaseStatuses || [],
      paymentStatuses: paymentStatuses || [],
    };
    
    return res.status(200).json(responseData);
  } catch (error: any) {
    console.error('[Reference Data API] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch reference data',
      message: error?.message || 'Unknown error',
    });
  }
}
