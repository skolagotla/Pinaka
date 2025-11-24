/**
 * Unified Maintenance Client Component
 * 
 * Handles both landlord and tenant maintenance request views with role-based features
 * Consolidates ~2,600 lines of duplicate code into a single component
 */

"use client";
import { useState, useEffect, useRef } from "react";
import { 
  Button, Table, Badge, Card, Modal, Select, Spinner, Tooltip,
  Divider, Avatar, Alert, Datepicker, Empty, Textarea, Label, FileInput
} from 'flowbite-react';
import PageLayout, { EmptyState, TableWrapper } from './PageLayout';
import FlowbiteTable from './FlowbiteTable';
import { 
  HiWrench, HiExclamation, HiCheckCircle, HiClock,
  HiExclamationCircle, HiEye, HiCheck, HiX,
  HiUser, HiPaperAirplane, HiDownload, HiPlus, HiSave,
  HiCurrencyDollar, HiTrash, HiSearch, HiUpload, HiXCircle
} from 'react-icons/hi';
import StarRating from './shared/StarRating';
import SimpleTimeline from './shared/SimpleTimeline';
import dayjs from 'dayjs';
import { formatDateDisplay, formatDateTimeDisplay } from '@/lib/utils/safe-date-formatter';
import { v2Api } from '@/lib/api/v2-client';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useVendors, useProperties, useTenants } from '@/lib/hooks/useV2Data';
import { useFormState } from '@/lib/hooks/useFormState';
import { notify } from '@/lib/utils/notification-helper';

// Note: v1Api import removed - all functionality migrated to v2Api
// Expense tracking temporarily disabled until v2 endpoint is created

// Custom Hooks
import { useBulkOperations, useMaintenanceRequests, useMaintenanceActions } from '@/lib/hooks';
import { useResizableTable, withSorter, sortFunctions, usePageBanner, configureTableColumns } from '@/lib/hooks';
import { useFormButtons } from '@/lib/hooks/useFormButtons';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { useModalState } from '@/lib/hooks/useModalState';
import BulkActionsToolbar from './BulkActionsToolbar';

// Optimized Components
import MaintenanceTable from './maintenance/MaintenanceTable';
import MaintenanceViewModal from './maintenance/MaintenanceViewModal';
import MaintenanceExpenseTracker from './maintenance/MaintenanceExpenseTracker';
import MaintenanceVendorSelector from './maintenance/MaintenanceVendorSelector';
import MaintenanceCreateTicketModal from './maintenance/MaintenanceCreateTicketModal';
import MaintenanceSubmitRequestModal from './maintenance/MaintenanceSubmitRequestModal';
import MaintenanceCloseCommentModal from './maintenance/MaintenanceCloseCommentModal';
import MaintenanceRejectApprovalModal from './maintenance/MaintenanceRejectApprovalModal';

// Currency Input Component
import CurrencyInput from '@/components/rules/CurrencyInput';

// Constants
import { 
  MAINTENANCE_STATUSES, 
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_CATEGORIES
} from '@/lib/constants/statuses';
import { STANDARD_COLUMNS, COLUMN_NAMES, customizeColumn } from '@/lib/constants/standard-columns';
import { MAINTENANCE_COLUMNS } from '@/lib/constants/column-definitions';

// Landlord-specific categories
const LANDLORD_CATEGORIES = ['Rent', 'N4 Notice', 'N8 Notice', 'N12 Notice', 'Others'];

/**
 * Unified Maintenance Client Component
 * 
 * @param {Object} props
 * @param {'landlord'|'tenant'} props.userRole - User role
 * @param {Object} props.user - Landlord or tenant object
 * @param {Array} props.initialRequests - Initial maintenance requests
 * @param {Array} props.properties - Properties (for tenant)
 * @param {string} props.userEmail - User email (for landlord)
 * @param {string} props.userName - User name (for landlord)
 */
