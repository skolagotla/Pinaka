/**
 * Tenant Payment History API v1
 * GET /api/v1/tenants/payments
 * 
 * Domain-Driven, API-First implementation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Only tenants can view their own payment history
    if (user.role !== 'tenant') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get tenant with payment history using domain service
    const { tenantService } = await import('@/lib/domains/tenant');
    const tenant = await tenantService.getTenantWithPaymentHistory(user.userId);

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Flatten rent payments from all leases
    const payments = tenant.leaseTenants.flatMap((lt: any) =>
      lt.lease.rentPayments.map((rp: any) => ({
        id: rp.id,
        amount: rp.amount,
        dueDate: rp.dueDate,
        paidDate: rp.paidDate,
        status: rp.status,
        paymentMethod: rp.paymentMethod,
        referenceNumber: rp.referenceNumber,
        property: lt.lease.unit?.property ? {
          id: lt.lease.unit.property.id,
          propertyName: lt.lease.unit.property.propertyName,
          addressLine1: lt.lease.unit.property.addressLine1,
          city: lt.lease.unit.property.city,
        } : null,
        unit: lt.lease.unit ? {
          id: lt.lease.unit.id,
          unitName: lt.lease.unit.unitName,
        } : null,
      }))
    );

    // Calculate summary
    const totalPaid = payments
      .filter((p: any) => p.status === 'Paid')
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const totalDue = payments
      .filter((p: any) => p.status === 'Unpaid')
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    return res.status(200).json({
      success: true,
      payments: payments.sort((a: any, b: any) => 
        new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      ),
      summary: {
        totalPaid,
        totalDue,
        totalPayments: payments.length,
        paidCount: payments.filter((p: any) => p.status === 'Paid').length,
        unpaidCount: payments.filter((p: any) => p.status === 'Unpaid').length,
      },
    });
  } catch (error) {
    console.error('[Tenant Payment History v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch payment history',
    });
  }
}, { requireRole: ['tenant'], allowedMethods: ['GET'] });

