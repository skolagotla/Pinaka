/**
 * Admin Users RBAC Integration
 * 
 * Example integration of RBAC components into existing admin users page
 * This extends the existing admin users functionality without duplicating code
 */

"use client";

import { useState } from 'react';
import { Button, Space, Tag, Popover } from 'antd';
import { UserOutlined, LockOutlined, EnvironmentOutlined } from '@ant-design/icons';
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
    <Space>
      {/* Role Assignment Button */}
      <Button
        icon={<UserOutlined />}
        onClick={() => setRoleModalVisible(true)}
      >
        Manage Roles
      </Button>

      {/* Scope Assignment Button */}
      {scopes.length > 0 && (
        <Popover
          content={
            <div>
              <strong>Current Scopes:</strong>
              {scopes.map((scope, idx) => (
                <Tag key={idx} color="blue" style={{ marginTop: 4 }}>
                  {scope.propertyId ? `Property: ${scope.propertyId}` : 'Global'}
                </Tag>
              ))}
            </div>
          }
          title="User Scopes"
        >
          <Button
            icon={<EnvironmentOutlined />}
            onClick={() => setScopeModalVisible(true)}
          >
            Manage Scopes
          </Button>
        </Popover>
      )}

      {/* Permission Matrix Viewer Button */}
      <Button
        icon={<LockOutlined />}
        onClick={() => setPermissionViewerVisible(true)}
      >
        View Permissions
      </Button>

      {/* Modals */}
      <RoleAssignmentModal
        visible={roleModalVisible}
        userId={userId}
        userType={userType}
        userName={userName}
        userEmail={userEmail}
        onClose={() => setRoleModalVisible(false)}
        onSuccess={() => {
          setRoleModalVisible(false);
          // Refresh user data
        }}
        assignedBy={currentUser.id}
        assignedByType={currentUser.type}
      />

      {permissionViewerVisible && (
        <PermissionMatrixViewer
          roleName={undefined} // Will show selector
          readOnly={true}
        />
      )}
    </Space>
  );
}

