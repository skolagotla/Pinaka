"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  Tabs,
  Badge,
} from 'antd';
import { StandardModal, FormTextInput, FormSelect } from '@/components/shared';
import {
  MailOutlined,
  PlusOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

export default function AdminInvitationsPage() {
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [applicationDetails, setApplicationDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [form] = Form.useForm();
  const [rejectForm] = Form.useForm();
  // PHASE 1: Add tab state for filtering
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved', 'rejected'
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });

  // PHASE 1: Update fetch to support tab filtering
  const fetchInvitations = useCallback(async (tab = 'pending') => {
    setLoading(true);
    try {
      // Determine if we should show archived (approved) invitations
      const archive = tab === 'approved' ? 'true' : 'false';
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getInvitations({ archive: archive === 'true' });
      if (data.success) {
        setInvitations(Array.isArray(data.data) ? data.data : []);
        // PHASE 1: Store counts for tab badges
        if (data.counts) {
          setCounts(data.counts);
        }
      } else {
        setInvitations([]);
      }
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations(activeTab);
  }, [fetchInvitations, activeTab]);

  const handleCreate = async (values) => {
    try {
      // Use v1Api for invitations (business domain API)
      const { v1Api } = await import('@/lib/api/v1-client');
      const data = await v1Api.invitations.create({
        email: values.email,
        type: values.type || 'landlord',
        metadata: values.type === 'pmc' ? {
          companyName: values.companyName,
        } : {
          firstName: values.firstName,
          lastName: values.lastName,
        },
      });
      if (data.success) {
        message.success('Invitation sent successfully');
        setModalVisible(false);
        form.resetFields();
        fetchInvitations(activeTab);
      } else {
        message.error(data.error || 'Failed to send invitation');
      }
    } catch (err) {
      console.error('Failed to send invitation:', err);
      message.error(err?.message || 'Failed to send invitation');
    }
  };

  const handleApprove = useCallback(async (invitationId) => {
    try {
      // Find the invitation to get the application ID
      const invitation = invitations.find((inv) => inv.id === invitationId);
      if (!invitation || invitation.status !== 'completed') {
        message.warning('Only completed invitations can be approved');
        return;
      }

      // Get the application based on invitation type
      const applicationType = invitation.type;
      const response = await fetch(`/api/admin/applications/${invitationId}/approve`, {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok && data.success) {
        message.success('Application approved successfully');
        fetchInvitations(activeTab);
      } else {
        message.error(data.error || 'Failed to approve application');
      }
    } catch (err) {
      message.error('Failed to approve application');
    }
  }, [invitations, fetchInvitations, activeTab]);

  const handleReject = useCallback(async (invitationId, reason) => {
    try {
      const invitation = invitations.find((inv) => inv.id === invitationId);
      if (!invitation || invitation.status !== 'completed') {
        message.warning('Only completed invitations can be rejected');
        return;
      }

      const response = await fetch(`/api/admin/applications/${invitationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        message.success('Application rejected');
        fetchInvitations(activeTab);
      } else {
        message.error(data.error || 'Failed to reject application');
      }
    } catch (err) {
      message.error('Failed to reject application');
    }
  }, [invitations, fetchInvitations, activeTab]);

  const handleViewDetails = useCallback(async (invitation) => {
    if (!invitation || invitation.status !== 'completed') {
      message.warning('Only completed invitations can be viewed');
      return;
    }

    setLoadingDetails(true);
    setSelectedInvitation(invitation);
    setViewModalVisible(true);

    try {
      // Fetch application details directly from invitation ID
      const response = await fetch(`/api/admin/invitations/${invitation.id}/application`);
      const data = await response.json();
      
      if (response.ok && data.success && data.data) {
        setApplicationDetails(data.data);
      } else {
        message.error(data.error || 'Failed to fetch application details');
        setApplicationDetails(null);
      }
    } catch (err) {
      console.error('Error fetching application details:', err);
      message.error('Failed to fetch application details');
      setApplicationDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  const columns = useMemo(() => [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => type ? <Tag color="blue">{type.toUpperCase()}</Tag> : <Tag>N/A</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (!status) return <Tag>N/A</Tag>;
        const colors = {
          pending: 'orange',
          sent: 'blue',
          opened: 'cyan',
          completed: 'green',
          expired: 'default',
          cancelled: 'red',
        };
        return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Approval Status',
      key: 'approvalStatus',
      render: (_, record) => {
        if (record?.status !== 'completed') {
          return <Tag>N/A</Tag>;
        }
        const approvalStatus = record?.approvalStatus;
        if (!approvalStatus || approvalStatus === 'PENDING') {
          return <Tag color="orange" icon={<ClockCircleOutlined />}>Pending Approval</Tag>;
        }
        if (approvalStatus === 'APPROVED') {
          return <Tag color="green" icon={<CheckCircleOutlined />}>Approved</Tag>;
        }
        if (approvalStatus === 'REJECTED') {
          return <Tag color="red" icon={<CloseCircleOutlined />}>Rejected</Tag>;
        }
        return <Tag>{approvalStatus}</Tag>;
      },
    },
    {
      title: 'Expires',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date) => {
        if (!date) return 'N/A';
        try {
          // Use consistent date formatting to avoid hydration issues
          const d = new Date(date);
          return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
          return 'N/A';
        }
      },
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => {
        if (!date) return 'N/A';
        try {
          // Use consistent date formatting to avoid hydration issues
          const d = new Date(date);
          return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
          return 'N/A';
        }
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        if (record?.status === 'completed') {
          const isApproved = record?.approvalStatus === 'APPROVED';
          const isRejected = record?.approvalStatus === 'REJECTED';
          
          return (
            <Space>
              <Button
                icon={<EyeOutlined />}
                size="small"
                onClick={() => handleViewDetails(record)}
                title="View Details"
              />
              {!isApproved && !isRejected && (
                <>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    size="small"
                    onClick={() => handleApprove(record.id)}
                    title="Approve"
                  />
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    size="small"
                    onClick={() => {
                      setSelectedInvitation(record);
                      setRejectModalVisible(true);
                    }}
                    title="Reject"
                  />
                </>
              )}
              {isApproved && (
                <Tag color="green" icon={<CheckCircleOutlined />}>
                  Approved
                </Tag>
              )}
              {isRejected && (
                <Tag color="red" icon={<CloseCircleOutlined />}>
                  Rejected
                </Tag>
              )}
            </Space>
          );
        }
        return <span style={{ color: '#999' }}>-</span>;
      },
    },
  ], [handleApprove, handleViewDetails]);

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <MailOutlined /> Invitations
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          Send Invitation
        </Button>
      </div>

      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            {/* PHASE 1: Add tabs for filtering invitations */}
            <Tabs
              activeKey={activeTab}
              onChange={(key) => {
                setActiveTab(key);
                fetchInvitations(key);
              }}
              items={[
                {
                  key: 'pending',
                  label: (
                    <Badge count={counts.pending} offset={[10, 0]}>
                      <span>Pending Approval</span>
                    </Badge>
                  ),
                },
                {
                  key: 'approved',
                  label: (
                    <Badge count={counts.approved} offset={[10, 0]}>
                      <span>Approved</span>
                    </Badge>
                  ),
                },
                {
                  key: 'rejected',
                  label: (
                    <Badge count={counts.rejected} offset={[10, 0]}>
                      <span>Rejected</span>
                    </Badge>
                  ),
                },
              ]}
            />
            <Button icon={<ReloadOutlined />} onClick={() => fetchInvitations(activeTab)}>
              Refresh
            </Button>
          </Space>
          <Table
            columns={columns}
            dataSource={invitations}
            loading={loading}
            rowKey={(record) => record?.id || 'unknown'}
            pagination={{ pageSize: 50 }}
          />
        </Space>
      </Card>

      <StandardModal
        title="Send Invitation"
        open={modalVisible}
        form={form}
        loading={false}
        submitText="Send"
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onFinish={handleCreate}
        initialValues={{ type: 'landlord' }}
      >
        <FormSelect
          name="type"
          label="Invitation Type"
          required
          options={[
            { label: 'Landlord', value: 'landlord' },
            { label: 'Property Management Company (PMC)', value: 'pmc' }
          ]}
        />
        <FormTextInput
          name="email"
          label="Email"
          type="email"
          required
          placeholder="email@example.com"
        />
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
        >
          {({ getFieldValue }) => {
            const type = getFieldValue('type');
            if (type === 'pmc') {
              return (
                <FormTextInput
                  name="companyName"
                  label="Company Name (Optional)"
                  placeholder="ABC Property Management"
                />
              );
            }
            return (
              <>
                <FormTextInput
                  name="firstName"
                  label="First Name (Optional)"
                />
                <FormTextInput
                  name="lastName"
                  label="Last Name (Optional)"
                />
              </>
            );
          }}
        </Form.Item>
      </StandardModal>

      <StandardModal
        title="Reject Application"
        open={rejectModalVisible}
        form={rejectForm}
        loading={false}
        submitText="Reject"
        onCancel={() => {
          setRejectModalVisible(false);
          rejectForm.resetFields();
          setSelectedInvitation(null);
        }}
        onFinish={(values) => {
          if (selectedInvitation) {
            handleReject(selectedInvitation.id, values.reason);
            setRejectModalVisible(false);
            rejectForm.resetFields();
            setSelectedInvitation(null);
          }
        }}
      >
        <FormTextInput
          name="reason"
          label="Rejection Reason"
          textArea
          rows={4}
          required
          placeholder="Explain why this application is being rejected..."
        />
      </StandardModal>

      <Modal
        title="Application Details"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setApplicationDetails(null);
          setSelectedInvitation(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setViewModalVisible(false);
            setApplicationDetails(null);
            setSelectedInvitation(null);
          }}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {loadingDetails ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : applicationDetails ? (
          <Descriptions bordered column={2}>
            {selectedInvitation?.type === 'pmc' && applicationDetails.user ? (
              <>
                <Descriptions.Item label="Company ID">{applicationDetails.user.companyId || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Company Name">{applicationDetails.user.companyName || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Email">{applicationDetails.user.email || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Phone">{applicationDetails.user.phone || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Address Line 1">{applicationDetails.user.addressLine1 || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Address Line 2">{applicationDetails.user.addressLine2 || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="City">{applicationDetails.user.city || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Province/State">{applicationDetails.user.provinceState || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Postal/Zip Code">{applicationDetails.user.postalZip || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Country (Legacy)">{applicationDetails.user.country || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Country">
                  {applicationDetails.user.countryFK 
                    ? `${applicationDetails.user.countryFK.name} (${applicationDetails.user.countryFK.code})` 
                    : applicationDetails.user.countryCode || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Region">
                  {applicationDetails.user.regionFK 
                    ? `${applicationDetails.user.regionFK.name} (${applicationDetails.user.regionFK.code})` 
                    : applicationDetails.user.regionCode || 'N/A'}
                </Descriptions.Item>
                {applicationDetails.user.defaultCommissionRate !== null && applicationDetails.user.defaultCommissionRate !== undefined && (
                  <Descriptions.Item label="Default Commission Rate" span={2}>
                    {(applicationDetails.user.defaultCommissionRate * 100).toFixed(2)}%
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Status">
                  <Tag color={applicationDetails.approvalStatus === 'APPROVED' ? 'green' : applicationDetails.approvalStatus === 'REJECTED' ? 'red' : 'orange'}>
                    {applicationDetails.approvalStatus}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {applicationDetails.user.createdAt ? new Date(applicationDetails.user.createdAt).toLocaleString() : 'N/A'}
                </Descriptions.Item>
                {applicationDetails.user.approvedAt && (
                  <Descriptions.Item label="Approved At">
                    {new Date(applicationDetails.user.approvedAt).toLocaleString()}
                  </Descriptions.Item>
                )}
                {applicationDetails.user.rejectedAt && (
                  <Descriptions.Item label="Rejected At">
                    {new Date(applicationDetails.user.rejectedAt).toLocaleString()}
                  </Descriptions.Item>
                )}
                {applicationDetails.user.rejectionReason && (
                  <Descriptions.Item label="Rejection Reason" span={2}>
                    {applicationDetails.user.rejectionReason}
                  </Descriptions.Item>
                )}
              </>
            ) : selectedInvitation?.type === 'landlord' && applicationDetails.user ? (
              <>
                <Descriptions.Item label="Email">{applicationDetails.user.email || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="First Name">{applicationDetails.user.firstName || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Last Name">{applicationDetails.user.lastName || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Phone">{applicationDetails.user.phone || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={applicationDetails.approvalStatus === 'APPROVED' ? 'green' : applicationDetails.approvalStatus === 'REJECTED' ? 'red' : 'orange'}>
                    {applicationDetails.approvalStatus}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {applicationDetails.user.createdAt ? new Date(applicationDetails.user.createdAt).toLocaleString() : 'N/A'}
                </Descriptions.Item>
                {applicationDetails.user.rejectionReason && (
                  <Descriptions.Item label="Rejection Reason" span={2}>
                    {applicationDetails.user.rejectionReason}
                  </Descriptions.Item>
                )}
              </>
            ) : (
              <Descriptions.Item span={2}>No details available</Descriptions.Item>
            )}
          </Descriptions>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>No application details found</div>
        )}
      </Modal>
    </div>
  );
}

