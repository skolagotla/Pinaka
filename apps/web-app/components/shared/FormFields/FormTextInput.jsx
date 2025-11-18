"use client";

/**
 * FormTextInput Component
 * 
 * Standardized text input for forms with consistent validation patterns.
 * 
 * @param {Object} props
 * @param {string} props.name - Form field name
 * @param {string} props.label - Field label
 * @param {Array} props.rules - Validation rules
 * @param {boolean} props.required - Required field (default: false)
 * @param {string} props.type - Input type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.maxLength - Maximum length
 * @param {boolean} props.allowClear - Allow clearing input (default: true)
 * @param {object} props.style - Custom styles
 * @param {function} props.onChange - Custom onChange handler
 * @param {any} props.initialValue - Initial value
 * @param {boolean} props.textArea - Render as TextArea (default: false)
 * @param {number} props.rows - Number of rows for TextArea (default: 4)
 * 
 * @example
 * <FormTextInput
 *   name="email"
 *   label="Email"
 *   type="email"
 *   required
 * />
 */

import React from 'react';
import { Form, Input } from 'antd';

const { TextArea } = Input;

export default function FormTextInput({
  name,
  label,
  rules = [],
  required = false,
  type = 'text',
  placeholder,
  maxLength,
  allowClear = true,
  style = { width: '100%' },
  onChange,
  initialValue,
  textArea = false,
  rows = 4,
  ...props
}) {
  // Build default rules based on type
  const defaultRules = [];
  
  if (required) {
    defaultRules.push({ required: true, message: `Please enter ${label || name}` });
  }

  if (type === 'email') {
    defaultRules.push({ type: 'email', message: 'Please enter a valid email address' });
  }

  if (type === 'url') {
    defaultRules.push({ type: 'url', message: 'Please enter a valid URL' });
  }

  if (maxLength) {
    defaultRules.push({ max: maxLength, message: `Maximum ${maxLength} characters` });
  }

  const finalRules = [...defaultRules, ...rules];

  const InputComponent = textArea ? TextArea : Input;

  return (
    <Form.Item
      name={name}
      label={label}
      rules={finalRules}
      initialValue={initialValue}
    >
      <InputComponent
        type={type}
        placeholder={placeholder || `Enter ${label || name}`}
        allowClear={allowClear}
        maxLength={maxLength}
        style={style}
        onChange={onChange}
        rows={textArea ? rows : undefined}
        {...props}
      />
    </Form.Item>
  );
}

