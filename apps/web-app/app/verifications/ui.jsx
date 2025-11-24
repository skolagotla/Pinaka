"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Table,
  Badge,
  Button,
  Modal,
  Textarea,
  Label,
  Card,
  Select,
  Tabs,
  Empty,
  Spinner,
} from 'flowbite-react';
import {
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiEye,
  HiCheck,
  HiStop,
  HiDocumentText,
  HiRefresh,
} from 'react-icons/hi';
import { ProCard } from '@/components/shared/LazyProComponents';
import { PageLayout, EmptyState, TableWrapper, FilterBar, StandardModal, FormTextInput } from '@/components/shared';
import { useFormState } from '@/lib/hooks/useFormState';
import { notify } from '@/lib/utils/notification-helper';
import dayjs from 'dayjs';

const VERIFICATION_TYPES = {
  PROPERTY_OWNERSHIP: { label: 'Property Ownership', color: 'blue' },
  TENANT_DOCUMENT: { label: 'Tenant Document', color: 'cyan' },
  APPLICATION: { label: 'Application', color: 'purple' },
  ENTITY_APPROVAL: { label: 'Entity Approval', color: 'warning' },
  FINANCIAL_APPROVAL: { label: 'Financial Approval', color: 'success' },
  INSPECTION: { label: 'Inspection', color: 'info' },
  OTHER: { label: 'Other', color: 'gray' },
};

const STATUS_COLORS = {
  PENDING: 'warning',
  VERIFIED: 'success',
  REJECTED: 'failure',
  EXPIRED: 'gray',
  CANCELLED: 'gray',
};

const STATUS_ICONS = {
  PENDING: <HiClock className="h-4 w-4" />,
  VERIFIED: <HiCheckCircle className="h-4 w-4" />,
  REJECTED: <HiXCircle className="h-4 w-4" />,
  EXPIRED: <HiClock className="h-4 w-4" />,
  CANCELLED: <HiXCircle className="h-4 w-4" />,
};

