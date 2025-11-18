/**
 * Scope Assignment Component - Phase 7
 * 
 * Component for assigning scopes (Portfolio → Property → Unit) to user roles
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, Form, Select, Space, Button, message, Cascader } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
// Note: assignScope is server-side only, use API endpoint instead
// import { assignScope } from '@/lib/rbac';

const { Option } = Select;

interface ScopeAssignmentProps {
  userId: string;
  userType: string;
  roleId: string;
  assignedBy: string;
  onSuccess?: () => void;
  initialScope?: {
    portfolioId?: string;
    propertyId?: string;
    unitId?: string;
  };
}

export default function ScopeAssignment({
  userId,
  userType,
  roleId,
  assignedBy,
  onSuccess,
  initialScope,
}: ScopeAssignmentProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  useEffect(() => {
    loadOptions();
    if (initialScope) {
      form.setFieldsValue({
        scope: [
          initialScope.portfolioId,
          initialScope.propertyId,
          initialScope.unitId,
        ].filter(Boolean),
      });
    }
  }, []);

  const loadOptions = async () => {
    try {
      // Load portfolios, properties, units
      // This would fetch from your API
      // For now, placeholder
    } catch (error) {
      console.error('Error loading scope options:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const scope = {
        portfolioId: values.scope?.[0],
        propertyId: values.scope?.[1],
        unitId: values.scope?.[2],
      };

      // Use API endpoint instead of direct function call (server-side only)
      const response = await fetch(`/api/rbac/users/${userId}/roles?userType=${userType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId,
          scope,
          assignedBy,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign scope');
      }

      message.success('Scope assigned successfully');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error assigning scope:', error);
      message.error(error.message || 'Failed to assign scope');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={
        <Space>
          <EnvironmentOutlined />
          <span>Assign Scope</span>
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="scope"
          label="Scope (Portfolio → Property → Unit)"
          tooltip="Select the scope for this role assignment. Leave empty for global access."
        >
          <Cascader
            options={[]} // Load from API
            placeholder="Select scope (optional)"
            changeOnSelect
            allowClear
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Assign Scope
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}

