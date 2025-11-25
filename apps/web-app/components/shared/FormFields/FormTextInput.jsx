"use client";

import React, { useMemo } from 'react';
import { TextInput, Label } from 'flowbite-react';
import { generateAriaId } from '@/lib/utils/a11y';

/**
 * FormTextInput Component (Flowbite Version)
 * WCAG 2.2 AA: Properly labeled inputs with error associations
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
  const errorId = useMemo(() => generateAriaId('error'), []);
  const describedBy = error ? errorId : undefined;

  return (
    <div>
      {label && (
        <Label htmlFor={name} className="mb-2 block text-gray-700 dark:text-gray-300">
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
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
        aria-invalid={!!error}
        aria-required={required}
        aria-describedby={describedBy}
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        {...props}
      />
      {error && (
        <div id={errorId} role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
