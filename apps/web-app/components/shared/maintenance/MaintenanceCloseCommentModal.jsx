/**
 * Maintenance Close Comment Modal Component
 * 
 * Handles closing maintenance requests with a comment
 * Extracted from MaintenanceClient.jsx to reduce component size
 */

"use client";
import { Modal, Textarea, Alert, Label, Button, Spinner } from 'flowbite-react';
import { HiExclamationCircle } from 'react-icons/hi';
import { useState } from 'react';

/**
 * Maintenance Close Comment Modal Component
 * 
 * @param {Object} props
 * @param {boolean} props.open - Modal open state
 * @param {Function} props.onOk - Confirm handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {string} props.closeComment - Close comment value
 * @param {Function} props.setCloseComment - Set close comment
 * @param {boolean} props.loading - Loading state
 */
export default function MaintenanceCloseCommentModal({
  open,
  onOk,
  onCancel,
  closeComment = '',
  setCloseComment,
  loading = false
}) {
  const [comment, setComment] = useState(closeComment);

  const handleOk = () => {
    if (setCloseComment) {
      setCloseComment(comment);
    }
    if (onOk) {
      onOk();
    }
  };

  return (
    <Modal
      show={open}
      onClose={onCancel}
      size="md"
    >
      <Modal.Header>
        <div className="flex items-center gap-2">
          <HiExclamationCircle className="h-5 w-5 text-blue-600" />
          <span className="font-semibold">Close Ticket</span>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <Alert color="info" icon={HiExclamationCircle}>
            <p className="text-sm">
              Please provide a comment explaining why you're closing this ticket.
            </p>
          </Alert>
          <div>
            <Label htmlFor="closeComment" className="mb-2 block font-semibold">
              Closing Comment <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="closeComment"
              rows={3}
              placeholder="Explain why you're closing this ticket..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              className="resize-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              {comment.length}/500 characters
            </p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          color="blue"
          onClick={handleOk}
          disabled={loading || !comment.trim()}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              Closing...
            </>
          ) : (
            'Close Ticket'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
