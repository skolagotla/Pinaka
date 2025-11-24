/**
 * Document Categories and Rules
 * Defines all document types, requirements, and permissions
 */

// Document categories with their rules
export const DOCUMENT_CATEGORIES = {
  // Landlord-uploaded documents
  LEASE_AGREEMENT: {
    id: 'LEASE_AGREEMENT',
    name: 'Lease Agreement',
    uploadedBy: 'landlord',
    isRequired: false,
    hasExpiration: false,
    canTenantDelete: false,
    canLandlordDelete: true,
    visibility: 'shared',
    allowedFileTypes: ['.pdf', '.doc', '.docx'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    description: 'Signed lease agreement between landlord and tenant',
  },
  
  PROPERTY_PHOTOS: {
    id: 'PROPERTY_PHOTOS',
    name: 'Property Photos',
    uploadedBy: 'landlord',
    isRequired: false,
    hasExpiration: false,
    canTenantDelete: false,
    canLandlordDelete: true,
    visibility: 'shared',
    allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    description: 'Move-in/move-out inspection photos',
  },
  
  // Tenant required documents (pre-lease)
  CREDIT_REPORT: {
    id: 'CREDIT_REPORT',
    name: 'Credit Report',
    uploadedBy: 'tenant',
    isRequired: true,
    hasExpiration: false,
    canTenantDelete: false,
    canLandlordDelete: true,
    visibility: 'shared',
    allowedFileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    description: 'Official credit report from a recognized credit bureau (must be within 60 days)',
    validityPeriod: 60, // days
  },
  
  GOVERNMENT_ID: {
    id: 'GOVERNMENT_ID',
    name: 'Government Issued ID',
    uploadedBy: 'tenant',
    isRequired: true,
    hasExpiration: true,
    canTenantDelete: false,
    canLandlordDelete: true,
    visibility: 'shared',
    allowedFileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    description: 'Valid driver\'s license or state/provincial ID card with photo',
    expirationReminders: [60, 30], // days before expiration
  },
  
  PASSPORT: {
    id: 'PASSPORT',
    name: 'Passport',
    uploadedBy: 'tenant',
    isRequired: true,
    hasExpiration: true,
    canTenantDelete: false,
    canLandlordDelete: true,
    visibility: 'shared',
    allowedFileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    description: 'Valid passport with photo page and expiration date clearly visible',
    expirationReminders: [180, 90], // days before expiration
  },
  
  EMPLOYMENT_LETTER: {
    id: 'EMPLOYMENT_LETTER',
    name: 'Employment Verification Letter',
    uploadedBy: 'tenant',
    isRequired: true,
    hasExpiration: false,
    canTenantDelete: true,
    canLandlordDelete: true,
    visibility: 'shared',
    allowedFileTypes: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    description: 'Official letter from employer confirming employment status and salary',
  },
  
  RENTERS_INSURANCE: {
    id: 'RENTERS_INSURANCE',
    name: 'Renters Insurance Policy',
    uploadedBy: 'tenant',
    isRequired: true,
    hasExpiration: true,
    canTenantDelete: false,
    canLandlordDelete: true,
    visibility: 'shared',
    allowedFileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    description: 'Active renters insurance policy with adequate liability coverage',
    expirationReminders: [30, 7], // days before expiration
  },
  
  // Post-lease required document
  UPDATED_ID: {
    id: 'UPDATED_ID',
    name: 'Updated ID with Rental Address',
    uploadedBy: 'tenant',
    isRequired: true,
    hasExpiration: true,
    canTenantDelete: false,
    canLandlordDelete: true,
    visibility: 'shared',
    allowedFileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    description: 'Government ID updated to show your new rental property address',
    dueAfterLease: 30, // days after lease signing
    reminderDays: [20, 28], // send reminders at these days
  },
  
  // Financial documents
  PAY_STUB: {
    id: 'PAY_STUB',
    name: 'Recent Pay Stubs',
    uploadedBy: 'tenant',
    isRequired: true,
    hasExpiration: false,
    canTenantDelete: false,
    canLandlordDelete: true,
    visibility: 'shared',
    allowedFileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    description: 'Most recent 3 consecutive months of pay stubs showing income details',
    requiredCount: 3,
    minimumCount: 3,
  },
  
  BANK_STATEMENT: {
    id: 'BANK_STATEMENT',
    name: 'Bank Statement',
    uploadedBy: 'tenant',
    isRequired: false,
    hasExpiration: false,
    canTenantDelete: true,
    canLandlordDelete: true,
    visibility: 'shared',
    allowedFileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    description: 'Bank statements (last 3 months recommended)',
    recommendedCount: 3,
  },
  
  TAX_DOCUMENT: {
    id: 'TAX_DOCUMENT',
    name: 'Tax Returns',
    uploadedBy: 'tenant',
    isRequired: true,
    hasExpiration: false,
    canTenantDelete: false,
    canLandlordDelete: true,
    visibility: 'shared',
    allowedFileTypes: ['.pdf'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    description: 'Complete federal tax returns for the most recent 2 years',
    requiredCount: 2,
    minimumCount: 2,
  },
  
  // Optional documents
  REFERENCE_LETTER: {
    id: 'REFERENCE_LETTER',
    name: 'Reference Letter',
    uploadedBy: 'tenant',
    isRequired: false,
    hasExpiration: false,
    canTenantDelete: true,
    canLandlordDelete: true,
    visibility: 'shared',
    allowedFileTypes: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    description: 'Previous landlord or employer references',
  },
  
  VEHICLE_REGISTRATION: {
    id: 'VEHICLE_REGISTRATION',
    name: 'Vehicle Registration',
    uploadedBy: 'tenant',
    isRequired: false,
    hasExpiration: true,
    canTenantDelete: true,
    canLandlordDelete: true,
    visibility: 'shared',
    allowedFileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    description: 'Vehicle registration (if applicable)',
  },
  
  PET_DOCUMENTATION: {
    id: 'PET_DOCUMENTATION',
    name: 'Pet Documentation',
    uploadedBy: 'tenant',
    isRequired: false,
    hasExpiration: false,
    canTenantDelete: true,
    canLandlordDelete: true,
    visibility: 'shared',
    allowedFileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    description: 'Pet vaccination records, licenses, etc.',
  },
  
  OTHER: {
    id: 'OTHER',
    name: 'Other Document',
    uploadedBy: 'both',
    isRequired: false,
    hasExpiration: false,
    canTenantDelete: true,
    canLandlordDelete: true,
    visibility: 'shared',
    allowedFileTypes: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    description: 'Other supporting documents',
  },
};

// Get all required documents for tenant onboarding
export const getRequiredDocuments = () => {
  return Object.values(DOCUMENT_CATEGORIES).filter(cat => cat.isRequired);
};

// Get required pre-lease documents (excluding post-lease)
export const getPreLeaseRequiredDocuments = () => {
  return Object.values(DOCUMENT_CATEGORIES).filter(
    cat => cat.isRequired && !cat.dueAfterLease
  );
};

// Get post-lease required documents
export const getPostLeaseRequiredDocuments = () => {
  return Object.values(DOCUMENT_CATEGORIES).filter(
    cat => cat.isRequired && cat.dueAfterLease
  );
};

// Get documents with expiration tracking
export const getExpiringDocuments = () => {
  return Object.values(DOCUMENT_CATEGORIES).filter(cat => cat.hasExpiration);
};

// Get category by ID
export const getCategoryById = (categoryId) => {
  return DOCUMENT_CATEGORIES[categoryId];
};

// Validate if user can upload this category
export const canUploadCategory = (categoryId, userRole) => {
  const category = getCategoryById(categoryId);
  if (!category) return false;
  
  if (category.uploadedBy === 'both') return true;
  return category.uploadedBy === userRole;
};

// Validate if user can delete document
export const canDeleteDocument = (document, userRole) => {
  if (userRole === 'landlord') {
    return document.canLandlordDelete;
  }
  if (userRole === 'tenant') {
    return document.canTenantDelete;
  }
  return false;
};

// Get file type validation
export const isValidFileType = (filename, categoryId) => {
  const category = getCategoryById(categoryId);
  if (!category) return false;
  
  const ext = '.' + filename.split('.').pop().toLowerCase();
  return category.allowedFileTypes.includes(ext);
};

// Get max file size for category
export const getMaxFileSize = (categoryId) => {
  const category = getCategoryById(categoryId);
  return category?.maxFileSize || 5 * 1024 * 1024; // Default 5MB
};

// Format file size for display
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Category groups for UI organization
export const CATEGORY_GROUPS = {
  LANDLORD_DOCUMENTS: {
    name: 'Lease Documents (From Landlord)',
    categories: ['LEASE_AGREEMENT', 'PROPERTY_PHOTOS'],
  },
  REQUIRED_PRE_LEASE: {
    name: 'Required Documents (Pre-Lease)',
    categories: ['CREDIT_REPORT', 'GOVERNMENT_ID', 'PASSPORT', 'EMPLOYMENT_LETTER', 'PAY_STUB', 'TAX_DOCUMENT', 'RENTERS_INSURANCE'],
  },
  REQUIRED_POST_LEASE: {
    name: 'Required Documents (Post-Lease)',
    categories: ['UPDATED_ID'],
  },
  FINANCIAL: {
    name: 'Financial Documents',
    categories: ['BANK_STATEMENT'],
  },
  OPTIONAL: {
    name: 'Optional Documents',
    categories: ['REFERENCE_LETTER', 'VEHICLE_REGISTRATION', 'PET_DOCUMENTATION', 'OTHER'],
  },
};

// Get documents by group
export const getDocumentsByGroup = (groupId) => {
  const group = CATEGORY_GROUPS[groupId];
  if (!group) return [];
  
  return group.categories.map(catId => DOCUMENT_CATEGORIES[catId]);
};

export default DOCUMENT_CATEGORIES;

