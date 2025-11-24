/**
 * Mortgage Calculator Utility
 * Calculates bi-weekly and monthly mortgage payments with principal and interest breakdown
 */

/**
 * Calculate bi-weekly mortgage payment breakdown
 * @param {number} principal - Initial mortgage amount
 * @param {number} annualRate - Annual interest rate (e.g., 3.6 for 3.6%)
 * @param {number} termYears - Mortgage term in years (e.g., 25, 30)
 * @param {Date} startDate - Mortgage start date
 * @returns {Array} Array of payment objects with date, principal, interest, and remaining balance
 */
export function calculateBiWeeklyBreakdown(principal, annualRate, termYears, startDate) {
  if (!principal || !annualRate || !termYears || !startDate) {
    return [];
  }

  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = termYears * 12;
  const biWeeklyPaymentsPerYear = 26;
  const totalBiWeeklyPayments = termYears * biWeeklyPaymentsPerYear;

  // Calculate monthly payment first (standard amortization formula)
  const monthlyPayment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  // Bi-weekly payment: monthly payment * 12 / 26 (more accurate than dividing by 2)
  const biWeeklyPayment = (monthlyPayment * 12) / biWeeklyPaymentsPerYear;

  // Bi-weekly interest rate (annual rate / 26 periods per year)
  const biWeeklyRate = annualRate / 100 / biWeeklyPaymentsPerYear;

  const breakdown = [];
  let remainingBalance = principal;
  let currentDate = new Date(startDate);

  for (let i = 0; i < totalBiWeeklyPayments && remainingBalance > 0.01; i++) {
    // Calculate interest for this bi-weekly period
    const interestPayment = remainingBalance * biWeeklyRate;
    const principalPayment = Math.min(biWeeklyPayment - interestPayment, remainingBalance);
    
    remainingBalance = Math.max(0, remainingBalance - principalPayment);

    breakdown.push({
      paymentNumber: i + 1,
      date: new Date(currentDate),
      paymentAmount: biWeeklyPayment,
      principal: principalPayment,
      interest: interestPayment,
      remainingBalance: remainingBalance
    });

    // Move to next bi-weekly date (14 days)
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 14);
  }

  return breakdown;
}

/**
 * Calculate monthly mortgage payment breakdown
 * @param {number} principal - Initial mortgage amount
 * @param {number} annualRate - Annual interest rate (e.g., 3.6 for 3.6%)
 * @param {number} termYears - Mortgage term in years (e.g., 25, 30)
 * @param {Date} startDate - Mortgage start date
 * @returns {Array} Array of payment objects with date, principal, interest, and remaining balance
 */
export function calculateMonthlyBreakdown(principal, annualRate, termYears, startDate) {
  if (!principal || !annualRate || !termYears || !startDate) {
    return [];
  }

  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = termYears * 12;

  // Standard amortization formula
  const monthlyPayment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  const breakdown = [];
  let remainingBalance = principal;
  let currentDate = new Date(startDate);

  for (let i = 0; i < totalMonths && remainingBalance > 0.01; i++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = Math.min(monthlyPayment - interestPayment, remainingBalance);
    
    remainingBalance = Math.max(0, remainingBalance - principalPayment);

    breakdown.push({
      paymentNumber: i + 1,
      date: new Date(currentDate),
      paymentAmount: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      remainingBalance: remainingBalance
    });

    // Move to next month
    currentDate = new Date(currentDate);
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return breakdown;
}

/**
 * Calculate mortgage breakdown for a property
 * @param {Object} property - Property object with mortgage details
 * @param {Date} asOfDate - Only show payments up to this date (defaults to today)
 * @returns {Object} Breakdown object with summary and payment schedule
 */
export function calculatePropertyMortgageBreakdown(property, asOfDate = null) {
  if (!property.mortgageAmount || !property.interestRate || !property.mortgageTermYears || !property.mortgageStartDate) {
    return null;
  }

  const paymentFrequency = property.paymentFrequency || 'biweekly';
  const startDate = new Date(property.mortgageStartDate);
  const cutoffDate = asOfDate ? new Date(asOfDate) : new Date();
  // Set to end of day to include payments made today
  cutoffDate.setHours(23, 59, 59, 999);

  let breakdown;
  if (paymentFrequency === 'biweekly') {
    breakdown = calculateBiWeeklyBreakdown(
      property.mortgageAmount,
      property.interestRate,
      property.mortgageTermYears,
      startDate
    );
  } else {
    breakdown = calculateMonthlyBreakdown(
      property.mortgageAmount,
      property.interestRate,
      property.mortgageTermYears,
      startDate
    );
  }

  if (!breakdown || breakdown.length === 0) {
    return null;
  }

  // Filter to only show payments made up to today
  const paymentsMade = breakdown.filter(payment => {
    const paymentDate = new Date(payment.date);
    return paymentDate <= cutoffDate;
  });

  // If no payments have been made yet, return empty breakdown
  if (paymentsMade.length === 0) {
    return {
      propertyId: property.id,
      propertyName: property.propertyName || property.addressLine1,
      address: property.addressLine1,
      mortgageAmount: property.mortgageAmount,
      interestRate: property.interestRate,
      termYears: property.mortgageTermYears,
      startDate: startDate,
      paymentFrequency: paymentFrequency,
      breakdown: [],
      summary: {
        totalPayments: 0,
        totalInterest: 0,
        totalPrincipal: 0,
        totalAmount: 0,
        remainingBalance: property.mortgageAmount
      }
    };
  }

  // Calculate totals only for payments made so far
  const totalInterest = paymentsMade.reduce((sum, payment) => sum + payment.interest, 0);
  const totalPrincipal = paymentsMade.reduce((sum, payment) => sum + payment.principal, 0);
  const totalPayments = paymentsMade.reduce((sum, payment) => sum + payment.paymentAmount, 0);
  const remainingBalance = paymentsMade[paymentsMade.length - 1]?.remainingBalance || property.mortgageAmount;

  return {
    propertyId: property.id,
    propertyName: property.propertyName || property.addressLine1,
    address: property.addressLine1,
    mortgageAmount: property.mortgageAmount,
    interestRate: property.interestRate,
    termYears: property.mortgageTermYears,
    startDate: startDate,
    paymentFrequency: paymentFrequency,
    breakdown: paymentsMade,
    summary: {
      totalPayments: paymentsMade.length,
      totalInterest: totalInterest,
      totalPrincipal: totalPrincipal,
      totalAmount: totalPayments,
      remainingBalance: remainingBalance
    }
  };
}

