/**
 * Analytics Service
 * Provides advanced analytics and insights for properties, finances, and tenants
 */

const { prisma } = require('../prisma');

/**
 * Get property performance metrics
 */
async function getPropertyPerformance(propertyId, startDate, endDate) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        units: {
          include: {
            leases: {
              where: {
                status: 'Active',
              },
              include: {
                rentPayments: {
                  where: {
                    dueDate: {
                      gte: startDate,
                      lte: endDate,
                    },
                  },
                },
              },
            },
          },
        },
        expenses: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    if (!property) {
      return null;
    }

    // Calculate metrics
    const totalRent = property.units.reduce((sum, unit) => {
      return sum + unit.leases.reduce((leaseSum, lease) => {
        return leaseSum + lease.rentPayments.reduce((paymentSum, payment) => {
          return paymentSum + (payment.status === 'Paid' ? payment.amount : 0);
        }, 0);
      }, 0);
    }, 0);

    const totalExpenses = property.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netIncome = totalRent - totalExpenses;

    const occupiedUnits = property.units.filter(unit =>
      unit.leases.some(lease => lease.status === 'Active')
    ).length;

    const occupancyRate = property.units.length > 0
      ? (occupiedUnits / property.units.length) * 100
      : 0;

    const roi = property.purchasePrice && property.purchasePrice > 0
      ? ((netIncome / property.purchasePrice) * 100) / (12 / ((endDate - startDate) / (1000 * 60 * 60 * 24 * 30))) // Annualized ROI
      : null;

    return {
      propertyId: property.id,
      propertyName: property.propertyName || property.addressLine1,
      totalRent,
      totalExpenses,
      netIncome,
      occupancyRate,
      occupiedUnits,
      totalUnits: property.units.length,
      roi,
      period: {
        startDate,
        endDate,
        days: Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)),
      },
    };
  } catch (error) {
    console.error('[Analytics Service] Error getting property performance:', error);
    throw error;
  }
}

/**
 * Get portfolio performance (all properties for a landlord)
 */
