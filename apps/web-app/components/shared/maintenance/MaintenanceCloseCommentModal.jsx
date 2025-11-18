/**
 * Maintenance Close Comment Modal Component
 * 
 * Handles closing maintenance requests with a comment
 * Extracted from MaintenanceClient.jsx to reduce component size
 */

"use client";
import { Modal, Form, Input, Space, Alert, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

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
  return (
    <Modal
      title={
        <Space size={8}>
          <ExclamationCircleOutlined style={{ color: '#1890ff' }} />
          <Text strong style={{ fontSize: 15 }}>Close Ticket</Text>
        </Space>
      }
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Close Ticket"
      cancelText="Cancel"
      width={480}
      bodyStyle={{ padding: '20px 24px' }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <Alert
          message={
            <Text style={{ fontSize: 13 }}>
              Please provide a comment explaining why you're closing this ticket.
            </Text>
          }
          type="info"
          showIcon
          style={{ 
            padding: '8px 12px',
            fontSize: 13
          }}
          icon={<ExclamationCircleOutlined style={{ fontSize: 14 }} />}
        />
        <Form.Item
          label={<Text strong style={{ fontSize: 13 }}>Closing Comment</Text>}
          required
          style={{ marginBottom: 0 }}
        >
          <TextArea
            rows={3}
            placeholder="Explain why you're closing this ticket..."
            value={closeComment}
            onChange={(e) => setCloseComment(e.target.value)}
            style={{ 
              resize: 'none',
              fontSize: 13
            }}
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Space>
    </Modal>
  );
}

