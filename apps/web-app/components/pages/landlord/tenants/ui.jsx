"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Tabs,
  Popconfirm,
  Card,
  Row,
  Col,
  Avatar,
  App,
  Divider,
} from 'antd';
import { PageLayout, EmptyState, TableWrapper } from '@/components/shared';
import { notify } from '@/lib/utils/notification-helper';
import { rules, ruleCombos } from '@/lib/utils/validation-rules';
import { ActionButton, IconButton } from '@/components/shared/buttons';
// Lazy load Pro components to reduce initial bundle size (~200KB savings)
import { ProTable, ProForm } from '@/components/shared/LazyProComponents';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  CloseOutlined,
  UploadOutlined,
  FileOutlined,
  DeleteFilled,
  SearchOutlined,
  UserAddOutlined,
  ReloadOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
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
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import { usePolling } from '@/lib/hooks/usePolling';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { ValidationHelpers } from '@/lib/utils/unified-validation';
import { useLoading } from '@/lib/hooks/useLoading';
// Lazy load logger to avoid server-side execution issues
// Use relative path since require doesn't always work with path aliases
let logger;
try {
  if (typeof window !== 'undefined') {
    // Client-side: use relative path from components/pages/landlord/tenants to lib
    logger = require('@/lib/logger');
  } else {
    // Server-side mock
    logger = {
      form: () => {},
      error: () => {},
      info: () => {},
      warn: () => {},
    };
  }
} catch (error) {
  // Fallback if logger can't be loaded
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

const { Title, Text } = Typography;

function TenantsClient({ initialTenants, user }) {
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const { message } = App.useApp(); // Use App's message API instead of static
  const { selectedProperty } = useProperty();
  
  // Check permissions (PMC-managed landlords cannot create tenants)
  const permissions = usePermissions(user || { role: 'landlord' });
  
  // Approval workflow state
  const { isOpen: approvalModalVisible, open: openApprovalModal, close: closeApprovalModal, editingItem: selectedTenant, openForEdit: openApprovalModalForEdit } = useModalState();
  const { isOpen: rejectModalVisible, open: openRejectModal, close: closeRejectModal, openForEdit: openRejectModalForEdit } = useModalState();
  const { loading: approving, withLoading: withApproving } = useLoading();
  const { loading: rejecting, withLoading: withRejecting } = useLoading();
  
  // API error handler
  const { fetch } = useUnifiedApi({ showUserMessage: true });
  
  // Tenant form data management hook
  const tenantFormData = useTenantFormData({ country: 'CA' });
  const { emergencyContacts, employers, setEmergencyContacts, setEmployers } = tenantFormData;
  
  // Form data sanitizer
  const { sanitizeFormData } = useFormDataSanitizer({ country: 'CA' });
  
  // 🎯 PINAKA UNIFIED HOOK WITH ADDRESS - Combines CRUD + Country/Region management!
  // Ensure initialTenants is always an array
  const safeInitialTenants = Array.isArray(initialTenants) ? initialTenants : [];
  
  const pinaka = usePinakaCRUDWithAddress({
    apiEndpoint: '/api/v1/tenants', // v1 endpoint
    domain: 'tenants', // Domain name for v1Api
    useV1Api: true, // Use v1Api client
    initialData: safeInitialTenants,
    entityName: 'Tenant',
    initialCountry: 'CA',
    messages: {
      createSuccess: 'Tenant created successfully',
      updateSuccess: 'Tenant updated successfully',
      deleteSuccess: 'Tenant deleted successfully'
    },
    defaultFormData: { country: "CA", provinceState: "ON" },
    // Format dates before sending to API
    onBeforeCreate: (payload) => {
      logger.form('Tenant form submitted', { mode: 'add', values: payload });
      
      // Ensure phone is a string (handle formatted strings, objects, or null)
      let phoneString = payload.phone;
      if (phoneString) {
        if (typeof phoneString === 'object') {
          phoneString = phoneString.value || phoneString.phone || phoneString.formatted || null;
        }
        // Convert to string and trim, but keep the formatted version
        // The sanitizer will unformat it for storage (digits only)
        phoneString = String(phoneString).trim();
        // If empty after trimming, set to null
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
          // Extract string from address object
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
      // If empty after processing, set to null
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
        // Convert to string and trim, but keep the formatted version
        // The sanitizer will unformat it for storage (digits only)
        phoneString = String(phoneString).trim();
        // If empty after trimming, set to null
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
          // Extract string from address object
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
      // If empty after processing, set to null
      if (addressString === '') {
        addressString = null;
      }
      
      // Prepare tenant data using the hook
      // Ensure moveInDate and leaseTerm are properly included
      const tenantData = tenantFormData.prepareTenantData({
        ...payload,
        phone: phoneString,
        currentAddress: addressString,
        leaseTerm: payload.leaseTerm || null, // Explicitly include leaseTerm
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
      prefix: <TeamOutlined />,
    },
    {
      title: 'Active Leases',
      value: tenantsData.filter(t => t.leaseTenants?.some(lt => lt.lease?.status === 'Active')).length,
      prefix: <CheckCircleOutlined />,
      valueStyle: { color: '#52c41a' },
    },
  ];

  // Memoize handleAddClick to prevent unnecessary re-renders and fix useEffect dependency
  const handleAddClick = useCallback(() => {
    logger.action('Tenant: Add button clicked');
    logger.modal('Tenant modal opened', { mode: 'add' });
    pinaka.setCountry("CA");  // Use composite hook shortcut
    form.resetFields();
    form.setFieldsValue({ country: "CA", provinceState: "ON" });
    // Reset emergency contacts and employers to defaults
    setEmergencyContacts([
      { contactName: '', email: '', phone: '', isPrimary: true },
      { contactName: '', email: '', phone: '', isPrimary: false }
    ]);
    setEmployers([
      { employerName: '', employerAddress: '', income: null, jobTitle: '', startDate: null, payFrequency: null, isCurrent: true, documents: [] }
    ]);
    pinaka.openAdd();
  }, [pinaka, form, setEmergencyContacts, setEmployers]);

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      handleAddClick();
    }
  }, [searchParams, handleAddClick]);

  // Auto-refresh tenants list every 30 seconds to show newly accepted invitations
  // Using longer interval to reduce compiler load and API calls
  const { startPolling, stopPolling } = usePolling({
    callback: async () => {
      try {
        await pinaka.refresh();
      } catch (error) {
        // Silently fail to prevent error loops
        console.warn('Polling refresh failed:', error);
      }
    },
    interval: 30000, // 30 seconds (increased from 10s to reduce load)
    enabled: true,
    immediate: false
  });

  useEffect(() => {
    // Only start polling when component is mounted and visible
    if (typeof window !== 'undefined') {
      startPolling();
      return () => stopPolling();
    }
  }, [startPolling, stopPolling]); // Include polling functions in deps

  const handleEditClick = useCallback((tenant) => {
    logger.action('Tenant: Edit button clicked', { tenantId: tenant.id, tenantName: `${tenant.firstName} ${tenant.lastName}` });
    logger.modal('Tenant modal opened', { mode: 'edit', tenantId: tenant.id });
    pinaka.setCountry(tenant.country || "CA");  // Use composite hook shortcut
    
    // Extract phone - handle formatted strings, objects, or null
    let phoneValue = tenant.phone || "";
    if (phoneValue && typeof phoneValue === 'object') {
      phoneValue = phoneValue.value || phoneValue.phone || phoneValue.formatted || "";
    }
    
    // Format phone number for display in form (application standard: (XXX) XXX-XXXX)
    // Always format phone number if it exists and is a string
    if (phoneValue && typeof phoneValue === 'string' && phoneValue.trim()) {
      // Remove any existing formatting and re-format
      const digitsOnly = phoneValue.replace(/\D/g, '');
      if (digitsOnly.length >= 10) {
        phoneValue = formatPhoneNumber(digitsOnly);
      } else if (phoneValue.length > 0) {
        // Format even if incomplete
        phoneValue = formatPhoneNumber(phoneValue);
      }
    }
    
    // Extract address - handle objects or strings
    let addressValue = tenant.currentAddress || "";
    if (addressValue && typeof addressValue === 'object' && addressValue !== null) {
      // Extract string from address object
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
      dateOfBirth: tenant.dateOfBirth ? dayjs(tenant.dateOfBirth).startOf('day') : undefined,
      currentAddress: addressValue,
      numberOfAdults: tenant.numberOfAdults || 1,
      numberOfChildren: tenant.numberOfChildren || 0,
      moveInDate: tenant.moveInDate ? dayjs(tenant.moveInDate).startOf('day') : undefined,
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
      // Ensure at least 2 slots
      while (contacts.length < 2) {
        contacts.push({ contactName: '', email: '', phone: '', isPrimary: false });
      }
      setEmergencyContacts(contacts);
    } else {
      // Use legacy fields if no new emergency contacts
      setEmergencyContacts([
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
      // Use legacy fields if no new employer data
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
  const [inviteForm] = Form.useForm();
  const [invitations, setInvitations] = useState([]);
  const { loading: loadingInvitations, withLoading: withLoadingInvitations } = useLoading();
  const [showPendingInvitations, setShowPendingInvitations] = useState(false);

  // Load invitations
  useEffect(() => {
    loadInvitations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadInvitations() {
    return await withLoadingInvitations(async () => {
      const { v1Api } = await import('@/lib/api/v1-client');
      const data = await v1Api.specialized.listTenantInvitations();
      // Handle standardized API response format
      const invitationsData = data?.data?.invitations || data?.invitations || [];
      setInvitations(invitationsData);
      return invitationsData; // Return the invitations for use in callbacks
    }).catch((error) => {
      // Error already handled
      setInvitations([]);
      return [];
    });
  }

  async function sendInvitation(tenant) {
    logger.action('Tenant: Send invitation clicked', { tenantId: tenant.id, tenantEmail: tenant.email });
    try {
      const { v1Api } = await import('@/lib/api/v1-client');
      const data = await v1Api.specialized.createTenantInvitation({
        email: tenant.email,
        prefillData: {
          firstName: tenant.firstName,
          lastName: tenant.lastName,
          phone: tenant.phone,
          email: tenant.email,
        },
      });
      logger.apiResponse('POST', '/api/v1/tenants/invitations', 200, data);
      notify.success(`Invitation sent to ${tenant.firstName} ${tenant.lastName}`);
      await loadInvitations(); // Refresh invitations list
    } catch (error) {
      logger.apiError('POST', '/api/v1/tenants/invitations', error);
      notify.error(error.message || 'Failed to send invitation');
    }
  }

  async function inviteNewTenant(values) {
    try {
      const { v1Api } = await import('@/lib/api/v1-client');
      const data = await v1Api.specialized.createTenantInvitation({
        email: values.email,
        prefillData: {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
        },
        expiresInDays: values.expiresInDays || 14,
      });
      
      // Success
      const responseData = data?.data || data;
      
      // Close modal immediately for better UX
      closeInviteModal();
      inviteForm.resetFields();
      
      // Show success message
      if (responseData?.warning) {
        notify.warning(responseData.warning);
      } else {
        notify.success(`Invitation sent to ${values.email}`);
      }
      
      // Refresh invitations list in background (non-blocking)
      loadInvitations().catch(err => {
        console.error('[Invite Tenant] Error refreshing invitations:', err);
      });
    } catch (error) {
      console.error('[Invite Tenant] Error:', error);
      
      // Check if it's a duplicate invitation error (409 Conflict)
      if (error?.message?.includes('already exists') || error?.message?.includes('INVITATION_EXISTS') || error?.message?.includes('TENANT_EXISTS')) {
        let invitationId;
        
        // Try to extract invitation ID from error message or load invitations
        try {
          const loadedInvitations = await loadInvitations();
          const existingInvitation = loadedInvitations.find(inv => 
            inv.email === values.email && 
            ['pending', 'sent', 'opened'].includes(inv.status)
          );
          if (existingInvitation) {
            invitationId = existingInvitation.id;
            console.log('[Invite Tenant] Found existing invitation:', invitationId);
          }
        } catch (e) {
          console.error('[Invite Tenant] Error loading invitations:', e);
        }
        
        // Show modal with resend option
        Modal.confirm({
          title: 'Invitation Already Exists',
          content: (
            <div>
              <p>An active invitation already exists for <strong>{values.email}</strong>.</p>
              <p style={{ marginTop: 8, color: '#666', fontSize: 13 }}>
                Would you like to resend it? The invitation will appear in the "Pending Invitations" section above the tenants table.
              </p>
            </div>
          ),
          okText: 'Yes, Resend',
          cancelText: 'Cancel',
          width: 500,
          onOk: async () => {
            if (invitationId) {
              try {
                await resendInvitation(invitationId);
                notify.success(`Invitation resent to ${values.email}`);
                closeInviteModal();
                inviteForm.resetFields();
                await loadInvitations(); // Refresh to show in pending section
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
            // User cancelled, just close the modal
            closeInviteModal();
            inviteForm.resetFields();
          }
        });
        return; // Don't show default error
      }
      
      // For other errors, show error message
      notify.error(error?.message || 'Failed to send invitation. Please try again.');
    }
  }

  async function resendInvitation(invitationId) {
    try {
      console.log('[Resend Invitation] Attempting to resend:', invitationId);
      const { v1Api } = await import('@/lib/api/v1-client');
      const data = await v1Api.specialized.resendTenantInvitation(invitationId);
      console.log('[Resend Invitation] Response:', data);
      
      // Success response
      if (data?.data?.message || data?.success) {
        notify.success('Invitation resent successfully');
        await loadInvitations(); // Refresh to update status
      } else {
        // Check if there's a warning or error in the response
        if (data?.data?.warning) {
          notify.warning(data.data.warning);
        } else if (data?.error) {
          const errorMsg = typeof data.error === 'string' 
            ? data.error 
            : (data.error?.message || 'Failed to resend invitation');
          notify.error(errorMsg);
        } else {
          notify.success('Invitation resent successfully');
        }
        await loadInvitations();
      }
    } catch (error) {
      console.error('[Resend Invitation] Error:', error);
      notify.error(error instanceof Error ? error.message : 'Failed to resend invitation');
      // Just refresh invitations list in case status changed
      await loadInvitations();
    }
  }

  async function cancelInvitation(invitationId) {
    try {
      const { v1Api } = await import('@/lib/api/v1-client');
      await v1Api.specialized.cancelTenantInvitation(invitationId);
      notify.success('Invitation cancelled');
      await loadInvitations();
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
    pinaka.setCountry("CA");  // Reset to default using composite hook
  }

  // Approval workflow handlers
  function handleApproveClick(tenant) {
    setSelectedTenant(tenant);
    setApprovalModalVisible(true);
  }

  function handleRejectClick(tenant) {
    setSelectedTenant(tenant);
    rejectForm.resetFields();
    setRejectModalVisible(true);
  }

  async function handleApprove() {
    if (!selectedTenant) return;
    
    await withApproving(async () => {
      // Use v1Api for tenant approval
      const { apiClient } = await import('@/lib/utils/api-client');
      const response = await apiClient(`/api/v1/tenants/${selectedTenant.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to approve tenant');
      }
      
      notify.success('Tenant application approved successfully');
      closeApprovalModal();
      await pinaka.refresh();
    });
  }

  async function handleReject(values) {
    if (!selectedTenant) return;
    
    await withRejecting(async () => {
      // Use v1Api for tenant rejection
      const { apiClient } = await import('@/lib/utils/api-client');
      const response = await apiClient(`/api/v1/tenants/${selectedTenant.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: values.reason }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to reject tenant');
      }
      
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
          <Space>
            <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <Text strong>{tenant.firstName} {tenant.lastName}</Text>
          </Space>
        ),
      }),
      sortFunctions.string('firstName')
    ),
    withSorter(
      customizeColumn(TENANT_COLUMNS.EMAIL, {
        render: (email) => <Text>{email}</Text>,
      }),
      sortFunctions.string('email')
    ),
    withSorter(
      customizeColumn(TENANT_COLUMNS.PHONE, {
        dataIndex: 'phone',
        render: (phone, tenant) => {
          // Handle phone - check tenant object directly first (most reliable)
          let phoneValue = tenant?.phone || phone;
          
          if (phoneValue && typeof phoneValue === 'object') {
            phoneValue = phoneValue.value || phoneValue.phone || phoneValue.formatted || null;
          }
          
          if (!phoneValue || (typeof phoneValue === 'string' && phoneValue.trim() === '')) {
            return <Text type="secondary">—</Text>;
          }
          
          try {
            // Extract digits only and format
            const digitsOnly = String(phoneValue).replace(/\D/g, '');
            if (digitsOnly.length >= 10) {
              const formatted = formatPhoneNumber(digitsOnly);
              return formatted ? <Text>{formatted}</Text> : <Text type="secondary">—</Text>;
            } else if (digitsOnly.length > 0) {
              // Format even if incomplete
              const formatted = formatPhoneNumber(digitsOnly);
              return formatted ? <Text>{formatted}</Text> : <Text type="secondary">—</Text>;
            }
            return <Text type="secondary">—</Text>;
          } catch (error) {
            // Silently handle formatting errors in production
            return <Text type="secondary">—</Text>;
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
        // Handle address - check tenant object directly first (most reliable)
        let addressValue = tenant?.currentAddress || address;
        let addressString = '';
        
        if (addressValue) {
          if (typeof addressValue === 'object' && addressValue !== null) {
            // Skip React components and other non-serializable objects
            if (addressValue.$$typeof) {
              // This is a React component, skip it
              addressString = '';
            } else {
              // Extract string from address object
              // Try common address object properties in order of preference
              addressString = addressValue.formattedAddress 
                || addressValue.addressLine1 
                || addressValue.address
                || addressValue.street 
                || addressValue.line1
                || addressValue.fullAddress
                || '';
              
              // Try to build from number + street if available
              if (!addressString && addressValue.number && addressValue.street) {
                addressString = `${addressValue.number} ${addressValue.street}`.trim();
              }
              
              // If still no string found, try to find any string property (but avoid circular refs)
              if (!addressString) {
                try {
                  const keys = Object.keys(addressValue).slice(0, 10); // Limit to first 10 keys to avoid issues
                  for (const key of keys) {
                    const value = addressValue[key];
                    if (typeof value === 'string' && value && value.length < 200 && key !== 'fullAddress') {
                      addressString = value;
                      break;
                    }
                  }
                } catch (e) {
                  // Ignore errors from circular references
                  addressString = '';
                }
              }
            }
          } else {
            addressString = String(addressValue).trim();
          }
        }
        
        // Build full address: street address, city, province, postal code
        // Always include street address first if available, then city, province, postal code
        const parts = [];
        if (addressString) parts.push(addressString);
        if (tenant?.city) parts.push(tenant.city);
        if (tenant?.provinceState) parts.push(tenant.provinceState);
        if (tenant?.postalZip) parts.push(tenant.postalZip);
        
        if (parts.length === 0) return <Text type="secondary">—</Text>;
        const fullAddress = parts.join(', ');
        return <Text title={fullAddress}>{fullAddress}</Text>;
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
      filters: [
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
          <Space direction="vertical" size="small">
            {hasActiveLease ? (
              <Tag color="success">Active Lease</Tag>
            ) : (
              <Tag color="default">No Active Lease</Tag>
            )}
            {pendingInvitation && (
              <Tag color="processing" icon={<SendOutlined />}>
                Invitation {pendingInvitation.status}
              </Tag>
            )}
          </Space>
        );
      },
      filters: [
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
          <Space size="small">
            {isPending && (
              <>
                <IconButton
                  icon={<SaveOutlined />}
                  onClick={() => handleApproveClick(tenant)}
                  tooltip="Approve Application"
                  type="primary"
                />
                <IconButton
                  icon={<CloseCircleOutlined />}
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
                icon={<SendOutlined />}
                onClick={() => sendInvitation(tenant)}
                tooltip="Send Invitation"
                type="default"
              />
            )}
            <Popconfirm
              title="Delete tenant?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(tenant)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <ActionButton
                action="delete"
                tooltip="Delete Tenant"
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  // Configure columns with standard settings
  const configuredColumns = configureTableColumns(columns, {
    addSorting: false, // Keep existing sorters
    centerAlign: true,
    addWidths: false, // Keep existing widths
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

  return (
    <div style={{ padding: '12px 16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PropertyContextBanner userRole="landlord" />
      <PageLayout
        headerTitle={<><TeamOutlined /> Tenants</>}
        headerActions={[
          permissions.canEditTenants && (
            <Button
              key="add"
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddClick}
            >
              Add Tenant
            </Button>
          ),
          permissions.canEditTenants && (
            <Button
              key="invite"
              icon={<UserAddOutlined />}
              onClick={openInviteModalForCreate}
            >
              Invite Tenant
            </Button>
          ),
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={pinaka.refresh}
          >
            Refresh
          </Button>,
        ]}
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
          <Card 
            style={{ marginBottom: 12 }}
            size="small"
            title={
              <Space>
                <SendOutlined />
                <span>Pending Invitations ({pendingInvitations.length})</span>
              </Space>
            }
            extra={
              <IconButton
                icon={<ReloadOutlined />}
                onClick={loadInvitations}
                tooltip="Refresh Invitations"
              />
            }
          >
            <Table
              dataSource={pendingInvitations}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                {
                  title: 'Email',
                  dataIndex: 'email',
                  key: 'email',
                  render: (email) => <Text strong>{email}</Text>,
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Tag color={status === 'sent' ? 'blue' : status === 'opened' ? 'cyan' : 'orange'}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Tag>
                  ),
                },
                {
                  title: 'Sent',
                  dataIndex: 'createdAt',
                  key: 'createdAt',
                  render: (date) => date ? dayjs(date).format('MMM D, YYYY') : '-',
                },
                {
                  title: 'Expires',
                  dataIndex: 'expiresAt',
                  key: 'expiresAt',
                  render: (date) => {
                    const expiresDate = new Date(date);
                    const isExpiringSoon = expiresDate.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000; // 3 days
                    return (
                      <Text type={isExpiringSoon ? 'warning' : 'secondary'}>
                        {dayjs(date).format('MMM D, YYYY')}
                      </Text>
                    );
                  },
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  width: 150,
                  render: (_, invitation) => (
                    <Space size="small">
                      <IconButton
                        icon={<SendOutlined />}
                        onClick={() => resendInvitation(invitation.id)}
                        tooltip="Resend Invitation"
                        type="default"
                      />
                      <Popconfirm
                        title="Cancel invitation?"
                        description="This will cancel the invitation and it cannot be resent."
                        onConfirm={() => cancelInvitation(invitation.id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                      >
                        <IconButton
                          icon={<CloseOutlined />}
                          tooltip="Cancel Invitation"
                          type="default"
                        />
                      </Popconfirm>
                    </Space>
                  ),
                },
              ]}
            />
          </Card>
        )}

        {pinaka.data.length === 0 ? (
          <EmptyState
            icon={<UserOutlined />}
            title="No tenants yet"
            description="Click 'Add Tenant' to add your first tenant"
          />
        ) : (
          <TableWrapper>
            <ProTable
              {...tableProps}
              dataSource={filteredData}
              rowKey="id"
              loading={pinaka.loading}
              search={false}
              toolBarRender={false}
              pagination={{
                pageSize: 25,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} tenants`,
              }}
              size="middle"
              onRow={(record) => ({
                onDoubleClick: () => handleEditClick(record),
                style: { cursor: 'pointer' }
              })}
            />
          </TableWrapper>
        )}

      {/* Add/Edit Tenant Modal */}
      <Modal
        title={pinaka.isEditing ? "Edit Tenant" : "Add Tenant"}
        open={pinaka.isOpen}
        onCancel={handleClose}
        footer={null}
        width={700}
      >
        <ProForm
          form={form}
          layout="vertical"
          onFinish={pinaka.handleSubmit}
          preserve={true}
          style={{ marginTop: 0 }}
          size="small"
          submitter={{
            render: (props, doms) => {
              return (
                <div style={{ marginBottom: 0, marginTop: 24 }}>
                  {pinaka.renderFormButtons({ hideCancel: true })}
                </div>
              );
            }
          }}
        >
          <Tabs 
            defaultActiveKey="1"
            destroyInactiveTabPane={false}
            items={[
              {
                key: '1',
                label: 'Personal Information',
                children: (
                  <>
                    {/* Row 1: First Name, Middle Initial, Last Name */}
                    <Row gutter={8}>
                      <Col span={8}>
                        <Form.Item
                          name="firstName"
                          label="First Name"
                          rules={[rules.required('First Name')]}
                          style={{ marginBottom: 12 }}
                        >
                          <Input placeholder="John" size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Form.Item
                          name="middleName"
                          label="M.I."
                          style={{ marginBottom: 12 }}
                        >
                          <Input placeholder="M" maxLength={2} size="large" style={{ textTransform: 'uppercase' }} />
                        </Form.Item>
                      </Col>
                      <Col span={14}>
                        <Form.Item
                          name="lastName"
                          label="Last Name"
                          rules={[rules.required('Last Name')]}
                          style={{ marginBottom: 12 }}
                        >
                          <Input placeholder="Doe" size="large" />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Row 2: Email, Phone Number, Date of Birth */}
                    <Row gutter={8}>
                      <Col span={8}>
                        <Form.Item
                          name="email"
                          label="Email"
                          rules={ruleCombos.requiredEmail}
                          style={{ marginBottom: 12 }}
                        >
                          <Input placeholder="john.doe@example.com" prefix={<MailOutlined />} size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="phone" label="Phone Number" rules={[rules.required('Phone number')]} style={{ marginBottom: 12 }}>
                          <PhoneNumberInput country={pinaka.country} size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item 
                          name="dateOfBirth" 
                          label="Date of Birth"
                          rules={[rules.required('Date of birth')]}
                          style={{ marginBottom: 12 }}
                        >
                          <DatePicker style={{ width: '100%' }} size="large" />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Row 3: Current Address with Autocomplete, City */}
                    <Row gutter={8}>
                      <Col span={16}>
                        <Form.Item 
                          name="currentAddress" 
                          label="Current Address"
                          rules={[rules.required('Address')]}
                          tooltip="Start typing an address to see autocomplete suggestions"
                          style={{ marginBottom: 12 }}
                        >
                          <AddressAutocomplete
                            placeholder="Type an address (e.g., 123 Main St, Toronto)"
                            country={pinaka.country === 'CA' ? 'CA,US' : pinaka.country === 'US' ? 'CA,US' : 'CA,US'}
                            size="large"
                            onSelect={(addressData) => {
                              // Country code is already normalized by AddressAutocomplete component
                              const countryCode = addressData.country;
                              
                              // Update country context first (this will update the region dropdown options)
                              if (countryCode === 'CA' || countryCode === 'US') {
                                pinaka.setCountry(countryCode);
                                
                                // Auto-fill address fields when address is selected
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
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="city" label="City" rules={[rules.required('City')]} style={{ marginBottom: 12 }}>
                          <Input placeholder="Toronto" size="large" />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Row 4: Province, Postal Code, Country */}
                    <Row gutter={8}>
                      <Col span={8}>
                        <Form.Item 
                          name="provinceState" 
                          label={pinaka.countryRegion.getRegionLabel()}
                          rules={[rules.required('Province/state')]}
                          style={{ marginBottom: 12 }}
                        >
                          <Select placeholder="ON" size="large" virtual={false}>
                            {pinaka.countryRegion.getRegions().map(region => (
                              <Select.Option key={region.code} value={region.code}>{region.code}</Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item 
                          name="postalZip" 
                          label={pinaka.countryRegion.getPostalLabel()}
                          rules={[rules.required('Postal/ZIP code')]}
                          style={{ marginBottom: 12 }}
                        >
                          <PostalCodeInput country={pinaka.country} size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item 
                          name="country" 
                          label="Country"
                          rules={[rules.required('Country')]}
                          style={{ marginBottom: 12 }}
                        >
                          <Select 
                            loading={pinaka.countryRegion.loading}
                            size="large"
                            virtual={false}
                            onChange={(value) => {
                              pinaka.setCountry(value);
                              form.setFieldsValue({ provinceState: pinaka.countryRegion.DEFAULT_REGIONS[value] });
                            }}
                          >
                            {pinaka.countryRegion.getCountries().map(c => (
                              <Select.Option key={c.code} value={c.code}>{c.name}</Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Row 5: Number of Occupants */}
                    <Row gutter={8}>
                      <Col span={6}>
                        <Form.Item 
                          name="numberOfAdults" 
                          label="Number of Adults"
                          rules={[rules.required('Number of adults')]}
                          initialValue={1}
                          style={{ marginBottom: 12 }}
                        >
                          <InputNumber 
                            min={1} 
                            max={20} 
                            style={{ width: '100%' }} 
                            placeholder="1" 
                            size="large"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item 
                          name="numberOfChildren" 
                          label="Number of Children"
                          initialValue={0}
                          style={{ marginBottom: 12 }}
                        >
                          <InputNumber 
                            min={0} 
                            max={20} 
                            style={{ width: '100%' }} 
                            placeholder="0" 
                            size="large"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item 
                          name="moveInDate" 
                          label="Move-in Date"
                          rules={[{ required: true, message: 'Please select move-in date' }]}
                          style={{ marginBottom: 12 }}
                        >
                          <DatePicker 
                            style={{ width: '100%' }} 
                            size="large"
                            placeholder="Select date"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item 
                          name="leaseTerm" 
                          label="Lease Term"
                          rules={[{ required: true, message: 'Please select lease term' }]}
                          style={{ marginBottom: 12 }}
                        >
                          <Select placeholder="Select term" size="large" virtual={false}>
                            <Select.Option value="6">6 Months</Select.Option>
                            <Select.Option value="12">12 Months</Select.Option>
                            <Select.Option value="18">18 Months</Select.Option>
                            <Select.Option value="24">24 Months</Select.Option>
                            <Select.Option value="month-to-month">Month-to-Month</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                )
              },
              {
                key: '2',
                label: 'Emergency',
                children: (
                  <>
                    {emergencyContacts.map((contact, index) => (
                      <div key={index} style={{ marginBottom: index < emergencyContacts.length - 1 ? 12 : 0 }}>
                        <Row gutter={8}>
                          <Col span={8}>
                            <Form.Item 
                              label={`Contact ${index + 1} Name`}
                              required={index === 0}
                              style={{ marginBottom: 12 }}
                            >
                              <Input 
                                placeholder="Jane Doe" 
                                value={contact.contactName}
                                onChange={(e) => {
                                  const updated = [...emergencyContacts];
                                  updated[index].contactName = e.target.value;
                                  setEmergencyContacts(updated);
                                }}
                                size="large"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item label={`Contact ${index + 1} Email`} style={{ marginBottom: 12 }}>
                              <Input 
                                placeholder="jane.doe@example.com" 
                                prefix={<MailOutlined />}
                                value={contact.email}
                                onChange={(e) => {
                                  const updated = [...emergencyContacts];
                                  updated[index].email = e.target.value;
                                  setEmergencyContacts(updated);
                                }}
                                size="large"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item 
                              label={`Contact ${index + 1} Phone`}
                              required={index === 0}
                              style={{ marginBottom: 12 }}
                            >
                              <PhoneNumberInput
                                country={pinaka.country}
                                value={contact.phone}
                                onChange={(e) => {
                                  const updated = [...emergencyContacts];
                                  updated[index].phone = e.target.value;
                                  setEmergencyContacts(updated);
                                }}
                                size="large"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </>
                )
              },
              {
                key: '3',
                label: 'Employer',
                children: (
                  <>
                    {employers.map((employer, index) => (
                      <div key={index} style={{ marginBottom: 16 }}>
                        <Row gutter={8}>
                          <Col span={8}>
                            <Form.Item 
                              label="Employer Name" 
                              required
                              validateStatus={!employer.employerName ? 'error' : ''}
                              help={!employer.employerName ? 'Please enter employer name' : ''}
                              style={{ marginBottom: 12 }}
                            >
                              <Input 
                                placeholder="ABC Corporation" 
                                value={employer.employerName}
                                onChange={(e) => {
                                  const updated = [...employers];
                                  updated[index].employerName = e.target.value;
                                  setEmployers(updated);
                                }}
                                size="large"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item label="Job Title" style={{ marginBottom: 12 }}>
                              <Input 
                                placeholder="Software Engineer" 
                                value={employer.jobTitle}
                                onChange={(e) => {
                                  const updated = [...employers];
                                  updated[index].jobTitle = e.target.value;
                                  setEmployers(updated);
                                }}
                                size="large"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item label="Annual Income" style={{ marginBottom: 12 }}>
                              <CurrencyInput
                                country={pinaka.country}
                                value={employer.income}
                                onChange={(value) => {
                                  const updated = [...employers];
                                  updated[index].income = value;
                                  setEmployers(updated);
                                }}
                                style={{ width: '100%' }}
                                size="large"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        
                        <Row gutter={8}>
                          <Col span={8}>
                            <Form.Item label="Employment Start Date" style={{ marginBottom: 12 }}>
                              <DatePicker
                                style={{ width: '100%' }}
                                value={employer.startDate ? dayjs(employer.startDate) : null}
                                onChange={(date) => {
                                  const updated = [...employers];
                                  updated[index].startDate = date ? date.format('YYYY-MM-DD') : null;
                                  setEmployers(updated);
                                }}
                                size="large"
                                placeholder="Select date"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item label="Pay Frequency" style={{ marginBottom: 12 }}>
                              <Select
                                value={employer.payFrequency}
                                onChange={(value) => {
                                  const updated = [...employers];
                                  updated[index].payFrequency = value;
                                  setEmployers(updated);
                                }}
                                placeholder="Select frequency"
                                size="large"
                                virtual={false}
                              >
                                <Select.Option value="weekly">Weekly</Select.Option>
                                <Select.Option value="biweekly">Bi-weekly</Select.Option>
                                <Select.Option value="monthly">Monthly</Select.Option>
                                <Select.Option value="semimonthly">Semi-monthly</Select.Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>
                        
                        <Form.Item label="Employer Address" style={{ marginBottom: 12 }}>
                          <Input.TextArea 
                            rows={2}
                            placeholder="123 Business St, Suite 100, City, State, ZIP" 
                            value={employer.employerAddress}
                            onChange={(e) => {
                              const updated = [...employers];
                              updated[index].employerAddress = e.target.value;
                              setEmployers(updated);
                            }}
                          />
                        </Form.Item>
                        
                        <Form.Item label="Employment Letters">
                          <div style={{ marginTop: 8 }}>
                            <ActionButton
                              action="add"
                              icon={<UploadOutlined />}
                              onClick={() => {
                                notify.info('File upload functionality coming soon');
                              }}
                              showText={true}
                              text="Upload Document"
                            />
                            {employer.documents && employer.documents.length > 0 && (
                              <div style={{ marginTop: 12 }}>
                                {employer.documents.map((doc, docIndex) => (
                                  <div key={docIndex} style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    padding: '8px 12px',
                                    background: '#f5f5f5',
                                    borderRadius: 4,
                                    marginBottom: 8
                                  }}>
                                    <Space>
                                      <FileOutlined />
                                      <Text>{doc.fileName}</Text>
                                    </Space>
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
                        </Form.Item>
                      </div>
                    ))}
                  </>
                )
              }
            ]}
          />

        </ProForm>
      </Modal>

      {/* Invite Tenant Modal */}
      <Modal
        title="Invite New Tenant"
        open={inviteModalVisible}
        onCancel={() => {
          closeInviteModal();
          inviteForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={inviteForm}
          layout="vertical"
          onFinish={inviteNewTenant}
          initialValues={{ expiresInDays: 14 }}
        >
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="tenant@example.com" prefix={<MailOutlined />} size="large" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name (Optional)"
              >
                <Input placeholder="John" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name (Optional)"
              >
                <Input placeholder="Doe" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="phone"
            label="Phone Number (Optional)"
          >
            <PhoneNumberInput country={pinaka.country} size="large" />
          </Form.Item>

          <Form.Item
            name="expiresInDays"
            label="Invitation Expires In (Days)"
            tooltip="How many days until the invitation expires"
          >
            <InputNumber min={1} max={30} style={{ width: '100%' }} size="large" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <ActionButton
                action="cancel"
                onClick={() => {
                  closeInviteModal();
                  inviteForm.resetFields();
                }}
                showText={true}
                text="Cancel"
              />
              <ActionButton
                action="add"
                htmlType="submit"
                icon={<SendOutlined />}
                showText={true}
                text="Send Invitation"
              />
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Invitations Management Modal */}
      <Modal
        title="Pending Invitations"
        open={false}
        onCancel={() => {}}
        footer={null}
        width={800}
      >
        {/* This will be implemented as a separate component if needed */}
      </Modal>

      {/* Approve Tenant Modal */}
      <Modal
        title="Approve Tenant Application"
        open={approvalModalVisible}
        onOk={handleApprove}
        onCancel={() => {
          closeApprovalModal();
        }}
        confirmLoading={approving}
        okText="Approve"
        okButtonProps={{ type: 'primary' }}
        width={600}
      >
        {selectedTenant && (
          <div>
            <Alert
              message="Approve Application"
              description={
                <div>
                  <p>Are you sure you want to approve the application for:</p>
                  <p style={{ marginTop: 8, fontSize: 16, fontWeight: 500 }}>
                    {selectedTenant.firstName} {selectedTenant.lastName}
                  </p>
                  <p style={{ marginTop: 8, color: '#666' }}>
                    {selectedTenant.email}
                  </p>
                  <Divider />
                  <p style={{ marginTop: 8, color: '#666' }}>
                    Once approved, the tenant will be able to access the system and will be prompted to upload required documents.
                  </p>
                </div>
              }
              type="info"
              showIcon
            />
          </div>
        )}
      </Modal>

      {/* Reject Tenant Modal */}
      <Modal
        title="Reject Tenant Application"
        open={rejectModalVisible}
        onCancel={() => {
          closeRejectModal();
          rejectForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedTenant && (
          <Form
            form={rejectForm}
            layout="vertical"
            onFinish={handleReject}
          >
            <Alert
              message="Reject Application"
              description={
                <div>
                  <p>You are about to reject the application for:</p>
                  <p style={{ marginTop: 8, fontSize: 16, fontWeight: 500 }}>
                    {selectedTenant.firstName} {selectedTenant.lastName}
                  </p>
                  <p style={{ marginTop: 8, color: '#666' }}>
                    {selectedTenant.email}
                  </p>
                </div>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form.Item
              name="reason"
              label="Rejection Reason"
              rules={[
                { required: true, message: 'Please provide a reason for rejection' },
                { min: 10, message: 'Reason must be at least 10 characters' },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Please explain why this application is being rejected. This will be sent to the tenant."
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  onClick={() => {
                    closeRejectModal();
                    rejectForm.resetFields();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  danger
                  htmlType="submit"
                  loading={rejecting}
                >
                  Reject Application
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
      </PageLayout>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default React.memo(TenantsClient, (prevProps, nextProps) => {
  // Custom comparison: only re-render if tenants array reference changes or user changes
  return (
    prevProps.initialTenants === nextProps.initialTenants &&
    prevProps.user?.id === nextProps.user?.id
  );
});
