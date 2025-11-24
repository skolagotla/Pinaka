"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Button,
  Table,
  Badge,
  Modal,
  Card,
  Avatar,
  Alert,
  Tabs,
  Spinner,
  Tooltip,
} from 'flowbite-react';
import { PageLayout, EmptyState, TableWrapper } from '@/components/shared';
import { notify } from '@/lib/utils/notification-helper';
import { rules, ruleCombos } from '@/lib/utils/validation-rules';
import { ActionButton, IconButton } from '@/components/shared/buttons';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import FlowbitePopconfirm from '@/components/shared/FlowbitePopconfirm';
import { renderStatus } from '@/components/shared/FlowbiteTableRenderers';
import { useFormState } from '@/lib/hooks/useFormState';
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiPaperAirplane,
  HiUser,
  HiMail,
  HiPhone,
  HiSave,
  HiX,
  HiCloudUpload,
  HiDocumentText,
  HiRefresh,
  HiUserAdd,
  HiXCircle,
  HiCheckCircle,
  HiUserGroup,
} from 'react-icons/hi';
import dayjs from 'dayjs';
import { formatDateForAPI } from '@/lib/utils/safe-date-formatter';
import { formatPhoneNumber } from '@/lib/utils/formatters';
import { STANDARD_COLUMNS, COLUMN_NAMES, customizeColumn } from '@/lib/constants/standard-columns';
import { TENANT_COLUMNS, createActionColumn } from '@/lib/constants/column-definitions';

// Custom Hooks
import { 
  usePinakaCRUDWithAddress, 
  useResizableTable, 
  withSorter, 
  sortFunctions, 
  useTenantFormData,
  useFormDataSanitizer,
  configureTableColumns,
  useModalState
} from '@/lib/hooks';
// useUnifiedApi removed - use v2Api from @/lib/api/v2-client';
import { usePolling } from '@/lib/hooks/usePolling';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { ValidationHelpers } from '@/lib/utils/unified-validation';
import { useLoading } from '@/lib/hooks/useLoading';
import { ModalHelper } from '@/lib/utils/flowbite-modal-helper';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useTenants, useCreateTenant, useUpdateTenant, useDeleteTenant, useInvitations, useCreateInvitation, useUpdateInvitation } from '@/lib/hooks/useV2Data';

// Lazy load logger to avoid server-side execution issues
let logger;
try {
  if (typeof window !== 'undefined') {
    logger = require('@/lib/logger');
  } else {
    logger = {
      form: () => {},
      error: () => {},
      info: () => {},
      warn: () => {},
    };
  }
} catch (error) {
  logger = {
    form: () => {},
    error: () => {},
    info: () => {},
    warn: () => {},
  };
}

// Reusable Components
import { PhoneNumberInput, PostalCodeInput, AddressAutocomplete } from '@/components/forms';
import PropertyContextBanner from '@/components/PropertyContextBanner';
import { useProperty } from '@/lib/contexts/PropertyContext';

// Rules Engine Components
import CurrencyInput from '@/components/rules/CurrencyInput';
import { TextInput, Label, Select, Textarea } from 'flowbite-react';

