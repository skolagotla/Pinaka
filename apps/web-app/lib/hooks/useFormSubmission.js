/**
 * useFormSubmission Hook
 * 
 * Centralized form submission logic with loading, error handling, and success messages
 * Reduces repetitive form submission code
 * 
 * Usage:
 * ```jsx
 * const { submit, submitting, error } = useFormSubmission({
 *   endpoint: '/api/expenses',
 *   method: 'POST',
 *   onSuccess: (data) => {
 *     message.success('Expense added successfully');
 *     form.resetFields();
 *     refetch();
 *   },
 *   onError: (error) => {
 *     message.error('Failed to add expense');
 *   }
 * });
 * 
 * <Form onFinish={(values) => submit(values)}>
 *   <Button htmlType="submit" loading={submitting}>Submit</Button>
 * </Form>
 * ```
 */

import { useState, useCallback } from 'react';
import { v2Api } from '@/lib/api/v2-client';
import { notify } from '@/lib/utils/notification-helper';

export function useFormSubmission({
  endpoint,
  method = 'POST',
  onSuccess = null,
  onError = null,
  successMessage = null,
  errorMessage = null,
  transformData = null,
  showSuccessMessage = true,
  showErrorMessage = true
} = {}) {
  // Create a fetch wrapper using v2Api
  const fetch = useCallback(async (url, options = {}) => {
    const token = v2Api.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };
    
    const baseUrl = process.env.NEXT_PUBLIC_API_V2_BASE_URL || 'http://localhost:8000/api/v2';
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    
    const response = await window.fetch(fullUrl, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }
    
    return response;
  }, []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Submit form data
   */
  const submit = useCallback(async (formData, options = {}) => {
    if (!endpoint) {
      console.error('[useFormSubmission] No endpoint provided');
      return { success: false, error: 'No endpoint provided' };
    }

    try {
      setSubmitting(true);
      setError(null);

      // Transform data if transformer provided
      const dataToSend = transformData ? transformData(formData) : formData;

      // Prepare request options
      const requestOptions = {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: JSON.stringify(dataToSend)
      };

      // Make API call
      const response = await fetch(endpoint, requestOptions);

      if (!response || !response.ok) {
        throw new Error(errorMessage || 'Failed to submit form');
      }

      // Parse response
      let responseData = null;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        }
      } catch (parseError) {
        // Response might be empty, that's okay
      }

      // Success handling
      if (showSuccessMessage && successMessage) {
        notify.success(successMessage);
      }

      if (onSuccess) {
        onSuccess(responseData || formData);
      }

      return { success: true, data: responseData };
    } catch (err) {
      const errorMsg = err?.message || errorMessage || 'Failed to submit form';
      setError(errorMsg);

      if (showErrorMessage && errorMessage) {
        notify.error(errorMessage);
      }

      if (onError) {
        onError(err);
      }

      return { success: false, error: errorMsg };
    } finally {
      setSubmitting(false);
    }
  }, [
    endpoint,
    method,
    transformData,
    fetch,
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    showSuccessMessage,
    showErrorMessage
  ]);

  /**
   * Reset submission state
   */
  const reset = useCallback(() => {
    setSubmitting(false);
    setError(null);
  }, []);

  return {
    submit,
    submitting,
    error,
    reset
  };
}

