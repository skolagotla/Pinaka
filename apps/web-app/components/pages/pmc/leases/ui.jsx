"use client";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Typography, Button, Table, Tag, Space, Modal, Form, Input, 
  Select, DatePicker, Popconfirm, Empty, Row, Col, InputNumber, Tooltip, Radio, Alert
} from 'antd';
import { PageLayout, EmptyState, TableWrapper, StandardModal, FormTextInput, FormSelect, FormDatePicker, FormPhoneInput, renderDate, DeleteConfirmButton } from '@/components/shared';
import { renderStatus } from '@/components/shared/TableRenderers';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, SaveOutlined, CloseOutlined, CheckCircleOutlined, ClockCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatDateForAPI } from '@/lib/utils/safe-date-formatter';

// Custom Hooks
import { usePinakaCRUD } from '@/lib/hooks/usePinakaCRUD';
import { useResizableTable, withSorter, sortFunctions, configureTableColumns } from '@/lib/hooks';

// Constants
import { LEASE_STATUSES } from '@/lib/constants/statuses';

// Rules Engine Components
import CurrencyInput from '@/components/rules/CurrencyInput';
import CurrencyDisplay from '@/components/rules/CurrencyDisplay';
import { STANDARD_COLUMNS, COLUMN_NAMES, customizeColumn } from '@/lib/constants/standard-columns';
import { rules } from '@/lib/utils/validation-rules';

const { Text } = Typography;

