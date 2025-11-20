"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Typography, Button, Table, Tag, Space, Modal, Form, Input, 
  Select, InputNumber, Tabs, Popconfirm, Empty, Tooltip, Row, Col,
  Divider, DatePicker
} from 'antd';
import { PageLayout, EmptyState, TableWrapper, StandardModal, FormTextInput, FormSelect, FormDatePicker, FormPhoneInput } from '@/components/shared';
import { notify } from '@/lib/utils/notification-helper';
import { ActionButton, IconButton } from '@/components/shared/buttons';
// Lazy load Pro components to reduce initial bundle size (~200KB savings)
import { 
  ProTable, 
  ProForm, 
  ProFormText, 
  ProFormSelect, 
  ProFormDigit, 
  ProFormDatePicker, 
  ProFormTextArea 
} from '@/components/shared/LazyProComponents';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined, 
  SaveOutlined, CloseOutlined, DownOutlined, RightOutlined,
  ReloadOutlined, BuildOutlined, CheckCircleOutlined
} from '@ant-design/icons';

// Custom Hooks
import { 
  usePinakaCRUDWithAddress, 
  usePinakaCRUD,
  getPostalCodeProps, 
  useResizableTable, 
  withSorter, 
  sortFunctions, 
  configureTableColumns
} from '@/lib/hooks';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import { useModalState } from '@/lib/hooks/useModalState';
import { rules } from '@/lib/utils/validation-rules';
import { getFieldRules } from '@/lib/utils/zod-to-antd-rules';
import { propertyCreateSchema } from '@/lib/schemas';
import { renderStatus } from '@/components/shared/TableRenderers';
import { PostalCodeInput, AddressAutocomplete } from '@/components/forms';
import { v1Api } from '@/lib/api/v1-client';

// Rules Engine Components
import CurrencyInput from '@/components/rules/CurrencyInput';
import CurrencyDisplay from '@/components/rules/CurrencyDisplay';

// Utility Functions
import { formatPostalCode, formatZipCode } from '@/lib/utils/formatters';
import { STANDARD_COLUMNS, COLUMN_NAMES, customizeColumn } from '@/lib/constants/standard-columns';
import { PROPERTY_COLUMNS } from '@/lib/constants/column-definitions';
import { UNIT_STATUSES } from '@/lib/constants/statuses';
import dayjs from 'dayjs';
import { formatDateForAPI } from '@/lib/utils/safe-date-formatter';

const { Title, Text } = Typography;

