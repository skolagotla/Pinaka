import { withAuth } from '@/lib/utils/page-wrapper';
import { serializePrismaData, serializeRentPayment } from '@/lib/utils/serialize-prisma-data';
import dynamic from 'next/dynamic';

// Lazy load payments client (tenant-only)
const TenantPaymentsClient = dynamic(() => import('@/components/pages/tenant/payments/ui').then(mod => mod.default));

export default withAuth(async ({ user, userRole, prisma, email }) => {
  if (userRole === 'tenant') {
    // OPTIMIZED: Use select instead of include for better performance
    const tenant = await prisma.tenant.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        leaseTenants: {
          select: {
            id: true,
            lease: {
              select: {
                id: true,
                unit: {
                  select: {
                    id: true,
                    unitName: true,
                    property: {
                      select: {
                        id: true,
                        propertyName: true,
                        addressLine1: true,
                        addressLine2: true,
                        city: true,
                        provinceState: true,
                        postalZip: true,
                        country: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!tenant) {
      return null;
    }

    // Get rent payments for this tenant
    // OPTIMIZED: Use select instead of include for better performance
    const rentPayments = await prisma.rentPayment.findMany({
      where: {
        lease: {
          leaseTenants: {
            some: {
              tenantId: tenant.id,
            },
          },
        },
      },
      select: {
        id: true,
        amount: true,
        status: true,
        dueDate: true,
        paidDate: true,
        receiptNumber: true,
        createdAt: true,
        updatedAt: true,
        lease: {
          select: {
            id: true,
            status: true,
            rentAmount: true,
            unit: {
              select: {
                id: true,
                unitName: true,
                property: {
                  select: {
                    id: true,
                    propertyName: true,
                    addressLine1: true,
                    addressLine2: true,
                    city: true,
                    provinceState: true,
                    postalZip: true,
                    country: true,
                  },
                },
              },
            },
          },
        },
        partialPayments: {
          select: {
            id: true,
            amount: true,
            paidDate: true,
          },
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
    });

    return (
      <TenantPaymentsClient
        tenant={serializePrismaData(tenant)}
        initialPayments={rentPayments.map(p => serializeRentPayment(p))}
      />
    );
  }

  return null;
}, { role: 'tenant' });