export default function PMCLeasesClient({ units, tenants, initialLeases }) {
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
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
      prefix: <FileTextOutlined />,
    },
    {
      title: 'Active',
      value: pinaka.data.filter(l => l.status === 'Active').length,
      prefix: <CheckCircleOutlined />,
      valueStyle: { color: '#52c41a' },
    },
    {
      title: 'Expired',
      value: pinaka.data.filter(l => l.status === 'Expired').length,
      prefix: <ClockCircleOutlined />,
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "success";
      case "Expired": return "warning";
      case "Terminated": return "error";
      default: return "default";
    }
  };

  const columns = [
    customizeColumn(STANDARD_COLUMNS.UNIT_NAME, {
      key: 'unit',
      render: (_, lease) => {
        const unit = safeUnits.find(u => u.id === lease.unitId);
        const property = unit?.property;
        
        if (!property) return <Text>—</Text>;
        
        const propertyName = property.propertyName || property.addressLine1;
        
        if (property.unitCount === 1) {
          return <Text>{propertyName}</Text>;
        }
        
        const unitName = unit?.unitName || '';
        return <Text>{unitName} - {propertyName}</Text>;
      },
    }),
    customizeColumn(STANDARD_COLUMNS.TENANT_NAME, {
      key: 'tenants',
      render: (_, lease) => <Text>{getTenantNames(lease.leaseTenants)}</Text>,
    }),
    withSorter(
      customizeColumn(STANDARD_COLUMNS.START_DATE, {
        render: (_, lease) => renderDate(lease.leaseStart),
      }),
      sortFunctions.date('leaseStart')
    ),
    customizeColumn(STANDARD_COLUMNS.END_DATE, {
      render: (_, lease) => lease.leaseEnd ? renderDate(lease.leaseEnd) : <Text type="secondary">Month-to-month</Text>,
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
          if (!day) return <Text type="secondary">-</Text>;
          const suffix = 
            day === 1 || day === 21 || day === 31 ? 'st' :
            day === 2 || day === 22 ? 'nd' :
            day === 3 || day === 23 ? 'rd' : 'th';
          return <Text>{day}{suffix} of the Month</Text>;
        },
      }),
      sortFunctions.number('rentDueDay')
    ),
    customizeColumn(STANDARD_COLUMNS.STATUS, {
      render: (status) => renderStatus(status, {
        customColors: {
          'Active': 'success',
          'Expired': 'warning',
          'Terminated': 'error',
          'MonthToMonth': 'processing'
        }
      }),
      filters: LEASE_STATUSES.map(s => ({ text: s, value: s })),
      onFilter: (value, lease) => lease.status === value,
    }),
    customizeColumn(STANDARD_COLUMNS.ACTIONS, {
      render: (_, lease) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditClick(lease)}
            title="Edit Lease"
          />
          <DeleteConfirmButton
            entityName="lease"
            description="This will also delete all associated rent payments."
            onConfirm={() => handleDelete(lease)}
            type="link"
            buttonProps={{ title: "Delete Lease" }}
          />
        </Space>
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

  return (
    <PageLayout
      headerTitle={<><FileTextOutlined /> Leases</>}
      headerActions={[
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddClick}
        >
          Add Lease
        </Button>,
        <Button
          key="refresh"
          icon={<ReloadOutlined />}
          onClick={pinaka.refresh}
        >
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
          icon={<FileTextOutlined />}
          title="No leases yet"
          description="Click 'Add Lease' to create your first lease"
        />
      ) : (
        <TableWrapper>
          <Table
            {...tableProps}
            dataSource={filteredData}
            rowKey="id"
            loading={pinaka.loading}
            pagination={{
              pageSize: 25,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} leases`,
            }}
            size="middle"
            onRow={(record) => ({
              onDoubleClick: () => handleEditClick(record),
              style: { cursor: 'pointer' }
            })}
          />
        </TableWrapper>
      )}

      <StandardModal
        title={pinaka.isEditing ? "Edit Lease" : "Create Lease"}
        open={pinaka.isOpen}
        form={form}
        loading={pinaka.loading || false}
        submitText={pinaka.isEditing ? "Save" : "Create"}
        onCancel={handleClose}
        onFinish={pinaka.handleSubmit}
        width={800}
        showCancel={true}
      >
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
                    const unit = safeUnits.find(u => u.id === value);
                    setSelectedUnit(unit);
                    form.setFieldsValue({ 
                      rentAmount: unit?.rentPrice || undefined,
                      securityDeposit: unit?.depositAmount || undefined
                    });
                  }}
                >
                  {safeUnits.map(unit => {
                    const property = unit.property;
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

          <Form.Item
            name="tenantIds"
            label="Tenant(s)"
            rules={[rules.required('Tenant')]}
          >
            <Select
              mode="multiple"
              placeholder="Select tenant(s)"
              disabled={!selectedUnit}
              onChange={(values) => {
                setSelectedTenantIds(values);
                if (values.length === 1) {
                  form.setFieldsValue({ primaryTenantId: values[0] });
                } else if (values.length > 1) {
                  const currentPrimary = form.getFieldValue('primaryTenantId');
                  if (!values.includes(currentPrimary)) {
                    form.setFieldsValue({ primaryTenantId: values[0] });
                  }
                } else {
                  form.setFieldsValue({ primaryTenantId: null });
                }
              }}
            >
              {availableTenants.map(tenant => (
                <Select.Option key={tenant.id} value={tenant.id}>
                  {tenant.firstName} {tenant.lastName} ({tenant.email})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {selectedTenantIds.length > 1 && (
            <Form.Item
              name="primaryTenantId"
              label="Primary Tenant"
              rules={[rules.required('Primary tenant')]}
            >
              <Radio.Group style={{ width: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {selectedTenantIds.map(tenantId => {
                    const tenant = tenants.find(t => t.id === tenantId);
                    if (!tenant) return null;
                    return (
                      <Radio key={tenantId} value={tenantId}>
                        <Text strong>{tenant.firstName} {tenant.lastName}</Text>
                        <Text type="secondary" style={{ marginLeft: 8 }}>({tenant.email})</Text>
                      </Radio>
                    );
                  })}
                </Space>
              </Radio.Group>
            </Form.Item>
          )}

          {selectedTenantIds.length === 1 && (
            <Alert
              message="Single tenant will be marked as primary by default"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

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
              >
                <Select 
                  style={{ width: '100%' }}
                  placeholder="Select due day"
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
    </PageLayout>
  );
}


