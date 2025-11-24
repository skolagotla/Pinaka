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
  Textarea,
  Label,
  Badge,
  Select,
  Spinner,
} from 'flowbite-react';
import {
  HiDocumentText,
  HiCheckCircle,
  HiXCircle,
  HiRefresh,
  HiEye,
} from 'react-icons/hi';
import { useFormState } from '@/lib/hooks/useFormState';
import { notify } from '@/lib/utils/notification-helper';

// Status tag configuration - memoized outside component
const STATUS_CONFIG: Record<string, { color: string; text: string }> = {
  PENDING: { color: 'warning', text: 'Pending' },
  APPROVED: { color: 'success', text: 'Approved' },
  REJECTED: { color: 'failure', text: 'Rejected' },
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
  const approveForm = useFormState({ comment: '' });
  const rejectForm = useFormState({ reason: '', comment: '' });
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
        notify.error(data.error || 'Failed to fetch applications');
        setApplications([]);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      notify.error('Failed to fetch applications');
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
    approveForm.resetForm();
  }, [approveForm]);

  const handleReject = useCallback((application: any) => {
    setSelectedApplication(application);
    setRejectModalVisible(true);
    rejectForm.resetForm();
  }, [rejectForm]);

  const submitApprove = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedApplication) {
      notify.error('Invalid application selected');
      return;
    }
    
    const invitationId = selectedApplication?.invitation?.id || selectedApplication?.id;
    if (!invitationId) {
      notify.error('Invalid application selected');
      return;
    }
    
    try {
      const values = approveForm.getFieldsValue();
      const endpoint = approveEndpoint.replace('{id}', invitationId);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: values.comment }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        notify.success('Application approved successfully');
        setApproveModalVisible(false);
        fetchApplications();
      } else {
        notify.error(data.error || 'Failed to approve application');
      }
    } catch (err) {
      console.error('Error approving application:', err);
      notify.error('Failed to approve application');
    }
  }, [selectedApplication, approveForm, approveEndpoint, fetchApplications]);

  const submitReject = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedApplication) {
      notify.error('Invalid application selected');
      return;
    }
    
    const invitationId = selectedApplication?.invitation?.id || selectedApplication?.id;
    if (!invitationId) {
      notify.error('Invalid application selected');
      return;
    }
    
    try {
      const values = rejectForm.getFieldsValue();
      if (!values.reason) {
        notify.error('Please provide a rejection reason');
        return;
      }
      const endpoint = rejectEndpoint.replace('{id}', invitationId);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: values.reason, comment: values.comment }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        notify.success('Application rejected successfully');
        setRejectModalVisible(false);
        fetchApplications();
      } else {
        notify.error(data.error || 'Failed to reject application');
      }
    } catch (err) {
      console.error('Error rejecting application:', err);
      notify.error('Failed to reject application');
    }
  }, [selectedApplication, rejectForm, rejectEndpoint, fetchApplications]);

  // Memoized status tag renderer
  const getStatusTag = useCallback((status) => {
    if (!status) return <Badge color="gray">N/A</Badge>;
    const config = STATUS_CONFIG[status] || { color: 'gray', text: status };
    return <Badge color={config.color as any}>{config.text}</Badge>;
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

  // Memoized detail fields renderer
  const getDetailFields = useMemo(() => {
    if (!selectedApplication) return null;
    
    // Determine type from invitation or record
    const type = selectedApplication?.invitation?.type || selectedApplication?.type || applicationType;
    const user = selectedApplication.user;
    
    if (type === 'tenant') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div><strong>Email:</strong> {user?.email || 'N/A'}</div>
          <div><strong>First Name:</strong> {user?.firstName || 'N/A'}</div>
          <div><strong>Last Name:</strong> {user?.lastName || 'N/A'}</div>
          <div><strong>Phone:</strong> {user?.phone || 'N/A'}</div>
          {user?.rejectionReason && (
            <div className="col-span-2"><strong>Rejection Reason:</strong> {user.rejectionReason}</div>
          )}
        </div>
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
        <div className="grid grid-cols-2 gap-4">
          <div><strong>Company ID:</strong> {pmc?.companyId || 'N/A'}</div>
          <div><strong>Company Name:</strong> {pmc?.companyName || 'N/A'}</div>
          <div><strong>Email:</strong> {pmc?.email || 'N/A'}</div>
          <div><strong>Phone:</strong> {pmc?.phone || 'N/A'}</div>
          <div><strong>Address Line 1:</strong> {pmc?.addressLine1 || 'N/A'}</div>
          <div><strong>Address Line 2:</strong> {pmc?.addressLine2 || 'N/A'}</div>
          <div><strong>City:</strong> {pmc?.city || 'N/A'}</div>
          <div><strong>Province/State:</strong> {pmc?.provinceState || 'N/A'}</div>
          <div><strong>Postal/Zip Code:</strong> {pmc?.postalZip || 'N/A'}</div>
          <div><strong>Country (Legacy):</strong> {pmc?.country || 'N/A'}</div>
          <div><strong>Country:</strong> {pmc?.countryFK ? `${pmc.countryFK.name} (${pmc.countryFK.code})` : pmc?.countryCode || 'N/A'}</div>
          <div><strong>Region:</strong> {pmc?.regionFK ? `${pmc.regionFK.name} (${pmc.regionFK.code})` : pmc?.regionCode || 'N/A'}</div>
          <div className="col-span-2"><strong>Full Address:</strong> {fullAddress}</div>
          {pmc?.defaultCommissionRate !== null && pmc?.defaultCommissionRate !== undefined && (
            <div className="col-span-2"><strong>Default Commission Rate:</strong> {(pmc.defaultCommissionRate * 100).toFixed(2)}%</div>
          )}
          <div><strong>Status:</strong> {getStatusTag(pmc?.approvalStatus)}</div>
          <div><strong>Created At:</strong> {pmc?.createdAt ? new Date(pmc.createdAt).toLocaleString() : 'N/A'}</div>
          {pmc?.approvedAt && <div><strong>Approved At:</strong> {new Date(pmc.approvedAt).toLocaleString()}</div>}
          {pmc?.rejectedAt && <div><strong>Rejected At:</strong> {new Date(pmc.rejectedAt).toLocaleString()}</div>}
          {pmc?.rejectionReason && (
            <div className="col-span-2"><strong>Rejection Reason:</strong> {pmc.rejectionReason}</div>
          )}
        </div>
      );
    } else if (type === 'landlord') {
      // Landlord details
      return (
        <div className="grid grid-cols-2 gap-4">
          <div><strong>Email:</strong> {user?.email || 'N/A'}</div>
          <div><strong>First Name:</strong> {user?.firstName || 'N/A'}</div>
          <div><strong>Last Name:</strong> {user?.lastName || 'N/A'}</div>
          <div><strong>Phone:</strong> {user?.phone || 'N/A'}</div>
          {user?.rejectionReason && (
            <div className="col-span-2"><strong>Rejection Reason:</strong> {user.rejectionReason}</div>
          )}
        </div>
      );
    } else {
      // Fallback for other types
      return (
        <div className="grid grid-cols-2 gap-4">
          <div><strong>Email:</strong> {user?.email || 'N/A'}</div>
          <div><strong>First Name:</strong> {user?.firstName || 'N/A'}</div>
          <div><strong>Last Name:</strong> {user?.lastName || 'N/A'}</div>
          <div><strong>Phone:</strong> {user?.phone || 'N/A'}</div>
          {user?.rejectionReason && (
            <div className="col-span-2"><strong>Rejection Reason:</strong> {user.rejectionReason}</div>
          )}
        </div>
      );
    }
  }, [applicationType, selectedApplication, getStatusTag]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <HiDocumentText className="h-6 w-6" />
          {title}
        </h2>
        <Button
          color="light"
          onClick={fetchApplications}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <HiRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Select
              value={filterStatus || ''}
              onChange={(e) => setFilterStatus(e.target.value || undefined)}
              className="w-48"
            >
              <option value="">Filter by Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </Select>
            {showTypeFilter && (
              <Select
                value={filterType || ''}
                onChange={(e) => setFilterType(e.target.value || undefined)}
                className="w-48"
              >
                <option value="">Filter by Type</option>
                <option value="landlord">Landlord</option>
                <option value="pmc">PMC</option>
              </Select>
            )}
          </div>
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Email</Table.HeadCell>
                {showTypeFilter && <Table.HeadCell>Type</Table.HeadCell>}
                <Table.HeadCell>Name</Table.HeadCell>
                <Table.HeadCell>Phone</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Submitted</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {loading ? (
                  <Table.Row>
                    <Table.Cell colSpan={showTypeFilter ? 7 : 6} className="text-center py-8">
                      <Spinner size="xl" />
                    </Table.Cell>
                  </Table.Row>
                ) : applications.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={showTypeFilter ? 7 : 6} className="text-center py-8">
                      <p className="text-gray-500">No applications found</p>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  applications.map((record) => {
                    const type = record?.invitation?.type || record?.type;
                    return (
                      <Table.Row key={record?.invitation?.id || record?.id || Math.random().toString()}>
                        <Table.Cell>{getUserEmail(record)}</Table.Cell>
                        {showTypeFilter && (
                          <Table.Cell>{type ? type.toUpperCase() : 'N/A'}</Table.Cell>
                        )}
                        <Table.Cell>{getUserName(record)}</Table.Cell>
                        <Table.Cell>{getUserPhone(record)}</Table.Cell>
                        <Table.Cell>{getStatusTag(record?.approvalStatus)}</Table.Cell>
                        <Table.Cell>
                          {record?.invitation?.completedAt
                            ? new Date(record.invitation.completedAt).toLocaleDateString()
                            : 'N/A'}
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center gap-2">
                            <Button
                              color="light"
                              size="sm"
                              onClick={() => handleViewDetails(record)}
                              className="p-2"
                            >
                              <HiEye className="h-4 w-4" />
                            </Button>
                            {record?.approvalStatus === 'PENDING' && (
                              <>
                                <Button
                                  color="success"
                                  size="sm"
                                  onClick={() => handleApprove(record)}
                                  className="p-2"
                                >
                                  <HiCheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  color="failure"
                                  size="sm"
                                  onClick={() => handleReject(record)}
                                  className="p-2"
                                >
                                  <HiXCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
                )}
              </Table.Body>
            </Table>
          </div>
        </div>
      </Card>

      {/* Detail Modal */}
      <Modal
        show={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        size="2xl"
      >
        <Modal.Header>Application Details</Modal.Header>
        <Modal.Body>
          {selectedApplication && (
            <div className="space-y-4">
              {getDetailFields}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div><strong>Status:</strong> {getStatusTag(selectedApplication?.approvalStatus)}</div>
                <div>
                  <strong>Submitted:</strong>{' '}
                  {selectedApplication?.invitation?.completedAt 
                    ? new Date(selectedApplication.invitation.completedAt).toLocaleString() 
                    : 'N/A'}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Approve Modal */}
      <Modal
        show={approveModalVisible}
        onClose={() => setApproveModalVisible(false)}
        size="md"
      >
        <Modal.Header>Approve Application</Modal.Header>
        <Modal.Body>
          <form onSubmit={submitApprove} className="space-y-4">
            <div>
              <Label htmlFor="comment" className="mb-2 block">
                Comment (Optional)
              </Label>
              <Textarea
                id="comment"
                rows={4}
                placeholder="Add any comments about this approval..."
                value={approveForm.values.comment}
                onChange={(e) => approveForm.setFieldsValue({ comment: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                color="gray"
                onClick={() => setApproveModalVisible(false)}
              >
                Cancel
              </Button>
              <Button type="submit" color="success">
                Approve
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Reject Modal */}
      <Modal
        show={rejectModalVisible}
        onClose={() => setRejectModalVisible(false)}
        size="md"
      >
        <Modal.Header>Reject Application</Modal.Header>
        <Modal.Body>
          <form onSubmit={submitReject} className="space-y-4">
            <div>
              <Label htmlFor="reason" className="mb-2 block">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                rows={4}
                placeholder="Explain why this application is being rejected..."
                value={rejectForm.values.reason}
                onChange={(e) => rejectForm.setFieldsValue({ reason: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="comment" className="mb-2 block">
                Additional Comments (Optional)
              </Label>
              <Textarea
                id="comment"
                rows={3}
                placeholder="Any additional comments..."
                value={rejectForm.values.comment}
                onChange={(e) => rejectForm.setFieldsValue({ comment: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                color="gray"
                onClick={() => setRejectModalVisible(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="failure"
                disabled={!rejectForm.values.reason}
              >
                Reject
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
});

ApplicationsTable.displayName = 'ApplicationsTable';

export default ApplicationsTable;
