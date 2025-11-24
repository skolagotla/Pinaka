/**
 * ═══════════════════════════════════════════════════════════════
 * INVITATION ACCEPTANCE SERVICE
 * ═══════════════════════════════════════════════════════════════
 * 
 * Service functions for accepting invitations and creating user records
 * based on invitation type. Extensible for future roles.
 * 
 * ═══════════════════════════════════════════════════════════════
 */

import { getRoleConfig } from '../config/invitation-roles';
const { generateLandlordHash, generateTenantHash, generateHash } = require('../hooks/useHashGenerator');
const { randomBytes } = require('crypto');

function generateCUID() {
  const timestamp = Date.now().toString(36);
  const randomPart = randomBytes(8).toString('hex');
  return `${timestamp}${randomPart}`;
}

/**
 * Create a landlord from invitation acceptance
 */
export async function createLandlordFromInvitation(
  prisma: any,
  formData: any,
  invitation: any
) {
  const roleConfig = getRoleConfig('landlord');
  if (!roleConfig) {
    throw new Error('Invalid role configuration for landlord');
  }

  // Map country/provinceState to FKs
  const { mapCountryRegionToFKs } = require('../utils/country-region-mapper');
  const { countryCode: finalCountryCode, regionCode: finalRegionCode } = await mapCountryRegionToFKs(
    formData.country || 'CA',
    formData.provinceState || 'ON',
    null, // countryCode not provided
    null  // regionCode not provided
  );

  // Generate landlord ID
  const landlordId = generateLandlordHash({
    email: invitation.email,
    phone: formData.phone || '',
    country: formData.country || 'CA',
    provinceState: formData.provinceState || 'ON',
  });

  // Create landlord with PENDING approval status and FK tracking
  const landlordData: any = {
    id: generateCUID(),
    landlordId,
    firstName: formData.firstName,
    middleName: formData.middleName || null,
    lastName: formData.lastName,
    email: invitation.email,
    phone: formData.phone || null,
    addressLine1: formData.addressLine1 || null,
    addressLine2: formData.addressLine2 || null,
    city: formData.city || null,
    provinceState: formData.provinceState || null, // Legacy
    postalZip: formData.postalZip || null,
    country: formData.country || 'CA', // Legacy
    countryCode: finalCountryCode || null, // New FK
    regionCode: finalRegionCode || null, // New FK
    approvalStatus: 'PENDING', // Requires admin approval
    invitedAt: invitation.createdAt,
    updatedAt: new Date(),
  };
  
  // Populate FK based on inviter role
  // Note: Landlord.invitedBy only references Admin.id, so we can only set it for admin invitations
  // For PMC invitations, invitedBy must be null (the relationship is tracked via PMCLandlord table)
  if (invitation.invitedByRole === 'admin' && invitation.invitedByAdminId) {
    landlordData.invitedBy = invitation.invitedByAdminId;
  } else {
    // For PMC or other inviters, set to null since FK constraint only allows Admin IDs
    landlordData.invitedBy = null;
  }
  
  const landlord = await prisma.landlord.create({
    data: landlordData,
  });

  return landlord;
}

/**
 * Create a tenant from invitation acceptance
 */
export async function createTenantFromInvitation(
  prisma: any,
  formData: any,
  invitation: any
) {
  const roleConfig = getRoleConfig('tenant');
  if (!roleConfig) {
    throw new Error('Invalid role configuration for tenant');
  }

  // Map country/provinceState to FKs
  const { mapCountryRegionToFKs } = require('../utils/country-region-mapper');
  const { countryCode: finalCountryCode, regionCode: finalRegionCode } = await mapCountryRegionToFKs(
    formData.country || 'CA',
    formData.provinceState || 'ON',
    null, // countryCode not provided
    null  // regionCode not provided
  );

  // Generate tenant ID
  const tenantId = generateTenantHash({
    email: invitation.email,
    phone: formData.phone || '',
    country: formData.country || 'CA',
    provinceState: formData.provinceState || 'ON',
  });

  // Create tenant with PENDING approval status
  const tenant = await prisma.tenant.create({
    data: {
      id: generateCUID(),
      tenantId,
      email: invitation.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      middleName: formData.middleName || null,
      phone: formData.phone || null,
      country: formData.country || null, // Legacy
      provinceState: formData.provinceState || null, // Legacy
      countryCode: finalCountryCode || null, // New FK
      regionCode: finalRegionCode || null, // New FK
      postalZip: formData.postalZip || null,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
      currentAddress: formData.currentAddress || null,
      city: formData.city || null,
      numberOfAdults: formData.numberOfAdults || null,
      numberOfChildren: formData.numberOfChildren || null,
      moveInDate: formData.moveInDate ? new Date(formData.moveInDate) : null,
      leaseTerm: formData.leaseTerm || null,
      hasAccess: false, // Will be enabled after approval
      approvalStatus: 'PENDING', // Requires landlord approval
      invitationToken: invitation.token,
      invitationSentAt: invitation.createdAt,
      invitedBy: invitation.invitedBy,
      updatedAt: new Date(),
    },
  });

  // Handle emergency contacts
  if (formData.emergencyContacts && Array.isArray(formData.emergencyContacts)) {
    for (const contact of formData.emergencyContacts) {
      if (contact.contactName || contact.email || contact.phone) {
        await prisma.emergencyContact.create({
          data: {
            id: generateCUID(),
            tenantId: tenant.id,
            contactName: contact.contactName || '',
            email: contact.email || null,
            phone: contact.phone || '',
            isPrimary: contact.isPrimary || false,
          },
        });
      }
    }
  }

  // Handle employers
  if (formData.employers && Array.isArray(formData.employers)) {
    for (const employer of formData.employers) {
      if (employer.employerName) {
        await prisma.employer.create({
          data: {
            id: generateCUID(),
            tenantId: tenant.id,
            employerName: employer.employerName,
            employerAddress: employer.employerAddress || null,
            income: employer.income || null,
            jobTitle: employer.jobTitle || null,
            startDate: employer.startDate ? new Date(employer.startDate) : null,
            payFrequency: employer.payFrequency || null,
            isCurrent: employer.isCurrent !== undefined ? employer.isCurrent : true,
          },
        });
      }
    }
  }

  return tenant;
}

