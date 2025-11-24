/**
 * Role Assignment Modal - Phase 7
 * 
 * Modal for assigning roles to users
 * Extends existing admin users functionality
 */

"use client";

import { useState, useEffect } from 'react';
import { Modal, Select, Button, Alert, Badge, Spinner } from 'flowbite-react';
import { HiUser, HiCheckCircle } from 'react-icons/hi';
import type { RBACRole } from '@/lib/types/rbac';
import { useFormState } from '@/lib/hooks/useFormState';
import { notify } from '@/lib/utils/notification-helper';

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
  const form = useFormState({ roles: [] });
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
          notify.error(data.error);
        }
      }
    } catch (error) {
      console.error('Error loading existing roles:', error);
      notify.error('Failed to load existing roles');
      setExistingRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = form.getFieldsValue();
    
    if (!values.roles || values.roles.length === 0) {
      notify.error('Please select at least one role');
      return;
    }

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

      notify.success('Roles assigned successfully');
      onSuccess?.();
      onClose();
      form.resetForm();
    } catch (error: any) {
      console.error('Error assigning roles:', error);
      notify.error(error.message || 'Failed to assign roles');
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
    <Modal show={visible} onClose={onClose} size="lg">
      <Modal.Header>
        <div className="flex items-center gap-2">
          <HiUser className="h-5 w-5" />
          <span>Assign Roles</span>
        </div>
      </Modal.Header>
      <Modal.Body>
        <Alert color="info" className="mb-4">
          <div>
            <h3 className="font-semibold">Assigning roles to {userName || userEmail || userId}</h3>
            <p className="text-sm mt-1">
              Select one or more roles to assign to this user. Roles determine what permissions the user has.
            </p>
          </div>
        </Alert>

        {loadingRoles ? (
          <div className="flex justify-center items-center py-8">
            <Spinner size="xl" />
            <span className="ml-3">Loading existing roles...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {existingRoles.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold mb-2">Current Roles:</p>
                <div className="flex flex-wrap gap-2">
                  {existingRoles.map((role, index) => (
                    <Badge key={index} color="blue">
                      {role.roleDisplayName || role.roleName || role.role}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="roles" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Roles <span className="text-red-500">*</span>
              </label>
              <Select
                id="roles"
                multiple
                value={form.values.roles || []}
                onChange={(e) => {
                  const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                  form.setFieldsValue({ roles: selectedOptions });
                }}
                required
                className="w-full"
              >
                {getAvailableRoles().map((role) => (
                  <option key={role} value={role}>
                    {role.replace(/_/g, ' ')}
                  </option>
                ))}
              </Select>
            </div>

            {/* Scope fields can be added here if needed */}
            {/* For now, scope is determined by context (pmcId, landlordId) */}

            <div className="flex justify-end gap-2 pt-4">
              <Button color="gray" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                color="blue"
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <HiCheckCircle className="h-4 w-4" />
                    Assign Roles
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal.Body>
    </Modal>
  );
}