function TenantsClient({ initialTenants, user }) {
  const searchParams = useSearchParams();
  const form = useFormState({ country: "CA", provinceState: "ON" });
  const rejectForm = useFormState();
  const { selectedProperty } = useProperty();
  const { user: v2User } = useV2Auth();
  const organizationId = v2User?.organization_id;
  
  // Check permissions (PMC-managed landlords cannot create tenants)
  const permissions = usePermissions(user || { role: 'landlord' });
  
  // v2 API hooks
  const { data: tenantsData, isLoading: tenantsLoading, refetch: refetchTenants } = useTenants(organizationId);
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();
  const deleteTenant = useDeleteTenant();
  const { data: invitationsData, refetch: refetchInvitations } = useInvitations(organizationId, 'pending');
  const createInvitation = useCreateInvitation();
  const updateInvitation = useUpdateInvitation();
  
  // Use v2 data if available, otherwise fall back to initialTenants
  const tenants = tenantsData || initialTenants || [];
  const invitations = invitationsData || [];
  
  // Approval workflow state
  const { isOpen: approvalModalVisible, open: openApprovalModal, close: closeApprovalModal, editingItem: selectedTenant, openForEdit: openApprovalModalForEdit } = useModalState();
  const { isOpen: rejectModalVisible, open: openRejectModal, close: closeRejectModal, openForEdit: openRejectModalForEdit } = useModalState();
  const [selectedTenantForApproval, setSelectedTenantForApproval] = useState(null);
  const { loading: approving, withLoading: withApproving } = useLoading();
  const { loading: rejecting, withLoading: withRejecting } = useLoading();
  
  // API error handler
  // useUnifiedApi removed - use v2Api
  
  // Tenant form data management hook
  const tenantFormData = useTenantFormData({ country: 'CA' });
  const { emergencyContacts, employers, setEmergencyContacts, setEmployers } = tenantFormData;
  
  // Form data sanitizer
  const { sanitizeFormData } = useFormDataSanitizer({ country: 'CA' });
  
  // Modal state for tenant CRUD
  const { isOpen: tenantModalVisible, open: openTenantModal, close: closeTenantModal, editingItem: editingTenant, openForEdit: openTenantModalForEdit, openForCreate: openTenantModalForCreate } = useModalState();
  const [isEditing, setIsEditing] = useState(false);
  
  // Legacy pinaka hook kept for compatibility but using v2 hooks above
  const pinaka = {
    data: tenants,
    loading: tenantsLoading,
    isEditing,
    openAdd: () => {
      setIsEditing(false);
      openTenantModalForCreate();
      form.resetFields();
    },
    openEdit: (tenant) => {
      setIsEditing(true);
      openTenantModalForEdit(tenant);
      // Load tenant data into form
      form.setFieldsValue({
        firstName: tenant.first_name || tenant.firstName,
        lastName: tenant.last_name || tenant.lastName,
        email: tenant.email,
        phone: tenant.phone,
        country: tenant.country || 'CA',
        provinceState: tenant.province_state || tenant.provinceState || 'ON',
        currentAddress: tenant.current_address || tenant.currentAddress,
        dateOfBirth: tenant.date_of_birth || tenant.dateOfBirth ? dayjs(tenant.date_of_birth || tenant.dateOfBirth) : undefined,
        moveInDate: tenant.move_in_date || tenant.moveInDate ? dayjs(tenant.move_in_date || tenant.moveInDate) : undefined,
      });
      // Load tenant form data
      if (tenant.emergency_contacts || tenant.emergencyContacts) {
        setEmergencyContacts(tenant.emergency_contacts || tenant.emergencyContacts);
      }
      if (tenant.employers) {
        setEmployers(tenant.employers);
      }
    },
    close: () => {
      closeTenantModal();
      setIsEditing(false);
      form.resetFields();
      tenantFormData.resetFormData();
    },
    refresh: async () => {
      await refetchTenants();
    },
    remove: async (id) => {
      await deleteTenant.mutateAsync(id);
      await refetchTenants();
    },
    handleSubmit: async (values) => {
      try {
        if (!organizationId) {
          notify.error('Organization ID is required');
          return;
        }
        
        // Prepare tenant data
        const tenantData = tenantFormData.prepareTenantData({
          ...values,
          phone: typeof values.phone === 'object' ? (values.phone.value || values.phone.phone || values.phone.formatted || null) : values.phone,
          currentAddress: typeof values.currentAddress === 'object' ? (values.currentAddress.formattedAddress || values.currentAddress.addressLine1 || String(values.currentAddress)) : values.currentAddress,
        }, {
          dateOfBirth: values.dateOfBirth ? formatDateForAPI(values.dateOfBirth) : null,
          moveInDate: values.moveInDate ? formatDateForAPI(values.moveInDate) : null,
        });
        
        // Sanitize form data
        const sanitizedData = sanitizeFormData(tenantData, { mode: 'storage' });
        
        if (isEditing && editingTenant) {
          await updateTenant.mutateAsync({
            id: editingTenant.id,
            data: sanitizedData
          });
          notify.success('Tenant updated successfully');
        } else {
          await createTenant.mutateAsync({
            ...sanitizedData,
            organization_id: organizationId,
          });
          notify.success('Tenant created successfully');
        }
        
        await refetchTenants();
        pinaka.close();
      } catch (error) {
        console.error('[Tenant Form] Error:', error);
        notify.error(error.message || 'Failed to save tenant');
        throw error;
      }
    },
  };
  
  // Default form data
  const defaultFormData = { country: "CA", provinceState: "ON" };
    // Format dates before sending to API
    onBeforeCreate: (payload) => {
      logger.form('Tenant form submitted', { mode: 'add', values: payload });
      
      // Ensure phone is a string (handle formatted strings, objects, or null)
      let phoneString = payload.phone;
      if (phoneString) {
        if (typeof phoneString === 'object') {
          phoneString = phoneString.value || phoneString.phone || phoneString.formatted || null;
        }
        phoneString = String(phoneString).trim();
        if (phoneString === '') {
          phoneString = null;
        }
      } else {
        phoneString = null;
      }
      
      // Ensure currentAddress is a string (not an object)
      let addressString = '';
      if (payload.currentAddress) {
        if (typeof payload.currentAddress === 'object' && payload.currentAddress !== null) {
          addressString = payload.currentAddress.formattedAddress 
            || payload.currentAddress.addressLine1 
            || payload.currentAddress.address
            || payload.currentAddress.street
            || (payload.currentAddress.number && payload.currentAddress.street 
                ? `${payload.currentAddress.number} ${payload.currentAddress.street}`.trim()
                : '')
            || String(payload.currentAddress);
        } else {
          addressString = String(payload.currentAddress).trim();
        }
      }
      if (addressString === '') {
        addressString = null;
      }
      
      // Prepare tenant data using the hook
      const tenantData = tenantFormData.prepareTenantData({
        ...payload,
        phone: phoneString,
        currentAddress: addressString,
      }, {
        dateOfBirth: payload.dateOfBirth ? formatDateForAPI(payload.dateOfBirth) : null,
        moveInDate: payload.moveInDate ? formatDateForAPI(payload.moveInDate) : null,
      });
      // Sanitize form data
      return sanitizeFormData(tenantData, { mode: 'storage' });
    },
    onBeforeUpdate: (id, payload) => {
      logger.form('Tenant form submitted', { mode: 'edit', tenantId: id, values: payload });
      
      // Ensure phone is a string (handle formatted strings, objects, or null)
      let phoneString = payload.phone;
      if (phoneString) {
        if (typeof phoneString === 'object') {
          phoneString = phoneString.value || phoneString.phone || phoneString.formatted || null;
        }
        phoneString = String(phoneString).trim();
        if (phoneString === '') {
          phoneString = null;
        }
      } else {
        phoneString = null;
      }
      
      // Ensure currentAddress is a string (not an object)
      let addressString = '';
      if (payload.currentAddress) {
        if (typeof payload.currentAddress === 'object' && payload.currentAddress !== null) {
          addressString = payload.currentAddress.formattedAddress 
            || payload.currentAddress.addressLine1 
            || payload.currentAddress.address
            || payload.currentAddress.street
            || (payload.currentAddress.number && payload.currentAddress.street 
                ? `${payload.currentAddress.number} ${payload.currentAddress.street}`.trim()
                : '')
            || String(payload.currentAddress);
        } else {
          addressString = String(payload.currentAddress).trim();
        }
      }
      if (addressString === '') {
        addressString = null;
      }
      
      // Prepare tenant data using the hook
      const tenantData = tenantFormData.prepareTenantData({
        ...payload,
        phone: phoneString,
        currentAddress: addressString,
        leaseTerm: payload.leaseTerm || null,
      }, {
        dateOfBirth: payload.dateOfBirth ? formatDateForAPI(payload.dateOfBirth) : null,
        moveInDate: payload.moveInDate ? formatDateForAPI(payload.moveInDate) : null,
      });
      // Sanitize form data
      const sanitized = sanitizeFormData(tenantData, { mode: 'storage' });
      return sanitized;
    },
    onBeforeDelete: (id, tenant) => {
      logger.action('Tenant: Delete button clicked', { tenantId: id, tenantName: `${tenant.firstName} ${tenant.lastName}` });
      return true;
    }
  });

  // Ensure pinaka.data is always an array
  const tenantsData = Array.isArray(pinaka.data) ? pinaka.data : [];

  const [searchTerm, setSearchTerm] = useState('');

  // Search filter
  const filteredData = useMemo(() => {
    if (!searchTerm) return tenantsData;
    const searchLower = searchTerm.toLowerCase();
    return tenantsData.filter(tenant => {
      const searchFields = [
        tenant.firstName,
        tenant.lastName,
        tenant.email,
        tenant.phone,
        tenant.currentAddress,
        tenant.city,
      ];
      return searchFields.some(field => field?.toLowerCase().includes(searchLower));
    });
  }, [tenantsData, searchTerm]);

  const statsData = [
    {
      title: 'Tenants',
      value: tenantsData.length,
      prefix: <HiUserGroup className="h-5 w-5" />,
    },
    {
      title: 'Active Leases',
      value: tenantsData.filter(t => t.leaseTenants?.some(lt => lt.lease?.status === 'Active')).length,
      prefix: <HiCheckCircle className="h-5 w-5" />,
      valueStyle: { color: '#52c41a' },
    },
  ];

  // Memoize handleAddClick to prevent unnecessary re-renders and fix useEffect dependency
  const handleAddClick = useCallback(() => {
    logger.action('Tenant: Add button clicked');
    logger.modal('Tenant modal opened', { mode: 'add' });
    pinaka.setCountry("CA");
    form.resetFields();
    form.setFieldsValue({ country: "CA", provinceState: "ON" });
    // Reset emergency contacts and employers to defaults
    setEmergencyContacts(>{
      { contactName: '', email: '', phone: '', isPrimary: true },
      { contactName: '', email: '', phone: '', isPrimary: false }
    ]);
    setEmployers(>{
      { employerName: '', employerAddress: '', income: null, jobTitle: '', startDate: null, payFrequency: null, isCurrent: true, documents: [] }
    ]);
    pinaka.openAdd();
  }, [pinaka, form, setEmergencyContacts, setEmployers]);

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      handleAddClick();
    }
  }, [searchParams, handleAddClick]);

  // Auto-refresh tenants list every 30 seconds to show newly accepted invitations (using v2 hooks)
  const { startPolling, stopPolling } = usePolling({
    callback: async () => {
      try {
        await pinaka.refresh();
      } catch (error) {
        console.warn('Polling refresh failed:', error);
      }
    },
    interval: 30000,
    enabled: true,
    immediate: false
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      startPolling();
      return () => stopPolling();
    }
  }, [startPolling, stopPolling]);

  const handleEditClick = useCallback((tenant) => {
    logger.action('Tenant: Edit button clicked', { tenantId: tenant.id, tenantName: `${tenant.firstName} ${tenant.lastName}` });
    logger.modal('Tenant modal opened', { mode: 'edit', tenantId: tenant.id });
    pinaka.setCountry(tenant.country || "CA");
    
    // Extract phone - handle formatted strings, objects, or null
    let phoneValue = tenant.phone || "";
    if (phoneValue && typeof phoneValue === 'object') {
      phoneValue = phoneValue.value || phoneValue.phone || phoneValue.formatted || "";
    }
    
    // Format phone number for display in form
    if (phoneValue && typeof phoneValue === 'string' && phoneValue.trim()) {
      const digitsOnly = phoneValue.replace(/\D/g, '');
      if (digitsOnly.length >= 10) {
        phoneValue = formatPhoneNumber(digitsOnly);
      } else if (phoneValue.length > 0) {
        phoneValue = formatPhoneNumber(phoneValue);
      }
    }
    
    // Extract address - handle objects or strings
    let addressValue = tenant.currentAddress || "";
    if (addressValue && typeof addressValue === 'object' && addressValue !== null) {
      addressValue = addressValue.formattedAddress 
        || addressValue.addressLine1 
        || addressValue.address
        || addressValue.street
        || (addressValue.number && addressValue.street 
            ? `${addressValue.number} ${addressValue.street}`.trim()
            : '')
        || "";
    }
    
    form.setFieldsValue({
      firstName: tenant.firstName,
      middleName: tenant.middleName || "",
      lastName: tenant.lastName,
      email: tenant.email,
      phone: phoneValue,
      country: tenant.country || "CA",
      provinceState: tenant.provinceState || "",
      postalZip: tenant.postalZip || "",
      city: tenant.city || "",
      dateOfBirth: tenant.dateOfBirth ? dayjs(tenant.dateOfBirth).startOf('day').format('YYYY-MM-DD') : undefined,
      currentAddress: addressValue,
      numberOfAdults: tenant.numberOfAdults || 1,
      numberOfChildren: tenant.numberOfChildren || 0,
      moveInDate: tenant.moveInDate ? dayjs(tenant.moveInDate).startOf('day').format('YYYY-MM-DD') : undefined,
      leaseTerm: tenant.leaseTerm || undefined,
    });
    
    // Load emergency contacts (ensure at least 2 entries)
    if (tenant.emergencyContacts && tenant.emergencyContacts.length > 0) {
      const contacts = tenant.emergencyContacts.map(c => ({
        id: c.id,
        contactName: c.contactName,
        email: c.email || '',
        phone: c.phone,
        isPrimary: c.isPrimary
      }));
      while (contacts.length < 2) {
        contacts.push({ contactName: '', email: '', phone: '', isPrimary: false });
      }
      setEmergencyContacts(contacts);
    } else {
      setEmergencyContacts(>{
        { 
          contactName: tenant.emergencyContactName || '', 
          email: '', 
          phone: tenant.emergencyContactPhone || '', 
          isPrimary: true 
        },
        { contactName: '', email: '', phone: '', isPrimary: false }
      ]);
    }
    
    // Load employers
    if (tenant.employers && tenant.employers.length > 0) {
      setEmployers(tenant.employers.map(e => ({
        id: e.id,
        employerName: e.employerName,
        employerAddress: e.employerAddress || '',
        income: e.income,
        jobTitle: e.jobTitle || '',
        startDate: e.startDate || null,
        payFrequency: e.payFrequency || null,
        isCurrent: e.isCurrent,
        documents: e.employmentDocuments || []
      })));
    } else {
      setEmployers([{
        employerName: '',
        employerAddress: '',
        income: tenant.monthlyIncome || null,
        jobTitle: '',
        startDate: null,
        payFrequency: null,
        isCurrent: true,
        documents: []
      }]);
    }
    
    pinaka.openEdit(tenant);
  }, [pinaka, form, setEmergencyContacts, setEmployers]);

  const handleDelete = useCallback(async (tenant) => {
    logger.action('Tenant: Delete button clicked', { tenantId: tenant.id, tenantName: `${tenant.firstName} ${tenant.lastName}` });
    await pinaka.remove(tenant.id, tenant);
  }, [pinaka]);

  const { isOpen: inviteModalVisible, open: openInviteModal, close: closeInviteModal, openForCreate: openInviteModalForCreate } = useModalState();
  const inviteForm = useFormState({ expiresInDays: 14 });
  const { loading: loadingInvitations, withLoading: withLoadingInvitations } = useLoading();
  const [showPendingInvitations, setShowPendingInvitations] = useState(false);

  // Load invitations
  useEffect(() => {
    loadInvitations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadInvitations() {
    return await withLoadingInvitations(async () => {
      await refetchInvitations();
      return invitations;
    }).catch((error) => {
      console.error('[Load Invitations] Error:', error);
      return [];
    });
  }

  async function sendInvitation(tenant) {
    logger.action('Tenant: Send invitation clicked', { tenantId: tenant.id, tenantEmail: tenant.email });
    try {
      if (!organizationId) {
        notify.error('Organization ID is required');
        return;
      }
      
      await createInvitation.mutateAsync({
        organization_id: organizationId,
        email: tenant.email || tenant.email,
        role_name: 'tenant',
        expires_in_days: 14,
      });
      
      notify.success(`Invitation sent to ${tenant.first_name || tenant.firstName} ${tenant.last_name || tenant.lastName}`);
      await refetchInvitations();
    } catch (error) {
      logger.apiError('POST', '/api/v2/invitations', error);
      notify.error(error.message || 'Failed to send invitation');
    }
  }

  async function inviteNewTenant(values) {
    try {
      if (!organizationId) {
        notify.error('Organization ID is required');
        return;
      }
      
      const data = await createInvitation.mutateAsync({
        organization_id: organizationId,
        email: values.email,
        role_name: 'tenant',
        expires_in_days: values.expiresInDays || 14,
      });
      
      closeInviteModal();
      inviteForm.resetFields();
      notify.success(`Invitation sent to ${values.email}`);
      
      await refetchInvitations();
    } catch (error) {
      console.error('[Invite Tenant] Error:', error);
      
      // Check if it's a duplicate invitation error
      if (error?.message?.includes('already exists') || error?.message?.includes('INVITATION_EXISTS') || error?.message?.includes('TENANT_EXISTS')) {
        let invitationId;
        
        try {
          const loadedInvitations = await loadInvitations();
          const existingInvitation = loadedInvitations.find(inv => 
            inv.email === values.email && 
            ['pending', 'sent', 'opened'].includes(inv.status)
          );
          if (existingInvitation) {
            invitationId = existingInvitation.id;
          }
        } catch (e) {
          console.error('[Invite Tenant] Error loading invitations:', e);
        }
        
        // Show modal with resend option using ModalHelper
        ModalHelper.confirm({
          title: 'Invitation Already Exists',
          content: (
            <div>
              <p>An active invitation already exists for <strong>{values.email}</strong>.</p>
              <p className="mt-2 text-gray-600 text-sm">
                Would you like to resend it? The invitation will appear in the "Pending Invitations" section above the tenants table.
              </p>
            </div>
          ),
          okText: 'Yes, Resend',
          cancelText: 'Cancel',
          onOk: async () => {
            if (invitationId) {
              try {
                await resendInvitation(invitationId);
                notify.success(`Invitation resent to ${values.email}`);
                closeInviteModal();
                inviteForm.resetFields();
                await loadInvitations();
              } catch (resendError) {
                console.error('[Invite Tenant] Resend error:', resendError);
                notify.error('Failed to resend invitation. Please try again.');
              }
            } else {
              notify.warning('Could not find invitation ID. Please check the "Pending Invitations" section above.');
              await loadInvitations();
            }
          },
          onCancel: () => {
            closeInviteModal();
            inviteForm.resetFields();
          }
        });
        return;
      }
      
      notify.error(error?.message || 'Failed to send invitation. Please try again.');
    }
  }

  async function resendInvitation(invitationId) {
    try {
      console.log('[Resend Invitation] Attempting to resend:', invitationId);
      // Update invitation status to 'sent' to resend
      await updateInvitation.mutateAsync({
        id: invitationId,
        data: { status: 'sent' }
      });
      
      notify.success('Invitation resent successfully');
      await refetchInvitations();
    } catch (error) {
      console.error('[Resend Invitation] Error:', error);
      notify.error(error instanceof Error ? error.message : 'Failed to resend invitation');
      await refetchInvitations();
    }
  }

  async function cancelInvitation(invitationId) {
    try {
      // Update invitation status to 'cancelled'
      await updateInvitation.mutateAsync({
        id: invitationId,
        data: { status: 'cancelled' }
      });
      notify.success('Invitation cancelled');
      await refetchInvitations();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Failed to cancel invitation');
    }
  }

  function handleClose() {
    logger.modal('Tenant modal closed', { 
      mode: pinaka.isEditing ? 'edit' : 'add',
      action: 'cancel'
    });
    pinaka.close();
    form.resetFields();
    pinaka.setCountry("CA");
  }

  // Approval workflow handlers
  function handleApproveClick(tenant) {
    setSelectedTenantForApproval(tenant);
    openApprovalModalForEdit(tenant);
  }

  function handleRejectClick(tenant) {
    setSelectedTenantForApproval(tenant);
    rejectForm.resetFields();
    openRejectModalForEdit(tenant);
  }

  async function handleApprove() {
    if (!selectedTenantForApproval) return;
    
    await withApproving(async () => {
      const { v2Api } = await import('@/lib/api/v2-client');
      await v2Api.approveTenant(selectedTenantForApproval.id);
      
      notify.success('Tenant application approved successfully');
      closeApprovalModal();
      await pinaka.refresh();
    });
  }

  async function handleReject(values) {
    if (!selectedTenantForApproval) return;
    
    await withRejecting(async () => {
      const { v2Api } = await import('@/lib/api/v2-client');
      await v2Api.rejectTenant(selectedTenantForApproval.id, values.reason);
      
      notify.success('Tenant application rejected successfully');
      closeRejectModal();
      rejectForm.resetFields();
      await pinaka.refresh();
    });
  }

  // Use consolidated column definitions with customizations
  const columns = [
    withSorter(
      customizeColumn(TENANT_COLUMNS.NAME, {
        render: (_, tenant) => (
          <div className="flex items-center gap-2">
            <Avatar size="lg" rounded className="bg-blue-600">
              <HiUser className="h-5 w-5 text-white" />
            </Avatar>
            <span className="font-semibold">{tenant.firstName} {tenant.lastName}</span>
          </div>
        ),
      }),
      sortFunctions.string('firstName')
    ),
    withSorter(
      customizeColumn(TENANT_COLUMNS.EMAIL, {
        render: (email) => <span>{email}</span>,
      }),
      sortFunctions.string('email')
    ),
    withSorter(
      customizeColumn(TENANT_COLUMNS.PHONE, {
        dataIndex: 'phone',
        render: (phone, tenant) => {
          let phoneValue = tenant?.phone || phone;
          
          if (phoneValue && typeof phoneValue === 'object') {
            phoneValue = phoneValue.value || phoneValue.phone || phoneValue.formatted || null;
          }
          
          if (!phoneValue || (typeof phoneValue === 'string' && phoneValue.trim() === '')) {
            return <span className="text-gray-400">—</span>;
          }
          
          try {
            const digitsOnly = String(phoneValue).replace(/\D/g, '');
            if (digitsOnly.length >= 10) {
              const formatted = formatPhoneNumber(digitsOnly);
              return formatted ? <span>{formatted}</span> : <span className="text-gray-400">—</span>;
            } else if (digitsOnly.length > 0) {
              const formatted = formatPhoneNumber(digitsOnly);
              return formatted ? <span>{formatted}</span> : <span className="text-gray-400">—</span>;
            }
            return <span className="text-gray-400">—</span>;
          } catch (error) {
            return <span className="text-gray-400">—</span>;
          }
        },
      }),
      sortFunctions.string('phone')
    ),
    {
      title: 'Address',
      key: 'address',
      dataIndex: 'currentAddress',
      width: 250,
      ellipsis: true,
      render: (address, tenant) => {
        let addressValue = tenant?.currentAddress || address;
        let addressString = '';
        
        if (addressValue) {
          if (typeof addressValue === 'object' && addressValue !== null) {
            if (addressValue.$$typeof) {
              addressString = '';
            } else {
              addressString = addressValue.formattedAddress 
                || addressValue.addressLine1 
                || addressValue.address
                || addressValue.street 
                || addressValue.line1
                || addressValue.fullAddress
                || '';
              
              if (!addressString && addressValue.number && addressValue.street) {
                addressString = `${addressValue.number} ${addressValue.street}`.trim();
              }
              
              if (!addressString) {
                try {
                  const keys = Object.keys(addressValue).slice(0, 10);
                  for (const key of keys) {
                    const value = addressValue[key];
                    if (typeof value === 'string' && value && value.length < 200 && key !== 'fullAddress') {
                      addressString = value;
                      break;
                    }
                  }
                } catch (e) {
                  addressString = '';
                }
              }
            }
          } else {
            addressString = String(addressValue).trim();
          }
        }
        
        const parts = [];
        if (addressString) parts.push(addressString);
        if (tenant?.city) parts.push(tenant.city);
        if (tenant?.provinceState) parts.push(tenant.provinceState);
        if (tenant?.postalZip) parts.push(tenant.postalZip);
        
        if (parts.length === 0) return <span className="text-gray-400">—</span>;
        const fullAddress = parts.join(', ');
        return <span title={fullAddress}fullAddress}</span>;
      },
    },
    {
      title: 'Application Status',
      key: 'approvalStatus',
      width: 150,
      align: 'center',
      render: (_, tenant) => {
        const status = tenant.approvalStatus || 'PENDING';
        const statusMap = {
          PENDING: 'Pending',
          APPROVED: 'Completed',
          REJECTED: 'Cancelled'
        };
        return renderStatus(statusMap[status] || status, {
          customColors: {
            'Pending': 'orange',
            'Completed': 'success',
            'Cancelled': 'error'
          }
        });
      },
      filters: >{
        { text: 'Pending', value: 'PENDING' },
        { text: 'Approved', value: 'APPROVED' },
        { text: 'Rejected', value: 'REJECTED' },
      ],
      onFilter: (value, tenant) => (tenant.approvalStatus || 'PENDING') === value,
    },
    customizeColumn(TENANT_COLUMNS.STATUS, {
      title: 'Lease Status',
      key: 'status',
      render: (_, tenant) => {
        const hasActiveLease = tenant.leaseTenants?.some(lt => lt.lease?.status === 'Active');
        const pendingInvitation = invitations.find(inv => 
          inv.email === tenant.email && 
          ['pending', 'sent', 'opened'].includes(inv.status) &&
          new Date(inv.expiresAt) > new Date()
        );
        
        return (
          <div className="flex flex-col gap-1">
            {hasActiveLease ? (
              <Badge color="success">Active Lease</Badge>
            ) : (
              <Badge color="gray">No Active Lease</Badge>
            )}
            {pendingInvitation && (
              <Badge color="info" icon={HiPaperAirplane}>
                Invitation {pendingInvitation.status}
              </Badge>
            )}
          </div>
        );
      },
      filters: >{
        { text: 'Active Lease', value: true },
        { text: 'No Active Lease', value: false },
      ],
      onFilter: (value, tenant) => {
        const hasActiveLease = tenant.leaseTenants?.some(lt => lt.lease?.status === 'Active');
        return hasActiveLease === value;
      },
    }),
    {
      ...TENANT_COLUMNS.ACTIONS,
      render: (_, tenant) => {
        const approvalStatus = tenant.approvalStatus || 'PENDING';
        const isPending = approvalStatus === 'PENDING';
        
        return (
          <div className="flex items-center gap-2">
            {isPending && (
              <>
                <IconButton
                  icon={<HiSave className="h-4 w-4" />}
                  onClick={() => handleApproveClick(tenant)}
                  tooltip="Approve Application"
                  type="primary"
                />
                <IconButton
                  icon={<HiXCircle className="h-4 w-4" />}
                  onClick={() => handleRejectClick(tenant)}
                  tooltip="Reject Application"
                  type="default"
                />
              </>
            )}
            <ActionButton
              action="edit"
              onClick={() => handleEditClick(tenant)}
              tooltip="Edit Tenant"
            />
            {approvalStatus === 'APPROVED' && (
              <IconButton
                icon={<HiPaperAirplane className="h-4 w-4" />}
                onClick={() => sendInvitation(tenant)}
                tooltip="Send Invitation"
                type="default"
              />
            )}
            <FlowbitePopconfirm
              title="Delete tenant?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(tenant)}
              okText="Yes"
              cancelText="No"
              danger={true}
            >
              <ActionButton
                action="delete"
                tooltip="Delete Tenant"
              />
            </FlowbitePopconfirm>
          </div>
        );
      },
    },
  ];

  // Configure columns with standard settings
  const configuredColumns = configureTableColumns(columns, {
    addSorting: false,
    centerAlign: true,
    addWidths: false,
  });

  // Use resizable table hook with column width persistence
  const { tableProps } = useResizableTable(configuredColumns, {
    defaultSort: { field: 'createdAt', order: 'descend' },
    storageKey: 'landlord-tenants-table',
  });

  // Filter pending invitations (not yet accepted - no tenant record exists)
  const pendingInvitations = invitations.filter(inv => {
    const hasTenant = pinaka.data.some(tenant => tenant.email === inv.email);
    const isActive = ['pending', 'sent', 'opened'].includes(inv.status);
    const notExpired = new Date(inv.expiresAt) > new Date();
    return !hasTenant && isActive && notExpired;
  });

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const values = form.getFieldsValue();
      await pinaka.handleSubmit(values);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  // Handle invite form submission
  const handleInviteFormSubmit = async (e) => {
    e.preventDefault();
    const values = inviteForm.getFieldsValue();
    await inviteNewTenant(values);
  };

  // Handle reject form submission
  const handleRejectFormSubmit = async (e) => {
    e.preventDefault();
    const values = rejectForm.getFieldsValue();
    if (!values.reason || values.reason.length < 10) {
      rejectForm.setFieldError('reason', 'Reason must be at least 10 characters');
      return;
    }
    await handleReject(values);
  };

  return (
    <div className="p-3 h-full flex flex-col">
      <PropertyContextBanner userRole="landlord" />
      <PageLayout
        headerTitle={
          <div className="flex items-center gap-2">
            <HiUserGroup className="h-5 w-5" />
            <span>Tenants</span>
          </div>
        }
        headerActions={
          permissions.canEditTenants && (
            <Button
              key="add"
              color="blue"
              onClick={handleAddClick}
              className="flex items-center gap-2"
            >
              <HiPlus className="h-4 w-4" />
              Add Tenant
            </Button>
          ),
          permissions.canEditTenants && (
            <Button
              key="invite"
              color="gray"
              onClick={openInviteModalForCreate}
              className="flex items-center gap-2"
            >
              <HiUserAdd className="h-4 w-4" />
              Invite Tenant
            </Button>
          ),
          <Button
            key="refresh"
            color="gray"
            onClick={pinaka.refresh}
            className="flex items-center gap-2"
          >
            <HiRefresh className="h-4 w-4" />
            Refresh
          </Button>,
        }
        stats={statsData}
        statsCols={2}
        showSearch={true}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchClear={() => setSearchTerm('')}
        searchPlaceholder="Search tenants by name, email, phone, or address..."
      >
        {/* Pending Invitations Section */}
        {pendingInvitations.length > 0 && (
          <Card className="mb-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <HiPaperAirplane className="h-5 w-5" />
                Pending Invitations ({pendingInvitations.length})
              </h3>
              <IconButton
                icon={<HiRefresh className="h-4 w-4" />}
                onClick={loadInvitations}
                tooltip="Refresh Invitations"
              />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <Table.Head>
                  <Table.HeadCell>Email</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell>Sent</Table.HeadCell>
                  <Table.HeadCell>Expires</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {pendingInvitations.map((invitation) => {
                    const expiresDate = new Date(invitation.expiresAt);
                    const isExpiringSoon = expiresDate.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;
                    return (
                      <Table.Row key={invitation.id}>
                        <Table.Cell>
                          <span className="font-semibold">{invitation.email}</span>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color={invitation.status === 'sent' ? 'info' : invitation.status === 'opened' ? 'info' : 'warning'}>
                            {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          {invitation.createdAt ? dayjs(invitation.createdAt).format('MMM D, YYYY') : '-'}
                        </Table.Cell>
                        <Table.Cell>
                          <span className={isExpiringSoon ? 'text-yellow-600' : 'text-gray-500'}>
                            {dayjs(invitation.expiresAt).format('MMM D, YYYY')}
                          </span>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center gap-2">
                            <IconButton
                              icon={<HiPaperAirplane className="h-4 w-4" />}
                              onClick={() => resendInvitation(invitation.id)}
                              tooltip="Resend Invitation"
                              type="default"
                            />
                            <FlowbitePopconfirm
                              title="Cancel invitation?"
                              description="This will cancel the invitation and it cannot be resent."
                              onConfirm={() => cancelInvitation(invitation.id)}
                              okText="Yes"
                              cancelText="No"
                              danger={true}
                            >
                              <IconButton
                                icon={<HiX className="h-4 w-4" />}
                                tooltip="Cancel Invitation"
                                type="default"
                              />
                            </FlowbitePopconfirm>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            </div>
          </Card>
        )}

        {pinaka.data.length === 0 ? (
          <EmptyState
            icon={<HiUser className="h-12 w-12 text-gray-400" />}
            title="No tenants yet"
            description="Click 'Add Tenant' to add your first tenant"
          />
        ) : (
          <TableWrapper>
            <FlowbiteTable
              {...tableProps}
              dataSource={filteredData}
              rowKey="id"
              loading={pinaka.loading}
              pagination={{
                pageSize: 25,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} tenants`,
              }}
              onRow={(record) => ({
                onDoubleClick: () => handleEditClick(record),
                style: { cursor: 'pointer' }
              })}
            />
          </TableWrapper>
        )}

      {/* Add/Edit Tenant Modal */}
      <Modal
        show={pinaka.isOpen}
        onClose={handleClose}
        size="4xl"
      >
        <Modal.Header>{pinaka.isEditing ? "Edit Tenant" : "Add Tenant"}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <Tabs aria-label="Tenant form tabs">
              <Tabs.Item active title="Personal Information">
                <div className="space-y-4">
                  {/* Row 1: First Name, Middle Initial, Last Name */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-5">
                      <div>
                        <Label htmlFor="firstName" className="mb-2">
                          First Name <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                          id="firstName"
                          name="firstName"
                          placeholder="John"
                          value={form.values.firstName || ''}
                          onChange={(e) => form.setFieldsValue({ firstName: e.target.value })}
                          required
                          color={form.errors.firstName ? 'failure' : 'gray'}
                          helperText={form.errors.firstName}
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div>
                        <Label htmlFor="middleName" className="mb-2">M.I.</Label>
                        <TextInput
                          id="middleName"
                          name="middleName"
                          placeholder="M"
                          maxLength={2}
                          value={form.values.middleName || ''}
                          onChange={(e) => form.setFieldsValue({ middleName: e.target.value.toUpperCase() })}
                          className="uppercase"
                        />
                      </div>
                    </div>
                    <div className="col-span-5">
                      <div>
                        <Label htmlFor="lastName" className="mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                          id="lastName"
                          name="lastName"
                          placeholder="Doe"
                          value={form.values.lastName || ''}
                          onChange={(e) => form.setFieldsValue({ lastName: e.target.value })}
                          required
                          color={form.errors.lastName ? 'failure' : 'gray'}
                          helperText={form.errors.lastName}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Email, Phone Number, Date of Birth */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4">
                      <div>
                        <Label htmlFor="email" className="mb-2">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <HiMail className="h-5 w-5 text-gray-400" />
                          </div>
                          <TextInput
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john.doe@example.com"
                            value={form.values.email || ''}
                            onChange={(e) => form.setFieldsValue({ email: e.target.value })}
                            required
                            className="pl-10"
                            color={form.errors.email ? 'failure' : 'gray'}
                            helperText={form.errors.email}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-span-4">
                      <div>
                        <Label htmlFor="phone" className="mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <PhoneNumberInput 
                          country={pinaka.country} 
                          value={form.values.phone || ''}
                          onChange={(e) => form.setFieldsValue({ phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-span-4">
                      <div>
                        <Label htmlFor="dateOfBirth" className="mb-2">
                          Date of Birth <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          value={form.values.dateOfBirth || ''}
                          onChange={(e) => form.setFieldsValue({ dateOfBirth: e.target.value })}
                          required
                          color={form.errors.dateOfBirth ? 'failure' : 'gray'}
                          helperText={form.errors.dateOfBirth}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Current Address with Autocomplete, City */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-8">
                      <div>
                        <Label htmlFor="currentAddress" className="mb-2">
                          Current Address <span className="text-red-500">*</span>
                        </Label>
                        <AddressAutocomplete
                          placeholder="Type an address (e.g., 123 Main St, Toronto)"
                          country={pinaka.country === 'CA' ? 'CA,US' : pinaka.country === 'US' ? 'CA,US' : 'CA,US'}
                          value={form.values.currentAddress || ''}
                          onSelect={(addressData) => {
                            const countryCode = addressData.country;
                            
                            if (countryCode === 'CA' || countryCode === 'US') {
                              pinaka.setCountry(countryCode);
                              
                              setTimeout(() => {
                                form.setFieldsValue({
                                  currentAddress: addressData.addressLine1,
                                  city: addressData.city,
                                  provinceState: addressData.provinceState,
                                  postalZip: addressData.postalZip,
                                  country: countryCode,
                                });
                              }, 50);
                            } else {
                              form.setFieldsValue({
                                currentAddress: addressData.addressLine1,
                                city: addressData.city,
                                provinceState: addressData.provinceState,
                                postalZip: addressData.postalZip,
                                country: countryCode,
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-span-4">
                      <div>
                        <Label htmlFor="city" className="mb-2">
                          City <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                          id="city"
                          name="city"
                          placeholder="Toronto"
                          value={form.values.city || ''}
                          onChange={(e) => form.setFieldsValue({ city: e.target.value })}
                          required
                          color={form.errors.city ? 'failure' : 'gray'}
                          helperText={form.errors.city}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Province, Postal Code, Country */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4">
                      <div>
                        <Label htmlFor="provinceState" className="mb-2">
                          {pinaka.countryRegion.getRegionLabel()} <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          id="provinceState"
                          name="provinceState"
                          value={form.values.provinceState || ''}
                          onChange={(e) => form.setFieldsValue({ provinceState: e.target.value })}
                          required
                        >
                          <option value="">Select...</option>
                          {pinaka.countryRegion.getRegions().map(region => (
                            <option key={region.code} value={region.code}region.code}</option>
                          ))}
                        </Select>
                      </div>
                    </div>
                    <div className="col-span-4">
                      <div>
                        <Label htmlFor="postalZip" className="mb-2">
                          {pinaka.countryRegion.getPostalLabel()} <span className="text-red-500">*</span>
                        </Label>
                        <PostalCodeInput 
                          country={pinaka.country} 
                          value={form.values.postalZip || ''}
                          onChange={(e) => form.setFieldsValue({ postalZip: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-span-4">
                      <div>
                        <Label htmlFor="country" className="mb-2">
                          Country <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          id="country"
                          name="country"
                          value={form.values.country || 'CA'}
                          onChange={(e) => {
                            const value = e.target.value;
                            pinaka.setCountry(value);
                            form.setFieldsValue({ 
                              country: value,
                              provinceState: pinaka.countryRegion.DEFAULT_REGIONS[value] 
                            });
                          }}
                          required
                        >
                          {pinaka.countryRegion.getCountries().map(c => (
                            <option key={c.code} value={c.code}c.name}</option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Row 5: Number of Occupants */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-3">
                      <div>
                        <Label htmlFor="numberOfAdults" className="mb-2">
                          Number of Adults <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                          id="numberOfAdults"
                          name="numberOfAdults"
                          type="number"
                          min={1}
                          max={20}
                          placeholder="1"
                          value={form.values.numberOfAdults || 1}
                          onChange={(e) => form.setFieldsValue({ numberOfAdults: parseInt(e.target.value) || 1 })}
                          required
                          color={form.errors.numberOfAdults ? 'failure' : 'gray'}
                          helperText={form.errors.numberOfAdults}
                        />
                      </div>
                    </div>
                    <div className="col-span-3">
                      <div>
                        <Label htmlFor="numberOfChildren" className="mb-2">Number of Children</Label>
                        <TextInput
                          id="numberOfChildren"
                          name="numberOfChildren"
                          type="number"
                          min={0}
                          max={20}
                          placeholder="0"
                          value={form.values.numberOfChildren || 0}
                          onChange={(e) => form.setFieldsValue({ numberOfChildren: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <div className="col-span-3">
                      <div>
                        <Label htmlFor="moveInDate" className="mb-2">
                          Move-in Date <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                          id="moveInDate"
                          name="moveInDate"
                          type="date"
                          value={form.values.moveInDate || ''}
                          onChange={(e) => form.setFieldsValue({ moveInDate: e.target.value })}
                          required
                          color={form.errors.moveInDate ? 'failure' : 'gray'}
                          helperText={form.errors.moveInDate}
                        />
                      </div>
                    </div>
                    <div className="col-span-3">
                      <div>
                        <Label htmlFor="leaseTerm" className="mb-2">
                          Lease Term <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          id="leaseTerm"
                          name="leaseTerm"
                          value={form.values.leaseTerm || ''}
                          onChange={(e) => form.setFieldsValue({ leaseTerm: e.target.value })}
                          required
                        >
                          <option value="">Select term</option>
                          <option value="6">6 Months</option>
                          <option value="12">12 Months</option>
                          <option value="18">18 Months</option>
                          <option value="24">24 Months</option>
                          <option value="month-to-month">Month-to-Month</option>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </Tabs.Item>
              
              <Tabs.Item title="Emergency">
                <div className="space-y-4">
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className={index < emergencyContacts.length - 1 ? "mb-4 pb-4 border-b border-gray-200" : ""}>
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4">
                          <div>
                            <Label htmlFor={`contact-${index}-name`} className="mb-2">
                              Contact {index + 1} Name {index === 0 && <span className="text-red-500">*</span>}
                            </Label>
                            <TextInput
                              id={`contact-${index}-name`}
                              placeholder="Jane Doe"
                              value={contact.contactName}
                              onChange={(e) => {
                                const updated = [...emergencyContacts];
                                updated[index].contactName = e.target.value;
                                setEmergencyContacts(updated);
                              }}
                              required={index === 0}
                            />
                          </div>
                        </div>
                        <div className="col-span-4">
                          <div>
                            <Label htmlFor={`contact-${index}-email`} className="mb-2">Contact {index + 1} Email</Label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <HiMail className="h-5 w-5 text-gray-400" />
                              </div>
                              <TextInput
                                id={`contact-${index}-email`}
                                type="email"
                                placeholder="jane.doe@example.com"
                                value={contact.email}
                                onChange={(e) => {
                                  const updated = [...emergencyContacts];
                                  updated[index].email = e.target.value;
                                  setEmergencyContacts(updated);
                                }}
                                className="pl-10"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-span-4">
                          <div>
                            <Label htmlFor={`contact-${index}-phone`} className="mb-2">
                              Contact {index + 1} Phone {index === 0 && <span className="text-red-500">*</span>}
                            </Label>
                            <PhoneNumberInput
                              country={pinaka.country}
                              value={contact.phone}
                              onChange={(e) => {
                                const updated = [...emergencyContacts];
                                updated[index].phone = e.target.value;
                                setEmergencyContacts(updated);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Tabs.Item>
              
              <Tabs.Item title="Employer">
                <div className="space-y-6">
                  {employers.map((employer, index) => (
                    <div key={index} className={index < employers.length - 1 ? "mb-6 pb-6 border-b border-gray-200" : ""}>
                      <div className="grid grid-cols-12 gap-4 mb-4">
                        <div className="col-span-4">
                          <div>
                            <Label htmlFor={`employer-${index}-name`} className="mb-2">
                              Employer Name <span className="text-red-500">*</span>
                            </Label>
                            <TextInput
                              id={`employer-${index}-name`}
                              placeholder="ABC Corporation"
                              value={employer.employerName}
                              onChange={(e) => {
                                const updated = [...employers];
                                updated[index].employerName = e.target.value;
                                setEmployers(updated);
                              }}
                              required
                              color={!employer.employerName ? 'failure' : 'gray'}
                              helperText={!employer.employerName ? 'Please enter employer name' : ''}
                            />
                          </div>
                        </div>
                        <div className="col-span-4">
                          <div>
                            <Label htmlFor={`employer-${index}-title`} className="mb-2">Job Title</Label>
                            <TextInput
                              id={`employer-${index}-title`}
                              placeholder="Software Engineer"
                              value={employer.jobTitle}
                              onChange={(e) => {
                                const updated = [...employers];
                                updated[index].jobTitle = e.target.value;
                                setEmployers(updated);
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-span-4">
                          <div>
                            <Label htmlFor={`employer-${index}-income`} className="mb-2">Annual Income</Label>
                            <CurrencyInput
                              country={pinaka.country}
                              value={employer.income}
                              onChange={(value) => {
                                const updated = [...employers];
                                updated[index].income = value;
                                setEmployers(updated);
                              }}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-12 gap-4 mb-4">
                        <div className="col-span-6">
                          <div>
                            <Label htmlFor={`employer-${index}-startDate`} className="mb-2">Employment Start Date</Label>
                            <TextInput
                              id={`employer-${index}-startDate`}
                              type="date"
                              value={employer.startDate || ''}
                              onChange={(e) => {
                                const updated = [...employers];
                                updated[index].startDate = e.target.value || null;
                                setEmployers(updated);
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-span-6">
                          <div>
                            <Label htmlFor={`employer-${index}-payFrequency`} className="mb-2">Pay Frequency</Label>
                            <Select
                              id={`employer-${index}-payFrequency`}
                              value={employer.payFrequency || ''}
                              onChange={(e) => {
                                const updated = [...employers];
                                updated[index].payFrequency = e.target.value || null;
                                setEmployers(updated);
                              }}
                            >
                              <option value="">Select frequency</option>
                              <option value="weekly">Weekly</option>
                              <option value="biweekly">Bi-weekly</option>
                              <option value="monthly">Monthly</option>
                              <option value="semimonthly">Semi-monthly</option>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <Label htmlFor={`employer-${index}-address`} className="mb-2">Employer Address</Label>
                        <Textarea
                          id={`employer-${index}-address`}
                          rows={2}
                          placeholder="123 Business St, Suite 100, City, State, ZIP"
                          value={employer.employerAddress}
                          onChange={(e) => {
                            const updated = [...employers];
                            updated[index].employerAddress = e.target.value;
                            setEmployers(updated);
                          }}
                        />
                      </div>
                      
                      <div>
                        <Label className="mb-2">Employment Letters</Label>
                        <div className="mt-2">
                          <ActionButton
                            action="add"
                            icon={<HiCloudUpload className="h-4 w-4" />}
                            onClick={() => {
                              notify.info('File upload functionality coming soon');
                            }}
                            showText={true}
                            text="Upload Document"
                          />
                          {employer.documents && employer.documents.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {employer.documents.map((doc, docIndex) => (
                                <div key={docIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <HiDocumentText className="h-5 w-5 text-gray-500" />
                                    <span>{doc.fileName}</span>
                                  </div>
                                  <ActionButton
                                    action="delete"
                                    size="small"
                                    onClick={() => {
                                      const updated = [...employers];
                                      updated[index].documents.splice(docIndex, 1);
                                      setEmployers(updated);
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Tabs.Item>
            </Tabs>

            <div className="mt-6 flex justify-end gap-3">
              {pinaka.renderFormButtons({ hideCancel: true })}
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Invite Tenant Modal with Flowbite Pro styling */}
      <Modal
        show={inviteModalVisible}
        onClose={() => {
          closeInviteModal();
          inviteForm.resetFields();
        }}
        size="md"
        className="[&>div]:rounded-lg"
      >
        <Modal.Header className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <HiUserAdd className="h-6 w-6 text-blue-600" />
              Invite New Tenant
            </h3>
            <button
              onClick={() => {
                closeInviteModal();
                inviteForm.resetFields();
              }}
              className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white transition-colors"
            >
              <HiX className="h-5 w-5" />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
        </Modal.Header>
        <Modal.Body className="p-6">
          <form id="invite-form" onSubmit={handleInviteFormSubmit} className="space-y-4">
            <div>
              <Label htmlFor="invite-email" className="mb-2">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <HiMail className="h-5 w-5 text-gray-400" />
                </div>
                <TextInput
                  id="invite-email"
                  name="email"
                  type="email"
                  placeholder="tenant@example.com"
                  value={inviteForm.values.email || ''}
                  onChange={(e) => inviteForm.setFieldsValue({ email: e.target.value })}
                  required
                  className="pl-10"
                  color={inviteForm.errors.email ? 'failure' : 'gray'}
                  helperText={inviteForm.errors.email}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invite-firstName" className="mb-2">First Name (Optional)</Label>
                <TextInput
                  id="invite-firstName"
                  name="firstName"
                  placeholder="John"
                  value={inviteForm.values.firstName || ''}
                  onChange={(e) => inviteForm.setFieldsValue({ firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="invite-lastName" className="mb-2">Last Name (Optional)</Label>
                <TextInput
                  id="invite-lastName"
                  name="lastName"
                  placeholder="Doe"
                  value={inviteForm.values.lastName || ''}
                  onChange={(e) => inviteForm.setFieldsValue({ lastName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="invite-phone" className="mb-2">Phone Number (Optional)</Label>
              <PhoneNumberInput 
                country={pinaka.country} 
                value={inviteForm.values.phone || ''}
                onChange={(e) => inviteForm.setFieldsValue({ phone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="invite-expiresInDays" className="mb-2">
                Invitation Expires In (Days)
                <Tooltip content="How many days until the invitation expires">
                  <span className="ml-1 text-gray-400 cursor-help">ℹ️</span>
                </Tooltip>
              </Label>
              <TextInput
                id="invite-expiresInDays"
                name="expiresInDays"
                type="number"
                min={1}
                max={30}
                value={inviteForm.values.expiresInDays || 14}
                onChange={(e) => inviteForm.setFieldsValue({ expiresInDays: parseInt(e.target.value) || 14 })}
              />
            </div>

          </form>
        </Modal.Body>
        <Modal.Footer className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              color="gray"
              onClick={() => {
                closeInviteModal();
                inviteForm.resetFields();
              }}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="invite-form"
              color="blue"
              className="min-w-[150px] flex items-center justify-center gap-2"
            >
              <HiPaperAirplane className="h-4 w-4" />
              Send Invitation
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Approve Tenant Modal with Flowbite Pro styling */}
      <Modal
        show={approvalModalVisible}
        onClose={() => {
          closeApprovalModal();
        }}
        size="md"
        className="[&>div]:rounded-lg"
      >
        <Modal.Header className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <HiCheckCircle className="h-6 w-6 text-green-600" />
              Approve Tenant Application
            </h3>
            <button
              onClick={() => closeApprovalModal()}
              className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white transition-colors"
            >
              <HiX className="h-5 w-5" />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
        </Modal.Header>
        <Modal.Body className="p-6">
          {selectedTenantForApproval && (
            <div>
              <Alert color="info" className="mb-4">
                <div>
                  <h3 className="font-semibold mb-2">Approve Application</h3>
                  <p className="text-sm mb-2">Are you sure you want to approve the application for:</p>
                  <p className="text-base font-semibold mb-1">
                    {selectedTenantForApproval.firstName} {selectedTenantForApproval.lastName}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    {selectedTenantForApproval.email}
                  </p>
                  <hr className="my-4" />
                  <p className="text-sm text-gray-600">
                    Once approved, the tenant will be able to access the system and will be prompted to upload required documents.
                  </p>
                </div>
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-end gap-3 w-full">
            <Button 
              color="gray" 
              onClick={() => closeApprovalModal()}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button 
              color="success" 
              onClick={handleApprove}
              disabled={approving}
              className="min-w-[120px] flex items-center justify-center gap-2"
            >
              {approving ? (
                <>
                  <Spinner size="sm" />
                  Approving...
                </>
              ) : (
                <>
                  <HiCheckCircle className="h-4 w-4" />
                  Approve
                </>
              )}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Reject Tenant Modal with Flowbite Pro styling */}
      <Modal
        show={rejectModalVisible}
        onClose={() => {
          closeRejectModal();
          rejectForm.resetFields();
        }}
        size="md"
        className="[&>div]:rounded-lg"
      >
        <Modal.Header className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <HiXCircle className="h-6 w-6 text-red-600" />
              Reject Tenant Application
            </h3>
            <button
              onClick={() => {
                closeRejectModal();
                rejectForm.resetFields();
              }}
              className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white transition-colors"
            >
              <HiX className="h-5 w-5" />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
        </Modal.Header>
        <Modal.Body className="p-6">
          {selectedTenantForApproval && (
            <form onSubmit={handleRejectFormSubmit} className="space-y-4">
              <Alert color="warning" className="mb-4">
                <div>
                  <h3 className="font-semibold mb-2">Reject Application</h3>
                  <p className="text-sm mb-2">You are about to reject the application for:</p>
                  <p className="text-base font-semibold mb-1">
                    {selectedTenantForApproval.firstName} {selectedTenantForApproval.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedTenantForApproval.email}
                  </p>
                </div>
              </Alert>

              <div>
                <Label htmlFor="reject-reason" className="mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reject-reason"
                  name="reason"
                  rows={4}
                  placeholder="Please explain why this application is being rejected. This will be sent to the tenant."
                  value={rejectForm.values.reason || ''}
                  onChange={(e) => rejectForm.setFieldsValue({ reason: e.target.value })}
                  required
                  color={rejectForm.errors.reason ? 'failure' : 'gray'}
                  helperText={rejectForm.errors.reason || 'Reason must be at least 10 characters'}
                />
              </div>

            </form>
          )}
        </Modal.Body>
        <Modal.Footer className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              color="gray"
              onClick={() => {
                closeRejectModal();
                rejectForm.resetFields();
              }}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="reject-form"
              color="failure"
              disabled={rejecting}
              className="min-w-[150px] flex items-center justify-center gap-2"
            >
              {rejecting ? (
                <>
                  <Spinner size="sm" />
                  Rejecting...
                </>
              ) : (
                <>
                  <HiXCircle className="h-4 w-4" />
                  Reject Application
                </>
              )}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
      </PageLayout>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default React.memo(TenantsClient, (prevProps, nextProps) => {
  return (
    prevProps.initialTenants === nextProps.initialTenants &&
    prevProps.user?.id === nextProps.user?.id
  );
});
