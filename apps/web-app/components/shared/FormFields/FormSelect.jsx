"use client";

/**
 * FormSelect Component
 * 
 * Standardized select dropdown for forms with consistent patterns.
 * 
 * @param {Object} props
 * @param {string} props.name - Form field name
 * @param {string} props.label - Field label
 * @param {Array} props.options - Select options: [{label: string, value: any}]
 * @param {Array} props.rules - Validation rules
 * @param {boolean} props.required - Required field (default: false)
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.allowClear - Allow clearing selection (default: true)
 * @param {string} props.mode - Select mode: 'multiple' | 'tags' (default: undefined)
 * @param {object} props.style - Custom styles
 * @param {function} props.onChange - Custom onChange handler
 * @param {any} props.initialValue - Initial value
 * 
 * @example
 * <FormSelect
 *   name="status"
 *   label="Status"
 *   required
 *   options={[
 *     { label: 'Active', value: 'active' },
 *     { label: 'Inactive', value: 'inactive' }
 *   ]}
 * />
 */

import React from 'react';
import { Form, Select } from 'antd';

export default function FormSelect({
  name,
  label,
  options = [],
  rules = [],
  required = false,
  placeholder,
  allowClear = true,
  mode,
  style = { width: '100%' },
  onChange,
  initialValue,
  ...props
}) {
  const finalRules = required
    ? [{ required: true, message: `Please select ${label || name}` }, ...rules]
    : rules;

  // Ensure options is always an array
  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <Form.Item
      name={name}
      label={label}
      rules={finalRules}
      initialValue={initialValue}
    >
      <Select
        placeholder={placeholder || `Select ${label || name}`}
        allowClear={allowClear}
        mode={mode}
        style={style}
        onChange={onChange}
        {...props}
      >
        {safeOptions.map(option => {
          if (!option || typeof option !== 'object') {
            return null;
          }
          return (
            <Select.Option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </Select.Option>
          );
        })}
      </Select>
    </Form.Item>
  );
}

