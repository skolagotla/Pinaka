/**
 * Permission Matrix Viewer
 * 
 * Displays the permission matrix for a role
 * Read-only viewer (converted to Flowbite)
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Select, Badge, Spinner, Alert } from 'flowbite-react';
import { HiLockClosed } from 'react-icons/hi';
import { RBACRole, ResourceCategory, PermissionAction } from '@prisma/client';
import { getResourceLabel, getCategoryLabel, getRoleLabel } from '@/lib/rbac/resourceLabels';

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
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <HiLockClosed className="h-5 w-5" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Permission Matrix</h3>
      </div>

      {!roleId && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">Select Role:</span>
          <Select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as RBACRole)}
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

      {readOnly && (
        <Alert color="info" className="mb-4">
          <div>
            <p className="font-medium">Read-Only View</p>
            <p className="text-sm mt-1">
              This is a read-only view of the permission matrix. To edit permissions, use the permission matrix editor.
            </p>
          </div>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="xl" />
        </div>
      ) : tableData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No permissions found for this role.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableHeadCell>Category</TableHeadCell>
              <TableHeadCell>Resource</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y">
              {tableData.map((record: any) => (
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
                    <div className="flex flex-wrap gap-2">
                      {record.action.split(', ').map((act: string) => (
                        <Badge key={act} color="success">
                          {act}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
