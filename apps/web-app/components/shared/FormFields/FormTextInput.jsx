"use client";

import React from 'react';
import { TextInput, Label } from 'flowbite-react';

/**
 * FormTextInput Component (Flowbite Version)
 * 
 * A standardized text input component for forms
 */
export default function FormTextInput({
  name,
  label,
  placeholder,
  required = false,
  error,
  value,
  onChange,
  type = "text",
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
        type={type}
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
