/**
 * Property Field Mapper
 * 
 * Simplifies change tracking by using a field mapping schema
 * instead of 40+ individual if statements.
 */

export interface FieldMapping {
  fieldName: string; // Database field name
  displayName: string; // Human-readable name
  formatter?: (value: any) => string; // Optional formatter function
  comparator?: (oldValue: any, newValue: any) => boolean; // Custom comparison
}

export interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
}

/**
 * Field mapping schema for property updates
 */
export const PROPERTY_FIELD_MAP: Record<string, FieldMapping> = {
  propertyName: {
    fieldName: 'propertyName',
    displayName: 'Property Name',
  },
  addressLine1: {
    fieldName: 'addressLine1',
    displayName: 'Address',
  },
  city: {
    fieldName: 'city',
    displayName: 'City',
  },
  postalZip: {
    fieldName: 'postalZip',
    displayName: 'Postal/ZIP Code',
  },
  provinceState: {
    fieldName: 'provinceState',
    displayName: 'Province/State',
  },
  country: {
    fieldName: 'country',
    displayName: 'Country',
  },
  countryCode: {
    fieldName: 'countryCode',
    displayName: 'Country Code',
  },
  regionCode: {
    fieldName: 'regionCode',
    displayName: 'Region Code',
  },
  propertyType: {
    fieldName: 'propertyType',
    displayName: 'Property Type',
  },
  unitCount: {
    fieldName: 'unitCount',
    displayName: 'Unit Count',
    formatter: (val: any) => val?.toString() || '0',
  },
  yearBuilt: {
    fieldName: 'yearBuilt',
    displayName: 'Year Built',
    formatter: (val: any) => val?.toString() || '(empty)',
  },
  purchasePrice: {
    fieldName: 'purchasePrice',
    displayName: 'Purchase Price',
    formatter: (val: any) => val ? `$${Number(val).toLocaleString()}` : '(empty)',
  },
  mortgageAmount: {
    fieldName: 'mortgageAmount',
    displayName: 'Mortgage Amount',
    formatter: (val: any) => val ? `$${Number(val).toLocaleString()}` : '(empty)',
  },
  interestRate: {
    fieldName: 'interestRate',
    displayName: 'Interest Rate',
    formatter: (val: any) => val ? `${val}%` : '(empty)',
  },
  mortgageTermYears: {
    fieldName: 'mortgageTermYears',
    displayName: 'Mortgage Term',
    formatter: (val: any) => val ? `${val} years` : '(empty)',
  },
  mortgageStartDate: {
    fieldName: 'mortgageStartDate',
    displayName: 'Mortgage Start Date',
    formatter: (val: any) => {
      if (!val) return '(empty)';
      const date = new Date(val);
      return date.toISOString().split('T')[0];
    },
    comparator: (oldVal: any, newVal: any) => {
      if (!oldVal && !newVal) return true;
      if (!oldVal || !newVal) return false;
      const oldDate = new Date(oldVal).toISOString().split('T')[0];
      const newDate = new Date(newVal).toISOString().split('T')[0];
      return oldDate === newDate;
    },
  },
  paymentFrequency: {
    fieldName: 'paymentFrequency',
    displayName: 'Payment Frequency',
  },
  squareFootage: {
    fieldName: 'squareFootage',
    displayName: 'Square Footage',
    formatter: (val: any) => val ? `${Number(val).toLocaleString()} sq ft` : '(empty)',
  },
  rented: {
    fieldName: 'rented',
    displayName: 'Rented Status',
  },
  propertyDescription: {
    fieldName: 'propertyDescription',
    displayName: 'Property Description',
  },
  propertyTaxes: {
    fieldName: 'propertyTaxes',
    displayName: 'Property Taxes',
    formatter: (val: any) => val ? `$${Number(val).toLocaleString()}` : '(empty)',
  },
  rent: {
    fieldName: 'rent',
    displayName: 'Rent',
    formatter: (val: any) => val ? `$${Number(val).toLocaleString()}` : '(empty)',
  },
  depositAmount: {
    fieldName: 'depositAmount',
    displayName: 'Deposit Amount',
    formatter: (val: any) => val ? `$${Number(val).toLocaleString()}` : '(empty)',
  },
};

/**
 * Compare property fields and generate change tracking data
 */
export function diffPropertyFields(
  existing: any,
  incoming: any,
  fieldMap: Record<string, FieldMapping> = PROPERTY_FIELD_MAP
): {
  changedFields: string[];
  fieldChanges: FieldChange[];
  updateData: Record<string, any>;
} {
  const changedFields: string[] = [];
  const fieldChanges: FieldChange[] = [];
  const updateData: Record<string, any> = {};

  for (const [key, mapping] of Object.entries(fieldMap)) {
    const incomingValue = incoming[key];
    
    // Skip if field not provided
    if (incomingValue === undefined) {
      continue;
    }

    const existingValue = existing[mapping.fieldName];
    
    // Use custom comparator if provided, otherwise use default comparison
    const hasChanged = mapping.comparator
      ? !mapping.comparator(existingValue, incomingValue)
      : existingValue !== incomingValue;

    if (hasChanged) {
      changedFields.push(mapping.displayName);
      
      // Format values for display
      const formatValue = (val: any) => {
        if (mapping.formatter) {
          return mapping.formatter(val);
        }
        return val !== null && val !== undefined && val !== '' ? String(val) : '(empty)';
      };

      fieldChanges.push({
        field: mapping.displayName,
        oldValue: formatValue(existingValue),
        newValue: formatValue(incomingValue),
      });

      // Add to update data (use null for empty strings)
      updateData[mapping.fieldName] = incomingValue === '' ? null : incomingValue;
    }
  }

  return { changedFields, fieldChanges, updateData };
}

