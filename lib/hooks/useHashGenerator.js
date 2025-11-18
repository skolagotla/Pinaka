/**
 * Unified Hash Generation Hook
 * 
 * Provides consistent hash generation using crypto SHA-256 for all entities
 * 
 * Format: PREFIX(2) + HASH(8) = 10 characters
 * 
 * Entity Prefixes:
 * - MA: Maintenance Tickets
 * - DO: Documents
 * - RR: Rent Receipts
 * - LL: Landlord
 * - TN: Tenant
 * - PP: Property
 * - IN: Invitation Token
 * - PM: Property Management Company (PMC)
 * - CO: Contractor
 * - VD: Vendor
 * 
 * Examples:
 * - MA3F8A9B2C (Maintenance Ticket)
 * - DO7A5B3C9D (Document)
 * - RR9E2F4A6B (Rent Receipt)
 * - LL1B4D6F8A (Landlord)
 * - TN5C7E9A2B (Tenant)
 * - PP8D2F5A3C (Property)
 * - IN4F7B9D2E (Invitation Token)
 * - PM2A4B6C8D (Property Management Company)
 * - CO3B5D7E9F (Contractor)
 * - VD4C6E8F0A (Vendor)
 */

const crypto = require('crypto');

// Entity type prefixes
const ENTITY_PREFIXES = {
  MAINTENANCE: 'MA',
  DOCUMENT: 'DO',
  RENT_RECEIPT: 'RR',
  LANDLORD: 'LL',
  TENANT: 'TN',
  PROPERTY: 'PP',
  INVITATION: 'IN',
  PMC: 'PM',
  CONTRACTOR: 'CO',
  VENDOR: 'VD',
};

/**
 * Generate a unique hash for an entity
 * 
 * @param {string} entityType - Type of entity (MAINTENANCE, DOCUMENT, RENT_RECEIPT, LANDLORD, TENANT, PROPERTY, INVITATION)
 * @param {string|Array<string>} data - Data to hash (string or array of strings)
 * @param {boolean} addRandomness - Whether to add crypto randomness for uniqueness (default: true)
 * @returns {string} Hash in format: PREFIX(2) + HASH(8) = 10 characters
 */
function generateHash(entityType, data, addRandomness = true) {
  // Validate entity type
  const prefix = ENTITY_PREFIXES[entityType];
  if (!prefix) {
    throw new Error(`Invalid entity type: ${entityType}. Must be one of: ${Object.keys(ENTITY_PREFIXES).join(', ')}`);
  }

  // Prepare data for hashing
  let hashSource;
  if (Array.isArray(data)) {
    hashSource = data.join('|');
  } else {
    hashSource = String(data);
  }

  // Add timestamp and optional randomness for uniqueness
  hashSource += `|${Date.now()}`;
  if (addRandomness) {
    hashSource += `|${crypto.randomBytes(8).toString('hex')}`;
  }

  // Generate 8-character hash using SHA-256
  const hash = crypto
    .createHash('sha256')
    .update(hashSource)
    .digest('hex')
    .substring(0, 8)
    .toUpperCase();

  // Return format: PREFIX(2) + HASH(8)
  return `${prefix}${hash}`;
}

/**
 * Generate maintenance ticket hash
 * 
 * @param {Object} propertyData - Property information
 * @param {string} propertyData.country - Country code
 * @param {string} propertyData.provinceState - Province/State code
 * @param {string} propertyData.propertyName - Property name
 * @param {string} propertyData.addressLine1 - Property address
 * @returns {string} Maintenance ticket hash (MA + 8 chars)
 */
function generateMaintenanceHash(propertyData) {
  const data = [
    propertyData.country || '',
    propertyData.provinceState || '',
    propertyData.propertyName || '',
    propertyData.addressLine1 || '',
  ];
  return generateHash('MAINTENANCE', data);
}

/**
 * Generate document hash
 * 
 * @param {Object} documentData - Document information
 * @param {string} documentData.fileName - File name
 * @param {string} documentData.tenantId - Tenant ID
 * @param {string} documentData.category - Document category
 * @returns {string} Document hash (DO + 8 chars)
 */
function generateDocumentHash(documentData) {
  const data = [
    documentData.fileName || '',
    documentData.tenantId || '',
    documentData.category || '',
  ];
  return generateHash('DOCUMENT', data);
}

/**
 * Generate rent receipt hash
 * 
 * @param {Object} paymentData - Payment information
 * @param {string} paymentData.leaseId - Lease ID
 * @param {number} paymentData.amount - Payment amount
 * @param {Date} paymentData.paidDate - Payment date
 * @returns {string} Rent receipt hash (RR + 8 chars)
 */
