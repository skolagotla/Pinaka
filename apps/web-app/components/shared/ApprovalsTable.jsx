/**
 * ═══════════════════════════════════════════════════════════════
 * SHARED APPROVALS TABLE COMPONENT
 * ═══════════════════════════════════════════════════════════════
 * 
 * Unified component for displaying approval tables
 * Used by: Admin (landlord approvals), Landlord (tenant approvals)
 * Future-proof: Can be extended for vendor/contractor approvals
 * 
 * ═══════════════════════════════════════════════════════════════
 */

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  Button,
  Badge,
  Modal,
  Textarea,
  Tabs,
  Spinner,
} from 'flowbite-react';
import {
  HiCheckCircle,
  HiXCircle,
  HiRefresh,
  HiUser,
} from 'react-icons/hi';
import PhoneDisplay from './PhoneDisplay';
import FlowbiteTable from './FlowbiteTable';
import FlowbitePopconfirm from './FlowbitePopconfirm';
import { notify } from '@/lib/utils/notification-helper';

/**
 * ApprovalsTable Component
 * 
 * @param {Object} props
 * @param {string} props.title - Page title (e.g., "Landlord Approvals")
 * @param {string} props.apiEndpoint - API endpoint for fetching data (e.g., "/api/admin/approvals/landlords")
 * @param {string} props.approveEndpoint - API endpoint for approval (e.g., "/api/admin/approvals/landlords/{id}/approve")
 * @param {string} props.rejectEndpoint - API endpoint for rejection (e.g., "/api/admin/approvals/landlords/{id}/reject")
 * @param {string} props.entityName - Entity name for messages (e.g., "landlord", "tenant")
 * @param {string} props.entityNamePlural - Plural form (e.g., "landlords", "tenants")
 */
// OPTIMIZED: Memoized component with useCallback and useMemo
const ApprovalsTable = React.memo(function ApprovalsTable({
  title = "Approvals",
  apiEndpoint,
  approveEndpoint,
  rejectEndpoint,
  entityName = "entity",
  entityNamePlural = "entities",
}) {
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  // OPTIMIZED: useCallback for fetchEntities
  const fetchEntities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiEndpoint}?status=${activeTab.toUpperCase()}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setEntities(data.data);
        if (data.counts) {
          setCounts(data.counts);
        }
      }
    } catch (err) {
      console.error(`Error fetching ${entityNamePlural}:`, err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, apiEndpoint, entityNamePlural]);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  // OPTIMIZED: useCallback for handleApprove
  const handleApprove = useCallback(async (entity) => {
    try {
      const response = await fetch(approveEndpoint.replace('{id}', entity.id), {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok && data.success) {
        notify.success(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} approved successfully`);
        fetchEntities();
      } else {
        notify.error(data.error || `Failed to approve ${entityName}`);
      }
    } catch (err) {
      notify.error(`Failed to approve ${entityName}`);
    }
  }, [approveEndpoint, entityName, fetchEntities]);

  // OPTIMIZED: useCallback for handleReject
  const handleReject = useCallback(async () => {
    if (!selectedEntity) return;

    try {
      const response = await fetch(rejectEndpoint.replace('{id}', selectedEntity.id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        notify.success(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} rejected successfully`);
        setRejectModalVisible(false);
        setRejectReason('');
        setSelectedEntity(null);
        fetchEntities();
      } else {
        notify.error(data.error || `Failed to reject ${entityName}`);
      }
    } catch (err) {
      notify.error(`Failed to reject ${entityName}`);
    }
  }, [selectedEntity, rejectEndpoint, rejectReason, entityName, fetchEntities]);

  // OPTIMIZED: useMemo for getStatusColor
  const getStatusColor = useCallback((status) => {
    const colors = {
      PENDING: 'warning',
      APPROVED: 'success',
      REJECTED: 'failure',
    };
    return colors[status] || 'gray';
  }, []);

  // OPTIMIZED: useMemo for columns
  const columns = useMemo(() => [
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => <PhoneDisplay phone={phone} fallback="-" />,
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => {
        const parts = [record.city, record.provinceState].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : '-';
      },
    },
    {
      title: 'Status',
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      render: (status) => <Badge color={getStatusColor(status)}>{status}</Badge>,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        if (record.approvalStatus === 'PENDING') {
          return (
            <div className="flex items-center gap-2">
              <FlowbitePopconfirm
                title={`Approve this ${entityName}?`}
                description={`Are you sure you want to approve ${record.firstName} ${record.lastName}?`}
                onConfirm={() => handleApprove(record)}
                okText="Approve"
                cancelText="Cancel"
              >
                <Button color="blue" size="sm" className="flex items-center gap-2">
                  <HiCheckCircle className="h-4 w-4" />
                  Approve
                </Button>
              </FlowbitePopconfirm>
              <Button
                color="failure"
                size="sm"
                onClick={() => {
                  setSelectedEntity(record);
                  setRejectModalVisible(true);
                }}
                className="flex items-center gap-2"
              >
                <HiXCircle className="h-4 w-4" />
                Reject
              </Button>
            </div>
          );
        }
        return <span className="text-gray-400">-</span>;
      },
    },
  ], [handleApprove, entityName, getStatusColor]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <HiUser className="h-6 w-6" />
          {title}
        </h2>
        <Button color="gray" onClick={fetchEntities} className="flex items-center gap-2">
          <HiRefresh className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <Tabs activeTab={activeTab} onActiveTabChange={setActiveTab}>
          <Tabs.Item active={activeTab === 'pending'} title={`Pending (${counts.pending})`} id="pending">
            <div className="mt-4">
              <FlowbiteTable
                columns={columns}
                dataSource={entities}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 50 }}
              />
            </div>
          </Tabs.Item>
          <Tabs.Item active={activeTab === 'approved'} title={`Approved (${counts.approved})`} id="approved">
            <div className="mt-4">
              <FlowbiteTable
                columns={columns}
                dataSource={entities}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 50 }}
              />
            </div>
          </Tabs.Item>
          <Tabs.Item active={activeTab === 'rejected'} title={`Rejected (${counts.rejected})`} id="rejected">
            <div className="mt-4">
              <FlowbiteTable
                columns={columns}
                dataSource={entities}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 50 }}
              />
            </div>
          </Tabs.Item>
        </Tabs>
      </Card>

      <Modal
        show={rejectModalVisible}
        onClose={() => {
          setRejectModalVisible(false);
          setRejectReason('');
          setSelectedEntity(null);
        }}
        size="md"
      >
        <Modal.Header>
          Reject {entityName.charAt(0).toUpperCase() + entityName.slice(1)}
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to reject this {entityName}?
            </p>
            {selectedEntity && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedEntity.firstName} {selectedEntity.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedEntity.email}
                </p>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="rejectReason" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Reason for rejection (optional)
            </label>
            <Textarea
              id="rejectReason"
              rows={4}
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="gray"
            onClick={() => {
              setRejectModalVisible(false);
              setRejectReason('');
              setSelectedEntity(null);
            }}
          >
            Cancel
          </Button>
          <Button color="failure" onClick={handleReject}>
            Reject
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
});

ApprovalsTable.displayName = 'ApprovalsTable';

export default ApprovalsTable;
