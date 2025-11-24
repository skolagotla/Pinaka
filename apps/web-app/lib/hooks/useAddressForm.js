"use client";

/**
 * useAddressForm - Composite Hook
 * 
 * Complete address form feature combining:
 * - useRegionalInput (phone/postal formatting)
 * - useFormButtons (form state management)
 * - useFormValidation (validation logic)
 * - usePinakaCRUDWithAddress (CRUD operations)
 * - Form state management
 * 
 * Benefits:
 * - Single import for address forms
 * - Automatic regional formatting
 * - Consistent validation
 * - Reusable across all forms
 * 
 * @param {Object} config - Configuration
 * @param {string} config.entityType - Entity type ('property', 'tenant', 'landlord', 'unit')
 * @param {Object} config.initialData - Initial form data
 * @param {Function} config.onSuccess - Success callback
 * @param {Function} config.onCancel - Cancel callback
 * @returns {Object} Complete address form feature
 * 
 * @example
 * const form = useAddressForm({
 *   entityType: 'property',
 *   initialData: property,
 *   onSuccess: (data) => console.log('Saved!', data),
 *   onCancel: () => router.back()
 * });
 */

import { useState, useCallback, useMemo } from 'react';
import { notify } from '@/lib/utils/notification-helper';

import { useRegionalInput } from './useRegionalInput';
import { useFormButtons } from './useFormButtons';
import { useFormValidation } from './useFormValidation';
import { usePinakaCRUDWithAddress } from './usePinakaCRUDWithAddress';