async function getPortfolioPerformance(landlordId, startDate, endDate) {
  try {
    const properties = await prisma.property.findMany({
      where: { landlordId },
      include: {
        units: {
          include: {
            leases: {
              where: { status: 'Active' },
              include: {
                rentPayments: {
                  where: {
                    dueDate: {
                      gte: startDate,
                      lte: endDate,
                    },
                  },
                },
              },
            },
          },
        },
        expenses: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    let totalRent = 0;
    let totalExpenses = 0;
    let totalUnits = 0;
    let occupiedUnits = 0;

    properties.forEach(property => {
      property.units.forEach(unit => {
        totalUnits++;
        if (unit.leases.some(lease => lease.status === 'Active')) {
          occupiedUnits++;
        }

        unit.leases.forEach(lease => {
          lease.rentPayments.forEach(payment => {
            if (payment.status === 'Paid') {
              totalRent += payment.amount;
            }
          });
        });
      });

      property.expenses.forEach(exp => {
        totalExpenses += exp.amount;
      });
    });

    const netIncome = totalRent - totalExpenses;
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    return {
      landlordId,
      totalProperties: properties.length,
      totalRent,
      totalExpenses,
      netIncome,
      occupancyRate,
      occupiedUnits,
      totalUnits,
      period: {
        startDate,
        endDate,
        days: Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)),
      },
    };
  } catch (error) {
    console.error('[Analytics Service] Error getting portfolio performance:', error);
    throw error;
  }
}

/**
 * Get payment delinquency risk score for a tenant
 */
async function getTenantDelinquencyRisk(tenantId) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        leaseTenants: {
          include: {
            lease: {
              include: {
                rentPayments: {
                  orderBy: { dueDate: 'desc' },
                  take: 12, // Last 12 payments
                },
              },
            },
          },
        },
      },
    });

    if (!tenant || tenant.leaseTenants.length === 0) {
      return { riskScore: 0, riskLevel: 'low', factors: [] };
    }

    let latePayments = 0;
    let missedPayments = 0;
    let totalPayments = 0;
    const factors = [];

    tenant.leaseTenants.forEach(lt => {
      lt.lease.rentPayments.forEach(payment => {
        totalPayments++;
        if (payment.status === 'Overdue' || payment.status === 'Unpaid') {
          const daysOverdue = Math.floor((new Date() - new Date(payment.dueDate)) / (1000 * 60 * 60 * 24));
          if (daysOverdue > 0) {
            latePayments++;
            if (daysOverdue > 30) {
              missedPayments++;
            }
          }
        }
      });
    });

    // Calculate risk score (0-100)
    const latePaymentRate = totalPayments > 0 ? (latePayments / totalPayments) * 100 : 0;
    const missedPaymentRate = totalPayments > 0 ? (missedPayments / totalPayments) * 100 : 0;

    let riskScore = 0;
    riskScore += latePaymentRate * 0.5;
    riskScore += missedPaymentRate * 1.5;
    riskScore = Math.min(100, Math.max(0, riskScore));

    if (latePaymentRate > 50) {
      factors.push('High late payment rate');
    }
    if (missedPaymentRate > 20) {
      factors.push('Multiple missed payments');
    }

    let riskLevel = 'low';
    if (riskScore >= 70) {
      riskLevel = 'high';
    } else if (riskScore >= 40) {
      riskLevel = 'medium';
    }

    return {
      riskScore: Math.round(riskScore),
      riskLevel,
      factors,
      latePayments,
      missedPayments,
      totalPayments,
      latePaymentRate: Math.round(latePaymentRate),
      missedPaymentRate: Math.round(missedPaymentRate),
    };
  } catch (error) {
    console.error('[Analytics Service] Error getting delinquency risk:', error);
    throw error;
  }
}

/**
 * Get cash flow forecast
 */
async function getCashFlowForecast(landlordId, months = 12) {
  try {
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    const properties = await prisma.property.findMany({
      where: { landlordId },
      include: {
        units: {
          include: {
            leases: {
              where: { status: 'Active' },
              include: {
                rentPayments: {
                  where: {
                    dueDate: {
                      gte: today,
                      lte: endDate,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const forecast = [];
    const monthlyData = {};

    // Initialize monthly data
    for (let i = 0; i < months; i++) {
      const date = new Date(today);
      date.setMonth(date.getMonth() + i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = {
        month: monthKey,
        date,
        projectedIncome: 0,
        projectedExpenses: 0,
        netCashFlow: 0,
      };
    }

    // Calculate projected income from rent payments
    properties.forEach(property => {
      property.units.forEach(unit => {
        unit.leases.forEach(lease => {
          lease.rentPayments.forEach(payment => {
            const paymentDate = new Date(payment.dueDate);
            const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyData[monthKey]) {
              monthlyData[monthKey].projectedIncome += payment.amount;
            }
          });
        });
      });
    });

    // Calculate net cash flow
    Object.values(monthlyData).forEach(month => {
      month.netCashFlow = month.projectedIncome - month.projectedExpenses;
      forecast.push(month);
    });

    return {
      landlordId,
      startDate: today,
      endDate,
      months,
      forecast,
      totalProjectedIncome: forecast.reduce((sum, m) => sum + m.projectedIncome, 0),
      totalProjectedExpenses: forecast.reduce((sum, m) => sum + m.projectedExpenses, 0),
      totalNetCashFlow: forecast.reduce((sum, m) => sum + m.netCashFlow, 0),
    };
  } catch (error) {
    console.error('[Analytics Service] Error getting cash flow forecast:', error);
    throw error;
  }
}

module.exports = {
  getPropertyPerformance,
  getPortfolioPerformance,
  getTenantDelinquencyRisk,
  getCashFlowForecast,
};

