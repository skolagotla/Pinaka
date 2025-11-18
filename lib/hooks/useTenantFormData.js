/**
 * useTenantFormData Hook
 * 
 * Centralized management of tenant form data including:
 * - Emergency contacts
 * - Employers
 * - Data validation and sanitization
 */

import { useState, useCallback, useMemo } from 'react';
import { useFormDataSanitizer } from './useFormDataSanitizer';

const DEFAULT_EMERGENCY_CONTACTS = [
  { contactName: '', email: '', phone: '', isPrimary: true },
  { contactName: '', email: '', phone: '', isPrimary: false }
];

const DEFAULT_EMPLOYERS = [
  { employerName: '', employerAddress: '', income: null, jobTitle: '', startDate: null, payFrequency: null, isCurrent: true, documents: [] }
];

/**
 * Hook for managing tenant form data
 * @param {object} options - Configuration options
 * @returns {object} - Form data state and handlers
 */
export function useTenantFormData(options = {}) {
  const {
    initialEmergencyContacts = DEFAULT_EMERGENCY_CONTACTS,
    initialEmployers = DEFAULT_EMPLOYERS,
    country = 'CA'
  } = options;

  const [emergencyContacts, setEmergencyContacts] = useState(initialEmergencyContacts);
  const [employers, setEmployers] = useState(initialEmployers);
  
  const { sanitizeNestedArray } = useFormDataSanitizer({ country });

  /**
   * Validate and filter emergency contacts
   */
  const getValidEmergencyContacts = useCallback(() => {
    return emergencyContacts
      .filter(c => {
        const name = c.contactName?.trim();
        const phone = c.phone?.trim();
        return name && phone && name.length > 0 && phone.length > 0;
      })
      .map(c => ({
        contactName: c.contactName.trim(),
        email: c.email?.trim() || '',
        phone: c.phone.trim(),
        isPrimary: c.isPrimary === true || c.isPrimary === 'true' || false,
      }));
  }, [emergencyContacts]);

  /**
   * Validate and filter employers
   */
  const getValidEmployers = useCallback(() => {
    return employers
      .filter(e => e.employerName && e.employerName.trim())
      .map(e => ({
        employerName: e.employerName.trim(),
        employerAddress: e.employerAddress?.trim() || '',
        income: e.income || null,
        jobTitle: e.jobTitle?.trim() || '',
        startDate: e.startDate || null,
        payFrequency: e.payFrequency || null,
        isCurrent: e.isCurrent !== undefined ? e.isCurrent : true,
      }));
  }, [employers]);

  /**
   * Prepare tenant data for API submission
   */
  const prepareTenantData = useCallback((formValues, additionalData = {}) => {
    const validContacts = getValidEmergencyContacts();
    const validEmployers = getValidEmployers();
    
    // Sanitize nested arrays
    const sanitizedContacts = sanitizeNestedArray(validContacts, {
      contactName: (key, value) => value?.trim() || '',
      email: (key, value) => value?.trim() || '',
      phone: (key, value) => value?.trim() || '',
    });
    
    const sanitizedEmployers = sanitizeNestedArray(validEmployers, {
      employerName: (key, value) => value?.trim() || '',
      employerAddress: (key, value) => value?.trim() || '',
      income: (key, value) => value || null,
      jobTitle: (key, value) => value?.trim() || '',
      startDate: (key, value) => value || null,
      payFrequency: (key, value) => value || null,
    });

    return {
      ...formValues,
      emergencyContacts: sanitizedContacts,
      employers: sanitizedEmployers,
      ...additionalData
    };
  }, [getValidEmergencyContacts, getValidEmployers, sanitizeNestedArray]);

  /**
   * Load tenant data into form (for editing)
   */
  const loadTenantData = useCallback((tenantData) => {
    // Load emergency contacts
    if (tenantData.emergencyContacts && tenantData.emergencyContacts.length > 0) {
      const contacts = tenantData.emergencyContacts.map(c => ({
        id: c.id,
        contactName: c.contactName || '',
        email: c.email ?? '',
        phone: c.phone || '',
        isPrimary: c.isPrimary || false
      }));
      // Ensure at least 2 slots
      while (contacts.length < 2) {
        contacts.push({ contactName: '', email: '', phone: '', isPrimary: false });
      }
      setEmergencyContacts(contacts);
    } else {
      // Use legacy fields if no new emergency contacts
      setEmergencyContacts([
        { 
          contactName: tenantData.emergencyContactName ?? '', 
          email: '', 
          phone: tenantData.emergencyContactPhone ?? '', 
          isPrimary: true 
        },
        { contactName: '', email: '', phone: '', isPrimary: false }
      ]);
    }
    
    // Load employers
    if (tenantData.employers && tenantData.employers.length > 0) {
      setEmployers(tenantData.employers.map(e => ({
        id: e.id,
        employerName: e.employerName || '',
        employerAddress: e.employerAddress ?? '',
        income: e.income ?? undefined,
        jobTitle: e.jobTitle || '',
        startDate: e.startDate || null,
        payFrequency: e.payFrequency || null,
        isCurrent: e.isCurrent ?? true,
        documents: e.employmentDocuments || []
      })));
    } else {
      setEmployers([{
        employerName: '',
        employerAddress: '',
        income: tenantData.monthlyIncome ?? undefined,
        jobTitle: '',
        startDate: null,
        payFrequency: null,
        isCurrent: true,
        documents: []
      }]);
    }
  }, []);

  /**
   * Reset form data to defaults
   */
  const resetFormData = useCallback(() => {
    setEmergencyContacts(DEFAULT_EMERGENCY_CONTACTS);
    setEmployers(DEFAULT_EMPLOYERS);
  }, []);

  return {
    // State
    emergencyContacts,
    employers,
    
    // Setters
    setEmergencyContacts,
    setEmployers,
    
    // Validators
    getValidEmergencyContacts,
    getValidEmployers,
    
    // Utilities
    prepareTenantData,
    loadTenantData,
    resetFormData,
    
    // Validation
    hasValidEmergencyContacts: useMemo(() => getValidEmergencyContacts().length > 0, [getValidEmergencyContacts]),
    hasValidEmployers: useMemo(() => getValidEmployers().length > 0, [getValidEmployers])
  };
}

