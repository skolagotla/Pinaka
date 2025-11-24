/**
 * RBAC Settings Page
 * Admin interface for managing Role-Based Access Control
 * Converted to Flowbite
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
  Button,
  Badge,
  Modal,
  Select,
  TextInput,
  Label,
  ToggleSwitch,
  Textarea,
  Alert,
  Spinner,
} from 'flowbite-react';
import {
  HiLockClosed,
  HiUser,
  HiDocumentText,
  HiPlus,
  HiPencil,
  HiRefresh,
  HiCheckCircle,
  HiEye,
} from 'react-icons/hi';
import { PageLayout } from '@/components/shared';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import RoleAssignmentModal from '@/components/rbac/RoleAssignmentModal';
import PermissionMatrixViewer from '@/components/rbac/PermissionMatrixViewer';
import PermissionMatrixEditor from '@/components/rbac/PermissionMatrixEditor';
import ScopeAssignment from '@/components/rbac/ScopeAssignment';
import { getRoleLabel } from '@/lib/rbac/resourceLabels';
import { useFormState } from '@/lib/hooks/useFormState';
import { notify } from '@/lib/utils/notification-helper';

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
  const roleForm = useFormState({
    name: '',
    displayName: '',
    description: '',
    isActive: true,
  });

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
        notify.error(data.error || 'Failed to fetch roles');
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      notify.error(error?.message || 'Failed to fetch roles');
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
    roleForm.setFieldsValue({
      name: '',
      displayName: '',
      description: '',
      isActive: true,
    });
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
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.initializeRBAC();
      
      if (data.success) {
        notify.success('RBAC system initialized successfully All system roles and permissions have been created.');
        fetchRoles();
      } else {
        notify.error(data.error || 'Failed to initialize RBAC system');
      }
    } catch (error) {
      console.error('Error initializing RBAC:', error);
      notify.error(error?.message || 'Failed to initialize RBAC system');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRole = async () => {
    try {
      const values = roleForm.values;
      
      // Basic validation
      if (!values.name || !values.displayName) {
        notify.error('System name and display name are required');
        return;
      }
      
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
        notify.success(editingRole ? 'Role updated successfully' : 'Role created successfully');
        setRoleModalVisible(false);
        fetchRoles();
      } else {
        notify.error(data.error || 'Failed to save role');
      }
    } catch (error) {
      console.error('Error saving role:', error);
      notify.error('Failed to save role');
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
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-white">{text}</span>
          <Badge color={record.isActive ? 'success' : 'failure'}>
            {record.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      ),
    },
    {
      title: 'System Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Badge color="info">{getRoleLabel(text)}</Badge>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <span className="text-gray-700 dark:text-gray-300 truncate max-w-xs">
          {text || '-'}
        </span>
      ),
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (_, record) => (
        <Button
          color="blue"
          size="xs"
          onClick={() => handleViewPermissionMatrix(record)}
        >
          <HiLockClosed className="h-4 w-4 mr-1" />
          View Permissions
        </Button>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          color="gray"
          size="xs"
          onClick={() => handleEditRole(record)}
        >
          <HiPencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
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
        <div className="flex items-center gap-2">
          <span className="text-gray-900 dark:text-white">
            {record.userName || record.userEmail || 'System'}
          </span>
          <Badge color="info">{record.userType}</Badge>
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => <Badge color="info">{action}</Badge>,
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
        <span className="text-gray-700 dark:text-gray-300 truncate max-w-xs">
          {details ? JSON.stringify(details).substring(0, 50) + '...' : '-'}
        </span>
      ),
    },
  ];

  return (
    <PageLayout
      headerTitle={
        <div className="flex items-center gap-2">
          <HiLockClosed className="h-5 w-5" />
          <span>RBAC Settings</span>
        </div>
      }
    >
      <Tabs aria-label="RBAC Settings tabs" onActiveTabChange={(tab) => setActiveTab(tab)}>
        <Tabs.Item active={activeTab === 'roles'} title={
          <span className="flex items-center gap-2">
            <HiUser className="h-4 w-4" />
            Roles & Permissions
          </span>
        }>
          <Card className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Roles Management</h3>
              <div className="flex items-center gap-2">
                {rolesLoaded && roles.length === 0 && (
                  <Button
                    color="blue"
                    onClick={handleInitializeRBAC}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        <HiCheckCircle className="h-4 w-4 mr-2" />
                        Initialize RBAC System
                      </>
                    )}
                  </Button>
                )}
                <Button
                  color="gray"
                  onClick={fetchRoles}
                  disabled={rolesLoading}
                >
                  {rolesLoading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <HiRefresh className="h-4 w-4 mr-2" />
                      Refresh
                    </>
                  )}
                </Button>
                <Button
                  color="blue"
                  onClick={handleCreateRole}
                  disabled={!rolesLoaded || roles.length === 0}
                >
                  <HiPlus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </div>
            </div>
            
            <Alert color="info" className="mb-4">
              <div>
                <p className="font-medium mb-2">
                  Role-Based Access Control
                </p>
                <p className="text-sm mb-2">
                  Manage roles and their permissions. Each role has a set of permissions that determine what users can do in the system.
                </p>
                {rolesLoaded && roles.length === 0 && (
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900 rounded">
                    <p className="font-semibold">⚠️ No roles found</p>
                    <p className="text-sm mt-1">
                      You need to initialize the RBAC system first. Click the "Initialize RBAC System" button above, or run this command in your terminal:
                    </p>
                    <code className="block mt-1 p-1 bg-white dark:bg-gray-800 rounded text-xs">
                      npx tsx scripts/initialize-rbac.ts
                    </code>
                    <p className="text-xs mt-1">
                      This will create all 13 system roles and their default permissions.
                    </p>
                  </div>
                )}
              </div>
            </Alert>
            
            <FlowbiteTable
              columns={rolesColumns}
              dataSource={roles}
              loading={rolesLoading}
              rowKey="id"
              pagination={{ pageSize: 20 }}
            />
          </Card>
        </Tabs.Item>

        <Tabs.Item active={activeTab === 'permissions'} title={
          <span className="flex items-center gap-2">
            <HiLockClosed className="h-4 w-4" />
            Permission Matrix
          </span>
        }>
          <Card className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Permission Matrix</h3>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedRole?.id || ''}
                  onChange={(e) => {
                    const role = roles.find(r => r.id === e.target.value);
                    if (role) {
                      setSelectedRole(role);
                    }
                  }}
                  className="w-64"
                >
                  <option value="">Select a role to view/edit permissions</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.displayName}
                    </option>
                  ))}
                </Select>
                <Button
                  color={permissionEditorMode ? 'gray' : 'blue'}
                  onClick={() => setPermissionEditorMode(!permissionEditorMode)}
                  disabled={!selectedRole}
                >
                  {permissionEditorMode ? (
                    <>
                      <HiEye className="h-4 w-4 mr-2" />
                      View Mode
                    </>
                  ) : (
                    <>
                      <HiPencil className="h-4 w-4 mr-2" />
                      Edit Mode
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {selectedRole ? (
              <>
                <Alert color={permissionEditorMode ? 'warning' : 'info'} className="mb-4">
                  <div>
                    <p className="font-medium">
                      {permissionEditorMode ? 'Edit Permissions' : 'View Permissions by Role'}
                    </p>
                    <p className="text-sm mt-1">
                      {permissionEditorMode
                        ? 'You can now edit permissions for the selected role. Check/uncheck actions to modify permissions, then click "Save Changes" to apply.'
                        : 'Viewing permissions for the selected role. Click "Edit Mode" to modify permissions.'}
                    </p>
                  </div>
                </Alert>
                {permissionEditorMode ? (
                  <PermissionMatrixEditor
                    roleId={selectedRole.id}
                    roleName={selectedRole.name}
                    readOnly={false}
                    onSave={() => {
                      notify.success('Permissions updated successfully');
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
              <Alert color="info" className="mb-4">
                <div>
                  <p className="font-medium">Select a Role</p>
                  <p className="text-sm mt-1">
                    Please select a role from the dropdown above to view or edit its permission matrix.
                  </p>
                </div>
              </Alert>
            )}
          </Card>
        </Tabs.Item>

        <Tabs.Item active={activeTab === 'assignment'} title={
          <span className="flex items-center gap-2">
            <HiUser className="h-4 w-4" />
            Role Assignment
          </span>
        }>
          <Card className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Role Assignment</h3>
            <Alert color="info" className="mb-4">
              <div>
                <p className="font-medium">Assign Roles to Users</p>
                <p className="text-sm mt-1">
                  Use the Users page to assign roles to individual users. You can also manage scopes (portfolio, property, unit) for each role assignment.
                </p>
              </div>
            </Alert>
            <Button
              color="blue"
              onClick={() => window.location.href = '/admin/users'}
            >
              <HiUser className="h-4 w-4 mr-2" />
              Go to Users Page
            </Button>
          </Card>
        </Tabs.Item>

        <Tabs.Item active={activeTab === 'audit'} title={
          <span className="flex items-center gap-2">
            <HiDocumentText className="h-4 w-4" />
            RBAC Audit Logs
          </span>
        }>
          <Card className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">RBAC Audit Logs</h3>
              <Button
                color="gray"
                onClick={fetchAuditLogs}
                disabled={auditLogsLoading}
              >
                {auditLogsLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <HiRefresh className="h-4 w-4 mr-2" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
            
            <Alert color="info" className="mb-4">
              <div>
                <p className="font-medium">RBAC Activity Log</p>
                <p className="text-sm mt-1">
                  This log tracks all RBAC-related activities including role assignments, permission changes, scope modifications, and access attempts.
                </p>
              </div>
            </Alert>
            
            <FlowbiteTable
              columns={auditLogsColumns}
              dataSource={auditLogs}
              loading={auditLogsLoading}
              rowKey="id"
              pagination={{ pageSize: 50 }}
            />
          </Card>
        </Tabs.Item>
      </Tabs>

      {/* Permission Matrix Modal */}
      <Modal show={permissionMatrixVisible} onClose={() => {
        setPermissionMatrixVisible(false);
        setSelectedRole(null);
      }} size="7xl">
        <Modal.Header>
          {selectedRole ? `Permission Matrix: ${selectedRole.displayName}` : 'Permission Matrix'}
        </Modal.Header>
        <Modal.Body>
          {selectedRole ? (
            <PermissionMatrixViewer
              roleId={selectedRole.id}
              roleName={selectedRole.name}
              readOnly={true}
            />
          ) : (
            <Alert color="warning">
              <div>
                <p className="font-medium">No role selected</p>
              </div>
            </Alert>
          )}
        </Modal.Body>
      </Modal>

      {/* Role Management Modal */}
      <Modal show={roleModalVisible} onClose={() => {
        setRoleModalVisible(false);
        setEditingRole(null);
        roleForm.resetFields();
      }}>
        <Modal.Header>
          {editingRole ? 'Edit Role' : 'Create Role'}
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveRole(); }} className="space-y-4">
            <div>
              <Label htmlFor="name" value="System Name" />
              <TextInput
                id="name"
                type="text"
                placeholder="e.g., PMC_ADMIN"
                value={roleForm.values.name}
                onChange={(e) => roleForm.setFieldsValue({ name: e.target.value })}
                disabled={!!editingRole}
                required
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Internal system name (e.g., PMC_ADMIN, PROPERTY_MANAGER)
              </p>
            </div>
            
            <div>
              <Label htmlFor="displayName" value="Display Name" />
              <TextInput
                id="displayName"
                type="text"
                placeholder="e.g., PMC Admin"
                value={roleForm.values.displayName}
                onChange={(e) => roleForm.setFieldsValue({ displayName: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description" value="Description" />
              <Textarea
                id="description"
                placeholder="Role description"
                value={roleForm.values.description}
                onChange={(e) => roleForm.setFieldsValue({ description: e.target.value })}
                rows={3}
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <ToggleSwitch
                checked={roleForm.values.isActive}
                onChange={(checked) => roleForm.setFieldsValue({ isActive: checked })}
                label="Active"
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => {
            setRoleModalVisible(false);
            setEditingRole(null);
            roleForm.resetFields();
          }}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleSaveRole} disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </PageLayout>
  );
}
