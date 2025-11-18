"use client";

import { useState, useEffect } from 'react';
import { Card, Switch, Form, Button, Space, Alert, message, Spin } from 'antd';
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { ProCard } from './LazyProComponents';

/**
 * Permission Settings Component
 * Allows landlords to configure permissions for their PMC relationship
 */
export default function PermissionSettings({ relationshipId }) {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (relationshipId) {
      fetchPermissions();
    }
  }, [relationshipId]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      // Use direct fetch for permissions (no v1 equivalent yet)
      const response = await fetch(
        `/api/relationships/${relationshipId}/permissions`,
        {
          credentials: 'include',
        }
      );

      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to fetch permissions');
      }
      if (data.success || data.permissions) {
        const permissionsData = data.permissions || data.data?.permissions || data.data;
        setPermissions(permissionsData);
        form.setFieldsValue(permissionsData);
      }
    } catch (error) {
      console.error('[Permission Settings] Error:', error);
      message.error(error.message || 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    try {
      setSaving(true);
      // Use direct fetch for permissions (no v1 equivalent yet)
      const response = await fetch(
        `/api/relationships/${relationshipId}/permissions`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            permissions: values,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'Failed to update permissions');
      }
      
      const data = await response.json();
      if (data.success || data) {
        message.success('Permissions updated successfully');
        setPermissions(values);
      }
    } catch (error) {
      console.error('[Permission Settings] Error:', error);
      message.error(error.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProCard>
        <Spin />
      </ProCard>
    );
  }

  return (
    <ProCard
      title={
        <Space>
          <LockOutlined />
          <span>PMC Permissions</span>
        </Space>
      }
    >
      <Alert
        message="Configure what your PMC can do"
        description="These settings control what actions your Property Management Company can perform on your behalf."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={permissions}
      >
        <Card title="Property Management" style={{ marginBottom: 16 }}>
          <Form.Item
            name="canEditProperties"
            valuePropName="checked"
            label="Allow PMC to edit properties"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="canEditTenants"
            valuePropName="checked"
            label="Allow PMC to edit tenant information"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="canEditLeases"
            valuePropName="checked"
            label="Allow PMC to modify leases"
          >
            <Switch />
          </Form.Item>
        </Card>

        <Card title="Maintenance & Expenses" style={{ marginBottom: 16 }}>
          <Form.Item
            name="canEditMaintenance"
            valuePropName="checked"
            label="Allow PMC to edit maintenance requests"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="canApproveExpenses"
            valuePropName="checked"
            label="PMC can approve expenses (requires your approval)"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="canApproveMaintenance"
            valuePropName="checked"
            label="PMC can approve maintenance (requires your approval)"
          >
            <Switch />
          </Form.Item>
        </Card>

        <Card title="Viewing Permissions" style={{ marginBottom: 16 }}>
          <Form.Item
            name="canViewFinancials"
            valuePropName="checked"
            label="PMC can view financial information"
          >
            <Switch disabled />
          </Form.Item>
          <Form.Item
            name="canViewReports"
            valuePropName="checked"
            label="PMC can view reports"
          >
            <Switch disabled />
          </Form.Item>
        </Card>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={saving} icon={<CheckCircleOutlined />}>
              Save Permissions
            </Button>
            <Button onClick={() => form.resetFields()}>Reset</Button>
          </Space>
        </Form.Item>
      </Form>
    </ProCard>
  );
}

