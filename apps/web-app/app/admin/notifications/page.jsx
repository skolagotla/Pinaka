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
  DatePicker,
  Space,
  Tag,
  message,
  Typography,
} from 'antd';
import { StandardModal, FormTextInput, FormSelect, FormDatePicker } from '@/components/shared';
import { ActionButton } from '@/components/shared/buttons';
import {
  BellOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getAnnouncements();
      if (data.success) {
        setAnnouncements(data.data);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAnnouncement(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    form.setFieldsValue({
      ...announcement,
      startDate: announcement.startDate ? dayjs(announcement.startDate) : null,
      endDate: announcement.endDate ? dayjs(announcement.endDate) : null,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        startDate: values.startDate ? values.startDate.toISOString() : null,
        endDate: values.endDate ? values.endDate.toISOString() : null,
      };

      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.saveAnnouncement(payload, editingAnnouncement?.id);

      if (data.success) {
        message.success(editingAnnouncement ? 'Announcement updated' : 'Announcement created');
        setModalVisible(false);
        fetchAnnouncements();
      } else {
        message.error(data.error || 'Failed to save announcement');
      }
    } catch (err) {
      message.error('Failed to save announcement');
    }
  };

  const handleDelete = async (id) => {
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.deleteAnnouncement(id);
      if (data.success) {
        message.success('Announcement deleted');
        fetchAnnouncements();
      } else {
        message.error(data.error || 'Failed to delete announcement');
      }
    } catch (err) {
      message.error(err?.message || 'Failed to delete announcement');
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
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active) => <Tag color={active ? 'green' : 'default'}>{active ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Target Audience',
      dataIndex: 'targetAudience',
      key: 'targetAudience',
      render: (audience) => audience?.join(', ') || 'All',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
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
          <BellOutlined /> Notification Management
        </Title>
        <ActionButton action="add" onClick={handleCreate} tooltip="Create Announcement" showText={true} text="Create Announcement" />
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={announcements}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 50 }}
        />
      </Card>

      <StandardModal
        title={editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
        open={modalVisible}
        form={form}
        loading={false}
        submitText={editingAnnouncement ? 'Save' : 'Create'}
        onCancel={() => setModalVisible(false)}
        onFinish={handleSubmit}
        width={600}
      >
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="message" label="Message" rules={[{ required: true }]}>
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select>
              <Option value="info">Info</Option>
              <Option value="warning">Warning</Option>
              <Option value="error">Error</Option>
              <Option value="success">Success</Option>
            </Select>
          </Form.Item>
          <Form.Item name="targetAudience" label="Target Audience">
            <Select mode="multiple">
              <Option value="all">All</Option>
              <Option value="landlord">Landlords</Option>
              <Option value="tenant">Tenants</Option>
            </Select>
          </Form.Item>
          <Form.Item name="startDate" label="Start Date">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="endDate" label="End Date">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isActive" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
      </StandardModal>
    </div>
  );
}