export function useAddressForm({
  entityType,
  initialData = null,
  onSuccess = null,
  onCancel = null,
  apiEndpoint = null,
}) {

  // Determine if this is edit mode
  const isEditMode = !!initialData?.id;

  // Initialize form data with defaults
  const [formData, setFormData] = useState(() => ({
    // Address fields
    address: initialData?.address || '',
    city: initialData?.city || '',
    country: initialData?.country || 'CA',
    province: initialData?.province || initialData?.state || '',
    state: initialData?.state || initialData?.province || '',
    postalCode: initialData?.postalCode || initialData?.zipCode || '',
    zipCode: initialData?.zipCode || initialData?.postalCode || '',
    
    // Contact fields
    phoneNumber: initialData?.phoneNumber || '',
    email: initialData?.email || '',
    
    // Entity-specific fields
    ...(initialData || {}),
  }));

  // Compose base hooks
  const regional = useRegionalInput(formData.country || 'CA');
  const buttons = useFormButtons();
  const validation = useFormValidation();
  const crud = usePinakaCRUDWithAddress(entityType, apiEndpoint);

  // Update single field
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    validation.clearFieldError(field);
  }, [validation]);

  // Update multiple fields
  const updateFields = useCallback((fields) => {
    setFormData(prev => ({ ...prev, ...fields }));
  }, []);

  // Handle country change (reset region/postal)
  const handleCountryChange = useCallback((country) => {
    setFormData(prev => ({
      ...prev,
      country,
      province: '',
      state: '',
      postalCode: '',
      zipCode: '',
    }));
  }, []);

  // Validate form data
  const validateForm = useCallback(() => {
    const errors = {};

    // Required fields
    if (!formData.address?.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!formData.city?.trim()) {
      errors.city = 'City is required';
    }
    
    if (!formData.country) {
      errors.country = 'Country is required';
    }

    // Phone number validation
    if (formData.phoneNumber) {
      const validPhone = regional.validatePhone(formData.phoneNumber);
      if (!validPhone) {
        errors.phoneNumber = formData.country === 'CA' 
          ? 'Invalid Canadian phone number (must be 10 digits)' 
          : 'Invalid US phone number (must be 10 digits)';
      }
    }

    // Province/State validation
    if (formData.country === 'CA') {
      if (!formData.province?.trim()) {
        errors.province = 'Province is required';
      }
      
      // Postal code validation
      if (!formData.postalCode?.trim()) {
        errors.postalCode = 'Postal code is required';
      } else {
        const validPostal = regional.validatePostalCode(formData.postalCode);
        if (!validPostal) {
          errors.postalCode = 'Invalid postal code (format: A1A 1A1)';
        }
      }
    } else if (formData.country === 'US') {
      if (!formData.state?.trim()) {
        errors.state = 'State is required';
      }
      
      // Zip code validation
      if (!formData.zipCode?.trim()) {
        errors.zipCode = 'Zip code is required';
      } else {
        const validZip = regional.validatePostalCode(formData.zipCode);
        if (!validZip) {
          errors.zipCode = 'Invalid zip code (format: 12345)';
        }
      }
    }

    // Email validation (if provided)
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Invalid email address';
      }
    }

    // Entity-specific validations
    if (entityType === 'property') {
      // Add property-specific validations
    } else if (entityType === 'tenant' || entityType === 'landlord') {
      if (!formData.name?.trim()) {
        errors.name = 'Name is required';
      }
      if (!formData.email?.trim()) {
        errors.email = 'Email is required';
      }
    }

    return errors;
  }, [formData, regional, entityType]);

  // Handle form save
  const handleSave = useCallback(async () => {
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      validation.setErrors(errors);
      notify.error('Please fix the errors before saving');
      return false;
    }

    buttons.setLoading(true);
    
    try {
      // Prepare data for submission (remove formatting)
      const submitData = {
        ...formData,
        // Remove formatting from phone and postal
        phoneNumber: formData.phoneNumber ? regional.unformatPhone(formData.phoneNumber) : null,
        postalCode: formData.country === 'CA' && formData.postalCode 
          ? regional.unformatPostalCode(formData.postalCode) 
          : null,
        zipCode: formData.country === 'US' && formData.zipCode 
          ? formData.zipCode.replace(/\D/g, '') 
          : null,
      };

      let result;
      if (isEditMode) {
        result = await crud.update(initialData.id, submitData);
      } else {
        result = await crud.create(submitData);
      }

      if (result.success) {
        notify.success(isEditMode ? 'Updated successfully' : 'Created successfully');
        
        if (onSuccess) {
          onSuccess(result.data);
        }
        
        buttons.setLoading(false);
        return true;
      } else {
        notify.error(result.error || 'Operation failed');
        buttons.setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('[useAddressForm] Save error:', error);
      notify.error(error.message || 'Failed to save');
      buttons.setLoading(false);
      return false;
    }
  }, [formData, validateForm, validation, buttons, regional, crud, isEditMode, initialData, onSuccess, entityType]);

  // Handle form cancel
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  // Format phone number for display
  const formattedPhone = useMemo(() => {
    return formData.phoneNumber ? regional.formatPhone(formData.phoneNumber) : '';
  }, [formData.phoneNumber, regional]);

  // Format postal code for display
  const formattedPostal = useMemo(() => {
    if (formData.country === 'CA' && formData.postalCode) {
      return regional.formatPostalCode(formData.postalCode);
    } else if (formData.country === 'US' && formData.zipCode) {
      return formData.zipCode;
    }
    return '';
  }, [formData.country, formData.postalCode, formData.zipCode, regional]);

  // Check if form has changes
  const hasChanges = useMemo(() => {
    if (!initialData) return true; // New form always has "changes"
    
    // Compare current form data with initial data
    const relevantFields = ['address', 'city', 'country', 'province', 'state', 'postalCode', 'zipCode', 'phoneNumber', 'email'];
    
    return relevantFields.some(field => {
      const current = formData[field] || '';
      const initial = initialData[field] || '';
      return current !== initial;
    });
  }, [formData, initialData]);

  return {
    // Form data
    formData,
    setFormData,
    updateField,
    updateFields,
    handleCountryChange,
    
    // Form state
    isEditMode,
    hasChanges,
    loading: buttons.loading,
    saving: buttons.saving,
    
    // Validation
    errors: validation.errors,
    validateForm,
    clearErrors: validation.clearErrors,
    clearFieldError: validation.clearFieldError,
    
    // Actions
    handleSave,
    handleCancel,
    
    // Regional formatting
    formatPhone: regional.formatPhone,
    unformatPhone: regional.unformatPhone,
    formatPostalCode: regional.formatPostalCode,
    unformatPostalCode: regional.unformatPostalCode,
    validatePhone: regional.validatePhone,
    validatePostalCode: regional.validatePostalCode,
    formattedPhone,
    formattedPostal,
    
    // Country/Region helpers
    getProvinces: regional.getProvinces,
    getStates: regional.getStates,
    getPostalLabel: regional.getPostalLabel,
    getRegionLabel: regional.getRegionLabel,
  };
}

export default useAddressForm;

