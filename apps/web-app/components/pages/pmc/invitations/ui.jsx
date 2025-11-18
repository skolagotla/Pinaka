"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Tag,
  Select,
  Descriptions,
} from 'antd';
import {
  MailOutlined,
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { PageLayout, TableWrapper, StandardModal, FormTextInput, FormSelect, renderDate } from '@/components/shared';
import { notify } from '@/lib/utils/notification-helper';
import { useLoading } from '@/lib/hooks/useLoading';
import { useModalState } from '@/lib/hooks/useModalState';

export default function PMCInvitationsClient({ initialInvitations = [] }) {
  const { loading, withLoading: withLoadingFetch } = useLoading();
  const { loading: loadingDetails, withLoading: withLoadingDetails } = useLoading();
  const { loading: submitting, withLoading: withLoadingSubmit } = useLoading();
  const [invitations, setInvitations] = useState(initialInvitations);
  const { isOpen: modalVisible, open: openModal, close: closeModal, openForCreate: openModalForCreate } = useModalState();
  const { isOpen: viewModalVisible, open: openViewModal, close: closeViewModal, editingItem: selectedInvitation, openForEdit: openViewModalForEdit } = useModalState();
  const { isOpen: rejectModalVisible, open: openRejectModal, close: closeRejectModal, editingItem: rejectingInvitation, openForEdit: openRejectModalForEdit } = useModalState();
  const [applicationDetails, setApplicationDetails] = useState(null);
  const [form] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const [approvingId, setApprovingId] = useState(null);

  const fetchInvitations = useCallback(async () => {
    await withLoadingFetch(async () => {
      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.invitations.list({ page: 1, limit: 1000 });
      const invitationsData = response.data?.invitations || response.data?.data || response.data || [];
      const processedInvitations = Array.isArray(invitationsData) ? invitationsData : [];
      console.log('[PMC Invitations] Fetched invitations:', processedInvitations.length);
      // Log approval status for completed invitations
      processedInvitations.forEach(inv => {
        if (inv.status === 'completed') {
          console.log(`[PMC Invitations] Invitation ${inv.id} (${inv.type}): approvalStatus=${inv.approvalStatus}`);
        }
      });
      setInvitations(processedInvitations);
    }).catch(err => {
      console.error('Error fetching invitations:', err);
      setInvitations([]);
    });
  }, [withLoadingFetch]);

  useEffect(() => {
    // Only fetch if we don't have initial data or want to refresh
    if (initialInvitations.length === 0) {
      fetchInvitations();
    }
  }, [fetchInvitations, initialInvitations.length]);

  const handleCreate = async (values) => {
    await withLoadingSubmit(async () => {
      console.log('[PMC Invitations] Sending invitation:', values);
      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.invitations.create({
        email: values.email,
        type: values.type || 'tenant',
        metadata: {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
        },
        propertyId: values.propertyId || null,
        unitId: values.unitId || null,
      });
      console.log('[PMC Invitations] API Response:', response);
      
      notify.success('Invitation sent successfully');
      closeModal();
      form.resetFields();
      await fetchInvitations();
    }).catch(err => {
      console.error('[PMC Invitations] Network Error:', err);
      notify.error('Failed to send invitation. Please check your connection and try again.');
    });
  };

  const handleViewDetails = useCallback(async (invitation) => {
    if (!invitation || invitation.status !== 'completed') {
      notify.warning('Only completed invitations can be viewed');
      return;
    }

    openViewModalForEdit(invitation);

    await withLoadingDetails(async () => {
      // Fetch application details directly from invitation ID
      const response = await fetch(`/api/invitations/${invitation.id}/application`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (response.ok && data.success && data.data) {
        setApplicationDetails(data.data);
      } else {
        notify.error(data.error || 'Failed to fetch application details');
        setApplicationDetails(null);
      }
    }).catch(err => {
      console.error('Error fetching application details:', err);
      notify.error('Failed to fetch application details');
      setApplicationDetails(null);
    });
  }, [withLoadingDetails]);

  const handleApprove = useCallback(async (invitationId) => {
    if (approvingId) {
      console.log('[PMC Invitations] Already approving, ignoring click');
      return; // Prevent multiple clicks
    }
    
    try {
      setApprovingId(invitationId);
      console.log('[PMC Invitations] Approve clicked for invitation:', invitationId);
      const invitation = invitations.find((inv) => inv.id === invitationId);
      console.log('[PMC Invitations] Found invitation:', invitation);
      
      if (!invitation) {
        notify.error('Invitation not found');
        setApprovingId(null);
        return;
      }
      
      if (invitation.status !== 'completed') {
        notify.warning('Only completed invitations can be approved');
        setApprovingId(null);
        return;
      }
      
      // Check if already approved or rejected
      // First check the invitation data, then fetch fresh status if needed
      console.log('[PMC Invitations] Invitation approval status from data:', invitation.approvalStatus);
      console.log('[PMC Invitations] Full invitation object:', JSON.stringify(invitation, null, 2));
      
      // If approval status is missing, try to fetch it from the application details API
      let currentApprovalStatus = invitation.approvalStatus;
      if (!currentApprovalStatus && invitation.status === 'completed') {
        try {
          console.log('[PMC Invitations] Approval status missing, fetching from application details...');
          const statusResponse = await fetch(`/api/invitations/${invitationId}/application`, {
            credentials: 'include',
          });
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            currentApprovalStatus = statusData.data?.approvalStatus || statusData.approvalStatus;
            console.log('[PMC Invitations] Fetched approval status:', currentApprovalStatus);
          }
        } catch (statusError) {
          console.warn('[PMC Invitations] Could not fetch approval status:', statusError);
        }
      }
      
      if (currentApprovalStatus === 'APPROVED') {
        console.log('[PMC Invitations] Application already approved, skipping API call');
        notify.warning('This application has already been approved');
        setApprovingId(null);
        // Refresh to ensure UI is up to date
        await fetchInvitations();
        return;
      }
      
      if (currentApprovalStatus === 'REJECTED') {
        console.log('[PMC Invitations] Application already rejected, skipping API call');
        notify.warning('This application has already been rejected');
        setApprovingId(null);
        return;
      }

      console.log('[PMC Invitations] Approval status is PENDING, proceeding with approval...');
      console.log('[PMC Invitations] Calling approve API...');
      const response = await fetch(`/api/applications/${invitationId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      console.log('[PMC Invitations] Approve API response status:', response.status);
      const data = await response.json();
      console.log('[PMC Invitations] Approve API response data:', data);
      
      if (response.ok && data.success) {
        notify.success('Application approved successfully');
        await fetchInvitations();
      } else {
        const errorMsg = data.error || data.message || `Failed to approve application (${response.status})`;
        console.error('[PMC Invitations] Approve failed:', errorMsg);
        
        // Handle specific error cases
        if (errorMsg.includes('already approved')) {
          notify.warning('This application has already been approved');
          // Refresh to update the UI
          await fetchInvitations();
        } else {
          notify.error(errorMsg);
        }
      }
    } catch (err) {
      console.error('[PMC Invitations] Approve error:', err);
      notify.error(`Failed to approve application: ${err.message || 'Unknown error'}`);
    } finally {
      setApprovingId(null);
    }
  }, [invitations, fetchInvitations, approvingId]);

  const handleReject = useCallback(async (invitationId, reason) => {
    try {
      const invitation = invitations.find((inv) => inv.id === invitationId);
      if (!invitation || invitation.status !== 'completed') {
        notify.warning('Only completed invitations can be rejected');
        return;
      }

      const response = await fetch(`/api/applications/${invitationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        notify.success('Application rejected');
        fetchInvitations();
      } else {
        notify.error(data.error || 'Failed to reject application');
      }
    } catch (err) {
      notify.error('Failed to reject application');
    }
  }, [invitations, fetchInvitations]);

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
        // Map invitation statuses to standard status names
        const statusMap = {
          pending: 'Pending',
          sent: 'In Progress',
          opened: 'In Progress',
          completed: 'Completed',
          expired: 'Cancelled',
          cancelled: 'Cancelled'
        };
        return renderStatus(statusMap[status] || status, {
          customColors: {
            'Pending': 'orange',
            'In Progress': 'blue',
            'Completed': 'green',
            'Cancelled': 'red',
            'Expired': 'default'
          }
        });
      },
    },
    {
      title: 'Expires',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (_, record) => renderDate(record.expiresAt),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (_, record) => renderDate(record.createdAt),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_text, record) => {
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
                    loading={approvingId === record.id}
                    disabled={approvingId !== null || record.approvalStatus === 'APPROVED' || record.approvalStatus === 'REJECTED'}
                    onClick={() => {
                      // Double-check before proceeding
                      if (record.approvalStatus === 'APPROVED' || record.approvalStatus === 'REJECTED') {
                        console.log('[PMC Invitations] Button clicked but status is:', record.approvalStatus, '- refreshing list');
                        notify.warning(`This application is already ${record.approvalStatus.toLowerCase()}`);
                        fetchInvitations();
                        return;
                      }
                      console.log('[PMC Invitations] Approve button clicked for:', record.id);
                      handleApprove(record.id);
                    }}
                    title="Approve"
                  />
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    size="small"
                    disabled={record.approvalStatus === 'APPROVED' || record.approvalStatus === 'REJECTED'}
                    onClick={() => {
                      // Double-check before proceeding
                      if (record.approvalStatus === 'APPROVED' || record.approvalStatus === 'REJECTED') {
                        console.log('[PMC Invitations] Reject button clicked but status is:', record.approvalStatus, '- refreshing list');
                        notify.warning(`This application is already ${record.approvalStatus.toLowerCase()}`);
                        fetchInvitations();
                        return;
                      }
                      openRejectModalForEdit(record);
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
  ], [handleApprove, handleViewDetails, fetchInvitations]);

  return (
    <PageLayout
      headerTitle={<><MailOutlined /> Invitations</>}
      headerActions={[
        <Button key="refresh" icon={<ReloadOutlined />} onClick={fetchInvitations} size="small">
          Refresh
        </Button>,
        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openModalForCreate} size="small">
          Send Invitation
        </Button>
      ]}
    >
      <TableWrapper>
        <Table
          columns={columns}
          dataSource={invitations}
          loading={loading}
          rowKey={(record) => record?.id || 'unknown'}
          pagination={{ pageSize: 50, showSizeChanger: true, showTotal: (total) => `Total ${total} invitations` }}
          size="middle"
        />
      </TableWrapper>

      <StandardModal
        title="Send Invitation"
        open={modalVisible}
        form={form}
        loading={submitting}
        submitText="Send"
        onCancel={() => {
          if (!submitting) {
            closeModal();
            form.resetFields();
          }
        }}
        onFinish={async (values) => {
          await handleCreate(values);
        }}
        initialValues={{ type: 'tenant' }}
      >
        <FormSelect
          name="type"
          label="Invitation Type"
          required
          options={[
            { label: 'Tenant', value: 'tenant' },
            { label: 'Landlord', value: 'landlord' }
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
              if (type === 'tenant') {
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
                    <FormTextInput
                      name="phone"
                      label="Phone (Optional)"
                    />
                  </>
                );
              } else if (type === 'landlord') {
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
                    <FormTextInput
                      name="phone"
                      label="Phone (Optional)"
                    />
                  </>
                );
              }
              return null;
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
          closeRejectModal();
          rejectForm.resetFields();
        }}
        onFinish={(values) => {
          if (rejectingInvitation) {
            handleReject(rejectingInvitation.id, values.reason);
            closeRejectModal();
            rejectForm.resetFields();
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
          closeViewModal();
          setApplicationDetails(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            closeViewModal();
            setApplicationDetails(null);
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
            {selectedInvitation?.type === 'landlord' && applicationDetails.user ? (
              <>
                <Descriptions.Item label="Landlord ID">{applicationDetails.user.landlordId || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Email">{applicationDetails.user.email || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="First Name">{applicationDetails.user.firstName || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Last Name">{applicationDetails.user.lastName || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Phone">{applicationDetails.user.phone || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Address Line 1">{applicationDetails.user.addressLine1 || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Address Line 2">{applicationDetails.user.addressLine2 || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="City">{applicationDetails.user.city || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Province/State">{applicationDetails.user.provinceState || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Postal/Zip Code">{applicationDetails.user.postalZip || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Country (Legacy)">{applicationDetails.user.country || 'N/A'}</Descriptions.Item>
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
            ) : selectedInvitation?.type === 'tenant' && applicationDetails.user ? (
              <>
                <Descriptions.Item label="Tenant ID">{applicationDetails.user.tenantId || 'N/A'}</Descriptions.Item>
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
    </PageLayout>
  );
}

