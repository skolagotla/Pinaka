/**
 * Tenant Rent Data API v1
 * GET /api/v1/tenants/:id/rent-data
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { tenantService } from '@/lib/domains/tenant';
import { RentPaymentRepository } from '@/domains/rent-payment/domain/RentPaymentRepository';
import { tenantRentDataResponseSchema } from '@/lib/schemas';
const { prisma } = require('@/lib/prisma');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid tenant ID' });
    }

    // Only landlords can access this
    if (user.role !== 'landlord') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get tenant via service (includes RBAC check)
    const tenant = await tenantService.getById(id, { leases: true });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Get leaseTenants with lease relation using domain service
    const leaseTenants = await tenantService.getLeaseTenantsWithLease(id);

    // Find active lease for this landlord
    const activeLease = leaseTenants.find(
      (lt: any) =>
        lt.lease?.status === 'Active' &&
        lt.lease?.unit?.property?.landlordId === user.userId
    )?.lease;

    if (!activeLease) {
      return res.status(404).json({ error: 'No active lease found for this tenant' });
    }

    // Get rent payments via repository (Domain-Driven Design)
    const rentPaymentRepository = new RentPaymentRepository(prisma);
    const rentPayments = await rentPaymentRepository.findByLeaseId(activeLease.id, 'asc');

    const response = {
      rentPayments: rentPayments.map(rp => ({
        id: rp.id,
        amount: rp.amount,
        dueDate: rp.dueDate.toISOString(),
        paidDate: rp.paidDate?.toISOString() || null,
        status: rp.status,
        paymentMethod: rp.paymentMethod || undefined,
      })),
      lease: {
        id: activeLease.id,
        rentAmount: activeLease.rentAmount,
        leaseStart: activeLease.leaseStart.toISOString(),
        leaseEnd: activeLease.leaseEnd?.toISOString() || null,
      },
      property: activeLease.unit?.property ? {
        id: activeLease.unit.property.id,
        propertyName: activeLease.unit.property.propertyName,
        addressLine1: activeLease.unit.property.addressLine1,
      } : undefined,
      unit: activeLease.unit ? {
        id: activeLease.unit.id,
        unitName: activeLease.unit.unitName,
      } : undefined,
    };

    // Validate response against schema
    const validated = tenantRentDataResponseSchema.parse(response);

    return res.status(200).json(validated);
  } catch (error) {
    console.error('[Tenant Rent Data v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch tenant rent data',
    });
  }
}, { requireRole: ['landlord'], allowedMethods: ['GET'] });

