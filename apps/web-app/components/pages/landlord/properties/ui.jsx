"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Button, Table, Badge, Modal, Card, Tabs, Spinner, Tooltip,
  TextInput, Label, Select, Textarea
} from 'flowbite-react';
import { PageLayout, EmptyState, TableWrapper } from '@/components/shared';
import { notify } from '@/lib/utils/notification-helper';
import { ActionButton, IconButton } from '@/components/shared/buttons';
import ExpandableFlowbiteTable from '@/components/shared/ExpandableFlowbiteTable';
import FlowbitePopconfirm from '@/components/shared/FlowbitePopconfirm';
import { renderStatus } from '@/components/shared/FlowbiteTableRenderers';
import { useFormState } from '@/lib/hooks/useFormState';
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiHome,
  HiSave,
  HiX,
  HiRefresh,
  HiCog,
  HiCheckCircle,
} from 'react-icons/hi';

// Custom Hooks
import { 
  usePinakaCRUDWithAddress, 
  useResizableTable, 
  withSorter, 
  sortFunctions, 
  configureTableColumns
} from '@/lib/hooks';
// useUnifiedApi removed - use v2Api from @/lib/api/v2-client';
import { useModalState } from '@/lib/hooks/useModalState';
import { rules } from '@/lib/utils/validation-rules';
import { PostalCodeInput, AddressAutocomplete } from '@/components/forms';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useCreateUnit, useUpdateUnit, useDeleteUnit } from '@/lib/hooks/useV2Data';

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

