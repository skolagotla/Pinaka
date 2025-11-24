/**
 * Role Assignment Modal - Phase 7
 * 
 * Modal for assigning roles to users
 * Extends existing admin users functionality
 */

"use client";

import { useState, useEffect } from 'react';
import { Modal, Form, Select, Space, Button, message, Alert, Tag } from 'antd';
import { UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { RBACRole } from '@/lib/types/rbac';

const { Option } = Select;

interface RoleAssignmentModalProps {
  visible: boolean;
  userId: string;
  userType: string;
  userName?: string;
  userEmail?: string;
  onClose: () => void;
  onSuccess?: () => void;
  assignedBy: string;
  assignedByType: string;
  pmcId?: string;
  landlordId?: string;
}

export default function RoleAssignmentModal({
  visible,
  userId,
  userType,
  userName,
  userEmail,
  onClose,
  onSuccess,
  assignedBy,
  assignedByType,
  pmcId,
  landlordId,
}: RoleAssignmentModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [existingRoles, setExistingRoles] = useState<any[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    if (visible && userId) {
      loadExistingRoles();
    }
  }, [visible, userId]);

  const loadExistingRoles = async () => {
    try {
      setLoadingRoles(true);
      // Use API endpoint instead of direct Prisma call
      const response = await fetch(`/api/rbac/users/${userId}/roles?userType=${userType}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        const roles = data.data || [];
        setExistingRoles(roles);
        
        // Pre-fill form with existing roles (using roleName)
        form.setFieldsValue({
          roles: roles.map((r) => r.roleName || r.role),
        });
      } else {
        setExistingRoles([]);
        if (data.error) {
          message.error(data.error);
        }
      }
    } catch (error) {
      console.error('Error loading existing roles:', error);
      message.error('Failed to load existing roles');
      setExistingRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // Get role ID from role name
      const { adminApi } = await import('@/lib/api/admin-api');
      const rolesData = await adminApi.getRBACRoles();
      
      if (!rolesData.success) {
        throw new Error(rolesData.error || 'Failed to fetch roles');
      }

      const roleMap = new Map(rolesData.data.map((r: any) => [r.name, r.id]));

      // Assign each role with scope via API
      const assignmentPromises = (values.roles || []).map(async (roleName: string) => {
        const roleId = roleMap.get(roleName);
        if (!roleId || typeof roleId !== 'string') {
          console.warn(`Role ${roleName} not found`);
          return;
        }

        const scope: any = {};
        if (pmcId) scope.pmcId = pmcId;
        if (landlordId) scope.landlordId = landlordId;
        if (values.propertyId) scope.propertyId = values.propertyId;
        if (values.unitId) scope.unitId = values.unitId;
        if (values.portfolioId) scope.portfolioId = values.portfolioId;
        
        const scopeValue = Object.keys(scope).length > 0 ? scope : undefined;
        const data = await adminApi.assignUserRole(
          userId,
          userType,
          roleId,
          scopeValue
        );
        if (!data.success) {
          throw new Error(data.error || `Failed to assign role ${roleName}`);
        }
      });

      await Promise.all(assignmentPromises);

      message.success('Roles assigned successfully');
      onSuccess?.();
      onClose();
      form.resetFields();
    } catch (error: any) {
      console.error('Error assigning roles:', error);
      message.error(error.message || 'Failed to assign roles');
    } finally {
      setLoading(false);
    }
  };

  // Get available roles based on user type
  const getAvailableRoles = (): RBACRole[] => {
    switch (userType) {
      case 'admin':
        return [
          RBACRole.SUPER_ADMIN,
          RBACRole.PLATFORM_ADMIN,
          RBACRole.SUPPORT_ADMIN,
          RBACRole.BILLING_ADMIN,
          RBACRole.AUDIT_ADMIN,
        ];
      case 'pmc':
        return [
          RBACRole.PMC_ADMIN,
          RBACRole.PROPERTY_MANAGER,
          RBACRole.LEASING_AGENT,
          RBACRole.MAINTENANCE_TECH,
          RBACRole.ACCOUNTANT,
        ];
      case 'landlord':
        return [RBACRole.OWNER_LANDLORD];
      case 'tenant':
        return [RBACRole.TENANT];
      case 'vendor':
        return [RBACRole.VENDOR_SERVICE_PROVIDER];
      default:
        return [];
    }
  };

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          <span>Assign Roles</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Alert
        message={`Assigning roles to ${userName || userEmail || userId}`}
        description="Select one or more roles to assign to this user. Roles determine what permissions the user has."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {loadingRoles ? (
        <div>Loading existing roles...</div>
      ) : (
        <>
          {existingRoles.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <strong>Current Roles:</strong>
              <div style={{ marginTop: 8 }}>
                {existingRoles.map((role, index) => (
                  <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                    {role.roleDisplayName || role.roleName || role.role}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="roles"
              label="Roles"
              rules={[{ required: true, message: 'Please select at least one role' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select roles"
                loading={loadingRoles}
              >
                {getAvailableRoles().map((role) => (
                  <Option key={role} value={role}>
                    {role.replace(/_/g, ' ')}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Scope fields can be added here if needed */}
            {/* For now, scope is determined by context (pmcId, landlordId) */}

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<CheckCircleOutlined />}
                >
                  Assign Roles
                </Button>
                <Button onClick={onClose}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
}

