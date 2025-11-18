/**
 * MaintenanceViewModal Component
 * 
 * Modal for viewing maintenance request details
 * Extracted from MaintenanceClient for better code organization
 */

import React, { useMemo } from 'react';
import {
  Modal, Descriptions, Tag, Space, Button, Timeline, Avatar, Divider,
  Alert, Rate, Tooltip, Badge
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, UserOutlined,
  DownloadOutlined, EyeOutlined
} from '@ant-design/icons';
import { formatDateDisplay, formatDateTimeDisplay } from '@/lib/utils/safe-date-formatter';
import EscalateButton from '@/components/maintenance/EscalateButton';

/**
 * Memoized Maintenance View Modal
 */
const MaintenanceViewModal = React.memo(({
  open,
  request,
  userRole,
  onClose,
  onApprove,
  onReject,
  onStatusUpdate,
  onAddComment,
  onDownloadPDF,
  onRefresh,
  newComment,
  setNewComment,
  newStatus,
  setNewStatus,
  comments = [],
  expenses = [],
}) => {
  if (!request) return null;

  // Memoize status options
  const statusOptions = useMemo(() => {
    return userRole === 'landlord'
      ? ['New', 'Pending', 'In Progress', 'Completed', 'Closed']
      : ['New', 'Pending', 'In Progress', 'Completed'];
  }, [userRole]);

  // Memoize approval status
  const approvalStatus = useMemo(() => {
    const landlordApproved = request.landlordApproved;
    const tenantApproved = request.tenantApproved;
    
    if (userRole === 'landlord') {
      return {
        canApprove: !landlordApproved,
        canReject: !landlordApproved,
        otherPartyApproved: tenantApproved,
      };
    } else {
      return {
        canApprove: !tenantApproved,
        canReject: !tenantApproved,
        otherPartyApproved: landlordApproved,
      };
    }
  }, [request, userRole]);

  return (
    <Modal
      title={
        <Space>
          <span>Maintenance Request</span>
          <Tag color={request.status === 'Closed' ? 'green' : 'blue'}>
            {request.ticketNumber || '—'}
          </Tag>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose
    >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Title" span={2}>
          {request.title}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={request.status === 'Closed' ? 'green' : 'blue'}>
            {request.status}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Priority">
          <Tag color={request.priority === 'Urgent' ? 'red' : 'blue'}>
            {request.priority}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Category">
          {request.category}
        </Descriptions.Item>
        <Descriptions.Item label="Created">
          {formatDateTimeDisplay(request.createdAt)}
        </Descriptions.Item>
        <Descriptions.Item label="Description" span={2}>
          {request.description}
        </Descriptions.Item>
      </Descriptions>

      {/* Approval Status */}
      {request.status === 'Closed' && (
        <Alert
          message={
            approvalStatus.otherPartyApproved
              ? 'Both parties have approved the closure'
              : 'Waiting for approval from the other party'
          }
          type={approvalStatus.otherPartyApproved ? 'success' : 'info'}
          style={{ marginTop: 16 }}
        />
      )}

      {/* Comments Section */}
      {comments.length > 0 && (
        <>
          <Divider>Comments</Divider>
          <Timeline>
            {comments.map((comment, index) => (
              <Timeline.Item
                key={index}
                dot={
                  <Avatar icon={<UserOutlined />} size="small" />
                }
              >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Space>
                    <strong>{comment.authorName}</strong>
                    <Tag>{comment.authorRole}</Tag>
                    <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                      {formatDateTimeDisplay(comment.createdAt)}
                    </span>
                  </Space>
                  <div>{comment.comment}</div>
                </Space>
              </Timeline.Item>
            ))}
          </Timeline>
        </>
      )}

      {/* Add Comment */}
      <Divider>Add Comment</Divider>
      <Space direction="vertical" style={{ width: '100%' }}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #d9d9d9' }}
        />
        <Button
          type="primary"
          onClick={() => onAddComment && onAddComment(request.id, newComment)}
          disabled={!newComment.trim()}
        >
          Add Comment
        </Button>
      </Space>

      {/* Actions */}
      <Divider>Actions</Divider>
      <Space>
        {approvalStatus.canApprove && (
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => onApprove && onApprove(request.id)}
          >
            Approve
          </Button>
        )}
        {approvalStatus.canReject && (
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => onReject && onReject(request.id)}
          >
            Reject
          </Button>
        )}
        {(userRole === 'pmc' || userRole === 'landlord') && request.status !== 'Closed' && (
          <EscalateButton
            maintenanceRequestId={request.id}
            userRole={userRole}
            onSuccess={() => {
              if (onRefresh) {
                onRefresh();
              }
              if (onClose) {
                onClose();
              }
            }}
          />
        )}
        {onDownloadPDF && (
          <Button
            icon={<DownloadOutlined />}
            onClick={() => onDownloadPDF(request.id)}
          >
            Download PDF
          </Button>
        )}
      </Space>
    </Modal>
  );
}, (prevProps, nextProps) => {
  // Custom comparison
  return (
    prevProps.open === nextProps.open &&
    prevProps.request?.id === nextProps.request?.id &&
    prevProps.loading === nextProps.loading &&
    prevProps.newComment === nextProps.newComment &&
    prevProps.newStatus === nextProps.newStatus
  );
});

MaintenanceViewModal.displayName = 'MaintenanceViewModal';

export default MaintenanceViewModal;

