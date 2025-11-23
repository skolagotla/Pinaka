"use client";

import React from 'react';
import { Select, Label } from 'flowbite-react';

/**
 * FormSelect Component (Flowbite Version)
 * 
 * A standardized select component for forms
 */
export default function FormSelect({
  name,
  label,
  placeholder,
  required = false,
  error,
  value,
  onChange,
  options = [],
  disabled = false,
  ...props
}) {
  return (
    <div>
      {label && (
        <Label htmlFor={name} className="mb-2 block">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
