/**
 * Dashboard Analytics API v1
 * GET /api/v1/analytics/dashboard
 * 
 * Domain-Driven, API-First implementation
 * Returns role-based dashboard statistics
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
const { prisma } = require('@/lib/prisma');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Role-based dashboard data
    if (user.role === 'landlord') {
      // Get basic property statistics
      const [totalProperties, activeLeases, totalUnits] = await Promise.all([
        prisma.property.count({
          where: { landlordId: user.userId }
        }),
        prisma.lease.count({
          where: {
            status: 'Active',
            unit: {
              property: {
                landlordId: user.userId
              }
            }
          }
        }),
        prisma.unit.count({
          where: {
            property: {
              landlordId: user.userId
            }
          }
        })
      ]);

      // Get financial statistics
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const [totalRevenue, totalExpenses, pendingRent] = await Promise.all([
        prisma.rentPayment.aggregate({
          where: {
            lease: {
              unit: {
                property: {
                  landlordId: user.userId
                }
              }
            },
            status: 'Paid',
            paidDate: {
              gte: currentMonth
            }
          },
          _sum: {
            amount: true
          }
        }),
        prisma.expense.aggregate({
          where: {
            property: {
              landlordId: user.userId
            },
            date: {
              gte: currentMonth
            }
          },
          _sum: {
            amount: true
          }
        }),
        prisma.rentPayment.aggregate({
          where: {
            lease: {
              unit: {
                property: {
                  landlordId: user.userId
                }
              }
            },
            status: 'Unpaid',
            dueDate: {
              lte: new Date()
            }
          },
          _sum: {
            amount: true
          }
        })
      ]);

      // Get maintenance statistics
      const [openMaintenance, completedMaintenance] = await Promise.all([
        prisma.maintenanceRequest.count({
          where: {
            property: {
              landlordId: user.userId
            },
            status: {
              in: ['New', 'Pending', 'In Progress']
            }
          }
        }),
        prisma.maintenanceRequest.count({
          where: {
            property: {
              landlordId: user.userId
            },
            status: 'Completed'
          }
        })
      ]);

      return res.status(200).json({
        success: true,
        data: {
          properties: {
            total: totalProperties,
            activeLeases,
            totalUnits
          },
          financial: {
            totalRevenue: totalRevenue._sum.amount || 0,
            totalExpenses: totalExpenses._sum.amount || 0,
            pendingRent: pendingRent._sum.amount || 0,
            netIncome: (totalRevenue._sum.amount || 0) - (totalExpenses._sum.amount || 0)
          },
          maintenance: {
            open: openMaintenance,
            completed: completedMaintenance
          }
        }
      });
    } else if (user.role === 'pmc') {
      // Get PMC dashboard statistics
      const [managedProperties, managedLandlords, pendingApprovals] = await Promise.all([
        prisma.property.count({
          where: {
            pmcRelationships: {
              some: {
                pmcId: user.userId,
                status: 'active',
                OR: [
                  { endedAt: null },
                  { endedAt: { gt: new Date() } }
                ]
              }
            }
          }
        }),
        prisma.pMCLandlord.count({
          where: {
            pmcId: user.userId,
            status: 'active',
            OR: [
              { endedAt: null },
              { endedAt: { gt: new Date() } }
            ]
          }
        }),
        prisma.approval.count({
          where: {
            status: 'PENDING'
          }
        })
      ]);

      return res.status(200).json({
        success: true,
        data: {
          properties: {
            managed: managedProperties
          },
          landlords: {
            managed: managedLandlords
          },
          approvals: {
            pending: pendingApprovals
          }
        }
      });
    } else if (user.role === 'tenant') {
      // Get tenant dashboard statistics
      const tenant = await prisma.tenant.findUnique({
        where: { id: user.userId },
        include: {
          leaseTenants: {
            include: {
              lease: {
                include: {
                  unit: {
                    include: {
                      property: true
                    }
                  },
                  rentPayments: {
                    where: {
                      status: 'Unpaid',
                      dueDate: {
                        lte: new Date()
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const activeLease = tenant.leaseTenants.find((lt: any) => lt.lease.status === 'Active')?.lease;
      const overdueRent = activeLease?.rentPayments.reduce((sum: number, rp: any) => sum + (rp.amount || 0), 0) || 0;

      return res.status(200).json({
        success: true,
        data: {
          lease: {
            active: activeLease ? 1 : 0,
            property: activeLease?.unit?.property?.propertyName || null
          },
          rent: {
            overdue: overdueRent
          }
        }
      });
    }

    return res.status(403).json({ error: 'Unauthorized' });
  } catch (error) {
    console.error('[Dashboard Analytics v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch dashboard data',
    });
  }
}, { requireRole: ['landlord', 'tenant', 'pmc', 'admin'], allowedMethods: ['GET'] });

