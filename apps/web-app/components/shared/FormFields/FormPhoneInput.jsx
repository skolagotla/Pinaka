"use client";

import React from 'react';
import { TextInput, Label } from 'flowbite-react';

/**
 * FormPhoneInput Component (Flowbite Version)
 * 
 * A standardized phone input component for forms
 */
export default function FormPhoneInput({
  name,
  label,
  placeholder = "(555) 123-4567",
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
        type="tel"
        placeholder={placeholder}
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
