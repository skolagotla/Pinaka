/**
 * ═══════════════════════════════════════════════════════════════
 * ADDRESS FORM HELPERS - Standardized Address Input Pattern
 * ═══════════════════════════════════════════════════════════════
 * 
 * This module provides standardized helpers for address input forms
 * using Geoapify API autocomplete. Use these helpers to ensure consistency
 * across all forms that require address input.
 * 
 * Usage:
 * ```jsx
 * import { createAddressAutocompleteProps } from '@/lib/utils/address-form-helpers';
 * 
 * <AddressAutocomplete
 *   {...createAddressAutocompleteProps({
 *     form,
 *     country,
 *     setCountry,
 *     countryRegion,
 *     fieldName: 'addressLine1', // or 'currentAddress'
 *   })}
 * />
 * ```
 */

/**
 * Creates standardized props for AddressAutocomplete component
 * 
 * @param {Object} options
 * @param {Object} options.form - Ant Design Form instance
 * @param {string} options.country - Current country code ('CA' or 'US')
 * @param {Function} options.setCountry - Function to update country state
 * @param {Object} options.countryRegion - useCountryRegion hook instance (optional)
 * @param {string} options.fieldName - Field name in form ('addressLine1' or 'currentAddress')
 * @param {string} options.placeholder - Custom placeholder (optional)
 * @param {string} options.size - Input size ('large', 'middle', 'small') (optional)
 * @returns {Object} Props object for AddressAutocomplete
 */
export function createAddressAutocompleteProps({
  form,
  country,
  setCountry,
  countryRegion = null,
  fieldName = 'addressLine1',
  placeholder = 'Type an address (e.g., 123 Main St, Toronto)',
  size = undefined,
}) {
  // Determine country filter for Geoapify API
  const countryFilter = country === 'CA' ? 'CA,US' : country === 'US' ? 'CA,US' : 'CA,US';

  return {
    placeholder,
    country: countryFilter,
    size,
    onSelect: (addressData) => {
      const countryCode = addressData.country;
      
      // Determine which field to update based on fieldName
      const addressField = fieldName === 'currentAddress' 
        ? { currentAddress: addressData.addressLine1 || addressData.formattedAddress?.split(',')[0] || '' }
        : { addressLine1: addressData.addressLine1 };

      // Update form fields
      const formUpdates = {
        ...addressField,
        city: addressData.city,
        provinceState: addressData.provinceState,
        postalZip: addressData.postalZip,
        country: countryCode,
      };

      // Update country state and region if country changes
      if (countryCode === 'CA' || countryCode === 'US') {
        if (setCountry) {
          setCountry(countryCode);
        }
        if (countryRegion && countryRegion.setCountry) {
          countryRegion.setCountry(countryCode);
        }
        
        // Use setTimeout to ensure country change propagates before setting form values
        setTimeout(() => {
          form.setFieldsValue(formUpdates);
        }, 50);
      } else {
        // For other countries, update immediately
        form.setFieldsValue(formUpdates);
      }
    },
  };
}

/**
 * Creates standardized Form.Item props for address input fields
 * 
 * @param {Object} options
 * @param {string} options.fieldName - Field name ('addressLine1' or 'currentAddress')
 * @param {string} options.label - Field label (optional, defaults based on fieldName)
 * @param {boolean} options.required - Whether field is required (default: true)
 * @param {string} options.tooltip - Tooltip text (optional)
 * @returns {Object} Props object for Form.Item
 */
export function createAddressFormItemProps({
  fieldName = 'addressLine1',
  label = null,
  required = true,
  tooltip = 'Start typing an address to see autocomplete suggestions',
}) {
  const defaultLabel = fieldName === 'currentAddress' ? 'Current Address' : 'Address Line 1';
  
  return {
    name: fieldName,
    label: label || defaultLabel,
    rules: required ? [{ required: true, message: `Please enter ${defaultLabel.toLowerCase()}` }] : [],
    tooltip,
  };
}

/**
 * Standardized address autocomplete component wrapper
 * Use this for consistent address input across all forms
 * 
 * @param {Object} props
 * @param {Object} props.form - Ant Design Form instance
 * @param {string} props.country - Current country code
 * @param {Function} props.setCountry - Function to update country
 * @param {Object} props.countryRegion - useCountryRegion hook instance
 * @param {string} props.fieldName - Field name ('addressLine1' or 'currentAddress')
 * @param {string} props.placeholder - Custom placeholder
 * @param {string} props.size - Input size
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.label - Custom label
 * @param {string} props.tooltip - Custom tooltip
 * @returns {JSX.Element} Form.Item with AddressAutocomplete
 */
export function StandardAddressInput({
  form,
  country,
  setCountry,
  countryRegion = null,
  fieldName = 'addressLine1',
  placeholder = 'Type an address (e.g., 123 Main St, Toronto)',
  size = undefined,
  required = true,
  label = null,
  tooltip = 'Start typing an address to see autocomplete suggestions',
}) {
  const { Form } = require('antd');
  const { AddressAutocomplete } = require('../../components/forms');
  
  const formItemProps = createAddressFormItemProps({
    fieldName,
    label,
    required,
    tooltip,
  });
  
  const autocompleteProps = createAddressAutocompleteProps({
    form,
    country,
    setCountry,
    countryRegion,
    fieldName,
    placeholder,
    size,
  });

  return (
    <Form.Item {...formItemProps}>
      <AddressAutocomplete {...autocompleteProps} />
    </Form.Item>
  );
}

/**
 * Standardized pattern for address form fields
 * Returns an object with all address-related form items
 * 
 * @param {Object} options
 * @param {Object} options.form - Ant Design Form instance
 * @param {string} options.country - Current country code
 * @param {Function} options.setCountry - Function to update country
 * @param {Object} options.countryRegion - useCountryRegion hook instance
 * @param {string} options.fieldName - Primary address field name ('addressLine1' or 'currentAddress')
 * @param {boolean} options.includeAddressLine2 - Whether to include address line 2 (default: true for addressLine1, false for currentAddress)
 * @returns {Object} Object with address form components
 */
export function createAddressFormFields({
  form,
  country,
  setCountry,
  countryRegion = null,
  fieldName = 'addressLine1',
  includeAddressLine2 = fieldName === 'addressLine1',
}) {
  const { Form, Input, Row, Col } = require('antd');
  const { HomeOutlined } = require('@ant-design/icons');
  const { AddressAutocomplete } = require('../../components/forms');
  
  const autocompleteProps = createAddressAutocompleteProps({
    form,
    country,
    setCountry,
    countryRegion,
    fieldName,
  });

  const formItemProps = createAddressFormItemProps({
    fieldName,
    required: true,
  });

  return {
    addressLine1: (
      <Form.Item {...formItemProps}>
        <AddressAutocomplete {...autocompleteProps} />
      </Form.Item>
    ),
    addressLine2: includeAddressLine2 ? (
      <Form.Item
        name="addressLine2"
        label="Address Line 2"
      >
        <Input prefix={<HomeOutlined />} placeholder="Apartment, suite, etc." />
      </Form.Item>
    ) : null,
  };
}

