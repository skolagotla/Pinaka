"use client";
import { Select } from 'flowbite-react';
import { HiLocationMarker } from 'react-icons/hi';
import { getRegionOptions, getRegionLabel } from '@/lib/constants/regions';

/**
 * RegionSelect Component
 * 
 * Automatically displays Province (CA) or State (US) based on country
 * 
 * Props:
 * - value: Current region code (e.g., 'ON', 'CA')
 * - onChange: Callback when value changes
 * - country: 'US' or 'CA' (required)
 * - All other Select props are passed through
 * 
 * Usage:
 * <RegionSelect
 *   value={province}
 *   onChange={setProvince}
 *   country="CA"
 *   required
 * />
 */
export default function RegionSelect({ 
  value, 
  onChange, 
  country,
  className = '',
  ...restProps 
}) {
  const options = getRegionOptions(country);
  const label = getRegionLabel(country);

  if (!country || (country !== 'CA' && country !== 'US')) {
    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <HiLocationMarker className="h-5 w-5 text-gray-400" />
        </div>
        <Select
          {...restProps}
          value={value || ''}
          onChange={onChange}
          disabled
          className={`pl-10 ${className}`}
        >
          <option value="">Select country first</option>
        </Select>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
        <HiLocationMarker className="h-5 w-5 text-gray-400" />
      </div>
      <Select
        {...restProps}
        value={value || ''}
        onChange={onChange}
        className={`pl-10 ${className}`}
      >
        <option value="">Select {label}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
