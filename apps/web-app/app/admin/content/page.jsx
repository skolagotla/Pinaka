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
} from 'antd';
import { StandardModal, FormTextInput, FormSelect } from '@/components/shared';
import { ActionButton } from '@/components/shared/buttons';
import {
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function AdminContentPage() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getContent();
      if (data.success) {
        setContent(data.data);
      }
    } catch (err) {
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingContent(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (item) => {
    setEditingContent(item);
    form.setFieldsValue(item);
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.saveContent(values, editingContent?.id);

      if (data.success) {
        message.success(editingContent ? 'Content updated' : 'Content created');
        setModalVisible(false);
        fetchContent();
      } else {
        message.error(data.error || 'Failed to save content');
      }
    } catch (err) {
      message.error(err?.message || 'Failed to save content');
    }
  };

  const handleDelete = async (id) => {
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.deleteContent(id);
      if (data.success) {
        message.success('Content deleted');
        fetchContent();
      } else {
        message.error(data.error || 'Failed to delete content');
      }
    } catch (err) {
      message.error(err?.message || 'Failed to delete content');
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag>{type}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'isPublished',
      key: 'isPublished',
      render: (published) => <Tag color={published ? 'green' : 'default'}>{published ? 'Published' : 'Draft'}</Tag>,
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => new Date(date).toLocaleDateString(),
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
          <FileTextOutlined /> Content Management
        </Title>
        <ActionButton action="add" onClick={handleCreate} tooltip="Create Content" showText={true} text="Create Content" />
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={content}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 50 }}
        />
      </Card>

      <StandardModal
        title={editingContent ? 'Edit Content' : 'Create Content'}
        open={modalVisible}
        form={form}
        loading={false}
        submitText={editingContent ? 'Save' : 'Create'}
        onCancel={() => setModalVisible(false)}
        onFinish={handleSubmit}
        width={800}
      >
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select>
              <Option value="FAQ">FAQ</Option>
              <Option value="HELP_ARTICLE">Help Article</Option>
              <Option value="TERMS_OF_SERVICE">Terms of Service</Option>
              <Option value="PRIVACY_POLICY">Privacy Policy</Option>
              <Option value="EMAIL_TEMPLATE">Email Template</Option>
              <Option value="DOCUMENT_TEMPLATE">Document Template</Option>
              <Option value="FORM_TEMPLATE">Form Template</Option>
              <Option value="ANNOUNCEMENT">Announcement</Option>
            </Select>
          </Form.Item>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="slug" label="Slug">
            <Input placeholder="Auto-generated from title if empty" />
          </Form.Item>
          <Form.Item name="content" label="Content" rules={[{ required: true }]}>
            <TextArea rows={10} />
          </Form.Item>
          <Form.Item name="isPublished" valuePropName="checked" initialValue={false}>
            <Switch checkedChildren="Published" unCheckedChildren="Draft" />
          </Form.Item>
      </StandardModal>
    </div>
  );
}

