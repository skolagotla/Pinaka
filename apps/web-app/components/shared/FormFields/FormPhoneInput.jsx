"use client";

/**
 * FormPhoneInput Component
 * 
 * Standardized phone number input for forms with auto-formatting.
 * 
 * @param {Object} props
 * @param {string} props.name - Form field name
 * @param {string} props.label - Field label
 * @param {Array} props.rules - Validation rules
 * @param {boolean} props.required - Required field (default: false)
 * @param {string} props.placeholder - Placeholder text
 * @param {object} props.style - Custom styles
 * @param {function} props.onChange - Custom onChange handler
 * @param {any} props.initialValue - Initial value
 * 
 * @example
 * <FormPhoneInput
 *   name="phone"
 *   label="Phone Number"
 *   required
 * />
 */

import React from 'react';
import { Form } from 'antd';
import PhoneNumberInput from '@/components/forms/PhoneNumberInput';

export default function FormPhoneInput({
  name,
  label,
  rules = [],
  required = false,
  placeholder = 'Enter phone number',
  style = { width: '100%' },
  onChange,
  initialValue,
  ...props
}) {
  const finalRules = required
    ? [{ required: true, message: `Please enter ${label || name}` }, ...rules]
    : rules;

  return (
    <Form.Item
      name={name}
      label={label}
      rules={finalRules}
      initialValue={initialValue}
      getValueFromEvent={(e) => e?.target?.value || e}
    >
      <PhoneNumberInput
        placeholder={placeholder}
        style={style}
        onChange={onChange}
        {...props}
      />
    </Form.Item>
  );
}

