/**
 * ═══════════════════════════════════════════════════════════════
 * SHARED APPROVALS TABLE COMPONENT
 * ═══════════════════════════════════════════════════════════════
 * 
 * Unified component for displaying approval tables
 * Used by: Admin (landlord approvals), Landlord (tenant approvals)
 * Future-proof: Can be extended for vendor/contractor approvals
 * 
 * ═══════════════════════════════════════════════════════════════
 */

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Modal,
  Input,
  message,
  Popconfirm,
  Tabs,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import PhoneDisplay from './PhoneDisplay';

const { Title, Text } = Typography;
const { TextArea } = Input;

/**
 * ApprovalsTable Component
 * 
 * @param {Object} props
 * @param {string} props.title - Page title (e.g., "Landlord Approvals")
 * @param {string} props.apiEndpoint - API endpoint for fetching data (e.g., "/api/admin/approvals/landlords")
 * @param {string} props.approveEndpoint - API endpoint for approval (e.g., "/api/admin/approvals/landlords/{id}/approve")
 * @param {string} props.rejectEndpoint - API endpoint for rejection (e.g., "/api/admin/approvals/landlords/{id}/reject")
 * @param {string} props.entityName - Entity name for messages (e.g., "landlord", "tenant")
 * @param {string} props.entityNamePlural - Plural form (e.g., "landlords", "tenants")
 */
// OPTIMIZED: Memoized component with useCallback and useMemo
const ApprovalsTable = React.memo(function ApprovalsTable({
  title = "Approvals",
  apiEndpoint,
  approveEndpoint,
  rejectEndpoint,
  entityName = "entity",
  entityNamePlural = "entities",
}) {
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  // OPTIMIZED: useCallback for fetchEntities
  const fetchEntities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiEndpoint}?status=${activeTab.toUpperCase()}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setEntities(data.data);
        if (data.counts) {
          setCounts(data.counts);
        }
      }
    } catch (err) {
      console.error(`Error fetching ${entityNamePlural}:`, err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, apiEndpoint, entityNamePlural]);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  // OPTIMIZED: useCallback for handleApprove
  const handleApprove = useCallback(async (entity) => {
    try {
      const response = await fetch(approveEndpoint.replace('{id}', entity.id), {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok && data.success) {
        message.success(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} approved successfully`);
        fetchEntities();
      } else {
        message.error(data.error || `Failed to approve ${entityName}`);
      }
    } catch (err) {
      message.error(`Failed to approve ${entityName}`);
    }
  }, [approveEndpoint, entityName, fetchEntities]);

  // OPTIMIZED: useCallback for handleReject
  const handleReject = useCallback(async () => {
    if (!selectedEntity) return;

    try {
      const response = await fetch(rejectEndpoint.replace('{id}', selectedEntity.id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        message.success(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} rejected successfully`);
        setRejectModalVisible(false);
        setRejectReason('');
        setSelectedEntity(null);
        fetchEntities();
      } else {
        message.error(data.error || `Failed to reject ${entityName}`);
      }
    } catch (err) {
      message.error(`Failed to reject ${entityName}`);
    }
  }, [selectedEntity, rejectEndpoint, rejectReason, entityName, fetchEntities]);

  // OPTIMIZED: useMemo for getStatusColor
  const getStatusColor = useCallback((status) => {
    const colors = {
      PENDING: 'orange',
      APPROVED: 'green',
      REJECTED: 'red',
    };
    return colors[status] || 'default';
  }, []);

  // OPTIMIZED: useMemo for columns
  const columns = useMemo(() => [
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => <PhoneDisplay phone={phone} fallback="-" />,
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => {
        const parts = [record.city, record.provinceState].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : '-';
      },
    },
    {
      title: 'Status',
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        if (record.approvalStatus === 'PENDING') {
          return (
            <Space>
              <Popconfirm
                title={`Approve this ${entityName}?`}
                onConfirm={() => handleApprove(record)}
              >
                <Button type="primary" icon={<CheckCircleOutlined />} size="small">
                  Approve
                </Button>
              </Popconfirm>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                size="small"
                onClick={() => {
                  setSelectedEntity(record);
                  setRejectModalVisible(true);
                }}
              >
                Reject
              </Button>
            </Space>
          );
        }
        return <Text type="secondary">-</Text>;
      },
    },
  ], [handleApprove, entityName, getStatusColor]);

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <UserOutlined /> {title}
        </Title>
        <Button icon={<ReloadOutlined />} onClick={fetchEntities}>
          Refresh
        </Button>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={
            {
              key: 'pending',
              label: `Pending (${counts.pending})`,
            },
            {
              key: 'approved',
              label: `Approved (${counts.approved})`,
            },
            {
              key: 'rejected',
              label: `Rejected (${counts.rejected})`,
            },
          ]}
        />
        <Table
          columns={columns}
          dataSource={entities}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 50 }}
          style={{ marginTop: 16 }}
        />
      </Card>

      <Modal
        title={`Reject ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`}
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason('');
          setSelectedEntity(null);
        }}
        onOk={handleReject}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>Are you sure you want to reject this {entityName}?</Text>
          {selectedEntity && (
            <div style={{ marginTop: 8 }}>
              <Text strong>{selectedEntity.firstName} {selectedEntity.lastName}</Text>
              <br />
              <Text type="secondary">{selectedEntity.email}</Text>
            </div>
          )}
        </div>
        <TextArea
          rows={4}
          placeholder="Reason for rejection (optional)"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
});

ApprovalsTable.displayName = 'ApprovalsTable';

export default ApprovalsTable;

