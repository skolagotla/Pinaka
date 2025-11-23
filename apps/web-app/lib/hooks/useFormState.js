"use client";

import { useState, useCallback } from 'react';

/**
 * useFormState Hook
 * 
 * A simple form state management hook to replace Ant Design's Form.useForm()
 * Provides similar API for easier migration
 * 
 * @param {Object} initialValues - Initial form values
 * @returns {Object} Form state and control functions
 */
export function useFormState(initialValues = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const setFieldsValue = useCallback((newValues) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  const resetFields = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const getFieldsValue = useCallback((nameList) => {
    if (nameList) {
      if (Array.isArray(nameList)) {
        return nameList.reduce((acc, name) => {
          acc[name] = values[name];
          return acc;
        }, {});
      }
      return values[nameList];
    }
    return values;
  }, [values]);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const clearFieldError = useCallback((name) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const validateFields = useCallback(async () => {
    // Basic validation - can be extended
    return new Promise((resolve, reject) => {
      if (Object.keys(errors).length > 0) {
        reject({ errorFields: Object.keys(errors).map(name => ({ name, errors: [errors[name]] })) });
      } else {
        resolve(values);
      }
    });
  }, [values, errors]);

  return {
    values,
    errors,
    setFieldsValue,
    resetFields,
    getFieldsValue,
    setFieldError,
    clearFieldError,
    validateFields,
  };
}

