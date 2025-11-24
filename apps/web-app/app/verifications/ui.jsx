"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Typography,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Tabs,
  Empty,
  Badge,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  CheckOutlined,
  StopOutlined,
  FileOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { ProCard } from '@/components/shared/LazyProComponents';
import { PageLayout, EmptyState, TableWrapper, FilterBar, StandardModal, FormTextInput } from '@/components/shared';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const VERIFICATION_TYPES = {
  PROPERTY_OWNERSHIP: { label: 'Property Ownership', color: 'blue' },
  TENANT_DOCUMENT: { label: 'Tenant Document', color: 'cyan' },
  APPLICATION: { label: 'Application', color: 'purple' },
  ENTITY_APPROVAL: { label: 'Entity Approval', color: 'orange' },
  FINANCIAL_APPROVAL: { label: 'Financial Approval', color: 'green' },
  INSPECTION: { label: 'Inspection', color: 'geekblue' },
  OTHER: { label: 'Other', color: 'default' },
};

const STATUS_COLORS = {
  PENDING: 'orange',
  VERIFIED: 'green',
  REJECTED: 'red',
  EXPIRED: 'default',
  CANCELLED: 'default',
};

const STATUS_ICONS = {
  PENDING: <ClockCircleOutlined />,
  VERIFIED: <CheckCircleOutlined />,
  REJECTED: <CloseCircleOutlined />,
  EXPIRED: <ClockCircleOutlined />,
  CANCELLED: <CloseCircleOutlined />,
};

