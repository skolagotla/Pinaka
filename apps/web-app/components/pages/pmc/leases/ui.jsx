"use client";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Button, Modal, Select, TextInput, Label, Textarea, Badge, Tooltip, Radio, Alert
} from 'flowbite-react';
import { 
  HiPlus, 
  HiPencil, 
  HiTrash, 
  HiDocumentText, 
  HiSave, 
  HiX, 
  HiCheckCircle, 
  HiClock, 
  HiRefresh
} from 'react-icons/hi';
import { PageLayout, EmptyState, TableWrapper, StandardModal, FormTextInput, FormSelect, FormDatePicker, FormPhoneInput, renderDate, DeleteConfirmButton } from '@/components/shared';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import { renderStatus } from '@/components/shared/FlowbiteTableRenderers';
import dayjs from 'dayjs';
import { formatDateForAPI } from '@/lib/utils/safe-date-formatter';

// Custom Hooks
import { usePinakaCRUD } from '@/lib/hooks/usePinakaCRUD';
import { useResizableTable, withSorter, sortFunctions, configureTableColumns } from '@/lib/hooks';
import { useFormState } from '@/lib/hooks/useFormState';

// Constants
import { LEASE_STATUSES } from '@/lib/constants/statuses';

// Rules Engine Components
import CurrencyInput from '@/components/rules/CurrencyInput';
import CurrencyDisplay from '@/components/rules/CurrencyDisplay';
import { STANDARD_COLUMNS, COLUMN_NAMES, customizeColumn } from '@/lib/constants/standard-columns';
import { rules } from '@/lib/utils/validation-rules';