/**
 * Generate vendor ID (simple hash-based)
 */
function generateVendorId(data: any): string {
  const { generateVendorHash } = require('../hooks/useHashGenerator');
  return generateVendorHash({
    email: data.email || '',
    phone: data.phone || '',
    country: data.country || 'CA',
    provinceState: data.provinceState || 'ON',
  });
}

/**
 * Generate contractor ID using standard hash format
 */
function generateContractorId(data: any): string {
  const { generateContractorHash } = require('../hooks/useHashGenerator');
  return generateContractorHash({
    email: data.email || '',
    phone: data.phone || '',
    country: data.country || 'CA',
    provinceState: data.provinceState || 'ON',
  });
}

/**
 * Generate PMC ID using standard hash format
 */
function generatePMCId(data: any): string {
  const { generatePMCHash } = require('../hooks/useHashGenerator');
  return generatePMCHash({
    email: data.email || '',
    companyName: data.companyName || '',
    country: data.country || 'CA',
    provinceState: data.provinceState || 'ON',
  });
}

/**
 * Create a vendor from invitation acceptance
 */
export async function createVendorFromInvitation(
  prisma: any,
  formData: any,
  invitation: any
) {
  const roleConfig = getRoleConfig('vendor');
  if (!roleConfig) {
    throw new Error('Invalid role configuration for vendor');
  }

  const vendorId = generateVendorId({
    email: invitation.email,
    phone: formData.phone || '',
    country: formData.country || 'CA',
    provinceState: formData.provinceState || 'ON',
  });

  // Determine if this is a global vendor (invited by admin) or local (invited by landlord)
  const isGlobal = invitation.invitedByRole === 'admin';
  
  const vendor = await prisma.vendor.create({
    data: {
      id: generateCUID(),
      vendorId,
      name: formData.contactName || formData.companyName,
      businessName: formData.companyName || null,
      email: invitation.email,
      phone: formData.phone || '',
      category: formData.services || formData.category || 'General',
      addressLine1: formData.addressLine1 || null,
      addressLine2: formData.addressLine2 || null,
      city: formData.city || null,
      provinceState: formData.provinceState || null,
      postalZip: formData.postalZip || null,
      country: formData.country || 'CA',
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      isGlobal,
      invitedBy: invitation.invitedBy,
      invitedByRole: invitation.invitedByRole,
      isActive: true,
      updatedAt: new Date(),
    },
  });
  
  // If invited by landlord (local vendor), create relationship
  if (!isGlobal && invitation.invitedByRole === 'landlord') {
    await prisma.landlordVendor.create({
      data: {
        id: generateCUID(),
        landlordId: invitation.invitedBy,
        vendorId: vendor.id,
        addedBy: invitation.invitedBy,
        addedAt: new Date(),
      },
    });
  }

  // Link invitation to vendor
  await prisma.invitation.update({
    where: { id: invitation.id },
    data: {
      vendorId: vendor.id,
      status: 'completed',
      completedAt: new Date(),
    },
  });

  return vendor;
}

/**
 * Create a contractor from invitation acceptance
 */
