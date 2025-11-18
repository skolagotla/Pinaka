/**
 * Unified Maintenance Client Component
 * 
 * Handles both landlord and tenant maintenance request views with role-based features
 * Consolidates ~2,600 lines of duplicate code into a single component
 */

"use client";
import { useState, useEffect, useRef } from "react";
import { 
  Typography, Button, Table, Tag, Space, Card, Row, Col, Statistic, 
  Modal, Form, Input, Select, Spin, Descriptions, Timeline, Tooltip,
  Divider, Avatar, Badge, Alert, App, DatePicker, Rate, Upload, Empty
} from 'antd';
import PageLayout, { EmptyState, TableWrapper } from './PageLayout';
// Lazy load Pro components to reduce initial bundle size (~200KB savings)
import { ProTable, ProForm } from './LazyProComponents';
import { 
  ToolOutlined, WarningOutlined, CheckCircleOutlined, ClockCircleOutlined,
  ExclamationCircleOutlined, EyeOutlined, CheckOutlined, CloseOutlined,
  UserOutlined, SendOutlined, DownloadOutlined, PlusOutlined, SaveOutlined,
  DollarOutlined, DeleteOutlined, SearchOutlined, UploadOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatDateDisplay, formatDateTimeDisplay } from '@/lib/utils/safe-date-formatter';
import { v1Api } from '@/lib/api/v1-client';

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