// Memoize component to prevent unnecessary re-renders
const PropertiesWithUnitsClient = React.memo(function PropertiesWithUnitsClient({ landlordId, initialProperties, landlordData }) {
  // useUnifiedApi removed - use v2Api
  const { user } = useV2Auth();
  const searchParams = useSearchParams();
  const propertyForm = useFormState({ 
    country: 'CA', 
    unitCount: 1, 
    provinceState: 'ON'
  });
  const unitForm = useFormState();
  const [unitCount, setUnitCount] = useState(1);
  const [unitFinancials, setUnitFinancials] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [selectedPropertyType, setSelectedPropertyType] = useState(null);
  
  // Unit modal state
  const { isOpen: unitModalVisible, open: openUnitModal, close: closeUnitModal, editingItem: editingUnit, openForEdit: openUnitModalForEdit, openForCreate: openUnitModalForCreate } = useModalState();
  const [selectedPropertyForUnit, setSelectedPropertyForUnit] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // v2 API hooks for units
  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();
  const deleteUnit = useDeleteUnit();

  // Properties are loaded from server component
  const safeLandlordData = landlordData || { country: 'CA' };

  // 🎯 PINAKA UNIFIED HOOK WITH ADDRESS - For Properties (v2 API)
  const pinaka = usePinakaCRUDWithAddress({
    apiEndpoint: '/api/v2/properties',
    domain: 'properties',
    useV1Api: false, // Use v2 API
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
      const formValues = propertyForm.getFieldsValue();
      return { 
        ...formValues,
        ...payload, 
        landlordId,
        mortgageStartDate: formValues.mortgageStartDate 
          ? formatDateForAPI(formValues.mortgageStartDate)
          : undefined,
        unitFinancials: unitFinancials && unitFinancials.length > 0 ? unitFinancials : undefined
      };
    },
    onBeforeUpdate: (payload) => {
      const allValues = propertyForm.getFieldsValue();
      let finalUnitFinancials = unitFinancials;
      
      if (!finalUnitFinancials || finalUnitFinancials.length === 0) {
        const existingUnits = pinaka.selectedItem?.units || [];
        if (existingUnits.length > 0) {
          finalUnitFinancials = initializeUnitFinancials(unitCount, existingUnits);
        }
      }
      
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
        }
      }
      
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

  // Unified search across properties and units
  const searchInPropertiesAndUnits = (item, searchValue) => {
    const lowerSearch = searchValue.toLowerCase();
    
    const propertyMatch = [
      item.propertyName,
      item.addressLine1,
      item.addressLine2,
      item.city,
      item.postalZip,
      item.propertyType
    ].some(field => field?.toLowerCase().includes(lowerSearch));

    const unitMatch = item.units?.some(unit =>
      >{
        unit.unitName,
        unit.floorNumber?.toString(),
        unit.status,
        unit.bedrooms?.toString(),
        unit.bathrooms?.toString()
      ].some(field => field?.toLowerCase().includes(lowerSearch))
    );

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
      prefix: <HiCog className="h-5 w-5" />,
    },
    {
      title: 'Units',
      value: allUnits.length,
      prefix: <HiHome className="h-5 w-5" />,
      valueStyle: { color: '#722ed1' },
    },
    {
      title: 'Occupied',
      value: occupiedUnits,
      prefix: <HiCheckCircle className="h-5 w-5" />,
      valueStyle: { color: '#52c41a' },
    },
    {
      title: 'Vacant',
      value: vacantUnits,
      prefix: <HiHome className="h-5 w-5" />,
      valueStyle: { color: '#faad14' },
    },
  ];

  // Auto-open add modal if action=add in URL
  useEffect(() => {
    if (searchParams.get("action") === "add") {
      handleAddPropertyClick();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const actualUnitCount = property.units?.length || 0;
    const count = actualUnitCount > 0 ? actualUnitCount : (property.unitCount || 1);
    setUnitCount(count);
    
    let mappedPropertyType = property.propertyType || null;
    if (mappedPropertyType === 'Multi-Unit') {
      mappedPropertyType = 'Multi-family';
    }
    setSelectedPropertyType(mappedPropertyType);
    
    const financials = initializeUnitFinancials(count, property.units || []);
    setUnitFinancials(financials);
    
    // Format mortgageStartDate for date input
    let mortgageStartDateValue = undefined;
    if (property.mortgageStartDate) {
      const date = new Date(property.mortgageStartDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      mortgageStartDateValue = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    
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
      mortgageStartDate: mortgageStartDateValue,
      paymentFrequency: property.paymentFrequency || 'biweekly',
      rent: property.rent || undefined,
      depositAmount: property.depositAmount || undefined,
      rented: property.rented || "No",
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
    unitForm.resetFields();
    unitForm.setFieldsValue({
      propertyId: property.id,
      status: "Vacant",
    });
    openUnitModalForCreate();
  };

  const handleEditUnitClick = (unit, property) => {
    setSelectedPropertyForUnit(property);
    openUnitModalForEdit(unit);
    
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
  };

  const handleDeleteUnit = async (unitId) => {
    try {
      const property = pinaka.data?.find(p => p.units?.some(u => u.id === unitId));
      if (!property) {
        notify.error('Property not found for this unit');
        return;
      }

      await deleteUnit.mutateAsync(unitId);
      notify.success('Unit deleted successfully');
      pinaka.refresh();
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

      const payload = {
        ...values,
        floorNumber: values.floorNumber !== undefined && values.floorNumber !== null && values.floorNumber !== '' 
          ? Number(values.floorNumber) 
          : null,
      };

      if (editingUnit && editingUnit.id) {
        await updateUnit.mutateAsync({
          id: editingUnit.id,
          data: {
            ...payload,
            property_id: propertyId,
          }
        });
        notify.success('Unit updated successfully');
      } else {
        await createUnit.mutateAsync({
          ...payload,
          property_id: propertyId,
        });
        notify.success('Unit added successfully');
      }

      closeUnitModal();
      unitForm.resetFields();
      setSelectedPropertyForUnit(null);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      await pinaka.refresh();
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('[Unit Submit] Error:', error);
      notify.error(error.message || 'Failed to save unit');
    }
  };

  const handleCloseUnit = () => {
    closeUnitModal();
    unitForm.resetFields();
    setSelectedPropertyForUnit(null);
  };

  const getStatusBadgeColor = (status, hasActiveLease) => {
    if (hasActiveLease) return "success";
    switch (status) {
      case "Occupied":
        return "success";
      case "Vacant":
        return "warning";
      case "Under Maintenance":
        return "failure";
      default:
        return "gray";
    }
  };

  // ========== EXPANDABLE ROW: UNITS TABLE ==========
  
  const expandedRowRender = (property) => {
    const units = property.units || [];

    const unitColumns = [
      {
        title: 'Unit #',
        dataIndex: 'unitName',
        key: 'unitName',
        width: 120,
        sorter: (a, b) => (a.unitName || '').localeCompare(b.unitName || ''),
        render: (name) => <span className="font-semibold">{name}</span>,
      },
      {
        title: 'Floor(s)',
        dataIndex: 'floorNumber',
        key: 'floorNumber',
        width: 80,
        align: 'center',
        sorter: (a, b) => (a.floorNumber ?? 0) - (b.floorNumber ?? 0),
        render: (floor) => <span>{floor !== null && floor !== undefined ? floor.toString() : "-"}</span>,
      },
      {
        title: 'Beds',
        dataIndex: 'bedrooms',
        key: 'bedrooms',
        width: 80,
        align: 'center',
        sorter: (a, b) => (a.bedrooms || 0) - (b.bedrooms || 0),
        render: (beds) => <span>{beds || "-"}</span>,
      },
      {
        title: 'Baths',
        dataIndex: 'bathrooms',
        key: 'bathrooms',
        width: 80,
        align: 'center',
        sorter: (a, b) => (a.bathrooms || 0) - (b.bathrooms || 0),
        render: (baths) => <span>{baths || "-"}</span>,
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
        ) : <span className="text-gray-400">-</span>,
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
        ) : <span className="text-gray-400">-</span>,
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
          return <Badge color={getStatusBadgeColor(unit.status, hasActiveLease)}displayStatus}</Badge>;
        },
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 120,
        fixed: 'right',
        render: (_, unit) => (
          <div className="flex items-center gap-2">
            <ActionButton
              action="edit"
              size="small"
              onClick={() => handleEditUnitClick(unit, property)}
              tooltip="Edit Unit"
            />
            <FlowbitePopconfirm
              title="Delete unit?"
              description="This will also delete all associated leases and data."
              onConfirm={() => handleDeleteUnit(unit.id)}
              okText="Yes"
              cancelText="No"
              danger={true}
            >
              <ActionButton
                action="delete"
                size="small"
                tooltip="Delete Unit"
              />
            </FlowbitePopconfirm>
          </div>
        ),
      },
    ];

    if (units.length === 0) {
      return (
        <div className="p-6 text-center bg-gray-50 border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">No units yet</p>
          <ActionButton
            action="add"
            onClick={() => handleAddUnitClick(property)}
            tooltip="Add Unit"
          />
        </div>
      );
    }

    return (
      <div className="px-12 pb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-600">
            <strong>{units.length}</strong> {units.length === 1 ? 'unit' : 'units'} in this property
          </span>
          <ActionButton
            action="add"
            onClick={() => handleAddUnitClick(property)}
            tooltip="Add Unit"
            size="small"
          />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <Table.Head>
              {unitColumns.map((col, idx) => (
                <Table.HeadCell key={idx} className={col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''}>
                  {col.title}
                </Table.HeadCell>
              ))}
            </Table.Head>
            <Table.Body className="divide-y">
              {units.map((unit) => (
                <Table.Row 
                  key={unit.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onDoubleClick={() => handleEditUnitClick(unit, property)}
                >
                  {unitColumns.map((col, colIdx) => (
                    <Table.Cell key={colIdx} className={col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''}>
                      {col.render ? col.render(unit[col.dataIndex], unit, 0) : unit[col.dataIndex]}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </div>
    );
  };

  // ========== PROPERTY TABLE COLUMNS ==========
  
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
          <span className="text-gray-400">No active leases</span>
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
            <span>
              <span className="font-semibold">{occupiedUnits} / {totalUnits}</span>
              {' '}
              <span className="text-gray-500">occupied</span>
            </span>
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
        <div className="flex items-center gap-2">
          <ActionButton
            action="edit"
            onClick={() => handleEditPropertyClick(property)}
            tooltip="Edit Property"
          />
          <FlowbitePopconfirm
            title="Delete property?"
            description="This will also delete all associated units and data."
            onConfirm={() => pinaka.remove(property.id, property)}
            okText="Yes"
            cancelText="No"
            danger={true}
          >
            <ActionButton
              action="delete"
              tooltip="Delete Property"
            />
          </FlowbitePopconfirm>
        </div>
      ),
    }),
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
    storageKey: 'landlord-properties-units-table',
  });

  // ========== PROPERTY FORM TABS ==========
  
  const getFilteredPropertyTypes = () => {
    const excludedTypes = ['Duplex', 'Triplex', 'Fourplex'];
    return pinaka.countryRegion.getPropertyTypes().filter(type => !excludedTypes.includes(type));
  };
  
  const propertyInfoTab = (
    <div className="py-1 space-y-4">
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-4">
          <div>
            <Label htmlFor="propertyName" className="mb-2">Property Name</Label>
            <TextInput
              id="propertyName"
              name="propertyName"
              placeholder="e.g., Maple Street"
              autoComplete="off"
              value={propertyForm.values.propertyName || ''}
              onChange={(e) => propertyForm.setFieldsValue({ propertyName: e.target.value })}
            />
          </div>
        </div>

        <div className="col-span-4">
          <div>
            <Label htmlFor="propertyType" className="mb-2">
              Property Type <span className="text-red-500">*</span>
            </Label>
            <Select
              id="propertyType"
              name="propertyType"
              placeholder="Select type"
              value={selectedPropertyType || propertyForm.values.propertyType || ''}
              onChange={(value) => {
                setSelectedPropertyType(value);
                propertyForm.setFieldsValue({ propertyType: value });
                if (value === 'Single-family' || value === 'Townhouse') {
                  propertyForm.setFieldsValue({ unitCount: 1 });
                  setUnitCount(1);
                  const existingUnits = pinaka.selectedItem?.units || [];
                  const financials = initializeUnitFinancials(1, existingUnits);
                  setUnitFinancials(financials);
                }
              }}
              required
            >
              <option value="">Select type</option>
              {getFilteredPropertyTypes().map(type => (
                <option key={type} value={type}type}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="col-span-4">
          <div>
            <Label htmlFor="unitCount" className="mb-2">Number of Units</Label>
            <TextInput
              id="unitCount"
              name="unitCount"
              type="number"
              min={1}
              placeholder="1"
              value={propertyForm.values.unitCount || 1}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                propertyForm.setFieldsValue({ unitCount: value });
                handleUnitCountChange(value);
              }}
              disabled={!selectedPropertyType || selectedPropertyType === 'Single-family' || selectedPropertyType === 'Townhouse'}
            />
          </div>
        </div>

        <div className="col-span-8">
          <div>
            <Label htmlFor="addressLine1" className="mb-2">
              Street Address <span className="text-red-500">*</span>
              <Tooltip content="Start typing an address to see autocomplete suggestions">
                <span className="ml-1 text-gray-400 cursor-help">ℹ️</span>
              </Tooltip>
            </Label>
            <AddressAutocomplete
              placeholder="Type an address (e.g., 123 Main St, Toronto)"
              country={pinaka.country === 'CA' ? 'CA,US' : pinaka.country === 'US' ? 'CA,US' : 'CA,US'}
              value={propertyForm.values.addressLine1 || ''}
              onSelect={(addressData) => {
                const countryCode = addressData.country;
                
                if (countryCode === 'CA' || countryCode === 'US') {
                  pinaka.setCountry(countryCode);
                  
                  setTimeout(() => {
                    propertyForm.setFieldsValue({
                      addressLine1: addressData.addressLine1,
                      city: addressData.city,
                      provinceState: addressData.provinceState,
                      postalZip: addressData.postalZip,
                      country: countryCode,
                    });
                  }, 50);
                } else {
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
              placeholder="City"
              value={propertyForm.values.city || ''}
              onChange={(e) => propertyForm.setFieldsValue({ city: e.target.value })}
              required
              color={propertyForm.errors.city ? 'failure' : 'gray'}
              helperText={propertyForm.errors.city}
            />
          </div>
        </div>

        <div className="col-span-3">
          <div>
            <Label htmlFor="provinceState" className="mb-2">
              {pinaka.countryRegion.getRegionLabel(pinaka.country)} <span className="text-red-500">*</span>
            </Label>
            <Select
              id="provinceState"
              name="provinceState"
              placeholder="Select"
              value={propertyForm.values.provinceState || 'ON'}
              onChange={(e) => propertyForm.setFieldsValue({ provinceState: e.target.value })}
              required
            >
              <option value="">Select</option>
              {pinaka.countryRegion.getRegionsByCountry(pinaka.country).map(region => (
                <option key={region.code} value={region.code}region.code}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="col-span-3">
          <div>
            <Label htmlFor="postalZip" className="mb-2">
              {pinaka.countryRegion.getPostalLabel(pinaka.country)} <span className="text-red-500">*</span>
            </Label>
            <PostalCodeInput 
              country={pinaka.country} 
              value={propertyForm.values.postalZip || ''}
              onChange={(e) => propertyForm.setFieldsValue({ postalZip: e.target.value })}
            />
          </div>
        </div>

        <div className="col-span-3">
          <div>
            <Label htmlFor="country" className="mb-2">
              Country <span className="text-red-500">*</span>
            </Label>
            <Select
              id="country"
              name="country"
              value={propertyForm.values.country || 'CA'}
              onChange={(e) => {
                const value = e.target.value;
                pinaka.setCountry(value);
                const defaultRegion = value === 'CA' ? 'ON' : value === 'US' ? 'NJ' : undefined;
                propertyForm.setFieldsValue({ 
                  country: value,
                  provinceState: defaultRegion 
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

        <div className="col-span-3">
          <div>
            <Label htmlFor="squareFootage" className="mb-2">SQ. Ft.</Label>
            <div className="flex">
              <TextInput
                id="squareFootage"
                name="squareFootage"
                type="number"
                min={0}
                placeholder="1500"
                value={propertyForm.values.squareFootage || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, '');
                  propertyForm.setFieldsValue({ squareFootage: value ? parseInt(value) : undefined });
                }}
                className="rounded-r-none"
              />
              <span className="px-3 py-2 text-sm text-gray-500 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg flex items-center">
                sq ft
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="propertyDescription" className="mb-2">Notes</Label>
        <Textarea
          id="propertyDescription"
          name="propertyDescription"
          rows={2}
          placeholder="Additional details or notes (optional)"
          maxLength={500}
          value={propertyForm.values.propertyDescription || ''}
          onChange={(e) => propertyForm.setFieldsValue({ propertyDescription: e.target.value })}
        />
        <p className="mt-1 text-sm text-gray-500">
          {(propertyForm.values.propertyDescription || '').length} / 500 characters
        </p>
      </div>
    </div>
  );

  const unitsTab = (
    <div className="py-2">
      {unitFinancials.length === 0 ? (
        <div className="p-10 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg bg-gray-50">
          <p className="text-sm">Set number of units in Property Info tab</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <Table.Head>
              <Table.HeadCell className="text-center">Unit</Table.HeadCell>
              <Table.HeadCell className="text-center">Floor(s)</Table.HeadCell>
              <Table.HeadCell className="text-center">Beds</Table.HeadCell>
              <Table.HeadCell className="text-center">Baths</Table.HeadCell>
              <Table.HeadCell className="text-center">Rent</Table.HeadCell>
              <Table.HeadCell className="text-center">Deposit</Table.HeadCell>
              <Table.HeadCell className="text-center">Status</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {unitFinancials.map((unit) => (
                <Table.Row key={unit.unitNumber}>
                  <Table.Cell className="text-center">
                    <TextInput
                      value={unit.unitName}
                      onChange={(e) => updateUnitFinancial(unit.unitNumber, 'unitName', e.target.value)}
                      placeholder="101"
                      autoComplete="off"
                      className="text-center"
                    />
                  </Table.Cell>
                  <Table.Cell className="text-center">
                    <TextInput
                      type="number"
                      min={0}
                      max={99}
                      value={unit.floorNumber || ''}
                      onChange={(e) => updateUnitFinancial(unit.unitNumber, 'floorNumber', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="1"
                      className="text-center"
                    />
                  </Table.Cell>
                  <Table.Cell className="text-center">
                    <TextInput
                      type="number"
                      min={0}
                      value={unit.bedrooms || ''}
                      onChange={(e) => updateUnitFinancial(unit.unitNumber, 'bedrooms', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="2"
                      className="text-center"
                    />
                  </Table.Cell>
                  <Table.Cell className="text-center">
                    <TextInput
                      type="number"
                      min={0}
                      step={0.5}
                      value={unit.bathrooms || ''}
                      onChange={(e) => updateUnitFinancial(unit.unitNumber, 'bathrooms', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="1"
                      className="text-center"
                    />
                  </Table.Cell>
                  <Table.Cell className="text-center">
                    <CurrencyInput
                      country={pinaka.country}
                      value={unit.rentPrice}
                      onChange={(val) => updateUnitFinancial(unit.unitNumber, 'rentPrice', val)}
                      placeholder="0.00"
                      className="w-full"
                    />
                  </Table.Cell>
                  <Table.Cell className="text-center">
                    <CurrencyInput
                      country={pinaka.country}
                      value={unit.depositAmount}
                      onChange={(val) => updateUnitFinancial(unit.unitNumber, 'depositAmount', val)}
                      placeholder="0.00"
                      className="w-full"
                    />
                  </Table.Cell>
                  <Table.Cell className="text-center">
                    <Select
                      value={unit.status}
                      onChange={(e) => updateUnitFinancial(unit.unitNumber, 'status', e.target.value)}
                      className="w-full"
                    >
                      <option value="Vacant">Vacant</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Under Maintenance">Maintenance</option>
                    </Select>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}
    </div>
  );

  const financialTab = (
    <div className="py-1 space-y-4">
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-3">
          <div>
            <Label htmlFor="yearBuilt" className="mb-2">Year Built</Label>
            <TextInput
              id="yearBuilt"
              name="yearBuilt"
              type="number"
              min={1800}
              max={new Date().getFullYear()}
              placeholder="2015"
              value={propertyForm.values.yearBuilt || ''}
              onChange={(e) => propertyForm.setFieldsValue({ yearBuilt: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>
        </div>

        <div className="col-span-3">
          <div>
            <Label htmlFor="purchasePrice" className="mb-2">Purchase Price</Label>
            <CurrencyInput
              country={pinaka.country}
              value={propertyForm.values.purchasePrice}
              onChange={(value) => propertyForm.setFieldsValue({ purchasePrice: value })}
              placeholder="0.00"
              className="w-full"
            />
          </div>
        </div>

        <div className="col-span-3">
          <div>
            <Label htmlFor="mortgageAmount" className="mb-2">Mortgage Amount</Label>
            <CurrencyInput
              country={pinaka.country}
              value={propertyForm.values.mortgageAmount}
              onChange={(value) => propertyForm.setFieldsValue({ mortgageAmount: value })}
              placeholder="0.00"
              className="w-full"
            />
          </div>
        </div>

        <div className="col-span-3">
          <div>
            <Label htmlFor="propertyTaxes" className="mb-2">Annual Taxes</Label>
            <CurrencyInput
              country={pinaka.country}
              value={propertyForm.values.propertyTaxes}
              onChange={(value) => propertyForm.setFieldsValue({ propertyTaxes: value })}
              placeholder="0.00"
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-3">
          <div>
            <Label htmlFor="mortgageStartDate" className="mb-2">Start Date</Label>
            <TextInput
              id="mortgageStartDate"
              name="mortgageStartDate"
              type="date"
              value={propertyForm.values.mortgageStartDate || ''}
              onChange={(e) => propertyForm.setFieldsValue({ mortgageStartDate: e.target.value })}
            />
          </div>
        </div>

        <div className="col-span-3">
          <div>
            <Label htmlFor="interestRate" className="mb-2">Interest Rate</Label>
            <div className="flex">
              <TextInput
                id="interestRate"
                name="interestRate"
                type="number"
                min={0}
                max={100}
                step={0.01}
                placeholder="5.25"
                value={propertyForm.values.interestRate || ''}
                onChange={(e) => propertyForm.setFieldsValue({ interestRate: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="rounded-r-none"
              />
              <span className="px-3 py-2 text-sm text-gray-500 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg flex items-center">
                %
              </span>
            </div>
          </div>
        </div>

        <div className="col-span-3">
          <div>
            <Label htmlFor="mortgageTermYears" className="mb-2">Term</Label>
            <div className="flex">
              <TextInput
                id="mortgageTermYears"
                name="mortgageTermYears"
                type="number"
                min={1}
                max={50}
                placeholder="25"
                value={propertyForm.values.mortgageTermYears || ''}
                onChange={(e) => propertyForm.setFieldsValue({ mortgageTermYears: e.target.value ? parseInt(e.target.value) : undefined })}
                className="rounded-r-none"
              />
              <span className="px-3 py-2 text-sm text-gray-500 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg flex items-center">
                years
              </span>
            </div>
          </div>
        </div>

        <div className="col-span-3">
          <div>
            <Label htmlFor="paymentFrequency" className="mb-2">Payment Frequency</Label>
            <Select
              id="paymentFrequency"
              name="paymentFrequency"
              value={propertyForm.values.paymentFrequency || 'biweekly'}
              onChange={(e) => propertyForm.setFieldsValue({ paymentFrequency: e.target.value })}
            >
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const values = propertyForm.getFieldsValue();
      await pinaka.handleSubmit(values);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  // Handle unit form submission
  const handleUnitFormSubmit = async (e) => {
    e.preventDefault();
    const values = unitForm.getFieldsValue();
    await handleUnitSubmit(values);
  };

  return (
    <PageLayout
      headerTitle={
        <div className="flex items-center gap-2">
          <HiCog className="h-5 w-5" />
          <span>Properties</span>
        </div>
      }
      headerActions={
        <Button
          key="add"
          color="blue"
          onClick={handleAddPropertyClick}
          className="flex items-center gap-2"
        >
          <HiPlus className="h-4 w-4" />
          Add Property
        </Button>,
        <Button
          key="refresh"
          color="gray"
          onClick={() => {
            pinaka.refresh();
            notify.success('Refreshed properties and units');
          }}
          className="flex items-center gap-2"
        >
          <HiRefresh className="h-4 w-4" />
          Refresh
        </Button>,
      }
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
          icon={<HiHome className="h-12 w-12 text-gray-400" />}
          title="No properties yet"
          description="Click 'Add Property' to add your first property"
        />
      ) : (
        <TableWrapper>
          <ExpandableFlowbiteTable
            {...tableProps}
            dataSource={filteredData}
            rowKey="id"
            loading={pinaka.loading}
            pagination={{
              pageSize: 25,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} properties`,
            }}
            expandedRowRender={expandedRowRender}
            expandedRowKeys={expandedRowKeys}
            onExpandedRowsChange={setExpandedRowKeys}
            onRow={(record) => ({
              onDoubleClick: () => handleEditPropertyClick(record),
              style: { cursor: 'pointer' }
            })}
          />
        </TableWrapper>
      )}

      {/* Property Modal */}
      <Modal
        show={pinaka.isOpen}
        onClose={handleCloseProperty}
        size="4xl"
      >
        <Modal.Header>{pinaka.isEditing ? "Edit Property" : "Add Property"}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <Tabs aria-label="Property form tabs">
              <Tabs.Item active title="Property Info">
                {propertyInfoTab}
              </Tabs.Item>
              
              <Tabs.Item title="Units">
                {unitsTab}
              </Tabs.Item>
              
              <Tabs.Item title="Financial Details">
                {financialTab}
              </Tabs.Item>
            </Tabs>

            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
              {pinaka.renderFormButtons()}
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Unit Modal */}
      <Modal
        show={unitModalVisible}
        onClose={handleCloseUnit}
        size="md"
      >
        <Modal.Header>{editingUnit ? "Edit Unit" : "Add Unit"}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleUnitFormSubmit} className="space-y-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <div>
              <Label htmlFor="unit-propertyId" className="mb-2">
                Property Name <span className="text-red-500">*</span>
              </Label>
              <Select
                id="unit-propertyId"
                name="propertyId"
                value={unitForm.values.propertyId || selectedPropertyForUnit?.id || ''}
                disabled
                required
              >
                <option value={selectedPropertyForUnit?.id}>
                  {selectedPropertyForUnit?.propertyName || selectedPropertyForUnit?.addressLine1}
                </option>
              </Select>
            </div>
          </div>
          <div className="col-span-6">
            <div>
              <Label htmlFor="unit-unitName" className="mb-2">
                Unit Number <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id="unit-unitName"
                name="unitName"
                placeholder="e.g., 101"
                autoComplete="off"
                value={unitForm.values.unitName || ''}
                onChange={(e) => unitForm.setFieldsValue({ unitName: e.target.value })}
                required
                color={unitForm.errors.unitName ? 'failure' : 'gray'}
                helperText={unitForm.errors.unitName}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 mt-4">
          <div className="col-span-4">
            <div>
              <Label htmlFor="unit-floorNumber" className="mb-2">Floor(s)</Label>
              <TextInput
                id="unit-floorNumber"
                name="floorNumber"
                type="number"
                min={0}
                max={99}
                placeholder="e.g., 1"
                value={unitForm.values.floorNumber || ''}
                onChange={(e) => unitForm.setFieldsValue({ floorNumber: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>
          </div>
          <div className="col-span-4">
            <div>
              <Label htmlFor="unit-bedrooms" className="mb-2">Bedrooms</Label>
              <TextInput
                id="unit-bedrooms"
                name="bedrooms"
                type="number"
                min={0}
                max={20}
                placeholder="e.g., 2"
                value={unitForm.values.bedrooms || ''}
                onChange={(e) => unitForm.setFieldsValue({ bedrooms: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>
          </div>
          <div className="col-span-4">
            <div>
              <Label htmlFor="unit-bathrooms" className="mb-2">Bathrooms</Label>
              <TextInput
                id="unit-bathrooms"
                name="bathrooms"
                type="number"
                min={0}
                max={10}
                step={0.5}
                placeholder="e.g., 2.0"
                value={unitForm.values.bathrooms || ''}
                onChange={(e) => unitForm.setFieldsValue({ bathrooms: e.target.value ? parseFloat(e.target.value) : null })}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 mt-4">
          <div className="col-span-4">
            <div>
              <Label htmlFor="unit-rentPrice" className="mb-2">Rent</Label>
              <CurrencyInput 
                country={selectedPropertyForUnit?.country || 'CA'} 
                value={unitForm.values.rentPrice}
                onChange={(value) => unitForm.setFieldsValue({ rentPrice: value })}
                placeholder="0.00"
                className="w-full"
              />
            </div>
          </div>
          <div className="col-span-4">
            <div>
              <Label htmlFor="unit-depositAmount" className="mb-2">Security Deposit</Label>
              <CurrencyInput 
                country={selectedPropertyForUnit?.country || 'CA'} 
                value={unitForm.values.depositAmount}
                onChange={(value) => unitForm.setFieldsValue({ depositAmount: value })}
                placeholder="0.00"
                className="w-full"
              />
            </div>
          </div>
          <div className="col-span-4">
            <div>
              <Label htmlFor="unit-status" className="mb-2">Status</Label>
              <Select
                id="unit-status"
                name="status"
                value={unitForm.values.status || 'Vacant'}
                onChange={(e) => unitForm.setFieldsValue({ status: e.target.value })}
              >
                {UNIT_STATUSES.map(status => (
                  <option key={status} value={status}status}</option>
                ))}
              </Select>
            </div>
          </div>
        </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button color="gray" onClick={handleCloseUnit}>
                Cancel
              </Button>
              <Button type="submit" color="blue">
                {editingUnit ? "Save" : "Add"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </PageLayout>
  );
});

PropertiesWithUnitsClient.displayName = 'PropertiesWithUnitsClient';

export default PropertiesWithUnitsClient;