export default function MaintenanceClient({ 
  userRole,
  user,
  initialRequests = [],
  properties = [],
  userEmail,
  userName
}) {
  
  // Check permissions (PMC-managed landlords cannot create maintenance requests)
  const permissions = usePermissions(user || { role: userRole || 'landlord' });
  
  // 🎯 Use Maintenance Hooks for better code organization - now using v2 hooks
  const maintenanceRequests = useMaintenanceRequests({
    userRole,
    initialRequests
  });
  const { requests: rawRequests, loading, selectedRequest, setSelectedRequest, setRequests, fetchRequests, updateRequest, addRequest, removeRequest, createWorkOrder, updateWorkOrder: updateWorkOrderMutation } = maintenanceRequests;
  
  // Ensure requests is always an array to prevent errors
  const requests = Array.isArray(rawRequests) ? rawRequests : [];
  
  // 🎯 Use Maintenance Actions for CRUD operations
  const maintenanceActions = useMaintenanceActions({
    userRole,
    updateRequest,
    addRequest,
    removeRequest,
    message
  });
  // Note: handleApprove, handleReject, handleStatusUpdate, and handleAddComment are kept as local functions
  // because they have complex business logic. The hook versions are available but not used here.
  // Modal state management - using useModalState for consistency
  const { isOpen: isModalOpen, open: openModal, close: closeModal, openForEdit: openModalForEdit } = useModalState();
  const { isOpen: isViewModalOpen, open: openViewModal, close: closeViewModal, openForEdit: openViewModalForEdit } = useModalState();
  const [newComment, setNewComment] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [closeComment, setCloseComment] = useState('');
  const { isOpen: closeCommentModalOpen, open: openCloseCommentModal, close: closeCloseCommentModal } = useModalState();
  const [pendingCloseStatus, setPendingCloseStatus] = useState(null);
  const { isOpen: vendorSelectModalOpen, open: openVendorSelectModal, close: closeVendorSelectModal } = useModalState();
  const [allVendors, setAllVendors] = useState([]);
  const [loadingAllVendors, setLoadingAllVendors] = useState(false);
  const [vendorSearchText, setVendorSearchText] = useState('');
  const [vendorSourceFilter, setVendorSourceFilter] = useState('all'); // 'all', 'admin', 'landlord', 'pmc'
  const [vendorUsageStats, setVendorUsageStats] = useState({}); // Map of vendorId -> stats
  const [loadingVendorStats, setLoadingVendorStats] = useState({}); // Map of vendorId -> loading state
  const statusUpdateTimeoutRef = useRef(null);
  
  // Create ticket modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const createForm = useFormState({});
  const form = useFormState({});
  
  // Landlord-specific state
  const [tenants, setTenants] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [tenantProperties, setTenantProperties] = useState([]);
  const [isPropertyEditable, setIsPropertyEditable] = useState(false);
  const [selectedCategoryDesc, setSelectedCategoryDesc] = useState('');
  
  // Tenant-specific state
  const [selectedPropertyAddress, setSelectedPropertyAddress] = useState({ addressLine: '', cityStateZip: '' });
  
  // Expense tracking state (landlord only)
  const [expenses, setExpenses] = useState([]);
  const { isOpen: expenseModalOpen, open: openExpenseModal, close: closeExpenseModal } = useModalState();
  const [expenseLoading, setExpenseLoading] = useState(false);
  const { isOpen: invoiceUploadModalOpen, open: openInvoiceUploadModal, close: closeInvoiceUploadModal, editingItem: uploadingExpenseId, openForEdit: openInvoiceUploadModalForExpense } = useModalState();
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const [existingExpenseInvoiceFileList, setExistingExpenseInvoiceFileList] = useState([]);
  const { isOpen: invoiceViewModalOpen, open: openInvoiceViewModal, close: closeInvoiceViewModal, editingItem: viewingInvoiceUrl, setEditingItem: setViewingInvoiceUrl } = useModalState();
  const [vendors, setVendors] = useState([]);
  const [suggestedVendors, setSuggestedVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);

  const { renderFormButtons } = useFormButtons({
    onCancel: () => {
      if (userRole === 'tenant') {
        closeModal();
      } else {
        closeCreateModal();
      }
    },
    isEditing: false,
    loading,
    entityName: 'Request'
  });

  // 🎯 Page Banner with integrated search and stats
  const calculateStats = (tickets) => {
    // Ensure tickets is always an array to prevent filter errors
    const ticketsArray = Array.isArray(tickets) ? tickets : [];
    return [
      { label: 'New', value: ticketsArray.filter(r => r && r.status === 'New').length, color: '#ff4d4f' },
      { label: 'Pending', value: ticketsArray.filter(r => r && r.status === 'Pending').length, color: '#faad14' },
      { label: 'In Progress', value: ticketsArray.filter(r => r && (r.status === 'In Progress' || (r.status === 'Closed' && !(r.landlordApproved && r.tenantApproved)))).length, color: '#1890ff' },
      { label: 'Closed', value: ticketsArray.filter(r => r && r.status === 'Closed' && r.landlordApproved && r.tenantApproved).length, color: '#52c41a' }
    ];
  };

  const searchFields = userRole === 'landlord'
    ? ['ticketNumber', 'title', 'description', 'status', 'category', 'priority', 'tenant.firstName', 'tenant.lastName', 'property.propertyName', 'property.addressLine1']
    : ['ticketNumber', 'title', 'description', 'status', 'category', 'priority', 'property.propertyName', 'property.addressLine1'];

  // Ensure requests is always an array before passing to usePageBanner
  const requestsForBanner = Array.isArray(requests) ? requests : [];
  
  const { BannerComponent, filteredData: rawFilteredData } = usePageBanner({
    title: 'Maintenance',
    data: requestsForBanner,
    calculateStats,
    searchFields,
    searchPlaceholder: userRole === 'landlord'
      ? 'Search tickets by number, title, status, tenant, or property...'
      : 'Search tickets by number, title, status, category, or property...',
    actions: {
      onAdd: permissions.canEditMaintenance ? () => {
        if (userRole === 'tenant') {
          form.resetForm();
          setSelectedPropertyAddress({ addressLine: '', cityStateZip: '' });
          openModal();
          setSelectedRequest(null);
        } else {
          openCreateModalForCreate();
        }
      } : undefined,
      addTooltip: permissions.canEditMaintenance 
        ? (userRole === 'tenant' ? 'Submit Request' : 'Create Ticket')
        : 'PMC-managed landlords cannot create maintenance requests',
      onRefresh: fetchRequests
    }
  });
  
  // Ensure filteredData is always an array to prevent errors
  const filteredData = Array.isArray(rawFilteredData) ? rawFilteredData : [];

  // Bulk operations for maintenance tickets - Only export is available
  // All tickets (including closed) can be selected for export
  const maintenanceBulkOps = useBulkOperations({
    onBulkAction: async (action, selectedIds) => {
      if (action === 'export') {
        // Export functionality
        const selectedTickets = filteredData.filter(t => selectedIds.includes(t.id));
        const csv = [
          ['Ticket #', 'Priority', 'Created By', 'Property', 'Category', 'Title', 'Status', 'Created Date'].join(','),
          ...selectedTickets.map(t => [
            `"${t.ticketNumber || ''}"`,
            t.priority || '',
            `"${t.createdBy || ''}"`,
            `"${t.propertyName || ''}"`,
            t.category || '',
            `"${t.title || ''}"`,
            t.status || '',
            t.createdAt ? formatDateDisplay(t.createdAt) : ''
          ].join(','))
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `maintenance-tickets-${new Date().toISOString().split('T')[0].csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        return true;
      }
      return false;
    },
    successMessage: 'Bulk operation completed successfully',
    errorMessage: 'Bulk operation failed'
  });

  // Polling is now handled by useMaintenanceRequests hook
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRequests();
    }, userRole === 'landlord' ? 30000 : 60000);
    return () => clearInterval(interval);
  }, [fetchRequests, userRole]);

  // Handle opening ticket from URL query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const ticketId = urlParams.get('ticketId');
      const requestsArray = Array.isArray(requests) ? requests : [];
      if (ticketId && requestsArray.length > 0) {
        const ticket = requestsArray.find(r => r && r.id === ticketId);
        if (ticket) {
          setSelectedRequest(ticket);
          openModalForEdit(ticket);
          // Clean up URL
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
  }, [requests]);

  // Pre-populate property if only one property available (tenant)
  useEffect(() => {
    if (userRole === 'tenant' && isModalOpen && Array.isArray(properties) && properties.length === 1) {
      const property = properties[0];
      form.setFieldsValue({ propertyId: property.id });
      const addressLine = property.addressLine1 || '';
      const cityStateZip = [
        property.city,
        property.provinceState,
        property.postalZip
      ].filter(Boolean).join(', ');
      setSelectedPropertyAddress({ addressLine, cityStateZip });
    }
  }, [userRole, isModalOpen, properties, form]);

  // Fetch suggested vendors when ticket is selected (landlord and PMC)
  useEffect(() => {
    if ((userRole === 'landlord' || userRole === 'pmc') && selectedRequest?.category) {
      fetchSuggestedVendors(selectedRequest.category);
    }
  }, [selectedRequest?.id, selectedRequest?.category, userRole]);

  // fetchRequests is now handled by useMaintenanceRequests hook
  // But we need to update selectedRequest when viewing modal
  useEffect(() => {
    if (selectedRequest && (isModalOpen || isViewModalOpen)) {
      const updated = requests.find(r => r.id === selectedRequest.id);
      if (updated) setSelectedRequest(updated);
    }
  }, [requests, selectedRequest?.id, isModalOpen, isViewModalOpen]);

  // Use v2 hooks for data fetching
  const { user: v2User } = useV2Auth();
  const organizationId = v2User?.organization_id;
  const { data: tenantsData } = useTenants(organizationId);
  const { data: propertiesData } = useProperties(organizationId);
  const { data: vendorsData } = useVendors(organizationId);
  
  // Update local state when v2 data changes
  useEffect(() => {
    if (tenantsData && Array.isArray(tenantsData)) {
      setTenants(tenantsData);
    }
  }, [tenantsData]);
  
  useEffect(() => {
    if (propertiesData && Array.isArray(propertiesData)) {
      setAllProperties(propertiesData);
    }
  }, [propertiesData]);
  
  useEffect(() => {
    if (vendorsData && Array.isArray(vendorsData)) {
      setVendors(vendorsData);
      setAllVendors(vendorsData);
    }
  }, [vendorsData]);
  
  // Landlord-specific: Fetch tenants and properties (legacy function kept for compatibility)
  async function fetchTenants() {
    // Now handled by v2 hooks above
    if (tenantsData && Array.isArray(tenantsData)) {
      setTenants(tenantsData);
    }
  }

  async function fetchProperties() {
    // Now handled by v2 hooks above
    if (propertiesData && Array.isArray(propertiesData)) {
      setAllProperties(propertiesData);
    }
  }

  // Landlord-specific: Handle tenant change
  async function handleTenantChange(tenantId) {
    if (userRole !== 'landlord') return;
    try {
      // Use v2Api for tenant details
      const tenant = await v2Api.getTenant(tenantId);
      // Get leases for this tenant from v2
      const leases = await v2Api.listLeases({ tenant_id: tenantId });
      const activeLeases = leases?.filter(lease => 
        lease.status === 'active'
      ) || [];

      if (activeLeases.length === 0) {
        setTenantProperties(Array.isArray(allProperties) ? allProperties : []);
        setIsPropertyEditable(true);
      } else {
        const uniqueProperties = [];
        const propertyMap = new Map();
        activeLeases.forEach(lease => {
          if (lease.unit?.property && !propertyMap.has(lease.unit.property.id)) {
            propertyMap.set(lease.unit.property.id, lease.unit.property);
            uniqueProperties.push(lease.unit.property);
          }
        });
        setTenantProperties(uniqueProperties);
        setIsPropertyEditable(uniqueProperties.length > 1);
        
        if (uniqueProperties.length === 1) {
          createForm.setFieldsValue({ propertyId: uniqueProperties[0].id });
        }
      }
    } catch (error) {
      console.error('[MaintenanceClient] Error fetching tenant details:', error);
    }
  }

  // Tenant-specific: Handle property change
  function handlePropertyChange(propertyId) {
    if (userRole !== 'tenant') return;
    const property = Array.isArray(properties) ? properties.find(p => p && p.id === propertyId) : null;
    if (property) {
      const addressLine = property.addressLine1 || '';
      const cityStateZip = [
        property.city,
        property.provinceState,
        property.postalZip
      ].filter(Boolean).join(', ');
      setSelectedPropertyAddress({ addressLine, cityStateZip });
    }
  }

  // Landlord-specific: Handle category change
  function handleCategoryChange(value) {
    if (userRole !== 'landlord') return;
    const descriptions = {
      'Rent': 'Rent-related issues',
      'N4 Notice': 'Late Rent / Non-Payment of Rent',
      'N8 Notice': 'Termination for Cause (e.g., illegal activity, damage)',
      'N12 Notice': 'Personal Use / Family Use',
      'Others': 'Any other landlord matters'
    };
    setSelectedCategoryDesc(descriptions[value] || '');
  }

  // Expense tracking functions (landlord only)
  // Note: v2 API doesn't have expense tracking endpoint yet
  // This feature is temporarily disabled until v2 endpoint is created
  async function fetchExpenses(maintenanceRequestId) {
    if (userRole !== 'landlord' || !maintenanceRequestId) return;
    setExpenseLoading(true);
    try {
      // TODO: Implement expense tracking in v2 API
      // For now, return empty array
      setExpenses([]);
      if (process.env.NODE_ENV === 'development') {
        console.warn('[MaintenanceClient] Expense tracking not yet available in v2 API');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[MaintenanceClient] Error fetching expenses:', error);
      }
      setExpenses([]);
    } finally {
      setExpenseLoading(false);
    }
  }

  async function fetchVendors() {
    // Now handled by v2 hooks above
    if (vendorsData && Array.isArray(vendorsData)) {
      setVendors(vendorsData);
    }
  }

  // Fetch vendors matching the ticket category
  async function fetchSuggestedVendors(category) {
    if ((userRole !== 'landlord' && userRole !== 'pmc') || !category) return;
    setLoadingVendors(true);
    try {
      // Use v2Api for vendors - filter by service_categories
      if (vendorsData && Array.isArray(vendorsData)) {
        const filtered = vendorsData.filter(v => 
          v.service_categories && v.service_categories.includes(category)
        );
        setSuggestedVendors(filtered);
      } else {
        setSuggestedVendors([]);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[MaintenanceClient] Error fetching suggested vendors:', error);
      }
      setSuggestedVendors([]);
    } finally {
      setLoadingVendors(false);
    }
  }

  // Fetch all vendors for selection
  async function fetchAllVendors() {
    if (userRole !== 'landlord' && userRole !== 'pmc') return;
    setLoadingAllVendors(true);
    try {
      // Use v2 vendors data
      if (vendorsData && Array.isArray(vendorsData)) {
        const activeVendors = vendorsData.filter(v => v.status === 'active');
        setAllVendors(activeVendors);
      } else {
        setAllVendors([]);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[MaintenanceClient] Error fetching all vendors:', error);
      }
      setAllVendors([]);
    } finally {
      setLoadingAllVendors(false);
    }
  }

  // Open vendor selection modal
  function handleOpenVendorSelect() {
    openVendorSelectModal();
    setVendorSearchText('');
    // Fetch vendors filtered by category if available
    if (selectedRequest?.category) {
      fetchSuggestedVendors(selectedRequest.category);
      // Also fetch all vendors for broader search
      if (!Array.isArray(allVendors) || allVendors.length === 0) {
        fetchAllVendors();
      }
    } else {
      fetchAllVendors();
    }
  }

  // Fetch vendor usage statistics
  // Note: v2 API doesn't have vendor usage stats endpoint yet
  // This is a non-critical feature, so we'll skip it for now
  async function fetchVendorUsageStats(vendorId) {
    // TODO: Implement vendor usage stats in v2 API if needed
    // For now, return empty stats
    setVendorUsageStats(prev => ({ ...prev, [vendorId]: { totalJobs: 0, completedJobs: 0 } }));
  }

  // Assign vendor to ticket
  async function handleAssignVendor(vendorId) {
    if (!selectedRequest) return;
    setLoading(true);
    try {
      const authorInfo = userRole === 'landlord'
        ? { authorEmail: userEmail, authorName: userName, authorRole: 'landlord' }
        : userRole === 'pmc'
        ? { authorEmail: user.email, authorName: `${user.firstName} ${user.lastName}`, authorRole: 'pmc' }
        : { authorEmail: user.email, authorName: `${user.firstName} ${user.lastName}`, authorRole: 'tenant' };

      // Assign or unassign vendor
      let response;
      let result;
      
      try {
      // Use v2Api for work order update - assign vendor via work_order_assignments
      if (vendorId) {
        // Assign vendor to work order
        result = await v2Api.assignVendorToWorkOrder(selectedRequest.id, vendorId);
      } else {
        // Remove assignment (would need delete endpoint)
        // For now, just update the work order status
        result = await v2Api.updateWorkOrder(selectedRequest.id, {
          status: selectedRequest.status,
        });
      }
        result = result.data || result;
      } catch (error) {
        console.error('[MaintenanceClient] Error assigning vendor:', error);
        // If it's a 202 response (approval required), try to handle it
        if (error.response && error.response.status === 202) {
          try {
            result = await error.response.json();
          } catch (parseError) {
            console.error('[MaintenanceClient] Error parsing 202 response:', parseError);
            notify.error('Failed to process vendor assignment request');
            return;
          }
        } else {
          notify.error(error.message || 'Failed to assign vendor');
          return;
        }
      }
      
      // Handle approval workflow response (202 Accepted)
      if (result && (result.requiresApproval || response?.status === 202)) {
        if (result.approvalRequest) {
          notify.success('Vendor assignment request sent to landlord for approval');
        } else {
          notify.info('Vendor assignment is pending approval');
        }
        // Refresh the request to show pending approval status
        try {
          const refreshed = await v2Api.getWorkOrder(selectedRequest.id);
          if (refreshed && typeof refreshed === 'object') {
            setSelectedRequest(refreshed);
          }
        } catch (refreshError) {
          console.error('[MaintenanceClient] Error refreshing request:', refreshError);
        }
        return;
      }
      
      // Normal assignment - update UI
      if (result && typeof result === 'object') {
        setSelectedRequest(result);
      } else {
        console.error('[MaintenanceClient] Invalid result from vendor assignment:', result);
        notify.error('Unexpected response from server');
        return;
      }

      // If assigning (not unassigning), add comment with vendor contact info for tenant
      if (vendorId && result && !result.requiresApproval) {
        // Get vendor details from v2
        let vendor;
        try {
          vendor = await v2Api.getVendor(vendorId);
        } catch (vendorError) {
          console.error('[MaintenanceClient] Error fetching vendor details:', vendorError);
          // Continue without vendor details
          vendor = { company_name: 'Vendor', contact_name: 'Vendor' };
        }

        const vendorName = vendor?.company_name || vendor?.contact_name || 'Vendor';
        const contactPerson = vendor?.name || 'Contact Person';
        
        let contactInfo = '';
        if (vendor?.phone && vendor?.email) {
          contactInfo = `Phone: ${vendor.phone} or Email: ${vendor.email}`;
        } else if (vendor?.phone) {
          contactInfo = `Phone: ${vendor.phone}`;
        } else if (vendor?.email) {
          contactInfo = `Email: ${vendor.email}`;
        }

        // Create vendor assignment comment
        let vendorComment = '';
        if (userRole === 'pmc') {
          // PMC assignment - notify both tenant and landlord
          vendorComment = `Vendor ${vendorName} has been assigned to this ticket by your property management company. Please get in touch with ${contactPerson}${contactInfo ? ` at ${contactInfo}` : ''} to schedule an appointment.`;
        } else {
          // Landlord assignment
          vendorComment = `Your ticket has been assigned to ${vendorName}, please get in touch with ${contactPerson}${contactInfo ? ` at ${contactInfo}` : ''} to schedule an appointment.`;
        }

        // Use v2Api for adding work order comment
        await v2Api.addWorkOrderComment(selectedRequest.id, vendorComment);

        // Refresh to get updated comments
        const refreshed = await v2Api.getWorkOrder(selectedRequest.id);
        if (refreshed && typeof refreshed === 'object') {
          setSelectedRequest(refreshed);
        }
        
        // If PMC assigned, send notification to landlord
        if (userRole === 'pmc') {
          try {
            let landlord = null;
            
            // Try to get landlord from refreshed request
            if (refreshed.property?.landlord) {
              landlord = refreshed.property.landlord;
            } else if (refreshed.property_id) {
              // Fetch property separately if not included
              const property = await v2Api.getProperty(refreshed.property_id);
              if (property?.landlord_id) {
                landlord = await v2Api.getLandlord(property.landlord_id);
              }
            }
            
            if (landlord) {
              // Use v2Api for notifications
              await v2Api.createNotification({
                user_id: landlord.user_id || landlord.id,
                organization_id: organizationId,
                entity_type: 'work_order',
                entity_id: refreshed.id,
                type: 'WORK_ORDER_UPDATED',
              });
            }
          } catch (notifError) {
            console.error('Failed to send notification to landlord:', notifError);
            // Don't fail the assignment if notification fails
          }
        }

        // Check if this is first comment AFTER adding the vendor assignment comment
        const hasUserComment = userRole === 'landlord'
          ? refreshed.comments?.some(c => c.authorEmail === userEmail && !c.isStatusUpdate)
          : refreshed.comments?.some(c => c.authorRole === 'tenant' && !c.isStatusUpdate);
        
        // Count non-status comments to see if this was the first one
        const nonStatusComments = refreshed.comments?.filter(c => !c.isStatusUpdate) || [];
        const isFirstComment = nonStatusComments.length === 1;
        
        const shouldChangeToInProgress = userRole === 'landlord'
          ? isFirstComment && (refreshed.status === 'New' || refreshed.status === 'Pending')
          : refreshed.initiatedBy === 'landlord' && refreshed.status === 'Pending' && isFirstComment;

        // Auto-update status to "In Progress" on first comment (after 1 minute delay)
        if (shouldChangeToInProgress) {
          console.log('Setting up 1-minute timer for vendor assignment status update', {
            ticketId: refreshed.id,
            isFirstComment,
            currentStatus: refreshed.status
          });
          
          // Clear any existing timeout
          if (statusUpdateTimeoutRef.current) {
            clearTimeout(statusUpdateTimeoutRef.current);
          }
          
          // Set a 1-minute timer to update status to "In Progress"
          statusUpdateTimeoutRef.current = setTimeout(async () => {
            console.log('1-minute timer fired for vendor assignment, checking ticket status...');
            try {
              // Re-fetch the ticket to ensure it hasn't been updated by someone else
              const currentData = await v2Api.getWorkOrder(refreshed.id);
              
              // Check if this is still the first non-status comment
              const currentNonStatusComments = currentData.comments?.filter(c => !c.isStatusUpdate) || [];
              const stillFirstComment = currentNonStatusComments.length === 1;
              
              console.log('Vendor assignment status check:', {
                currentStatus: currentData.status,
                stillFirstComment,
                nonStatusCommentCount: currentNonStatusComments.length
              });
              
              // Only update if still in pending/new status and this is still the first comment scenario
              if ((currentData.status === 'pending' || currentData.status === 'new') && stillFirstComment) {
                console.log('Updating status to in_progress after vendor assignment...');
                // Use v2Api for work order update
                const statusUpdated = await v2Api.updateWorkOrder(refreshed.id, { 
                  status: 'in_progress',
                });
                setSelectedRequest(statusUpdated);
                await fetchRequests();
                if (userRole === 'landlord') setNewStatus('in_progress');
                console.log('Status updated to in_progress successfully after vendor assignment');
              } else {
                console.log('Skipping status update - conditions not met');
              }
            } catch (error) {
              console.error('Error updating status after 1 minute:', error);
            } finally {
              statusUpdateTimeoutRef.current = null;
            }
          }, 60000); // 1 minute delay
        }

        await fetchRequests();
        if (userRole === 'pmc') {
          notify.success('Vendor assigned successfully. Tenant and landlord have been notified.');
        } else {
          notify.success('Vendor assigned successfully. Tenant has been notified.');
        }
      } else {
        await fetchRequests();
        notify.success('Vendor unassigned successfully');
      }
    } catch (error) {
      console.error('[MaintenanceClient] Error:', error);
    } finally {
      setLoading(false);
    }
  }

  // handleAddExpense moved to MaintenanceExpenseTracker component

  // Handle invoice upload for existing expense
  // Note: v2 API doesn't have expense tracking endpoint yet
  // This feature is temporarily disabled until v2 endpoint is created
  async function handleUploadInvoice() {
      notify.warning('Expense tracking is not yet available in v2 API. This feature will be available soon.');
    // TODO: Implement expense invoice upload in v2 API
    // For now, just close the modal
    closeInvoiceUploadModal();
    setExistingExpenseInvoiceFileList([]);
  }

  // Create/Submit ticket handler
  async function handleCreateTicket(values) {
    setLoading(true);
    try {
      const requestData = userRole === 'landlord'
        ? { ...values, initiatedBy: 'landlord' }
        : { ...values, tenantId: user.id };

      // Use v2Api for creating work order
      const workOrderData = {
        organization_id: organizationId,
        property_id: values.propertyId,
        unit_id: values.unitId || undefined,
        tenant_id: userRole === 'tenant' ? user.id : values.tenantId || undefined,
        title: values.title,
        description: values.description,
        priority: values.priority || 'medium',
        status: 'new',
      };
      await v2Api.createWorkOrder(workOrderData);

      notify.success(userRole === 'landlord' 
        ? 'Ticket created successfully'
        : 'Maintenance request submitted successfully');
      
      if (userRole === 'landlord') {
        createForm.resetForm();
        setTenantProperties([]);
        setIsPropertyEditable(false);
        setSelectedCategoryDesc('');
        closeCreateModal();
      } else {
        closeModal();
        setSelectedPropertyAddress({ addressLine: '', cityStateZip: '' });
        form.resetForm();
      }
      
      await fetchRequests();
    } catch (error) {
      console.error('[MaintenanceClient] Error creating maintenance request:', error);
      notify.error(error.message || 'Failed to create maintenance request');
    } finally {
      setLoading(false);
    }
  }

  // Helper functions
  const getStatusColor = (status, landlordApproved, tenantApproved) => {
    // If status is Closed but not fully approved, show as In Progress
    if (status === 'Closed' && !(landlordApproved && tenantApproved)) {
      return 'processing';
    }
    switch (status) {
      case 'New': return 'error';
      case 'Pending': return 'warning';
      case 'In Progress': return 'processing';
      case 'Closed': return 'success';
      default: return 'default';
    }
  };
  
  const getStatusText = (status, landlordApproved, tenantApproved) => {
    // If status is Closed but not fully approved, show as In Progress
    if (status === 'Closed' && !(landlordApproved && tenantApproved)) {
      return 'In Progress';
    }
    return status;
  };

  const getPriorityColor = (priority) => {
    if (userRole === 'landlord') {
      switch (priority) {
        case 'Urgent': return 'red';
        case 'High': return 'orange';
        case 'Normal': return 'blue';
        case 'Low': return 'default';
        default: return 'default';
      }
    } else {
      switch (priority) {
        case 'Urgent': return '#ff4d4f';
        case 'High': return '#fa8c16';
        case 'Normal': return '#1890ff';
        case 'Low': return '#1890ff';
        default: return '#1890ff';
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'New': return <HiExclamationCircle className="h-4 w-4" />;
      case 'Pending': return <HiClock className="h-4 w-4" />;
      case 'In Progress': return <HiWrench className="h-4 w-4" />;
      case 'Closed': return <HiCheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  // Load tenants and properties on mount (landlord only)
  useEffect(() => {
    if (userRole === 'landlord') {
      fetchTenants();
      fetchProperties();
      fetchVendors();
    }
  }, [userRole]);

  // Load expenses when maintenance request is selected (landlord only)
  useEffect(() => {
    if (userRole === 'landlord' && selectedRequest && isModalOpen) {
      fetchExpenses(selectedRequest.id);
    }
  }, [selectedRequest?.id, isModalOpen, userRole]);

  // Cleanup timeout on unmount or when selected request changes
  useEffect(() => {
    return () => {
      if (statusUpdateTimeoutRef.current) {
        clearTimeout(statusUpdateTimeoutRef.current);
        statusUpdateTimeoutRef.current = null;
      }
    };
  }, [selectedRequest?.id]);

  // Approve/Reject handlers
  async function handleApprove(request) {
    setLoading(true);
    try {
      const authorInfo = userRole === 'landlord'
        ? { authorEmail: userEmail, authorName: userName, authorRole: 'landlord' }
        : { authorEmail: user.email, authorName: `${user.firstName} ${user.lastName}`, authorRole: 'tenant' };

      // Use v2Api for work order update
      await v2Api.updateWorkOrder(request.id, { 
        status: 'pending',
      });
      
      await fetchRequests();
      notify.success(userRole === 'landlord' 
        ? 'Request approved and tenant notified'
        : 'Request approved and landlord notified');
    } catch (error) {
      console.error('[MaintenanceClient] Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleReject(id) {
    setLoading(true);
    try {
      // Use v2Api to update work order status to canceled
      await v2Api.updateWorkOrder(id, { status: 'canceled' });
      
      await fetchRequests();
      notify.success('Request rejected');
    } catch (error) {
      console.error('[MaintenanceClient] Error rejecting request:', error);
      notify.error(error.message || 'Failed to reject request');
    } finally {
      setLoading(false);
    }
  }

  // Handler for approving PMC maintenance approval requests (landlord only)
  // Note: v2 API uses work order approval endpoint instead of separate approval system
  async function handleApproveMaintenanceRequest(approvalId) {
    setLoading(true);
    try {
      // For v2, we use the work order approval endpoint
      // The approvalId should map to a work_order_id
      // If approvalId is actually a work order ID, use it directly
      const workOrderId = approvalId; // Assuming approvalId is the work order ID
      await v2Api.approveWorkOrder(workOrderId);
      notify.success('Maintenance request approved successfully');
      await fetchRequests();
    } catch (error) {
      console.error('Error approving maintenance request:', error);
      notify.error(error.message || 'Failed to approve maintenance request');
    } finally {
      setLoading(false);
    }
  }

  // Handler for rejecting PMC maintenance approval requests (landlord only)
  const [rejectMaintenanceModalOpen, setRejectMaintenanceModalOpen] = useState(false);
  const [rejectingMaintenanceApprovalId, setRejectingMaintenanceApprovalId] = useState(null);
  const rejectMaintenanceForm = useFormState({});

  function handleRejectMaintenanceRequest(approvalId) {
    setRejectingMaintenanceApprovalId(approvalId);
    setRejectMaintenanceModalOpen(true);
    rejectMaintenanceForm.resetForm();
  }

  async function handleRejectMaintenanceSubmit() {
    try {
      const values = rejectMaintenanceForm.getFieldsValue();
      // For v2, we update the work order status to 'canceled' instead of using approval system
      // The rejectingMaintenanceApprovalId should map to a work_order_id
      const workOrderId = rejectingMaintenanceApprovalId; // Assuming it's the work order ID
      await v2Api.updateWorkOrder(workOrderId, { 
        status: 'canceled',
      });
      notify.success('Maintenance request rejected successfully');
      setRejectMaintenanceModalOpen(false);
      setRejectingMaintenanceApprovalId(null);
      rejectMaintenanceForm.resetForm();
      await fetchRequests();
    } catch (error) {
      if (error.errorFields) {
        // Form validation error, don't show message
        return;
      }
      console.error('Error rejecting maintenance request:', error);
      notify.error(error.message || 'Failed to reject maintenance request');
    }
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;
    
    setLoading(true);
    try {
      const authorInfo = userRole === 'landlord'
        ? { authorEmail: userEmail, authorName: userName, authorRole: 'landlord' }
        : { authorEmail: user.email, authorName: `${user.firstName} ${user.lastName}`, authorRole: 'tenant' };

      // Use v2Api for adding work order comment
      await v2Api.addWorkOrderComment(selectedRequest.id, newComment);
      const updated = await v2Api.getWorkOrder(selectedRequest.id);
      setSelectedRequest(updated);
      setNewComment('');
      
      // Check if this is first comment AFTER adding the comment
      const nonStatusComments = updated.comments?.filter(c => !c.isStatusUpdate) || [];
      const isFirstComment = nonStatusComments.length === 1;
      
      // For landlord: if first comment and status is New/Pending, change to In Progress
      // For tenant: if first comment and status is Pending (regardless of who initiated), change to In Progress
      const shouldChangeToInProgress = userRole === 'landlord'
        ? isFirstComment && (updated.status === 'New' || updated.status === 'Pending')
        : isFirstComment && updated.status === 'Pending';
      
      // Auto-update status to "In Progress" on first comment (after 1 minute delay)
      if (shouldChangeToInProgress) {
        console.log('Setting up 1-minute timer for status update to In Progress', {
          ticketId: updated.id,
          isFirstComment,
          currentStatus: updated.status
        });
        
        // Clear any existing timeout
        if (statusUpdateTimeoutRef.current) {
          clearTimeout(statusUpdateTimeoutRef.current);
        }
        
        // Set a 1-minute timer to update status to "In Progress"
        statusUpdateTimeoutRef.current = setTimeout(async () => {
          console.log('1-minute timer fired, checking ticket status...');
          try {
            // Re-fetch the ticket to ensure it hasn't been updated by someone else
            const currentData = await v2Api.getWorkOrder(updated.id);
            
            // Check if this is still the first non-status comment
            const currentNonStatusComments = currentData.comments?.filter(c => !c.isStatusUpdate) || [];
            const stillFirstComment = currentNonStatusComments.length === 1;
            
            console.log('Status check:', {
              currentStatus: currentData.status,
              stillFirstComment,
              nonStatusCommentCount: currentNonStatusComments.length
            });
            
            // Only update if still in pending/new status and this is still the first comment scenario
            if ((currentData.status === 'pending' || currentData.status === 'new') && stillFirstComment) {
              console.log('Updating status to in_progress...');
              // Use v2Api for work order update
              const statusUpdated = await v2Api.updateWorkOrder(updated.id, { 
                status: 'in_progress',
              });
              setSelectedRequest(statusUpdated);
              await fetchRequests();
              if (userRole === 'landlord') setNewStatus('in_progress');
              console.log('Status updated to in_progress successfully');
            } else {
              console.log('Skipping status update - conditions not met');
            }
            } catch (error) {
            console.error('Error updating status after 1 minute:', error);
          } finally {
            statusUpdateTimeoutRef.current = null;
          }
        }, 60000); // 1 minute = 60000 milliseconds
      }
      
      await fetchRequests();
      
      // Mark as viewed after adding comment
      try {
        await v2Api.markWorkOrderViewed(selectedRequest.id, userRole);
      } catch (error) {
        console.error('[MaintenanceClient] Error marking as viewed:', error);
      }
      
      notify.success('Comment added');
    } catch (error) {
      notify.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadTicketPDF(request) {
    try {
      setLoading(true);
      // Use v2 API for PDF download
      const blob = await v2Api.downloadWorkOrderPDF(request.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `WorkOrder_${request.id.substring(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      notify.success('Work order PDF downloaded successfully');
      return;
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'Failed to download PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Ticket_${request.ticketNumber || request.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      notify.success('Ticket PDF downloaded successfully');
    } catch (error) {
      notify.error('Failed to download ticket PDF');
      console.error('PDF download error:', error);
    } finally {
      setLoading(false);
    }
  }

  // Helper function to render comment text with styled status
  function renderCommentText(text) {
    const statusColors = {
      'Pending': 'text-orange-600 dark:text-orange-400',
      'In Progress': 'text-blue-600 dark:text-blue-400',
      'Closed': 'text-green-600 dark:text-green-400',
      'Close': 'text-green-600 dark:text-green-400',
      'New': 'text-gray-500 dark:text-gray-400'
    };

    // Check for full phrases first
    if (text.includes('Ticket Acknowledged: Pending')) {
      const parts = text.split('Ticket Acknowledged: Pending');
      return (
        <span>
          {parts[0]}
          Ticket Acknowledged: <span className={`font-bold ${statusColors['Pending']}`}>Pending</span>
          {parts[1]}
        </span>
      );
    }
    
    // If the text is exactly "In Progress", it's a status update
    if (text === 'In Progress') {
      return (
        <span className={`font-bold ${statusColors['In Progress']}`}>In Progress</span>
      );
    }

    // Match status words (case-insensitive) - including "Close" separately
    const statusPattern = /(Pending|In Progress|Closed|Close|New)/gi;
    const parts = text.split(statusPattern);

    if (parts.length === 1) {
      return <span>{text}</span>;
    }

    return (
      <span>
        {parts.map((part, idx) => {
          // Find matching status (case-insensitive)
          const matchedStatus = Object.keys(statusColors).find(
            status => status.toLowerCase() === part.toLowerCase()
          );
          
          if (matchedStatus) {
            return (
              <span 
                key={idx} 
                className={`font-bold ${statusColors[matchedStatus]}`}
              >
                {part}
              </span>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </span>
    );
  }

  // Helper function to check if ticket has unread updates
  // Red dot should only show when there's an actual update (comment, status change, etc.) that the user hasn't viewed
  function hasUnreadUpdates(ticket) {
    if (ticket.status === 'Closed') {
      return false;
    }
    
    // Get the last viewed timestamp for the current user
    const lastViewed = userRole === 'landlord' 
      ? ticket.lastViewedByLandlord 
      : ticket.lastViewedByTenant;
    
    // Get the other party's role
    const otherPartyRole = userRole === 'landlord' ? 'tenant' : 'landlord';
    
    // If user has never viewed the ticket, check if there's any activity from the other party
    if (!lastViewed) {
      // Check if there are any comments from the other party
      if (ticket.comments && ticket.comments.length > 0) {
        const hasOtherPartyComment = ticket.comments.some(
          comment => comment.authorRole === otherPartyRole
        );
        if (hasOtherPartyComment) {
          return true;
        }
      }
      
      // Check if ticket was updated after creation (status change, etc.)
      // Only show if it wasn't just created by the current user
      if (ticket.updatedAt && ticket.createdAt) {
        const updatedAfterCreation = new Date(ticket.updatedAt) > new Date(ticket.createdAt);
        // Only show if the other party initiated it or if there's been an update
        if (ticket.initiatedBy === otherPartyRole || updatedAfterCreation) {
          return true;
        }
      }
      
      return false;
    }
    
    // User has viewed the ticket - check if there are new updates since last view
    const lastViewedDate = new Date(lastViewed);
    
    // Check if there are any comments from the other party created after last view
    if (ticket.comments && ticket.comments.length > 0) {
      const hasNewComment = ticket.comments.some(
        comment => 
          comment.authorRole === otherPartyRole && 
          new Date(comment.createdAt) > lastViewedDate
      );
      if (hasNewComment) {
        return true;
      }
    }
    
    // Check if ticket was updated after last view
    if (ticket.updatedAt) {
      const updatedAfterView = new Date(ticket.updatedAt) > lastViewedDate;
      if (updatedAfterView) {
        return true;
      }
    }
    
    return false;
  }

  // Build table columns based on role - using consolidated column definitions
  const columns = [
    customizeColumn(MAINTENANCE_COLUMNS.TICKET_NUMBER, {
      render: (ticketNumber, record) => (
        <div className="relative inline-block">
          {hasUnreadUpdates(record) && (
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
          )}
          <span className={`font-mono text-xs font-semibold ${userRole === 'tenant' ? 'text-center block' : ''}`}>
            {ticketNumber || '—'}
          </span>
        </div>
      ),
    }),
    customizeColumn(MAINTENANCE_COLUMNS.PRIORITY, {
      render: (priority) => {
        const icon = priority === 'Urgent' ? <HiExclamationCircle className="h-5 w-5" /> :
                    priority === 'High' ? <HiExclamation className="h-5 w-5" /> :
                    priority === 'Normal' ? <HiClock className="h-5 w-5" /> :
                    <HiClock className="h-5 w-5" />;
        return (
          <Tooltip content={priority}>
            <span className="text-lg" style={{ color: getPriorityColor(priority) }}>
              {icon}
            </span>
          </Tooltip>
        );
      },
      filters: MAINTENANCE_PRIORITIES.map(p => ({ text: p, value: p })),
      onFilter: (value, request) => request.priority === value,
      filterMultiple: false,
    }),
    {
      title: COLUMN_NAMES.CREATED_BY,
      key: 'openedBy',
      align: 'center',
      ellipsis: true,
      render: (_, request) => {
        if (userRole === 'landlord') {
          if (request.initiatedBy === 'landlord') {
            return <span className="text-center block">{userName || '—'}</span>;
          } else {
            return <span className="text-center block">{request.tenant ? `${request.tenant.firstName} ${request.tenant.lastName}` : '—'}</span>;
          }
        } else {
          if (request.initiatedBy === 'landlord') {
            const landlordName = request.property?.landlord 
              ? `${request.property.landlord.firstName} ${request.property.landlord.lastName}`
              : 'Landlord';
            return <span className="text-center block">{landlordName}</span>;
          } else {
            return <span className="text-center block">{`${user.firstName} ${user.lastName}`}</span>;
          }
        }
      },
    },
    customizeColumn(STANDARD_COLUMNS.PROPERTY_NAME, {
      key: 'property',
      render: (_, request) => {
        const property = request.property;
        if (!property) return <span className="text-center block">—</span>;
        
        const propertyName = property.propertyName || property.addressLine1;
        
        // Single unit: show property name only
        if (property.unitCount === 1) {
          return <span className="text-center block">{propertyName}</span>;
        } else {
          // Multiple units: show "Unit# - Property Name" (e.g., "1801 Aspen")
          const unitName = request.lease?.unit?.unitName || '—';
          return <span className="text-center block">{unitName} - {propertyName}</span>;
        }
      },
    }),
    customizeColumn(MAINTENANCE_COLUMNS.CATEGORY, {
      render: (category) => (
        <span className="text-center block">{category}</span>
      ),
      filters: (userRole === 'landlord' ? LANDLORD_CATEGORIES : MAINTENANCE_CATEGORIES).map(c => ({ text: c, value: c })),
      onFilter: (value, request) => request.category === value,
      filterMultiple: false,
    }),
    customizeColumn(MAINTENANCE_COLUMNS.TITLE, {
      key: 'request',
      render: (_, request) => (
        <span className="text-center block font-semibold">{request.title}</span>
      ),
    }),
    withSorter(
      customizeColumn(STANDARD_COLUMNS.CREATED_DATE, {
        render: (date) => <span className="text-center block">{formatDateDisplay(date)}</span>,
      }),
      sortFunctions.date('createdAt')
    ),
    customizeColumn(STANDARD_COLUMNS.STATUS, {
      render: (status, record) => {
        const displayStatus = getStatusText(status, record.landlordApproved, record.tenantApproved);
        const statusColor = getStatusColor(status, record.landlordApproved, record.tenantApproved);
        const statusIcon = getStatusIcon(displayStatus);
        return (
          <div className="flex justify-center">
            <Badge color={statusColor} icon={statusIcon}>
              {displayStatus}
            </Badge>
          </div>
        );
      },
      filters: MAINTENANCE_STATUSES.map(s => ({ text: s, value: s })),
      onFilter: (value, request) => {
        const displayStatus = getStatusText(request.status, request.landlordApproved, request.tenantApproved);
        return displayStatus === value;
      },
      filterMultiple: false,
    }),
    // Approval Status Column (for PMC approval requests)
    ...(userRole === 'pmc' || userRole === 'landlord' ? [{
      title: 'Approval Status',
      key: 'approvalStatus',
      align: 'center',
      width: 150,
      render: (_, record) => {
        if (!record.pmcApprovalRequest) {
          return <Badge color="gray">No Approval Needed</Badge>;
        }
        const status = record.pmcApprovalRequest.status;
        const statusConfig = {
          PENDING: { color: 'warning', icon: <HiClock className="h-4 w-4" />, text: 'Pending' },
          APPROVED: { color: 'success', icon: <HiCheckCircle className="h-4 w-4" />, text: 'Approved' },
          REJECTED: { color: 'failure', icon: <HiXCircle className="h-4 w-4" />, text: 'Rejected' },
          CANCELLED: { color: 'gray', icon: <HiXCircle className="h-4 w-4" />, text: 'Cancelled' },
        };
        const config = statusConfig[status] || { color: 'gray', icon: null, text: status };
        return (
          <Badge color={config.color} icon={config.icon}>
            {config.text}
          </Badge>
        );
      },
      filters: >{
        { text: 'All', value: 'all' },
        { text: 'Pending Approval', value: 'pending' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' },
        { text: 'No Approval Needed', value: 'no-approval' },
      ],
      onFilter: (value, request) => {
        if (value === 'all') return true;
        if (value === 'pending') return request.pmcApprovalRequest?.status === 'PENDING';
        if (value === 'approved') return request.pmcApprovalRequest?.status === 'APPROVED';
        if (value === 'rejected') return request.pmcApprovalRequest?.status === 'REJECTED';
        if (value === 'no-approval') return !request.pmcApprovalRequest;
        return true;
      },
      filterMultiple: false,
    }] : []),
    customizeColumn(STANDARD_COLUMNS.ACTIONS, {
      render: (_, request) => {
        const canApproveReject = userRole === 'landlord'
          ? (request.status === 'New' && request.initiatedBy === 'tenant')
          : (request.status === 'New' && request.initiatedBy === 'landlord');

        // Check if landlord can approve/reject PMC approval request
        const canApprovePMCRequest = userRole === 'landlord' && 
          request.pmcApprovalRequest && 
          request.pmcApprovalRequest.status === 'PENDING';

        return (
          <div className="flex items-center gap-4">
            <Tooltip content="Download PDF" placement="top">
              <Button 
                color="light"
                size="lg"
                className="rounded-full p-2 text-green-600 hover:bg-green-50 hover:text-green-700 hover:scale-110 transition-all duration-300"
                onClick={() => handleDownloadTicketPDF(request)}
              >
                <HiDownload className="h-5 w-5" />
              </Button>
            </Tooltip>
            <Tooltip content="View Details" placement="top">
              <Button 
                color="light"
                size="lg"
                className="rounded-full p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:scale-110 transition-all duration-300"
                onClick={async () => {
                  if (userRole === 'tenant') {
                    setSelectedRequest(request);
                    openViewModalForEdit(record);
                    
                    // Auto-update status from "New" to "Pending" when tenant views (for landlord-initiated tickets)
                    if (request.status === 'New' && request.initiatedBy === 'landlord') {
                      try {
                        // Use v2Api for work order update
                        await v2Api.updateWorkOrder(request.id, { status: 'pending' });
                        await fetchRequests();
                      } catch (error) {
                        console.error('[MaintenanceClient] Error auto-updating status:', error);
                      }
                    }
                  } else {
                    setSelectedRequest(request);
                    setNewStatus(request.status);
                    openModalForEdit(record);
                    
                    // Auto-update status from "New" to "Pending" when landlord views (only for tenant-initiated tickets)
                    if (request.status === 'New' && request.initiatedBy === 'tenant') {
                      try {
                        // Use v2Api for work order update
                        const updated = await v2Api.updateWorkOrder(request.id, { 
                          status: 'pending',
                        });
                        setSelectedRequest(updated);
                        setNewStatus('pending');
                        await fetchRequests();
                      } catch (error) {
                        console.error('[MaintenanceClient] Error auto-updating status:', error);
                      }
                    }
                  }
                }}
              >
                <HiEye className="h-5 w-5" />
              </Button>
            </Tooltip>
            {canApproveReject && (
              <>
                <Tooltip content="Approve Request" placement="top">
                  <Button 
                    color="light"
                    size="lg"
                    className="rounded-full p-2 text-green-600 hover:bg-green-50 hover:text-green-700 hover:scale-110 transition-all duration-300"
                    onClick={() => handleApprove(request)}
                  >
                    <HiCheck className="h-5 w-5" />
                  </Button>
                </Tooltip>
                <Tooltip content="Reject Request" placement="top">
                  <Button 
                    color="light"
                    size="lg"
                    className="rounded-full p-2 text-red-600 hover:bg-red-50 hover:text-red-700 hover:scale-110 transition-all duration-300"
                    onClick={() => handleReject(request.id)}
                  >
                    <HiX className="h-5 w-5" />
                  </Button>
                </Tooltip>
              </>
            )}
            {canApprovePMCRequest && (
              <>
                <Tooltip content="Approve PMC Request" placement="top">
                  <Button 
                    color="blue"
                    size="sm"
                    className="flex items-center gap-2 ml-2"
                    onClick={() => handleApproveMaintenanceRequest(request.pmcApprovalRequest.id)}
                  >
                    <HiCheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                </Tooltip>
                <Tooltip content="Reject PMC Request" placement="top">
                  <Button 
                    color="failure"
                    size="sm"
                    className="flex items-center gap-2 ml-1"
                    onClick={() => handleRejectMaintenanceRequest(request.pmcApprovalRequest.id)}
                  >
                    <HiXCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </Tooltip>
              </>
            )}
          </div>
        );
      },
    }),
  ];

  // Configure columns with standard settings
  const configuredColumns = configureTableColumns(columns, {
    addSorting: false, // Keep existing sorters
    centerAlign: true,
    addWidths: false, // Keep existing widths
  });

  // Use resizable table hook
  const { tableProps } = useResizableTable(configuredColumns, {
    defaultSort: { field: 'createdAt', order: 'descend' },
    storageKey: `${userRole}-maintenance-table`,
  });

  // Get user info for display
  const getUserDisplayName = () => {
    if (userRole === 'landlord') {
      return userName || userEmail;
    } else {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    }
  };

  const getUserEmail = () => {
    return userRole === 'landlord' ? userEmail : user.email;
  };

  // Handle status update (landlord can update tenant tickets, tenant can update landlord tickets)
  async function handleStatusUpdate(newStatusValue) {
    try {
      // If trying to close, require a comment first
      if (newStatusValue === 'Closed') {
        setPendingCloseStatus('Closed');
        openCloseCommentModal();
        return; // Don't proceed until comment is provided
      }

      const authorInfo = userRole === 'landlord'
        ? { authorEmail: userEmail, authorName: userName, authorRole: 'landlord' }
        : { authorEmail: user.email, authorName: `${user.firstName} ${user.lastName}`, authorRole: 'tenant' };

      let updateData = { status: newStatusValue };
      
      // If marking as closed, set approval flag
      // Either party can close the ticket
      if (newStatusValue === 'Closed') {
        // When closing, set the current party's approval to true and the other party's to false
        if (userRole === 'landlord') {
          updateData = {
            status: 'Closed',
            landlordApproved: true,
            tenantApproved: false,
            ...authorInfo
          };
        } else {
          updateData = {
            status: 'Closed',
            tenantApproved: true,
            landlordApproved: false,
            ...authorInfo
          };
        }
      } else {
        updateData = {
          status: newStatusValue,
          ...authorInfo
        };
      }
      
      // Use v2Api for work order update
      const updated = await v2Api.updateWorkOrder(selectedRequest.id, { 
        status: 'completed',
      });
      setSelectedRequest(updated);
      setNewStatus(newStatusValue);
      await fetchRequests();
      
      // Mark as viewed after status update
      try {
        await v2Api.markWorkOrderViewed(selectedRequest.id, userRole);
      } catch (error) {
        console.error('[MaintenanceClient] Error marking as viewed:', error);
      }
      
      notify.success('Status updated successfully');
    } catch (error) {
      notify.error('Failed to update status');
    }
  }

  // Handle closure with comment
  async function handleCloseWithComment() {
    if (!closeComment.trim()) {
      notify.warning('Please provide a comment before closing the ticket');
      return;
    }

    setLoading(true);
    try {
      const authorInfo = userRole === 'landlord'
        ? { authorEmail: userEmail, authorName: userName, authorRole: 'landlord' }
        : { authorEmail: user.email, authorName: `${user.firstName} ${user.lastName}`, authorRole: 'tenant' };

      // First add the comment using v2Api
      await v2Api.addWorkOrderComment(selectedRequest.id, closeComment);

      // Then update status to completed
      // Note: v2 doesn't have landlordApproved/tenantApproved flags
      // Status is simply 'completed' when both parties agree
      const updated = await v2Api.updateWorkOrder(selectedRequest.id, { 
        status: 'completed',
      });
      setSelectedRequest(updated);
      setNewStatus('completed');
      setCloseComment('');
      closeCloseCommentModal();
      setPendingCloseStatus(null);
      await fetchRequests();
      
      notify.success('Ticket closed. Waiting for other party approval.');
    } catch (error) {
      console.error('[MaintenanceClient] Error closing ticket:', error);
      notify.error(error.message || 'Failed to close ticket');
    } finally {
      setLoading(false);
    }
  }

  // Handle closure approval
  // Note: v2 API uses simple status updates instead of approval workflow
  // If approved, mark as completed; if rejected, mark as in_progress
  async function handleApproveClosure(approved) {
    setLoading(true);
    try {
      // Use v2Api for work order update
      const updated = await v2Api.updateWorkOrder(selectedRequest.id, { 
        status: approved ? 'completed' : 'in_progress',
      });
      setSelectedRequest(updated);
      await fetchRequests();
      
      if (approved) {
        notify.success('Ticket closure approved. Case is now closed.');
      } else {
        notify.info('Ticket closure rejected. Case reopened to In Progress.');
      }
    } catch (error) {
      console.error('[MaintenanceClient] Error approving closure:', error);
      notify.error(error.message || 'Failed to approve closure');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout
      header={BannerComponent}
    >
      {(!Array.isArray(requests) || requests.length === 0) ? (
        <EmptyState
          icon={<HiWrench className="h-12 w-12" />}
          title="No maintenance requests"
          description={
            userRole === 'landlord'
              ? "Maintenance requests from tenants will appear here"
              : "No maintenance requests yet"
          }
        />
      ) : (
        <>
          <BulkActionsToolbar
            selectionCount={maintenanceBulkOps.selectionCount}
            onBulkExport={() => maintenanceBulkOps.handleBulkAction('export')}
            availableActions={['export'}
          />
          <TableWrapper>
            <FlowbiteTable
              columns={tableProps.columns}
              dataSource={filteredData}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 25,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} requests`,
              }}
              onRow={(record) => ({
                onDoubleClick: async () => {
                  if (userRole === 'tenant') {
                    setSelectedRequest(record);
                    setIsViewModalOpen(true);
                    
                    // Auto-update status from "New" to "Pending" when tenant views (for landlord-initiated tickets)
                    // This sets status to "Ticket Acknowledged: Pending"
                    if (record.status === 'New' && record.initiatedBy === 'landlord') {
                      try {
                        // Use v2Api for work order update
                        await v2Api.updateWorkOrder(record.id, { 
                          status: 'pending',
                        });
                        await fetchRequests();
                      } catch (error) {
                        console.error('[MaintenanceClient] Error auto-updating status:', error);
                      }
                    }
                  } else {
                    setSelectedRequest(record);
                    setNewStatus(record.status);
                    setIsModalOpen(true);
                    
                    // Auto-update status from "New" to "Pending" when landlord views (only for tenant-initiated tickets)
                    if (record.status === 'New' && record.initiatedBy === 'tenant') {
                      try {
                        // Use v2Api for work order update
                        const updated = await v2Api.updateWorkOrder(record.id, { 
                          status: 'pending',
                        });
                        setSelectedRequest(updated);
                        setNewStatus('pending');
                        await fetchRequests();
                      } catch (error) {
                        console.error('[MaintenanceClient] Error auto-updating status:', error);
                      }
                    }
                  }
                  
                  // Mark ticket as viewed (use v2 API)
                  try {
                    await v2Api.markWorkOrderViewed(record.id, userRole);
                    await fetchRequests();
                  } catch (error) {
                    console.error('[MaintenanceClient] Error marking as viewed:', error);
                  }
                },
                style: { cursor: 'pointer' }
              })}
            />
          </TableWrapper>
        </>
      )}
      {/* View/Edit Request Modal (Landlord uses same modal for view/edit, Tenant has separate view modal) */}
      {(userRole === 'landlord' ? isModalOpen : isViewModalOpen) && selectedRequest && typeof selectedRequest === 'object' && selectedRequest.id && (
        <Modal
          show={userRole === 'landlord' ? isModalOpen : isViewModalOpen}
          onClose={() => {
            if (userRole === 'landlord') {
              closeModal();
              setNewComment('');
              setNewStatus('');
            } else {
              closeViewModal();
              setNewComment('');
            }
          }}
          size="7xl"
        >
          <Modal.Header>
            <div className="flex items-center justify-between w-full pr-10">
              <div>
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                  Ticket# {selectedRequest?.ticketNumber || selectedRequest?.id}
                </span>
              </div>
              <div className="flex-1 text-center px-6">
                <h3 className="text-base font-semibold">
                  {selectedRequest?.title}
                </h3>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Ticket Opened : {selectedRequest?.createdAt ? formatDateTimeDisplay(selectedRequest.createdAt, ', ') : ''}
                </span>
              </div>
            </div>
          </Modal.Header>
          <Modal.Body>
          <div>
            {/* Status Bar */}
            <div className="bg-gray-50 dark:bg-gray-800 p-3 mb-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-4 gap-6 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Opened by :</span>
                  <span className="font-semibold">
                    {userRole === 'landlord' ? (
                      selectedRequest?.initiatedBy === 'landlord'
                        ? `${userName}`
                        : (selectedRequest?.tenant 
                          ? `${selectedRequest.tenant.firstName} ${selectedRequest.tenant.lastName}`
                          : 'Unknown Tenant')
                    ) : (
                      selectedRequest?.initiatedBy === 'landlord' 
                        ? (selectedRequest?.property?.landlord 
                          ? `${selectedRequest.property.landlord.firstName} ${selectedRequest.property.landlord.lastName}`
                          : 'Landlord')
                        : (user ? `${user.firstName} ${user.lastName}` : 'Tenant')
                    )}
                  </span>
                  <Badge color="gray" className="text-xs">
                    {selectedRequest?.initiatedBy === 'landlord' ? 'Landlord' : 'Tenant'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Category:</span>
                  <span className="font-semibold">{selectedRequest?.category || '—'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Priority:</span>
                  <Badge color={getPriorityColor(selectedRequest?.priority)} className="text-xs">
                    {selectedRequest?.priority || 'Normal'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Status:</span>
                  {/* Show "In Progress" if closed but awaiting approval, "Closed" if fully closed, otherwise show dropdown */}
                  {selectedRequest?.status === 'Closed' && 
                   selectedRequest?.landlordApproved && 
                   selectedRequest?.tenantApproved ? (
                    <Badge color="success">Closed</Badge>
                  ) : selectedRequest?.status === 'Closed' && 
                      !(selectedRequest?.landlordApproved && selectedRequest?.tenantApproved) ? (
                    <Badge color="info">In Progress</Badge>
                  ) : (
                    <Select
                      value={selectedRequest?.status === 'Closed' && !(selectedRequest?.landlordApproved && selectedRequest?.tenantApproved) ? 'In Progress' : selectedRequest?.status}
                      onChange={(e) => handleStatusUpdate(e.target.value)}
                      className="min-w-[140px]"
                      disabled={
                        selectedRequest?.status === 'Closed' && 
                        selectedRequest?.landlordApproved && 
                        selectedRequest?.tenantApproved
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Close</option>
                    </Select>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                {/* Approve/Reject buttons - show when other party has requested closure */}
                {selectedRequest?.status === 'Closed' && 
                 !(selectedRequest?.landlordApproved && selectedRequest?.tenantApproved) && 
                 (() => {
                   // Show buttons when the OTHER party has approved (requested closure) and you haven't
                   const awaitingMyApproval = (userRole === 'landlord' && selectedRequest?.tenantApproved && !selectedRequest?.landlordApproved) ||
                                               (userRole === 'tenant' && selectedRequest?.landlordApproved && !selectedRequest?.tenantApproved);
                   return awaitingMyApproval;
                 })() && (
                  <>
                    <Tooltip content="Approve & Close">
                      <Button 
                        color="success"
                        className="rounded-full p-2"
                        onClick={() => handleApproveClosure(true)}
                        disabled={loading}
                      >
                        {loading ? <Spinner size="sm" /> : <HiCheck className="h-5 w-5" />}
                      </Button>
                    </Tooltip>
                    <Tooltip content="Reject & Continue Work">
                      <Button 
                        color="failure"
                        className="rounded-full p-2"
                        onClick={() => handleApproveClosure(false)}
                        disabled={loading}
                      >
                        {loading ? <Spinner size="sm" /> : <HiX className="h-5 w-5" />}
                      </Button>
                    </Tooltip>
                  </>
                )}
                <Tooltip content="Download PDF">
                  <Button 
                    color="blue"
                    className="rounded-full p-2"
                    onClick={() => handleDownloadTicketPDF(selectedRequest)}
                  >
                    <HiDownload className="h-5 w-5" />
                  </Button>
                </Tooltip>
              </div>
            </div>

            {/* Description */}
            <Card className="mb-4">
              <h5 className="text-sm font-semibold mb-2">Description</h5>
              <p>{selectedRequest?.description || 'No description provided'}</p>
            </Card>

            {/* Vendor Info Card (Tenant View) */}
            {userRole === 'tenant' && (selectedRequest?.assignedToProviderId || selectedRequest?.assignedToVendorId) && (selectedRequest?.assignedToProvider || selectedRequest?.assignedToVendor) && (
              <Card 
                className="mb-4 border-2 border-blue-500 bg-blue-50 dark:bg-blue-900"
              >
                <div className="flex items-center gap-2 mb-4">
                  <HiWrench className="h-5 w-5 text-blue-600" />
                  <h5 className="text-base font-semibold text-blue-600">Assigned Contractor</h5>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Business Name:</p>
                      <p className="text-sm font-semibold">
                        {(selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.businessName || (selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Contact Person:</p>
                      <p className="text-sm">{(selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.name}</p>
                    </div>
                    {((selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.rating) && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rating:</p>
                        <div className="flex items-center gap-2">
                          <StarRating value={(selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.rating} size="small" />
                          <span className="text-sm">{((selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.rating).toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {((selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.phone) && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone:</p>
                        <p className="text-sm font-semibold text-blue-600">
                          {(selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.phone}
                        </p>
                      </div>
                    )}
                    {((selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.email) && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email:</p>
                        <p className="text-sm font-semibold text-blue-600">
                          {(selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.email}
                        </p>
                      </div>
                    )}
                    {((selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.hourlyRate) && (selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.hourlyRate > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hourly Rate:</p>
                        <p className="text-sm font-semibold">
                          ${(selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.hourlyRate}/hr
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <Alert color="info" className="mt-3">
                  <p className="text-sm">Please contact the contractor to schedule an appointment</p>
                </Alert>
              </Card>
            )}

            {/* Select Vendor Button (Landlord and PMC) */}
            {(userRole === 'landlord' || userRole === 'pmc') && selectedRequest.category && !selectedRequest.assignedToProviderId && !selectedRequest.assignedToVendorId && (
              <Card className="mb-4 p-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <HiWrench className="h-5 w-5" />
                    <span className="font-semibold">Assign Vendor</span>
                    <Badge color="blue" className="text-xs">
                      {selectedRequest.category}
                    </Badge>
                  </div>
                  <Button
                    color="blue"
                    className="flex items-center gap-2"
                    onClick={handleOpenVendorSelect}
                  >
                    <HiWrench className="h-4 w-4" />
                    Select Vendor
                  </Button>
                </div>
              </Card>
            )}

            {/* Timeline View (Tenant) */}
            {userRole === 'tenant' && (
              <Card className="mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <HiClock className="h-5 w-5" />
                  <h5 className="text-base font-semibold">Timeline</h5>
                </div>
                <SimpleTimeline
                  items={[
                    {
                      color: 'blue',
                      children: (
                        <div>
                          <p className="font-semibold">Ticket Created</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDateTimeDisplay(selectedRequest.createdAt, ' • ')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Status: {selectedRequest.status}
                          </p>
                        </div>
                      )
                    },
                    ...(selectedRequest.comments || []).map((comment) => {
                      const isStatusUpdate = comment.comment.includes('Status:') || 
                                            comment.comment.includes('Ticket Acknowledged') ||
                                            comment.comment.includes('In Progress') ||
                                            comment.comment.includes('assigned to');
                      return {
                        color: isStatusUpdate ? 'green' : 'gray',
                        children: (
                          <div>
                            <p className="font-semibold">{comment.authorName || 'Unknown'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatDateTimeDisplay(comment.createdAt, ' • ')}
                            </p>
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                              {renderCommentText(comment.comment)}
                            </div>
                          </div>
                        )
                      };
                    }),
                    ...(selectedRequest.status === 'Closed' && selectedRequest.landlordApproved && selectedRequest.tenantApproved ? [{
                      color: 'green',
                      children: (
                        <div>
                          <p className="font-semibold">Ticket Closed</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Approved by both parties
                          </p>
                        </div>
                      )
                    }] : [])
                  ]}
                />
              </Card>
            )}

            {/* Comments Section */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <h5 className="text-base font-semibold">Activity</h5>
                <Badge color="blue">
                  {selectedRequest.comments?.length || 0}
                </Badge>
              </div>
              <div className="max-h-[350px] overflow-y-auto mb-4">
                {selectedRequest.comments && selectedRequest.comments.length > 0 ? (
                  <div>
                    {[...selectedRequest.comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((comment, idx) => {
                      const isCurrentUser = userRole === 'landlord'
                        ? comment.authorEmail === userEmail
                        : comment.authorEmail === user.email;
                      
                      return (
                        <div key={idx} className={idx < selectedRequest.comments.length - 1 ? "mb-6" : ""}>
                          <div className="flex gap-3">
                            <Avatar
                              img={(props) => <HiUser {...props} />}
                              className={`${
                                isCurrentUser 
                                  ? (userRole === 'landlord' ? 'bg-blue-500' : 'bg-gray-500')
                                  : (userRole === 'landlord' ? 'bg-gray-500' : 'bg-blue-500')
                              }`}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold">
                                  {comment.authorName || 'Unknown'}
                                </span>
                                <Badge color={isCurrentUser ? (userRole === 'landlord' ? 'blue' : 'gray') : (userRole === 'landlord' ? 'gray' : 'blue')} className="text-xs">
                                  {isCurrentUser ? (userRole === 'landlord' ? 'Landlord' : 'Tenant') : (userRole === 'landlord' ? 'Tenant' : 'Landlord')}
                                </Badge>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDateTimeDisplay(comment.createdAt, ' • ')}
                                </span>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 mt-2">
                                {renderCommentText(comment.comment)}
                              </div>
                            </div>
                          </div>
                          {idx < selectedRequest.comments.length - 1 && (
                            <Divider className="my-4" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Empty 
                    description="No activity yet"
                    className="py-8"
                  />
                )}
              </div>

              {/* Comment Input Section - only show if ticket is not fully closed */}
              {!(selectedRequest.status === 'Closed' && selectedRequest.landlordApproved && selectedRequest.tenantApproved) ? (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <Textarea
                      rows={2}
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 resize-none"
                    />
                    <Button 
                      color="blue"
                      className="flex items-center gap-2 h-auto"
                      onClick={handleAddComment}
                      disabled={loading || !newComment.trim()}
                    >
                      {loading ? (
                        <Spinner size="sm" />
                      ) : (
                        <>
                          <HiPaperAirplane className="h-4 w-4" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : null}
            </Card>

            {/* Expense Tracking Section (Landlord Only) */}
            {userRole === 'landlord' && (
              <Card className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <HiCurrencyDollar className="h-5 w-5" />
                    <h5 className="text-base font-semibold">Expenses</h5>
                    <Badge color="blue">
                      {expenses.length}
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Total: ${expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                    </span>
                  </div>
                  <Button
                    color="blue"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => openExpenseModal()}
                  >
                    <HiPlus className="h-4 w-4" />
                    Add Expense
                  </Button>
                </div>
                {expenseLoading ? (
                  <div className="text-center py-8">
                    <Spinner size="xl" />
                  </div>
                ) : (
                  expenses.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table hoverable>
                        <Table.Head>
                          <Table.HeadCell>Date</Table.HeadCell>
                          <Table.HeadCell>Description</Table.HeadCell>
                          <Table.HeadCell>Paid To</Table.HeadCell>
                          <Table.HeadCell className="text-right">Amount</Table.HeadCell>
                          <Table.HeadCell>Payment Method</Table.HeadCell>
                          <Table.HeadCell className="text-center">Invoice</Table.HeadCell>
                        </Table.Head>
                        <Table.Body className="divide-y">
                          {expenses.map((record) => (
                            <Table.Row key={record.id}>
                              <Table.Cell>{formatDateDisplay(record.date)}</Table.Cell>
                              <Table.Cell>{record.description}</Table.Cell>
                              <Table.Cell>{record.paidTo}</Table.Cell>
                              <Table.Cell className="text-right">
                                <span className="font-semibold text-red-600">
                                  ${record.amount.toFixed(2)}
                                </span>
                              </Table.Cell>
                              <Table.Cell>{record.paymentMethod}</Table.Cell>
                              <Table.Cell className="text-center">
                                {!record.receiptUrl ? (
                                  userRole === 'landlord' ? (
                                    <Button
                                      color="light"
                                      size="sm"
                                      className="flex items-center gap-1"
                                      onClick={() => {
                                        openInvoiceUploadModalForExpense(record.id);
                                        setExistingExpenseInvoiceFileList([]);
                                      }}
                                    >
                                      <HiUpload className="h-4 w-4" />
                                      Upload
                                    </Button>
                                  ) : (
                                    <span className="text-gray-500">—</span>
                                  )
                                ) : (
                                  <div className="flex items-center justify-center gap-2">
                                    <Tooltip content="View Invoice">
                                      <Button
                                        color="light"
                                        size="sm"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setViewingInvoiceUrl(record.receiptUrl);
                                          openInvoiceViewModal();
                                        }}
                                      >
                                        <HiEye className="h-4 w-4" />
                                      </Button>
                                    </Tooltip>
                                    <Tooltip content="Download Invoice">
                                      <Button
                                        color="light"
                                        size="sm"
                                        onClick={() => {
                                          const link = document.createElement('a');
                                          link.href = record.receiptUrl;
                                          link.download = `invoice_${record.id}.pdf`;
                                          link.target = '_blank';
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                        }}
                                      >
                                        <HiDownload className="h-4 w-4" />
                                      </Button>
                                    </Tooltip>
                                  </div>
                                )}
                              </Table.Cell>
                            </Table.Row>
                          ))}
                        </Table.Body>
                      </Table>
                    </div>
                  ) : (
                    <Empty 
                      description="No expenses recorded yet"
                      className="py-6"
                    />
                  )}
                )}
              </Card>
            )}
          </div>
          </Modal.Body>
        </Modal>
      )}

      {/* Close Ticket Comment Modal */}
      <MaintenanceCloseCommentModal
        open={closeCommentModalOpen}
        onOk={handleCloseWithComment}
        onCancel={() => {
          closeCloseCommentModal();
          setCloseComment('');
          setPendingCloseStatus(null);
        }}
        closeComment={closeComment}
        setCloseComment={setCloseComment}
        loading={loading}
      />

      {/* Vendor Selection Modal */}
      <MaintenanceVendorSelector
        open={vendorSelectModalOpen}
        onCancel={() => {
          setVendorSelectModalOpen(false);
          setVendorSearchText('');
          setVendorSourceFilter('all');
        }}
        selectedRequest={selectedRequest}
        allVendors={allVendors}
        suggestedVendors={suggestedVendors}
        loadingAllVendors={loadingAllVendors || loadingVendors}
        vendorSearchText={vendorSearchText}
        setVendorSearchText={setVendorSearchText}
        vendorSourceFilter={vendorSourceFilter}
        setVendorSourceFilter={setVendorSourceFilter}
        vendorUsageStats={vendorUsageStats}
        loadingVendorStats={loadingVendorStats}
        onAssignVendor={handleAssignVendor}
        fetchVendorUsageStats={fetchVendorUsageStats}
      />

      {/* Add Expense Modal (Landlord Only) */}
      {userRole === 'landlord' && (
        <MaintenanceExpenseTracker
          open={expenseModalOpen}
          onCancel={() => {
            closeExpenseModal();
          }}
          selectedRequest={selectedRequest}
          vendors={vendors}
          onExpenseAdded={async (expense) => {
            await fetchExpenses(selectedRequest.id);
            await fetchRequests();
          }}
        />
      )}

      {/* Create Ticket Modal (Landlord) */}
      {userRole === 'landlord' && (
        <Modal
          show={isCreateModalOpen}
          onClose={() => {
            createForm.resetForm();
            setTenantProperties([]);
            setIsPropertyEditable(false);
            setSelectedCategoryDesc('');
            closeCreateModal();
          }}
          size="md"
        >
          <Modal.Header>Create Maintenance Ticket</Modal.Header>
          <Modal.Body>
            <MaintenanceCreateTicketModal
            onSubmit={handleCreateTicket}
            form={createForm}
            tenants={tenants}
            tenantProperties={tenantProperties}
            allProperties={allProperties}
            isPropertyEditable={isPropertyEditable}
            selectedCategoryDesc={selectedCategoryDesc}
            onTenantChange={handleTenantChange}
            onCategoryChange={handleCategoryChange}
            fetchTenants={fetchTenants}
            loading={loading}
          />
          </Modal.Body>
        </Modal>
      )}

      {/* Submit Request Modal (Tenant) */}
      {userRole === 'tenant' && (
        <Modal
          show={isModalOpen}
          onClose={() => {
            closeModal();
            setSelectedPropertyAddress({ addressLine: '', cityStateZip: '' });
          }}
          size="lg"
        >
          <Modal.Header>Submit Maintenance Request</Modal.Header>
          <Modal.Body>
            <MaintenanceSubmitRequestModal
            onSubmit={handleCreateTicket}
            form={form}
            properties={properties}
            selectedPropertyAddress={selectedPropertyAddress}
            onPropertyChange={handlePropertyChange}
            renderFormButtons={renderFormButtons}
          />
          </Modal.Body>
        </Modal>
      )}

      {/* Invoice Upload Modal for Existing Expenses */}
      <Modal
        show={invoiceUploadModalOpen}
        onClose={() => {
          closeInvoiceUploadModal();
          setExistingExpenseInvoiceFileList([]);
        }}
        size="md"
      >
        <Modal.Header>Upload Invoice</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-1">Select Invoice File</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
              </p>
            </div>
            <FileInput
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setExistingExpenseInvoiceFileList([file]);
                }
              }}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="gray"
            onClick={() => {
              closeInvoiceUploadModal();
              setExistingExpenseInvoiceFileList([]);
            }}
          >
            Cancel
          </Button>
          <Button
            color="blue"
            className="flex items-center gap-2"
            onClick={handleUploadInvoice}
            disabled={uploadingInvoice || !existingExpenseInvoiceFileList || existingExpenseInvoiceFileList.length === 0}
          >
            {uploadingInvoice ? (
              <>
                <Spinner size="sm" />
                Uploading...
              </>
            ) : (
              <>
                <HiUpload className="h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Invoice View Modal with iframe */}
      <Modal
        show={invoiceViewModalOpen}
        onClose={() => {
          closeInvoiceViewModal();
        }}
        size="7xl"
      >
        <Modal.Header>Invoice</Modal.Header>
        <Modal.Body className="p-0" style={{ height: 'calc(100vh - 200px)' }}>
          {viewingInvoiceUrl && (
            <iframe
              src={`${viewingInvoiceUrl}#view=FitH`}
              className="w-full h-full border-0"
              title="Invoice"
              type="application/pdf"
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="gray"
            onClick={() => {
              closeInvoiceViewModal();
              setViewingInvoiceUrl(null);
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Maintenance Approval Modal */}
      <MaintenanceRejectApprovalModal
        open={rejectMaintenanceModalOpen}
        onOk={handleRejectMaintenanceSubmit}
        onCancel={() => {
          setRejectMaintenanceModalOpen(false);
          setRejectingMaintenanceApprovalId(null);
          rejectMaintenanceForm.resetForm();
        }}
        form={rejectMaintenanceForm}
      />
    </PageLayout>
  );
}

