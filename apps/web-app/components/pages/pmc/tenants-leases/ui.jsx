"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Typography, Table, Tag, Space, Modal, Form, Input, 
  Select, DatePicker, Popconfirm, Card, Empty, Row, Col, InputNumber, Tooltip, Radio, Alert, Badge, Tabs, Spin
} from 'antd';
import { StandardModal, FormTextInput, FormSelect, FormDatePicker, FormPhoneInput } from '@/components/shared';
import { ActionButton } from '@/components/shared/buttons';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, SaveOutlined, CloseOutlined, UserOutlined, MailOutlined, PhoneOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatDateDisplay, formatDateForAPI } from '@/lib/utils/safe-date-formatter';
import { renderDate } from '@/components/shared';
import { renderStatus } from '@/components/shared/TableRenderers';
import { notify } from '@/lib/utils/notification-helper';
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
import { ValidationHelpers } from '@/lib/utils/unified-validation';
import { LEASE_STATUSES } from '@/lib/constants/statuses';
import CurrencyInput from '@/components/rules/CurrencyInput';
import CurrencyDisplay from '@/components/rules/CurrencyDisplay';
import { STANDARD_COLUMNS, COLUMN_NAMES, customizeColumn } from '@/lib/constants/standard-columns';
import { formatPhoneNumber, formatPostalCode } from '@/lib/utils/formatters';
import { formatPropertyDisplay } from '@/lib/utils/rent-display-helpers';
import { PhoneNumberInput, PostalCodeInput, AddressAutocomplete } from '@/components/forms';
import BulkActionsToolbar from '@/components/shared/BulkActionsToolbar';
import { PageLayout, TabbedContent } from '@/components/shared';
import TenantsTab from '@/components/shared/tenants-leases/TenantsTab';
import LeasesTab from '@/components/shared/tenants-leases/LeasesTab';

const { Title, Text } = Typography;

