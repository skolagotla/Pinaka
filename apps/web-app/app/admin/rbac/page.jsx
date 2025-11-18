/**
 * RBAC Settings Page
 * Admin interface for managing Role-Based Access Control
 * 
 * Features:
 * - Permission Matrix Editor
 * - Role Management
 * - User Role Assignment
 * - Scope Management
 * - RBAC Audit Logs
 */

"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Select,
  Input,
  Tag,
  message,
  Typography,
  Row,
  Col,
  Switch,
  Divider,
  Alert,
  Spin,
} from 'antd';
import {
  LockOutlined,
  UserOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { PageLayout } from '@/components/shared';
import RoleAssignmentModal from '@/components/rbac/RoleAssignmentModal';
import PermissionMatrixViewer from '@/components/rbac/PermissionMatrixViewer';
import PermissionMatrixEditor from '@/components/rbac/PermissionMatrixEditor';
import ScopeAssignment from '@/components/rbac/ScopeAssignment';
import { getRoleLabel } from '@/lib/rbac/resourceLabels';
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function AdminRBACPage() {
  const [activeTab, setActiveTab] = useState('roles');
  const [loading, setLoading] = useState(false);
  
  // Roles state
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  
  // Permission Matrix state
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissionMatrixVisible, setPermissionMatrixVisible] = useState(false);
  const [permissionEditorMode, setPermissionEditorMode] = useState(false);
  
  // Role Assignment state
  const [roleAssignmentVisible, setRoleAssignmentVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Scope Assignment state
  const [scopeAssignmentVisible, setScopeAssignmentVisible] = useState(false);
  const [selectedUserRole, setSelectedUserRole] = useState(null);
  
  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);
  
  // Role Management state
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm] = Form.useForm();

  useEffect(() => {
    fetchRoles();
    if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const fetchRoles = async () => {
    setRolesLoading(true);
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getRBACRoles();
      if (data.success) {
        setRoles(data.data || []);
      } else {
        message.error(data.error || 'Failed to fetch roles');
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      message.error(error?.message || 'Failed to fetch roles');
    } finally {
      setRolesLoading(false);
      setRolesLoaded(true);
    }
  };

  const fetchAuditLogs = async () => {
    setAuditLogsLoading(true);
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getAuditLogs({ type: 'rbac' });
      if (data.success) {
        setAuditLogs(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setAuditLogsLoading(false);
    }
  };

  const handleViewPermissionMatrix = (role) => {
    setSelectedRole(role);
    setPermissionMatrixVisible(true);
  };

  const handleAssignRole = (user) => {
    setSelectedUser(user);
    setRoleAssignmentVisible(true);
  };

  const handleManageScope = (userRole) => {
    setSelectedUserRole(userRole);
    setScopeAssignmentVisible(true);
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    roleForm.resetFields();
    setRoleModalVisible(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    roleForm.setFieldsValue({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      isActive: role.isActive,
    });
    setRoleModalVisible(true);
  };

  const handleInitializeRBAC = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rbac/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        message.success('RBAC system initialized successfully! All system roles and permissions have been created.');
        fetchRoles();
      } else {
        message.error(data.error || 'Failed to initialize RBAC system');
      }
    } catch (error) {
      console.error('Error initializing RBAC:', error);
      message.error('Failed to initialize RBAC system');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRole = async () => {
    try {
      const values = await roleForm.validateFields();
      setLoading(true);
      
      const url = editingRole 
        ? `/api/rbac/roles/${editingRole.id}`
        : '/api/rbac/roles';
      
      const response = await fetch(url, {
        method: editingRole ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        message.success(editingRole ? 'Role updated successfully' : 'Role created successfully');
        setRoleModalVisible(false);
        fetchRoles();
      } else {
        message.error(data.error || 'Failed to save role');
      }
    } catch (error) {
      console.error('Error saving role:', error);
      message.error('Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  const rolesColumns = [
    {
      title: 'Role Name',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text, record) => (
        <Space>
          <Text strong>{text}</Text>
          <Tag color={record.isActive ? 'green' : 'red'}>
            {record.isActive ? 'Active' : 'Inactive'}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'System Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Tag>{getRoleLabel(text)}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (_, record) => (
        <Button
          type="link"
          icon={<LockOutlined />}
          onClick={() => handleViewPermissionMatrix(record)}
        >
          View Permissions
        </Button>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditRole(record)}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  const auditLogsColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
      width: 180,
    },
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Text>{record.userName || record.userEmail || 'System'}</Text>
          <Tag>{record.userType}</Tag>
        </Space>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => <Tag color="blue">{action}</Tag>,
    },
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
      render: (resource) => resource || '-',
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      render: (details) => (
        <Text ellipsis style={{ maxWidth: 200 }}>
          {details ? JSON.stringify(details).substring(0, 50) + '...' : '-'}
        </Text>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'roles',
      label: (
        <Space>
          <UserOutlined />
          <span>Roles & Permissions</span>
        </Space>
      ),
      children: (
        <Card>
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
            <Title level={4}>Roles Management</Title>
            <Space>
              {rolesLoaded && roles.length === 0 && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={handleInitializeRBAC}
                  loading={loading}
                >
                  Initialize RBAC System
                </Button>
              )}
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchRoles}
                loading={rolesLoading}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateRole}
                disabled={!rolesLoaded || roles.length === 0}
              >
                Create Role
              </Button>
            </Space>
          </Space>
          
          <Alert
            message="Role-Based Access Control"
            description={
              <div>
                <p style={{ marginBottom: 8 }}>
                  Manage roles and their permissions. Each role has a set of permissions that determine what users can do in the system.
                </p>
                {rolesLoaded && roles.length === 0 && (
                  <div style={{ marginTop: 8, padding: 8, background: '#fff3cd', borderRadius: 4 }}>
                    <strong>⚠️ No roles found!</strong>
                    <p style={{ margin: '4px 0 0 0' }}>
                      You need to initialize the RBAC system first. Click the "Initialize RBAC System" button above, or run this command in your terminal:
                    </p>
                    <code style={{ display: 'block', marginTop: 4, padding: 4, background: '#fff', borderRadius: 2 }}>
                      npx tsx scripts/initialize-rbac.ts
                    </code>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                      This will create all 13 system roles and their default permissions.
                    </p>
                  </div>
                )}
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Table
            columns={rolesColumns}
            dataSource={roles}
            loading={rolesLoading}
            rowKey="id"
            pagination={{ pageSize: 20 }}
          />
        </Card>
      ),
    },
    {
      key: 'permissions',
      label: (
        <Space>
          <LockOutlined />
          <span>Permission Matrix</span>
        </Space>
      ),
      children: (
        <Card>
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
            <Title level={4}>Permission Matrix</Title>
            <Space>
              <Select
                placeholder="Select a role to view/edit permissions"
                style={{ width: 300 }}
                value={selectedRole?.id}
                onChange={(value) => {
                  const role = roles.find(r => r.id === value);
                  if (role) {
                    setSelectedRole(role);
                  }
                }}
              >
                {roles.map(role => (
                  <Option key={role.id} value={role.id}>
                    {role.displayName}
                  </Option>
                ))}
              </Select>
              <Button
                type={permissionEditorMode ? 'default' : 'primary'}
                icon={permissionEditorMode ? <EyeOutlined /> : <EditOutlined />}
                onClick={() => setPermissionEditorMode(!permissionEditorMode)}
                disabled={!selectedRole}
              >
                {permissionEditorMode ? 'View Mode' : 'Edit Mode'}
              </Button>
            </Space>
          </Space>
          
          {selectedRole ? (
            <>
              <Alert
                message={permissionEditorMode ? 'Edit Permissions' : 'View Permissions by Role'}
                description={
                  permissionEditorMode
                    ? 'You can now edit permissions for the selected role. Check/uncheck actions to modify permissions, then click "Save Changes" to apply.'
                    : 'Viewing permissions for the selected role. Click "Edit Mode" to modify permissions.'
                }
                type={permissionEditorMode ? 'warning' : 'info'}
                showIcon
                style={{ marginBottom: 16 }}
              />
              {permissionEditorMode ? (
                <PermissionMatrixEditor
                  roleId={selectedRole.id}
                  roleName={selectedRole.name}
                  readOnly={false}
                  onSave={() => {
                    message.success('Permissions updated successfully');
                    // Optionally refresh roles
                    fetchRoles();
                  }}
                />
              ) : (
                <PermissionMatrixViewer
                  roleId={selectedRole.id}
                  roleName={selectedRole.name}
                  readOnly={true}
                />
              )}
            </>
          ) : (
            <Alert
              message="Select a Role"
              description="Please select a role from the dropdown above to view or edit its permission matrix."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
        </Card>
      ),
    },
    {
      key: 'assignment',
      label: (
        <Space>
          <UserOutlined />
          <span>Role Assignment</span>
        </Space>
      ),
      children: (
        <Card>
          <Title level={4}>User Role Assignment</Title>
          <Alert
            message="Assign Roles to Users"
            description="Use the Users page to assign roles to individual users. You can also manage scopes (portfolio, property, unit) for each role assignment."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Button
            type="primary"
            icon={<UserOutlined />}
            onClick={() => window.location.href = '/admin/users'}
          >
            Go to Users Page
          </Button>
        </Card>
      ),
    },
    {
      key: 'audit',
      label: (
        <Space>
          <FileTextOutlined />
          <span>RBAC Audit Logs</span>
        </Space>
      ),
      children: (
        <Card>
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
            <Title level={4}>RBAC Audit Logs</Title>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchAuditLogs}
              loading={auditLogsLoading}
            >
              Refresh
            </Button>
          </Space>
          
          <Alert
            message="RBAC Activity Log"
            description="This log tracks all RBAC-related activities including role assignments, permission changes, scope modifications, and access attempts."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Table
            columns={auditLogsColumns}
            dataSource={auditLogs}
            loading={auditLogsLoading}
            rowKey="id"
            pagination={{ pageSize: 50 }}
          />
        </Card>
      ),
    },
  ];

  return (
    <PageLayout
      headerTitle={
        <Space>
          <LockOutlined />
          <span>RBAC Settings</span>
        </Space>
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
      />

      {/* Permission Matrix Modal */}
      <Modal
        title={selectedRole ? `Permission Matrix: ${selectedRole.displayName}` : 'Permission Matrix'}
        open={permissionMatrixVisible}
        onCancel={() => {
          setPermissionMatrixVisible(false);
          setSelectedRole(null);
        }}
        footer={null}
        width={1200}
      >
        {selectedRole ? (
          <PermissionMatrixViewer
            roleId={selectedRole.id}
            roleName={selectedRole.name}
            readOnly={true}
          />
        ) : (
          <Alert message="No role selected" type="warning" />
        )}
      </Modal>

      {/* Role Management Modal */}
      <Modal
        title={editingRole ? 'Edit Role' : 'Create Role'}
        open={roleModalVisible}
        onOk={handleSaveRole}
        onCancel={() => {
          setRoleModalVisible(false);
          setEditingRole(null);
          roleForm.resetFields();
        }}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={roleForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="System Name"
            rules={[{ required: true, message: 'System name is required' }]}
            tooltip="Internal system name (e.g., PMC_ADMIN, PROPERTY_MANAGER)"
          >
            <Input placeholder="e.g., PMC_ADMIN" disabled={!!editingRole} />
          </Form.Item>
          
          <Form.Item
            name="displayName"
            label="Display Name"
            rules={[{ required: true, message: 'Display name is required' }]}
          >
            <Input placeholder="e.g., PMC Admin" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Role description" />
          </Form.Item>
          
          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </PageLayout>
  );
}

