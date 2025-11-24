/**
 * Tenants with Outstanding Balance API v1
 * GET /api/v1/tenants/with-outstanding-balance
 * 
 * Domain-Driven, API-First implementation
 * Returns tenants who have unpaid, overdue, or partial rent payments
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { tenantService } from '@/lib/domains/tenant';
import { calculateBalance } from '@/lib/utils/payment-utils';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Only landlords and PMCs can access this
    if (user.role !== 'landlord' && user.role !== 'pmc' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get landlord ID for filtering (landlords only see their own tenants)
    const landlordId = user.role === 'landlord' ? user.userId : undefined;

    console.log('[Tenants with Outstanding Balance API] Fetching tenants for landlordId:', landlordId);

    // Get tenants with outstanding balance using domain service
    let tenants;
    try {
      tenants = await tenantService.getTenantsWithOutstandingBalance(landlordId);
      console.log('[Tenants with Outstanding Balance API] Fetched tenants count:', tenants?.length || 0);
    } catch (serviceError: any) {
      console.error('[Tenants with Outstanding Balance API] Service error:', serviceError);
      console.error('[Tenants with Outstanding Balance API] Service error stack:', serviceError?.stack);
      throw serviceError;
    }

    // Ensure tenants is an array
    if (!Array.isArray(tenants)) {
      console.error('[Tenants with Outstanding Balance API] Tenants is not an array:', typeof tenants, tenants);
      return res.status(500).json({
        success: false,
        error: 'Invalid data format returned from service',
      });
    }

    // Transform the data to match expected frontend format
    const tenantsWithBalance = tenants
      .map((tenant: any) => {
        try {
          // Find active lease with unpaid payments
          const activeLeaseTenant = tenant.leaseTenants?.find((lt: any) => {
            if (!lt?.lease?.rentPayments) return false;
            const hasUnpaidPayments = lt.lease.rentPayments.some((rp: any) => {
              try {
                const balance = calculateBalance(rp);
                return balance > 0;
              } catch (err) {
                console.error('[Tenants with Outstanding Balance] Error calculating balance:', err, rp);
                return false;
              }
            });
            return hasUnpaidPayments;
          });

          if (!activeLeaseTenant) {
            return null;
          }

          const lease = activeLeaseTenant.lease;
          const property = lease?.unit?.property;

          // Calculate total outstanding balance
          const outstandingBalance = (lease.rentPayments || []).reduce((sum: number, rp: any) => {
            try {
              const balance = calculateBalance(rp);
              return sum + balance;
            } catch (err) {
              console.error('[Tenants with Outstanding Balance] Error calculating balance in reduce:', err, rp);
              return sum;
            }
          }, 0);

          // Only include tenants with actual outstanding balance
          if (outstandingBalance <= 0) {
            return null;
          }

          return {
            id: tenant.id,
            firstName: tenant.firstName,
            lastName: tenant.lastName,
            email: tenant.email,
            phone: tenant.phone,
            outstandingBalance,
            property: property ? {
              id: property.id,
              propertyName: property.propertyName,
              addressLine1: property.addressLine1,
              city: property.city,
              provinceState: property.provinceState,
              postalCode: property.postalZip || property.postalCode,
            } : null,
            lease: {
              id: lease.id,
              monthlyRent: lease.rentAmount,
              startDate: lease.leaseStart,
              endDate: lease.leaseEnd,
            },
          };
        } catch (err) {
          console.error('[Tenants with Outstanding Balance] Error processing tenant:', err, tenant);
          return null;
        }
      })
      .filter((t: any) => t !== null);

    return res.status(200).json({
      success: true,
      tenants: tenantsWithBalance,
    });
  } catch (error: any) {
    console.error('[Tenants with Outstanding Balance API] Error:', error);
    console.error('[Tenants with Outstanding Balance API] Error message:', error?.message);
    console.error('[Tenants with Outstanding Balance API] Error stack:', error?.stack);
    console.error('[Tenants with Outstanding Balance API] Error name:', error?.name);
    console.error('[Tenants with Outstanding Balance API] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to fetch tenants with outstanding balance',
      details: process.env.NODE_ENV === 'development' ? {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
      } : undefined,
    });
  }
}, { requireRole: ['landlord', 'pmc', 'admin'], allowedMethods: ['GET'] });

