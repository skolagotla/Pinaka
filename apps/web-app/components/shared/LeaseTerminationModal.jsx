/**
 * Lease Termination Modal Component
 * Allows landlord or tenant to initiate early lease termination
 */

"use client";

import { useState } from 'react';
import { Modal, Form, Input, DatePicker, Button, message, Space, Alert, Select } from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;

export default function LeaseTerminationModal({ 
  visible, 
  onCancel, 
  onSuccess, 
  lease,
  userRole 
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        reason: values.reason,
        terminationDate: values.terminationDate.toISOString(),
      };

      if (values.actualLoss !== undefined && values.actualLoss !== null) {
        payload.actualLoss = parseFloat(values.actualLoss);
      }

      // Use direct fetch for lease termination (no v1 equivalent yet)
      const response = await fetch(
        `/api/leases/${lease.id}/terminate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'Failed to terminate lease');
      }
      
      const data = await response.json();
      message.success('Termination request submitted successfully');
      form.resetFields();
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error('[LeaseTerminationModal] Error:', error);
      message.error(error.message || 'Failed to terminate lease');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Early Lease Termination"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Alert
        message="Ontario-Compliant Termination"
        description="No flat fees allowed. Only actual losses can be charged. For domestic violence (N15), 28 days notice with no penalty."
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="reason"
          label="Termination Reason"
          rules={[{ required: true, message: 'Please provide a reason' }]}
        >
          <Select placeholder="Select reason">
            <Select.Option value="mutual_agreement">Mutual Agreement (N11)</Select.Option>
            <Select.Option value="tenant_initiated">Tenant-Initiated (N9)</Select.Option>
            <Select.Option value="domestic_violence">Domestic Violence (N15 - 28 days, no penalty)</Select.Option>
            <Select.Option value="other">Other</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="terminationDate"
          label="Proposed Termination Date"
          rules={[{ required: true, message: 'Please select termination date' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
          />
        </Form.Item>

        <Form.Item
          name="actualLoss"
          label="Actual Loss Amount (Optional)"
          help="Enter actual financial loss. No flat fees allowed per Ontario law."
        >
          <Input
            type="number"
            prefix="$"
            placeholder="0.00"
          />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Additional Notes"
        >
          <TextArea rows={4} placeholder="Any additional information..." />
        </Form.Item>

        <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
          <Space>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" danger htmlType="submit" loading={loading}>
              Submit Termination Request
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}

