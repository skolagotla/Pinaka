"use client";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Button, Table, Badge, Modal, Select, TextInput, Label, 
  Radio, Alert, Tooltip, Spinner
} from 'flowbite-react';
import { PageLayout, EmptyState, TableWrapper, renderDate } from '@/components/shared';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import FlowbitePopconfirm from '@/components/shared/FlowbitePopconfirm';
import { useFormState } from '@/lib/hooks/useFormState';
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiDocumentText,
  HiCheckCircle,
  HiClock,
  HiRefresh,
  HiStop,
} from 'react-icons/hi';
import dayjs from 'dayjs';
import { formatDateForAPI } from '@/lib/utils/safe-date-formatter';

// Custom Hooks
import { usePinakaCRUD } from '@/lib/hooks/usePinakaCRUD';
import { useResizableTable, withSorter, sortFunctions, configureTableColumns } from '@/lib/hooks';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { FilterBar } from '@/components/shared';
import { ActionButton } from '@/components/shared/buttons';
import LeaseRenewalModal from '@/components/shared/LeaseRenewalModal';
import LeaseTerminationModal from '@/components/shared/LeaseTerminationModal';

// Constants
import { LEASE_STATUSES } from '@/lib/constants/statuses';

// Rules Engine Components
import CurrencyInput from '@/components/rules/CurrencyInput';
import CurrencyDisplay from '@/components/rules/CurrencyDisplay';
import { STANDARD_COLUMNS, COLUMN_NAMES, customizeColumn } from '@/lib/constants/standard-columns';
import { rules } from '@/lib/utils/validation-rules';
import { renderStatus } from '@/components/shared/FlowbiteTableRenderers';

