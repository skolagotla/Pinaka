"use client";

import { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Form, Input, message, Badge, Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined, DollarOutlined, ToolOutlined } from '@ant-design/icons';
import { ProCard } from './LazyProComponents';
import { formatDateDisplay } from '@/lib/utils/safe-date-formatter';

const { TextArea } = Input;

/**
 * Component to display and manage approval requests for landlords
 */
export default function ApprovalRequestsList() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [approveForm] = Form.useForm();
  const [rejectForm] = Form.useForm();

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      // Use adminApi for approvals
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getApprovals();

      if (data.success || data.data) {
        setApprovals(data.data || data.approvals || []);
      }
    } catch (error) {
      console.error('[Approval Requests List] Error:', error);
      message.error(error.message || 'Failed to load approval requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (values) => {
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.approveApproval(selectedApproval.id, values.notes || null);
      
      if (data.success || data) {
        message.success('Approval request approved');
        setApproveModalVisible(false);
        setSelectedApproval(null);
        approveForm.resetFields();
        fetchApprovals();
      }
    } catch (error) {
      console.error('[Approve Request] Error:', error);
      message.error(error.message || 'Failed to approve request');
    }
  };

  const handleReject = async (values) => {
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.rejectApproval(selectedApproval.id, values.reason);
      
      if (data.success || data) {
        message.success('Approval request rejected');
        setRejectModalVisible(false);
        setSelectedApproval(null);
        rejectForm.resetFields();
        fetchApprovals();
      }
    } catch (error) {
      console.error('[Reject Request] Error:', error);
      message.error(error.message || 'Failed to reject request');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'orange',
      APPROVED: 'green',
      REJECTED: 'red',
      CANCELLED: 'default',
    };
    return colors[status] || 'default';
  };

  const getApprovalTypeIcon = (type) => {
    if (type === 'EXPENSE') return <DollarOutlined />;
    return <ToolOutlined />;
  };

  const pendingCount = approvals.filter(a => a.status === 'PENDING').length;

  const columns = [
    {
      title: 'Type',
      key: 'approvalType',
      render: (_, record) => (
        <Space>
          {getApprovalTypeIcon(record.approvalType)}
          <span>{record.approvalType.replace(/_/g, ' ')}</span>
        </Space>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'PMC',
      key: 'pmc',
      render: (_, record) => (
        <span>
          {record.pmcLandlord?.pmc?.companyName || 'Unknown PMC'}
        </span>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => amount ? `$${amount.toLocaleString()}` : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Requested',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      render: (date) => date ? formatDateDisplay(date) : '-',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        if (record.status !== 'PENDING') {
          return <Tag color={getStatusColor(record.status)}>{record.status}</Tag>;
        }
        return (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => {
                setSelectedApproval(record);
                setApproveModalVisible(true);
              }}
            >
              Approve
            </Button>
            <Button
              danger
              size="small"
              icon={<CloseOutlined />}
              onClick={() => {
                setSelectedApproval(record);
                setRejectModalVisible(true);
              }}
            >
              Reject
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <ProCard
        title={
          <Space>
            <span>Approval Requests</span>
            {pendingCount > 0 && (
              <Badge count={pendingCount} showZero>
                <span />
              </Badge>
            )}
          </Space>
        }
        extra={
          <Button onClick={fetchApprovals} loading={loading}>
            Refresh
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={approvals}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </ProCard>

      {/* Approve Modal */}
      <Modal
        title="Approve Request"
        open={approveModalVisible}
        onCancel={() => {
          setApproveModalVisible(false);
          setSelectedApproval(null);
          approveForm.resetFields();
        }}
        onOk={() => approveForm.submit()}
        okText="Approve"
        okButtonProps={{ type: 'primary' }}
      >
        {selectedApproval && (
          <div>
            <p><strong>Title:</strong> {selectedApproval.title}</p>
            {selectedApproval.amount && (
              <p><strong>Amount:</strong> ${selectedApproval.amount.toLocaleString()}</p>
            )}
            {selectedApproval.description && (
              <p><strong>Description:</strong> {selectedApproval.description}</p>
            )}
            <Form
              form={approveForm}
              layout="vertical"
              onFinish={handleApprove}
            >
              <Form.Item
                name="notes"
                label="Approval Notes (Optional)"
              >
                <TextArea rows={3} placeholder="Add any notes about this approval..." />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Reject Request"
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          setSelectedApproval(null);
          rejectForm.resetFields();
        }}
        onOk={() => rejectForm.submit()}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        {selectedApproval && (
          <div>
            <p><strong>Title:</strong> {selectedApproval.title}</p>
            {selectedApproval.amount && (
              <p><strong>Amount:</strong> ${selectedApproval.amount.toLocaleString()}</p>
            )}
            <Form
              form={rejectForm}
              layout="vertical"
              onFinish={handleReject}
            >
              <Form.Item
                name="reason"
                label="Rejection Reason"
                rules={[
                  { required: true, message: 'Please provide a reason for rejection' },
                  { min: 10, message: 'Reason must be at least 10 characters' },
                ]}
              >
                <TextArea rows={4} placeholder="Explain why you are rejecting this request..." />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}