function generateRentReceiptHash(paymentData) {
  const data = [
    paymentData.leaseId || '',
    String(paymentData.amount || ''),
    paymentData.paidDate ? new Date(paymentData.paidDate).toISOString() : '',
  ];
  return generateHash('RENT_RECEIPT', data);
}

/**
 * Generate landlord hash
 * 
 * @param {Object} landlordData - Landlord information
 * @param {string} landlordData.email - Landlord email
 * @param {string} landlordData.phone - Landlord phone
 * @param {string} landlordData.country - Country code
 * @param {string} landlordData.provinceState - Province/State code
 * @returns {string} Landlord hash (LL + 8 chars)
 */
function generateLandlordHash(landlordData) {
  const data = [
    landlordData.email || '',
    landlordData.phone || '',
    landlordData.country || '',
    landlordData.provinceState || '',
  ];
  return generateHash('LANDLORD', data);
}

/**
 * Generate tenant hash
 * 
 * @param {Object} tenantData - Tenant information
 * @param {string} tenantData.email - Tenant email
 * @param {string} tenantData.phone - Tenant phone
 * @param {string} tenantData.country - Country code
 * @param {string} tenantData.provinceState - Province/State code
 * @returns {string} Tenant hash (TN + 8 chars)
 */
function generateTenantHash(tenantData) {
  const data = [
    tenantData.email || '',
    tenantData.phone || '',
    tenantData.country || '',
    tenantData.provinceState || '',
  ];
  return generateHash('TENANT', data);
}

/**
 * Generate property hash
 * 
 * @param {Object} propertyData - Property information
 * @param {string} propertyData.addressLine1 - Property address
 * @param {string} propertyData.postalZip - Postal/ZIP code
 * @param {string} propertyData.country - Country code
 * @param {string} propertyData.provinceState - Province/State code
 * @returns {string} Property hash (PP + 8 chars)
 */
function generatePropertyHash(propertyData) {
  const addressMatch = (propertyData.addressLine1 || '').match(/^\d+/);
  const houseNumber = addressMatch ? addressMatch[0] : '';
  
  const data = [
    houseNumber,
    (propertyData.postalZip || '').replace(/\s/g, ''),
    propertyData.country || '',
    propertyData.provinceState || '',
  ];
  return generateHash('PROPERTY', data);
}

/**
 * Generate invitation token hash
 * 
 * @param {Object} invitationData - Invitation information
 * @param {string} invitationData.tenantEmail - Tenant email
 * @param {string} invitationData.landlordEmail - Landlord email
 * @returns {string} Invitation token hash (IN + 8 chars)
 */
function generateInvitationHash(invitationData) {
  const data = [
    invitationData.tenantEmail || '',
    invitationData.landlordEmail || '',
  ];
  return generateHash('INVITATION', data);
}

/**
 * Generate PMC hash
 * 
 * @param {Object} pmcData - PMC information
 * @param {string} pmcData.email - PMC email
 * @param {string} pmcData.companyName - Company name
 * @param {string} pmcData.country - Country code
 * @param {string} pmcData.provinceState - Province/State code
 * @returns {string} PMC hash (PM + 8 chars)
 */
function generatePMCHash(pmcData) {
  const data = [
    pmcData.email || '',
    pmcData.companyName || '',
    pmcData.country || '',
    pmcData.provinceState || '',
  ];
  return generateHash('PMC', data);
}

/**
 * Generate contractor hash
 * 
 * @param {Object} contractorData - Contractor information
 * @param {string} contractorData.email - Contractor email
 * @param {string} contractorData.phone - Contractor phone
 * @param {string} contractorData.country - Country code
 * @param {string} contractorData.provinceState - Province/State code
 * @returns {string} Contractor hash (CO + 8 chars)
 */
function generateContractorHash(contractorData) {
  const data = [
    contractorData.email || '',
    contractorData.phone || '',
    contractorData.country || '',
    contractorData.provinceState || '',
  ];
  return generateHash('CONTRACTOR', data);
}

/**
 * Generate vendor hash
 * 
 * @param {Object} vendorData - Vendor information
 * @param {string} vendorData.email - Vendor email
 * @param {string} vendorData.phone - Vendor phone
 * @param {string} vendorData.country - Country code
 * @param {string} vendorData.provinceState - Province/State code
 * @returns {string} Vendor hash (VD + 8 chars)
 */
function generateVendorHash(vendorData) {
  const data = [
    vendorData.email || '',
    vendorData.phone || '',
    vendorData.country || '',
    vendorData.provinceState || '',
  ];
  return generateHash('VENDOR', data);
}

/**
 * Parse a hash to get its entity type and hash value
 * 
 * @param {string} hash - Hash to parse
 * @returns {Object|null} Parsed components {prefix, hashValue, entityType} or null if invalid
 */
