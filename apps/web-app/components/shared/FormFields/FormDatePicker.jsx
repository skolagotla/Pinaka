"use client";

/**
 * FormDatePicker Component
 * 
 * Standardized date picker for forms with consistent formatting and validation.
 * 
 * @param {Object} props
 * @param {string} props.name - Form field name
 * @param {string} props.label - Field label
 * @param {Array} props.rules - Validation rules
 * @param {boolean} props.showTime - Show time picker (default: false)
 * @param {string} props.format - Date format (default: 'YYYY-MM-DD')
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Required field (default: false)
 * @param {object} props.style - Custom styles
 * @param {function} props.onChange - Custom onChange handler
 * @param {any} props.initialValue - Initial value
 * 
 * @example
 * <FormDatePicker
 *   name="dueDate"
 *   label="Due Date"
 *   required
 *   showTime
 * />
 */

import React from 'react';
import { Form, DatePicker } from 'antd';
import dayjs from 'dayjs';

export default function FormDatePicker({
  name,
  label,
  rules = [],
  showTime = false,
  format = 'YYYY-MM-DD',
  placeholder,
  required = false,
  style = { width: '100%' },
  onChange,
  initialValue,
  ...props
}) {
  const finalRules = required
    ? [{ required: true, message: `Please select ${label || name}` }, ...rules]
    : rules;

  return (
    <Form.Item
      name={name}
      label={label}
      rules={finalRules}
      initialValue={initialValue ? dayjs(initialValue) : undefined}
    >
      <DatePicker
        showTime={showTime}
        format={format}
        placeholder={placeholder || `Select ${label || name}`}
        style={style}
        onChange={onChange}
        {...props}
      />
    </Form.Item>
  );
}

