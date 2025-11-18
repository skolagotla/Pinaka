/**
 * Lease Renewal Modal Component
 * Allows landlord or tenant to renew lease or convert to month-to-month
 */

"use client";

import { useState } from 'react';
import { Modal, Form, Input, DatePicker, Radio, Button, message, Space, Alert } from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;

export default function LeaseRenewalModal({ 
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
      const decision = values.decision;
      const payload = {
        decision,
      };

      if (decision === 'renew') {
        payload.newLeaseEnd = values.newLeaseEnd.toISOString();
        if (values.newRentAmount) {
          payload.newRentAmount = parseFloat(values.newRentAmount);
        }
      }

      // Use direct fetch for lease renewal (no v1 equivalent yet)
      const response = await fetch(
        `/api/leases/${lease.id}/renew`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'Failed to renew lease');
      }
      
      const data = await response.json();
      message.success('Lease renewal decision saved successfully');
      form.resetFields();
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error('[LeaseRenewalModal] Error:', error);
      message.error(error.message || 'Failed to renew lease');
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
      title="Lease Renewal Decision"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          decision: 'month_to_month',
        }}
      >
        <Alert
          message="Lease Expiring Soon"
          description={`Your lease expires on ${lease.leaseEnd ? new Date(lease.leaseEnd).toLocaleDateString() : 'N/A'}. Please choose how you'd like to proceed.`}
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form.Item
          name="decision"
          label="Renewal Decision"
          rules={[{ required: true, message: 'Please select a decision' }]}
        >
          <Radio.Group>
            <Space direction="vertical">
              <Radio value="renew">
                <strong>Renew Lease</strong>
                <div style={{ marginLeft: 24, color: '#666', fontSize: 12 }}>
                  Create a new fixed-term lease
                </div>
              </Radio>
              <Radio value="month_to_month">
                <strong>Convert to Month-to-Month</strong>
                <div style={{ marginLeft: 24, color: '#666', fontSize: 12 }}>
                  Continue on a month-to-month basis (Ontario law)
                </div>
              </Radio>
              <Radio value="terminate">
                <strong>Terminate Lease</strong>
                <div style={{ marginLeft: 24, color: '#666', fontSize: 12 }}>
                  End the lease (requires N11 form)
                </div>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.decision !== currentValues.decision}
        >
          {({ getFieldValue }) => {
            const decision = getFieldValue('decision');
            
            if (decision === 'renew') {
              return (
                <>
                  <Form.Item
                    name="newLeaseEnd"
                    label="New Lease End Date"
                    rules={[{ required: true, message: 'Please select end date' }]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      disabledDate={(current) => current && current < dayjs().startOf('day')}
                    />
                  </Form.Item>
                  <Form.Item
                    name="newRentAmount"
                    label="New Rent Amount (Optional)"
                    help="Leave empty to keep current rent"
                  >
                    <Input
                      type="number"
                      prefix="$"
                      placeholder={lease.rentAmount?.toString()}
                    />
                  </Form.Item>
                </>
              );
            }
            
            return null;
          }}
        </Form.Item>

        <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
          <Space>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit Decision
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}

