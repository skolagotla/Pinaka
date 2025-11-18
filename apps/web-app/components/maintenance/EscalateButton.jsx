"use client";

import { useState } from 'react';
import { Button, Modal, Form, Input, Select, message, Alert } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
const { TextArea } = Input;
const { Option } = Select;

/**
 * Escalate Button Component for Maintenance Requests
 * Allows PMCs and landlords to escalate maintenance requests
 */
export default function EscalateButton({ maintenanceRequestId, onSuccess, userRole }) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleEscalate = async (values) => {
    try {
      setLoading(true);
      // Use v1Api client - escalate endpoint
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.forms.escalateMaintenance(maintenanceRequestId, {
        reason: values.reason,
        priority: values.priority,
      });
      const escalatedRequest = response.data || response;
      
      message.success('Maintenance request escalated successfully');
      form.resetFields();
      setVisible(false);
      if (onSuccess) {
        onSuccess(escalatedRequest);
      }
    } catch (error) {
      console.error('[Escalate Button] Error:', error);
      message.error(error.message || 'Failed to escalate maintenance request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        danger
        icon={<WarningOutlined />}
        onClick={() => setVisible(true)}
      >
        Escalate
      </Button>

      <Modal
        title="Escalate Maintenance Request"
        open={visible}
        onCancel={() => {
          setVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
        okText="Escalate"
        okButtonProps={{ danger: true }}
      >
        <Alert
          message="Escalate this maintenance request"
          description={
            userRole === 'pmc'
              ? "This will send an approval request to the property owner for review."
              : "This will increase the priority and notify relevant parties."
          }
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleEscalate}
          initialValues={{
            priority: 'High',
          }}
        >
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="High">High</Option>
              <Option value="Urgent">Urgent</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="reason"
            label="Escalation Reason"
            rules={[
              { required: true, message: 'Please provide a reason for escalation' },
              { min: 10, message: 'Reason must be at least 10 characters' },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Explain why this maintenance request needs to be escalated..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

