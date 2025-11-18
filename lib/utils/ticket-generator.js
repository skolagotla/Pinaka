/**
 * Maintenance Ticket Number Generator
 * 
 * Format: CC(2) + SS(2) + HHHHHHHH(8) = 12 characters
 * Example: CAON3F8A9B2C (Canada, Ontario, hash 3F8A9B2C)
 * 
 * Components:
 * - Country Code (2 chars): e.g., CA, US
 * - State/Province Code (2 chars): e.g., ON, NY, CA
 * - Hash (8 chars): Generated from property details, location, and timestamp
 * 
 * The hash is generated from:
 * - Country code
 * - State/Province code
 * - Property name
 * - Property address
 * - Date and time
 * - Random component for uniqueness
 */

const crypto = require('crypto');

/**
 * Generate a maintenance ticket number based on property location and details
 * 
 * @param {Object} propertyData - Property information
 * @param {string} propertyData.country - Country code (e.g., 'CA', 'US')
 * @param {string} propertyData.provinceState - Province/State code (e.g., 'ON', 'NY')
 * @param {string} propertyData.propertyName - Name of the property
 * @param {string} propertyData.addressLine1 - Property address
 * @param {Date} date - Date/time for the ticket (default: now)
 * @returns {string} Ticket number in format CCSSHHHHHHHH (12 characters)
 */
function generateTicketNumber(propertyData, date = new Date()) {
  // Extract country and state codes (2 letters each)
  const countryCode = (propertyData.country || "US").substring(0, 2).toUpperCase();
  const stateCode = (propertyData.provinceState || "CA").substring(0, 2).toUpperCase();
  
  // Create a hash source from all relevant data
  const hashSource = [
    propertyData.country || '',
    propertyData.provinceState || '',
    propertyData.propertyName || '',
    propertyData.addressLine1 || '',
    date.toISOString(),
    crypto.randomBytes(8).toString('hex'), // Add cryptographic randomness
  ].join('|');
  
  // Generate an 8-character hash using SHA-256
  const hash = crypto
    .createHash('sha256')
    .update(hashSource)
    .digest('hex')
    .substring(0, 8)
    .toUpperCase();
  
  // Return format: CCSSHHHHHHHH (2 + 2 + 8 = 12 characters)
  return `${countryCode}${stateCode}${hash}`;
}

/**
 * Parse a ticket number into its components
 * 
 * @param {string} ticketNumber - Ticket number to parse
 * @returns {Object|null} Parsed components or null if invalid
 */
function parseTicketNumber(ticketNumber) {
  if (!ticketNumber || ticketNumber.length !== 12) return null;
  
  const countryCode = ticketNumber.substring(0, 2);
  const stateCode = ticketNumber.substring(2, 4);
  const hash = ticketNumber.substring(4, 12);
  
  return { 
    countryCode, 
    stateCode, 
    hash,
    formatted: `${countryCode}-${stateCode}-${hash}`
  };
}

/**
 * Format a ticket number for display (with hyphens)
 * 
 * @param {string} ticketNumber - Ticket number to format
 * @returns {string} Formatted ticket number (CC-SS-HHHHHHHH)
 */
function formatTicketNumber(ticketNumber) {
  const parsed = parseTicketNumber(ticketNumber);
  if (!parsed) return ticketNumber || 'N/A';
  return parsed.formatted;
}

/**
 * Get a human-readable description of the ticket number format
 * 
 * @param {string} ticketNumber - Ticket number to describe
 * @returns {Object|null} Description object with breakdown
 */
function describeTicketNumber(ticketNumber) {
  const parsed = parseTicketNumber(ticketNumber);
  if (!parsed) return null;
  
  return {
    format: 'Country(2) + State(2) + Hash(8)',
    countryCode: parsed.countryCode,
    stateCode: parsed.stateCode,
    hash: parsed.hash,
    description: `${parsed.countryCode} = Country, ${parsed.stateCode} = State/Province, ${parsed.hash} = Unique Hash`
  };
}

module.exports = {
  generateTicketNumber,
  parseTicketNumber,
  formatTicketNumber,
  describeTicketNumber
};