function parseHash(hash) {
  if (!hash || hash.length !== 10) {
    return null;
  }

  const prefix = hash.substring(0, 2);
  const hashValue = hash.substring(2, 10);

  // Find entity type by prefix
  const entityType = Object.entries(ENTITY_PREFIXES).find(
    ([_, prefixValue]) => prefixValue === prefix
  );

  if (!entityType) {
    return null;
  }

  return {
    prefix,
    hashValue,
    entityType: entityType[0],
  };
}

/**
 * Validate a hash format
 * 
 * @param {string} hash - Hash to validate
 * @param {string} expectedEntityType - Expected entity type (optional)
 * @returns {boolean} True if valid, false otherwise
 */
function validateHash(hash, expectedEntityType = null) {
  const parsed = parseHash(hash);
  if (!parsed) {
    return false;
  }

  if (expectedEntityType) {
    return parsed.entityType === expectedEntityType;
  }

  return true;
}

/**
 * Format a hash for display
 * 
 * @param {string} hash - Hash to format
 * @returns {string} Formatted hash with entity type description
 */
function formatHash(hash) {
  const parsed = parseHash(hash);
  if (!parsed) {
    return hash || 'N/A';
  }

  const typeNames = {
    MAINTENANCE: 'Maintenance Ticket',
    DOCUMENT: 'Document',
    RENT_RECEIPT: 'Rent Receipt',
    LANDLORD: 'Landlord',
    TENANT: 'Tenant',
    PROPERTY: 'Property',
    INVITATION: 'Invitation',
    PMC: 'Property Management Company',
    CONTRACTOR: 'Contractor',
    VENDOR: 'Vendor',
  };

  return `${typeNames[parsed.entityType]}: ${hash}`;
}

/**
 * Check if hash already exists in database
 * 
 * @param {Object} prisma - Prisma client instance
 * @param {string} entityType - Type of entity
 * @param {string} hash - Hash to check
 * @returns {Promise<boolean>} True if exists, false otherwise
 */
async function hashExists(prisma, entityType, hash) {
  let result = null;

  switch (entityType) {
    case 'MAINTENANCE':
      result = await prisma.maintenanceRequest.findUnique({
        where: { ticketNumber: hash },
      });
      break;
    case 'DOCUMENT':
      result = await prisma.document.findUnique({
        where: { documentHash: hash },
      });
      break;
    case 'RENT_RECEIPT':
      result = await prisma.rentPayment.findFirst({
        where: { receiptNumber: hash },
      });
      break;
    case 'LANDLORD':
      result = await prisma.landlord.findUnique({
        where: { landlordId: hash },
      });
      break;
    case 'TENANT':
      result = await prisma.tenant.findUnique({
        where: { tenantId: hash },
      });
      break;
    case 'PROPERTY':
      result = await prisma.property.findUnique({
        where: { propertyId: hash },
      });
      break;
    case 'INVITATION':
      result = await prisma.tenant.findUnique({
        where: { invitationToken: hash },
      });
      break;
    case 'PMC':
      result = await prisma.propertyManagementCompany.findUnique({
        where: { companyId: hash },
      });
      break;
    case 'CONTRACTOR':
      result = await prisma.serviceProvider.findFirst({
        where: { providerId: hash, type: 'contractor', isDeleted: false },
      });
      break;
    case 'VENDOR':
      result = await prisma.serviceProvider.findFirst({
        where: { providerId: hash, type: 'vendor', isDeleted: false },
      });
      break;
    default:
      return false;
  }

  return result !== null;
}

/**
 * Generate unique hash with collision checking
 * 
 * @param {Object} prisma - Prisma client instance
 * @param {string} entityType - Type of entity
 * @param {string|Array<string>} data - Data to hash
 * @param {number} maxAttempts - Maximum number of attempts (default: 10)
 * @returns {Promise<string>} Unique hash
 */
async function generateUniqueHash(prisma, entityType, data, maxAttempts = 10) {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const hash = generateHash(entityType, data, true);
    const exists = await hashExists(prisma, entityType, hash);

    if (!exists) {
      return hash;
    }

    attempts++;
  }

  throw new Error(`Failed to generate unique hash for ${entityType} after ${maxAttempts} attempts`);
}

// Export all functions
module.exports = {
  // Constants
  ENTITY_PREFIXES,
  
  // Core functions
  generateHash,
  
  // Entity-specific generators
  generateMaintenanceHash,
  generateDocumentHash,
  generateRentReceiptHash,
  generateLandlordHash,
  generateTenantHash,
  generatePropertyHash,
  generateInvitationHash,
  generatePMCHash,
  generateContractorHash,
  generateVendorHash,
  
  // Utility functions
  parseHash,
  validateHash,
  formatHash,
  hashExists,
  generateUniqueHash,
};

