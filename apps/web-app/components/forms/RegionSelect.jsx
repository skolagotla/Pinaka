"use client";
import { Select } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
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
  style,
  ...restProps 
}) {
  const options = getRegionOptions(country);
  const label = getRegionLabel(country);

  if (!country || (country !== 'CA' && country !== 'US')) {
    return (
      <Select
        {...restProps}
        value={value}
        onChange={onChange}
        placeholder="Select country first"
        disabled
        style={{ width: '100%', ...style }}
      />
    );
  }

  return (
    <Select
      {...restProps}
      value={value}
      onChange={onChange}
      placeholder={`Select ${label}`}
      options={options}
      showSearch
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
      style={{ width: '100%', ...style }}
    />
  );
}

