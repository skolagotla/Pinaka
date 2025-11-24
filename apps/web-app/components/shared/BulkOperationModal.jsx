"use client";

import { useState } from 'react';
import { Modal, Form, Input, Select, Table, Tag, Button, Space, Alert, message } from 'antd';
import { CheckOutlined, CloseOutlined, DollarOutlined } from '@ant-design/icons';
import ApprovalRequestModal from '@/components/shared/ApprovalRequestModal';

const { TextArea } = Input;
const { Option } = Select;

/**
 * Bulk Operation Modal for PMC
 * Allows PMCs to request bulk changes with approval workflow
 */
export default function BulkOperationModal({
  visible,
  onCancel,
  onSuccess,
  landlordId,
  operationType = 'rent_update', // rent_update, status_change, etc.
  selectedItems = [], // Items to apply bulk operation to
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);

  const operationTypes = [
    { value: 'rent_update', label: 'Update Rent', icon: <DollarOutlined /> },
    { value: 'status_change', label: 'Change Status', icon: <CheckOutlined /> },
    { value: 'lease_modification', label: 'Modify Leases', icon: <CheckOutlined /> },
  ];

  const handlePreview = async (values) => {
    try {
      // Generate preview of changes
      const preview = selectedItems.map(item => ({
        id: item.id,
        name: item.name || item.propertyName || item.unitName,
        currentValue: item.currentValue || item.rentAmount || item.status,
        newValue: values.newValue || values.status,
        change: operationType === 'rent_update' 
          ? `$${((values.newValue || 0) - (item.rentAmount || 0)).toLocaleString()}`
          : values.status,
      }));

      setPreviewData(preview);
      setPreviewVisible(true);
    } catch (error) {
      console.error('[Bulk Operation] Preview error:', error);
      message.error('Failed to generate preview');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Create approval request for bulk operation
      const formValues = form.getFieldsValue();
      // Use adminApi for approvals
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.createApproval({
        landlordId,
        approvalType: 'WORK_ORDER',
        entityType: 'bulk_operation',
        entityId: `bulk_${Date.now()}`,
        title: `Bulk ${operationTypes.find(t => t.value === operationType)?.label || 'Operation'}`,
        amount: operationType === 'rent_update' 
          ? previewData.reduce((sum, item) => sum + (item.newValue - item.currentValue), 0)
          : null,
        description: formValues.description || `Bulk operation on ${selectedItems.length} items`,
        metadata: {
          operationType,
          items: previewData,
          formValues,
        },
      });

      if (data.success || data) {
        message.success('Bulk operation request sent for approval');
        form.resetFields();
        setPreviewVisible(false);
        if (onSuccess) {
          onSuccess(data.data || data);
        }
        onCancel();
      }
    } catch (error) {
      console.error('[Bulk Operation] Error:', error);
      message.error(error.message || 'Failed to submit bulk operation request');
    } finally {
      setLoading(false);
    }
  };

  const previewColumns = [
    {
      title: 'Item',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Current Value',
      key: 'currentValue',
      render: (_, record) => (
        <Tag>{record.currentValue}</Tag>
      ),
    },
    {
      title: 'New Value',
      key: 'newValue',
      render: (_, record) => (
        <Tag color="green">{record.newValue}</Tag>
      ),
    },
    {
      title: 'Change',
      key: 'change',
      render: (_, record) => (
        <Tag color={record.change > 0 ? 'green' : 'red'}>
          {record.change}
        </Tag>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={`Bulk ${operationTypes.find(t => t.value === operationType)?.label || 'Operation'}`}
        open={visible}
        onCancel={onCancel}
        width={800}
        footer={null}
      >
        <Alert
          message={`This will affect ${selectedItems.length} item(s)`}
          description="All changes require landlord approval before being applied."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handlePreview}
          initialValues={{
            operationType,
          }}
        >
          <Form.Item
            name="operationType"
            label="Operation Type"
          >
            <Select disabled>
              {operationTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {operationType === 'rent_update' && (
            <Form.Item
              name="newValue"
              label="New Rent Amount"
              rules={[{ required: true, message: 'Please enter new rent amount' }}
            >
              <Input
                type="number"
                prefix="$"
                placeholder="0.00"
                min={0}
                step={0.01}
              />
            </Form.Item>
          )}

          {operationType === 'status_change' && (
            <Form.Item
              name="status"
              label="New Status"
              rules={[{ required: true, message: 'Please select new status' }}
            >
              <Select placeholder="Select status">
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
                <Option value="Pending">Pending</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please provide a description' }}
          >
            <TextArea
              rows={4}
              placeholder="Explain the reason for this bulk operation..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={onCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Preview Changes
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title="Preview Changes"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        onOk={handleSubmit}
        confirmLoading={loading}
        width={900}
        okText="Request Approval"
      >
        <Alert
          message="Review the changes below"
          description="Click 'Request Approval' to send this bulk operation to the landlord for approval."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Table
          columns={previewColumns}
          dataSource={previewData}
          rowKey="id"
          pagination={false}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <strong>Total: {previewData.length} items</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} />
                <Table.Summary.Cell index={2} />
                <Table.Summary.Cell index={3}>
                  <strong>
                    {operationType === 'rent_update' && (
                      <Tag color="blue">
                        Total Change: ${previewData.reduce((sum, item) => 
                          sum + (item.newValue - item.currentValue), 0
                        ).toLocaleString()}
                      </Tag>
                    )}
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Modal>
    </>
  );
}

