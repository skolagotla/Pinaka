/**
 * ═══════════════════════════════════════════════════════════════
 * PRISMA MIDDLEWARE - AUTO-FORMAT PHONE NUMBERS
 * ═══════════════════════════════════════════════════════════════
 * 
 * This middleware automatically formats phone numbers when data is
 * read from the database, ensuring consistent formatting everywhere.
 * 
 * Phone numbers are formatted as: (XXX) XXX-XXXX
 * 
 * ═══════════════════════════════════════════════════════════════
 */

const { formatPhoneNumber } = require('./utils/formatters');

/**
 * Format phone number helper
 */
function formatPhone(value) {
  if (!value) return value;
  // If already formatted, return as-is
  if (typeof value === 'string' && value.includes('(') && value.includes(')')) {
    return value;
  }
  return formatPhoneNumber(value);
}

/**
 * Recursively format phone numbers in an object
 */
function formatPhoneInObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => formatPhoneInObject(item));
  }
  
  const formatted = { ...obj };
  
  // Format phone fields
  if (formatted.phone) {
    formatted.phone = formatPhone(formatted.phone);
  }
  
  // Format nested objects
  for (const key in formatted) {
    if (formatted[key] && typeof formatted[key] === 'object') {
      formatted[key] = formatPhoneInObject(formatted[key]);
    }
  }
  
  return formatted;
}

/**
 * Setup Prisma middleware to auto-format phone numbers
 */
function setupPhoneFormattingMiddleware(prisma) {
  // Check if prisma is a valid PrismaClient instance and has $use method
  if (!prisma || typeof prisma.$use !== 'function') {
    console.warn('[Prisma Middleware] Prisma client does not support $use middleware or is not initialized');
    return false;
  }
  
  try {
    prisma.$use(async (params, next) => {
      // Only process read operations (findMany, findUnique, findFirst)
      if (params.action === 'findMany' || params.action === 'findUnique' || params.action === 'findFirst') {
        const result = await next(params);
        
        // Format phone numbers in result
        if (result) {
          if (Array.isArray(result)) {
            return result.map(item => formatPhoneInObject(item));
          } else {
            return formatPhoneInObject(result);
          }
        }
      }
      
      return next(params);
    });
    return true;
  } catch (error) {
    console.warn('[Prisma Middleware] Error setting up phone formatting middleware:', error.message);
    return false;
  }
}

module.exports = {
  setupPhoneFormattingMiddleware,
  formatPhoneInObject,
};

