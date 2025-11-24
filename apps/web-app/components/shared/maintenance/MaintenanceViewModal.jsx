/**
 * MaintenanceViewModal Component
 * 
 * Modal for viewing maintenance request details
 * Extracted from MaintenanceClient for better code organization
 */

"use client";
import React, { useMemo } from 'react';
import {
  Modal, Badge, Button, Tooltip, Alert, Spinner
} from 'flowbite-react';
import {
  HiCheckCircle, HiXCircle, HiUser,
  HiDownload, HiEye
} from 'react-icons/hi';
import { formatDateDisplay, formatDateTimeDisplay } from '@/lib/utils/safe-date-formatter';
import EscalateButton from '@/components/maintenance/EscalateButton';
import SimpleTimeline from '@/components/shared/SimpleTimeline';
import { useFormState } from '@/lib/hooks/useFormState';

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
  const form = useFormState({
    comment: newComment || '',
    status: newStatus || request?.status || '',
  });

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

  // Build timeline items from comments
  const timelineItems = comments.map((comment, index) => ({
    color: 'gray',
    children: (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
            <HiUser className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm">{comment.authorName}</span>
          <Badge color="info" size="sm">{comment.authorRole}</Badge>
          <span className="text-xs text-gray-500">
            {formatDateTimeDisplay(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">{comment.comment}</p>
      </div>
    )
  }));

  return (
    <Modal
      show={open}
      onClose={onClose}
      size="5xl"
    >
      <Modal.Header>
        <div className="flex items-center gap-2">
          <span>Maintenance Request</span>
          <Badge color={request.status === 'Closed' ? 'success' : 'info'}>
            {request.ticketNumber || '—'}
          </Badge>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 mb-1">Title</p>
              <p className="font-semibold">{request.title}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <Badge color={request.status === 'Closed' ? 'success' : 'info'}>
                {request.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Priority</p>
              <Badge color={request.priority === 'Urgent' ? 'failure' : 'info'}>
                {request.priority}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Category</p>
              <p className="text-sm">{request.category}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Created</p>
              <p className="text-sm">{formatDateTimeDisplay(request.createdAt)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm">{request.description}</p>
            </div>
          </div>

          {/* Approval Status */}
          {request.status === 'Closed' && (
            <Alert
              color={approvalStatus.otherPartyApproved ? 'success' : 'info'}
            >
              <p className="text-sm">
                {approvalStatus.otherPartyApproved
                  ? 'Both parties have approved the closure'
                  : 'Waiting for approval from the other party'}
              </p>
            </Alert>
          )}

          {/* Comments Section */}
          {comments.length > 0 && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="font-semibold mb-4">Comments</h5>
                <SimpleTimeline items={timelineItems} />
              </div>
            </>
          )}

          {/* Add Comment */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h5 className="font-semibold mb-4">Add Comment</h5>
            <div className="space-y-3">
              <textarea
                value={form.values.comment}
                onChange={(e) => {
                  form.setFieldsValue({ comment: e.target.value });
                  if (setNewComment) setNewComment(e.target.value);
                }}
                placeholder="Add a comment..."
                rows={3}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              />
              <Button
                color="blue"
                onClick={() => onAddComment && onAddComment(request.id, form.values.comment)}
                disabled={!form.values.comment.trim()}
                className="flex items-center gap-2"
              >
                Add Comment
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h5 className="font-semibold mb-4">Actions</h5>
            <div className="flex flex-wrap gap-2">
              {approvalStatus.canApprove && (
                <Button
                  color="success"
                  onClick={() => onApprove && onApprove(request.id)}
                  className="flex items-center gap-2"
                >
                  <HiCheckCircle className="h-4 w-4" />
                  Approve
                </Button>
              )}
              {approvalStatus.canReject && (
                <Button
                  color="failure"
                  onClick={() => onReject && onReject(request.id)}
                  className="flex items-center gap-2"
                >
                  <HiXCircle className="h-4 w-4" />
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
                  color="gray"
                  onClick={() => onDownloadPDF(request.id)}
                  className="flex items-center gap-2"
                >
                  <HiDownload className="h-4 w-4" />
                  Download PDF
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal.Body>
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