export default function PMCTenantsLeasesClient({ units, tenants: initialTenants, initialLeases }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('leases');
  
  // Initialize from URL or default to leases
  useEffect(() => {
    const tab = searchParams.get('tab') || 'leases';
    setActiveTab(tab);
  }, [searchParams]);
  
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
    domain: 'leases',
    useV1Api: true,
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
      primaryTenantId: payload.primaryTenantId || (payload.tenantIds?.[0] || null),
    }),
    onBeforeUpdate: (id, payload) => ({
      ...payload,
      leaseStart: payload.leaseStart ? formatDateForAPI(payload.leaseStart) : null,
      leaseEnd: payload.leaseEnd ? formatDateForAPI(payload.leaseEnd) : null,
      primaryTenantId: payload.primaryTenantId || (payload.tenantIds?.[0] || null),
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
      const { v1Api } = await import('@/lib/api/v1-client');
      const fullTenant = await v1Api.tenants.get(tenant.id);
      openAddTenantModalForEdit(fullTenant);
      
      const tenantCountryValue = fullTenant.country || 'CA';
      setTenantCountry(tenantCountryValue);
      countryRegion.setCountry(tenantCountryValue);
      
      let formattedPhone = fullTenant.phone || '';
      if (formattedPhone && !formattedPhone.includes('(')) {
        formattedPhone = formatPhoneNumber(formattedPhone);
      }
      
      let formattedPostal = fullTenant.postalZip || '';
      if (formattedPostal) {
        if (tenantCountryValue === 'CA') {
          formattedPostal = formatPostalCode(formattedPostal);
        }
      }
      
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
      
      const tenantData = tenantFormData.prepareTenantData(values, {
        dateOfBirth: values.dateOfBirth ? formatDateForAPI(values.dateOfBirth) : null,
        moveInDate: values.moveInDate ? formatDateForAPI(values.moveInDate) : null,
      });
      
      const sanitizedData = sanitizeFormData(tenantData, { mode: 'storage' });
      
      const { v1Api } = await import('@/lib/api/v1-client');
      const updatedTenant = isEditing
        ? await v1Api.tenants.update(editingTenant.id, sanitizedData)
        : await v1Api.tenants.create(sanitizedData);
      
      notify.success(
        `Tenant ${updatedTenant.firstName} ${updatedTenant.lastName} ${isEditing ? 'updated' : 'added'} successfully!`
      );
      
      // Refresh tenant and lease data - force a full refresh
      const refreshResult = await tenantPinaka.refresh();
      if (refreshResult && refreshResult.success && Array.isArray(refreshResult.data)) {
        setTenants(refreshResult.data);
        setTenantsData([...refreshResult.data]); // Update tenantsData directly
      } else {
        // Fallback: fetch directly
        const response = await v1Api.tenants.list({ page: 1, limit: 1000 });
        const allTenants = response.data?.data || response.data || [];
        setTenants(allTenants);
        tenantPinaka.setData(allTenants);
        setTenantsData([...allTenants]);
      }
      await pinaka.refresh();
      
      closeAddTenantModal();
      newTenantForm.resetFields();
      tenantFormData.resetFormData();
      setTenantCountry('CA');
      countryRegion.setCountry('CA');
    } catch (error) {
      // Error already handled by useUnifiedApi
    }
  }

  const getPropertyUnitDisplay = useCallback((lease) => {
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
              >
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

  const configuredColumns = configureTableColumns(columns || [], {
    addSorting: false,
    centerAlign: true,
    addWidths: false,
  });
  
  const { columns: resizableColumns, tableProps } = useResizableTable(configuredColumns, {
    storageKey: 'pmc-tenants-leases-columns',
    persistColumnWidths: true
  });

  // Tenant management hook (for Tenants tab)
  const tenantPinaka = usePinakaCRUD({
    domain: 'tenants',
    useV1Api: true,
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

  const tenantCalculateStats = useCallback((tenants) => {
    const tenantsArray = Array.isArray(tenants) ? tenants : [];
    
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

  const [tenantsData, setTenantsData] = useState(() => {
    const tenants = Array.isArray(initialTenants) ? initialTenants : [];
    return tenants;
  });
  
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
  
  const tenantSearch = useSearch(
    activeTab === 'tenants' ? tenantsData : [],
    ['firstName', 'lastName', 'email', 'phone', 'currentAddress'],
    { debounceMs: 300 }
  );

  const filteredTenants = useMemo(() => {
    if (activeTab !== 'tenants') return tenantsData;
    
    if (!tenantSearch.searchTerm || !tenantSearch.searchTerm.trim()) {
      return tenantsData;
    }
    
    if (tenantSearchFunction) {
      return tenantsData.filter(item => tenantSearchFunction(item, tenantSearch.searchTerm));
    }
    
    return tenantSearch.filteredData;
  }, [activeTab, tenantsData, tenantSearch.searchTerm, tenantSearch.filteredData, tenantSearchFunction]);

  const tenantStats = useMemo(() => {
    if (!tenantCalculateStats) return [];
    return tenantCalculateStats(activeTab === 'tenants' ? filteredTenants : tenantsData);
  }, [activeTab, filteredTenants, tenantsData, tenantCalculateStats]);


  const tenantBulkOps = useBulkOperations({
    onBulkAction: async (action, selectedIds) => {
      if (action === 'export') {
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
  
  const leaseSearch = useSearch(
    activeTab === 'leases' ? pinaka.data : [],
    ['unit.unitName', 'unit.property.propertyName', 'unit.property.addressLine1', 'status'],
    { debounceMs: 300 }
  );

  const filteredData = useMemo(() => {
    if (activeTab !== 'leases') return pinaka.data;
    
    if (!leaseSearch.searchTerm || !leaseSearch.searchTerm.trim()) {
      return pinaka.data;
    }
    
    if (customSearchFunction) {
      return pinaka.data.filter(item => customSearchFunction(item, leaseSearch.searchTerm));
    }
    
    return leaseSearch.filteredData;
  }, [activeTab, pinaka.data, leaseSearch.searchTerm, leaseSearch.filteredData, customSearchFunction]);

  const leaseStats = useMemo(() => {
    if (!calculateStats) return [];
    return calculateStats(activeTab === 'leases' ? filteredData : pinaka.data);
  }, [activeTab, filteredData, pinaka.data, calculateStats]);


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
          <Popconfirm
            title="Delete tenant?"
            description="This action cannot be undone."
            onConfirm={async () => {
              try {
                const { v1Api } = await import('@/lib/api/v1-client');
                await v1Api.tenants.delete(tenant.id);
                notify.success('Tenant deleted successfully');
                  
                  const filtered = tenantPinaka.data.filter(t => t.id !== tenant.id);
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
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <ActionButton action="delete" tooltip="Delete Tenant" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const configuredTenantColumns = configureTableColumns(tenantColumns);
  
  const { tableProps: tenantTableProps } = useResizableTable(configuredTenantColumns, {
    storageKey: 'pmc-tenants-table',
    defaultSort: { field: 'name', order: 'ascend' },
  });

  return (
    <PageLayout
      headerTitle={<><FileTextOutlined /> Tenants & Leases</>}
      contentStyle={{ maxWidth: 1400, margin: '0 auto' }}
    >
      <TabbedContent
        activeKey={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            key: 'tenants',
            label: (
              <span>
                <UserOutlined />
                Tenants
              </span>
            ),
            badge: tenantsData.length > 0 ? tenantsData.length : undefined,
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
                    const { v1Api } = await import('@/lib/api/v1-client');
                    await v1Api.tenants.delete(tenantId);
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
            badge: pinaka.data.length > 0 ? pinaka.data.length : undefined,
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

      {/* Tenant Modal - Same as landlord version */}
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
          {/* Tenant form content - same as landlord version but truncated for brevity */}
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

      {/* Lease Modal - Same as landlord version */}
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
          {/* Lease form content - same as landlord version but truncated for brevity */}
        </Form>
      </Modal>
    </PageLayout>
  );
}

