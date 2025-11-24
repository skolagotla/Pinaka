/**
 * Tax Reporting Service
 * Generates T776 tax forms for Canada
 * Implements Business Rule 13: Tax Reporting (T776)
 */

const { prisma } = require('../prisma');

/**
 * Generate T776 tax report
 * @param {string} landlordId - Landlord ID
 * @param {number} taxYear - Tax year (e.g., 2024)
 * @param {string[]} propertyIds - Property IDs to include (optional, all if not provided)
 * @returns {Promise<{success: boolean, report: any}>}
 */
async function generateT776Report(landlordId, taxYear, propertyIds = null) {
  try {
    const yearStart = new Date(taxYear, 0, 1);
    const yearEnd = new Date(taxYear, 11, 31, 23, 59, 59, 999);

    // Build property filter
    const propertyWhere = propertyIds
      ? { id: { in: propertyIds }, landlordId }
      : { landlordId };

    // Get all properties for landlord
    const properties = await prisma.property.findMany({
      where: propertyWhere,
      include: {
        units: {
          include: {
            leases: {
              where: {
                OR: [
                  {
                    leaseStart: { lte: yearEnd },
                    leaseEnd: { gte: yearStart },
                  },
                  {
                    leaseStart: { lte: yearEnd },
                    leaseEnd: null, // Month-to-month
                  },
                ],
              },
              include: {
                rentPayments: {
                  where: {
                    paidDate: {
                      gte: yearStart,
                      lte: yearEnd,
                    },
                    status: 'Paid',
                  },
                },
              },
            },
          },
        },
      },
    });

    // Calculate income
    let totalRentalIncome = 0;
    const propertyIncome = [];

    for (const property of properties) {
      let propertyIncomeAmount = 0;

      for (const unit of property.units) {
        for (const lease of unit.leases) {
          for (const payment of lease.rentPayments) {
            propertyIncomeAmount += parseFloat(payment.amount || 0);
            totalRentalIncome += parseFloat(payment.amount || 0);
          }
        }
      }

      if (propertyIncomeAmount > 0) {
        propertyIncome.push({
          propertyId: property.id,
          propertyName: property.propertyName || property.addressLine1,
          address: `${property.addressLine1}, ${property.city}, ${property.provinceState}`,
          income: propertyIncomeAmount,
        });
      }
    }

    // Get expenses (placeholder - would need expense tracking)
    // For now, return structure
    const expenses = {
      advertising: 0,
      insurance: 0,
      interest: 0,
      officeExpenses: 0,
      professionalFees: 0,
      managementFees: 0,
      repairs: 0,
      supplies: 0,
      taxes: 0,
      utilities: 0,
      other: 0,
    };

    // Calculate CCA (Capital Cost Allowance) - placeholder
    const cca = {
      class1: 0, // 4% - Buildings
      class8: 0, // 20% - Furniture, fixtures
      class10: 0, // 30% - Vehicles
    };

    const totalExpenses = Object.values(expenses).reduce((sum, val) => sum + val, 0);
    const netIncome = totalRentalIncome - totalExpenses;

    const report = {
      taxYear,
      landlordId,
      properties: propertyIncome,
      income: {
        totalRentalIncome,
        otherIncome: 0,
        totalIncome: totalRentalIncome,
      },
      expenses,
      totalExpenses,
      netIncome,
      cca,
      netIncomeAfterCCA: netIncome - Object.values(cca).reduce((sum, val) => sum + val, 0),
      generatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      report,
    };
  } catch (error) {
    console.error('[Tax Reporting] Error generating T776:', error);
    throw error;
  }
}

module.exports = {
  generateT776Report,
};

