/**
 * Permission Matrix Editor
 * 
 * Allows Super Admins and PMC Admins to edit permissions for roles
 */

"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Select,
  Space,
  Typography,
  Spin,
  Alert,
  Button,
  Checkbox,
  Switch,
  message,
  Modal,
  Input,
  Divider,
} from 'antd';
import {
  LockOutlined,
  SaveOutlined,
  ReloadOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { RBACRole, ResourceCategory, PermissionAction } from '@prisma/client';
import { getResourceLabel, getCategoryLabel, getRoleLabel } from '@/lib/rbac/resourceLabels';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

interface PermissionMatrixEditorProps {
  roleId?: string;
  roleName?: RBACRole;
  readOnly?: boolean;
  onSave?: () => void;
}

interface PermissionEntry {
  category: ResourceCategory;
  resource: string;
  actions: PermissionAction[];
  id?: string;
}

// All available actions
const ALL_ACTIONS: PermissionAction[] = Object.values(PermissionAction);

// All available categories
const ALL_CATEGORIES: ResourceCategory[] = Object.values(ResourceCategory);

export default function PermissionMatrixEditor({
  roleId,
  roleName,
  readOnly = false,
  onSave,
}: PermissionMatrixEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState<PermissionEntry[]>([]);
  const [originalPermissions, setOriginalPermissions] = useState<PermissionEntry[]>([]);
  const [selectedRole, setSelectedRole] = useState<RBACRole | undefined>(roleName);
  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>(roleId);
  const [searchText, setSearchText] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [editingMode, setEditingMode] = useState(!readOnly);
  const [addPermissionModalVisible, setAddPermissionModalVisible] = useState(false);
  const [newPermissionCategory, setNewPermissionCategory] = useState<ResourceCategory | undefined>();
  const [newPermissionResource, setNewPermissionResource] = useState('');

  useEffect(() => {
    if (selectedRole || roleId) {
      loadPermissions();
    }
  }, [selectedRole, roleId]);

  useEffect(() => {
    // Check if permissions have changed
    const changed = JSON.stringify(permissions) !== JSON.stringify(originalPermissions);
    setHasChanges(changed);
  }, [permissions, originalPermissions]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      
      // If we have roleId, fetch role first to get roleName
      let roleNameToUse = selectedRole;
      let roleIdToUse = roleId;
      
      if (roleId && !selectedRole) {
        const roleResponse = await fetch(`/api/rbac/roles/${roleId}`);
        const roleData = await roleResponse.json();
        if (roleData.success && roleData.data) {
          roleNameToUse = roleData.data.name as RBACRole;
          roleIdToUse = roleData.data.id;
          setSelectedRoleId(roleData.data.id);
        }
      } else if (selectedRole && !roleId) {
        // Fetch role by name to get ID
        const rolesResponse = await fetch('/api/rbac/roles');
        const rolesData = await rolesResponse.json();
        if (rolesData.success && rolesData.data) {
          const role = rolesData.data.find((r: any) => r.name === selectedRole);
          if (role) {
            roleIdToUse = role.id;
            setSelectedRoleId(role.id);
          }
        }
      }
      
      // Fetch permissions via API
      if (roleNameToUse) {
        const response = await fetch(`/api/rbac/roles/by-name/${encodeURIComponent(roleNameToUse)}/permissions`);
        const data = await response.json();
        if (data.success) {
          // Process permissions into our format
          let perms: PermissionEntry[] = [];
          
          if (data.dbPermissions && data.dbPermissions.length > 0) {
            // Group by category and resource
            const grouped: Record<string, PermissionEntry> = {};
            data.dbPermissions.forEach((perm: any) => {
              const key = `${perm.category}-${perm.resource}`;
              if (!grouped[key]) {
                grouped[key] = {
                  category: perm.category,
                  resource: perm.resource,
                  actions: [],
                  id: perm.id,
                };
              }
              if (!grouped[key].actions.includes(perm.action)) {
                grouped[key].actions.push(perm.action);
              }
            });
            perms = Object.values(grouped);
          } else if (data.data && data.data.defaultPermissions) {
            perms = data.data.defaultPermissions.map((perm: any) => ({
              category: perm.category,
              resource: perm.resource,
              actions: [perm.action],
              id: perm.id,
            }));
          }
          
          setPermissions(perms);
          setOriginalPermissions(JSON.parse(JSON.stringify(perms)));
        }
      } else if (roleIdToUse) {
        const response = await fetch(`/api/rbac/roles/${roleIdToUse}/permissions`);
        const data = await response.json();
        if (data.success) {
          let perms: PermissionEntry[] = [];
          if (data.dbPermissions && data.dbPermissions.length > 0) {
            const grouped: Record<string, PermissionEntry> = {};
            data.dbPermissions.forEach((perm: any) => {
              const key = `${perm.category}-${perm.resource}`;
              if (!grouped[key]) {
                grouped[key] = {
                  category: perm.category,
                  resource: perm.resource,
                  actions: [],
                  id: perm.id,
                };
              }
              if (!grouped[key].actions.includes(perm.action)) {
                grouped[key].actions.push(perm.action);
              }
            });
            perms = Object.values(grouped);
          }
          setPermissions(perms);
          setOriginalPermissions(JSON.parse(JSON.stringify(perms)));
        }
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      message.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAction = (category: ResourceCategory, resource: string, action: PermissionAction) => {
    const key = `${category}-${resource}`;
    const existing = permissions.find(p => p.category === category && p.resource === resource);
    
    if (existing) {
      // Toggle action
      const newActions = existing.actions.includes(action)
        ? existing.actions.filter(a => a !== action)
        : [...existing.actions, action];
      
      if (newActions.length === 0) {
        // Remove permission entry if no actions
        setPermissions(permissions.filter(p => p !== existing));
      } else {
        // Update actions
        setPermissions(permissions.map(p => 
          p === existing ? { ...p, actions: newActions } : p
        ));
      }
    } else {
      // Add new permission entry
      setPermissions([...permissions, { category, resource, actions: [action] }]);
    }
  };

  const handleAddPermission = () => {
    setNewPermissionCategory(undefined);
    setNewPermissionResource('');
    setAddPermissionModalVisible(true);
  };

  const handleSaveNewPermission = () => {
    if (!newPermissionCategory || !newPermissionResource.trim()) {
      message.error('Please select a category and enter a resource name');
      return;
    }

    // Check if permission already exists
    const exists = permissions.some(
      p => p.category === newPermissionCategory && p.resource === newPermissionResource.trim()
    );

    if (exists) {
      message.warning('This permission already exists');
      return;
    }

    const newPerm: PermissionEntry = {
      category: newPermissionCategory,
      resource: newPermissionResource.trim(),
      actions: [PermissionAction.READ],
    };
    setPermissions([...permissions, newPerm]);
    setAddPermissionModalVisible(false);
    setNewPermissionCategory(undefined);
    setNewPermissionResource('');
  };

  const handleSave = async () => {
    if (!selectedRoleId) {
      message.error('No role selected');
      return;
    }

    try {
      setSaving(true);
      
      // Prepare permissions for API
      const permissionsToSave = permissions.flatMap(perm =>
        perm.actions.map(action => ({
          category: perm.category,
          resource: perm.resource,
          action,
        }))
      );

      const response = await fetch(`/api/rbac/roles/${selectedRoleId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions: permissionsToSave }),
      });

      const data = await response.json();
      
      if (data.success) {
        message.success('Permissions saved successfully');
        setOriginalPermissions(JSON.parse(JSON.stringify(permissions)));
        setHasChanges(false);
        onSave?.();
      } else {
        message.error(data.error || 'Failed to save permissions');
      }
    } catch (error: any) {
      console.error('Error saving permissions:', error);
      message.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    Modal.confirm({
      title: 'Reset Changes?',
      content: 'Are you sure you want to discard all unsaved changes?',
      onOk: () => {
        setPermissions(JSON.parse(JSON.stringify(originalPermissions)));
        setHasChanges(false);
      },
    });
  };

  // Filter permissions based on search
  const filteredPermissions = permissions.filter(perm => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      perm.category.toLowerCase().includes(search) ||
      perm.resource.toLowerCase().includes(search) ||
      perm.actions.some(a => a.toLowerCase().includes(search))
    );
  });

  // Get all unique resources for the table
  const allResources = Array.from(
    new Set(filteredPermissions.map(p => `${p.category}-${p.resource}`))
  ).map(key => {
    const [category, resource] = key.split('-');
    return { category: category as ResourceCategory, resource };
  });

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
      key: 'actions',
      render: (_: any, record: { category: ResourceCategory; resource: string }) => {
        const perm = permissions.find(
          p => p.category === record.category && p.resource === record.resource
        );
        const currentActions = perm?.actions || [];

        return (
          <Space wrap>
            {ALL_ACTIONS.map(action => {
              const hasAction = currentActions.includes(action);
              return (
                <Checkbox
                  key={action}
                  checked={hasAction}
                  onChange={() => handleToggleAction(record.category, record.resource, action)}
                  disabled={!editingMode}
                >
                  <Tag color={hasAction ? 'green' : 'default'}>{action}</Tag>
                </Checkbox>
              );
            })}
          </Space>
        );
      },
    },
  ];

  return (
    <Card
      title={
        <Space>
          <LockOutlined />
          <span>Permission Matrix Editor</span>
        </Space>
      }
      extra={
        <Space>
          {editingMode && (
            <>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                disabled={!hasChanges}
              >
                Reset
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={saving}
                disabled={!hasChanges || !selectedRoleId}
              >
                Save Changes
              </Button>
            </>
          )}
          <Button
            icon={editingMode ? <CloseOutlined /> : <EditOutlined />}
            onClick={() => setEditingMode(!editingMode)}
            disabled={readOnly}
          >
            {editingMode ? 'Cancel Edit' : 'Edit Mode'}
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Role Selection */}
        {!roleId && (
          <Space>
            <span>Select Role:</span>
            <Select
              value={selectedRole}
              onChange={(value) => {
                setSelectedRole(value);
                setSelectedRoleId(undefined);
              }}
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

        {/* Search */}
        <Search
          placeholder="Search by category, resource, or action..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 400 }}
          allowClear
        />

        {/* Info Alert */}
        {editingMode ? (
          <Alert
            message="Edit Mode Active"
            description="You can now modify permissions by checking/unchecking actions. Click 'Save Changes' to apply your modifications."
            type="warning"
            showIcon
          />
        ) : (
          <Alert
            message="View Mode"
            description="Click 'Edit Mode' to enable permission editing."
            type="info"
            showIcon
          />
        )}

        {/* Permissions Table */}
        {loading ? (
          <Spin />
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={allResources}
              rowKey={(record) => `${record.category}-${record.resource}`}
              pagination={{ pageSize: 20 }}
              size="small"
            />
            
            {editingMode && (
              <Button
                type="dashed"
                onClick={handleAddPermission}
                block
                style={{ marginTop: 16 }}
              >
                + Add New Permission
              </Button>
            )}
          </>
        )}
      </Space>

      {/* Add Permission Modal */}
      <Modal
        title="Add New Permission"
        open={addPermissionModalVisible}
        onOk={handleSaveNewPermission}
        onCancel={() => {
          setAddPermissionModalVisible(false);
          setNewPermissionCategory(undefined);
          setNewPermissionResource('');
        }}
        okText="Add Permission"
        cancelText="Cancel"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Category:</Text>
            <Select
              placeholder="Select Category"
              style={{ width: '100%', marginTop: 8 }}
              value={newPermissionCategory}
              onChange={setNewPermissionCategory}
            >
              {ALL_CATEGORIES.map(cat => (
                <Option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</Option>
              ))}
            </Select>
          </div>
          <div>
            <Text strong>Resource:</Text>
            <Input
              placeholder="Resource name (e.g., 'property', 'tenant', 'lease')"
              style={{ marginTop: 8 }}
              value={newPermissionResource}
              onChange={(e) => setNewPermissionResource(e.target.value)}
              onPressEnter={handleSaveNewPermission}
            />
          </div>
          <Alert
            message="Note"
            description="The permission will be created with READ action by default. You can add more actions after creation."
            type="info"
            showIcon
          />
        </Space>
      </Modal>
    </Card>
  );
}

