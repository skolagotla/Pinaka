"use client";
import { Input } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { usePostalCodeInput } from '@/lib/hooks/useRegionalInput';

/**
 * PostalCodeInput Component
 * 
 * Automatically formats based on country:
 * - CA: XXX XXX (e.g., M5H 2N2)
 * - US: XXXXX or XXXXX-XXXX
 * 
 * Uses the usePostalCodeInput hook for optimized formatting and validation
 * 
 * Props:
 * - value: Current postal/zip code value
 * - onChange: Callback when value changes (receives formatted value)
 * - country: 'US' or 'CA' (required)
 * - All other Input props are passed through
 * 
 * Usage:
 * <PostalCodeInput
 *   value={postalCode}
 *   onChange={(e) => setPostalCode(e.target.value)}
 *   country="CA"
 *   required
 * />
 */
export default function PostalCodeInput({ 
  value, 
  onChange, 
  country,
  ...restProps 
}) {
  // Use the optimized hook for postal code input handling
  let inputProps;
  try {
    inputProps = usePostalCodeInput(value, onChange, country);
  } catch (error) {
    console.error('[PostalCodeInput] Error in usePostalCodeInput:', error);
    inputProps = {};
  }

  // Ensure inputProps is always an object
  const safeInputProps = inputProps || {};

  // Ensure we always return a valid React element
  try {
    return (
      <Input
        {...restProps}
        value={value || ''}
        {...safeInputProps}
        prefix={<EnvironmentOutlined />}
      />
    );
  } catch (error) {
    console.error('[PostalCodeInput] Error rendering Input:', error);
    // Fallback to basic input
    return <Input {...restProps} value={value || ''} prefix={<EnvironmentOutlined />} />;
  }
}

