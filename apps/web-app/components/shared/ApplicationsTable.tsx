/**
 * ═══════════════════════════════════════════════════════════════
 * SHARED APPLICATIONS TABLE COMPONENT
 * ═══════════════════════════════════════════════════════════════
 * 
 * Reusable component for viewing and managing applications
 * Supports: Admin (landlord/pmc), Landlord (tenant), PMC (tenant)
 * 
 * ═══════════════════════════════════════════════════════════════
 */

"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Tag,
  Typography,
  Select,
  Descriptions,
} from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

// Status tag configuration - memoized outside component
const STATUS_CONFIG: Record<string, { color: string; text: string }> = {
  PENDING: { color: 'orange', text: 'Pending' },
  APPROVED: { color: 'green', text: 'Approved' },
  REJECTED: { color: 'red', text: 'Rejected' },
};

export interface ApplicationsTableProps {
  title: string;
  apiEndpoint: string;
  approveEndpoint: string;
  rejectEndpoint: string;
  applicationType: 'landlord' | 'pmc' | 'tenant';
  showTypeFilter?: boolean; // For admin to filter by type
}

// Memoized component to prevent unnecessary re-renders
const ApplicationsTable = React.memo(function ApplicationsTable({
  title,
  apiEndpoint,
  approveEndpoint,
  rejectEndpoint,
  applicationType,
  showTypeFilter = false,
}: ApplicationsTableProps) {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [approveForm] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterType, setFilterType] = useState<string | undefined>(undefined);

  // Memoized fetch function with proper dependencies
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('approvalStatus', filterStatus);
      if (filterType && showTypeFilter) params.append('type', filterType);
      
      const response = await fetch(`${apiEndpoint}?${params.toString()}`);
      const data = await response.json();
      if (response.ok && data.success) {
        // Ensure data.data is an array
        setApplications(Array.isArray(data.data) ? data.data : []);
      } else {
        message.error(data.error || 'Failed to fetch applications');
        setApplications([]);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      message.error('Failed to fetch applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, filterStatus, filterType, showTypeFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Memoized event handlers
  const handleViewDetails = useCallback((application: any) => {
    setSelectedApplication(application);
    setDetailModalVisible(true);
  }, []);

  const handleApprove = useCallback((application: any) => {
    setSelectedApplication(application);
    setApproveModalVisible(true);
    approveForm.resetFields();
  }, [approveForm]);

  const handleReject = useCallback((application: any) => {
    setSelectedApplication(application);
    setRejectModalVisible(true);
    rejectForm.resetFields();
  }, [rejectForm]);

  const submitApprove = useCallback(async () => {
    if (!selectedApplication) {
      message.error('Invalid application selected');
      return;
    }
    
    const invitationId = selectedApplication?.invitation?.id || selectedApplication?.id;
    if (!invitationId) {
      message.error('Invalid application selected');
      return;
    }
    
    try {
      const values = await approveForm.validateFields();
      const endpoint = approveEndpoint.replace('{id}', invitationId);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: values.comment }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        message.success('Application approved successfully');
        setApproveModalVisible(false);
        fetchApplications();
      } else {
        message.error(data.error || 'Failed to approve application');
      }
    } catch (err) {
      console.error('Error approving application:', err);
      message.error('Failed to approve application');
    }
  }, [selectedApplication, approveForm, approveEndpoint, fetchApplications]);

  const submitReject = useCallback(async () => {
    if (!selectedApplication) {
      message.error('Invalid application selected');
      return;
    }
    
    const invitationId = selectedApplication?.invitation?.id || selectedApplication?.id;
    if (!invitationId) {
      message.error('Invalid application selected');
      return;
    }
    
    try {
      const values = await rejectForm.validateFields();
      const endpoint = rejectEndpoint.replace('{id}', invitationId);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: values.reason, comment: values.comment }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        message.success('Application rejected successfully');
        setRejectModalVisible(false);
        fetchApplications();
      } else {
        message.error(data.error || 'Failed to reject application');
      }
    } catch (err) {
      console.error('Error rejecting application:', err);
      message.error('Failed to reject application');
    }
  }, [selectedApplication, rejectForm, rejectEndpoint, fetchApplications]);

  // Memoized status tag renderer
  const getStatusTag = useCallback((status) => {
    if (!status) return <Tag>N/A</Tag>;
    const config = STATUS_CONFIG[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  }, []);

  // Memoized user data getters
  const getUserName = useCallback((record) => {
    if (!record) return 'N/A';
    
    // Determine type from invitation or record
    const type = record?.invitation?.type || record?.type || applicationType;
    
    if (type === 'tenant') {
      return record.user 
        ? `${record.user.firstName || ''} ${record.user.lastName || ''}`.trim() || 'N/A'
        : 'N/A';
    } else if (type === 'pmc') {
      return record.user?.companyName || 'N/A';
    } else if (type === 'landlord') {
      return record.user 
        ? `${record.user.firstName || ''} ${record.user.lastName || ''}`.trim() || 'N/A'
        : 'N/A';
    } else {
      // Fallback
      return record.user?.companyName || 
        (record.user ? `${record.user.firstName || ''} ${record.user.lastName || ''}`.trim() : 'N/A') || 
        'N/A';
    }
  }, [applicationType]);

  const getUserEmail = useCallback((record) => {
    if (!record) return 'N/A';
    // All types use record.user now (unified structure)
    return record.user?.email || 'N/A';
  }, []);

  const getUserPhone = useCallback((record) => {
    if (!record) return 'N/A';
    // All types use record.user now (unified structure)
    return record.user?.phone || 'N/A';
  }, []);

  // Memoized columns to prevent unnecessary re-renders
  const columns = useMemo(() => [
    {
      title: 'Email',
      key: 'email',
      render: (_text, record) => getUserEmail(record),
    },
    ...(showTypeFilter ? [{
      title: 'Type',
      key: 'type',
      render: (_text, record) => {
        const type = record?.invitation?.type || record?.type;
        return type ? type.toUpperCase() : 'N/A';
      },
    }] : []),
    {
      title: 'Name',
      key: 'name',
      render: (_text, record) => getUserName(record),
    },
    {
      title: 'Phone',
      key: 'phone',
      render: (_text, record) => getUserPhone(record),
    },
    {
      title: 'Status',
      key: 'approvalStatus',
      render: (_text, record) => getStatusTag(record?.approvalStatus),
    },
    {
      title: 'Submitted',
      key: 'completedAt',
      render: (_text, record) => {
        const date = record?.invitation?.completedAt;
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_text, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetails(record)}
            title="View Details"
          />
          {record?.approvalStatus === 'PENDING' && (
            <>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                size="small"
                onClick={() => handleApprove(record)}
                title="Approve"
              />
              <Button
                danger
                icon={<CloseCircleOutlined />}
                size="small"
                onClick={() => handleReject(record)}
                title="Reject"
              />
            </>
          )}
        </Space>
      ),
    },
  ], [applicationType, showTypeFilter, getUserName, getUserEmail, getUserPhone, getStatusTag, handleViewDetails, handleApprove, handleReject]);

  // Memoized detail fields renderer
  const getDetailFields = useMemo(() => {
    if (!selectedApplication) return null;
    
    // Determine type from invitation or record
    const type = selectedApplication?.invitation?.type || selectedApplication?.type || applicationType;
    const user = selectedApplication.user;
    
    if (type === 'tenant') {
      return (
        <>
          <Descriptions.Item label="Email">{user?.email || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="First Name">{user?.firstName || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Last Name">{user?.lastName || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Phone">{user?.phone || 'N/A'}</Descriptions.Item>
          {user?.rejectionReason && (
            <Descriptions.Item label="Rejection Reason" span={2}>
              {user.rejectionReason}
            </Descriptions.Item>
          )}
        </>
      );
    } else if (type === 'pmc') {
      const pmc = selectedApplication.user;
      const addressParts = [
        pmc?.addressLine1,
        pmc?.addressLine2,
        pmc?.city,
        pmc?.provinceState,
        pmc?.postalZip,
      ].filter(Boolean);
      const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : 'N/A';
      
      return (
        <>
          <Descriptions.Item label="Company ID">{pmc?.companyId || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Company Name">{pmc?.companyName || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Email">{pmc?.email || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Phone">{pmc?.phone || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Address Line 1">{pmc?.addressLine1 || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Address Line 2">{pmc?.addressLine2 || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="City">{pmc?.city || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Province/State">{pmc?.provinceState || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Postal/Zip Code">{pmc?.postalZip || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Country (Legacy)">{pmc?.country || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Country">
            {pmc?.countryFK ? `${pmc.countryFK.name} (${pmc.countryFK.code})` : pmc?.countryCode || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Region">
            {pmc?.regionFK ? `${pmc.regionFK.name} (${pmc.regionFK.code})` : pmc?.regionCode || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Full Address" span={2}>
            {fullAddress}
          </Descriptions.Item>
          {pmc?.defaultCommissionRate !== null && pmc?.defaultCommissionRate !== undefined && (
            <Descriptions.Item label="Default Commission Rate" span={2}>
              {(pmc.defaultCommissionRate * 100).toFixed(2)}%
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Status">{getStatusTag(pmc?.approvalStatus)}</Descriptions.Item>
          <Descriptions.Item label="Created At">
            {pmc?.createdAt ? new Date(pmc.createdAt).toLocaleString() : 'N/A'}
          </Descriptions.Item>
          {pmc?.approvedAt && (
            <Descriptions.Item label="Approved At">
              {new Date(pmc.approvedAt).toLocaleString()}
            </Descriptions.Item>
          )}
          {pmc?.rejectedAt && (
            <Descriptions.Item label="Rejected At">
              {new Date(pmc.rejectedAt).toLocaleString()}
            </Descriptions.Item>
          )}
          {pmc?.rejectionReason && (
            <Descriptions.Item label="Rejection Reason" span={2}>
              {pmc.rejectionReason}
            </Descriptions.Item>
          )}
        </>
      );
    } else if (type === 'landlord') {
      // Landlord details
      return (
        <>
          <Descriptions.Item label="Email">{user?.email || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="First Name">{user?.firstName || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Last Name">{user?.lastName || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Phone">{user?.phone || 'N/A'}</Descriptions.Item>
          {user?.rejectionReason && (
            <Descriptions.Item label="Rejection Reason" span={2}>
              {user.rejectionReason}
            </Descriptions.Item>
          )}
        </>
      );
    } else {
      // Fallback for other types
      return (
        <>
          <Descriptions.Item label="Email">{user?.email || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="First Name">{user?.firstName || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Last Name">{user?.lastName || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Phone">{user?.phone || 'N/A'}</Descriptions.Item>
          {user?.rejectionReason && (
            <Descriptions.Item label="Rejection Reason" span={2}>
              {user.rejectionReason}
            </Descriptions.Item>
          )}
        </>
      );
    }
  }, [applicationType, selectedApplication, getStatusTag]);

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <FileTextOutlined /> {title}
        </Title>
        <Button icon={<ReloadOutlined />} onClick={fetchApplications}>
          Refresh
        </Button>
      </div>

      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space>
            <Select
              placeholder="Filter by Status"
              allowClear
              style={{ width: 200 }}
              value={filterStatus}
              onChange={setFilterStatus}
            >
              <Select.Option value="PENDING">Pending</Select.Option>
              <Select.Option value="APPROVED">Approved</Select.Option>
              <Select.Option value="REJECTED">Rejected</Select.Option>
            </Select>
            {showTypeFilter && (
              <Select
                placeholder="Filter by Type"
                allowClear
                style={{ width: 200 }}
                value={filterType}
                onChange={setFilterType}
              >
                <Select.Option value="landlord">Landlord</Select.Option>
                <Select.Option value="pmc">PMC</Select.Option>
              </Select>
            )}
          </Space>
          <Table
            columns={columns}
            dataSource={applications}
            loading={loading}
            rowKey={(record) => record?.invitation?.id || record?.id || Math.random().toString()}
            pagination={{ pageSize: 50 }}
          />
        </Space>
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Application Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedApplication && (
          <Descriptions column={2} bordered>
            {getDetailFields}
            <Descriptions.Item label="Status">{getStatusTag(selectedApplication?.approvalStatus)}</Descriptions.Item>
            <Descriptions.Item label="Submitted">
              {selectedApplication?.invitation?.completedAt 
                ? new Date(selectedApplication.invitation.completedAt).toLocaleString() 
                : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        title="Approve Application"
        open={approveModalVisible}
        onOk={submitApprove}
        onCancel={() => setApproveModalVisible(false)}
      >
        <Form form={approveForm} layout="vertical">
          <Form.Item
            name="comment"
            label="Comment (Optional)"
          >
            <TextArea rows={4} placeholder="Add any comments about this approval..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Reject Application"
        open={rejectModalVisible}
        onOk={submitReject}
        onCancel={() => setRejectModalVisible(false)}
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="reason"
            label="Rejection Reason"
            rules={[{ required: true, message: 'Please provide a rejection reason' }]}
          >
            <TextArea rows={4} placeholder="Explain why this application is being rejected..." />
          </Form.Item>
          <Form.Item
            name="comment"
            label="Additional Comments (Optional)"
          >
            <TextArea rows={3} placeholder="Any additional comments..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
});

ApplicationsTable.displayName = 'ApplicationsTable';

export default ApplicationsTable;

