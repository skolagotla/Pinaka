/**
 * ═══════════════════════════════════════════════════════════════
 * INVITATION ROLE CONFIGURATION - EXTENSIBLE SYSTEM
 * ═══════════════════════════════════════════════════════════════
 * 
 * This file defines all invitation roles and their configurations.
 * To add a new role (e.g., vendor, contractor), simply add it here.
 * No schema changes needed!
 * 
 * ═══════════════════════════════════════════════════════════════
 */

export type InvitationRole = 'landlord' | 'tenant' | 'vendor' | 'contractor' | 'pmc';

export type InviterRole = 'admin' | 'landlord' | 'pmc';

export interface RoleConfig {
  name: string;
  canInvite: InviterRole[]; // Who can send invitations for this role
  formFields: string[]; // Required fields for registration form
  redirectTo: string; // Where to redirect after acceptance
  model: string; // Prisma model name
  relationField: string; // Field name in Invitation model (e.g., 'landlordId', 'tenantId')
  emailTemplate?: string; // Email template name (optional)
  requiresApproval: boolean; // Whether approval is required after registration
  approvedBy: InviterRole | 'inviter'; // Who can approve this role ('inviter' means the person who sent the invitation)
}

export const INVITATION_ROLES: Record<InvitationRole, RoleConfig> = {
  landlord: {
    name: 'Landlord',
    canInvite: ['admin', 'pmc'], // Admins and PMCs can invite landlords
    formFields: [
      'firstName',
      'lastName',
      'phone',
      'addressLine1',
      'city',
      'provinceState',
      'postalZip',
      'country',
    ],
    redirectTo: '/dashboard',
    model: 'Landlord',
    relationField: 'landlordId',
    emailTemplate: 'landlord-invitation',
    requiresApproval: true,
    approvedBy: 'inviter', // Approved by whoever sent the invitation (admin or pmc)
  },
  tenant: {
    name: 'Tenant',
    canInvite: ['landlord', 'pmc'], // Landlords and PMCs can invite tenants
    formFields: [
      'firstName',
      'lastName',
      'phone',
      'dateOfBirth',
      'currentAddress',
      'city',
      'provinceState',
      'postalZip',
      'country',
      'numberOfAdults',
      'numberOfChildren',
    ],
    redirectTo: '/dashboard',
    model: 'Tenant',
    relationField: 'tenantId',
    emailTemplate: 'tenant-invitation',
    requiresApproval: true,
    approvedBy: 'inviter', // Approved by whoever sent the invitation (landlord or pmc)
  },
  vendor: {
    name: 'Vendor',
    canInvite: ['landlord', 'admin', 'pmc'], // Admins can invite global vendors, PMCs and landlords can invite at their level
    formFields: [
      'companyName',
      'contactName',
      'phone',
      'services',
      'addressLine1',
      'city',
      'provinceState',
      'postalZip',
      'country',
      'latitude', // Optional for location-based search
      'longitude', // Optional for location-based search
    ],
    redirectTo: '/vendor/dashboard',
    model: 'Vendor',
    relationField: 'vendorId',
    emailTemplate: 'vendor-invitation',
    requiresApproval: true, // Requires approval if invited by admin (global)
    approvedBy: 'admin', // Admin approves global vendors
  },
  contractor: {
    name: 'Contractor',
    canInvite: ['landlord', 'admin', 'pmc'], // Admins can invite global contractors, PMCs and landlords can invite at their level
    formFields: [
      'companyName',
      'licenseNumber',
      'contactName',
      'phone',
      'specialties',
      'addressLine1',
      'city',
      'provinceState',
      'postalZip',
      'country',
      'latitude', // Optional for location-based search
      'longitude', // Optional for location-based search
    ],
    redirectTo: '/contractor/dashboard',
    model: 'Contractor',
    relationField: 'contractorId',
    emailTemplate: 'contractor-invitation',
    requiresApproval: true, // Requires approval if invited by admin (global)
    approvedBy: 'admin', // Admin approves global contractors
  },
  pmc: {
    name: 'Property Management Company',
    canInvite: ['admin'], // Only admins can invite PMCs (for now)
    formFields: [
      'companyName',
      'email',
      'phone',
      'addressLine1',
      'city',
      'provinceState',
      'postalZip',
      'country',
      'defaultCommissionRate', // Optional
    ],
    redirectTo: '/dashboard',
    model: 'PropertyManagementCompany',
    relationField: 'pmcId',
    emailTemplate: 'pmc-invitation',
    requiresApproval: true,
    approvedBy: 'admin',
  },
} as const;

/**
 * Get role configuration by role type
 */
export function getRoleConfig(role: string): RoleConfig | null {
  return INVITATION_ROLES[role as InvitationRole] || null;
}

/**
 * Check if a user role can invite a target role
 */
export function canUserInviteRole(userRole: string, targetRole: InvitationRole): boolean {
  const config = getRoleConfig(targetRole);
  if (!config) return false;
  
  // Map 'admin' role to 'admin' inviter role
  const inviterRole = userRole === 'admin' ? 'admin' : userRole;
  
  return config.canInvite.includes(inviterRole as InviterRole);
}

/**
 * Get all roles that a user can invite
 */
export function getInvitableRoles(userRole: InviterRole): InvitationRole[] {
  return (Object.keys(INVITATION_ROLES) as InvitationRole[]).filter(
    (role) => canUserInviteRole(userRole, role)
  );
}

/**
 * Validate form data against role requirements
 */
export function validateFormData(formData: any, role: InvitationRole): {
  valid: boolean;
  errors: string[];
} {
  const config = getRoleConfig(role);
  if (!config) {
    return {
      valid: false,
      errors: [`Invalid role: ${role}`],
    };
  }

  const errors: string[] = [];
  const requiredFields = config.formFields;

  for (const field of requiredFields) {
    if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get all available roles (for API documentation, UI dropdowns, etc.)
 */
export function getAllRoles(): InvitationRole[] {
  return Object.keys(INVITATION_ROLES) as InvitationRole[];
}

/**
 * Check if a role is valid
 */
export function isValidRole(role: string): role is InvitationRole {
  return role in INVITATION_ROLES;
}

