"use client";

import React from 'react';
import { TextInput, Label } from 'flowbite-react';

/**
 * FormDatePicker Component (Flowbite Version)
 * 
 * A standardized date picker component for forms
 * Note: Flowbite doesn't have a native date picker, using TextInput with type="date"
 */
export default function FormDatePicker({
  name,
  label,
  required = false,
  error,
  value,
  onChange,
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
      <TextInput
        id={name}
        name={name}
        type="date"
        value={value}
        onChange={onChange}
        disabled={disabled}
        color={error ? "failure" : "gray"}
        helperText={error}
        {...props}
      />
    </div>
  );
}
