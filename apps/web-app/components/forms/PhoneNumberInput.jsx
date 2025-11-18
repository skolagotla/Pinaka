"use client";
import { Input } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import { usePhoneInput } from '@/lib/hooks/useRegionalInput';

/**
 * PhoneNumberInput Component
 * 
 * Automatically formats phone numbers as (XXX) XXX-XXXX for US/CA
 * Uses the usePhoneInput hook for optimized formatting and validation
 * 
 * Props:
 * - value: Current phone number value
 * - onChange: Callback when value changes (receives formatted value)
 * - country: 'US' or 'CA' (defaults to 'CA')
 * - All other Input props are passed through
 * 
 * Usage:
 * <PhoneNumberInput
 *   value={phone}
 *   onChange={(e) => setPhone(e.target.value)}
 *   country="CA"
 *   required
 * />
 */
export default function PhoneNumberInput({ 
  value, 
  onChange, 
  country = 'CA',
  ...restProps 
}) {
  // Use the optimized hook for phone input handling
  let inputProps;
  try {
    inputProps = usePhoneInput(value, onChange, country);
  } catch (error) {
    console.error('[PhoneNumberInput] Error in usePhoneInput:', error);
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
        prefix={<PhoneOutlined />}
      />
    );
  } catch (error) {
    console.error('[PhoneNumberInput] Error rendering Input:', error);
    // Fallback to basic input
    return <Input {...restProps} value={value || ''} prefix={<PhoneOutlined />} />;
  }
}

