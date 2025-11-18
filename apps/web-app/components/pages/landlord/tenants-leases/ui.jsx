"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Typography, Table, Tag, Space, Modal, Form, Input, 
  Select, DatePicker, Popconfirm, Card, Empty, Row, Col, InputNumber, Tooltip, Radio, Alert, Badge, Tabs, Spin
} from 'antd';
import { StandardModal, FormTextInput, FormSelect, FormDatePicker, FormPhoneInput, DeleteConfirmButton } from '@/components/shared';
import { ActionButton } from '@/components/shared/buttons';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, SaveOutlined, CloseOutlined, UserOutlined, MailOutlined, PhoneOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatDateDisplay, formatDateForAPI } from '@/lib/utils/safe-date-formatter';
import { renderDate } from '@/components/shared';
import { renderStatus } from '@/components/shared/TableRenderers';

// Custom Hooks
import { usePinakaCRUD } from '@/lib/hooks/usePinakaCRUD';
import { 
  withSorter, 
  sortFunctions, 
  useCountryRegion, 
  useResizableTable,
  useFormDataSanitizer,
  useTenantFormData,
  configureTableColumns,
  useBulkOperations,
  useSearch
} from '@/lib/hooks';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import { useModalState } from '@/lib/hooks/useModalState';
import { notify } from '@/lib/utils/notification-helper';
import { ValidationHelpers } from '@/lib/utils/unified-validation';
import { rules, ruleCombos } from '@/lib/utils/validation-rules';

// Constants
import { LEASE_STATUSES } from '@/lib/constants/statuses';

// Rules Engine Components
import CurrencyInput from '@/components/rules/CurrencyInput';
import CurrencyDisplay from '@/components/rules/CurrencyDisplay';
import { STANDARD_COLUMNS, COLUMN_NAMES, customizeColumn } from '@/lib/constants/standard-columns';
import { formatPhoneNumber, formatPostalCode } from '@/lib/utils/formatters';
import { formatPropertyDisplay } from '@/lib/utils/rent-display-helpers';
import { PhoneNumberInput, PostalCodeInput, AddressAutocomplete } from '@/components/forms';
import BulkActionsToolbar from '@/components/shared/BulkActionsToolbar';
import TenantsTab from '@/components/shared/tenants-leases/TenantsTab';
import LeasesTab from '@/components/shared/tenants-leases/LeasesTab';

const { Title, Text } = Typography;

