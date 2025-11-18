/**
 * Form Data Populator
 * Populates form data based on form type and related entities
 */

export async function populateFormData(
  formType: string,
  context: {
    tenant?: any;
    lease?: any;
    property?: any;
    unit?: any;
    customData?: Record<string, any>;
    user?: any;
  }
): Promise<Record<string, any>> {
  const { tenant, lease, property, unit, customData = {}, user } = context;

  // Base form data structure
  const formData: Record<string, any> = {
    ...customData,
  };

  // Common fields for all forms
  if (tenant) {
    formData.tenantName = `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim();
    formData.tenantEmail = tenant.email || '';
    formData.tenantPhone = tenant.phone || '';
  }

  if (property) {
    formData.propertyAddress = property.addressLine1 || '';
    formData.propertyCity = property.city || '';
    formData.propertyProvince = property.provinceState || '';
    formData.propertyPostalCode = property.postalZip || '';
  }

  if (unit) {
    formData.unitNumber = unit.unitNumber || '';
  }

  if (lease) {
    formData.leaseStartDate = lease.startDate || '';
    formData.leaseEndDate = lease.endDate || '';
    formData.monthlyRent = lease.monthlyRent || '';
  }

  // Form-specific data
  switch (formType) {
    case 'N4':
      // N4 Notice of Termination for Non-Payment of Rent
      formData.landlordName = user?.userName || '';
      formData.rentalAddress = property?.addressLine1 || '';
      formData.amountOwing = lease?.monthlyRent || 0;
      formData.rentPeriodFrom = lease?.startDate || '';
      formData.rentPeriodTo = lease?.endDate || '';
      break;

    case 'N5':
      // N5 Notice to End your Tenancy Early
      formData.landlordName = user?.userName || '';
      formData.tenantName = tenant ? `${tenant.firstName} ${tenant.lastName}` : '';
      break;

    case 'N8':
      // N8 Notice to End your Tenancy at the End of the Term
      formData.landlordName = user?.userName || '';
      formData.tenantName = tenant ? `${tenant.firstName} ${tenant.lastName}` : '';
      formData.terminationDate = lease?.endDate || '';
      break;

    default:
      // Generic form - just use common fields
      break;
  }

  return formData;
}

