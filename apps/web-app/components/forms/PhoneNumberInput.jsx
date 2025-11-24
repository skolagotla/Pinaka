"use client";
import { TextInput } from 'flowbite-react';
import { HiPhone } from 'react-icons/hi';
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
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <HiPhone className="h-5 w-5 text-gray-400" />
        </div>
        <TextInput
          {...restProps}
          type="tel"
          value={value || ''}
          {...safeInputProps}
          className="pl-10"
        />
      </div>
    );
  } catch (error) {
    console.error('[PhoneNumberInput] Error rendering TextInput:', error);
    // Fallback to basic input
    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <HiPhone className="h-5 w-5 text-gray-400" />
        </div>
        <TextInput {...restProps} type="tel" value={value || ''} className="pl-10" />
      </div>
    );
  }
}
