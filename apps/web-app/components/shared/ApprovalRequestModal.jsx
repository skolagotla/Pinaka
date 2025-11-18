"use client";

import { useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, message, Alert } from 'antd';
import { DollarOutlined, ToolOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

/**
 * Modal for PMC to request approval from landlord
 */
export default function ApprovalRequestModal({
  visible,
  onCancel,
  onSuccess,
  landlordId,
  entityType,
  entityId,
  initialData = {},
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const approvalTypes = [
    { value: 'EXPENSE', label: 'Expense', icon: <DollarOutlined /> },
    { value: 'MAINTENANCE_REQUEST', label: 'Maintenance Request', icon: <ToolOutlined /> },
    { value: 'WORK_ORDER', label: 'Work Order', icon: <ToolOutlined /> },
    { value: 'TENANT_REQUEST', label: 'Tenant Request', icon: <ToolOutlined /> },
    { value: 'LEASE_MODIFICATION', label: 'Lease Modification', icon: <ToolOutlined /> },
    { value: 'VENDOR_ASSIGNMENT', label: 'Vendor Assignment', icon: <ToolOutlined /> },
    { value: 'CONTRACTOR_ASSIGNMENT', label: 'Contractor Assignment', icon: <ToolOutlined /> },
    { value: 'OTHER', label: 'Other', icon: <ToolOutlined /> },
  ];

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Use direct fetch for approvals (no v1 equivalent yet)
      const response = await fetch('/api/approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          landlordId,
          approvalType: values.approvalType,
          entityType: entityType || 'other',
          entityId: entityId || null,
          title: values.title,
          amount: values.amount || null,
          description: values.description || null,
          metadata: {
            ...initialData,
            ...values.metadata,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'Failed to send approval request');
      }
      
      const data = await response.json();
      if (data.success || data) {
        message.success('Approval request sent successfully');
        form.resetFields();
        if (onSuccess) {
          onSuccess(data.data || data);
        }
        onCancel();
      }
    } catch (error) {
      console.error('[Approval Request Modal] Error:', error);
      message.error(error.message || 'Failed to send approval request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Request Approval from Landlord"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={600}
    >
      <Alert
        message="This request will be sent to the property owner for approval"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          approvalType: initialData.approvalType || 'OTHER',
          title: initialData.title || '',
          amount: initialData.amount || null,
          description: initialData.description || '',
        }}
      >
        <Form.Item
          name="approvalType"
          label="Approval Type"
          rules={[{ required: true, message: 'Please select an approval type' }]}
        >
          <Select placeholder="Select approval type">
            {approvalTypes.map((type) => (
              <Option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please enter a title' }]}
        >
          <Input placeholder="Brief title for this request" />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Amount (if applicable)"
        >
          <InputNumber
            style={{ width: '100%' }}
            prefix="$"
            placeholder="0.00"
            min={0}
            precision={2}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please provide a description' }]}
        >
          <TextArea
            rows={4}
            placeholder="Explain what you need approval for..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

