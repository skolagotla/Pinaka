/**
 * Maintenance Reject Approval Modal Component
 * 
 * Handles rejecting PMC maintenance approval requests
 * Extracted from MaintenanceClient.jsx to reduce component size
 */

"use client";
import { Modal, Form, Input } from 'antd';

const { TextArea } = Input;

/**
 * Maintenance Reject Approval Modal Component
 * 
 * @param {Object} props
 * @param {boolean} props.open - Modal open state
 * @param {Function} props.onOk - Confirm handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {Object} props.form - Form instance
 */
export default function MaintenanceRejectApprovalModal({
  open,
  onOk,
  onCancel,
  form
}) {
  return (
    <Modal
      title="Reject Approval Request"
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText="Reject"
      okButtonProps={{ danger: true }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Rejection Reason"
          name="reason"
          rules={[{ required: true, message: 'Please provide a reason for rejection' }}
        >
          <Input.TextArea rows={4} placeholder="Enter rejection reason..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}