export default function PMCLeasesClient({ units, tenants, initialLeases }) {
  const searchParams = useSearchParams();
  const form = useFormState();
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedTenantIds, setSelectedTenantIds] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // Ensure units and tenants are arrays (safety check)
  const safeUnits = Array.isArray(units) ? units : [];
  const safeTenants = Array.isArray(tenants) ? tenants : [];

  // 🎯 PINAKA UNIFIED HOOK (v1 API)
  const pinaka = usePinakaCRUD({
    apiEndpoint: '/api/v1/leases', // v1 endpoint
    domain: 'leases', // Domain name for v1Api
    useV1Api: true, // Use v1Api client
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

  const [searchTerm, setSearchTerm] = useState('');

  const handleAddClick = () => {
    setSelectedUnit(null);
    setSelectedTenantIds([]);
    setIsEditing(false);
    form.resetFields();
    form.setFieldsValue({ status: "Active", rentDueDay: 1 });
    pinaka.openAdd();
  };

  // Search filter
  const filteredData = useMemo(() => {
    if (!searchTerm) return pinaka.data;
    const searchLower = searchTerm.toLowerCase();
    return pinaka.data.filter(lease => {
      const searchFields = [
        lease.unit?.unitName,
        lease.unit?.property?.propertyName,
        lease.unit?.property?.addressLine1,
        lease.status,
        ...(lease.leaseTenants || []).map(lt => lt.tenant?.firstName),
        ...(lease.leaseTenants || []).map(lt => lt.tenant?.lastName),
      ];
      return searchFields.some(field => field?.toLowerCase().includes(searchLower));
    });
  }, [pinaka.data, searchTerm]);

  const statsData = [
    {
      title: 'Leases',
      value: pinaka.data.length,
      prefix: <HiDocumentText className="h-5 w-5" />,
    },
    {
      title: 'Active',
      value: pinaka.data.filter(l => l.status === 'Active').length,
      prefix: <HiCheckCircle className="h-5 w-5" />,
      valueStyle: { color: '#52c41a' },
    },
    {
      title: 'Expired',
      value: pinaka.data.filter(l => l.status === 'Expired').length,
      prefix: <HiClock className="h-5 w-5" />,
      valueStyle: { color: '#faad14' },
    },
  ];

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      handleAddClick();
    }
  }, []);

  const availableTenants = selectedUnit 
    ? tenants.filter(t => !t.hasActiveLease || isEditing)
    : tenants;

  function handleEditClick(lease) {
    const unit = safeUnits.find(u => u.id === lease.unitId);
    setSelectedUnit(unit);
    
    const tenantIds = lease.leaseTenants?.map(lt => lt.tenantId) || [];
    const primaryTenant = lease.leaseTenants?.find(lt => lt.isPrimaryTenant);
    
    setSelectedTenantIds(tenantIds);
    setIsEditing(true);
    
    const leaseStartDate = lease.leaseStart ? (() => {
      const date = new Date(lease.leaseStart);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    })() : '';
    
    const leaseEndDate = lease.leaseEnd ? (() => {
      const date = new Date(lease.leaseEnd);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    })() : '';
    
    form.setFieldsValue({
      unitId: lease.unitId,
      tenantIds: tenantIds,
      primaryTenantId: primaryTenant?.tenantId || tenantIds[0] || null,
      leaseStart: leaseStartDate,
      leaseEnd: leaseEndDate,
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
    setIsEditing(false);
  }

  const getUnitName = (unitId) => {
    const unit = safeUnits.find(u => u.id === unitId);
    return unit?.unitName || "—";
  };

  const getPropertyName = (unitId) => {
    const unit = safeUnits.find(u => u.id === unitId);
    return unit?.property?.propertyName || unit?.property?.addressLine1 || "—";
  };

  const getTenantNames = (leaseTenants) => {
    if (!leaseTenants || leaseTenants.length === 0) return "—";
    
    const sortedTenants = [...leaseTenants].sort((a, b) => {
      if (a.isPrimaryTenant) return -1;
      if (b.isPrimaryTenant) return 1;
      return 0;
    });
    
    return sortedTenants
      .map(lt => {
        const tenant = tenants.find(t => t.id === lt.tenantId);
        if (!tenant) return null;
        const name = `${tenant.firstName} ${tenant.lastName}`;
        return lt.isPrimaryTenant ? `${name} (Primary)` : name;
      })
      .filter(Boolean)
      .join(", ");
  };

  const columns = [
    customizeColumn(STANDARD_COLUMNS.UNIT_NAME, {
      key: 'unit',
      render: (_, lease) => {
        const unit = safeUnits.find(u => u.id === lease.unitId);
        const property = unit?.property;
        
        if (!property) return <span>—</span>;
        
        const propertyName = property.propertyName || property.addressLine1;
        
        if (property.unitCount === 1) {
          return <span>{propertyName}</span>;
        }
        
        const unitName = unit?.unitName || '';
        return <span>{unitName} - {propertyName}</span>;
      },
    }),
    customizeColumn(STANDARD_COLUMNS.TENANT_NAME, {
      key: 'tenants',
      render: (_, lease) => <span>{getTenantNames(lease.leaseTenants)}</span>,
    }),
    withSorter(
      customizeColumn(STANDARD_COLUMNS.START_DATE, {
        render: (_, lease) => renderDate(lease.leaseStart),
      }),
      sortFunctions.date('leaseStart')
    ),
    customizeColumn(STANDARD_COLUMNS.END_DATE, {
      render: (_, lease) => lease.leaseEnd ? renderDate(lease.leaseEnd) : <span className="text-gray-400">Month-to-month</span>,
    }),
    withSorter(
      customizeColumn(STANDARD_COLUMNS.MONTHLY_RENT, {
        dataIndex: 'rentAmount',
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
    withSorter(
      customizeColumn(STANDARD_COLUMNS.DUE_DATE, {
        dataIndex: 'rentDueDay',
        render: (day) => {
          if (!day) return <span className="text-gray-400">-</span>;
          const suffix = 
            day === 1 || day === 21 || day === 31 ? 'st' :
            day === 2 || day === 22 ? 'nd' :
            day === 3 || day === 23 ? 'rd' : 'th';
          return <span>{day}{suffix} of the Month</span>;
        },
      }),
      sortFunctions.number('rentDueDay')
    ),
    customizeColumn(STANDARD_COLUMNS.STATUS, {
      render: (status) => renderStatus(status, {
        customColors: {
          'Active': 'success',
          'Expired': 'warning',
          'Terminated': 'failure',
          'MonthToMonth': 'info'
        }
      }),
    }),
    customizeColumn(STANDARD_COLUMNS.ACTIONS, {
      render: (_, lease) => (
        <div className="flex items-center gap-2">
          <Tooltip content="Edit Lease">
            <Button
              color="gray"
              size="sm"
              onClick={() => handleEditClick(lease)}
              title="Edit Lease"
            >
              <HiPencil className="h-4 w-4" />
            </Button>
          </Tooltip>
          <DeleteConfirmButton
            entityName="lease"
            description="This will also delete all associated rent payments."
            onConfirm={() => handleDelete(lease)}
            buttonProps={{ title: "Delete Lease" }}
          />
        </div>
      ),
    }),
  ];

  const configuredColumns = configureTableColumns(columns, {
    addSorting: false,
    centerAlign: true,
    addWidths: false,
  });

  const { tableProps } = useResizableTable(configuredColumns, {
    defaultSort: { field: 'leaseStart', order: 'descend' },
    storageKey: 'pmc-leases-table',
  });

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const values = form.getFieldsValue();
    
    // Convert dates
    const payload = {
      ...values,
      leaseStart: values.leaseStart ? formatDateForAPI(values.leaseStart) : null,
      leaseEnd: values.leaseEnd ? formatDateForAPI(values.leaseEnd) : null,
      primaryTenantId: values.primaryTenantId || (values.tenantIds?.[0] || null),
    };
    
    await pinaka.handleSubmit(payload);
  };

  return (
    <PageLayout
      headerTitle={
        <div className="flex items-center gap-2">
          <HiDocumentText className="h-5 w-5" />
          <span>Leases</span>
        </div>
      }
      headerActions={[
        <Button
          key="add"
          color="blue"
          onClick={handleAddClick}
          className="flex items-center gap-2"
        >
          <HiPlus className="h-4 w-4" />
          Add Lease
        </Button>,
        <Button
          key="refresh"
          color="gray"
          onClick={pinaka.refresh}
          className="flex items-center gap-2"
        >
          <HiRefresh className="h-4 w-4" />
          Refresh
        </Button>,
      ]}
      stats={statsData}
      statsCols={3}
      showSearch={true}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      onSearchClear={() => setSearchTerm('')}
      searchPlaceholder="Search leases by unit, property, tenant, or status..."
    >
      {pinaka.data.length === 0 ? (
        <EmptyState
          icon={<HiDocumentText className="h-8 w-8" />}
          title="No leases yet"
          description="Click 'Add Lease' to create your first lease"
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
              showSizeChanger: true
            }}
            onRow={(record) => ({
              onDoubleClick: () => handleEditClick(record),
              className: 'cursor-pointer'
            })}
          />
        </TableWrapper>
      )}

      <Modal
        show={pinaka.isOpen}
        onClose={handleClose}
        size="4xl"
      >
        <Modal.Header>
          {pinaka.isEditing ? "Edit Lease" : "Create Lease"}
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="unitId" className="mb-2">
                  Unit <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="unitId"
                  name="unitId"
                  value={form.values.unitId || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    form.setFieldsValue({ unitId: value });
                    const unit = safeUnits.find(u => u.id === value);
                    setSelectedUnit(unit);
                    form.setFieldsValue({ 
                      rentAmount: unit?.rentPrice || undefined,
                      securityDeposit: unit?.depositAmount || undefined
                    });
                  }}
                  required
                >
                  <option value="">Select unit</option>
                  {safeUnits.map(unit => {
                    const property = unit.property;
                    const propertyName = property?.propertyName || '';
                    const displayText = property?.unitCount === 1
                      ? propertyName
                      : unit.unitName ? `${unit.unitName} - ${propertyName}` : propertyName;
                    
                    return (
                      <option key={unit.id} value={unit.id}>
                        {displayText}
                      </option>
                    );
                  })}
                </Select>
              </div>
              <div>
                <Label htmlFor="status" className="mb-2">Status</Label>
                <Select
                  id="status"
                  name="status"
                  value={form.values.status || 'Active'}
                  onChange={(e) => form.setFieldsValue({ status: e.target.value })}
                >
                  {LEASE_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="tenantIds" className="mb-2">
                Tenant(s) <span className="text-red-500">*</span>
              </Label>
              <Select
                id="tenantIds"
                name="tenantIds"
                multiple
                value={Array.isArray(form.values.tenantIds) ? form.values.tenantIds : []}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  form.setFieldsValue({ tenantIds: values });
                  setSelectedTenantIds(values);
                  if (values.length === 1) {
                    form.setFieldsValue({ primaryTenantId: values[0] });
                  } else if (values.length > 1) {
                    const currentPrimary = form.values.primaryTenantId;
                    if (!values.includes(currentPrimary)) {
                      form.setFieldsValue({ primaryTenantId: values[0] });
                    }
                  } else {
                    form.setFieldsValue({ primaryTenantId: null });
                  }
                }}
                disabled={!selectedUnit}
                required
                className="w-full"
              >
                {availableTenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.firstName} {tenant.lastName} ({tenant.email})
                  </option>
                ))}
              </Select>
            </div>

            {selectedTenantIds.length > 1 && (
              <div>
                <Label htmlFor="primaryTenantId" className="mb-2">
                  Primary Tenant <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-2">
                  {selectedTenantIds.map(tenantId => {
                    const tenant = tenants.find(t => t.id === tenantId);
                    if (!tenant) return null;
                    return (
                      <div key={tenantId} className="flex items-center gap-2">
                        <Radio
                          id={`primary-${tenantId}`}
                          name="primaryTenantId"
                          value={tenantId}
                          checked={form.values.primaryTenantId === tenantId}
                          onChange={() => form.setFieldsValue({ primaryTenantId: tenantId })}
                        />
                        <Label htmlFor={`primary-${tenantId}`} className="cursor-pointer">
                          <span className="font-semibold">{tenant.firstName} {tenant.lastName}</span>
                          <span className="text-gray-500 ml-2">({tenant.email})</span>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedTenantIds.length === 1 && (
              <Alert color="info">
                <div>
                  <p className="font-semibold">Single tenant will be marked as primary by default</p>
                </div>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="leaseStart" className="mb-2">
                  Lease Start Date <span className="text-red-500">*</span>
                </Label>
                <TextInput
                  id="leaseStart"
                  name="leaseStart"
                  type="date"
                  value={form.values.leaseStart || ''}
                  onChange={(e) => form.setFieldsValue({ leaseStart: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="leaseEnd" className="mb-2">
                  Lease End Date <span className="text-red-500">*</span>
                </Label>
                <TextInput
                  id="leaseEnd"
                  name="leaseEnd"
                  type="date"
                  value={form.values.leaseEnd || ''}
                  onChange={(e) => form.setFieldsValue({ leaseEnd: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="rentAmount" className="mb-2">
                  Monthly Rent <span className="text-red-500">*</span>
                </Label>
                <CurrencyInput
                  id="rentAmount"
                  name="rentAmount"
                  country="CA"
                  value={form.values.rentAmount}
                  onChange={(value) => form.setFieldsValue({ rentAmount: value })}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="securityDeposit" className="mb-2">Security Deposit</Label>
                <CurrencyInput
                  id="securityDeposit"
                  name="securityDeposit"
                  country="CA"
                  value={form.values.securityDeposit}
                  onChange={(value) => form.setFieldsValue({ securityDeposit: value })}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="rentDueDay" className="mb-2">Due Day (of month)</Label>
                <Select
                  id="rentDueDay"
                  name="rentDueDay"
                  value={form.values.rentDueDay || ''}
                  onChange={(e) => form.setFieldsValue({ rentDueDay: e.target.value ? parseInt(e.target.value) : null })}
                >
                  <option value="">Select due day</option>
                  {[...Array(31)].map((_, index) => {
                    const day = index + 1;
                    const suffix = 
                      day === 1 || day === 21 || day === 31 ? 'st' :
                      day === 2 || day === 22 ? 'nd' :
                      day === 3 || day === 23 ? 'rd' : 'th';
                    return (
                      <option key={day} value={day}>
                        {day}{suffix} of every month
                      </option>
                    );
                  })}
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button color="gray" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                color="blue"
                type="submit"
                disabled={pinaka.loading}
                className="flex items-center gap-2"
              >
                {pinaka.loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <HiSave className="h-4 w-4" />
                    {pinaka.isEditing ? "Save" : "Create"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </PageLayout>
  );
}
