const { prisma } = require('./prisma'); // Use singleton instead of creating new instances
const { randomBytes } = require('crypto');
const {
  createLocalDate,
  getTodayLocal,
  getDaysInMonth,
  getDateComponents,
  getRentDueDate,
  daysBetween,
  isDateBefore,
  isDateAfter
} = require('./utils/unified-date-formatter-consolidated');

// Simple CUID-like ID generator
function generateId() {
  const timestamp = Date.now().toString(36);
  const randomStr = randomBytes(12).toString('base64').replace(/[+/=]/g, '').substring(0, 16);
  return `c${timestamp}${randomStr}`.substring(0, 25);
}

/**
 * Calculate pro-rated rent for partial month
 * 
 * @param {number} fullRent - Full monthly rent amount
 * @param {Date} startDate - Lease start date
 * @returns {number} Pro-rated rent amount
 */
function calculateProRatedRent(fullRent, startDate) {
  const { year, month, day: startDay } = getDateComponents(startDate);
  
  // Get total days in the month
  const daysInMonth = getDaysInMonth(year, month);
  
  // Calculate days tenant will occupy (inclusive)
  const daysRented = daysInMonth - startDay + 1;
  
  // Calculate pro-rated amount
  const proRatedAmount = (fullRent / daysInMonth) * daysRented;
  
  console.log(`[calculateProRatedRent] Full Rent: $${fullRent}, Days in Month: ${daysInMonth}, Days Rented: ${daysRented}, Pro-rated: $${proRatedAmount.toFixed(2)}`);
  
  return Math.round(proRatedAmount * 100) / 100; // Round to 2 decimal places
}

/**
 * Check and update overdue rent payments
 * A payment is considered overdue if:
 * - Status is "Unpaid"
 * - Due date + 1 day has passed
 * 
 * @param {string} landlordId - Optional landlord ID to filter by
 * @returns {Promise<number>} Number of payments marked as overdue
 */
async function checkAndUpdateOverduePayments(landlordId = null) {
  // Use singleton prisma instance from lib/prisma.js
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate the cutoff date (due date + 1 day)
    const cutoffDate = new Date(today);
    cutoffDate.setDate(cutoffDate.getDate() - 1); // Yesterday
    
    // Build where clause
    // Note: "Partial" payments remain as "Partial" and don't automatically become "Overdue"
    // They are still counted in unpaid rent, but status stays as "Partial" to track partial payment
    const whereClause = {
      status: "Unpaid", // Only change "Unpaid" to "Overdue", not "Partial"
      dueDate: {
        lt: cutoffDate, // Due date is before yesterday (more than 1 day overdue)
      },
    };
    
    // If landlordId is provided, filter by landlord
    if (landlordId) {
      whereClause.lease = {
        unit: {
          property: {
            landlordId: landlordId,
          },
        },
      };
    }
    
    // Update all overdue payments
    const result = await prisma.rentPayment.updateMany({
      where: whereClause,
      data: {
        status: "Overdue",
      },
    });
    
    return result.count;
  } catch (error) {
    console.error("Error checking overdue payments:", error);
    return 0;
  }
  // Note: Don't disconnect - using singleton prisma instance
}

/**
 * Check and update overdue rent payments for a specific tenant
 * 
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<number>} Number of payments marked as overdue
 */
async function checkAndUpdateOverduePaymentsForTenant(tenantId) {
  // Use singleton prisma instance from lib/prisma.js
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate the cutoff date (due date + 1 day)
    const cutoffDate = new Date(today);
    cutoffDate.setDate(cutoffDate.getDate() - 1); // Yesterday
    
    // Update all overdue payments for this tenant
    const result = await prisma.rentPayment.updateMany({
      where: {
        status: "Unpaid",
        dueDate: {
          lt: cutoffDate,
        },
        lease: {
          leaseTenants: {
            some: {
              tenantId: tenantId,
            },
          },
        },
      },
      data: {
        status: "Overdue",
      },
    });
    
    return result.count;
  } catch (error) {
    console.error("Error checking overdue payments for tenant:", error);
    return 0;
  }
  // Note: Don't disconnect - using singleton prisma instance
}

/**
 * Create unpaid rent payment records for ALL months from lease start until current month
 * This ensures that if a lease started 3 months ago, there are 3 payment records (one per month)
 * 
 * IMPORTANT: Pro-rated First Month Logic
 * - If lease starts on 1st of month: Full month rent
 * - If lease starts on 2nd-31st: Pro-rated rent for remaining days of that month
 * - From next month onwards: Full monthly rent
 * 
 * @param {string} landlordId - Optional landlord ID to filter by
 * @returns {Promise<number>} Number of payment records created
 */
