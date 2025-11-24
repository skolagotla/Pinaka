/**
 * PMC Invitations Component - Migrated to Flowbite UI + v2 FastAPI
 * 
 * Uses v2 API endpoints for invitation management
 * UI converted from Ant Design to Flowbite
 * 
 * NOTE: Approval/rejection workflow may need additional v2 backend endpoints
 */
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Button, Modal, TextInput, Label, Select, Textarea,
  Badge, Spinner, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell
} from 'flowbite-react';
import {
  HiMail, HiPlus, HiRefresh, HiEye, HiCheckCircle, HiXCircle
} from 'react-icons/hi';
import { PageLayout } from '@/components/shared';
import { notify } from '@/lib/utils/notification-helper';
import { useModalState } from '@/lib/hooks/useModalState';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useInvitations, useCreateInvitation } from '@/lib/hooks/useV2Data';
import { useFormState } from '@/lib/hooks/useFormState';
import { renderStatus, renderDate } from '@/components/shared/FlowbiteTableRenderers';
import { v2Api } from '@/lib/api/v2-client';

export default function PMCInvitationsClient({ initialInvitations = [] }) {
  const { user } = useV2Auth();
  const organizationId = user?.organization_id;
  const [approvingId, setApprovingId] = useState(null);
  const [applicationDetails, setApplicationDetails] = useState(null);
  
  const { isOpen: modalVisible, open: openModal, close: closeModal } = useModalState();
  const { isOpen: viewModalVisible, open: openViewModal, close: closeViewModal } = useModalState();
  const { isOpen: rejectModalVisible, open: openRejectModal, close: closeRejectModal } = useModalState();
  
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [rejectingInvitation, setRejectingInvitation] = useState(null);

  // Load invitations using v2 API
  const { data: invitationsData, isLoading, refetch } = useInvitations(organizationId);
  const invitations = invitationsData && Array.isArray(invitationsData) ? invitationsData : (initialInvitations.length > 0 ? initialInvitations : []);

  const createInvitation = useCreateInvitation();

  const invitationForm = useFormState({
    email: '',
    role_name: 'tenant',
    expires_in_days: 7,
  });

  const rejectForm = useFormState({
    reason: '',
  });

  const handleCreate = async () => {
    try {
      const values = invitationForm.getFieldsValue();
      
      if (!values.email || !values.role_name) {
        notify.error('Email and role are required');
        return;
      }

      await createInvitation.mutateAsync({
        organization_id: organizationId,
        email: values.email,
        role_name: values.role_name,
        expires_in_days: values.expires_in_days || 7,
      });

      notify.success('Invitation sent successfully');
      closeModal();
      invitationForm.reset();
      refetch();
    } catch (error) {
      console.error('[PMC Invitations] Error creating invitation:', error);
      notify.error(error.message || 'Failed to send invitation');
    }
  };

  const handleViewDetails = useCallback(async (invitation) => {
    if (!invitation || invitation.status !== 'accepted') {
      notify.warning('Only accepted invitations can be viewed');
      return;
    }

    setSelectedInvitation(invitation);
    openViewModal();

    // TODO: Fetch application details - may need additional v2 endpoint
    // For now, just show invitation details
    setApplicationDetails({
      invitation: invitation,
      // Additional details would come from a separate endpoint
    });
  }, []);

  const handleApprove = useCallback(async (invitationId) => {
    if (approvingId) {
      return; // Prevent multiple clicks
    }
    
    try {
      setApprovingId(invitationId);
      
      // TODO: Implement approval endpoint in v2 API
      // For now, this is a placeholder
      notify.warning('Approval functionality requires additional v2 backend endpoint');
      
      // Placeholder for future implementation:
      // await v2Api.approveInvitationApplication(invitationId);
      // notify.success('Application approved successfully');
      // refetch();
    } catch (err) {
      console.error('[PMC Invitations] Approve error:', err);
      notify.error(`Failed to approve application: ${err.message || 'Unknown error'}`);
    } finally {
      setApprovingId(null);
    }
  }, [approvingId]);

  const handleReject = useCallback(async (invitationId, reason) => {
    try {
      // TODO: Implement rejection endpoint in v2 API
      notify.warning('Rejection functionality requires additional v2 backend endpoint');
      
      // Placeholder for future implementation:
      // await v2Api.rejectInvitationApplication(invitationId, reason);
      // notify.success('Application rejected');
      // refetch();
    } catch (err) {
      notify.error('Failed to reject application');
    }
  }, []);

  const columns = useMemo(() => [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role_name',
      key: 'role_name',
      render: (role) => role ? <Badge color="blue">{role.toUpperCase()}</Badge> : <Badge color="gray">N/A</Badge>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (!status) return <Badge color="gray">N/A</Badge>;
        const statusMap = {
          pending: 'Pending',
          accepted: 'Accepted',
          expired: 'Expired',
          cancelled: 'Cancelled'
        };
        return renderStatus(statusMap[status] || status, {
          customColors: {
            'Pending': 'warning',
            'Accepted': 'success',
            'Expired': 'failure',
            'Cancelled': 'gray'
          }
        });
      },
    },
    {
      title: 'Expires',
      dataIndex: 'expires_at',
      key: 'expires_at',
      render: (_, record) => renderDate(record.expires_at),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (_, record) => renderDate(record.created_at),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_text, record) => {
        if (record?.status === 'accepted') {
          // TODO: Add approval/rejection when backend endpoints are available
          return (
            <div className="flex gap-2">
              <Button
                size="xs"
                color="light"
                onClick={() => handleViewDetails(record)}
                title="View Details"
              >
                <HiEye className="h-4 w-4" />
              </Button>
              {/* Approval/rejection buttons will be added when backend endpoints are ready */}
            </div>
          );
        }
        return <span className="text-gray-400">—</span>;
      },
    },
  ], [handleViewDetails]);

  return (
    <PageLayout
      title="Invitations"
      actions={[
        {
          key: 'refresh',
          icon: <HiRefresh className="h-5 w-5" />,
          label: 'Refresh',
          onClick: () => refetch(),
        },
        {
          key: 'add',
          icon: <HiPlus className="h-5 w-5" />,
          label: 'Send Invitation',
          type: 'primary',
          onClick: openModal,
        }
      ]}
    >
      <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="xl" />
          </div>
        ) : (
          <Table hoverable>
            <TableHead className="bg-gray-50 dark:bg-gray-800">
              <TableRow>
                {columns.map((col, idx) => (
                  <TableHeadCell key={idx}>
                    {col.title}
                  </TableHeadCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {invitations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                    No invitations found
                  </TableCell>
                </TableRow>
              ) : (
                invitations.map((record, rowIdx) => {
                  const key = record?.id || rowIdx;
                  return (
                    <TableRow key={key} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      {columns.map((col, colIdx) => {
                        const value = col.dataIndex ? record[col.dataIndex] : null;
                        return (
                           <TableCell key={colIdx}>
                            {col.render ? col.render(value, record, rowIdx) : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create Invitation Modal */}
      <Modal show={modalVisible} onClose={closeModal} size="md">
        <Modal.Header>Send Invitation</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label htmlFor="role_name" className="mb-2 block">
                Invitation Type <span className="text-red-500">*</span>
              </Label>
              <Select
                id="role_name"
                value={invitationForm.getFieldValue('role_name') || 'tenant'}
                onChange={(e) => invitationForm.setField('role_name', e.target.value)}
                required
              >
                <option value="tenant">Tenant</option>
                <option value="landlord">Landlord</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="email" className="mb-2 block">
                Email <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id="email"
                type="email"
                value={invitationForm.getFieldValue('email') || ''}
                onChange={(e) => invitationForm.setField('email', e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="expires_in_days" className="mb-2 block">
                Expires In (Days)
              </Label>
              <TextInput
                id="expires_in_days"
                type="number"
                value={invitationForm.getFieldValue('expires_in_days') || 7}
                onChange={(e) => invitationForm.setField('expires_in_days', parseInt(e.target.value) || 7)}
                min={1}
                max={30}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={closeModal} color="gray">
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            color="blue"
            disabled={createInvitation.isPending}
          >
            {createInvitation.isPending ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Sending...
              </>
            ) : (
              'Send Invitation'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Details Modal */}
      <Modal show={viewModalVisible} onClose={closeViewModal} size="lg">
        <Modal.Header>Application Details</Modal.Header>
        <Modal.Body>
          {applicationDetails ? (
            <div className="space-y-4">
              {selectedInvitation && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold">Email</Label>
                      <p className="text-gray-700 dark:text-gray-300">{selectedInvitation.email || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Role</Label>
                      <p className="text-gray-700 dark:text-gray-300">{selectedInvitation.role_name || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Status</Label>
                      <p className="text-gray-700 dark:text-gray-300">
                        {renderStatus(selectedInvitation.status || 'N/A')}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Created</Label>
                      <p className="text-gray-700 dark:text-gray-300">
                        {renderDate(selectedInvitation.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Note:</strong> Full application details require additional v2 backend endpoints.
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No application details found
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={closeViewModal} color="gray">
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Modal */}
      <Modal show={rejectModalVisible} onClose={closeRejectModal} size="md">
        <Modal.Header>Reject Application</Modal.Header>
        <Modal.Body>
          <div>
            <Label htmlFor="reason" className="mb-2 block">
              Rejection Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              rows={4}
              value={rejectForm.getFieldValue('reason') || ''}
              onChange={(e) => rejectForm.setField('reason', e.target.value)}
              placeholder="Explain why this application is being rejected..."
              required
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={closeRejectModal} color="gray">
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (rejectingInvitation) {
                handleReject(rejectingInvitation.id, rejectForm.getFieldValue('reason'));
                closeRejectModal();
                rejectForm.reset();
              }
            }}
            color="failure"
          >
            Reject
          </Button>
        </Modal.Footer>
      </Modal>
    </PageLayout>
  );
}
