import { withAuth } from '@/lib/utils/page-wrapper';
import { getLandlordStats } from '@/lib/utils/landlord-data-loader';
import { serializePrismaData, serializeLease, serializeTenant, serializeProperty, serializeUnit, serializeRentPayment, serializeMaintenanceRequest, serializeDocument, serializePartialPayment } from '@/lib/utils/serialize-prisma-data';
import dynamicImport from 'next/dynamic';
import { redirect } from 'next/navigation';

// Lazy load dashboard clients
const LandlordDashboardClient = dynamicImport(() => import('@/components/pages/landlord/dashboard/ui').then(mod => mod.default));
const PMCDashboardClient = dynamicImport(() => import('@/components/pages/pmc/dashboard/ui').then(mod => mod.default));
const TenantDashboardClient = dynamicImport(() => import('@/components/pages/tenant/dashboard/ui').then(mod => mod.default));

const { checkAndUpdateOverduePayments, createMissingRentPayments, checkAndUpdateOverduePaymentsForTenant } = require('@/lib/rent-payment-service');

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export default withAuth(async ({ user, userRole, prisma, email }) => {
  // Route to appropriate dashboard based on role
  if (userRole === 'landlord') {
    // Check and update overdue payments (if rent is not paid 1 day after due date)
    await checkAndUpdateOverduePayments(user.id);
    
    // Create missing rent payment records for current month if needed
    await createMissingRentPayments(user.id);
    
    // Get dashboard statistics using consolidated utility
    const {
      totalProperties,
      totalUnits,
      totalTenants,
      activeLeases,
    } = await getLandlordStats(prisma, user.id);

    // Calculate total rent with currency breakdown - OPTIMIZED: Use select instead of include
    const allLeases = await prisma.lease.findMany({
      where: {
        unit: {
          property: {
            landlordId: user.id,
          },
        },
        status: "Active",
      },
      select: {
        id: true,
        rentAmount: true,
        unit: {
          select: {
            property: {
              select: {
                country: true,
              },
            },
          },
        },
      },
    });
    
    const totalMonthlyRent = allLeases.reduce((sum, lease) => sum + lease.rentAmount, 0);
    
    // Group monthly rent by currency
    const rentByCurrency = {};
    for (const lease of allLeases) {
      const country = lease.unit.property.country || 'US';
      const currency = country === 'CA' ? 'CAD' : 'USD';
      if (!rentByCurrency[currency]) {
        rentByCurrency[currency] = 0;
      }
      rentByCurrency[currency] += lease.rentAmount;
    }
    
    // Calculate pending maintenance
    const pendingMaintenance = await prisma.maintenanceRequest.count({
      where: {
        property: {
          landlordId: user.id,
        },
        status: {
          in: ["New", "Pending", "In Progress"],
        },
      },
    });

    // Get rent payment statistics - calculate amounts instead of counts
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Get rent payments for landlord - OPTIMIZED: Use select instead of include, limit to recent
    // Only fetch what we need for calculations (last 12 months for trends)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const allRentPayments = await prisma.rentPayment.findMany({
      where: {
        lease: {
          unit: {
            property: {
              landlordId: user.id,
            },
          },
        },
        OR: [
          { dueDate: { gte: twelveMonthsAgo } },
          { paidDate: { gte: twelveMonthsAgo } },
          { status: { in: ['Unpaid', 'Partial', 'Overdue'] } },
        ],
      },
      select: {
        id: true,
        amount: true,
        status: true,
        dueDate: true,
        paidDate: true,
        partialPayments: {
          select: {
            amount: true,
            paidDate: true,
          },
        },
        lease: {
          select: {
            unit: {
              select: {
                property: {
                  select: {
                    country: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Calculate paid this month amount (only actual payment transactions made this month)
    let paidThisMonthAmount = 0;
    const paidByCurrency = {};

    // OPTIMIZED: Parallelize queries and use select instead of include for better performance
    const [partialPaymentsThisMonth, fullyPaidThisMonth] = await Promise.all([
      // Get ALL partial payment transactions made this month
      prisma.partialPayment.findMany({
        where: {
          rentPayment: {
            lease: {
              unit: {
                property: {
                  landlordId: user.id,
                },
              },
            },
          },
          paidDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        select: {
          amount: true,
          paidDate: true,
          rentPayment: {
            select: {
              lease: {
                select: {
                  unit: {
                    select: {
                      property: {
                        select: {
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
      }),
      // Get payments marked as fully paid this month (without any partial payments)
      prisma.rentPayment.findMany({
        where: {
          lease: {
            unit: {
              property: {
                landlordId: user.id,
              },
            },
          },
          status: "Paid",
          paidDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        select: {
          amount: true,
          partialPayments: {
            select: {
              id: true, // Only need to check if array is empty
            },
          },
          lease: {
            select: {
              unit: {
                select: {
                  property: {
                    select: {
                      country: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    // Count all partial payment transactions made this month
    for (const pp of partialPaymentsThisMonth) {
      const country = pp.rentPayment.lease.unit.property.country || 'US';
      const currency = country === 'CA' ? 'CAD' : 'USD';
      if (!paidByCurrency[currency]) {
        paidByCurrency[currency] = 0;
      }
      paidByCurrency[currency] += pp.amount;
      paidThisMonthAmount += pp.amount;
    }

    // Only count payments that were paid in full (no partial payments)
    // BUG FIX: Added null checks to prevent runtime errors
    for (const payment of fullyPaidThisMonth) {
      if (payment.partialPayments && payment.partialPayments.length > 0) {
        continue;
      }
      
      // Safe property access with null checks
      const country = payment?.lease?.unit?.property?.country || 'US';
      const currency = country === 'CA' ? 'CAD' : 'USD';
      if (!paidByCurrency[currency]) {
        paidByCurrency[currency] = 0;
      }
      paidByCurrency[currency] += payment.amount;
      paidThisMonthAmount += payment.amount;
    }

    // Calculate unpaid rent amount (includes partial payment remainders)
    let unpaidRentAmount = 0;
    let overdueRentAmount = 0;
    const unpaidByCurrency = { ...rentByCurrency };
    Object.keys(unpaidByCurrency).forEach(key => unpaidByCurrency[key] = 0);
    
    const overdueByCurrency = { ...rentByCurrency };
    Object.keys(overdueByCurrency).forEach(key => overdueByCurrency[key] = 0);

    // BUG FIX: Added null checks to prevent runtime errors when accessing nested properties
    for (const payment of allRentPayments) {
      // Safe property access with null checks
      if (!payment?.lease?.unit?.property) {
        console.warn('[Dashboard] Payment missing lease/unit/property:', payment.id);
        continue; // Skip payments with missing property data
      }
      
      const country = payment.lease.unit.property.country || 'US';
      const currency = country === 'CA' ? 'CAD' : 'USD';
      
      if (payment.status === "Unpaid") {
        unpaidRentAmount += payment.amount;
        if (!unpaidByCurrency[currency]) {
          unpaidByCurrency[currency] = 0;
        }
        unpaidByCurrency[currency] += payment.amount;
      } else if (payment.status === "Overdue") {
        overdueRentAmount += payment.amount;
        unpaidRentAmount += payment.amount;
        
        if (!overdueByCurrency[currency]) {
          overdueByCurrency[currency] = 0;
        }
        overdueByCurrency[currency] += payment.amount;
        
        if (!unpaidByCurrency[currency]) {
          unpaidByCurrency[currency] = 0;
        }
        unpaidByCurrency[currency] += payment.amount;
      } else if (payment.status === "Partial") {
        const totalPartialPaid = (payment.partialPayments || []).reduce((sum, pp) => sum + (pp?.amount || 0), 0);
        const remaining = payment.amount - totalPartialPaid;
        unpaidRentAmount += remaining;
        
        if (!unpaidByCurrency[currency]) {
          unpaidByCurrency[currency] = 0;
        }
        unpaidByCurrency[currency] += remaining;
        
        if (payment.dueDate) {
          const dueDate = new Date(payment.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          const dueDatePlusOne = new Date(dueDate);
          dueDatePlusOne.setDate(dueDatePlusOne.getDate() + 1);
          
          if (today >= dueDatePlusOne) {
            overdueRentAmount += remaining;
            if (!overdueByCurrency[currency]) {
              overdueByCurrency[currency] = 0;
            }
            overdueByCurrency[currency] += remaining;
          }
        }
      }
    }

    // Calculate occupancy rate
    const occupiedUnits = await prisma.unit.count({
      where: {
        property: {
          landlordId: user.id,
        },
        status: "Occupied",
      },
    });
    
    const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0;

    // Calculate collection rate
    const totalRentDue = allLeases.reduce((sum, lease) => sum + lease.rentAmount, 0);
    const collectionRate = totalRentDue > 0 ? ((paidThisMonthAmount / totalRentDue) * 100).toFixed(1) : 0;

    // Get vacant units
    const vacantUnits = await prisma.unit.findMany({
      where: {
        property: {
          landlordId: user.id,
        },
        status: "Vacant",
      },
      include: {
        property: true,
      },
    });

    // Get leases expiring
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
    
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    const leasesExpiringIn30Days = await prisma.lease.count({
      where: {
        unit: {
          property: {
            landlordId: user.id,
          },
        },
        status: "Active",
        leaseEnd: {
          gte: today,
          lte: thirtyDaysFromNow,
        },
      },
    });

    const leasesExpiringIn60Days = await prisma.lease.count({
      where: {
        unit: {
          property: {
            landlordId: user.id,
          },
        },
        status: "Active",
        leaseEnd: {
          gte: today,
          lte: sixtyDaysFromNow,
        },
      },
    });

    const leasesExpiringIn90Days = await prisma.lease.count({
      where: {
        unit: {
          property: {
            landlordId: user.id,
          },
        },
        status: "Active",
        leaseEnd: {
          gte: today,
          lte: ninetyDaysFromNow,
        },
      },
    });

    // Get upcoming lease expirations
    const upcomingLeaseExpirations = await prisma.lease.findMany({
      where: {
        unit: {
          property: {
            landlordId: user.id,
          },
        },
        status: "Active",
        leaseEnd: {
          gte: today,
          lte: ninetyDaysFromNow,
        },
      },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        leaseTenants: {
          include: {
            tenant: true,
          },
        },
      },
      orderBy: {
        leaseEnd: 'asc',
      },
      take: 5,
    });

    // Calculate portfolio value
    const portfolioValue = await prisma.property.aggregate({
      where: {
        landlordId: user.id,
        purchasePrice: {
          not: null,
        },
      },
      _sum: {
        purchasePrice: true,
      },
    });

    const expectedAnnualIncome = totalMonthlyRent * 12;

    // Get pending tenant invitations
    const pendingInvitations = await prisma.tenant.count({
      where: {
        invitedBy: user.email,
        hasAccess: false,
      },
    });

    // Get N4 forms count
    const n4FormsDraft = await prisma.generatedForm.count({
      where: {
        generatedBy: user.id,
        formType: "N4",
        status: "draft",
      },
    });

    const n4FormsServed = await prisma.generatedForm.count({
      where: {
        generatedBy: user.id,
        formType: "N4",
        status: "sent",
      },
    });

    // Get pending PMC approval requests
    const pendingApprovals = await prisma.pMCLandlordApproval.count({
      where: {
        pmcLandlord: {
          landlordId: user.id,
        },
        status: 'PENDING',
      },
    });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentLeases, recentPayments, recentMaintenance, recentTenants] = await Promise.all([
      prisma.lease.findMany({
        where: {
          unit: {
            property: {
              landlordId: user.id,
            },
          },
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        include: {
          unit: {
            include: {
              property: true,
            },
          },
          leaseTenants: {
            include: {
              tenant: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      }),
      prisma.partialPayment.findMany({
        where: {
          rentPayment: {
            lease: {
              unit: {
                property: {
                  landlordId: user.id,
                },
              },
            },
          },
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        include: {
          rentPayment: {
            include: {
              lease: {
                include: {
                  leaseTenants: {
                    include: {
                      tenant: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      }),
      prisma.maintenanceRequest.findMany({
        where: {
          property: {
            landlordId: user.id,
          },
          updatedAt: {
            gte: sevenDaysAgo,
          },
        },
        include: {
          property: true,
          tenant: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 5,
      }),
      prisma.tenant.findMany({
        where: {
          invitedBy: user.email,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      }),
    ]);

    // Calculate average maintenance resolution time
    const completedMaintenance = await prisma.maintenanceRequest.findMany({
      where: {
        property: {
          landlordId: user.id,
        },
        status: "Completed",
        completedDate: {
          not: null,
        },
      },
      select: {
        requestedDate: true,
        completedDate: true,
      },
    });

    let avgResolutionTime = 0;
    if (completedMaintenance.length > 0) {
      const totalDays = completedMaintenance.reduce((sum, req) => {
        const requested = new Date(req.requestedDate);
        const completed = new Date(req.completedDate);
        const diffTime = completed - requested;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0);
      avgResolutionTime = (totalDays / completedMaintenance.length).toFixed(1);
    }

    const landlordCountry = user.country || 'US';

    // Get historical payment data for charts (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const paymentTrends = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(pp."paidDate", 'YYYY-MM') as month,
        SUM(pp."amount") as "totalPaid",
        COUNT(*) as "paymentCount"
      FROM "PartialPayment" pp
      INNER JOIN "RentPayment" rp ON pp."rentPaymentId" = rp.id
      INNER JOIN "Lease" l ON rp."leaseId" = l.id
      INNER JOIN "Unit" u ON l."unitId" = u.id
      INNER JOIN "Property" p ON u."propertyId" = p.id
      WHERE p."landlordId" = ${user.id}
        AND pp."paidDate" >= CAST(${sixMonthsAgo.toISOString()} AS TIMESTAMP)
      GROUP BY TO_CHAR(pp."paidDate", 'YYYY-MM')
      ORDER BY month ASC
    `;

    // Get monthly occupancy rate trends (last 6 months) - OPTIMIZED: Parallel queries
    const occupancyTrendQueries = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      occupancyTrendQueries.push({
        monthDate,
        monthStart,
        monthEnd,
        query: Promise.all([
          prisma.unit.count({
            where: {
              property: {
                landlordId: user.id,
              },
              createdAt: {
                lte: monthEnd,
              },
            },
          }),
          prisma.lease.count({
            where: {
              unit: {
                property: {
                  landlordId: user.id,
                },
              },
              status: "Active",
              leaseStart: {
                lte: monthEnd,
              },
              leaseEnd: {
                gte: monthStart,
              },
            },
          }),
        ]),
      });
    }
    
    // Execute all occupancy trend queries in parallel
    const occupancyTrendResults = await Promise.all(
      occupancyTrendQueries.map(async ({ monthDate, query }) => {
        const [totalUnitsAtMonth, occupiedUnitsAtMonth] = await query;
        return {
          month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          rate: totalUnitsAtMonth > 0 ? ((occupiedUnitsAtMonth / totalUnitsAtMonth) * 100).toFixed(1) : 0,
        };
      })
    );
    
    const occupancyTrends = occupancyTrendResults;

    // Get upcoming rent reminders
    const threeDaysFromNowForReminders = new Date();
    threeDaysFromNowForReminders.setDate(threeDaysFromNowForReminders.getDate() + 3);
    const upcomingRentReminders = await prisma.rentPayment.findMany({
      where: {
        lease: {
          unit: {
            property: {
              landlordId: user.id,
            },
          },
        },
        status: { in: ['Unpaid', 'Partial'] },
        reminderSent: false,
        dueDate: {
          gte: new Date(threeDaysFromNowForReminders.setHours(0, 0, 0, 0)),
          lte: new Date(threeDaysFromNowForReminders.setHours(23, 59, 59, 999))
        }
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: {
                  include: {
                    units: {
                      select: {
                        id: true,
                        unitName: true
                      }
                    }
                  }
                }
              }
            },
            leaseTenants: {
              where: {
                isPrimaryTenant: true
              },
              include: {
                tenant: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      take: 10
    });

    // Get leases expiring in 60 days
    const sixtyDaysFromNowForReminders = new Date();
    sixtyDaysFromNowForReminders.setDate(sixtyDaysFromNowForReminders.getDate() + 60);
    const leasesNeedingRenewalReminder = await prisma.lease.findMany({
      where: {
        unit: {
          property: {
            landlordId: user.id,
          },
        },
        status: 'Active',
        leaseEnd: {
          not: null,
          gte: new Date(sixtyDaysFromNowForReminders.setHours(0, 0, 0, 0)),
          lte: new Date(sixtyDaysFromNowForReminders.setHours(23, 59, 59, 999))
        },
        renewalReminderSent: false
      },
      include: {
        unit: {
          include: {
            property: {
              include: {
                units: {
                  select: {
                    id: true,
                    unitName: true
                  }
                }
              }
            }
          }
        },
        leaseTenants: {
          include: {
            tenant: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      take: 10
    });

    // Get documents expiring in 30 days
    const thirtyDaysFromNowForReminders = new Date();
    thirtyDaysFromNowForReminders.setDate(thirtyDaysFromNowForReminders.getDate() + 30);
    const expiringDocuments = await prisma.document.findMany({
      where: {
        tenant: {
          leaseTenants: {
            some: {
              lease: {
                unit: {
                  property: {
                    landlordId: user.id,
                  },
                },
              },
            },
          },
        },
        expirationDate: {
          not: null,
          gte: new Date(thirtyDaysFromNowForReminders.setHours(0, 0, 0, 0)),
          lte: new Date(thirtyDaysFromNowForReminders.setHours(23, 59, 59, 999))
        },
        reminderSent: false,
        isDeleted: false
      },
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      take: 10
    });

    const cacheBuster = Date.now();
    
    const serializedStats = {
      totalProperties,
      totalUnits,
      totalTenants,
      activeLeases,
      totalMonthlyRent,
      pendingMaintenance,
      paidThisMonthAmount,
      unpaidRentAmount,
      overdueRentAmount,
      rentByCurrency,
      paidByCurrency,
      unpaidByCurrency,
      overdueByCurrency,
      occupancyRate,
      collectionRate,
      vacantUnits: vacantUnits.length,
      vacantUnitsDetails: vacantUnits.map(unit => serializeUnit(unit)),
      leasesExpiringIn30Days,
      leasesExpiringIn60Days,
      leasesExpiringIn90Days,
      upcomingLeaseExpirations: upcomingLeaseExpirations.map(lease => serializeLease(lease)),
      portfolioValue: portfolioValue._sum.purchasePrice || 0,
      expectedAnnualIncome,
      pendingInvitations,
      n4FormsDraft,
      n4FormsServed,
      pendingApprovals,
      avgResolutionTime,
      recentLeases: recentLeases.map(lease => serializeLease(lease)),
      recentPayments: recentPayments.map(payment => serializePartialPayment(payment)),
      recentMaintenance: recentMaintenance.map(req => serializeMaintenanceRequest(req)),
      recentTenants: recentTenants.map(tenant => serializeTenant(tenant)),
      paymentTrends: paymentTrends.map(pt => ({
        month: new Date(pt.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount: Number(pt.totalPaid),
        count: Number(pt.paymentCount),
      })),
      occupancyTrends,
      upcomingRentReminders: upcomingRentReminders.map(payment => serializeRentPayment(payment)),
      leasesNeedingRenewalReminder: leasesNeedingRenewalReminder.map(lease => serializeLease(lease)),
      expiringDocuments: expiringDocuments.map(doc => serializeDocument(doc)),
    };
    
    // Check if landlord is managed by PMC
    const pmcRelationship = await prisma.pMCLandlord.findFirst({
      where: {
        landlordId: user.id,
        status: 'active',
        OR: [
          { endedAt: null },
          { endedAt: { gt: new Date() } },
        ],
      },
      include: {
        pmc: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    return (
      <LandlordDashboardClient
        key={`dashboard-${cacheBuster}`}
        pmcName={pmcRelationship?.pmc?.companyName || null}
        landlordId={user.id}
        landlord={serializePrismaData(user)}
        landlordCountry={landlordCountry}
        stats={serializedStats}
      />
    );
  } else if (userRole === 'pmc') {
    // PMC Dashboard logic
    // Handle both regular PMC (PropertyManagementCompany) and PMC Admin (Admin with PMC_ADMIN role)
    const pmcId = user.isPMCAdmin ? user.pmcId : user.id;
    
    if (!pmcId) {
      // PMC Admin without linked PMC - show empty dashboard
      return (
        <PMCDashboardClient
          pmc={serializePrismaData(user)}
          relationships={[]}
          stats={{
            totalLandlords: 0,
            totalProperties: 0,
            totalUnits: 0,
            totalTenants: 0,
            activeLeases: 0,
            totalMonthlyRent: 0,
            pendingMaintenance: 0,
            overduePayments: 0,
            totalRentCollected: 0,
            totalRentDue: 0,
            rentCollectionRate: 0,
          }}
        />
      );
    }
    
    const pmcRelationships = await prisma.pMCLandlord.findMany({
      where: {
        pmcId: pmcId,
        status: 'active',
      },
      include: {
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const landlordIds = pmcRelationships.map(rel => rel.landlordId);
    const managedProperties = landlordIds.length > 0 ? await prisma.property.findMany({
      where: {
        landlordId: {
          in: landlordIds,
        },
      },
      include: {
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        units: {
          include: {
            leases: {
              where: {
                status: 'Active',
              },
              include: {
                leaseTenants: {
                  include: {
                    tenant: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }) : [];

    const totalLandlords = pmcRelationships.length;
    const totalProperties = managedProperties.length;
    const totalUnits = managedProperties.reduce((sum, prop) => sum + (prop.units?.length || 0), 0);
    const activeLeases = managedProperties.reduce((sum, prop) => {
      return sum + prop.units.reduce((unitSum, unit) => {
        return unitSum + (unit.leases?.length || 0);
      }, 0);
    }, 0);

    const propertyIds = managedProperties.map(p => p.id);
    const pendingMaintenance = propertyIds.length > 0 ? await prisma.maintenanceRequest.count({
      where: {
        propertyId: {
          in: propertyIds,
        },
        status: {
          in: ["New", "Pending", "In Progress"],
        },
      },
    }) : 0;

    const pendingApprovals = await prisma.pMCLandlordApproval.count({
      where: {
        pmcLandlord: {
          pmcId: pmcId,
        },
        status: 'PENDING',
      },
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await prisma.activityLog.findMany({
      where: {
        pmcId: pmcId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    const stats = {
      totalLandlords,
      totalProperties,
      totalUnits,
      activeLeases,
      pendingMaintenance,
      pendingApprovals,
      recentActivity: recentActivity.map(activity => ({
        ...activity,
        createdAt: activity.createdAt.toISOString(),
      })),
    };

    return (
      <PMCDashboardClient
        pmc={serializePrismaData(user)}
        stats={stats}
        managedProperties={managedProperties.map(prop => ({
          ...prop,
          createdAt: prop.createdAt.toISOString(),
          updatedAt: prop.updatedAt.toISOString(),
        }))}
        pmcRelationships={pmcRelationships.map(rel => ({
          ...rel,
          startedAt: rel.startedAt.toISOString(),
          endedAt: rel.endedAt?.toISOString() || null,
        }))}
      />
    );
  } else if (userRole === 'tenant') {
    // Tenant Dashboard logic
    const tenant = await prisma.tenant.findUnique({
      where: { email },
      include: {
        leaseTenants: {
          include: {
            lease: {
              include: {
                unit: {
                  include: {
                    property: true,
                  },
                },
                leaseTenants: {
                  include: {
                    tenant: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!tenant.hasAccess) {
      const approvalStatus = tenant.approvalStatus || 'PENDING';
      const isRejected = approvalStatus === 'REJECTED';
      const isPending = approvalStatus === 'PENDING';
      
      return (
        <main className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <div className="card" style={{ maxWidth: 600, textAlign: 'center', padding: '40px' }}>
            {isRejected ? (
              <>
                <h1 style={{ color: '#ea4335', marginBottom: 20 }}>Application Rejected</h1>
                <p style={{ color: '#5f6368', marginBottom: 20 }}>
                  Unfortunately, your application has been rejected.
                </p>
                {tenant.rejectionReason && (
                  <div style={{ 
                    background: '#fff3cd', 
                    border: '1px solid #ffc107', 
                    borderRadius: '4px', 
                    padding: '16px', 
                    marginBottom: 20,
                    textAlign: 'left'
                  }}>
                    <strong>Reason:</strong>
                    <p style={{ marginTop: 8, marginBottom: 0 }}>{tenant.rejectionReason}</p>
                  </div>
                )}
                <p style={{ color: '#5f6368', marginBottom: 30 }}>
                  If you have any questions, please contact your landlord.
                </p>
              </>
            ) : isPending ? (
              <>
                <h1 style={{ color: '#faad14', marginBottom: 20 }}>Application Under Review</h1>
                <p style={{ color: '#5f6368', marginBottom: 30 }}>
                  Your application is currently being reviewed by the landlord. You will receive an email notification once a decision has been made.
                </p>
              </>
            ) : (
              <>
                <h1 style={{ color: '#ea4335', marginBottom: 20 }}>Access Denied</h1>
                <p style={{ color: '#5f6368', marginBottom: 30 }}>
                  Your account hasn't been activated yet. Please use the invitation link sent to your email.
                </p>
              </>
            )}
            <a href="/" className="button">Return to Home</a>
          </div>
        </main>
      );
    }
    
    await checkAndUpdateOverduePaymentsForTenant(tenant.id);
    
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { lastLoginAt: new Date() },
    });
    
    const landlord = tenant.leaseTenants.length > 0 
      ? await prisma.landlord.findUnique({
          where: { email: tenant.invitedBy },
        })
      : null;
    
    const rentReceiptsCount = await prisma.rentPayment.count({
      where: {
        lease: {
          leaseTenants: {
            some: {
              tenantId: tenant.id,
            },
          },
        },
        receiptSent: true,
      },
    });

    const documentsCount = await prisma.document.count({
      where: {
        tenantId: tenant.id,
      },
    });

    const leaseDocumentsCount = await prisma.leaseDocument.count({
      where: {
        lease: {
          leaseTenants: {
            some: {
              tenantId: tenant.id,
            },
          },
        },
      },
    });

    const maintenanceRequestsCount = await prisma.maintenanceRequest.count({
      where: {
        tenantId: tenant.id,
      },
    });

    const openMaintenanceCount = await prisma.maintenanceRequest.count({
      where: {
        tenantId: tenant.id,
        status: {
          in: ["New", "Pending", "In Progress"],
        },
      },
    });

    const activeLeases = tenant.leaseTenants
      .map(lt => lt.lease)
      .filter(lease => {
        const endDate = new Date(lease.leaseEnd);
        return endDate >= new Date();
      });

    const overdueRentPayments = await prisma.rentPayment.findMany({
      where: {
        lease: {
          leaseTenants: {
            some: {
              tenantId: tenant.id,
            },
          },
        },
        status: "Overdue",
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
      },
    });
    
    let overdueRentAmount = 0;
    const overdueByCurrency = {};
    
    if (activeLeases.length > 0) {
      const country = activeLeases[0].unit.property.country || 'US';
      const currency = country === 'CA' ? 'CAD' : 'USD';
      overdueByCurrency[currency] = 0;
    }
    
    // BUG FIX: Added null checks to prevent runtime errors
    for (const payment of overdueRentPayments) {
      // Safe property access with null checks
      if (!payment?.lease?.unit?.property) {
        console.warn('[Dashboard] Overdue payment missing lease/unit/property:', payment.id);
        continue; // Skip payments with missing property data
      }
      
      const country = payment.lease.unit.property.country || 'US';
      const currency = country === 'CA' ? 'CAD' : 'USD';
      
      overdueRentAmount += payment.amount;
      if (!overdueByCurrency[currency]) {
        overdueByCurrency[currency] = 0;
      }
      overdueByCurrency[currency] += payment.amount;
    }

    let daysUntilNextRent = null;
    let nextRentDueDate = null;
    let nextRentAmount = null;
    if (activeLeases.length > 0) {
      const activeLease = activeLeases[0];
      const rentDueDay = activeLease.rentDueDay || 1;
      const now = new Date();
      const currentDay = now.getDate();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      if (currentDay < rentDueDay) {
        nextRentDueDate = new Date(currentYear, currentMonth, rentDueDay);
      } else {
        nextRentDueDate = new Date(currentYear, currentMonth + 1, rentDueDay);
      }
      
      const diffTime = nextRentDueDate - now;
      daysUntilNextRent = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      nextRentAmount = activeLease.rentAmount;
    }

    let leaseProgress = null;
    let daysUntilLeaseEnd = null;
    if (activeLeases.length > 0 && activeLeases[0].leaseEnd) {
      const activeLease = activeLeases[0];
      const leaseStart = new Date(activeLease.leaseStart);
      const leaseEnd = new Date(activeLease.leaseEnd);
      const now = new Date();
      
      const totalDays = Math.ceil((leaseEnd - leaseStart) / (1000 * 60 * 60 * 24));
      const daysPassed = Math.ceil((now - leaseStart) / (1000 * 60 * 60 * 24));
      leaseProgress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100)).toFixed(1);
      
      daysUntilLeaseEnd = Math.ceil((leaseEnd - now) / (1000 * 60 * 60 * 24));
    }

    const paymentHistory = await prisma.rentPayment.findMany({
      where: {
        lease: {
          leaseTenants: {
            some: {
              tenantId: tenant.id,
            },
          },
        },
        status: "Paid",
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
      },
      orderBy: {
        paidDate: 'desc',
      },
      take: 6,
    });

    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const paymentsThisYear = await prisma.rentPayment.findMany({
      where: {
        lease: {
          leaseTenants: {
            some: {
              tenantId: tenant.id,
            },
          },
        },
        status: "Paid",
        paidDate: {
          gte: startOfYear,
        },
      },
    });

    const totalPaidThisYear = paymentsThisYear.reduce((sum, payment) => sum + payment.amount, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentMaintenanceUpdates = await prisma.maintenanceRequest.findMany({
      where: {
        tenantId: tenant.id,
        updatedAt: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        property: true,
        comments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 5,
    });

    const upcomingRentPayment = await prisma.rentPayment.findFirst({
      where: {
        lease: {
          leaseTenants: {
            some: {
              tenantId: tenant.id,
            },
          },
        },
        status: {
          in: ["Unpaid", "Partial"],
        },
        dueDate: {
          gte: new Date(),
        },
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
        partialPayments: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    // OPTIMIZED: Parallel queries for monthly payments (last 6 months)
    const monthlyPaymentQueries = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      monthlyPaymentQueries.push(
        prisma.rentPayment.findMany({
          where: {
            lease: {
              leaseTenants: {
                some: {
                  tenantId: tenant.id,
                },
              },
            },
            status: "Paid",
            paidDate: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          select: {
            amount: true,
          },
        }).then(payments => ({
          month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          amount: payments.reduce((sum, payment) => sum + payment.amount, 0),
          count: payments.length,
        }))
      );
    }
    
    const monthlyPayments = await Promise.all(monthlyPaymentQueries);
    
    const serializedTenant = serializeTenant(tenant);
    const serializedLandlord = landlord ? serializeLandlord(landlord) : null;
    const serializedPaymentHistory = paymentHistory.map(payment => serializeRentPayment(payment));
    const serializedRecentMaintenance = recentMaintenanceUpdates.map(req => serializeMaintenanceRequest(req));
    const serializedUpcomingPayment = upcomingRentPayment ? serializeRentPayment(upcomingRentPayment) : null;
    const serializedActiveLeases = activeLeases.map(lease => serializeLease(lease));
    
    const serializedNextRentDueDate = nextRentDueDate instanceof Date ? nextRentDueDate.toISOString() : nextRentDueDate;
    
    return <TenantDashboardClient 
      tenant={serializedTenant} 
      landlord={serializedLandlord} 
      stats={{
        rentReceiptsCount,
        documentsCount,
        leaseDocumentsCount,
        maintenanceRequestsCount,
        openMaintenanceCount,
        overdueRentAmount,
        overdueByCurrency,
        daysUntilNextRent,
        nextRentDueDate: serializedNextRentDueDate,
        nextRentAmount,
        leaseProgress,
        daysUntilLeaseEnd,
        paymentHistory: serializedPaymentHistory,
        totalPaidThisYear,
        recentMaintenanceUpdates: serializedRecentMaintenance,
        upcomingRentPayment: serializedUpcomingPayment,
        activeLeases: serializedActiveLeases,
        monthlyPayments,
      }}
    />;
  }

  // If no role matches, redirect to home
  redirect('/');
}, { requireAccess: false });

