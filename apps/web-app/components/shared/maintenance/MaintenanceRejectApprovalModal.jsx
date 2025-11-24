/**
 * Maintenance Reject Approval Modal Component
 * 
 * Handles rejecting PMC maintenance approval requests
 * Extracted from MaintenanceClient.jsx to reduce component size
 */

"use client";
import { Modal, Textarea, Label, Button, Spinner } from 'flowbite-react';
import { useFormState } from '@/lib/hooks/useFormState';

/**
 * Maintenance Reject Approval Modal Component
 * 
 * @param {Object} props
 * @param {boolean} props.open - Modal open state
 * @param {Function} props.onOk - Confirm handler
 * @param {Function} props.onCancel - Cancel handler
 */
export default function MaintenanceRejectApprovalModal({
  open,
  onOk,
  onCancel
}) {
  const form = useFormState({
    reason: '',
  });

  const handleOk = () => {
    if (!form.values.reason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    if (onOk) {
      onOk(form.values.reason);
    }
  };

  const handleCancel = () => {
    form.resetForm();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Modal
      show={open}
      onClose={handleCancel}
      size="md"
    >
      <Modal.Header>Reject Approval Request</Modal.Header>
      <Modal.Body>
        <div>
          <Label htmlFor="reason" className="mb-2 block">
            Rejection Reason <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="reason"
            rows={4}
            placeholder="Enter rejection reason..."
            value={form.values.reason}
            onChange={(e) => form.setFieldsValue({ reason: e.target.value })}
            required
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          color="failure"
          onClick={handleOk}
          disabled={!form.values.reason.trim()}
        >
          Reject
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