export default function TenantsLeasesClient({ units, tenants: initialTenants, initialLeases }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Redirect based on tab parameter or default to leases
  useEffect(() => {
    const tab = searchParams.get('tab') || 'leases';
    if (tab === 'tenants') {
      router.replace('/tenants');
    } else {
      router.replace('/leases');
    }
  }, [searchParams, router]);
  
  // Show loading state while redirecting
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#666' }}>Redirecting...</div>
        </div>
      </Card>
    </div>
  );
  
  const [form] = Form.useForm();
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [tenants, setTenants] = useState(Array.isArray(initialTenants) ? initialTenants : []);
  const [selectedTenantIds, setSelectedTenantIds] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const { isOpen: addTenantModalVisible, open: openAddTenantModal, close: closeAddTenantModal, editingItem: editingTenant, openForEdit: openAddTenantModalForEdit, openForCreate: openAddTenantModalForCreate } = useModalState();
  const [newTenantForm] = Form.useForm();
  const [tenantCountry, setTenantCountry] = useState('CA');
  
  // Country/Region management for tenant form
  const countryRegion = useCountryRegion(tenantCountry);
  
  // Tenant form data management hook
  const tenantFormData = useTenantFormData({ country: tenantCountry });
  const { emergencyContacts, employers, setEmergencyContacts, setEmployers } = tenantFormData;
  
  // Form data sanitizer
  const { sanitizeFormData } = useFormDataSanitizer({ country: tenantCountry });
  
  // API error handler
  const { fetch } = useUnifiedApi({ showUserMessage: true });

  // 🎯 PINAKA UNIFIED HOOK
  const pinaka = usePinakaCRUD({
    apiEndpoint: '/api/leases',
    initialData: initialLeases,
    entityName: 'Lease',
    messages: {
      createSuccess: 'Lease created successfully',
      updateSuccess: 'Lease updated successfully',
      deleteSuccess: 'Lease deleted successfully'
    },
    defaultFormData: { status: "Active", rentDueDay: 1 },
    // Format dates before sending to API
    onBeforeCreate: (payload) => ({
      ...payload,
      leaseStart: payload.leaseStart ? formatDateForAPI(payload.leaseStart) : null,
      leaseEnd: payload.leaseEnd ? formatDateForAPI(payload.leaseEnd) : null,
      primaryTenantId: payload.primaryTenantId || (payload.tenantIds?.[0] || null), // Default to first tenant if not specified
    }),
    onBeforeUpdate: (id, payload) => ({
      ...payload,
      leaseStart: payload.leaseStart ? formatDateForAPI(payload.leaseStart) : null,
      leaseEnd: payload.leaseEnd ? formatDateForAPI(payload.leaseEnd) : null,
      primaryTenantId: payload.primaryTenantId || (payload.tenantIds?.[0] || null), // Default to first tenant if not specified
    })
  });

  // 🎯 Page Banner with integrated search and stats
  const calculateStats = (leases) => {
    const totalTenants = leases.reduce((sum, lease) => sum + (lease.leaseTenants?.length || 0), 0);
    return [
      { label: 'Leases', value: leases.length, color: '#1890ff' },
      { label: 'Tenants', value: totalTenants, color: '#722ed1' },
      { label: 'Active', value: leases.filter(l => l.status === 'Active').length, color: '#52c41a' }
    ];
  };

  // Custom search function to handle tenant names (including co-tenants)
  const customSearchFunction = useCallback((lease, searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) return true;
    
    const term = searchTerm.toLowerCase().trim();
    
    // Search in unit and property fields
    const unitName = lease.unit?.unitName?.toLowerCase() || '';
    const propertyName = lease.unit?.property?.propertyName?.toLowerCase() || '';
    const addressLine1 = lease.unit?.property?.addressLine1?.toLowerCase() || '';
    const status = lease.status?.toLowerCase() || '';
    
    if (unitName.includes(term) || 
        propertyName.includes(term) || 
        addressLine1.includes(term) || 
        status.includes(term)) {
      return true;
    }
    
    // Search in ALL tenant names and emails (primary and co-tenants)
    if (lease.leaseTenants && Array.isArray(lease.leaseTenants)) {
      return lease.leaseTenants.some(lt => {
        const tenant = tenants.find(t => t.id === lt.tenantId);
        if (!tenant) return false;
        
        const firstName = tenant.firstName?.toLowerCase() || '';
        const lastName = tenant.lastName?.toLowerCase() || '';
        const fullName = `${firstName} ${lastName}`;
        const email = tenant.email?.toLowerCase() || '';
        const phone = tenant.phone?.toLowerCase() || '';
        
        return firstName.includes(term) || 
               lastName.includes(term) || 
               fullName.includes(term) ||
               email.includes(term) ||
               phone.includes(term);
      });
    }
    
    return false;
  }, [tenants]);

  // Note: TenantsTab and LeasesTab now use PageLayout (banners removed)

  const handleAddClick = useCallback(() => {
    setSelectedUnit(null);
    setSelectedTenantIds([]);
    form.resetFields();
    form.setFieldsValue({ 
      status: "Active", 
      rentDueDay: 1,
      tenantIds: [],
      primaryTenantId: null,
      leaseStart: null,
      leaseEnd: null,
      rentAmount: null,
      securityDeposit: null
    });
    pinaka.openAdd();
  }, [form, pinaka]);

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      handleAddClick();
    }
  }, [searchParams, handleAddClick]);

  function handleEditClick(lease) {
    const unit = units.find(u => u.id === lease.unitId);
    setSelectedUnit(unit);
    
    const tenantIds = lease.leaseTenants?.map(lt => lt.tenantId) || [];
    const primaryTenant = lease.leaseTenants?.find(lt => lt.isPrimaryTenant);
    
    setSelectedTenantIds(tenantIds);
    
    form.setFieldsValue({
      unitId: lease.unitId,
      tenantIds: tenantIds,
      primaryTenantId: primaryTenant?.tenantId || tenantIds[0] || null,
      // Extract local date components to avoid UTC timezone shift when loading
      leaseStart: lease.leaseStart ? (() => {
        const date = new Date(lease.leaseStart);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return dayjs(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
      })() : undefined,
      leaseEnd: lease.leaseEnd ? (() => {
        const date = new Date(lease.leaseEnd);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return dayjs(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
      })() : undefined,
      rentAmount: lease.rentAmount,
      rentDueDay: lease.rentDueDay,
      securityDeposit: lease.securityDeposit,
      status: lease.status,
    });
    pinaka.openEdit(lease);
  }

  async function handleDelete(lease) {
    await pinaka.remove(lease.id, lease);
  }

  function handleClose() {
    pinaka.close();
    form.resetFields();
    setSelectedUnit(null);
    setSelectedTenantIds([]);
  }

  async function handleEditTenantClick(tenant) {
    try {
      // Fetch full tenant data with emergency contacts and employers
      const response = await fetch(`/api/tenants/${tenant.id}`);
      if (!response.ok) {
        throw new Error('Failed to load tenant data');
      }
      
      const fullTenant = await response.json();
      openAddTenantModalForEdit(fullTenant);
      
      // Set country and update countryRegion hook
      const tenantCountryValue = fullTenant.country || 'CA';
      setTenantCountry(tenantCountryValue);
      countryRegion.setCountry(tenantCountryValue);
      
      // Format phone and postal code for display
      let formattedPhone = fullTenant.phone || '';
      if (formattedPhone && !formattedPhone.includes('(')) {
        // Format phone if it's stored as digits only
        formattedPhone = formatPhoneNumber(formattedPhone);
      }
      
      let formattedPostal = fullTenant.postalZip || '';
      if (formattedPostal) {
        // Format postal code for display
        if (tenantCountryValue === 'CA') {
          formattedPostal = formatPostalCode(formattedPostal);
        }
        // US ZIP codes are usually stored as-is
      }
      
      // Load tenant data into form (convert null to empty string or undefined)
      newTenantForm.setFieldsValue({
        firstName: fullTenant.firstName || '',
        middleName: fullTenant.middleName ?? '',
        lastName: fullTenant.lastName || '',
        email: fullTenant.email || '',
        phone: formattedPhone,
        country: tenantCountryValue,
        provinceState: fullTenant.provinceState ?? '',
        postalZip: formattedPostal,
        dateOfBirth: fullTenant.dateOfBirth ? dayjs(fullTenant.dateOfBirth) : undefined,
        currentAddress: fullTenant.currentAddress ?? '',
      });
      
      // Load tenant form data using the hook
      tenantFormData.loadTenantData(fullTenant);
      
      openAddTenantModal();
    } catch (error) {
      console.error('Error loading tenant data:', error);
      notify.error('Failed to load tenant information. Please try again.');
    }
  }

  async function handleAddNewTenant() {
    try {
      const values = await newTenantForm.validateFields();
      const isEditing = !!editingTenant;
      
      // Prepare tenant data using the hook
      const tenantData = tenantFormData.prepareTenantData(values, {
        dateOfBirth: values.dateOfBirth ? formatDateForAPI(values.dateOfBirth) : null,
        moveInDate: values.moveInDate ? formatDateForAPI(values.moveInDate) : null,
      });
      
      // Sanitize form data
      const sanitizedData = sanitizeFormData(tenantData, { mode: 'storage' });
      
      const url = isEditing ? `/api/tenants/${editingTenant.id}` : '/api/tenants';
      const method = isEditing ? 'PATCH' : 'POST';
      
      const response = await fetch(
        url,
        {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sanitizedData)
        },
        { operation: `${isEditing ? 'Update' : 'Create'} tenant` }
      );

      const updatedTenant = await response.json();
      
      notify.success(
        `Tenant ${updatedTenant.firstName} ${updatedTenant.lastName} ${isEditing ? 'updated' : 'added'} successfully!`
      );
      
      // Refresh tenant and lease data - force a full refresh
      // Force refresh by calling the API directly first, then update state
      const tenantsResponse = await fetch('/api/tenants');
      if (tenantsResponse.ok) {
        const responseData = await tenantsResponse.json();
        // Handle { tenants: [...] } format
        const allTenants = Array.isArray(responseData) ? responseData : (responseData.tenants || []);
        
        // Update all tenant states
        setTenants(allTenants);
        tenantPinaka.setData(allTenants);
        setTenantsData([...allTenants]); // Update tenantsData directly
      } else {
        // Fallback to refresh function
        const refreshResult = await tenantPinaka.refresh();
        if (refreshResult && refreshResult.success && Array.isArray(refreshResult.data)) {
          setTenants(refreshResult.data);
          setTenantsData([...refreshResult.data]); // Update tenantsData directly
        }
      }
      await pinaka.refresh();
      
      // Reset and close modal
      closeAddTenantModal();
      newTenantForm.resetFields();
      tenantFormData.resetFormData();
      setTenantCountry('CA');
      countryRegion.setCountry('CA');
    } catch (error) {
      // Error already handled by useUnifiedApi
    }
  }

  // Use centralized property display function
  // Memoize expensive display functions
  const getPropertyUnitDisplay = useCallback((lease) => {
    // Ensure lease has unit and property structure expected by formatPropertyDisplay
    if (!lease.unit) {
      const unit = units.find(u => u.id === lease.unitId);
      if (unit) {
        lease = { ...lease, unit: { ...unit, property: unit.property } };
      }
    }
    return formatPropertyDisplay(lease);
  }, [units]);

  const getPrimaryTenantDisplay = (leaseTenants) => {
    if (!leaseTenants || leaseTenants.length === 0) return { primary: "—", coTenantCount: 0 };
    
    const primaryLT = leaseTenants.find(lt => lt.isPrimaryTenant);
    const primaryTenant = primaryLT ? tenants.find(t => t.id === primaryLT.tenantId) : null;
    
    // If no primary found, use first tenant
    const displayTenant = primaryTenant || tenants.find(t => t.id === leaseTenants[0]?.tenantId);
    
    if (!displayTenant) return { primary: "—", coTenantCount: 0 };
    
    const primaryName = `${displayTenant.firstName} ${displayTenant.lastName}`;
    const coTenantCount = leaseTenants.length - 1;
    
    return { primary: primaryName, coTenantCount };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "success";
      case "Expired": return "warning";
      case "Terminated": return "error";
      default: return "default";
    }
  };

  // Expandable row content - shows all tenants on the lease
  const expandedRowRender = (lease) => {
    const sortedTenants = [...(lease.leaseTenants || [])].sort((a, b) => {
      if (a.isPrimaryTenant) return -1;
      if (b.isPrimaryTenant) return 1;
      return 0;
    });

    return (
      <div style={{ 
        padding: '10px 16px 10px 56px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        backgroundColor: '#f5f5f5'
      }}>
            <Text strong style={{ 
              fontSize: '12px', 
              color: '#8c8c8c',
              minWidth: '60px',
              paddingTop: '10px'
            }}>
              Tenants:
            </Text>
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              flexWrap: 'wrap',
              flex: 1
            }}>
              {sortedTenants.map((lt, index) => {
                const tenant = tenants.find(t => t.id === lt.tenantId);
                if (!tenant) return null;
                
                return (
                  <div 
                    key={`tenant-${lt.id || lt.tenantId}-${index}`}
                    style={{ 
                      minWidth: '240px',
                      flex: '1 1 calc(33.333% - 8px)',
                      maxWidth: '340px',
                      borderRadius: '10px',
                      border: lt.isPrimaryTenant ? 'none' : '1px solid #e0e0e0',
                      background: lt.isPrimaryTenant 
                        ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
                        : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                      boxShadow: lt.isPrimaryTenant 
                        ? '0 2px 8px rgba(33, 150, 243, 0.15), 0 1px 3px rgba(0,0,0,0.06)'
                        : '0 2px 6px rgba(0,0,0,0.04)',
                      padding: '12px 14px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = lt.isPrimaryTenant
                        ? '0 4px 12px rgba(33, 150, 243, 0.2), 0 2px 6px rgba(0,0,0,0.08)'
                        : '0 4px 10px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = lt.isPrimaryTenant
                        ? '0 2px 8px rgba(33, 150, 243, 0.15), 0 1px 3px rgba(0,0,0,0.06)'
                        : '0 2px 6px rgba(0,0,0,0.04)';
                    }}
                  >
                    {/* Background pattern for primary tenant */}
                    {lt.isPrimaryTenant && (
                      <div style={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'rgba(33, 150, 243, 0.06)',
                        pointerEvents: 'none'
                      }} />
                    )}
                    
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: lt.isPrimaryTenant 
                        ? 'linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)'
                        : 'linear-gradient(135deg, #90a4ae 0%, #607d8b 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 600,
                      flexShrink: 0,
                      boxShadow: lt.isPrimaryTenant 
                        ? '0 2px 6px rgba(33, 150, 243, 0.3)'
                        : '0 2px 4px rgba(96, 125, 139, 0.2)',
                      zIndex: 1
                    }}>
                      {tenant.firstName?.charAt(0)}{tenant.lastName?.charAt(0)}
                    </div>
                    
                    <div style={{ 
                      flex: 1, 
                      minWidth: 0, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '3px',
                      zIndex: 1
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <Text strong style={{ 
                          fontSize: '13px',
                          color: '#1a1a1a',
                          lineHeight: '1.3',
                          fontWeight: 600,
                          letterSpacing: '0.2px'
                        }}>
                          {tenant.firstName} {tenant.lastName}
                        </Text>
                        {lt.isPrimaryTenant && (
                          <span style={{ 
                            fontSize: '9px',
                            fontWeight: 600,
                            padding: '2px 6px',
                            margin: 0,
                            borderRadius: '4px',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            lineHeight: '1.4',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase'
                          }}>
                            Primary
                          </span>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <MailOutlined style={{ 
                          fontSize: 11, 
                          color: '#757575' 
                        }} />
                        <Text style={{ 
                          fontSize: '11px', 
                          color: '#4a4a4a',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {tenant.email}
                        </Text>
                      </div>
                      
                      {tenant.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <PhoneOutlined style={{ 
                            fontSize: 11, 
                            color: '#757575' 
                          }} />
                          <Text style={{ 
                            fontSize: '11px', 
                            color: '#4a4a4a'
                          }}>
                            {formatPhoneNumber(tenant.phone)}
                          </Text>
                        </div>
                      )}
                    </div>
                    
                    {/* Edit Button */}
                    <div style={{ 
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      zIndex: 2
                    }}>
                      <ActionButton
                        action="edit"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTenantClick(tenant);
                        }}
                        tooltip="Edit Tenant"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
      </div>
    );
  };

  const columns = [
    {
      title: 'Property Name',
      key: 'property',
      dataIndex: 'property',
      width: 200,
      ellipsis: true,
      render: (_, lease) => <Text strong>{getPropertyUnitDisplay(lease)}</Text>,
    },
    {
      title: 'Primary Tenant',
      key: 'tenant',
      dataIndex: 'tenant',
      width: 220,
      ellipsis: true,
      render: (_, lease) => {
        const { primary, coTenantCount } = getPrimaryTenantDisplay(lease.leaseTenants);
        return (
          <Space>
            <Text>{primary}</Text>
            {coTenantCount > 0 && (
              <Badge 
                count={`+${coTenantCount}`} 
                style={{ 
                  backgroundColor: '#722ed1',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedRowKeys(prev =>
                    prev.includes(lease.id)
                      ? prev.filter(key => key !== lease.id)
                      : [...prev, lease.id]
                  );
                }}
              />
            )}
          </Space>
        );
      },
    },
    withSorter(
      {
        title: 'Lease Start',
        key: 'leaseStart',
        dataIndex: 'leaseStart',
        width: 150,
        render: (_, lease) => renderDate(lease.leaseStart),
      },
      sortFunctions.date('leaseStart')
    ),
    withSorter(
      {
        title: 'Lease End',
        key: 'leaseEnd',
        dataIndex: 'leaseEnd',
        width: 150,
        render: (_, lease) => lease.leaseEnd ? renderDate(lease.leaseEnd) : <Text>Month-to-month</Text>,
      },
      sortFunctions.date('leaseEnd')
    ),
    withSorter(
      customizeColumn(STANDARD_COLUMNS.MONTHLY_RENT, {
        dataIndex: 'rentAmount',
        width: 150,
        render: (amount) => (
          <CurrencyDisplay 
            value={amount} 
            country="CA"
            strong 
            style={{ color: '#52c41a' }}
          />
        ),
      }),
      sortFunctions.number('rentAmount')
    ),
    customizeColumn(STANDARD_COLUMNS.STATUS, {
      width: 120,
      render: (_, lease) => renderStatus(lease.status, {
        customColors: {
          'Active': 'success',
          'Expired': 'warning',
          'Terminated': 'error'
        }
      }),
      filters: LEASE_STATUSES.map(s => ({ text: s, value: s })),
      onFilter: (value, lease) => lease.status === value,
    }),
    customizeColumn(STANDARD_COLUMNS.ACTIONS, {
      width: 120,
      render: (_, lease) => (
        <Space size="small">
          <ActionButton
            action="edit"
            onClick={() => handleEditClick(lease)}
            tooltip="Edit Lease"
          />
          <Popconfirm
            title="Delete lease?"
            description="This will also delete all associated rent payments."
            onConfirm={() => handleDelete(lease)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <ActionButton action="delete" tooltip="Delete Lease" />
          </Popconfirm>
        </Space>
      ),
    }),
  ];

  // Make columns resizable
  // Configure columns with standard settings
  const configuredColumns = configureTableColumns(columns || [], {
    addSorting: false, // Keep existing sorters
    centerAlign: true,
    addWidths: false, // Keep existing widths
  });
  
  const { columns: resizableColumns, tableProps } = useResizableTable(configuredColumns, {
    storageKey: 'tenants-leases-columns',
    persistColumnWidths: true
  });

  // Tenant management hook (for Tenants tab)
  const tenantPinaka = usePinakaCRUD({
    apiEndpoint: '/api/tenants',
    initialData: initialTenants,
    entityName: 'Tenant',
    messages: {
      createSuccess: 'Tenant created successfully',
      updateSuccess: 'Tenant updated successfully',
      deleteSuccess: 'Tenant deleted successfully'
    },
    defaultFormData: { country: "CA", provinceState: "ON" },
    onBeforeCreate: (payload) => ({
      ...payload,
      dateOfBirth: payload.dateOfBirth ? dayjs(payload.dateOfBirth).format('YYYY-MM-DD') : null,
      emergencyContacts: emergencyContacts.filter(c => c.contactName && c.phone),
      employers: employers.filter(e => e.employerName),
    }),
    onBeforeUpdate: (id, payload) => ({
      ...payload,
      dateOfBirth: payload.dateOfBirth ? dayjs(payload.dateOfBirth).format('YYYY-MM-DD') : null,
      emergencyContacts: emergencyContacts.filter(c => c.contactName && c.phone),
      employers: employers.filter(e => e.employerName),
    })
  });

  // Tenant stats and banner - Memoized to prevent recalculation on every render
  const tenantCalculateStats = useCallback((tenants) => {
    // Ensure tenants is an array
    const tenantsArray = Array.isArray(tenants) ? tenants : [];
    
    // Count unique active leases (not tenants with active leases)
    const activeLeaseIds = new Set();
    tenantsArray.forEach(tenant => {
      tenant.leaseTenants?.forEach(lt => {
        if (lt.lease?.status === 'Active' && lt.lease?.id) {
          activeLeaseIds.add(lt.lease.id);
        }
      });
    });
    
    return [
      { label: 'Tenants', value: tenantsArray.length, color: '#1890ff' },
      { label: 'Active Leases', value: activeLeaseIds.size, color: '#52c41a' }
    ];
  }, []);

  const tenantSearchFunction = useCallback((tenant, searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      tenant.firstName?.toLowerCase().includes(term) ||
      tenant.lastName?.toLowerCase().includes(term) ||
      tenant.email?.toLowerCase().includes(term) ||
      tenant.phone?.toLowerCase().includes(term) ||
      tenant.currentAddress?.toLowerCase().includes(term)
    );
  }, []);

  // Track tenantPinaka.data in a state to force re-renders when it changes
  // Initialize tenantsData from initialTenants prop (server-side data includes ALL tenants)
  // Don't rely on tenantPinaka.data which might be filtered by API calls
  const [tenantsData, setTenantsData] = useState(() => {
    // ALWAYS use initialTenants from props (these are all tenants from the server-side query)
    const tenants = Array.isArray(initialTenants) ? initialTenants : [];
    return tenants;
  });
  
  // Update tenantsData ONLY when initialTenants prop changes (server-side data)
  // Ignore tenantPinaka.data to prevent API filtering from overriding server data
  useEffect(() => {
    if (Array.isArray(initialTenants)) {
      setTenantsData(prevTenants => {
        const currentIds = prevTenants.map(t => t.id).sort().join(',');
        const newIds = initialTenants.map(t => t.id).sort().join(',');
        if (currentIds !== newIds || prevTenants.length !== initialTenants.length) {
          return [...initialTenants];
        }
        return prevTenants;
      });
    }
  }, [initialTenants]);
  
  // Tenant search - only active when tenants tab is active
  const tenantSearch = useSearch(
    activeTab === 'tenants' ? tenantsData : [],
    ['firstName', 'lastName', 'email', 'phone', 'currentAddress'],
    { debounceMs: 300 }
  );

  // Apply custom tenant search if provided
  const filteredTenants = useMemo(() => {
    if (activeTab !== 'tenants') return tenantsData; // Return all if not active tab
    
    if (!tenantSearch.searchTerm || !tenantSearch.searchTerm.trim()) {
      return tenantsData;
    }
    
    if (tenantSearchFunction) {
      return tenantsData.filter(item => tenantSearchFunction(item, tenantSearch.searchTerm));
    }
    
    return tenantSearch.filteredData;
  }, [activeTab, tenantsData, tenantSearch.searchTerm, tenantSearch.filteredData, tenantSearchFunction]);

  // Note: TenantBanner and LeaseBanner removed - TenantsTab and LeasesTab now use PageLayout

  // Bulk operations for tenants - Only export is available
  const tenantBulkOps = useBulkOperations({
    onBulkAction: async (action, selectedIds) => {
      if (action === 'export') {
        // Export functionality
        const selectedTenants = filteredTenants.filter(t => selectedIds.includes(t.id));
        const csv = [
          ['Name', 'Email', 'Phone', 'Address'].join(','),
          ...selectedTenants.map(t => [
            `"${t.firstName} ${t.lastName}"`,
            t.email || '',
            t.phone || '',
            t.currentAddress || ''
          ].join(','))
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tenants-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        return true;
      }
      return false;
    },
    successMessage: 'Bulk operation completed successfully',
    errorMessage: 'Bulk operation failed'
  });
  

  // Lease search - only active when leases tab is active
  const leaseSearch = useSearch(
    activeTab === 'leases' ? pinaka.data : [],
    ['unit.unitName', 'unit.property.propertyName', 'unit.property.addressLine1', 'status'],
    { debounceMs: 300 }
  );

  // Apply custom lease search if provided
  const filteredData = useMemo(() => {
    if (activeTab !== 'leases') return pinaka.data; // Return all if not active tab
    
    if (!leaseSearch.searchTerm || !leaseSearch.searchTerm.trim()) {
      return pinaka.data;
    }
    
    if (customSearchFunction) {
      return pinaka.data.filter(item => customSearchFunction(item, leaseSearch.searchTerm));
    }
    
    return leaseSearch.filteredData;
  }, [activeTab, pinaka.data, leaseSearch.searchTerm, leaseSearch.filteredData, customSearchFunction]);

  // Note: LeaseBanner removed - LeasesTab now uses PageLayout

  // Tenant columns for Tenants tab
  const tenantColumns = [
    {
      title: 'Name',
      key: 'name',
      dataIndex: 'name',
      width: 200,
      render: (_, tenant) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <Text strong>{tenant.firstName} {tenant.lastName}</Text>
        </Space>
      ),
    },
    {
      title: 'Email',
      key: 'email',
      dataIndex: 'email',
      width: 200,
      render: (email) => <Text>{email}</Text>,
    },
    {
      title: 'Phone',
      key: 'phone',
      dataIndex: 'phone',
      width: 150,
      render: (phone) => phone ? <Text>{formatPhoneNumber(phone)}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Status',
      key: 'status',
      align: 'center',
      width: 150,
      render: (_, tenant) => {
        const hasActiveLease = tenant.leaseTenants?.some(lt => lt.lease?.status === 'Active');
        return hasActiveLease ? (
          <Tag color="success">Active Lease</Tag>
        ) : (
          <Tag color="default">No Active Lease</Tag>
        );
      },
    },
    {
      title: 'Leases',
      key: 'leases',
      width: 200,
      render: (_, tenant) => {
        const leases = tenant.leaseTenants?.map(lt => lt.lease).filter(Boolean) || [];
        if (leases.length === 0) return <Text type="secondary">—</Text>;
        return (
          <Space>
            {leases.map((lease, idx) => {
              const unit = units.find(u => u.id === lease.unitId);
              const property = unit?.property;
              return (
                <Tag key={idx} color={lease.status === 'Active' ? 'success' : 'default'}>
                  {property?.unitCount === 1 
                    ? (property?.propertyName || 'Unknown')
                    : unit?.unitName 
                      ? `${unit.unitName} - ${property?.propertyName || 'Unknown'}`
                      : (property?.propertyName || 'Unknown')
                  }
                </Tag>
              );
            })}
          </Space>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, tenant) => (
        <Space size="small">
          <ActionButton
            action="edit"
            onClick={() => handleEditTenantClick(tenant)}
            tooltip="Edit Tenant"
          />
          <DeleteConfirmButton
            entityName="tenant"
            description="This action cannot be undone."
            onConfirm={async () => {
              try {
                const response = await fetch(`/api/tenants/${tenant.id}`, { method: 'DELETE' });
                if (response.ok) {
                  notify.success('Tenant deleted successfully');
                  
                  // Optimistically remove from UI immediately
                  const filtered = tenantPinaka.data.filter(t => t.id !== tenant.id);
                  tenantPinaka.setData(filtered);
                  setTenantsData([...filtered]); // Update tenantsData directly
                  
                  // Then refresh to get latest from server
                  const refreshResult = await tenantPinaka.refresh();
                  if (refreshResult && refreshResult.success && Array.isArray(refreshResult.data)) {
                    setTenantsData([...refreshResult.data]); // Update tenantsData with fresh data
                  }
                  
                  await pinaka.refresh();
                } else {
                  throw new Error('Failed to delete tenant');
                }
              } catch (error) {
                notify.error(error.message || 'Failed to delete tenant');
                // Revert optimistic update on error
                await tenantPinaka.refresh();
              }
            }}
            buttonProps={{ tooltip: "Delete Tenant" }}
          />
        </Space>
      ),
    },
  ];

  // Configure tenant columns with standard settings
  const configuredTenantColumns = configureTableColumns(tenantColumns);
  
  // Use resizable table hook for tenants
  const { tableProps: tenantTableProps } = useResizableTable(configuredTenantColumns, {
    storageKey: 'tenants-table',
    defaultSort: { field: 'name', order: 'ascend' },
  });

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'tenants',
            label: (
              <span>
                <UserOutlined />
                Tenants
              </span>
            ),
            children: (
              <TenantsTab
                tenants={filteredTenants || tenantsData}
                units={units}
                loading={tenantPinaka.loading}
                onAddTenant={() => {
                  newTenantForm.resetFields();
                  tenantFormData.resetFormData();
                  setTenantCountry('CA');
                  countryRegion.setCountry('CA');
                  openAddTenantModalForCreate();
                }}
                onEditTenant={handleEditTenantClick}
                onDeleteTenant={async (tenantId) => {
                  try {
                    const response = await fetch(`/api/tenants/${tenantId}`, { method: 'DELETE' });
                    if (response.ok) {
                      notify.success('Tenant deleted successfully');
                      const filtered = tenantPinaka.data.filter(t => t.id !== tenantId);
                      tenantPinaka.setData(filtered);
                      setTenantsData([...filtered]);
                      const refreshResult = await tenantPinaka.refresh();
                      if (refreshResult && refreshResult.success && Array.isArray(refreshResult.data)) {
                        setTenantsData([...refreshResult.data]);
                      }
                      await pinaka.refresh();
                    } else {
                      throw new Error('Failed to delete tenant');
                    }
                  } catch (error) {
                    notify.error(error.message || 'Failed to delete tenant');
                    await tenantPinaka.refresh();
                  }
                }}
                onRefresh={tenantPinaka.refresh}
                calculateStats={tenantCalculateStats}
              />
            )
          },
          {
            key: 'leases',
            label: (
              <span>
                <FileTextOutlined />
                Leases
              </span>
            ),
            children: (
              <LeasesTab
                leases={filteredData}
                loading={pinaka.loading}
                onAddLease={handleAddClick}
                onEditLease={handleEditClick}
                onDeleteLease={handleDelete}
                onRefresh={pinaka.refresh}
                calculateStats={calculateStats}
                customSearchFunction={customSearchFunction}
                expandedRowRender={expandedRowRender}
                expandedRowKeys={expandedRowKeys}
                setExpandedRowKeys={setExpandedRowKeys}
                columns={resizableColumns}
              />
            )
          }
        ]}
      />

      {/* Tenant Modal */}
      <Modal
        title={editingTenant ? `Edit Tenant - ${editingTenant.firstName} ${editingTenant.lastName}` : "Add New Tenant"}
        open={addTenantModalVisible}
        onCancel={() => {
          setAddTenantModalVisible(false);
          setEditingTenant(null);
          newTenantForm.resetFields();
          tenantFormData.resetFormData();
          setTenantCountry('CA');
          countryRegion.setCountry('CA');
        }}
        footer={null}
        width={700}
      >
        <Form
          form={newTenantForm}
          onFinish={handleAddNewTenant}
          layout="vertical"
          initialValues={{ country: 'CA', provinceState: 'ON' }}
          preserve={true}
          style={{ marginTop: 0 }}
          size="small"
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
                        <Form.Item name="firstName" label="First Name" rules={[rules.required('First Name')]} style={{ marginBottom: 12 }}>
                          <Input placeholder="John" size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Form.Item name="middleName" label="M.I." style={{ marginBottom: 12 }}>
                          <Input placeholder="M" maxLength={2} style={{ textTransform: 'uppercase' }} size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={14}>
                        <Form.Item name="lastName" label="Last Name" rules={[rules.required('Last Name')]} style={{ marginBottom: 12 }}>
                          <Input placeholder="Doe" size="large" />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Row 2: Email, Phone Number, Date of Birth */}
                    <Row gutter={8}>
                      <Col span={8}>
                        <Form.Item name="email" label="Email" rules={ruleCombos.requiredEmail} style={{ marginBottom: 12 }}>
                          <Input placeholder="john.doe@example.com" prefix={<MailOutlined />} size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item 
                          name="phone" 
                          label="Phone Number"
                          rules={[
                            { required: true, message: 'Phone number is required' },
                            {
                              validator: (_, value) => {
                                if (!value) return Promise.resolve();
                                // Remove formatting to check if it's 10 digits
                                const digits = value.replace(/\D/g, '');
                                if (digits.length !== 10) {
                                  return Promise.reject('Please enter a valid 10-digit phone number');
                                }
                                return Promise.resolve();
                              }
                            }
                          ]}
                          style={{ marginBottom: 12 }}
                        >
                          <PhoneNumberInput country={tenantCountry} size="large" />
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
                            country={tenantCountry === 'CA' ? 'CA,US' : tenantCountry === 'US' ? 'CA,US' : 'CA,US'}
                            size="large"
                            onSelect={(addressData) => {
                              const countryCode = addressData.country;
                              
                              if (countryCode === 'CA' || countryCode === 'US') {
                                setTenantCountry(countryCode);
                                countryRegion.setCountry(countryCode);
                                
                                setTimeout(() => {
                                  newTenantForm.setFieldsValue({
                                    currentAddress: addressData.addressLine1,
                                    city: addressData.city,
                                    provinceState: addressData.provinceState,
                                    postalZip: addressData.postalZip,
                                    country: countryCode,
                                  });
                                }, 50);
                              } else {
                                newTenantForm.setFieldsValue({
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
                          label={countryRegion.getRegionLabel?.() || 'Province/State'}
                          rules={ValidationHelpers?.getProvinceStateValidationRules?.(countryRegion.getRegionLabel?.() || 'Province/State', true) || [{ required: true, message: 'Province/State is required' }]}
                          style={{ marginBottom: 12 }}
                        >
                          <Select placeholder="ON" size="large" virtual={false}>
                            {(countryRegion.getRegions?.() || []).map(region => {
                              if (!region || !region.code) {
                                return null;
                              }
                              return (
                                <Select.Option key={region.code} value={region.code}>{region.code}</Select.Option>
                              );
                            })}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item 
                          name="postalZip" 
                          label={countryRegion.getPostalLabel?.() || 'Postal/ZIP Code'}
                          rules={ValidationHelpers?.getPostalCodeValidationRules?.(tenantCountry || 'CA', true) || [{ required: true, message: 'Postal/ZIP Code is required' }]}
                          style={{ marginBottom: 12 }}
                        >
                          <PostalCodeInput country={tenantCountry} size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item 
                          name="country" 
                          label="Country"
                          rules={ValidationHelpers?.getCountryValidationRules?.(true) || [{ required: true, message: 'Country is required' }]}
                          style={{ marginBottom: 12 }}
                        >
                          <Select 
                            loading={countryRegion.loading}
                            size="large"
                            virtual={false}
                            onChange={(value) => {
                              setTenantCountry(value);
                              countryRegion.setCountry(value);
                              const defaultRegion = countryRegion.DEFAULT_REGIONS?.[value] || null;
                              newTenantForm.setFieldsValue({ 
                                provinceState: defaultRegion, 
                                postalZip: null 
                              });
                            }}
                          >
                            {(countryRegion.getCountries?.() || countryRegion.countries || []).map(c => {
                              if (!c || !c.code) {
                                return null;
                              }
                              return (
                                <Select.Option key={c.code} value={c.code}>{c.name || c.code}</Select.Option>
                              );
                            })}
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
                          rules={[rules.required('Move-in date')]}
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
                          rules={[rules.required('Lease term')]}
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
                label: 'Emergency Contacts',
                children: (
                  <>
                    {emergencyContacts.map((contact, index) => (
                      <div key={index} style={{ marginBottom: index < emergencyContacts.length - 1 ? 12 : 0 }}>
                        <Row gutter={8}>
                          <Col span={8}>
                            <Form.Item label={`Contact ${index + 1} Name`} style={{ marginBottom: 12 }}>
                              <Input 
                                placeholder="Jane Doe" 
                                value={contact.contactName || ''}
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
                                value={contact.email || ''}
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
                            <Form.Item label={`Contact ${index + 1} Phone`} style={{ marginBottom: 12 }}>
                              <PhoneNumberInput
                                country={tenantCountry}
                                value={contact.phone || ''}
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
                label: 'Employer Information',
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
                                value={employer.employerName || ''}
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
                                value={employer.jobTitle || ''}
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
                                country={tenantCountry}
                                value={employer.income ?? undefined}
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
                            value={employer.employerAddress || ''}
                            onChange={(e) => {
                              const updated = [...employers];
                              updated[index].employerAddress = e.target.value;
                              setEmployers(updated);
                            }}
                          />
                        </Form.Item>
                      </div>
                    ))}
                  </>
                )
              }
            ]}
          />

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ActionButton
                action="save"
                htmlType="submit"
                size="large"
                tooltip="Save Tenant"
              />
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Lease Modal */}
      <Modal
        title={pinaka.isEditing ? "Edit Lease" : "Create Lease"}
        open={pinaka.isOpen}
        footer={
          <div style={{ 
            position: 'sticky', 
            bottom: 0, 
            padding: '16px 24px', 
            background: 'white',
            borderTop: '1px solid #f0f0f0',
            display: 'flex', 
            justifyContent: 'flex-end',
            marginLeft: -24,
            marginRight: -24,
            marginBottom: -24
          }}>
            <ActionButton
              action="save"
              size="large"
              loading={pinaka.isSubmitting}
              onClick={() => form.submit()}
              tooltip="Save Lease"
            />
          </div>
        }
        onCancel={handleClose}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={pinaka.handleSubmit}
          style={{ marginTop: 24 }}
          initialValues={{
            status: 'Active',
            rentDueDay: 1,
            tenantIds: [],
            primaryTenantId: null,
            leaseStart: null,
            leaseEnd: null,
            rentAmount: null,
            securityDeposit: null
          }}
        >
          {/* Row 1: Unit and Status */}
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="unitId"
                label="Unit"
                rules={[rules.required('Unit')]}
              >
                <Select
                  placeholder="Select unit"
                  onChange={(value) => {
                    const unit = units.find(u => u.id === value);
                    setSelectedUnit(unit);
                    
                    // Check if unit has an active lease
                    const activeLease = pinaka.data.find(lease => 
                      lease.unitId === value && lease.status === 'Active'
                    );
                    
                    if (activeLease) {
                      // Always load existing lease data (enables adding tenants to existing leases)
                      const tenantIds = activeLease.leaseTenants?.map(lt => lt.tenantId) || [];
                      const primaryTenant = activeLease.leaseTenants?.find(lt => lt.isPrimaryTenant);
                      
                      setSelectedTenantIds(tenantIds);
                      form.setFieldsValue({
                        tenantIds: tenantIds,
                        primaryTenantId: primaryTenant?.tenantId || tenantIds[0] || null,
                        leaseStart: activeLease.leaseStart ? dayjs(activeLease.leaseStart) : null,
                        leaseEnd: activeLease.leaseEnd ? dayjs(activeLease.leaseEnd) : null,
                        rentAmount: activeLease.rentAmount,
                        rentDueDay: activeLease.rentDueDay,
                        securityDeposit: activeLease.securityDeposit,
                        status: activeLease.status,
                      });
                      
                      // Switch to edit mode for this lease if in add mode
                      if (!pinaka.isEditing) {
                        pinaka.openEdit(activeLease);
                      }
                    } else {
                      // No active lease, clear all fields and use unit defaults
                      setSelectedTenantIds([]);
                      form.setFieldsValue({ 
                        tenantIds: [],
                        primaryTenantId: null,
                        leaseStart: null,
                        leaseEnd: null,
                        rentAmount: unit?.rentPrice || null,
                        rentDueDay: 1,
                        securityDeposit: unit?.depositAmount || null,
                        status: 'Active'
                      });
                    }
                  }}
                >
                  {units.map(unit => {
                    const property = unit.property;
                    // Single unit: show property name only
                    // Multiple units: show "Unit# - Property Name" (e.g., "1801 Aspen")
                    const propertyName = property?.propertyName || '';
                    const displayText = property?.unitCount === 1
                      ? propertyName
                      : unit.unitName ? `${unit.unitName} - ${propertyName}` : propertyName;
                    
                    return (
                      <Select.Option key={unit.id} value={unit.id}>
                        {displayText}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Status">
                <Select>
                  {LEASE_STATUSES.map(status => (
                    <Select.Option key={status} value={status}>{status}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Row 2: Tenant(s) with Primary Tenant Selection Inline */}
          <Form.Item
            label={
              <Space size="large" style={{ width: '100%', flexWrap: 'wrap' }}>
                <Space>
                  <span>Tenant(s)</span>
                  <ActionButton
                    action="add"
                    size="small"
                    onClick={() => {
                      setEditingTenant(null);
                      newTenantForm.resetFields();
                      tenantFormData.resetFormData();
                      setTenantCountry('CA');
                      countryRegion.setCountry('CA');
                      openAddTenantModalForCreate();
                    }}
                    disabled={!selectedUnit}
                    tooltip="Add New Tenant"
                    showText={true}
                    text="Add New Tenant"
                  />
                </Space>
                {selectedTenantIds.length > 1 && (
                  <Space size="middle">
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Primary Tenant (Click star to set primary contact):
                    </Text>
                    {selectedTenantIds.map(tenantId => {
                      const tenant = tenants.find(t => t.id === tenantId);
                      if (!tenant) return null;
                      const primaryTenantId = form.getFieldValue('primaryTenantId');
                      const isPrimary = primaryTenantId === tenantId;
                      
                      return (
                        <Tooltip key={tenantId} title={isPrimary ? "Primary Tenant" : "Set as Primary Tenant"}>
                          <Space size={4} style={{ cursor: 'pointer' }} onClick={() => form.setFieldsValue({ primaryTenantId: tenantId })}>
                            <Text strong>{tenant.firstName} {tenant.lastName}</Text>
                            {isPrimary ? (
                              <StarFilled style={{ fontSize: 16, color: '#faad14' }} />
                            ) : (
                              <StarOutlined style={{ fontSize: 16, color: '#d9d9d9' }} />
                            )}
                          </Space>
                        </Tooltip>
                      );
                    })}
                  </Space>
                )}
              </Space>
            }
          >
            <Form.Item
              name="tenantIds"
              rules={[rules.required('Tenant')]}
              noStyle
            >
              <Select
                mode="multiple"
                placeholder="Select tenant(s)"
                disabled={!selectedUnit}
                onChange={(values) => {
                  setSelectedTenantIds(values);
                  // If only one tenant is selected, auto-set them as primary
                  if (values.length === 1) {
                    form.setFieldsValue({ primaryTenantId: values[0] });
                  } else if (values.length > 1) {
                    // If current primary tenant is not in the list, set first as primary
                    const currentPrimary = form.getFieldValue('primaryTenantId');
                    if (!values.includes(currentPrimary)) {
                      form.setFieldsValue({ primaryTenantId: values[0] });
                    }
                  } else {
                    form.setFieldsValue({ primaryTenantId: null });
                  }
                }}
              >
                {Array.isArray(availableTenants) && availableTenants.map(tenant => (
                  <Select.Option key={tenant.id} value={tenant.id}>
                    {tenant.firstName} {tenant.lastName} ({tenant.email})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            
            {/* Hidden Form Item for Primary Tenant Validation */}
            {selectedTenantIds.length > 0 && (
              <Form.Item
                name="primaryTenantId"
                rules={[rules.required('Primary tenant')]}
                noStyle
              >
                <input type="hidden" />
              </Form.Item>
            )}
          </Form.Item>

          {/* Row 3: Lease Start Date and Lease End Date (both required) */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="leaseStart"
                label="Lease Start Date"
                rules={[rules.required('Start date')]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="leaseEnd" 
                label="Lease End Date"
                rules={[rules.required('End date')]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 4: Monthly Rent, Security Deposit, Rent Due Date */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="rentAmount"
                label="Monthly Rent"
                rules={[rules.required('Rent amount')]}
              >
                <CurrencyInput
                  country="CA"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="securityDeposit" label="Security Deposit">
                <CurrencyInput
                  country="CA"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="rentDueDay" 
                label="Due Day (of month)"
                tooltip="The day of each month when rent is due"
              >
                <Select 
                  style={{ width: '100%' }}
                  placeholder="Select due day"
                  showSearch
                  optionFilterProp="children"
                >
                  {[...Array(31)].map((_, index) => {
                    const day = index + 1;
                    const suffix = 
                      day === 1 || day === 21 || day === 31 ? 'st' :
                      day === 2 || day === 22 ? 'nd' :
                      day === 3 || day === 23 ? 'rd' : 'th';
                    return (
                      <Select.Option key={day} value={day}>
                        {day}{suffix} of every month
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>
      </StandardModal>
    </div>
  );
}