export default function LeasesClient({ units, tenants, initialLeases, user }) {
  const searchParams = useSearchParams();
  const form = useFormState({ status: "Active", rentDueDay: 1 });
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedTenantIds, setSelectedTenantIds] = useState([]);
  const [selectedLease, setSelectedLease] = useState(null);
  const [renewalModalVisible, setRenewalModalVisible] = useState(false);
  const [terminationModalVisible, setTerminationModalVisible] = useState(false);
  
  // Ensure units and tenants are arrays (safety check)
  const safeUnits = Array.isArray(units) ? units : [];
  const safeTenants = Array.isArray(tenants) ? tenants : [];
  
  // Check permissions (PMC-managed landlords cannot create leases)
  const permissions = usePermissions(user || { role: 'landlord' });

  // 🎯 PINAKA UNIFIED HOOK (v2 API)
  const pinaka = usePinakaCRUD({
    apiEndpoint: '/api/v2/leases',
    domain: 'leases',
    useV1Api: false, // Use v2 API
    initialData: initialLeases,
    entityName: 'Lease',
    messages: {
      createSuccess: 'Lease created successfully',
      updateSuccess: 'Lease updated successfully',
      deleteSuccess: 'Lease deleted successfully'
    },
    defaultFormData: { status: "Active", rentDueDay: 1 },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableTenants = selectedUnit 
    ? tenants.filter(t => !t.hasActiveLease || pinaka.isEditing)
    : tenants;

  function handleAddClick() {
    setSelectedUnit(null);
    setSelectedTenantIds([]);
    form.resetFields();
    form.setFieldsValue({ status: "Active", rentDueDay: 1 });
    pinaka.openAdd();
  }

  function handleEditClick(lease) {
    const unit = safeUnits.find(u => u.id === lease.unitId);
    setSelectedUnit(unit);
    
    const tenantIds = lease.leaseTenants?.map(lt => lt.tenantId) || [];
    const primaryTenant = lease.leaseTenants?.find(lt => lt.isPrimaryTenant);
    
    setSelectedTenantIds(tenantIds);
    
    // Format dates for date inputs
    let leaseStartValue = undefined;
    let leaseEndValue = undefined;
    if (lease.leaseStart) {
      const date = new Date(lease.leaseStart);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      leaseStartValue = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    if (lease.leaseEnd) {
      const date = new Date(lease.leaseEnd);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      leaseEndValue = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    
    form.setFieldsValue({
      unitId: lease.unitId,
      tenantIds: tenantIds,
      primaryTenantId: primaryTenant?.tenantId || tenantIds[0] || null,
      leaseStart: leaseStartValue,
      leaseEnd: leaseEndValue,
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "success";
      case "Expired": return "warning";
      case "Terminated": return "failure";
      default: return "gray";
    }
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
      render: (_, lease) => {
        const isExpiringSoon = lease.leaseEnd && new Date(lease.leaseEnd) > new Date() && new Date(lease.leaseEnd) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
        const isExpired = lease.leaseEnd && new Date(lease.leaseEnd) < new Date();
        const canRenew = (isExpiringSoon || isExpired) && lease.status === 'Active';
        const canTerminate = lease.status === 'Active' || lease.status === 'MonthToMonth';

        return (
          <div className="flex items-center gap-2">
            <ActionButton
              action="edit"
              onClick={() => handleEditClick(lease)}
              tooltip="Edit Lease"
            />
            {canRenew && (
              <Tooltip content="Renew or Convert Lease">
                <Button
                  size="sm"
                  color="gray"
                  onClick={() => {
                    setSelectedLease(lease);
                    setRenewalModalVisible(true);
                  }}
                >
                  <HiRefresh className="h-4 w-4" />
                </Button>
              </Tooltip>
            )}
            {canTerminate && (
              <Tooltip content="Terminate Lease Early">
                <Button
                  size="sm"
                  color="failure"
                  onClick={() => {
                    setSelectedLease(lease);
                    setTerminationModalVisible(true);
                  }}
                >
                  <HiStop className="h-4 w-4" />
                </Button>
              </Tooltip>
            )}
            <FlowbitePopconfirm
              title="Delete lease?"
              description="This will also delete all associated rent payments."
              onConfirm={() => handleDelete(lease)}
              okText="Yes"
              cancelText="No"
              danger={true}
            >
              <ActionButton
                action="delete"
                tooltip="Delete Lease"
              />
            </FlowbitePopconfirm>
          </div>
        );
      },
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
    defaultSort: { field: 'leaseStart', order: 'descend' },
    storageKey: 'landlord-leases-table',
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

  return (
    <PageLayout
      headerTitle={
        <div className="flex items-center gap-2">
          <HiDocumentText className="h-5 w-5" />
          <span>Leases</span>
        </div>
      }
      headerActions={[
        permissions.canEditLeases && (
          <Button
            key="add"
            color="blue"
            onClick={handleAddClick}
            className="flex items-center gap-2"
          >
            <HiPlus className="h-4 w-4" />
            Add Lease
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
          icon={<HiDocumentText className="h-12 w-12 text-gray-400" />}
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
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} leases`,
            }}
            onRow={(record) => ({
              onDoubleClick: () => handleEditClick(record),
              style: { cursor: 'pointer' }
            })}
          />
        </TableWrapper>
      )}

      <LeaseRenewalModal
        visible={renewalModalVisible}
        onCancel={() => {
          setRenewalModalVisible(false);
          setSelectedLease(null);
        }}
        onSuccess={() => {
          pinaka.refresh();
        }}
        lease={selectedLease}
        userRole={user?.role || 'landlord'}
      />

      <LeaseTerminationModal
        visible={terminationModalVisible}
        onCancel={() => {
          setTerminationModalVisible(false);
          setSelectedLease(null);
        }}
        onSuccess={() => {
          pinaka.refresh();
        }}
        lease={selectedLease}
        userRole={user?.role || 'landlord'}
      />

      <Modal
        show={pinaka.isOpen}
        onClose={handleClose}
        size="4xl"
      >
        <Modal.Header>{pinaka.isEditing ? "Edit Lease" : "Create Lease"}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Row 1: Unit and Status */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-8">
                <div>
                  <Label htmlFor="unitId" className="mb-2">
                    Unit <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    id="unitId"
                    name="unitId"
                    placeholder="Select unit"
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
                    color={form.errors.unitId ? 'failure' : 'gray'}
                    helperText={form.errors.unitId}
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
              </div>
              <div className="col-span-4">
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
            </div>

            {/* Row 2: Tenant(s) */}
            <div>
              <Label htmlFor="tenantIds" className="mb-2">
                Tenant(s) <span className="text-red-500">*</span>
              </Label>
              <Select
                id="tenantIds"
                name="tenantIds"
                multiple
                placeholder="Select tenant(s)"
                disabled={!selectedUnit}
                value={form.values.tenantIds || []}
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
                required
                color={form.errors.tenantIds ? 'failure' : 'gray'}
                helperText={form.errors.tenantIds}
              >
                {availableTenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.firstName} {tenant.lastName} ({tenant.email})
                  </option>
                ))}
              </Select>
            </div>

            {/* Primary Tenant Selection */}
            {selectedTenantIds.length > 1 && (
              <div>
                <Label htmlFor="primaryTenantId" className="mb-2">
                  Primary Tenant <span className="text-red-500">*</span>
                  <Tooltip content="The primary tenant will receive receipts and main communications">
                    <span className="ml-1 text-gray-400 cursor-help">ℹ️</span>
                  </Tooltip>
                </Label>
                <div className="space-y-2">
                  {selectedTenantIds.map(tenantId => {
                    const tenant = tenants.find(t => t.id === tenantId);
                    if (!tenant) return null;
                    return (
                      <Radio
                        key={tenantId}
                        id={`primary-${tenantId}`}
                        name="primaryTenantId"
                        value={tenantId}
                        checked={form.values.primaryTenantId === tenantId}
                        onChange={(e) => form.setFieldsValue({ primaryTenantId: e.target.value })}
                      >
                        <span className="font-semibold">{tenant.firstName} {tenant.lastName}</span>
                        <span className="ml-2 text-gray-500">({tenant.email})</span>
                      </Radio>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedTenantIds.length === 1 && (
              <Alert color="info" className="mb-4">
                Single tenant will be marked as primary by default
              </Alert>
            )}

            {/* Row 3: Lease Start Date and Lease End Date */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
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
                    color={form.errors.leaseStart ? 'failure' : 'gray'}
                    helperText={form.errors.leaseStart}
                  />
                </div>
              </div>
              <div className="col-span-6">
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
                    color={form.errors.leaseEnd ? 'failure' : 'gray'}
                    helperText={form.errors.leaseEnd}
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Monthly Rent, Security Deposit, Rent Due Date */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <div>
                  <Label htmlFor="rentAmount" className="mb-2">
                    Monthly Rent <span className="text-red-500">*</span>
                  </Label>
                  <CurrencyInput
                    id="rentAmount"
                    country="CA"
                    value={form.values.rentAmount}
                    onChange={(value) => form.setFieldsValue({ rentAmount: value })}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="col-span-4">
                <div>
                  <Label htmlFor="securityDeposit" className="mb-2">Security Deposit</Label>
                  <CurrencyInput
                    id="securityDeposit"
                    country="CA"
                    value={form.values.securityDeposit}
                    onChange={(value) => form.setFieldsValue({ securityDeposit: value })}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="col-span-4">
                <div>
                  <Label htmlFor="rentDueDay" className="mb-2">
                    Due Day (of month)
                    <Tooltip content="The day of each month when rent is due">
                      <span className="ml-1 text-gray-400 cursor-help">ℹ️</span>
                    </Tooltip>
                  </Label>
                  <Select
                    id="rentDueDay"
                    name="rentDueDay"
                    value={form.values.rentDueDay || ''}
                    onChange={(e) => form.setFieldsValue({ rentDueDay: e.target.value ? parseInt(e.target.value) : undefined })}
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
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <Button color="gray" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" color="blue" disabled={pinaka.loading}>
                {pinaka.loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    {pinaka.isEditing ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  pinaka.isEditing ? "Save" : "Create"
                )}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </PageLayout>
  );
}