export default function VerificationsClient({ user, initialStats }) {
  const [form] = Form.useForm();
  const [verifications, setVerifications] = useState([]);
  const [stats, setStats] = useState(initialStats || {});
  const [loading, setLoading] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    verificationType: null,
    status: null,
  });
  // Load verifications
  const loadVerifications = useCallback(async () => {
    setLoading(true);
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const query = {};
      if (filters.verificationType) query.verificationType = filters.verificationType;
      // Only add status filter if not using a tab filter
      if (filters.status && activeTab !== 'pending' && activeTab !== 'my-requests') {
        query.status = filters.status;
      }
      if (activeTab === 'pending') {
        query.status = 'PENDING';
      }
      if (activeTab === 'my-requests') {
        query.requestedBy = user.id;
      }
      
      const data = await adminApi.getVerifications(query);
      if (data.success) {
        setVerifications(data.data || []);
      } else {
        console.error('[Verifications] Error loading:', data.error || 'Failed to load verifications');
      }
    } catch (error) {
      console.error('[Verifications] Error loading:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab, user.id]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const statsData = await adminApi.getVerificationStats();
      setStats(statsData || {});
    } catch (error) {
      console.error('[Verifications] Error loading stats:', error);
    }
  }, []);

  useEffect(() => {
    loadVerifications();
    loadStats();
  }, [loadVerifications, loadStats]);

  // Handle verify
  const handleVerify = useCallback(async (values) => {
    if (!selectedVerification) return;

    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      await adminApi.verifyVerification(selectedVerification.id, values.verificationNotes || null);
      message.success('Verification approved successfully');
      setVerifyModalVisible(false);
      setSelectedVerification(null);
      form.resetFields();
      loadVerifications();
      loadStats();
    } catch (error) {
      console.error('[Verifications] Error verifying:', error);
      message.error(error?.message || 'Failed to verify');
    }
  }, [selectedVerification, form, loadVerifications, loadStats]);

  // Handle reject
  const handleReject = useCallback(async (values) => {
    if (!selectedVerification) return;

    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      await adminApi.rejectVerification(selectedVerification.id, values.rejectionReason);
      message.success('Verification rejected');
      setRejectModalVisible(false);
      setSelectedVerification(null);
      form.resetFields();
      loadVerifications();
      loadStats();
    } catch (error) {
      console.error('[Verifications] Error rejecting:', error);
      message.error(error?.message || 'Failed to reject verification');
    }
  }, [selectedVerification, form, loadVerifications, loadStats]);

  // Columns
  const columns = useMemo(() => [
    {
      title: 'Type',
      dataIndex: 'verificationType',
      key: 'verificationType',
      width: 150,
      render: (type) => {
        const typeConfig = VERIFICATION_TYPES[type] || VERIFICATION_TYPES.OTHER;
        return <Tag color={typeConfig.color}>{typeConfig.label}</Tag>;
      },
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Requester',
      key: 'requester',
      render: (_, record) => (
        <div>
          <div>{record.requestedByName}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.requestedByRole}
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag icon={STATUS_ICONS[status]} color={STATUS_COLORS[status]}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Requested',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedVerification(record);
              setViewModalVisible(true);
            }}
          >
            View
          </Button>
          {record.status === 'PENDING' && 
           (record.assignedTo === user.id || record.assignedTo === null || !record.assignedTo) &&
           ['pmc', 'landlord', 'admin'].includes(user.role) && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => {
                  setSelectedVerification(record);
                  setVerifyModalVisible(true);
                }}
              >
                Verify
              </Button>
              <Button
                type="link"
                danger
                icon={<StopOutlined />}
                onClick={() => {
                  setSelectedVerification(record);
                  setRejectModalVisible(true);
                }}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ], [user.id, user.role]);

  // Filtered verifications
  const filteredVerifications = useMemo(() => {
    let filtered = verifications;

    if (activeTab === 'pending') {
      filtered = filtered.filter(v => v.status === 'PENDING');
    } else if (activeTab === 'my-requests') {
      filtered = filtered.filter(v => v.requestedBy === user.id);
    } else if (activeTab === 'history') {
      filtered = filtered.filter(v => ['VERIFIED', 'REJECTED', 'EXPIRED', 'CANCELLED'].includes(v.status));
    }

    return filtered;
  }, [verifications, activeTab, user.id]);

  const verificationStats = [
    {
      title: 'Total',
      value: stats.total,
    },
    {
      title: 'Pending',
      value: stats.pending,
      prefix: <ClockCircleOutlined />,
      valueStyle: { color: '#faad14' },
    },
    {
      title: 'Verified',
      value: stats.verified,
      prefix: <CheckCircleOutlined />,
      valueStyle: { color: '#52c41a' },
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      prefix: <CloseCircleOutlined />,
      valueStyle: { color: '#ff4d4f' },
    },
  ];

  const filterConfig = [
    {
      key: 'verificationType',
      type: 'select',
      placeholder: 'Filter by Type',
      options: Object.entries(VERIFICATION_TYPES).map(([key, config]) => ({
        label: config.label,
        value: key
      }))
    },
    {
      key: 'status',
      type: 'select',
      placeholder: 'Filter by Status',
      options: Object.keys(STATUS_COLORS).map(status => ({
        label: status,
        value: status
      }))
    }
  ];

  return (
    <PageLayout
      headerTitle={<><FileOutlined /> Verifications</>}
      stats={verificationStats}
      statsCols={4}
      contentStyle={{ padding: 0, display: 'flex', flexDirection: 'column' }}
    >
      <FilterBar
        filters={filterConfig}
        activeFilters={filters}
        onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
        onReset={() => {
          setFilters({ verificationType: null, status: null });
          loadVerifications();
        }}
        showSearch={false}
      />
      {/* Tabs */}
      <Card 
        size="small" 
        style={{ marginBottom: 12 }}
        bodyStyle={{ padding: '0 16px' }}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          size="small"
        >
          <Tabs.TabPane
            tab={
              <span>
                All <Badge count={stats.total} style={{ marginLeft: 4 }} />
              </span>
            }
            key="all"
          />
          <Tabs.TabPane
            tab={
              <span>
                Pending <Badge count={stats.pending} style={{ marginLeft: 4 }} />
              </span>
            }
            key="pending"
          />
          <Tabs.TabPane
            tab="My Requests"
            key="my-requests"
          />
          <Tabs.TabPane
            tab="History"
            key="history"
          />
        </Tabs>
      </Card>

      {/* Table - Full height */}
      {filteredVerifications.length === 0 ? (
        <EmptyState
          title="No verifications found"
          description="No verifications match your current filters"
        />
      ) : (
        <TableWrapper>
          <Table
            dataSource={filteredVerifications}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Total ${total} items` }}
            scroll={{ x: 'max-content' }}
          />
        </TableWrapper>
      )}
      {/* View Modal */}
      <Modal
        title="Verification Details"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedVerification(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setViewModalVisible(false);
            setSelectedVerification(null);
          }}>
            Close
          </Button>
        }
        width={800}
      >
        {selectedVerification && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text strong>Type:</Text>
                <div>
                  <Tag color={VERIFICATION_TYPES[selectedVerification.verificationType]?.color}>
                    {VERIFICATION_TYPES[selectedVerification.verificationType]?.label}
                  </Tag>
                </div>
              </Col>
              <Col span={12}>
                <Text strong>Status:</Text>
                <div>
                  <Tag icon={STATUS_ICONS[selectedVerification.status} color={STATUS_COLORS[selectedVerification.status}>
                    {selectedVerification.status}
                  </Tag>
                </div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text strong>Title:</Text>
                <div>{selectedVerification.title}</div>
              </Col>
              <Col span={12}>
                <Text strong>Requested By:</Text>
                <div>{selectedVerification.requestedByName} ({selectedVerification.requestedByRole})</div>
              </Col>
            </Row>
            {selectedVerification.description && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>Description:</Text>
                <div>{selectedVerification.description}</div>
              </div>
            )}
            {selectedVerification.status === 'VERIFIED' && selectedVerification.verifiedByName && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>Verified By:</Text>
                <div>{selectedVerification.verifiedByName} on {new Date(selectedVerification.verifiedAt).toLocaleString()}</div>
                {selectedVerification.verificationNotes && (
                  <div style={{ marginTop: 8 }}>
                    <Text strong>Notes:</Text>
                    <div>{selectedVerification.verificationNotes}</div>
                  </div>
                )}
              </div>
            )}
            {selectedVerification.status === 'REJECTED' && selectedVerification.rejectedByName && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>Rejected By:</Text>
                <div>{selectedVerification.rejectedByName} on {new Date(selectedVerification.rejectedAt).toLocaleString()}</div>
                {selectedVerification.rejectionReason && (
                  <div style={{ marginTop: 8 }}>
                    <Text strong>Reason:</Text>
                    <div>{selectedVerification.rejectionReason}</div>
                  </div>
                )}
              </div>
            )}
            {selectedVerification.fileUrl && (
              <div style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  href={selectedVerification.fileUrl}
                  target="_blank"
                >
                  View Document
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Verify Modal */}
      <StandardModal
        title="Verify Request"
        open={verifyModalVisible}
        form={form}
        loading={false}
        submitText="Verify"
        onCancel={() => {
          setVerifyModalVisible(false);
          setSelectedVerification(null);
          form.resetFields();
        }}
        onFinish={handleVerify}
      >
        <FormTextInput
          name="verificationNotes"
          label="Notes (Optional)"
          textArea
          rows={4}
          placeholder="Add any notes about this verification"
        />
      </StandardModal>

      {/* Reject Modal */}
      <StandardModal
        title="Reject Request"
        open={rejectModalVisible}
        form={form}
        loading={false}
        submitText="Reject"
        onCancel={() => {
          setRejectModalVisible(false);
          setSelectedVerification(null);
          form.resetFields();
        }}
        onFinish={handleReject}
      >
        <FormTextInput
          name="rejectionReason"
          label="Rejection Reason"
          textArea
          rows={4}
          required
          placeholder="Explain why this verification is being rejected"
        />
      </StandardModal>
    </PageLayout>
  );
}