// Memoize component to prevent unnecessary re-renders
const PropertiesWithUnitsClient = React.memo(function PropertiesWithUnitsClient({ landlordId, initialProperties, landlordData }) {
  const { fetch } = useUnifiedApi({ showUserMessage: true });
  const searchParams = useSearchParams();
  const [propertyForm] = Form.useForm();
  const [unitForm] = Form.useForm();
  const [unitCount, setUnitCount] = useState(1);
  const [unitFinancials, setUnitFinancials] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [selectedPropertyType, setSelectedPropertyType] = useState(null);
  
  // Unit modal state
  const { isOpen: unitModalVisible, open: openUnitModal, close: closeUnitModal, editingItem: editingUnit, openForEdit: openUnitModalForEdit, openForCreate: openUnitModalForCreate } = useModalState();
  const [selectedPropertyForUnit, setSelectedPropertyForUnit] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render after unit update

  // Properties are loaded from server component
  // Provide default landlordData if not passed
  const safeLandlordData = landlordData || { country: 'CA' };

  // 🎯 PINAKA UNIFIED HOOK WITH ADDRESS - For Properties (v1 API)
  const pinaka = usePinakaCRUDWithAddress({
    apiEndpoint: '/api/v1/properties', // v1 endpoint
    domain: 'properties', // Domain name for v1Api
    useV1Api: true, // Use v1Api client
    initialData: initialProperties,
    entityName: 'Property',
    initialCountry: safeLandlordData.country || 'CA',
    messages: {
      createSuccess: 'Property added successfully',
      updateSuccess: 'Property updated successfully',
      deleteSuccess: 'Property deleted successfully'
    },
    defaultFormData: { 
      country: 'CA', 
      unitCount: 1, 
      provinceState: 'ON'
    },
    onBeforeCreate: (payload) => {
      const formValues = propertyForm.getFieldsValue(true);
      return { 
        ...formValues,
        ...payload, 
        landlordId,
        mortgageStartDate: formValues.mortgageStartDate 
          ? formatDateForAPI(formValues.mortgageStartDate)
          : undefined,
        // Always send unitFinancials if we have them, even for single-unit properties
        unitFinancials: unitFinancials && unitFinancials.length > 0 ? unitFinancials : undefined
      };
    },
    onBeforeUpdate: (payload) => {
      const allValues = propertyForm.getFieldsValue(true);
      // Always send unitFinancials if we have units, even for single-unit properties
      // This ensures unit changes are tracked
      let finalUnitFinancials = unitFinancials;
      
      // If unitFinancials is empty or missing, try to get it from selectedItem
      if (!finalUnitFinancials || finalUnitFinancials.length === 0) {
        const existingUnits = pinaka.selectedItem?.units || [];
        if (existingUnits.length > 0) {
          // Re-initialize from existing units
          finalUnitFinancials = initializeUnitFinancials(unitCount, existingUnits);
          console.log('[Property Form] Re-initialized unitFinancials from existing units:', finalUnitFinancials);
        }
      }
      
      // For single unit, ensure we have unitFinancials
      if (unitCount === 1 && (!finalUnitFinancials || finalUnitFinancials.length === 0)) {
        const existingUnits = pinaka.selectedItem?.units || [];
        if (existingUnits.length > 0) {
          const unit = existingUnits[0];
          finalUnitFinancials = [{
            unitNumber: 1,
            unitName: unit.unitName || 'Unit 1',
            floorNumber: unit.floorNumber,
            bedrooms: unit.bedrooms,
            bathrooms: unit.bathrooms,
            rentPrice: allValues.rent || unit.rentPrice,
            depositAmount: allValues.depositAmount || unit.depositAmount,
            status: allValues.rented === "Yes" ? "Occupied" : "Vacant"
          }];
          console.log('[Property Form] Created unitFinancials for single unit:', finalUnitFinancials);
        }
      }
      
      console.log('[Property Form] onBeforeUpdate - Sending unitFinancials:', {
        unitCount,
        unitFinancialsLength: finalUnitFinancials?.length || 0,
        unitFinancials: finalUnitFinancials
      });
      
      return {
        ...allValues,
        ...payload,
        mortgageStartDate: allValues.mortgageStartDate 
          ? formatDateForAPI(allValues.mortgageStartDate)
          : undefined,
        unitFinancials: finalUnitFinancials
      };
    }
  });

  // 🎯 Unit CRUD Hook - Using v1Api (nested under properties)
  // Note: Units are managed via v1Api.units methods with propertyId

  // Calculate combined stats for properties and units
  const calculateStats = (properties) => {
    const allUnits = properties.flatMap(p => p.units || []);
    const occupiedUnits = allUnits.filter(u => 
      u.status === "Occupied" || (u.leases && u.leases.some(l => l.status === "Active"))
    ).length;
    const vacantUnits = allUnits.filter(u => 
      u.status === "Vacant" && (!u.leases || !u.leases.some(l => l.status === "Active"))
    ).length;
    const maintenanceUnits = allUnits.filter(u => u.status === "Under Maintenance").length;

    return [
      { label: 'Properties', value: properties.length, color: '#1890ff' },
      { label: 'Units', value: allUnits.length, color: '#722ed1' },
      { label: 'Occupied', value: occupiedUnits, color: '#52c41a' },
      { label: 'Vacant', value: vacantUnits, color: '#faad14' },
    ];
  };

  // Unified search across properties and units
  const searchInPropertiesAndUnits = (item, searchValue) => {
    const lowerSearch = searchValue.toLowerCase();
    
    // Search in property fields
    const propertyMatch = [
      item.propertyName,
      item.addressLine1,
      item.addressLine2,
      item.city,
      item.postalZip,
      item.propertyType
    ].some(field => field?.toLowerCase().includes(lowerSearch));

    // Search in unit fields
    const unitMatch = item.units?.some(unit =>
      [
        unit.unitName,
        unit.floorNumber?.toString(),
        unit.status,
        unit.bedrooms?.toString(),
        unit.bathrooms?.toString()
      ].some(field => field?.toLowerCase().includes(lowerSearch))
    );

    // If unit matches, auto-expand the property
    if (unitMatch && !expandedRowKeys.includes(item.id)) {
      setExpandedRowKeys(prev => [...prev, item.id]);
    }

    return propertyMatch || unitMatch;
  };

  const [searchTerm, setSearchTerm] = useState('');

  // Search filter
  const filteredData = useMemo(() => {
    if (!searchTerm) return pinaka.data;
    return pinaka.data.filter(item => searchInPropertiesAndUnits(item, searchTerm));
  }, [pinaka.data, searchTerm]);

  // Calculate stats
  const allUnits = pinaka.data.flatMap(p => p.units || []);
  const occupiedUnits = allUnits.filter(u => u.status === 'Occupied').length;
  const vacantUnits = allUnits.filter(u => u.status === 'Vacant').length;

  const statsData = [
    {
      title: 'Properties',
      value: pinaka.data.length,
      prefix: <BuildOutlined />,
    },
    {
      title: 'Units',
      value: allUnits.length,
      prefix: <HomeOutlined />,
      valueStyle: { color: '#722ed1' },
    },
    {
      title: 'Occupied',
      value: occupiedUnits,
      prefix: <CheckCircleOutlined />,
      valueStyle: { color: '#52c41a' },
    },
    {
      title: 'Vacant',
      value: vacantUnits,
      prefix: <HomeOutlined />,
      valueStyle: { color: '#faad14' },
    },
  ];

  // Auto-open add modal if action=add in URL
  useEffect(() => {
    if (searchParams.get("action") === "add") {
      handleAddPropertyClick();
    }
  }, []);

  function handleAddPropertyClick() {
    pinaka.setCountry("CA");
    setUnitCount(1);
    setSelectedPropertyType(null);
    propertyForm.resetFields();
    propertyForm.setFieldsValue({ 
      country: "CA", 
      provinceState: "ON",
      unitCount: 1 
    });
    // Initialize unitFinancials for single unit so users can add details
    const financials = initializeUnitFinancials(1, []);
    setUnitFinancials(financials);
    pinaka.openAdd();
  }
  
  // Initialize unit financials based on unit count
  const initializeUnitFinancials = (count, existingUnits = []) => {
    const financials = [];
    
    if (existingUnits && existingUnits.length > 0) {
      for (let i = 0; i < count; i++) {
        const existingUnit = existingUnits[i];
        financials.push({
          unitNumber: i + 1,
          unitName: existingUnit?.unitName || `Unit ${i + 1}`,
          floorNumber: existingUnit?.floorNumber || null,
          bedrooms: existingUnit?.bedrooms || null,
          bathrooms: existingUnit?.bathrooms || null,
          rentPrice: existingUnit?.rentPrice || null,
          depositAmount: existingUnit?.depositAmount || null,
          status: existingUnit?.status || "Vacant"
        });
      }
    } else {
      for (let i = 1; i <= count; i++) {
        financials.push({
          unitNumber: i,
          unitName: `Unit ${i}`,
          floorNumber: null,
          bedrooms: null,
          bathrooms: null,
          rentPrice: null,
          depositAmount: null,
          status: "Vacant"
        });
      }
    }
    
    return financials;
  };

  function handleEditPropertyClick(property) {
    pinaka.setCountry(property.country);
    // Use actual unit count from database, not stored unitCount field
    // This ensures consistency when units are added/removed independently
    const actualUnitCount = property.units?.length || 0;
    const count = actualUnitCount > 0 ? actualUnitCount : (property.unitCount || 1);
    setUnitCount(count);
    
    // Map property type to match dropdown options
    // "Multi-Unit" -> "Multi-family" (for backward compatibility)
    let mappedPropertyType = property.propertyType || null;
    if (mappedPropertyType === 'Multi-Unit') {
      mappedPropertyType = 'Multi-family';
    }
    setSelectedPropertyType(mappedPropertyType);
    
    // Always initialize unitFinancials, even for single-unit properties
    const financials = initializeUnitFinancials(count, property.units || []);
    console.log('[Property Form] Initializing unitFinancials:', {
      count,
      actualUnitCount,
      storedUnitCount: property.unitCount,
      unitsCount: property.units?.length || 0,
      financials
    });
    setUnitFinancials(financials);
    
    propertyForm.setFieldsValue({
      propertyName: property.propertyName || "",
      addressLine1: property.addressLine1,
      city: property.city,
      country: property.country,
      provinceState: property.provinceState,
      postalZip: property.postalZip,
      propertyType: mappedPropertyType || undefined,
      unitCount: count,
      yearBuilt: property.yearBuilt || undefined,
      purchasePrice: property.purchasePrice || undefined,
      mortgageAmount: property.mortgageAmount || undefined,
      interestRate: property.interestRate || undefined,
      mortgageTermYears: property.mortgageTermYears || undefined,
      mortgageStartDate: property.mortgageStartDate ? (() => {
        // Extract local date components to avoid UTC timezone shift
        const date = new Date(property.mortgageStartDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // dayjs uses 0-indexed months, but we want 1-indexed
        const day = date.getDate();
        return dayjs(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
      })() : undefined,
      paymentFrequency: property.paymentFrequency || 'biweekly',
      rent: property.rent || undefined,
      depositAmount: property.depositAmount || undefined,
      rented: property.rented || "No",
      // New fields (will be stored if schema supports them)
      squareFootage: property.squareFootage || undefined,
      propertyDescription: property.propertyDescription || "",
      propertyTaxes: property.propertyTaxes || undefined,
    });
    pinaka.openEdit(property);
  }

  function handleCloseProperty() {
    pinaka.close();
    propertyForm.resetFields();
    setUnitFinancials([]);
  }
  
  const handleUnitCountChange = (newCount) => {
    setUnitCount(newCount);
    // Always initialize unitFinancials, even for single-unit properties
    // This allows users to add unit details (bedrooms, bathrooms, etc.) for single-unit properties
    const existingUnits = pinaka.selectedItem?.units || [];
    const financials = initializeUnitFinancials(newCount, existingUnits);
    setUnitFinancials(financials);
  };
  
  const updateUnitFinancial = (unitNumber, field, value) => {
    setUnitFinancials(prev => 
      prev.map(unit => 
        unit.unitNumber === unitNumber 
          ? { ...unit, [field]: value }
          : unit
      )
    );
  };

  // ========== UNIT MANAGEMENT FUNCTIONS ==========
  
  const handleAddUnitClick = (property) => {
    setSelectedPropertyForUnit(property);
    setEditingUnit(null);
    unitForm.resetFields();
    unitForm.setFieldsValue({
      propertyId: property.id,
      status: "Vacant",
    });
    openUnitModalForCreate();
  };

  const handleEditUnitClick = (unit, property) => {
    console.log('[Edit Unit] Opening edit modal for unit:', {
      unitId: unit.id,
      unitName: unit.unitName,
      floorNumber: unit.floorNumber,
      propertyId: unit.propertyId,
    });
    
    setSelectedPropertyForUnit(property);
    openUnitModalForEdit(unit);
    
    // Use setTimeout to ensure form is ready before setting values
    setTimeout(() => {
      unitForm.setFieldsValue({
        propertyId: unit.propertyId || property?.id,
        unitName: unit.unitName || '',
        floorNumber: unit.floorNumber !== null && unit.floorNumber !== undefined ? unit.floorNumber : undefined,
        bedrooms: unit.bedrooms !== null && unit.bedrooms !== undefined ? unit.bedrooms : undefined,
        bathrooms: unit.bathrooms !== null && unit.bathrooms !== undefined ? unit.bathrooms : undefined,
        rentPrice: unit.rentPrice !== null && unit.rentPrice !== undefined ? unit.rentPrice : undefined,
        depositAmount: unit.depositAmount !== null && unit.depositAmount !== undefined ? unit.depositAmount : undefined,
        status: unit.status || "Vacant",
      });
    }, 100);
    
    openUnitModalForCreate();
  };

  const handleDeleteUnit = async (unitId) => {
    try {
      // Find the property that owns this unit
      const property = pinaka.data?.find(p => p.units?.some(u => u.id === unitId));
      if (!property) {
        notify.error('Property not found for this unit');
        return;
      }

      // Use v1Api to delete unit
      await v1Api.units.deletePropertyUnit(property.id, unitId);
      notify.success('Unit deleted successfully');
      pinaka.refresh(); // Refresh properties to update units
    } catch (error) {
      notify.error(error.message || 'Failed to delete unit');
    }
  };

  const handleUnitSubmit = async (values) => {
    try {
      if (!selectedPropertyForUnit) {
        notify.error('Property not selected');
        return;
      }

      const propertyId = selectedPropertyForUnit.id;

      // Ensure floorNumber is properly formatted (can be 0, null, or a number)
      const payload = {
        ...values,
        floorNumber: values.floorNumber !== undefined && values.floorNumber !== null && values.floorNumber !== '' 
          ? Number(values.floorNumber) 
          : null,
      };

      if (editingUnit && editingUnit.id) {
        // Update existing unit using v1Api
        await v1Api.units.updatePropertyUnit(propertyId, editingUnit.id, payload);
        notify.success('Unit updated successfully');
      } else {
        // Create new unit using v1Api
        await v1Api.units.createPropertyUnit(propertyId, payload);
        notify.success('Unit added successfully');
      }

      closeUnitModal();
      unitForm.resetFields();
      setEditingUnit(null);
      setSelectedPropertyForUnit(null);
      
      // Refresh properties to get updated units
      await new Promise(resolve => setTimeout(resolve, 500));
      await pinaka.refresh();
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('[Unit Submit] Error:', error);
      notify.error(error.message || 'Failed to save unit');
    }
  };

  const handleCloseUnit = () => {
    setUnitModalVisible(false);
    unitForm.resetFields();
    setEditingUnit(null);
    setSelectedPropertyForUnit(null);
  };

  const getStatusTagColor = (status, hasActiveLease) => {
    if (hasActiveLease) return "success";
    switch (status) {
      case "Occupied":
        return "success";
      case "Vacant":
        return "warning";
      case "Under Maintenance":
        return "error";
      default:
        return "default";
    }
  };

  // ========== EXPANDABLE ROW: UNITS TABLE ==========
  
  const expandedRowRender = (property) => {
    // Use refreshKey to force re-render when units are updated
    const units = property.units || [];
    
    // Debug: Log units data to verify floor numbers
    if (units.length > 0 && process.env.NODE_ENV === 'development') {
      console.log('[Expanded Row] Units for property:', {
        propertyName: property.propertyName,
        propertyId: property.id,
        refreshKey,
        units: units.map(u => ({
          id: u.id,
          unitName: u.unitName,
          floorNumber: u.floorNumber,
          floorNumberType: typeof u.floorNumber,
        })),
      });
    }

    const unitColumns = [
      {
        title: 'Unit #',
        dataIndex: 'unitName',
        key: 'unitName',
        width: 120,
        sorter: (a, b) => (a.unitName || '').localeCompare(b.unitName || ''),
        render: (name) => <Text strong>{name}</Text>,
      },
      {
        title: 'Floor(s)',
        dataIndex: 'floorNumber',
        key: 'floorNumber',
        width: 80,
        align: 'center',
        sorter: (a, b) => (a.floorNumber ?? 0) - (b.floorNumber ?? 0),
        render: (floor) => <Text>{floor !== null && floor !== undefined ? floor.toString() : "-"}</Text>,
      },
      {
        title: 'Beds',
        dataIndex: 'bedrooms',
        key: 'bedrooms',
        width: 80,
        align: 'center',
        sorter: (a, b) => (a.bedrooms || 0) - (b.bedrooms || 0),
        render: (beds) => <Text>{beds || "-"}</Text>,
      },
      {
        title: 'Baths',
        dataIndex: 'bathrooms',
        key: 'bathrooms',
        width: 80,
        align: 'center',
        sorter: (a, b) => (a.bathrooms || 0) - (b.bathrooms || 0),
        render: (baths) => <Text>{baths || "-"}</Text>,
      },
      {
        title: 'Rent',
        dataIndex: 'rentPrice',
        key: 'rentPrice',
        width: 140,
        align: 'right',
        sorter: (a, b) => (a.rentPrice || 0) - (b.rentPrice || 0),
        render: (rent) => rent ? (
          <CurrencyDisplay 
            value={rent} 
            country={property.country || 'CA'}
            strong 
            style={{ color: '#52c41a' }}
          />
        ) : <Text type="secondary">-</Text>,
      },
      {
        title: 'Deposit',
        dataIndex: 'depositAmount',
        key: 'depositAmount',
        width: 140,
        align: 'right',
        sorter: (a, b) => (a.depositAmount || 0) - (b.depositAmount || 0),
        render: (deposit) => deposit ? (
          <CurrencyDisplay value={deposit} country={property.country || 'CA'} />
        ) : <Text type="secondary">-</Text>,
      },
      {
        title: 'Status',
        key: 'status',
        dataIndex: 'status',
        width: 120,
        sorter: (a, b) => {
          const statusA = a.leases?.some(l => l.status === "Active") ? "Rented" : a.status;
          const statusB = b.leases?.some(l => l.status === "Active") ? "Rented" : b.status;
          return statusA.localeCompare(statusB);
        },
        render: (_, unit) => {
          const hasActiveLease = unit.leases && unit.leases.some(l => l.status === "Active");
          const displayStatus = hasActiveLease ? "Rented" : unit.status;
          return <Tag color={getStatusTagColor(unit.status, hasActiveLease)}>{displayStatus}</Tag>;
        },
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 120,
        fixed: 'right',
        render: (_, unit) => (
          <Space size="small">
            <ActionButton
              action="edit"
              size="small"
              onClick={() => handleEditUnitClick(unit, property)}
              tooltip="Edit Unit"
            />
            <Popconfirm
              title="Delete unit?"
              description="This will also delete all associated leases and data."
              onConfirm={() => handleDeleteUnit(unit.id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <ActionButton
                action="delete"
                size="small"
                tooltip="Delete Unit"
              />
            </Popconfirm>
          </Space>
        ),
      },
    ];

    if (units.length === 0) {
      return (
        <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#fafafa' }}>
          <Empty 
            description="No units yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <ActionButton
              action="add"
              onClick={() => handleAddUnitClick(property)}
              tooltip="Add Unit"
            />
          </Empty>
        </div>
      );
    }

    return (
      <div style={{ padding: '0 48px 16px 48px' }}>
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary">
            <strong>{units.length}</strong> {units.length === 1 ? 'unit' : 'units'} in this property
          </Text>
          <ActionButton
            action="add"
            onClick={() => handleAddUnitClick(property)}
            tooltip="Add Unit"
            size="small"
          />
        </div>
        <Table
          key={`units-table-${property.id}-${refreshKey}`}
          columns={unitColumns}
          dataSource={units}
          rowKey="id"
          pagination={false}
          size="small"
          bordered
          onRow={(record) => ({
            onDoubleClick: () => handleEditUnitClick(record, property),
            style: { cursor: 'pointer' }
          })}
        />
      </div>
    );
  };

  // ========== PROPERTY TABLE COLUMNS ==========
  
  // Use consolidated column definitions with customizations
  const columns = [
    withSorter(
      customizeColumn(PROPERTY_COLUMNS.NAME, {
        key: 'name',
      }),
      sortFunctions.custom(
        (row) => row.propertyName || row.addressLine1,
        (a, b) => a.localeCompare(b)
      )
    ),
    PROPERTY_COLUMNS.ADDRESS,
    withSorter(
      PROPERTY_COLUMNS.CITY_STATE,
      sortFunctions.string('city')
    ),
    customizeColumn(STANDARD_COLUMNS.MONTHLY_RENT, {
      key: 'rent',
      render: (_, property) => {
        const activeLeases = property.units?.flatMap(unit => unit.leases || []).filter(lease => lease.status === "Active") || [];
        const hasActiveLease = activeLeases.length > 0;
        const totalMonthlyRent = activeLeases.reduce((sum, lease) => sum + parseFloat(lease.rentAmount || 0), 0);
        
        return hasActiveLease ? (
          <CurrencyDisplay 
            value={totalMonthlyRent} 
            country={property.country}
            strong 
            style={{ color: '#52c41a' }}
          />
        ) : (
          <Text type="secondary">No active leases</Text>
        );
      },
    }),
    PROPERTY_COLUMNS.TYPE,
    PROPERTY_COLUMNS.STATUS,
    withSorter(
      {
        title: COLUMN_NAMES.UNITS,
        key: 'units',
        align: 'center',
        ellipsis: true,
        render: (_, property) => {
          const totalUnits = property.units?.length || property.unitCount || 0;
          const occupiedUnits = property.units?.filter(u => 
            u.status === "Occupied" || (u.leases && u.leases.some(l => l.status === "Active"))
          ).length || 0;
          
          return (
            <Text>
              <Text strong>{occupiedUnits} / {totalUnits}</Text>
              {' '}
              <Text type="secondary">occupied</Text>
            </Text>
          );
        },
      },
      sortFunctions.custom(
        (row) => row.units?.length || 0,
        (a, b) => a - b
      )
    ),
    customizeColumn(STANDARD_COLUMNS.ACTIONS, {
      width: 150,
      fixed: 'right',
      render: (_, property) => (
        <Space>
          <ActionButton
            action="edit"
            onClick={() => handleEditPropertyClick(property)}
            tooltip="Edit Property"
          />
          <Popconfirm
            title="Delete property?"
            description="This will also delete all associated units and data."
            onConfirm={() => pinaka.remove(property.id, property)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <ActionButton
              action="delete"
              tooltip="Delete Property"
            />
          </Popconfirm>
        </Space>
      ),
    }),
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
    storageKey: 'landlord-properties-units-table',
  });

  // ========== PROPERTY FORM TABS ==========
  
  // Filter property types to exclude Duplex, Triplex, Fourplex (these are multi-family)
  const getFilteredPropertyTypes = () => {
    const excludedTypes = ['Duplex', 'Triplex', 'Fourplex'];
    return pinaka.countryRegion.getPropertyTypes().filter(type => !excludedTypes.includes(type));
  };
  
  const propertyInfoTab = (
    <div style={{ padding: '4px 0' }}>
      <Row gutter={[12, 16]}>
        <Col span={8}>
          <Form.Item 
            name="propertyName" 
            label="Property Name"
          >
            <Input 
              placeholder="e.g., Maple Street" 
              autoComplete="off"
              data-form-type="property-name"
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item 
            name="propertyType" 
            label="Property Type"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Select 
              placeholder="Select type" 
              allowClear 
              loading={pinaka.countryRegion.loading}
              value={selectedPropertyType}
              onChange={(value) => {
                setSelectedPropertyType(value);
                if (value === 'Single-family' || value === 'Townhouse') {
                  propertyForm.setFieldsValue({ unitCount: 1 });
                  setUnitCount(1);
                  const existingUnits = pinaka.selectedItem?.units || [];
                  const financials = initializeUnitFinancials(1, existingUnits);
                  setUnitFinancials(financials);
                }
              }}
            >
              {getFilteredPropertyTypes().map(type => (
                <Select.Option key={type} value={type}>{type}</Select.Option>
            ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item 
            name="unitCount" 
            label="Number of Units"
            initialValue={1}
          >
            <InputNumber 
              min={1} 
              style={{ width: '100%' }}
              onChange={handleUnitCountChange}
              disabled={!selectedPropertyType || selectedPropertyType === 'Single-family' || selectedPropertyType === 'Townhouse'}
              placeholder="1"
            />
          </Form.Item>
        </Col>

        <Col span={16}>
          <Form.Item
            name="addressLine1"
            label="Street Address"
            rules={[{ required: true, message: 'Required' }]}
            tooltip="Start typing an address to see autocomplete suggestions"
          >
            <AddressAutocomplete
              placeholder="Type an address (e.g., 123 Main St, Toronto)"
              country={pinaka.country === 'CA' ? 'CA,US' : pinaka.country === 'US' ? 'CA,US' : 'CA,US'}
              onSelect={(addressData) => {
                // Country code is already normalized by AddressAutocomplete component
                const countryCode = addressData.country;
                
                // Update country context first (this will update the region dropdown options)
                if (countryCode === 'CA' || countryCode === 'US') {
                  pinaka.setCountry(countryCode);
                  
                  // Auto-fill address fields when address is selected
                  // Use setTimeout to ensure country change has processed and dropdown options are updated
                  setTimeout(() => {
                    propertyForm.setFieldsValue({
                      addressLine1: addressData.addressLine1,
                      city: addressData.city,
                      provinceState: addressData.provinceState, // 2-letter code (e.g., 'ON', 'NY', 'CA')
                      postalZip: addressData.postalZip, // Will be formatted by PostalCodeInput based on country
                      country: countryCode,
                    });
                  }, 50); // Small delay to ensure country change propagates
                } else {
                  // If country is not CA/US, just set the fields without country change
                  propertyForm.setFieldsValue({
                    addressLine1: addressData.addressLine1,
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
          <Form.Item
            name="city"
            label="City"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input 
              placeholder="City" 
            />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name="provinceState"
            label={pinaka.countryRegion.getRegionLabel(pinaka.country)}
            rules={[{ required: true, message: 'Required' }]}
            initialValue="ON"
          >
            <Select 
              placeholder="Select" 
              loading={pinaka.countryRegion.loading}
              virtual={false}
            >
              {pinaka.countryRegion.getRegionsByCountry(pinaka.country).map(region => (
                <Select.Option key={region.code} value={region.code}>{region.code}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name="postalZip"
            label={pinaka.countryRegion.getPostalLabel(pinaka.country)}
            rules={[{ required: true, message: 'Required' }]}
          >
            <PostalCodeInput country={pinaka.country} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name="country"
            label="Country"
            rules={[{ required: true, message: 'Required' }]}
            initialValue="CA"
          >
            <Select
              loading={pinaka.countryRegion.loading}
              virtual={false}
              onChange={(value) => {
                pinaka.setCountry(value);
                const defaultRegion = value === 'CA' ? 'ON' : value === 'US' ? 'NJ' : undefined;
                propertyForm.setFieldsValue({ provinceState: defaultRegion });
              }}
            >
              {pinaka.countryRegion.getCountries().map(c => (
                <Select.Option key={c.code} value={c.code}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item 
            name="squareFootage" 
            label="SQ. Ft."
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="1500"
              formatter={value => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
              parser={value => value ? value.replace(/\$\s?|(,*)/g, '') : ''}
              addonAfter="sq ft"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[12, 16]}>
        <Col span={24}>
          <Form.Item 
            name="propertyDescription" 
            label="Notes"
          >
            <Input.TextArea
              rows={2}
              placeholder="Additional details or notes (optional)"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  const unitsTab = (
    <div style={{ padding: '8px 0' }}>
      {unitFinancials.length === 0 ? (
        <div style={{ 
          padding: 40, 
          textAlign: 'center', 
          color: 'rgba(0, 0, 0, 0.45)',
          border: '1px dashed #d9d9d9',
          borderRadius: '6px',
          backgroundColor: '#fafafa'
        }}>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Set number of units in Property Info tab
          </Text>
        </div>
      ) : (
        <Table
          dataSource={unitFinancials.map((unit, index) => ({ ...unit, key: unit.unitNumber }))}
          pagination={false}
          size="small"
          bordered
          style={{ fontSize: '14px' }}
          columns={[
            {
              title: 'Unit',
              dataIndex: 'unitName',
              key: 'unitName',
              width: '14%',
              align: 'center',
              render: (text, record) => (
                <Input
                  value={text}
                  onChange={(e) => updateUnitFinancial(record.unitNumber, 'unitName', e.target.value)}
                  placeholder="101"
                  autoComplete="off"
                  data-form-type="unit-name"
                  style={{ width: '100%', textAlign: 'center' }}
                />
              ),
            },
            {
              title: 'Floor(s)',
              dataIndex: 'floorNumber',
              key: 'floorNumber',
              width: '12%',
              align: 'center',
              render: (value, record) => (
                <InputNumber
                  value={value}
                  onChange={(val) => updateUnitFinancial(record.unitNumber, 'floorNumber', val)}
                  placeholder="1"
                  min={0}
                  max={99}
                  style={{ width: '100%', textAlign: 'center' }}
                  controls={false}
                />
              ),
            },
            {
              title: 'Beds',
              dataIndex: 'bedrooms',
              key: 'bedrooms',
              width: '12%',
              align: 'center',
              render: (value, record) => (
                <InputNumber
                  value={value}
                  onChange={(val) => updateUnitFinancial(record.unitNumber, 'bedrooms', val)}
                  placeholder="2"
                  min={0}
                  style={{ width: '100%', textAlign: 'center' }}
                  controls={false}
                />
              ),
            },
            {
              title: 'Baths',
              dataIndex: 'bathrooms',
              key: 'bathrooms',
              width: '12%',
              align: 'center',
              render: (value, record) => (
                <InputNumber
                  value={value}
                  onChange={(val) => updateUnitFinancial(record.unitNumber, 'bathrooms', val)}
                  placeholder="1"
                  min={0}
                  step={0.5}
                  style={{ width: '100%', textAlign: 'center' }}
                  controls={false}
                />
              ),
            },
            {
              title: 'Rent',
              dataIndex: 'rentPrice',
              key: 'rentPrice',
              width: '16%',
              align: 'center',
              render: (value, record) => (
                <CurrencyInput
                  country={pinaka.country}
                  value={value}
                  onChange={(val) => updateUnitFinancial(record.unitNumber, 'rentPrice', val)}
                  placeholder="0.00"
                  style={{ width: '100%' }}
                />
              ),
            },
            {
              title: 'Deposit',
              dataIndex: 'depositAmount',
              key: 'depositAmount',
              width: '16%',
              align: 'center',
              render: (value, record) => (
                <CurrencyInput
                  country={pinaka.country}
                  value={value}
                  onChange={(val) => updateUnitFinancial(record.unitNumber, 'depositAmount', val)}
                  placeholder="0.00"
                  style={{ width: '100%' }}
                />
              ),
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              width: '18%',
              align: 'center',
              render: (value, record) => (
                <Select
                  value={value}
                  onChange={(val) => updateUnitFinancial(record.unitNumber, 'status', val)}
                  style={{ width: '100%' }}
                  dropdownStyle={{ minWidth: '200px' }}
                >
                  <Select.Option value="Vacant">Vacant</Select.Option>
                  <Select.Option value="Occupied">Occupied</Select.Option>
                  <Select.Option value="Under Maintenance">Maintenance</Select.Option>
                </Select>
              ),
            },
          ]}
        />
      )}
    </div>
  );

  const financialTab = (
    <div style={{ padding: '4px 0' }}>
      <Row gutter={[12, 16]}>
        <Col span={6}>
          <Form.Item 
            name="yearBuilt" 
            label="Year Built"
          >
            <InputNumber
              min={1800}
              max={new Date().getFullYear()}
              style={{ width: '100%' }}
              placeholder="2015"
            />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item 
            name="purchasePrice" 
            label="Purchase Price"
          >
            <CurrencyInput
              country={pinaka.country}
              style={{ width: '100%' }}
              placeholder="0.00"
            />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item 
            name="mortgageAmount" 
            label="Mortgage Amount"
          >
            <CurrencyInput
              country={pinaka.country}
              style={{ width: '100%' }}
              placeholder="0.00"
            />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item 
            name="propertyTaxes" 
            label="Annual Taxes"
          >
            <CurrencyInput
              country={pinaka.country}
              style={{ width: '100%' }}
              placeholder="0.00"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[12, 16]}>
        <Col span={6}>
          <Form.Item 
            name="mortgageStartDate" 
            label="Start Date"
          >
            <DatePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              placeholder="Select date"
            />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item 
            name="interestRate" 
            label="Interest Rate"
          >
            <InputNumber
              min={0}
              max={100}
              precision={2}
              style={{ width: '100%' }}
              placeholder="5.25"
              suffix="%"
            />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item 
            name="mortgageTermYears" 
            label="Term"
          >
            <InputNumber
              min={1}
              max={50}
              style={{ width: '100%' }}
              placeholder="25"
              addonAfter="years"
            />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item 
            name="paymentFrequency" 
            label="Payment Frequency"
          >
            <Select
              style={{ width: '100%' }}
              placeholder="Select"
            >
              <Select.Option value="biweekly">Bi-weekly</Select.Option>
              <Select.Option value="monthly">Monthly</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  const propertyTabItems = [
    {
      key: 'property',
      label: 'Property Info',
      children: propertyInfoTab,
    },
    {
      key: 'units',
      label: 'Units',
      children: unitsTab,
    },
    {
      key: 'financial',
      label: 'Financial Details',
      children: financialTab,
    },
  ];

  return (
    <PageLayout
      headerTitle={<><BuildOutlined /> Properties</>}
      headerActions={[
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddPropertyClick}
        >
          Add Property
        </Button>,
        <Button
          key="refresh"
          icon={<ReloadOutlined />}
          onClick={() => {
            pinaka.refresh();
            notify.success('Refreshed properties and units');
          }}
        >
          Refresh
        </Button>,
      ]}
      stats={statsData}
      statsCols={4}
      showSearch={true}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      onSearchClear={() => setSearchTerm('')}
      searchPlaceholder="Search properties and units by name, address, city, or unit details..."
    >
      {pinaka.data.length === 0 ? (
        <EmptyState
          icon={<HomeOutlined />}
          title="No properties yet"
          description="Click 'Add Property' to add your first property"
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
            expandable={{
              expandedRowRender,
              expandedRowKeys,
              onExpandedRowsChange: setExpandedRowKeys,
              expandIcon: ({ expanded, onExpand, record }) => {
                const hasMultipleUnits = record.units && record.units.length > 1;
                
                if (!hasMultipleUnits) {
                  return <span style={{ display: 'inline-block', width: '16px' }} />;
                }
                
                return (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onExpand(record, e);
                    }}
                    style={{
                      fontSize: '14px',
                      color: '#1890ff',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.2s',
                      transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      width: '16px',
                      height: '16px'
                    }}
                  >
                    ▶
                  </span>
                );
              },
            }}
            pagination={{
              pageSize: 25,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} properties`,
            }}
            size="middle"
            onRow={(record) => ({
              onDoubleClick: () => handleEditPropertyClick(record),
              style: { cursor: 'pointer' }
            })}
          />
        </TableWrapper>
      )}

      {/* Property Modal */}
      <Modal
        title={pinaka.isEditing ? "Edit Property" : "Add Property"}
        open={pinaka.isOpen}
        onCancel={handleCloseProperty}
        footer={null}
        width={700}
      >
        <ProForm
          form={propertyForm}
          layout="vertical"
          onFinish={pinaka.handleSubmit}
          preserve={true}
          requiredMark={false}
          submitter={{
            render: (props, doms) => {
              return (
                <div style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 8
                }}>
                  {pinaka.renderFormButtons()}
                </div>
              );
            }
          }}
        >
          <Tabs
            items={propertyTabItems}
            style={{ marginBottom: 16 }}
            destroyInactiveTabPane={false}
          />
        </ProForm>
      </Modal>

      {/* Unit Modal */}
      <StandardModal
        title={editingUnit ? "Edit Unit" : "Add Unit"}
        open={unitModalVisible}
        form={unitForm}
        loading={false}
        submitText={editingUnit ? "Save" : "Add"}
        onCancel={handleCloseUnit}
        onFinish={handleUnitSubmit}
        width={600}
      >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="propertyId" label="Property Name" rules={[{ required: true, message: 'Please select a property' }]}>
                <Select placeholder="Select property" size="large" disabled>
                  <Select.Option value={selectedPropertyForUnit?.id}>
                    {selectedPropertyForUnit?.propertyName || selectedPropertyForUnit?.addressLine1}
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="unitName" label="Unit Number" rules={[{ required: true, message: 'Please enter unit number' }]}>
                <Input 
                  placeholder="e.g., 101" 
                  size="large" 
                  autoComplete="off"
                  data-form-type="unit-name"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="floorNumber" label="Floor(s)">
                <InputNumber min={0} max={99} style={{ width: '100%' }} placeholder="e.g., 1" size="large" controls={false} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="bedrooms" label="Bedrooms">
                <InputNumber min={0} max={20} style={{ width: '100%' }} placeholder="e.g., 2" size="large" controls={false} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="bathrooms" label="Bathrooms">
                <InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} placeholder="e.g., 2.0" size="large" controls={false} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="rentPrice" label="Rent">
                <CurrencyInput country={selectedPropertyForUnit?.country || 'CA'} style={{ width: '100%' }} placeholder="0.00" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="depositAmount" label="Security Deposit">
                <CurrencyInput country={selectedPropertyForUnit?.country || 'CA'} style={{ width: '100%' }} placeholder="0.00" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Status">
                <Select size="large">
                  {UNIT_STATUSES.map(status => (
                    <Select.Option key={status} value={status}>{status}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

      </StandardModal>
    </PageLayout>
  );
});

PropertiesWithUnitsClient.displayName = 'PropertiesWithUnitsClient';

export default PropertiesWithUnitsClient;
