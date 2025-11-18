/**
 * Permission Matrix Viewer - Phase 7
 * 
 * Displays the permission matrix for a role
 * Read-only viewer (editor can be added later)
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, Table, Tag, Select, Space, Typography, Spin, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';
// Removed direct import of getRolePermissions - using API instead
import { RBACRole, ResourceCategory, PermissionAction } from '@prisma/client';
import { getResourceLabel, getCategoryLabel, getRoleLabel } from '@/lib/rbac/resourceLabels';

const { Title } = Typography;
const { Option } = Select;

interface PermissionMatrixViewerProps {
  roleId?: string;
  roleName?: RBACRole;
  readOnly?: boolean;
}

export default function PermissionMatrixViewer({
  roleId,
  roleName,
  readOnly = true,
}: PermissionMatrixViewerProps) {
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<RBACRole | undefined>(roleName);

  useEffect(() => {
    if (selectedRole || roleId) {
      loadPermissions();
    }
  }, [selectedRole, roleId]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      
      // If we have roleId, fetch role first to get roleName
      let roleNameToUse = selectedRole;
      if (roleId && !selectedRole) {
        const roleResponse = await fetch(`/api/rbac/roles/${roleId}`);
        const roleData = await roleResponse.json();
        if (roleData.success && roleData.data) {
          roleNameToUse = roleData.data.name as RBACRole;
        }
      }
      
      // Fetch permissions via API (never call Prisma functions directly from client)
      if (roleNameToUse) {
        // Fetch by role name
        const response = await fetch(`/api/rbac/roles/by-name/${encodeURIComponent(roleNameToUse)}/permissions`);
        const data = await response.json();
        if (data.success) {
          // Extract permissions from role data
          if (data.data && data.data.defaultPermissions) {
            setPermissions(data.data.defaultPermissions);
          } else if (data.dbPermissions) {
            setPermissions(data.dbPermissions);
          } else {
            setPermissions([]);
          }
        }
      } else if (roleId) {
        // Fetch by role ID
        const response = await fetch(`/api/rbac/roles/${roleId}/permissions`);
        const data = await response.json();
        if (data.success) {
          // Use dbPermissions if available, otherwise use data.data
          if (data.data && data.data.defaultPermissions) {
            setPermissions(data.data.defaultPermissions);
          } else {
            setPermissions(data.dbPermissions || data.data || []);
          }
        }
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 200,
      render: (category: ResourceCategory) => (
        <Tag color="blue">{getCategoryLabel(category)}</Tag>
      ),
    },
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
      width: 200,
      render: (resource: string) => getResourceLabel(resource),
    },
    {
      title: 'Actions',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Space wrap>
          {action.split(', ').map((act) => (
            <Tag key={act} color="green">
              {act}
            </Tag>
          ))}
        </Space>
      ),
    },
  ];

  // Group permissions by category and resource (combine multiple actions)
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const key = `${perm.category}-${perm.resource}`;
    if (!acc[key]) {
      acc[key] = {
        category: perm.category,
        resource: perm.resource,
        actions: [],
      };
    }
    if (!acc[key].actions.includes(perm.action)) {
      acc[key].actions.push(perm.action);
    }
    return acc;
  }, {} as Record<string, any>);

  const tableData = Object.values(groupedPermissions).map((item: any) => ({
    ...item,
    action: item.actions.join(', '), // Display all actions as comma-separated
  }));

  return (
    <Card
      title={
        <Space>
          <LockOutlined />
          <span>Permission Matrix</span>
        </Space>
      }
    >
      {!roleId && (
        <Space style={{ marginBottom: 16 }}>
          <span>Select Role:</span>
          <Select
            value={selectedRole}
            onChange={setSelectedRole}
            style={{ width: 200 }}
            placeholder="Select a role"
          >
            {Object.values(RBACRole).map((role) => (
              <Option key={role} value={role}>
                {getRoleLabel(role)}
              </Option>
            ))}
          </Select>
        </Space>
      )}

      {readOnly && (
        <Alert
          message="Read-Only View"
          description="This is a read-only view of the permission matrix. To edit permissions, use the permission matrix editor."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {loading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey={(record) => `${record.category}-${record.resource}`}
          pagination={false}
          size="small"
        />
      )}
    </Card>
  );
}