const { Title, Text } = Typography;
const { TextArea } = Input;

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
  const { message } = App.useApp();
  
  // Check permissions (PMC-managed landlords cannot create maintenance requests)
  const permissions = usePermissions(user || { role: userRole || 'landlord' });
  
  // 🎯 Use Maintenance Hooks for better code organization
  const maintenanceRequests = useMaintenanceRequests({
    userRole,
    initialRequests
  });
  const { requests: rawRequests, loading, selectedRequest, setSelectedRequest, setRequests, fetchRequests, updateRequest, addRequest, removeRequest } = maintenanceRequests;
  
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
  const [createForm] = Form.useForm();
  const [form] = Form.useForm();
  
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
          form.resetFields();
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
        a.download = `maintenance-tickets-${new Date().toISOString().split('T')[0]}.csv`;
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

  // Landlord-specific: Fetch tenants and properties
  async function fetchTenants() {
    if (userRole !== 'landlord') return;
    try {
      // Use v1Api for tenants
      // v1Api imported at top of file
      const response = await v1Api.tenants.list({});
      const data = response.data || response;
      // API returns { tenants: [...] } or { data: { tenants: [...] } }, so extract the tenants array
      const tenantsList = Array.isArray(data.tenants) ? data.tenants : 
                         (Array.isArray(data) ? data : 
                         (Array.isArray(data.data?.tenants) ? data.data.tenants : []));
      setTenants(tenantsList);
    } catch (error) {
      console.error('[MaintenanceClient] Error fetching tenants:', error);
      setTenants([]); // Ensure tenants is always an array even on error
    }
  }

  async function fetchProperties() {
    if (userRole !== 'landlord') return;
    try {
      // Use v1Api for properties
      // v1Api imported at top of file
      const response = await v1Api.properties.list({});
      const result = response.data || response;
      // Handle both old format (array) and new format (object with data property)
      let propertiesData = [];
      if (Array.isArray(result)) {
        propertiesData = result;
      } else if (result && typeof result === 'object') {
        propertiesData = Array.isArray(result.data) ? result.data : 
                        (Array.isArray(result.properties) ? result.properties : []);
      }
      setAllProperties(propertiesData);
    } catch (error) {
      console.error('[MaintenanceClient] Error fetching properties:', error);
      setAllProperties([]); // Set empty array on error to prevent filter errors
    }
  }

  // Landlord-specific: Handle tenant change
  async function handleTenantChange(tenantId) {
    if (userRole !== 'landlord') return;
    try {
      // Use v1Api for tenant details
      // v1Api imported at top of file
      const response = await v1Api.tenants.get(tenantId);
      const tenant = response.data || response;
      const activeLeases = tenant.leaseTenants?.filter(lt => 
        lt.lease?.status === 'Active'
      ).map(lt => lt.lease) || [];

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
  async function fetchExpenses(maintenanceRequestId) {
    if (userRole !== 'landlord' || !maintenanceRequestId) return;
    setExpenseLoading(true);
    try {
      // Use v1Api for expenses filtered by maintenance request
      // v1Api imported at top of file
      const response = await v1Api.expenses.list({ 
        maintenanceRequestId,
        page: 1,
        limit: 1000,
      });
      const expenses = response.data?.data || response.data || [];
      setExpenses(expenses);
    } catch (error) {
      console.error('[MaintenanceClient] Error fetching expenses:', error);
    } finally {
      setExpenseLoading(false);
    }
  }

  async function fetchVendors() {
    if (userRole !== 'landlord') return;
    try {
      // Use v1Api for vendors
      // v1Api imported at top of file
      const response = await v1Api.vendors.list({ isActive: true });
      const data = response.data || response;
      setVendors(Array.isArray(data.vendors) ? data.vendors : 
                 (Array.isArray(data) ? data : []));
    } catch (error) {
      console.error('[MaintenanceClient] Error fetching vendors:', error);
    }
  }

  // Fetch vendors matching the ticket category
  async function fetchSuggestedVendors(category) {
    if ((userRole !== 'landlord' && userRole !== 'pmc') || !category) return;
    setLoadingVendors(true);
    try {
      // Use v1Api for vendors with category filter
      // v1Api imported at top of file
      const response = await v1Api.vendors.list({ category, isActive: true });
      const data = response.data || response;
      setSuggestedVendors(Array.isArray(data.vendors) ? data.vendors : 
                         (Array.isArray(data) ? data : []));
    } catch (error) {
      console.error('[MaintenanceClient] Error fetching suggested vendors:', error);
    } finally {
      setLoadingVendors(false);
    }
  }

  // Fetch all vendors for selection
  async function fetchAllVendors() {
    if (userRole !== 'landlord' && userRole !== 'pmc') return;
    setLoadingAllVendors(true);
    try {
      // Use v1Api for vendors
      // v1Api imported at top of file
      const response = await v1Api.vendors.list({ isActive: true });
      const data = response.data || response;
      setAllVendors(Array.isArray(data.vendors) ? data.vendors : 
                   (Array.isArray(data) ? data : []));
    } catch (error) {
      console.error('[MaintenanceClient] Error fetching all vendors:', error);
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
  async function fetchVendorUsageStats(vendorId) {
    if (vendorUsageStats[vendorId] || loadingVendorStats[vendorId]) return;
    
    setLoadingVendorStats(prev => ({ ...prev, [vendorId]: true }));
    try {
      const { apiClient } = await import('@/lib/utils/api-client');
      const response = await apiClient(`/api/v1/vendors/${vendorId}/usage-stats`, {
        method: 'GET',
      });
      const data = await response.json();
      if (data.success && data.data) {
        setVendorUsageStats(prev => ({ ...prev, [vendorId]: data.data }));
      } else if (data.success) {
        setVendorUsageStats(prev => ({ ...prev, [vendorId]: data }));
      }
    } catch (error) {
      console.error('[MaintenanceClient] Error fetching vendor usage stats:', error);
    } finally {
      setLoadingVendorStats(prev => ({ ...prev, [vendorId]: false }));
    }
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
        // Use v1Api for maintenance request update
        // v1Api imported at top of file
        result = await v1Api.maintenance.update(selectedRequest.id, { 
          assignedToProviderId: vendorId || null 
        });
        result = result.data || result;
      } catch (error) {
        console.error('[MaintenanceClient] Error assigning vendor:', error);
        // If it's a 202 response (approval required), try to handle it
        if (error.response && error.response.status === 202) {
          try {
            result = await error.response.json();
          } catch (parseError) {
            console.error('[MaintenanceClient] Error parsing 202 response:', parseError);
            message.error('Failed to process vendor assignment request');
            return;
          }
        } else {
          message.error(error.message || 'Failed to assign vendor');
          return;
        }
      }
      
      // Handle approval workflow response (202 Accepted)
      if (result && (result.requiresApproval || response?.status === 202)) {
        if (result.approvalRequest) {
          message.success('Vendor assignment request sent to landlord for approval');
        } else {
          message.info('Vendor assignment is pending approval');
        }
        // Refresh the request to show pending approval status
        try {
          // v1Api imported at top of file
          const refreshed = await v1Api.maintenance.get(selectedRequest.id);
          const refreshedData = refreshed.data || refreshed;
          if (refreshedData && typeof refreshedData === 'object') {
            setSelectedRequest(refreshedData);
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
        message.error('Unexpected response from server');
        return;
      }

      // If assigning (not unassigning), add comment with vendor contact info for tenant
      if (vendorId && result && !result.requiresApproval) {
        // Get vendor details
        let vendor;
        try {
          // v1Api imported at top of file
          const vendorResponse = await v1Api.vendors.get(vendorId);
          vendor = vendorResponse.data || vendorResponse;
        } catch (vendorError) {
          console.error('[MaintenanceClient] Error fetching vendor details:', vendorError);
          // Continue without vendor details
          vendor = { name: 'Vendor', businessName: 'Vendor' };
        }

        const vendorName = vendor?.businessName || vendor?.name || 'Vendor';
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

        // Use v1Api specialized method for maintenance comments
        // v1Api imported at top of file
        await v1Api.specialized.addMaintenanceComment(
          selectedRequest.id,
          vendorComment,
          authorInfo
        );

        // Refresh to get updated comments
        // v1Api imported at top of file
        const refreshedResponse = await v1Api.maintenance.get(selectedRequest.id);
        const refreshed = refreshedResponse.data || refreshedResponse;
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
            } else if (refreshed.propertyId) {
              // Fetch property separately if not included
              // v1Api imported at top of file
              const propertyResponse = await v1Api.properties.get(refreshed.propertyId);
              const propertyData = propertyResponse.data || propertyResponse;
              landlord = propertyData.property?.landlord || propertyData?.landlord;
            }
            
            if (landlord) {
              // Use v1Api for notifications
              // v1Api imported at top of file
              await v1Api.notifications.create({
                userId: landlord.id,
                userRole: 'landlord',
                userEmail: landlord.email,
                type: 'maintenance_update',
                title: 'Vendor Assigned to Maintenance Request',
                message: `Your property management company has assigned ${vendorName} to maintenance request #${refreshed.ticketNumber || refreshed.id.substring(0, 8)}.`,
                priority: 'normal',
                entityType: 'maintenance_request',
                entityId: refreshed.id,
                actionUrl: `/operations?tab=maintenance&ticketId=${refreshed.id}`,
                actionLabel: 'View Request',
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
              // v1Api imported at top of file
              const currentTicketResponse = await v1Api.maintenance.get(refreshed.id);
              const currentData = currentTicketResponse.data || currentTicketResponse;
              
              // Check if this is still the first non-status comment
              const currentNonStatusComments = currentData.comments?.filter(c => !c.isStatusUpdate) || [];
              const stillFirstComment = currentNonStatusComments.length === 1;
              
              console.log('Vendor assignment status check:', {
                currentStatus: currentData.status,
                stillFirstComment,
                nonStatusCommentCount: currentNonStatusComments.length
              });
              
              // Only update if still in Pending/New status and this is still the first comment scenario
              if ((currentData.status === 'Pending' || currentData.status === 'New') && stillFirstComment) {
                console.log('Updating status to In Progress after vendor assignment...');
                // Use v1Api for maintenance request update
                // v1Api imported at top of file
                const statusUpdated = await v1Api.maintenance.update(refreshed.id, { 
                  status: 'In Progress',
                  ...authorInfo
                });
                const statusUpdatedData = statusUpdated.data || statusUpdated;
                setSelectedRequest(statusUpdatedData);
                await fetchRequests();
                if (userRole === 'landlord') setNewStatus('In Progress');
                console.log('Status updated to In Progress successfully after vendor assignment');
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
          message.success('Vendor assigned successfully. Tenant and landlord have been notified.');
        } else {
          message.success('Vendor assigned successfully. Tenant has been notified.');
        }
      } else {
        await fetchRequests();
        message.success('Vendor unassigned successfully');
      }
    } catch (error) {
      console.error('[MaintenanceClient] Error:', error);
    } finally {
      setLoading(false);
    }
  }

  // handleAddExpense moved to MaintenanceExpenseTracker component

  // Handle invoice upload for existing expense
  async function handleUploadInvoice() {
    if (!uploadingExpenseId || !existingExpenseInvoiceFileList || existingExpenseInvoiceFileList.length === 0 || !existingExpenseInvoiceFileList[0].originFileObj) {
      message.warning('Please select an invoice file');
      return;
    }

    setUploadingInvoice(true);
    try {
      // First upload the file
      const formData = new FormData();
      formData.append('invoice', existingExpenseInvoiceFileList[0].originFileObj);
      
      // Use v1 API for expense invoice upload
      const uploadResponse = await fetch(
        '/api/v1/expenses/upload-invoice',
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );
      
      if (!uploadResponse.ok) {
        const error = await uploadResponse.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'Failed to upload invoice');
      }
      
      const uploadData = await uploadResponse.json();
      if (!uploadData.success || !uploadData.receiptUrl) {
        throw new Error('Failed to upload invoice');
      }

      // Then update the expense with the receiptUrl using v1Api
      // v1Api imported at top of file
      const updateResponse = await v1Api.expenses.update(uploadingExpenseId, { 
        receiptUrl: uploadData.receiptUrl 
      });
      const updateData = updateResponse.data || updateResponse;
      if (updateData.success && updateData.expense) {
        // Update local expenses state
        setExpenses(prevExpenses => 
          prevExpenses.map(exp => 
            exp.id === uploadingExpenseId 
              ? { ...exp, receiptUrl: uploadData.receiptUrl }
              : exp
          )
        );
        message.success('Invoice uploaded successfully');
        closeInvoiceUploadModal();
        setExistingExpenseInvoiceFileList([]);
      } else {
        throw new Error('Failed to update expense');
      }
    } catch (error) {
      console.error('[MaintenanceClient] Invoice upload error:', error);
      message.error('Failed to upload invoice');
    } finally {
      setUploadingInvoice(false);
    }
  }

  // Create/Submit ticket handler
  async function handleCreateTicket(values) {
    setLoading(true);
    try {
      const requestData = userRole === 'landlord'
        ? { ...values, initiatedBy: 'landlord' }
        : { ...values, tenantId: user.id };

      // Use v1Api for creating maintenance request
      // v1Api imported at top of file
      await v1Api.maintenance.create(requestData);

      message.success(userRole === 'landlord' 
        ? 'Ticket created successfully'
        : 'Maintenance request submitted successfully');
      
      if (userRole === 'landlord') {
        createForm.resetFields();
        setTenantProperties([]);
        setIsPropertyEditable(false);
        setSelectedCategoryDesc('');
        closeCreateModal();
      } else {
        closeModal();
        setSelectedPropertyAddress({ addressLine: '', cityStateZip: '' });
        form.resetFields();
      }
      
      await fetchRequests();
    } catch (error) {
      console.error('[MaintenanceClient] Error creating maintenance request:', error);
      message.error(error.message || 'Failed to create maintenance request');
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
      case 'New': return <ExclamationCircleOutlined />;
      case 'Pending': return <ClockCircleOutlined />;
      case 'In Progress': return <ToolOutlined />;
      case 'Closed': return <CheckCircleOutlined />;
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

      // Use v1Api for maintenance request update
      // v1Api imported at top of file
      await v1Api.maintenance.update(request.id, { 
        status: 'Pending',
        ...authorInfo
      });
      
      await fetchRequests();
      message.success(userRole === 'landlord' 
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
      // Use v1Api to update maintenance status to rejected
      // v1Api imported at top of file
      await v1Api.maintenance.update(id, { status: 'Rejected' });
      
      await fetchRequests();
      message.success('Request rejected');
    } catch (error) {
      console.error('[MaintenanceClient] Error rejecting request:', error);
      message.error(error.message || 'Failed to reject request');
    } finally {
      setLoading(false);
    }
  }

  // Handler for approving PMC maintenance approval requests (landlord only)
  async function handleApproveMaintenanceRequest(approvalId) {
    setLoading(true);
    try {
      // Use adminApi for approvals
      const { adminApi } = await import('@/lib/api/admin-api');
      const result = await adminApi.approveApproval(approvalId, null);
      if (result.success || result) {
        message.success('Maintenance request approved successfully');
        await fetchRequests();
      }
    } catch (error) {
      console.error('Error approving maintenance request:', error);
      message.error(error.message || 'Failed to approve maintenance request');
    } finally {
      setLoading(false);
    }
  }

  // Handler for rejecting PMC maintenance approval requests (landlord only)
  const [rejectMaintenanceModalOpen, setRejectMaintenanceModalOpen] = useState(false);
  const [rejectingMaintenanceApprovalId, setRejectingMaintenanceApprovalId] = useState(null);
  const [rejectMaintenanceForm] = Form.useForm();

  function handleRejectMaintenanceRequest(approvalId) {
    setRejectingMaintenanceApprovalId(approvalId);
    setRejectMaintenanceModalOpen(true);
    rejectMaintenanceForm.resetFields();
  }

  async function handleRejectMaintenanceSubmit() {
    try {
      const values = await rejectMaintenanceForm.validateFields();
      // Use adminApi for approvals
      const { adminApi } = await import('@/lib/api/admin-api');
      await adminApi.rejectApproval(rejectingMaintenanceApprovalId, values.reason);
      message.success('Maintenance request rejected successfully');
      setRejectMaintenanceModalOpen(false);
      setRejectingMaintenanceApprovalId(null);
      rejectMaintenanceForm.resetFields();
      await fetchRequests();
    } catch (error) {
      if (error.errorFields) {
        // Form validation error, don't show message
        return;
      }
      console.error('Error rejecting maintenance request:', error);
      message.error(error.message || 'Failed to reject maintenance request');
    }
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;
    
    setLoading(true);
    try {
      const authorInfo = userRole === 'landlord'
        ? { authorEmail: userEmail, authorName: userName, authorRole: 'landlord' }
        : { authorEmail: user.email, authorName: `${user.firstName} ${user.lastName}`, authorRole: 'tenant' };

      // Use v1Api specialized method for maintenance comments
      // v1Api imported at top of file
      const updated = await v1Api.specialized.addMaintenanceComment(
        selectedRequest.id,
        newComment,
        authorInfo
      );
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
            // v1Api imported at top of file
            const currentTicketResponse = await v1Api.maintenance.get(updated.id);
            const currentData = currentTicketResponse.data || currentTicketResponse;
            
            // Check if this is still the first non-status comment
            const currentNonStatusComments = currentData.comments?.filter(c => !c.isStatusUpdate) || [];
            const stillFirstComment = currentNonStatusComments.length === 1;
            
            console.log('Status check:', {
              currentStatus: currentData.status,
              stillFirstComment,
              nonStatusCommentCount: currentNonStatusComments.length
            });
            
            // Only update if still in Pending/New status and this is still the first comment scenario
            if ((currentData.status === 'Pending' || currentData.status === 'New') && stillFirstComment) {
              console.log('Updating status to In Progress...');
              // Use v1Api for maintenance request update
              // v1Api imported at top of file
              const statusUpdatedResponse = await v1Api.maintenance.update(updated.id, { 
                status: 'In Progress',
                ...authorInfo
              });
              const statusUpdated = statusUpdatedResponse.data || statusUpdatedResponse;
              setSelectedRequest(statusUpdated);
              await fetchRequests();
              if (userRole === 'landlord') setNewStatus('In Progress');
              console.log('Status updated to In Progress successfully');
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
        // v1Api imported at top of file
        await v1Api.specialized.markMaintenanceViewed(selectedRequest.id, userRole);
      } catch (error) {
        console.error('[MaintenanceClient] Error marking as viewed:', error);
      }
      
      message.success('Comment added');
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadTicketPDF(request) {
    try {
      setLoading(true);
      // Use v1 API for PDF download
      const response = await fetch(
        `/api/v1/maintenance/${request.id}/download-pdf`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      
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
      
      message.success('Ticket PDF downloaded successfully');
    } catch (error) {
      message.error('Failed to download ticket PDF');
      console.error('PDF download error:', error);
    } finally {
      setLoading(false);
    }
  }

  // Helper function to render comment text with styled status
  function renderCommentText(text) {
    const statusColors = {
      'Pending': '#fa8c16', // Orange
      'In Progress': '#1890ff', // Blue
      'Closed': '#52c41a', // Green
      'Close': '#52c41a', // Green (for "Close" word)
      'New': '#8c8c8c'
    };

    // Check for full phrases first
    if (text.includes('Ticket Acknowledged: Pending')) {
      const parts = text.split('Ticket Acknowledged: Pending');
      return (
        <Text>
          {parts[0]}
          Ticket Acknowledged: <Text strong style={{ color: statusColors['Pending'], fontWeight: 700 }}>Pending</Text>
          {parts[1]}
        </Text>
      );
    }
    
    // If the text is exactly "In Progress", it's a status update
    if (text === 'In Progress') {
      return (
        <Text>
          <Text strong style={{ color: statusColors['In Progress'], fontWeight: 700 }}>In Progress</Text>
        </Text>
      );
    }

    // Match status words (case-insensitive) - including "Close" separately
    const statusPattern = /(Pending|In Progress|Closed|Close|New)/gi;
    const parts = text.split(statusPattern);

    if (parts.length === 1) {
      return <Text>{text}</Text>;
    }

    return (
      <Text>
        {parts.map((part, idx) => {
          // Find matching status (case-insensitive)
          const matchedStatus = Object.keys(statusColors).find(
            status => status.toLowerCase() === part.toLowerCase()
          );
          
          if (matchedStatus) {
            return (
              <Text 
                key={idx} 
                strong 
                style={{ 
                  color: statusColors[matchedStatus], 
                  fontWeight: 700 
                }}
              >
                {part}
              </Text>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </Text>
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
        <Badge dot={hasUnreadUpdates(record)} offset={[5, 0]}>
          <Text
            strong
            style={{
              fontFamily: 'monospace',
              fontSize: 12,
              ...(userRole === 'tenant' ? { textAlign: 'center', display: 'block' } : {})
            }}
          >
            {ticketNumber || '—'}
          </Text>
        </Badge>
      ),
    }),
    customizeColumn(MAINTENANCE_COLUMNS.PRIORITY, {
      render: (priority) => {
        const icon = priority === 'Urgent' ? <ExclamationCircleOutlined /> :
                    priority === 'High' ? <WarningOutlined /> :
                    priority === 'Normal' ? <ClockCircleOutlined /> :
                    <ClockCircleOutlined />;
        return (
          <Tooltip title={priority}>
            <span style={{ color: getPriorityColor(priority), fontSize: 18 }}>
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
            return <Text style={{ textAlign: 'center', display: 'block' }}>{userName || '—'}</Text>;
          } else {
            return <Text style={{ textAlign: 'center', display: 'block' }}>{request.tenant ? `${request.tenant.firstName} ${request.tenant.lastName}` : '—'}</Text>;
          }
        } else {
          if (request.initiatedBy === 'landlord') {
            const landlordName = request.property?.landlord 
              ? `${request.property.landlord.firstName} ${request.property.landlord.lastName}`
              : 'Landlord';
            return <Text style={{ textAlign: 'center', display: 'block' }}>{landlordName}</Text>;
          } else {
            return <Text style={{ textAlign: 'center', display: 'block' }}>{`${user.firstName} ${user.lastName}`}</Text>;
          }
        }
      },
    },
    customizeColumn(STANDARD_COLUMNS.PROPERTY_NAME, {
      key: 'property',
      render: (_, request) => {
        const property = request.property;
        if (!property) return <Text style={{ textAlign: 'center', display: 'block' }}>—</Text>;
        
        const propertyName = property.propertyName || property.addressLine1;
        
        // Single unit: show property name only
        if (property.unitCount === 1) {
          return <Text style={{ textAlign: 'center', display: 'block' }}>{propertyName}</Text>;
        } else {
          // Multiple units: show "Unit# - Property Name" (e.g., "1801 Aspen")
          const unitName = request.lease?.unit?.unitName || '—';
          return <Text style={{ textAlign: 'center', display: 'block' }}>{unitName} - {propertyName}</Text>;
        }
      },
    }),
    customizeColumn(MAINTENANCE_COLUMNS.CATEGORY, {
      render: (category) => (
        <Text style={{ textAlign: 'center', display: 'block' }}>{category}</Text>
      ),
      filters: (userRole === 'landlord' ? LANDLORD_CATEGORIES : MAINTENANCE_CATEGORIES).map(c => ({ text: c, value: c })),
      onFilter: (value, request) => request.category === value,
      filterMultiple: false,
    }),
    customizeColumn(MAINTENANCE_COLUMNS.TITLE, {
      key: 'request',
      render: (_, request) => (
        <Text strong style={{ textAlign: 'center', display: 'block' }}>{request.title}</Text>
      ),
    }),
    withSorter(
      customizeColumn(STANDARD_COLUMNS.CREATED_DATE, {
        render: (date) => <Text style={{ textAlign: 'center', display: 'block' }}>{formatDateDisplay(date)}</Text>,
      }),
      sortFunctions.date('createdAt')
    ),
    customizeColumn(STANDARD_COLUMNS.STATUS, {
      render: (status, record) => {
        const displayStatus = getStatusText(status, record.landlordApproved, record.tenantApproved);
        const statusColor = getStatusColor(status, record.landlordApproved, record.tenantApproved);
        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Tag color={statusColor} icon={getStatusIcon(displayStatus)}>
              {displayStatus}
            </Tag>
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
          return <Tag>No Approval Needed</Tag>;
        }
        const status = record.pmcApprovalRequest.status;
        const statusConfig = {
          PENDING: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Pending' },
          APPROVED: { color: 'green', icon: <CheckCircleOutlined />, text: 'Approved' },
          REJECTED: { color: 'red', icon: <CloseCircleOutlined />, text: 'Rejected' },
          CANCELLED: { color: 'default', icon: <CloseCircleOutlined />, text: 'Cancelled' },
        };
        const config = statusConfig[status] || { color: 'default', icon: null, text: status };
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
      filters: [
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
          <Space size="middle">
            <Tooltip title="Download PDF" placement="top">
              <Button 
                type="text"
                shape="circle"
                size="large"
                icon={<DownloadOutlined style={{ fontSize: 18 }} />} 
                onClick={() => handleDownloadTicketPDF(request)}
                style={{
                  color: '#52c41a',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f6ffed';
                  e.currentTarget.style.color = '#389e0d';
                  e.currentTarget.style.transform = 'scale(1.15)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(82, 196, 26, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#52c41a';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </Tooltip>
            <Tooltip title="View Details" placement="top">
              <Button 
                type="text"
                shape="circle"
                size="large"
                icon={<EyeOutlined style={{ fontSize: 18 }} />} 
                onClick={async () => {
                  if (userRole === 'tenant') {
                    setSelectedRequest(request);
                    openViewModalForEdit(record);
                    
                    // Auto-update status from "New" to "Pending" when tenant views (for landlord-initiated tickets)
                    if (request.status === 'New' && request.initiatedBy === 'landlord') {
                      try {
                        // Use v1Api for maintenance request update
                        // v1Api imported at top of file
                        await v1Api.maintenance.update(request.id, { status: 'Pending' });
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
                        // Use v1Api for maintenance request update
                        // v1Api imported at top of file
                        const updatedResponse = await v1Api.maintenance.update(request.id, { 
                          status: 'Pending',
                          authorEmail: userEmail,
                          authorName: userName,
                          authorRole: 'landlord'
                        });
                        const updated = updatedResponse.data || updatedResponse;
                        setSelectedRequest(updated);
                        setNewStatus('Pending');
                        await fetchRequests();
                      } catch (error) {
                        console.error('[MaintenanceClient] Error auto-updating status:', error);
                      }
                    }
                  }
                }}
                style={{
                  color: '#1890ff',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e6f7ff';
                  e.currentTarget.style.color = '#096dd9';
                  e.currentTarget.style.transform = 'scale(1.15)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#1890ff';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </Tooltip>
            {canApproveReject && (
              <>
                <Tooltip title="Approve Request" placement="top">
                  <Button 
                    type="text"
                    shape="circle"
                    size="large"
                    icon={<CheckOutlined style={{ fontSize: 18 }} />}
                    onClick={() => handleApprove(request)}
                    style={{
                      color: '#52c41a',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f6ffed';
                      e.currentTarget.style.color = '#389e0d';
                      e.currentTarget.style.transform = 'scale(1.15)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(82, 196, 26, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#52c41a';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </Tooltip>
                <Tooltip title="Reject Request" placement="top">
                  <Button 
                    type="text"
                    shape="circle"
                    size="large"
                    icon={<CloseOutlined style={{ fontSize: 18 }} />}
                    onClick={() => handleReject(request.id)}
                    style={{
                      color: '#ff4d4f',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fff1f0';
                      e.currentTarget.style.color = '#cf1322';
                      e.currentTarget.style.transform = 'scale(1.15)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 77, 79, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#ff4d4f';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </Tooltip>
              </>
            )}
            {canApprovePMCRequest && (
              <>
                <Tooltip title="Approve PMC Request" placement="top">
                  <Button 
                    type="primary"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleApproveMaintenanceRequest(request.pmcApprovalRequest.id)}
                    style={{ marginLeft: 8 }}
                  >
                    Approve
                  </Button>
                </Tooltip>
                <Tooltip title="Reject PMC Request" placement="top">
                  <Button 
                    danger
                    size="small"
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleRejectMaintenanceRequest(request.pmcApprovalRequest.id)}
                    style={{ marginLeft: 4 }}
                  >
                    Reject
                  </Button>
                </Tooltip>
              </>
            )}
          </Space>
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
      
      // Use v1Api for maintenance request update
      // v1Api imported at top of file
      const updatedResponse = await v1Api.maintenance.update(selectedRequest.id, updateData);
      const updated = updatedResponse.data || updatedResponse;
      setSelectedRequest(updated);
      setNewStatus(newStatusValue);
      await fetchRequests();
      
      // Mark as viewed after status update
      try {
        // v1Api imported at top of file
        await v1Api.specialized.markMaintenanceViewed(selectedRequest.id, userRole);
      } catch (error) {
        console.error('[MaintenanceClient] Error marking as viewed:', error);
      }
      
      message.success('Status updated successfully');
    } catch (error) {
      message.error('Failed to update status');
    }
  }

  // Handle closure with comment
  async function handleCloseWithComment() {
    if (!closeComment.trim()) {
      message.warning('Please provide a comment before closing the ticket');
      return;
    }

    setLoading(true);
    try {
      const authorInfo = userRole === 'landlord'
        ? { authorEmail: userEmail, authorName: userName, authorRole: 'landlord' }
        : { authorEmail: user.email, authorName: `${user.firstName} ${user.lastName}`, authorRole: 'tenant' };

      // First add the comment using v1Api
      // v1Api imported at top of file
      await v1Api.specialized.addMaintenanceComment(
        selectedRequest.id,
        closeComment,
        authorInfo
      );

      // Then update status to Closed
      let updateData = { status: 'Closed' };
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

      // Use v1Api for maintenance request update
      // v1Api imported at top of file
      const updatedResponse = await v1Api.maintenance.update(selectedRequest.id, updateData);
      const updated = updatedResponse.data || updatedResponse;
      setSelectedRequest(updated);
      setNewStatus('Closed');
      setCloseComment('');
      closeCloseCommentModal();
      setPendingCloseStatus(null);
      await fetchRequests();
      
      message.success('Ticket closed. Waiting for other party approval.');
    } catch (error) {
      console.error('[MaintenanceClient] Error closing ticket:', error);
      message.error(error.message || 'Failed to close ticket');
    } finally {
      setLoading(false);
    }
  }

  // Handle closure approval
  async function handleApproveClosure(approved) {
    setLoading(true);
    try {
      const authorInfo = userRole === 'landlord'
        ? { authorEmail: userEmail, authorName: userName, authorRole: 'landlord' }
        : { authorEmail: user.email, authorName: `${user.firstName} ${user.lastName}`, authorRole: 'tenant' };

      // Use v1Api specialized method for maintenance approval
      // v1Api imported at top of file
      const updated = await v1Api.specialized.approveMaintenance(
        selectedRequest.id,
        { approved, ...authorInfo }
      );
      setSelectedRequest(updated);
      await fetchRequests();
      
      if (approved) {
        message.success('Ticket closure approved. Case is now closed.');
      } else {
        message.info('Ticket closure rejected. Case reopened to In Progress.');
      }
    } catch (error) {
      console.error('[MaintenanceClient] Error approving closure:', error);
      message.error(error.message || 'Failed to approve closure');
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
          icon={<ToolOutlined />}
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
            availableActions={['export']}
          />
          <TableWrapper>
            <ProTable
            columns={tableProps.columns}
            components={tableProps.components}
            bordered={tableProps.bordered}
            dataSource={filteredData}
            rowKey="id"
            search={false}
            toolBarRender={false}
            loading={loading}
            rowSelection={{
              selectedRowKeys: maintenanceBulkOps.selectedRowKeys,
              onChange: (keys) => {
                maintenanceBulkOps.setSelectedRowKeys(keys);
              },
              onSelectAll: (selected, selectedRows, changeRows) => {
                const allKeys = selected ? changeRows.map(row => row.id || row.key) : [];
                maintenanceBulkOps.setSelectedRowKeys(allKeys);
              },
            }}
            pagination={{
              pageSize: 25,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} requests`,
            }}
            size="middle"
          onRow={(record) => ({
            onDoubleClick: async () => {
              if (userRole === 'tenant') {
                setSelectedRequest(record);
                setIsViewModalOpen(true);
                
                // Auto-update status from "New" to "Pending" when tenant views (for landlord-initiated tickets)
                // This sets status to "Ticket Acknowledged: Pending"
                if (record.status === 'New' && record.initiatedBy === 'landlord') {
                  try {
                    // Use v1Api for maintenance request update
                    // v1Api imported at top of file
                    await v1Api.maintenance.update(record.id, { 
                      status: 'Pending',
                      authorEmail: user.email,
                      authorName: `${user.firstName} ${user.lastName}`,
                      authorRole: 'tenant'
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
                    // Use v1Api for maintenance request update
                    // v1Api imported at top of file
                    const updatedResponse = await v1Api.maintenance.update(record.id, { 
                      status: 'Pending',
                      authorEmail: userEmail,
                      authorName: userName,
                      authorRole: 'landlord'
                    });
                    const updated = updatedResponse.data || updatedResponse;
                    setSelectedRequest(updated);
                    setNewStatus('Pending');
                    await fetchRequests();
                  } catch (error) {
                    console.error('[MaintenanceClient] Error auto-updating status:', error);
                  }
                }
              }
              
              // Mark ticket as viewed (use v1 API)
              try {
                const markViewedResponse = await fetch(
                  `/api/v1/maintenance/${record.id}/mark-viewed`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ role: userRole }),
                  }
                );
                if (markViewedResponse.ok) {
                  await fetchRequests();
                } else {
                  console.error('[MaintenanceClient] Failed to mark as viewed');
                }
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
          title={
            <Row align="middle" justify="space-between" style={{ padding: '8px 0', paddingRight: '40px' }}>
              <Col>
                <Text type="secondary" style={{ fontSize: 13, fontFamily: 'monospace' }}>
                  Ticket# {selectedRequest?.ticketNumber || selectedRequest?.id}
                </Text>
              </Col>
              <Col flex="auto" style={{ textAlign: 'center', padding: '0 24px' }}>
                <Text strong style={{ fontSize: 16 }}>
                  {selectedRequest?.title}
                </Text>
              </Col>
              <Col>
                <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                  Ticket Opened : {selectedRequest?.createdAt ? formatDateTimeDisplay(selectedRequest.createdAt, ', ') : ''}
                </Text>
              </Col>
            </Row>
          }
          open={userRole === 'landlord' ? isModalOpen : isViewModalOpen}
          onCancel={() => {
            if (userRole === 'landlord') {
              closeModal();
              setNewComment('');
              setNewStatus('');
            } else {
              closeViewModal();
              setNewComment('');
            }
          }}
          footer={null}
          width={1000}
          destroyOnHidden
        >
          <div>
            {/* Status Bar */}
            <div style={{ 
              background: '#fafafa', 
              padding: '12px 16px', 
              marginBottom: 24,
              borderRadius: 8,
              border: '1px solid #f0f0f0'
            }}>
              <Row gutter={24} align="middle">
                <Col>
                  <Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>Opened by :</Text>
                    <Text strong>
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
                    </Text>
                    <Tag color="default" style={{ margin: 0, fontSize: 11 }}>
                      {selectedRequest?.initiatedBy === 'landlord' ? 'Landlord' : 'Tenant'}
                    </Tag>
                  </Space>
                </Col>
                <Col>
                  <Space size={4}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Category:</Text>
                    <Text strong>{selectedRequest?.category || '—'}</Text>
                  </Space>
                </Col>
                <Col>
                  <Space size={4}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Priority:</Text>
                    <Tag color={getPriorityColor(selectedRequest?.priority)} style={{ margin: 0 }}>
                      {selectedRequest?.priority || 'Normal'}
                    </Tag>
                  </Space>
                </Col>
                <Col>
                  <Space size={4}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Status:</Text>
                    {/* Show "In Progress" if closed but awaiting approval, "Closed" if fully closed, otherwise show dropdown */}
                    {selectedRequest?.status === 'Closed' && 
                     selectedRequest?.landlordApproved && 
                     selectedRequest?.tenantApproved ? (
                      <Badge 
                        status="success"
                        text="Closed"
                      />
                    ) : selectedRequest?.status === 'Closed' && 
                        !(selectedRequest?.landlordApproved && selectedRequest?.tenantApproved) ? (
                      <Badge 
                        status="processing"
                        text="In Progress"
                      />
                    ) : (
                      <Select
                        value={selectedRequest?.status === 'Closed' && !(selectedRequest?.landlordApproved && selectedRequest?.tenantApproved) ? 'In Progress' : selectedRequest?.status}
                        onChange={handleStatusUpdate}
                        style={{ minWidth: 140 }}
                        size="small"
                        disabled={
                          selectedRequest?.status === 'Closed' && 
                          selectedRequest?.landlordApproved && 
                          selectedRequest?.tenantApproved
                        }
                      >
                        <Select.Option value="Pending">Pending</Select.Option>
                        <Select.Option value="In Progress">In Progress</Select.Option>
                        <Select.Option value="Closed">Close</Select.Option>
                      </Select>
                    )}
                  </Space>
                </Col>
                <Col flex="auto" style={{ textAlign: 'right' }}>
                  <Space size="small">
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
                        <Tooltip title="Approve & Close">
                          <Button 
                            type="primary" 
                            icon={<CheckOutlined />}
                            shape="circle"
                            onClick={() => handleApproveClosure(true)}
                            loading={loading}
                            style={{ 
                              background: '#52c41a', 
                              borderColor: '#52c41a'
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Reject & Continue Work">
                          <Button 
                            danger
                            icon={<CloseOutlined />}
                            shape="circle"
                            onClick={() => handleApproveClosure(false)}
                            loading={loading}
                          />
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="Download PDF">
                      <Button 
                        type="primary" 
                        icon={<DownloadOutlined />}
                        shape="circle"
                        onClick={() => handleDownloadTicketPDF(selectedRequest)}
                      />
                    </Tooltip>
                  </Space>
                </Col>
              </Row>
            </div>

            {/* Description */}
            <Card size="small" title="Description" style={{ marginBottom: 16 }}>
              <Text>{selectedRequest?.description || 'No description provided'}</Text>
            </Card>

            {/* Vendor Info Card (Tenant View) */}
            {userRole === 'tenant' && (selectedRequest?.assignedToProviderId || selectedRequest?.assignedToVendorId) && (selectedRequest?.assignedToProvider || selectedRequest?.assignedToVendor) && (
              <Card 
                size="small" 
                style={{ marginBottom: 16, border: '2px solid #1890ff', background: '#f0f7ff' }}
                title={
                  <Space>
                    <ToolOutlined style={{ color: '#1890ff' }} />
                    <Text strong style={{ color: '#1890ff' }}>Assigned Contractor</Text>
                  </Space>
                }
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Space direction="vertical" size={8}>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Business Name:</Text>
                        <br />
                        <Text strong style={{ fontSize: 14 }}>
                          {(selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.businessName || (selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.name}
                        </Text>
                      </div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Contact Person:</Text>
                        <br />
                        <Text>{(selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.name}</Text>
                      </div>
                      {((selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.rating) && (
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>Rating:</Text>
                          <br />
                          <Rate disabled value={(selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.rating} style={{ fontSize: 14 }} />
                          <Text style={{ marginLeft: 8 }}>{((selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.rating).toFixed(1)}</Text>
                        </div>
                      )}
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space direction="vertical" size={8}>
                      {((selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.phone) && (
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>Phone:</Text>
                          <br />
                          <Text strong style={{ fontSize: 14, color: '#1890ff' }}>
                            {(selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.phone}
                          </Text>
                        </div>
                      )}
                      {((selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.email) && (
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>Email:</Text>
                          <br />
                          <Text strong style={{ fontSize: 14, color: '#1890ff' }}>
                            {(selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.email}
                          </Text>
                        </div>
                      )}
                      {((selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.hourlyRate) && (selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.hourlyRate > 0 && (
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>Hourly Rate:</Text>
                          <br />
                          <Text strong style={{ fontSize: 14 }}>
                            ${(selectedRequest.assignedToProvider || selectedRequest.assignedToVendor)?.hourlyRate}/hr
                          </Text>
                        </div>
                      )}
                    </Space>
                  </Col>
                </Row>
                <Alert
                  message="Please contact the contractor to schedule an appointment"
                  type="info"
                  showIcon
                  style={{ marginTop: 12 }}
                />
              </Card>
            )}

            {/* Select Vendor Button (Landlord and PMC) */}
            {(userRole === 'landlord' || userRole === 'pmc') && selectedRequest.category && !selectedRequest.assignedToProviderId && !selectedRequest.assignedToVendorId && (
              <Card 
                size="small" 
                style={{ marginBottom: 16 }}
                bodyStyle={{ padding: '12px' }}
              >
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space>
                    <ToolOutlined />
                    <Text strong>Assign Vendor</Text>
                    <Tag color="blue" size="small">
                      {selectedRequest.category}
                    </Tag>
                  </Space>
                  <Button
                    type="primary"
                    icon={<ToolOutlined />}
                    onClick={handleOpenVendorSelect}
                  >
                    Select Vendor
                  </Button>
                </Space>
              </Card>
            )}

            {/* Timeline View (Tenant) */}
            {userRole === 'tenant' && (
              <Card 
                size="small" 
                title={
                  <Space>
                    <ClockCircleOutlined />
                    <Text strong>Timeline</Text>
                  </Space>
                }
                style={{ marginBottom: 16 }}
              >
                <Timeline
                  items={[
                    {
                      color: 'blue',
                      children: (
                        <div>
                          <Text strong>Ticket Created</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatDateTimeDisplay(selectedRequest.createdAt, ' • ')}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Status: {selectedRequest.status}
                          </Text>
                        </div>
                      )
                    },
                    ...(selectedRequest.comments || []).map((comment, idx) => {
                      const isStatusUpdate = comment.comment.includes('Status:') || 
                                            comment.comment.includes('Ticket Acknowledged') ||
                                            comment.comment.includes('In Progress') ||
                                            comment.comment.includes('assigned to');
                      return {
                        color: isStatusUpdate ? 'green' : 'gray',
                        children: (
                          <div>
                            <Text strong>{comment.authorName || 'Unknown'}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {formatDateTimeDisplay(comment.createdAt, ' • ')}
                            </Text>
                            <br />
                            <div style={{ 
                              marginTop: 4,
                              padding: '8px 12px',
                              background: '#fafafa',
                              borderRadius: 4,
                              fontSize: 13
                            }}>
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
                          <Text strong>Ticket Closed</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Approved by both parties
                          </Text>
                        </div>
                      )
                    }] : [])
                  ]}
                />
              </Card>
            )}

            {/* Comments Section */}
            <Card 
              size="small" 
              title={
                <Space>
                  <Text strong>Activity</Text>
                  <Badge 
                    count={selectedRequest.comments?.length || 0} 
                    showZero 
                    style={{ backgroundColor: '#1890ff' }}
                  />
                </Space>
              }
            >
              <div style={{ 
                maxHeight: '350px', 
                overflowY: 'auto',
                marginBottom: 16
              }}>
                {selectedRequest.comments && selectedRequest.comments.length > 0 ? (
                  <div>
                    {[...selectedRequest.comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((comment, idx) => {
                      const isCurrentUser = userRole === 'landlord'
                        ? comment.authorEmail === userEmail
                        : comment.authorEmail === user.email;
                      
                      return (
                        <div key={idx} style={{ marginBottom: idx < selectedRequest.comments.length - 1 ? 24 : 0 }}>
                          <Row gutter={12}>
                            <Col>
                              <Avatar 
                                icon={<UserOutlined />} 
                                style={{ 
                                  background: isCurrentUser 
                                    ? (userRole === 'landlord' ? '#1890ff' : '#8c8c8c')
                                    : (userRole === 'landlord' ? '#8c8c8c' : '#1890ff')
                                }}
                              />
                            </Col>
                            <Col flex="auto">
                              <div>
                                <Space align="center" style={{ marginBottom: 4 }}>
                                  <Text strong style={{ fontSize: 14 }}>
                                    {comment.authorName || 'Unknown'}
                                  </Text>
                                  {isCurrentUser ? (
                                    <Tag color={userRole === 'landlord' ? 'blue' : 'default'} style={{ margin: 0, fontSize: 11 }}>
                                      {userRole === 'landlord' ? 'Landlord' : 'Tenant'}
                                    </Tag>
                                  ) : (
                                    <Tag color={userRole === 'landlord' ? 'default' : 'blue'} style={{ margin: 0, fontSize: 11 }}>
                                      {userRole === 'landlord' ? 'Tenant' : 'Landlord'}
                                    </Tag>
                                  )}
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    {formatDateTimeDisplay(comment.createdAt, ' • ')}
                                  </Text>
                                </Space>
                                <div style={{ 
                                  background: '#fafafa',
                                  padding: '12px 16px',
                                  borderRadius: 8,
                                  border: '1px solid #f0f0f0',
                                  marginTop: 8
                                }}>
                                  {renderCommentText(comment.comment)}
                                </div>
                              </div>
                            </Col>
                          </Row>
                          {idx < selectedRequest.comments.length - 1 && (
                            <Divider style={{ margin: '16px 0' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Empty 
                    description="No activity yet" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ padding: '32px 0' }}
                  />
                )}
              </div>

              {/* Comment Input Section - only show if ticket is not fully closed */}
              {!(selectedRequest.status === 'Closed' && selectedRequest.landlordApproved && selectedRequest.tenantApproved) ? (
                <div style={{ paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                  <Space.Compact style={{ width: '100%' }}>
                    <TextArea
                      rows={2}
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      style={{ resize: 'none' }}
                    />
                    <Button 
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleAddComment}
                      loading={loading}
                      disabled={!newComment.trim()}
                      style={{ height: 'auto' }}
                    >
                      Send
                    </Button>
                  </Space.Compact>
                </div>
              ) : null}
            </Card>

            {/* Expense Tracking Section (Landlord Only) */}
            {userRole === 'landlord' && (
              <Card 
                size="small" 
                title={
                  <Space>
                    <DollarOutlined />
                    <Text strong>Expenses</Text>
                    <Badge 
                      count={expenses.length} 
                      showZero 
                      style={{ backgroundColor: '#1890ff' }}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Total: ${expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                    </Text>
                  </Space>
                }
                extra={
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => openExpenseModal()}
                  >
                    Add Expense
                  </Button>
                }
                style={{ marginTop: 16 }}
              >
                <Spin spinning={expenseLoading}>
                  {expenses.length > 0 ? (
                    <Table
                      dataSource={expenses}
                      rowKey="id"
                      size="small"
                      pagination={false}
                      scroll={{ x: 'max-content' }}
                      columns={[
                        {
                          title: 'Date',
                          dataIndex: 'date',
                          key: 'date',
                          render: (date) => formatDateDisplay(date),
                          width: 120
                        },
                        {
                          title: 'Description',
                          dataIndex: 'description',
                          key: 'description'
                        },
                        {
                          title: 'Paid To',
                          dataIndex: 'paidTo',
                          key: 'paidTo',
                          width: 150
                        },
                        {
                          title: 'Amount',
                          dataIndex: 'amount',
                          key: 'amount',
                          render: (amount) => (
                            <Text strong style={{ color: '#ff4d4f' }}>
                              ${amount.toFixed(2)}
                            </Text>
                          ),
                          width: 100,
                          align: 'right'
                        },
                        {
                          title: 'Payment Method',
                          dataIndex: 'paymentMethod',
                          key: 'paymentMethod',
                          width: 120
                        },
                        {
                          title: 'Invoice',
                          key: 'invoice',
                          width: 150,
                          align: 'center',
                          fixed: 'right',
                          render: (_, record) => {
                            if (!record.receiptUrl) {
                              // Show upload button if no invoice and user is landlord
                              if (userRole === 'landlord') {
                                return (
                                  <Button
                                    type="link"
                                    icon={<UploadOutlined />}
                                    size="small"
                                    onClick={() => {
                                      openInvoiceUploadModalForExpense(record.id);
                                      setExistingExpenseInvoiceFileList([]);
                                    }}
                                  >
                                    Upload
                                  </Button>
                                );
                              }
                              return <Text type="secondary">—</Text>;
                            }
                            return (
                              <Space size="small">
                                <Tooltip title="View Invoice">
                                  <Button
                                    type="link"
                                    icon={<EyeOutlined />}
                                    size="small"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setViewingInvoiceUrl(record.receiptUrl);
                                    openInvoiceViewModal();
                                  }}
                                  />
                                </Tooltip>
                                <Tooltip title="Download Invoice">
                                  <Button
                                    type="link"
                                    icon={<DownloadOutlined />}
                                    size="small"
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = record.receiptUrl;
                                      link.download = `invoice_${record.id}.pdf`;
                                      link.target = '_blank';
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                  />
                                </Tooltip>
                              </Space>
                            );
                          }
                        }
                      ]}
                    />
                  ) : (
                    <Empty 
                      description="No expenses recorded yet" 
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      style={{ padding: '24px 0' }}
                    />
                  )}
                </Spin>
              </Card>
            )}
          </div>
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
          title="Create Maintenance Ticket"
          open={isCreateModalOpen}
          onCancel={() => {
            createForm.resetFields();
            setTenantProperties([]);
            setIsPropertyEditable(false);
            setSelectedCategoryDesc('');
            closeCreateModal();
          }}
          footer={null}
          width={600}
        >
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
        </Modal>
      )}

      {/* Submit Request Modal (Tenant) */}
      {userRole === 'tenant' && (
        <Modal
          title="Submit Maintenance Request"
          open={isModalOpen}
          onCancel={() => {
            closeModal();
            setSelectedPropertyAddress({ addressLine: '', cityStateZip: '' });
          }}
          footer={null}
          width={700}
        >
          <MaintenanceSubmitRequestModal
            onSubmit={handleCreateTicket}
            form={form}
            properties={properties}
            selectedPropertyAddress={selectedPropertyAddress}
            onPropertyChange={handlePropertyChange}
            renderFormButtons={renderFormButtons}
          />
        </Modal>
      )}

      {/* Invoice Upload Modal for Existing Expenses */}
      <Modal
        title="Upload Invoice"
        open={invoiceUploadModalOpen}
        onCancel={() => {
          closeInvoiceUploadModal();
          setExistingExpenseInvoiceFileList([]);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              closeInvoiceUploadModal();
              setExistingExpenseInvoiceFileList([]);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="upload"
            type="primary"
            icon={<UploadOutlined />}
            loading={uploadingInvoice}
            onClick={handleUploadInvoice}
            disabled={!existingExpenseInvoiceFileList || existingExpenseInvoiceFileList.length === 0}
          >
            Upload
          </Button>
        ]}
        width={500}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Typography.Text strong>Select Invoice File</Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
            </Typography.Text>
          </div>
          <Upload
            beforeUpload={() => false}
            maxCount={1}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            fileList={existingExpenseInvoiceFileList}
            onChange={({ fileList }) => {
              setExistingExpenseInvoiceFileList(fileList);
            }}
            onRemove={() => {
              setExistingExpenseInvoiceFileList([]);
            }}
          >
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>
        </Space>
      </Modal>

      {/* Invoice View Modal with iframe */}
      <Modal
        title="Invoice"
        open={invoiceViewModalOpen}
        onCancel={() => {
          closeInvoiceViewModal();
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setInvoiceViewModalOpen(false);
              setViewingInvoiceUrl(null);
            }}
          >
            Close
          </Button>
        ]}
        width="90%"
        style={{ top: 20 }}
        styles={{ body: { height: 'calc(100vh - 200px)', padding: 0 } }}
      >
        {viewingInvoiceUrl && (
          <iframe
            src={`${viewingInvoiceUrl}#view=FitH`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            title="Invoice"
            type="application/pdf"
          />
        )}
      </Modal>

      {/* Reject Maintenance Approval Modal */}
      <MaintenanceRejectApprovalModal
        open={rejectMaintenanceModalOpen}
        onOk={handleRejectMaintenanceSubmit}
        onCancel={() => {
          setRejectMaintenanceModalOpen(false);
          setRejectingMaintenanceApprovalId(null);
          rejectMaintenanceForm.resetFields();
        }}
        form={rejectMaintenanceForm}
      />
    </PageLayout>
  );
}

