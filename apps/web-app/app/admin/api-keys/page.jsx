"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Space,
  Tag,
  message,
  Typography,
  Alert,
  DatePicker,
  InputNumber,
} from 'antd';
import { StandardModal, FormTextInput, FormSelect, FormDatePicker } from '@/components/shared';
import { ActionButton } from '@/components/shared/buttons';
import {
  KeyOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

export default function AdminApiKeysPage() {
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [newKey, setNewKey] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getApiKeys();
      if (data.success) {
        setApiKeys(data.data);
      }
    } catch (err) {
      console.error('Error fetching API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingKey(null);
    setNewKey(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (key) => {
    setEditingKey(key);
    setNewKey(null);
    form.setFieldsValue({
      ...key,
      expiresAt: key.expiresAt ? dayjs(key.expiresAt) : null,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null,
      };

      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.saveApiKey(payload, editingKey?.id);

      if (data.success) {
        if (!editingKey && data.data.key) {
          setNewKey(data.data.key);
          message.warning('Save this API key securely - it will not be shown again!');
        } else {
          message.success(editingKey ? 'API key updated' : 'API key created');
          setModalVisible(false);
          fetchApiKeys();
        }
      } else {
        message.error(data.error || 'Failed to save API key');
      }
    } catch (err) {
      message.error('Failed to save API key');
    }
  };

  const handleDelete = async (id) => {
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.deleteApiKey(id);
      if (data.success) {
        message.success('API key deleted');
        fetchApiKeys();
      } else {
        message.error(data.error || 'Failed to delete API key');
      }
    } catch (err) {
      message.error(err?.message || 'Failed to delete API key');
    }
  };

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    message.success('API key copied to clipboard');
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      render: (key) => <Text code>{key}</Text>,
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (perms) => perms?.map((p) => <Tag key={p}>{p}</Tag>),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active) => <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Last Used',
      dataIndex: 'lastUsedAt',
      key: 'lastUsedAt',
      render: (date) => date ? new Date(date).toLocaleString() : 'Never',
    },
    {
      title: 'Expires',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <ActionButton
            action="edit"
            onClick={() => handleEdit(record)}
            tooltip="Edit"
            showText={true}
            text="Edit"
          />
          <ActionButton
            action="delete"
            onClick={() => handleDelete(record.id)}
            tooltip="Delete"
            showText={true}
            text="Delete"
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <KeyOutlined /> API Key Management
        </Title>
        <ActionButton action="add" onClick={handleCreate} tooltip="Create API Key" showText={true} text="Create API Key" />
      </div>

      {newKey && (
        <Alert
          message="New API Key Generated"
          description={
            <div>
              <Text strong>Save this key securely - it will not be shown again!</Text>
              <br />
              <Text code style={{ fontSize: 16, marginTop: 8, display: 'block' }}>
                {newKey}
              </Text>
              <Button
                icon={<CopyOutlined />}
                onClick={() => handleCopyKey(newKey)}
                style={{ marginTop: 8 }}
              >
                Copy Key
              </Button>
            </div>
          }
          type="warning"
          closable
          onClose={() => setNewKey(null)}
          style={{ marginBottom: 24 }}
        />
      )}

      <Card>
        <Table
          columns={columns}
          dataSource={apiKeys}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 50 }}
        />
      </Card>

      <StandardModal
        title={editingKey ? 'Edit API Key' : 'Create API Key'}
        open={modalVisible}
        form={form}
        loading={false}
        submitText={editingKey ? 'Save' : 'Create'}
        onCancel={() => {
          setModalVisible(false);
          setNewKey(null);
        }}
        onFinish={handleSubmit}
        width={600}
      >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input disabled={!!editingKey} />
          </Form.Item>
          <Form.Item name="permissions" label="Permissions" rules={[{ required: true }]}>
            <Select mode="multiple">
              <Option value="read">Read</Option>
              <Option value="write">Write</Option>
              <Option value="delete">Delete</Option>
            </Select>
          </Form.Item>
          <Form.Item name="rateLimit" label="Rate Limit (requests per minute)">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="expiresAt" label="Expires At">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isActive" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
      </StandardModal>
    </div>
  );
}

