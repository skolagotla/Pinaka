import { withAuth } from '@/lib/utils/page-wrapper';
import { serializePrismaData, serializeLease } from '@/lib/utils/serialize-prisma-data';
import FinancialsClient from './ui';
const { checkAndUpdateOverduePayments, createMissingRentPayments } = require('@/lib/rent-payment-service');

/**
 * Unified Financials Page
 * Consolidates Financials, Financial Reports, and Rent Payments
 * Works for all roles: PMC, Landlord
 */
export default withAuth(async ({ user, userRole, prisma, email }) => {
  let financialData = null;
  let rentPaymentsData = null;
  
  if (userRole === 'landlord') {
    // Load financial dashboard data
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const [properties, expenses, rentPayments] = await Promise.all([
        prisma.property.findMany({
          where: { landlordId: user.id },
          select: { id: true, propertyName: true, addressLine1: true },
        }),
        prisma.expense.findMany({
          where: {
            property: { landlordId: user.id },
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          include: {
            property: { select: { id: true, propertyName: true, addressLine1: true } },
            pmcApprovalRequest: {
              select: {
                id: true,
                status: true,
                requestedAt: true,
              },
            },
          },
          orderBy: { date: 'desc' },
        }),
        prisma.rentPayment.findMany({
          where: {
            lease: {
              unit: {
                property: { landlordId: user.id },
              },
            },
            dueDate: { gte: startOfMonth, lte: endOfMonth },
          },
          include: {
            lease: {
              include: {
                unit: {
                  include: {
                    property: { select: { id: true, propertyName: true, addressLine1: true } },
                  },
                },
                leaseTenants: {
                  where: { isPrimaryTenant: true },
                  include: { tenant: true },
                },
              },
            },
          },
          orderBy: { dueDate: 'desc' },
        }),
      ]);

      financialData = {
        properties: properties.map(p => serializePrismaData(p)),
        expenses: expenses.map(e => serializePrismaData(e)),
        rentPayments: rentPayments.map(rp => serializePrismaData(rp)),
        totalRent: rentPayments.reduce((sum, rp) => sum + (rp.amount || 0), 0),
        totalExpenses: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
        netIncome: 0, // Will be calculated in UI
      };
    } catch (error) {
      console.error('[Financials Page] Error loading financial data:', error);
    }

    // Load rent payments data
    try {
      // Auto-create missing rent payment records
      await createMissingRentPayments(user.id);
      await checkAndUpdateOverduePayments(user.id);

      const leases = await prisma.lease.findMany({
        where: {
          unit: {
            property: { landlordId: user.id },
          },
          status: 'Active',
        },
        include: {
          unit: {
            include: {
              property: true,
            },
          },
          leaseTenants: {
            where: { isPrimaryTenant: true },
            include: { tenant: true },
          },
        },
        orderBy: { leaseStart: 'desc' },
      });

      rentPaymentsData = {
        leases: leases.map(lease => serializeLease(lease)),
        landlordCountry: user.country || 'US',
      };
    } catch (error) {
      console.error('[Financials Page] Error loading rent payments data:', error);
    }
  } else if (userRole === 'pmc') {
    // Load PMC financial data
    try {
      const pmcRelationships = await prisma.pMCLandlord.findMany({
        where: {
          pmcId: user.id,
          status: 'active',
        },
        select: { landlordId: true },
      });

      const landlordIds = pmcRelationships.map(rel => rel.landlordId);

      if (landlordIds.length > 0) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const properties = await prisma.property.findMany({
          where: { landlordId: { in: landlordIds } },
          select: { id: true },
        });

        const propertyIds = properties.map(p => p.id);

        const [expenses, rentPayments] = await Promise.all([
          prisma.expense.findMany({
            where: {
              propertyId: { in: propertyIds },
              date: { gte: startOfMonth, lte: endOfMonth },
            },
            include: {
              property: { select: { id: true, propertyName: true, addressLine1: true } },
              pmcApprovalRequest: {
                select: {
                  id: true,
                  status: true,
                  requestedAt: true,
                },
              },
            },
            orderBy: { date: 'desc' },
          }),
          prisma.rentPayment.findMany({
            where: {
              lease: {
                unit: {
                  propertyId: { in: propertyIds },
                },
              },
              dueDate: { gte: startOfMonth, lte: endOfMonth },
            },
            include: {
              lease: {
                include: {
                  unit: {
                    include: {
                      property: { select: { id: true, propertyName: true, addressLine1: true } },
                    },
                  },
                  leaseTenants: {
                    where: { isPrimaryTenant: true },
                    include: { tenant: true },
                  },
                },
              },
            },
            orderBy: { dueDate: 'desc' },
          }),
        ]);

        financialData = {
          properties: properties.map(p => serializePrismaData(p)),
          expenses: expenses.map(e => serializePrismaData(e)),
          rentPayments: rentPayments.map(rp => serializePrismaData(rp)),
          totalRent: rentPayments.reduce((sum, rp) => sum + (rp.amount || 0), 0),
          totalExpenses: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
          netIncome: 0,
        };

        // Load rent payments for PMC
        const leases = await prisma.lease.findMany({
          where: {
            unit: {
              propertyId: { in: propertyIds },
            },
            status: 'Active',
          },
          include: {
            unit: {
              include: {
                property: true,
              },
            },
            leaseTenants: {
              where: { isPrimaryTenant: true },
              include: { tenant: true },
            },
          },
          orderBy: { leaseStart: 'desc' },
        });

        // Auto-create missing rent payments for all managed landlords
        for (const landlordId of landlordIds) {
          await createMissingRentPayments(landlordId);
          await checkAndUpdateOverduePayments(landlordId);
        }

        rentPaymentsData = {
          leases: leases.map(lease => serializeLease(lease)),
          landlordCountry: 'CA', // Default for PMC
        };
      }
    } catch (error) {
      console.error('[Financials Page] Error loading PMC financial data:', error);
    }
  }

  // Serialize user data
  const serializedUser = serializePrismaData({
    ...user,
    role: userRole || 'landlord',
  });

  return (
    <main className="page">
      <FinancialsClient
        user={serializedUser}
        userRole={userRole || 'landlord'}
        financialData={financialData}
        rentPaymentsData={rentPaymentsData}
      />
    </main>
  );
}, { role: 'both' }); // Allow landlord and PMC

