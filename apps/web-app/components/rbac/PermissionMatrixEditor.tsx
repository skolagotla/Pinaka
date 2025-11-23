/**
 * Permission Matrix Editor
 * 
 * Allows Super Admins and PMC Admins to edit permissions for roles
 * Converted to Flowbite
 */

"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Select,
  Button,
  Spinner,
  Alert,
  Modal,
  TextInput,
  Label,
  ToggleSwitch,
  Textarea,
} from 'flowbite-react';
import {
  HiLockClosed,
  HiSave,
  HiRefresh,
  HiPencil,
  HiCheck,
  HiX,
  HiPlus,
  HiSearch,
} from 'react-icons/hi';
import { RBACRole, ResourceCategory, PermissionAction } from '@prisma/client';
import { getResourceLabel, getCategoryLabel, getRoleLabel } from '@/lib/rbac/resourceLabels';
import { notify } from '@/lib/utils/notification-helper';
import { ModalHelper } from '@/lib/utils/flowbite-modal-helper';

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
        const { adminApi } = await import('@/lib/api/admin-api');
        const rolesData = await adminApi.getRBACRoles();
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
        const { adminApi } = await import('@/lib/api/admin-api');
        const data = await adminApi.getRolePermissionsByName(roleNameToUse);
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
      notify.error('Failed to load permissions');
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
      notify.error('Please select a category and enter a resource name');
      return;
    }

    // Check if permission already exists
    const exists = permissions.some(
      p => p.category === newPermissionCategory && p.resource === newPermissionResource.trim()
    );

    if (exists) {
      notify.warning('This permission already exists');
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
      notify.error('No role selected');
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
        notify.success('Permissions saved successfully');
        setOriginalPermissions(JSON.parse(JSON.stringify(permissions)));
        setHasChanges(false);
        onSave?.();
      } else {
        notify.error(data.error || 'Failed to save permissions');
      }
    } catch (error: any) {
      console.error('Error saving permissions:', error);
      notify.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    ModalHelper.confirm({
      title: 'Reset Changes?',
      message: 'Are you sure you want to discard all unsaved changes?',
      onConfirm: () => {
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

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiLockClosed className="h-5 w-5" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Permission Matrix Editor</h3>
        </div>
        <div className="flex items-center gap-2">
          {editingMode && (
            <>
              <Button
                color="gray"
                onClick={handleReset}
                disabled={!hasChanges}
              >
                <HiRefresh className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                color="blue"
                onClick={handleSave}
                disabled={!hasChanges || !selectedRoleId || saving}
              >
                {saving ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <HiSave className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          )}
          <Button
            color={editingMode ? 'gray' : 'blue'}
            onClick={() => setEditingMode(!editingMode)}
            disabled={readOnly}
          >
            {editingMode ? (
              <>
                <HiX className="h-4 w-4 mr-2" />
                Cancel Edit
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

      <div className="space-y-4">
        {/* Role Selection */}
        {!roleId && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Select Role:</span>
            <Select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value as RBACRole);
                setSelectedRoleId(undefined);
              }}
              className="w-48"
            >
              <option value="">Select a role</option>
              {Object.values(RBACRole).map((role) => (
                <option key={role} value={role}>
                  {getRoleLabel(role)}
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <HiSearch className="h-5 w-5 text-gray-500" />
          </div>
          <TextInput
            type="text"
            placeholder="Search by category, resource, or action..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Info Alert */}
        {editingMode ? (
          <Alert color="warning">
            <div>
              <p className="font-medium">Edit Mode Active</p>
              <p className="text-sm mt-1">
                You can now modify permissions by checking/unchecking actions. Click 'Save Changes' to apply your modifications.
              </p>
            </div>
          </Alert>
        ) : (
          <Alert color="info">
            <div>
              <p className="font-medium">View Mode</p>
              <p className="text-sm mt-1">
                Click 'Edit Mode' to enable permission editing.
              </p>
            </div>
          </Alert>
        )}

        {/* Permissions Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="xl" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableHeadCell>Category</TableHeadCell>
                  <TableHeadCell>Resource</TableHeadCell>
                  <TableHeadCell>Actions</TableHeadCell>
                </TableHead>
                <TableBody className="divide-y">
                  {allResources.map((record) => {
                    const perm = permissions.find(
                      p => p.category === record.category && p.resource === record.resource
                    );
                    const currentActions = perm?.actions || [];

                    return (
                      <TableRow key={`${record.category}-${record.resource}`}>
                        <TableCell>
                          <Badge color="info">{getCategoryLabel(record.category)}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-900 dark:text-white">
                            {getResourceLabel(record.resource)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-3">
                            {ALL_ACTIONS.map(action => {
                              const hasAction = currentActions.includes(action);
                              return (
                                <label
                                  key={action}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={hasAction}
                                    onChange={() => handleToggleAction(record.category, record.resource, action)}
                                    disabled={!editingMode}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                  />
                                  <Badge color={hasAction ? 'success' : 'gray'}>
                                    {action}
                                  </Badge>
                                </label>
                              );
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {editingMode && (
              <Button
                color="gray"
                outline
                onClick={handleAddPermission}
                className="w-full"
              >
                <HiPlus className="h-4 w-4 mr-2" />
                Add New Permission
              </Button>
            )}
          </>
        )}
      </div>

      {/* Add Permission Modal */}
      <Modal show={addPermissionModalVisible} onClose={() => {
        setAddPermissionModalVisible(false);
        setNewPermissionCategory(undefined);
        setNewPermissionResource('');
      }}>
        <Modal.Header>Add New Permission</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category" value="Category" />
              <Select
                id="category"
                value={newPermissionCategory || ''}
                onChange={(e) => setNewPermissionCategory(e.target.value as ResourceCategory)}
                className="mt-1"
              >
                <option value="">Select Category</option>
                {ALL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="resource" value="Resource" />
              <TextInput
                id="resource"
                type="text"
                placeholder="Resource name (e.g., 'property', 'tenant', 'lease')"
                value={newPermissionResource}
                onChange={(e) => setNewPermissionResource(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveNewPermission();
                  }
                }}
                className="mt-1"
              />
            </div>
            <Alert color="info">
              <div>
                <p className="text-sm">
                  The permission will be created with READ action by default. You can add more actions after creation.
                </p>
              </div>
            </Alert>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => {
            setAddPermissionModalVisible(false);
            setNewPermissionCategory(undefined);
            setNewPermissionResource('');
          }}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleSaveNewPermission}>
            Add Permission
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}
