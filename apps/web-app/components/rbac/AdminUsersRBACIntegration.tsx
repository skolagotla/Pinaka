/**
 * Admin Users RBAC Integration
 * 
 * Example integration of RBAC components into existing admin users page
 * This extends the existing admin users functionality without duplicating code
 */

"use client";

import { useState } from 'react';
import { Button, Badge, Popover } from 'flowbite-react';
import { HiUser, HiLockClosed, HiLocationMarker } from 'react-icons/hi';
import { RoleAssignmentModal, PermissionMatrixViewer, ScopeAssignment } from './index';
import { useRBAC } from '@/lib/hooks/useRBAC';

interface AdminUsersRBACIntegrationProps {
  userId: string;
  userType: string;
  userName?: string;
  userEmail?: string;
  currentUser: {
    id: string;
    type: string;
  };
}

export default function AdminUsersRBACIntegration({
  userId,
  userType,
  userName,
  userEmail,
  currentUser,
}: AdminUsersRBACIntegrationProps) {
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [scopeModalVisible, setScopeModalVisible] = useState(false);
  const [permissionViewerVisible, setPermissionViewerVisible] = useState(false);

  const { scopes, loading } = useRBAC(
    { id: userId, type: userType },
    { autoRefresh: true }
  );

  // Check if current user can manage roles
  const { checkPermission } = useRBAC(currentUser, {});
  const [canManageRoles, setCanManageRoles] = useState(false);

  useState(() => {
    checkPermission(
      'roles',
      'MANAGE' as any,
      'USER_ROLE_MANAGEMENT' as any
    ).then(setCanManageRoles);
  });

  if (!canManageRoles) {
    return null; // Don't show RBAC controls if user can't manage roles
  }

  return (
    <div className="flex items-center gap-2">
      {/* Role Assignment Button */}
      <Button
        color="gray"
        size="sm"
        onClick={() => setRoleModalVisible(true)}
        className="flex items-center gap-2"
      >
        <HiUser className="h-4 w-4" />
        Manage Roles
      </Button>

      {/* Scope Assignment Button */}
      {scopes.length > 0 && (
        <Popover
          content={
            <div className="p-2">
              <p className="font-semibold mb-2">Current Scopes:</p>
              <div className="flex flex-wrap gap-2">
                {scopes.map((scope, idx) => (
                  <Badge key={idx} color="blue">
                    {scope.propertyId ? `Property: ${scope.propertyId}` : 'Global'}
                  </Badge>
                ))}
              </div>
            </div>
          }
        >
          <Button
            color="gray"
            size="sm"
            onClick={() => setScopeModalVisible(true)}
            className="flex items-center gap-2"
          >
            <HiLocationMarker className="h-4 w-4" />
            Manage Scopes
          </Button>
        </Popover>
      )}

      {/* Permission Matrix Viewer Button */}
      <Button
        color="gray"
        size="sm"
        onClick={() => setPermissionViewerVisible(true)}
        className="flex items-center gap-2"
      >
        <HiLockClosed className="h-4 w-4" />
        View Permissions
      </Button>

      {/* Modals */}
      {roleModalVisible && (
        <RoleAssignmentModal
          visible={roleModalVisible}
          userId={userId}
          userType={userType}
          userName={userName}
          userEmail={userEmail}
          onClose={() => setRoleModalVisible(false)}
          onSuccess={() => {
            setRoleModalVisible(false);
            // Refresh data
          }}
          assignedBy={currentUser.id}
          assignedByType={currentUser.type}
        />
      )}

      {scopeModalVisible && (
        <ScopeAssignment
          userId={userId}
          userType={userType}
          roleId="" // Will be set by modal
          assignedBy={currentUser.id}
          onSuccess={() => setScopeModalVisible(false)}
        />
      )}

      {permissionViewerVisible && (
        <PermissionMatrixViewer
          visible={permissionViewerVisible}
          userId={userId}
          userType={userType}
          onClose={() => setPermissionViewerVisible(false)}
        />
      )}
    </div>
  );
}
