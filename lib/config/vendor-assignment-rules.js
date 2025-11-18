/**
 * Vendor Assignment Approval Rules
 * 
 * Defines when landlord approval is required for PMC vendor assignments
 */

/**
 * Approval threshold configuration
 * - Below threshold: No approval needed
 * - Above threshold: Approval required
 */
export const APPROVAL_THRESHOLDS = {
  DEFAULT_COST_THRESHOLD: 500, // $500 default
  EMERGENCY_COST_THRESHOLD: 1000, // $1000 for emergencies
};

/**
 * Maintenance categories that require approval regardless of cost
 */
export const APPROVAL_REQUIRED_CATEGORIES = [
  'Structural',
  'Roofing',
  'Foundation',
  'Electrical (Major)',
  'Plumbing (Major)',
  'HVAC (Replacement)',
];

/**
 * Maintenance categories that don't require approval (routine maintenance)
 */
export const NO_APPROVAL_CATEGORIES = [
  'Plumbing (Minor)',
  'Electrical (Minor)',
  'HVAC (Repair)',
  'Cleaning',
  'Landscaping',
  'Pest Control',
  'Painting (Touch-up)',
];

/**
 * Priority levels that require approval
 */
export const APPROVAL_REQUIRED_PRIORITIES = [
  // Currently none - all priorities can be auto-approved if other conditions are met
];

/**
 * Priority levels that don't require approval (emergencies)
 */
export const NO_APPROVAL_PRIORITIES = [
  'Urgent', // Emergency situations
];

/**
 * Check if vendor assignment requires landlord approval
 * @param {Object} options
 * @param {string} options.userRole - Role of user assigning vendor ('pmc' or 'landlord')
 * @param {string} options.maintenanceCategory - Category of maintenance request
 * @param {string} options.priority - Priority level
 * @param {number} options.estimatedCost - Estimated cost (if available)
 * @param {string} options.vendorId - Vendor ID being assigned
 * @param {Array} options.preApprovedVendors - List of pre-approved vendor IDs for this landlord
 * @returns {boolean} True if approval is required
 */
export function requiresApproval({
  userRole,
  maintenanceCategory,
  priority,
  estimatedCost = null,
  vendorId = null,
  preApprovedVendors = [],
}) {
  // Landlords can always assign without approval
  if (userRole === 'landlord') {
    return false;
  }

  // PMC assignments need approval check
  if (userRole !== 'pmc') {
    return false; // Other roles don't assign vendors
  }

  // Check if vendor is pre-approved
  if (vendorId && preApprovedVendors.includes(vendorId)) {
    return false;
  }

  // Emergency/Urgent priority - no approval needed
  if (priority === 'Urgent' && estimatedCost && estimatedCost <= APPROVAL_THRESHOLDS.EMERGENCY_COST_THRESHOLD) {
    return false;
  }

  // Check category-based rules
  if (NO_APPROVAL_CATEGORIES.includes(maintenanceCategory)) {
    return false; // Routine maintenance - no approval
  }

  if (APPROVAL_REQUIRED_CATEGORIES.includes(maintenanceCategory)) {
    return true; // Major work - always requires approval
  }

  // Cost-based approval
  if (estimatedCost !== null && estimatedCost > 0) {
    const threshold = priority === 'Urgent' 
      ? APPROVAL_THRESHOLDS.EMERGENCY_COST_THRESHOLD 
      : APPROVAL_THRESHOLDS.DEFAULT_COST_THRESHOLD;
    
    if (estimatedCost > threshold) {
      return true; // High cost - requires approval
    }
  }

  // Default: no approval needed for routine assignments
  return false;
}

/**
 * Get approval threshold for a given priority
 * @param {string} priority - Priority level
 * @returns {number} Cost threshold
 */
export function getApprovalThreshold(priority) {
  return priority === 'Urgent' 
    ? APPROVAL_THRESHOLDS.EMERGENCY_COST_THRESHOLD 
    : APPROVAL_THRESHOLDS.DEFAULT_COST_THRESHOLD;
}