export async function createContractorFromInvitation(
  prisma: any,
  formData: any,
  invitation: any
) {
  const roleConfig = getRoleConfig('contractor');
  if (!roleConfig) {
    throw new Error('Invalid role configuration for contractor');
  }

  const contractorId = generateContractorId({
    email: invitation.email,
    phone: formData.phone || '',
    country: formData.country || 'CA',
    provinceState: formData.provinceState || 'ON',
  });

  // Handle specialties - can be array or comma-separated string
  let specialties: string[] = [];
  if (formData.specialties) {
    if (Array.isArray(formData.specialties)) {
      specialties = formData.specialties;
    } else if (typeof formData.specialties === 'string') {
      specialties = formData.specialties.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  }

  // Determine if this is a global contractor (invited by admin) or local (invited by landlord)
  const isGlobal = invitation.invitedByRole === 'admin';
  
  const contractor = await prisma.contractor.create({
    data: {
      id: generateCUID(),
      contractorId,
      companyName: formData.companyName,
      licenseNumber: formData.licenseNumber || null,
      contactName: formData.contactName,
      email: invitation.email,
      phone: formData.phone || '',
      specialties,
      addressLine1: formData.addressLine1 || null,
      addressLine2: formData.addressLine2 || null,
      city: formData.city || null,
      provinceState: formData.provinceState || null,
      postalZip: formData.postalZip || null,
      country: formData.country || 'CA',
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      isGlobal,
      invitedBy: invitation.invitedBy,
      invitedByRole: invitation.invitedByRole,
      isActive: true,
      updatedAt: new Date(),
    },
  });
  
  // If invited by landlord (local contractor), create relationship
  if (!isGlobal && invitation.invitedByRole === 'landlord') {
    await prisma.landlordContractor.create({
      data: {
        id: generateCUID(),
        landlordId: invitation.invitedBy,
        contractorId: contractor.id,
        addedBy: invitation.invitedBy,
        addedAt: new Date(),
      },
    });
  }

  // Link invitation to contractor
  await prisma.invitation.update({
    where: { id: invitation.id },
    data: {
      contractorId: contractor.id,
      status: 'completed',
      completedAt: new Date(),
    },
  });

  return contractor;
}

/**
 * Create a PMC from invitation acceptance
 */
export async function createPMCFromInvitation(
  prisma: any,
  formData: any,
  invitation: any
) {
  const roleConfig = getRoleConfig('pmc');
  if (!roleConfig) {
    throw new Error('Invalid role configuration for PMC');
  }

  // Map country/provinceState to FKs
  const { mapCountryRegionToFKs } = require('../utils/country-region-mapper');
  const { countryCode: finalCountryCode, regionCode: finalRegionCode } = await mapCountryRegionToFKs(
    formData.country || 'CA',
    formData.provinceState || 'ON',
    null, // countryCode not provided
    null  // regionCode not provided
  );

  const companyId = generatePMCId({
    email: invitation.email,
    companyName: formData.companyName || '',
    country: formData.country || 'CA',
    provinceState: formData.provinceState || 'ON',
  });

  // Create PMC with PENDING approval status and FK tracking
  const pmcData: any = {
    id: generateCUID(),
    companyId,
    companyName: formData.companyName,
    email: invitation.email,
    phone: formData.phone || null,
    addressLine1: formData.addressLine1 || null,
    addressLine2: formData.addressLine2 || null,
    city: formData.city || null,
    provinceState: formData.provinceState || null, // Legacy
    postalZip: formData.postalZip || null,
    country: formData.country || 'CA', // Legacy
    countryCode: finalCountryCode || null, // New FK
    regionCode: finalRegionCode || null, // New FK
    defaultCommissionRate: formData.defaultCommissionRate
      ? parseFloat(formData.defaultCommissionRate) / 100
      : null,
    approvalStatus: 'PENDING', // Requires admin approval
    invitedBy: invitation.invitedBy,
    invitedAt: invitation.createdAt,
    isActive: true,
    updatedAt: new Date(),
  };
  
  // Populate FK based on inviter role
  if (invitation.invitedByRole === 'admin' && invitation.invitedByAdminId) {
    pmcData.invitedBy = invitation.invitedByAdminId;
  }

  const pmc = await prisma.propertyManagementCompany.create({
    data: pmcData,
  });

  // Link invitation to PMC
  await prisma.invitation.update({
    where: { id: invitation.id },
    data: {
      pmcId: pmc.id,
      status: 'completed',
      completedAt: new Date(),
    },
  });

  return pmc;
}

/**
 * Generic function to create user from invitation based on type
 */
export async function createUserFromInvitation(
  prisma: any,
  formData: any,
  invitation: any
) {
  const { type } = invitation;

  switch (type) {
    case 'landlord':
      return await createLandlordFromInvitation(prisma, formData, invitation);
    case 'tenant':
      return await createTenantFromInvitation(prisma, formData, invitation);
    case 'vendor':
      return await createVendorFromInvitation(prisma, formData, invitation);
    case 'contractor':
      return await createContractorFromInvitation(prisma, formData, invitation);
    case 'pmc':
      return await createPMCFromInvitation(prisma, formData, invitation);
    default:
      throw new Error(`Unsupported invitation type: ${type}`);
  }
}

