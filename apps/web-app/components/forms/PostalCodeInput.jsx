"use client";
import { TextInput } from 'flowbite-react';
import { HiLocationMarker } from 'react-icons/hi';
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
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <HiLocationMarker className="h-5 w-5 text-gray-400" />
        </div>
        <TextInput
          {...restProps}
          type="text"
          value={value || ''}
          {...safeInputProps}
          className="pl-10"
        />
      </div>
    );
  } catch (error) {
    console.error('[PostalCodeInput] Error rendering TextInput:', error);
    // Fallback to basic input
    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <HiLocationMarker className="h-5 w-5 text-gray-400" />
        </div>
        <TextInput {...restProps} type="text" value={value || ''} className="pl-10" />
      </div>
    );
  }
}
