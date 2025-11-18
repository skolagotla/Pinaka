"use client";

import { useState } from 'react';
import {
  Card,
  Form,
  Select,
  Button,
  DatePicker,
  Radio,
  Space,
  Typography,
  message,
  Alert,
} from 'antd';
import {
  DownloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function AdminDataExportPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleExport = async (values) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: values.type,
        format: values.format || 'json',
        ...(values.dateRange && values.dateRange[0] && {
          startDate: values.dateRange[0].toISOString(),
        }),
        ...(values.dateRange && values.dateRange[1] && {
          endDate: values.dateRange[1].toISOString(),
        }),
      });

      const response = await fetch(`/api/admin/data-export?${params}`);
      
      if (response.ok) {
        if (values.format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${values.type}-export-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
        } else {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${values.type}-export-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
        message.success('Export started successfully');
      } else {
        const data = await response.json();
        message.error(data.error || 'Export failed');
      }
    } catch (err) {
      console.error('Error exporting data:', err);
      message.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        <DownloadOutlined /> Data Export
      </Title>

      <Alert
        message="Data Export"
        description="Export platform data for backup, compliance, or analysis purposes. All exports are logged in the audit trail."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleExport}
          initialValues={{ format: 'json' }}
        >
          <Form.Item
            name="type"
            label="Export Type"
            rules={[{ required: true, message: 'Please select export type' }]}
          >
            <Select placeholder="Select data type to export">
              <Option value="users">Users (Landlords & Tenants)</Option>
              <Option value="properties">Properties</Option>
              <Option value="audit-logs">Audit Logs</Option>
              <Option value="support-tickets">Support Tickets</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="format"
            label="Export Format"
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio value="json">JSON</Radio>
              <Radio value="csv">CSV</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Date Range (Optional)"
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<DownloadOutlined />} loading={loading}>
                Export Data
              </Button>
              <Button onClick={() => form.resetFields()}>Reset</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card style={{ marginTop: 24 }}>
        <Title level={4}>Export Types</Title>
        <Space direction="vertical" size="middle">
          <div>
            <Text strong>Users:</Text> Export all landlord and tenant information
          </div>
          <div>
            <Text strong>Properties:</Text> Export all properties with units and leases
          </div>
          <div>
            <Text strong>Audit Logs:</Text> Export all admin audit logs
          </div>
          <div>
            <Text strong>Support Tickets:</Text> Export all support tickets with notes
          </div>
        </Space>
      </Card>
    </div>
  );
}