async function createMissingRentPayments(landlordId = null) {
  // Use singleton prisma instance from lib/prisma.js
  try {
    const today = getTodayLocal(); // FIXED: Use local timezone to prevent date shifts
    
    console.log(`[createMissingRentPayments] Starting for date: ${today.toISOString()}`);
    
    // Get all active leases
    const whereClause = {
      status: "Active",
    };
    
    if (landlordId) {
      whereClause.unit = {
        property: {
          landlordId: landlordId,
        },
      };
    }
    
    const activeLeases = await prisma.lease.findMany({
      where: whereClause,
      include: {
        rentPayments: true,
      },
    });
    
    console.log(`[createMissingRentPayments] Found ${activeLeases.length} active leases`);
    
    let createdCount = 0;
    
    for (const lease of activeLeases) {
      const leaseStartDate = new Date(lease.leaseStart);
      const rentDueDay = lease.rentDueDay || 1;
      const { year: leaseStartYear, month: leaseStartMonth, day: leaseStartDay } = getDateComponents(leaseStartDate);
      
      console.log(`[createMissingRentPayments] Processing lease ${lease.id}: startDate=${leaseStartDate.toISOString()}, startDay=${leaseStartDay}, rentDueDay=${rentDueDay}`);
      
      // Get all existing payments for this lease
      const existingPayments = await prisma.rentPayment.findMany({
        where: {
          leaseId: lease.id,
        },
      });
      
      console.log(`[createMissingRentPayments] Lease ${lease.id} has ${existingPayments.length} existing payments`);
      
      // Loop through every month from lease start until current month
      let currentYear = leaseStartYear;
      let currentMonth = leaseStartMonth; // 1-indexed
      let isFirstMonth = true;
      
      // Loop through months
      while (true) {
        // Create due date using our utility (rent for month X is due on day Y of month X+1)
        const dueDate = getRentDueDate(currentYear, currentMonth, rentDueDay);
        
        // Stop if due date is in the future
        if (isDateAfter(dueDate, today)) {
          break;
        }
        
        // Check if payment already exists for this month
        const existingPayment = existingPayments.find(payment => {
          const { year: payYear, month: payMonth } = getDateComponents(payment.dueDate);
          // Match by the month the payment is FOR (which is currentMonth)
          // The dueDate is in the next month, so we need to compare carefully
          const rentYear = currentYear;
          const rentMonth = currentMonth;
          
          // Due date components
          const { year: dueYear, month: dueMonth } = getDateComponents(dueDate);
          
          // Match if the payment's due date matches this month's calculated due date
          return payYear === dueYear && payMonth === dueMonth;
        });
        
        // Create payment if it doesn't exist
        if (!existingPayment) {
          // Determine rent amount
          let rentAmount = lease.rentAmount;
          
          // Pro-rate first month if lease starts after the 1st
          if (isFirstMonth && leaseStartDay > 1) {
            rentAmount = calculateProRatedRent(lease.rentAmount, leaseStartDate);
            console.log(`[createMissingRentPayments] First month is pro-rated: $${rentAmount} (lease started on day ${leaseStartDay})`);
          }
          
          // Validate dueDate before using it
          if (!dueDate || isNaN(dueDate.getTime())) {
            console.error(`[createMissingRentPayments] Invalid dueDate for lease ${lease.id}:`, { 
              dueDate, 
              currentYear, 
              currentMonth, 
              rentDueDay 
            });
            // Skip this payment and continue to next month
            currentMonth++;
            if (currentMonth > 12) {
              currentMonth = 1;
              currentYear++;
            }
            isFirstMonth = false;
            continue;
          }
          
          console.log(`[createMissingRentPayments] Creating payment for lease ${lease.id} with dueDate ${dueDate.toISOString()}, amount: $${rentAmount}`);
          await prisma.rentPayment.create({
            data: {
              id: generateId(),
              leaseId: lease.id,
              amount: rentAmount,
              dueDate: dueDate,
              status: "Unpaid",
              updatedAt: new Date(),
            },
          });
          createdCount++;
        } else {
          console.log(`[createMissingRentPayments] Payment already exists for ${dueDate.toISOString()}`);
        }
        
        // Move to next month
        isFirstMonth = false;
        currentMonth++;
        if (currentMonth > 12) {
          currentMonth = 1;
          currentYear++;
        }
      }
    }
    
    console.log(`[createMissingRentPayments] Created ${createdCount} new payment records`);
    return createdCount;
  } catch (error) {
    console.error("Error creating missing rent payments:", error);
    return 0;
  }
  // Note: Don't disconnect - using singleton prisma instance
}

module.exports = {
  checkAndUpdateOverduePayments,
  checkAndUpdateOverduePaymentsForTenant,
  createMissingRentPayments,
};

