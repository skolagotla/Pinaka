"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Button, Badge, Tabs, Modal, Spinner, Alert, Textarea, Label } from 'flowbite-react';
import { StandardModal, FormTextInput, FormSelect, PageLayout } from '@/components/shared';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import { useFormState } from '@/lib/hooks/useFormState';
import {
  HiMail,
  HiPlus,
  HiRefresh,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiEye,
} from 'react-icons/hi';

export default function AdminInvitationsPage() {
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [applicationDetails, setApplicationDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const formState = useFormState({ type: 'landlord', email: '', companyName: '', firstName: '', lastName: '' });
  const rejectFormState = useFormState({ reason: '' });
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
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

  const handleCreate = async () => {
    try {
      const values = formState.values;
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
        setSuccessMessage('Invitation sent successfully');
        setErrorMessage(null);
        setModalVisible(false);
        formState.resetFields();
        fetchInvitations(activeTab);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setErrorMessage(data.error || 'Failed to send invitation');
        setSuccessMessage(null);
      }
    } catch (err) {
      console.error('Failed to send invitation:', err);
      setErrorMessage(err?.message || 'Failed to send invitation');
      setSuccessMessage(null);
    }
  };

  const handleApprove = useCallback(async (invitationId) => {
    try {
      // Find the invitation to get the application ID
      const invitation = invitations.find((inv) => inv.id === invitationId);
      if (!invitation || invitation.status !== 'completed') {
        setErrorMessage('Only completed invitations can be approved');
        setSuccessMessage(null);
        return;
      }

      // Get the application based on invitation type
      const applicationType = invitation.type;
      const response = await fetch(`/api/admin/applications/${invitationId}/approve`, {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMessage('Application approved successfully');
        setErrorMessage(null);
        fetchInvitations(activeTab);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setErrorMessage(data.error || 'Failed to approve application');
        setSuccessMessage(null);
      }
    } catch (err) {
      setErrorMessage('Failed to approve application');
      setSuccessMessage(null);
    }
  }, [invitations, fetchInvitations, activeTab]);

  const handleReject = useCallback(async (invitationId, reason) => {
    try {
      const invitation = invitations.find((inv) => inv.id === invitationId);
      if (!invitation || invitation.status !== 'completed') {
        setErrorMessage('Only completed invitations can be rejected');
        setSuccessMessage(null);
        return;
      }

      const response = await fetch(`/api/admin/applications/${invitationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMessage('Application rejected');
        setErrorMessage(null);
        fetchInvitations(activeTab);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setErrorMessage(data.error || 'Failed to reject application');
        setSuccessMessage(null);
      }
    } catch (err) {
      setErrorMessage('Failed to reject application');
      setSuccessMessage(null);
    }
  }, [invitations, fetchInvitations, activeTab]);

  const handleViewDetails = useCallback(async (invitation) => {
    if (!invitation || invitation.status !== 'completed') {
      setErrorMessage('Only completed invitations can be viewed');
      setSuccessMessage(null);
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
        setErrorMessage(data.error || 'Failed to fetch application details');
        setApplicationDetails(null);
      }
    } catch (err) {
      console.error('Error fetching application details:', err);
      setErrorMessage('Failed to fetch application details');
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
      render: (type) => type ? <Badge color="blue">{type.toUpperCase()}</Badge> : <Badge color="gray">N/A</Badge>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (!status) return <Badge color="gray">N/A</Badge>;
        const colors = {
          pending: 'warning',
          sent: 'info',
          opened: 'info',
          completed: 'success',
          expired: 'gray',
          cancelled: 'failure',
        };
        return <Badge color={colors[status] || 'gray'}>{status.toUpperCase()}</Badge>;
      },
    },
    {
      title: 'Approval Status',
      key: 'approvalStatus',
      render: (_, record) => {
        if (record?.status !== 'completed') {
          return <Badge color="gray">N/A</Badge>;
        }
        const approvalStatus = record?.approvalStatus;
        if (!approvalStatus || approvalStatus === 'PENDING') {
          return <Badge color="warning" icon={HiClock}>Pending Approval</Badge>;
        }
        if (approvalStatus === 'APPROVED') {
          return <Badge color="success" icon={HiCheckCircle}>Approved</Badge>;
        }
        if (approvalStatus === 'REJECTED') {
          return <Badge color="failure" icon={HiXCircle}>Rejected</Badge>;
        }
        return <Badge color="gray">{approvalStatus}</Badge>;
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
            <div className="flex items-center gap-2">
              <Button
                size="xs"
                color="gray"
                onClick={() => handleViewDetails(record)}
                title="View Details"
              >
                <HiEye className="h-4 w-4" />
              </Button>
              {!isApproved && !isRejected && (
                <>
                  <Button
                    size="xs"
                    color="success"
                    onClick={() => handleApprove(record.id)}
                    title="Approve"
                  >
                    <HiCheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    size="xs"
                    color="failure"
                    onClick={() => {
                      setSelectedInvitation(record);
                      setRejectModalVisible(true);
                    }}
                    title="Reject"
                  >
                    <HiXCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
              {isApproved && (
                <Badge color="success" icon={HiCheckCircle}>
                  Approved
                </Badge>
              )}
              {isRejected && (
                <Badge color="failure" icon={HiXCircle}>
                  Rejected
                </Badge>
              )}
            </div>
          );
        }
        return <span className="text-gray-400">-</span>;
      },
    },
  ], [handleApprove, handleViewDetails]);

  return (
    <PageLayout
      headerTitle={
        <div className="flex items-center gap-2">
          <HiMail className="h-5 w-5" />
          <span>Invitations</span>
        </div>
      }
      headerActions={[
        <Button key="send" color="blue" onClick={() => setModalVisible(true)}>
          <HiPlus className="mr-2 h-4 w-4" />
          Send Invitation
        </Button>
      ]}
      contentStyle={{ maxWidth: 1400, margin: '0 auto' }}
    >
      {successMessage && (
        <Alert color="success" className="mb-6" onDismiss={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert color="failure" className="mb-6" onDismiss={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Tabs
              aria-label="Invitation tabs"
              variant="underline"
              onActiveTabChange={(tabIndex) => {
                const tabKeys = ['pending', 'approved', 'rejected'];
                const selectedKey = tabKeys[tabIndex];
                if (selectedKey) {
                  setActiveTab(selectedKey);
                  fetchInvitations(selectedKey);
                }
              }}
            >
              <Tabs.Item active={activeTab === 'pending'} title={
                <div className="flex items-center gap-2">
                  <span>Pending Approval</span>
                  {counts.pending > 0 && (
                    <Badge color="warning" size="sm">{counts.pending}</Badge>
                  )}
                </div>
              }>
                <div className="pt-4"></div>
              </Tabs.Item>
              <Tabs.Item active={activeTab === 'approved'} title={
                <div className="flex items-center gap-2">
                  <span>Approved</span>
                  {counts.approved > 0 && (
                    <Badge color="success" size="sm">{counts.approved}</Badge>
                  )}
                </div>
              }>
                <div className="pt-4"></div>
              </Tabs.Item>
              <Tabs.Item active={activeTab === 'rejected'} title={
                <div className="flex items-center gap-2">
                  <span>Rejected</span>
                  {counts.rejected > 0 && (
                    <Badge color="failure" size="sm">{counts.rejected}</Badge>
                  )}
                </div>
              }>
                <div className="pt-4"></div>
              </Tabs.Item>
            </Tabs>
            <Button color="gray" onClick={() => fetchInvitations(activeTab)}>
              <HiRefresh className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
          <FlowbiteTable
            columns={columns}
            dataSource={invitations}
            loading={loading}
            rowKey={(record) => record?.id || 'unknown'}
            pagination={{ pageSize: 50 }}
          />
        </div>
      </Card>

      <StandardModal
        title="Send Invitation"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          formState.resetFields();
        }}
        onFinish={handleCreate}
        submitText="Send"
      >
        <div className="space-y-4">
          <FormSelect
            name="type"
            label="Invitation Type"
            value={formState.values.type}
            onChange={(e) => formState.setFieldsValue({ type: e.target.value })}
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
            value={formState.values.email}
            onChange={(e) => formState.setFieldsValue({ email: e.target.value })}
            required
            placeholder="email@example.com"
          />
          {formState.values.type === 'pmc' ? (
            <FormTextInput
              name="companyName"
              label="Company Name (Optional)"
              value={formState.values.companyName}
              onChange={(e) => formState.setFieldsValue({ companyName: e.target.value })}
              placeholder="ABC Property Management"
            />
          ) : (
            <>
              <FormTextInput
                name="firstName"
                label="First Name (Optional)"
                value={formState.values.firstName}
                onChange={(e) => formState.setFieldsValue({ firstName: e.target.value })}
              />
              <FormTextInput
                name="lastName"
                label="Last Name (Optional)"
                value={formState.values.lastName}
                onChange={(e) => formState.setFieldsValue({ lastName: e.target.value })}
              />
            </>
          )}
        </div>
      </StandardModal>

      <StandardModal
        title="Reject Application"
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          rejectFormState.resetFields();
          setSelectedInvitation(null);
        }}
        onFinish={() => {
          if (selectedInvitation) {
            handleReject(selectedInvitation.id, rejectFormState.values.reason);
            setRejectModalVisible(false);
            rejectFormState.resetFields();
            setSelectedInvitation(null);
          }
        }}
        submitText="Reject"
        submitColor="failure"
      >
        <div>
          <Label htmlFor="reason" className="mb-2 block">
            Rejection Reason
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Textarea
            id="reason"
            name="reason"
            value={rejectFormState.values.reason}
            onChange={(e) => rejectFormState.setFieldsValue({ reason: e.target.value })}
            required
            rows={4}
            placeholder="Explain why this application is being rejected..."
          />
        </div>
      </StandardModal>

      <Modal
        show={viewModalVisible}
        onClose={() => {
          setViewModalVisible(false);
          setApplicationDetails(null);
          setSelectedInvitation(null);
        }}
        size="xl"
      >
        <Modal.Header>Application Details</Modal.Header>
        <Modal.Body>
          {loadingDetails ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="xl" />
            </div>
          ) : applicationDetails ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedInvitation?.type === 'pmc' && applicationDetails.user ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Company ID</label>
                      <p className="text-sm text-gray-900 dark:text-white">{applicationDetails.user.companyId || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Name</label>
                      <p className="text-sm text-gray-900 dark:text-white">{applicationDetails.user.companyName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                      <p className="text-sm text-gray-900 dark:text-white">{applicationDetails.user.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                      <p className="text-sm text-gray-900 dark:text-white">{applicationDetails.user.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address Line 1</label>
                      <p className="text-sm text-gray-900 dark:text-white">{applicationDetails.user.addressLine1 || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address Line 2</label>
                      <p className="text-sm text-gray-900 dark:text-white">{applicationDetails.user.addressLine2 || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">City</label>
                      <p className="text-sm text-gray-900 dark:text-white">{applicationDetails.user.city || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Province/State</label>
                      <p className="text-sm text-gray-900 dark:text-white">{applicationDetails.user.provinceState || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Postal/Zip Code</label>
                      <p className="text-sm text-gray-900 dark:text-white">{applicationDetails.user.postalZip || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Country</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {applicationDetails.user.countryFK 
                          ? `${applicationDetails.user.countryFK.name} (${applicationDetails.user.countryFK.code})` 
                          : applicationDetails.user.countryCode || applicationDetails.user.country || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Region</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {applicationDetails.user.regionFK 
                          ? `${applicationDetails.user.regionFK.name} (${applicationDetails.user.regionFK.code})` 
                          : applicationDetails.user.regionCode || 'N/A'}
                      </p>
                    </div>
                    {applicationDetails.user.defaultCommissionRate !== null && applicationDetails.user.defaultCommissionRate !== undefined && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Default Commission Rate</label>
                        <p className="text-sm text-gray-900 dark:text-white">{(applicationDetails.user.defaultCommissionRate * 100).toFixed(2)}%</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                      <div className="mt-1">
                        <Badge color={applicationDetails.approvalStatus === 'APPROVED' ? 'success' : applicationDetails.approvalStatus === 'REJECTED' ? 'failure' : 'warning'}>
                          {applicationDetails.approvalStatus}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {applicationDetails.user.createdAt ? new Date(applicationDetails.user.createdAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    {applicationDetails.user.approvedAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved At</label>
                        <p className="text-sm text-gray-900 dark:text-white">{new Date(applicationDetails.user.approvedAt).toLocaleString()}</p>
                      </div>
                    )}
                    {applicationDetails.user.rejectedAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejected At</label>
                        <p className="text-sm text-gray-900 dark:text-white">{new Date(applicationDetails.user.rejectedAt).toLocaleString()}</p>
                      </div>
                    )}
                    {applicationDetails.user.rejectionReason && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejection Reason</label>
                        <p className="text-sm text-gray-900 dark:text-white">{applicationDetails.user.rejectionReason}</p>
                      </div>
                    )}
                  </>
                ) : selectedInvitation?.type === 'landlord' && applicationDetails.user ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                      <p className="text-sm text-gray-900 dark:text-white">{applicationDetails.user.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">First Name</label>
                      <p className="text-sm text-gray-900 dark:text-white">{applicationDetails.user.firstName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Name</label>
                      <p className="text-sm text-gray-900 dark:text-white">{applicationDetails.user.lastName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                      <p className="text-sm text-gray-900 dark:text-white">{applicationDetails.user.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                      <div className="mt-1">
                        <Badge color={applicationDetails.approvalStatus === 'APPROVED' ? 'success' : applicationDetails.approvalStatus === 'REJECTED' ? 'failure' : 'warning'}>
                          {applicationDetails.approvalStatus}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {applicationDetails.user.createdAt ? new Date(applicationDetails.user.createdAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    {applicationDetails.user.rejectionReason && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejection Reason</label>
                        <p className="text-sm text-gray-900 dark:text-white">{applicationDetails.user.rejectionReason}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="md:col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">No details available</div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">No application details found</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => {
            setViewModalVisible(false);
            setApplicationDetails(null);
            setSelectedInvitation(null);
          }}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </PageLayout>
  );
}

