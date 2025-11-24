"use client";

import { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Textarea, Label, Spinner, Alert } from 'flowbite-react';
import { HiCheckCircle, HiXCircle, HiEye, HiCurrencyDollar, HiWrench, HiRefresh } from 'react-icons/hi';
import { ProCard } from './LazyProComponents';
import { formatDateDisplay } from '@/lib/utils/safe-date-formatter';
import { useFormState } from '@/lib/hooks/useFormState';
import { notify } from '@/lib/utils/notification-helper';

/**
 * Component to display and manage approval requests for landlords
 */
export default function ApprovalRequestsList() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const approveForm = useFormState({ notes: '' });
  const rejectForm = useFormState({ reason: '' });

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
      notify.error(error.message || 'Failed to load approval requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    const values = approveForm.getFieldsValue();

    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.approveApproval(selectedApproval.id, values.notes || null);
      
      if (data.success || data) {
        notify.success('Approval request approved');
        setApproveModalVisible(false);
        setSelectedApproval(null);
        approveForm.resetForm();
        fetchApprovals();
      }
    } catch (error) {
      console.error('[Approve Request] Error:', error);
      notify.error(error.message || 'Failed to approve request');
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    const values = rejectForm.getFieldsValue();

    if (!values.reason || values.reason.length < 10) {
      notify.error('Please provide a reason for rejection (at least 10 characters)');
      return;
    }

    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.rejectApproval(selectedApproval.id, values.reason);
      
      if (data.success || data) {
        notify.success('Approval request rejected');
        setRejectModalVisible(false);
        setSelectedApproval(null);
        rejectForm.resetForm();
        fetchApprovals();
      }
    } catch (error) {
      console.error('[Reject Request] Error:', error);
      notify.error(error.message || 'Failed to reject request');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'warning',
      APPROVED: 'success',
      REJECTED: 'failure',
      CANCELLED: 'gray',
    };
    return colors[status] || 'gray';
  };

  const getApprovalTypeIcon = (type) => {
    if (type === 'EXPENSE') return <HiCurrencyDollar className="h-4 w-4" />;
    return <HiWrench className="h-4 w-4" />;
  };

  const pendingCount = approvals.filter(a => a.status === 'PENDING').length;

  return (
    <div>
      <ProCard className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Approval Requests</h3>
            {pendingCount > 0 && (
              <Badge color="warning">{pendingCount}</Badge>
            )}
          </div>
          <Button
            color="light"
            onClick={fetchApprovals}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <HiRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Type</Table.HeadCell>
              <Table.HeadCell>Title</Table.HeadCell>
              <Table.HeadCell>PMC</Table.HeadCell>
              <Table.HeadCell>Amount</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Requested</Table.HeadCell>
              <Table.HeadCell>Action</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {loading ? (
                <Table.Row>
                  <Table.Cell colSpan={7} className="text-center py-8">
                    <Spinner size="xl" />
                  </Table.Cell>
                </Table.Row>
              ) : approvals.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={7} className="text-center py-8">
                    <p className="text-gray-500">No approval requests found</p>
                  </Table.Cell>
                </Table.Row>
              ) : (
                approvals.map((approval) => (
                  <Table.Row key={approval.id}>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        {getApprovalTypeIcon(approval.approvalType)}
                        <span>{approval.approvalType.replace(/_/g, ' ')}</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>{approval.title}</Table.Cell>
                    <Table.Cell>
                      {approval.pmcLandlord?.pmc?.companyName || 'Unknown PMC'}
                    </Table.Cell>
                    <Table.Cell>
                      {approval.amount ? `$${approval.amount.toLocaleString()}` : '-'}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={getStatusColor(approval.status)}>
                        {approval.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {approval.requestedAt ? formatDateDisplay(approval.requestedAt) : '-'}
                    </Table.Cell>
                    <Table.Cell>
                      {approval.status === 'PENDING' ? (
                        <div className="flex items-center gap-2">
                          <Button
                            color="success"
                            size="sm"
                            onClick={() => {
                              setSelectedApproval(approval);
                              setApproveModalVisible(true);
                            }}
                            className="flex items-center gap-1"
                          >
                            <HiCheckCircle className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            color="failure"
                            size="sm"
                            onClick={() => {
                              setSelectedApproval(approval);
                              setRejectModalVisible(true);
                            }}
                            className="flex items-center gap-1"
                          >
                            <HiXCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <Badge color={getStatusColor(approval.status)}>
                          {approval.status}
                        </Badge>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>
      </ProCard>

      {/* Approve Modal */}
      <Modal
        show={approveModalVisible}
        onClose={() => {
          setApproveModalVisible(false);
          setSelectedApproval(null);
          approveForm.resetForm();
        }}
        size="md"
      >
        <Modal.Header>Approve Request</Modal.Header>
        <Modal.Body>
          {selectedApproval && (
            <div className="space-y-4">
              <div>
                <p><strong>Title:</strong> {selectedApproval.title}</p>
                {selectedApproval.amount && (
                  <p><strong>Amount:</strong> ${selectedApproval.amount.toLocaleString()}</p>
                )}
                {selectedApproval.description && (
                  <p><strong>Description:</strong> {selectedApproval.description}</p>
                )}
              </div>
              <form onSubmit={handleApprove} className="space-y-4">
                <div>
                  <Label htmlFor="notes" className="mb-2 block">
                    Approval Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    placeholder="Add any notes about this approval..."
                    value={approveForm.values.notes}
                    onChange={(e) => approveForm.setFieldsValue({ notes: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    color="gray"
                    onClick={() => {
                      setApproveModalVisible(false);
                      setSelectedApproval(null);
                      approveForm.resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" color="success">
                    Approve
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Reject Modal */}
      <Modal
        show={rejectModalVisible}
        onClose={() => {
          setRejectModalVisible(false);
          setSelectedApproval(null);
          rejectForm.resetForm();
        }}
        size="md"
      >
        <Modal.Header>Reject Request</Modal.Header>
        <Modal.Body>
          {selectedApproval && (
            <div className="space-y-4">
              <div>
                <p><strong>Title:</strong> {selectedApproval.title}</p>
                {selectedApproval.amount && (
                  <p><strong>Amount:</strong> ${selectedApproval.amount.toLocaleString()}</p>
                )}
              </div>
              <form onSubmit={handleReject} className="space-y-4">
                <div>
                  <Label htmlFor="reason" className="mb-2 block">
                    Rejection Reason <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="reason"
                    rows={4}
                    placeholder="Explain why you are rejecting this request..."
                    value={rejectForm.values.reason}
                    onChange={(e) => rejectForm.setFieldsValue({ reason: e.target.value })}
                    required
                    minLength={10}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Minimum 10 characters required
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    color="gray"
                    onClick={() => {
                      setRejectModalVisible(false);
                      setSelectedApproval(null);
                      rejectForm.resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    color="failure"
                    disabled={!rejectForm.values.reason || rejectForm.values.reason.length < 10}
                  >
                    Reject
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