export default function VerificationsClient({ user, initialStats }) {
  const form = useFormState({ verificationNotes: '', rejectionReason: '' });
  const [verifications, setVerifications] = useState([]);
  const [stats, setStats] = useState(initialStats || {});
  const [loading, setLoading] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // Use index for Flowbite Tabs
  const [filters, setFilters] = useState({
    verificationType: null,
    status: null,
  });

  // Map tab index to tab key
  const tabKeys = ['all', 'pending', 'my-requests', 'history'];
  const activeTabKey = tabKeys[activeTab] || 'all';

  // Load verifications
  const loadVerifications = useCallback(async () => {
    setLoading(true);
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const query = {};
      if (filters.verificationType) query.verificationType = filters.verificationType;
      // Only add status filter if not using a tab filter
      if (filters.status && activeTabKey !== 'pending' && activeTabKey !== 'my-requests') {
        query.status = filters.status;
      }
      if (activeTabKey === 'pending') {
        query.status = 'PENDING';
      }
      if (activeTabKey === 'my-requests') {
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
  }, [filters, activeTabKey, user.id]);

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
  const handleVerify = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedVerification) return;

    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const values = form.getFieldsValue();
      await adminApi.verifyVerification(selectedVerification.id, values.verificationNotes || null);
      notify.success('Verification approved successfully');
      setVerifyModalVisible(false);
      setSelectedVerification(null);
      form.resetForm();
      loadVerifications();
      loadStats();
    } catch (error) {
      console.error('[Verifications] Error verifying:', error);
      notify.error(error?.message || 'Failed to verify');
    }
  }, [selectedVerification, form, loadVerifications, loadStats]);

  // Handle reject
  const handleReject = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedVerification) return;

    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const values = form.getFieldsValue();
      await adminApi.rejectVerification(selectedVerification.id, values.rejectionReason);
      notify.success('Verification rejected');
      setRejectModalVisible(false);
      setSelectedVerification(null);
      form.resetForm();
      loadVerifications();
      loadStats();
    } catch (error) {
      console.error('[Verifications] Error rejecting:', error);
      notify.error(error?.message || 'Failed to reject verification');
    }
  }, [selectedVerification, form, loadVerifications, loadStats]);

  // Columns
  const columns = useMemo(() => [
    {
      title: 'Type',
      dataIndex: 'verificationType',
      key: 'verificationType',
      render: (type) => {
        const typeConfig = VERIFICATION_TYPES[type] || VERIFICATION_TYPES.OTHER;
        return <Badge color={typeConfig.color}>{typeConfig.label}</Badge>;
      },
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title) => <div className="truncate max-w-xs">{title}</div>,
    },
    {
      title: 'Requester',
      key: 'requester',
      render: (_, record) => (
        <div>
          <div>{record.requestedByName}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {record.requestedByRole}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge color={STATUS_COLORS[status]} icon={STATUS_ICONS[status]}>
          {status}
        </Badge>
      ),
    },
    {
      title: 'Requested',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Button
            color="light"
            size="sm"
            onClick={() => {
              setSelectedVerification(record);
              setViewModalVisible(true);
            }}
            className="flex items-center gap-1"
          >
            <HiEye className="h-4 w-4" />
            View
          </Button>
          {record.status === 'PENDING' && 
           (record.assignedTo === user.id || record.assignedTo === null || !record.assignedTo) &&
           ['pmc', 'landlord', 'admin'].includes(user.role) && (
            <>
              <Button
                color="success"
                size="sm"
                onClick={() => {
                  setSelectedVerification(record);
                  setVerifyModalVisible(true);
                }}
                className="flex items-center gap-1"
              >
                <HiCheck className="h-4 w-4" />
                Verify
              </Button>
              <Button
                color="failure"
                size="sm"
                onClick={() => {
                  setSelectedVerification(record);
                  setRejectModalVisible(true);
                }}
                className="flex items-center gap-1"
              >
                <HiStop className="h-4 w-4" />
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ], [user.id, user.role]);

  // Filtered verifications
  const filteredVerifications = useMemo(() => {
    let filtered = verifications;

    if (activeTabKey === 'pending') {
      filtered = filtered.filter(v => v.status === 'PENDING');
    } else if (activeTabKey === 'my-requests') {
      filtered = filtered.filter(v => v.requestedBy === user.id);
    } else if (activeTabKey === 'history') {
      filtered = filtered.filter(v => ['VERIFIED', 'REJECTED', 'EXPIRED', 'CANCELLED'].includes(v.status));
    }

    return filtered;
  }, [verifications, activeTabKey, user.id]);

  const verificationStats = [
    {
      title: 'Total',
      value: stats.total || 0,
    },
    {
      title: 'Pending',
      value: stats.pending || 0,
      prefix: <HiClock className="h-4 w-4 text-yellow-500" />,
    },
    {
      title: 'Verified',
      value: stats.verified || 0,
      prefix: <HiCheckCircle className="h-4 w-4 text-green-500" />,
    },
    {
      title: 'Rejected',
      value: stats.rejected || 0,
      prefix: <HiXCircle className="h-4 w-4 text-red-500" />,
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
      headerTitle={
        <div className="flex items-center gap-2">
          <HiDocumentText className="h-5 w-5" />
          Verifications
        </div>
      }
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
      <Card className="mb-3">
        <Tabs aria-label="Verification tabs" style="underline" onActiveTabChange={setActiveTab}>
          <Tabs.Item active={activeTab === 0} title={
            <span className="flex items-center gap-2">
              All <Badge color="blue">{stats.total || 0}</Badge>
            </span>
          }>
          </Tabs.Item>
          <Tabs.Item active={activeTab === 1} title={
            <span className="flex items-center gap-2">
              Pending <Badge color="warning">{stats.pending || 0}</Badge>
            </span>
          }>
          </Tabs.Item>
          <Tabs.Item active={activeTab === 2} title="My Requests">
          </Tabs.Item>
          <Tabs.Item active={activeTab === 3} title="History">
          </Tabs.Item>
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
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                {columns.map(col => (
                  <Table.HeadCell key={col.key}>{col.title}</Table.HeadCell>
                ))}
              </Table.Head>
              <Table.Body className="divide-y">
                {loading ? (
                  <Table.Row>
                    <Table.Cell colSpan={columns.length} className="text-center py-8">
                      <Spinner size="xl" />
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  filteredVerifications.map((record) => (
                    <Table.Row key={record.id}>
                      {columns.map((col) => (
                        <Table.Cell key={col.key}>
                          {col.render ? col.render(record[col.dataIndex], record) : record[col.dataIndex]}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
          </div>
        </TableWrapper>
      )}
      
      {/* View Modal */}
      <Modal
        show={viewModalVisible}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedVerification(null);
        }}
        size="2xl"
      >
        <Modal.Header>Verification Details</Modal.Header>
        <Modal.Body>
          {selectedVerification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold mb-1">Type:</p>
                  <Badge color={VERIFICATION_TYPES[selectedVerification.verificationType]?.color}>
                    {VERIFICATION_TYPES[selectedVerification.verificationType]?.label}
                  </Badge>
                </div>
                <div>
                  <p className="font-semibold mb-1">Status:</p>
                  <Badge color={STATUS_COLORS[selectedVerification.status]} icon={STATUS_ICONS[selectedVerification.status]}>
                    {selectedVerification.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold mb-1">Title:</p>
                  <p>{selectedVerification.title}</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Requested By:</p>
                  <p>{selectedVerification.requestedByName} ({selectedVerification.requestedByRole})</p>
                </div>
              </div>
              {selectedVerification.description && (
                <div>
                  <p className="font-semibold mb-1">Description:</p>
                  <p>{selectedVerification.description}</p>
                </div>
              )}
              {selectedVerification.status === 'VERIFIED' && selectedVerification.verifiedByName && (
                <div>
                  <p className="font-semibold mb-1">Verified By:</p>
                  <p>{selectedVerification.verifiedByName} on {new Date(selectedVerification.verifiedAt).toLocaleString()}</p>
                  {selectedVerification.verificationNotes && (
                    <div className="mt-2">
                      <p className="font-semibold mb-1">Notes:</p>
                      <p>{selectedVerification.verificationNotes}</p>
                    </div>
                  )}
                </div>
              )}
              {selectedVerification.status === 'REJECTED' && selectedVerification.rejectedByName && (
                <div>
                  <p className="font-semibold mb-1">Rejected By:</p>
                  <p>{selectedVerification.rejectedByName} on {new Date(selectedVerification.rejectedAt).toLocaleString()}</p>
                  {selectedVerification.rejectionReason && (
                    <div className="mt-2">
                      <p className="font-semibold mb-1">Reason:</p>
                      <p>{selectedVerification.rejectionReason}</p>
                    </div>
                  )}
                </div>
              )}
              {selectedVerification.fileUrl && (
                <div className="mt-4">
                  <Button
                    color="blue"
                    href={selectedVerification.fileUrl}
                    target="_blank"
                    className="flex items-center gap-2"
                  >
                    <HiEye className="h-4 w-4" />
                    View Document
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="gray"
            onClick={() => {
              setViewModalVisible(false);
              setSelectedVerification(null);
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Verify Modal */}
      <Modal
        show={verifyModalVisible}
        onClose={() => {
          setVerifyModalVisible(false);
          setSelectedVerification(null);
          form.resetForm();
        }}
        size="md"
      >
        <Modal.Header>Verify Request</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <Label htmlFor="verificationNotes" className="mb-2 block">
                Notes (Optional)
              </Label>
              <Textarea
                id="verificationNotes"
                rows={4}
                placeholder="Add any notes about this verification"
                value={form.values.verificationNotes}
                onChange={(e) => form.setFieldsValue({ verificationNotes: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                color="gray"
                onClick={() => {
                  setVerifyModalVisible(false);
                  setSelectedVerification(null);
                  form.resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" color="success">
                Verify
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Reject Modal */}
      <Modal
        show={rejectModalVisible}
        onClose={() => {
          setRejectModalVisible(false);
          setSelectedVerification(null);
          form.resetForm();
        }}
        size="md"
      >
        <Modal.Header>Reject Request</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleReject} className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason" className="mb-2 block">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rejectionReason"
                rows={4}
                placeholder="Explain why this verification is being rejected"
                value={form.values.rejectionReason}
                onChange={(e) => form.setFieldsValue({ rejectionReason: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                color="gray"
                onClick={() => {
                  setRejectModalVisible(false);
                  setSelectedVerification(null);
                  form.resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="failure"
                disabled={!form.values.rejectionReason}
              >
                Reject
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </PageLayout>
  );
}
