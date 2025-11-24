"use client";

import { useState, useEffect } from 'react';
import { Card, ToggleSwitch, Button, Alert, Spinner } from 'flowbite-react';
import { HiLockClosed, HiCheckCircle } from 'react-icons/hi';
import { useFormState } from '@/lib/hooks/useFormState';
import { notify } from '@/lib/utils/notification-helper';

/**
 * Permission Settings Component
 * Allows landlords to configure permissions for their PMC relationship
 */
export default function PermissionSettings({ relationshipId }) {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const form = useFormState({
    canManageProperties: false,
    canManageTenants: false,
    canManageLeases: false,
    canManageMaintenance: false,
    canManageFinancials: false,
    canViewReports: false,
  });

  useEffect(() => {
    if (relationshipId) {
      fetchPermissions();
    }
  }, [relationshipId]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      // Use direct fetch for permissions (no v1 equivalent yet)
      const response = await fetch(
        `/api/relationships/${relationshipId}/permissions`,
        {
          credentials: 'include',
        }
      );

      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to fetch permissions');
      }
      if (data.success || data.permissions) {
        const permissionsData = data.permissions || data.data?.permissions || data.data;
        setPermissions(permissionsData);
        form.setFieldsValue(permissionsData);
      }
    } catch (error) {
      console.error('[Permission Settings] Error:', error);
      notify.error(error.message || 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const values = form.getFieldsValue();

    try {
      setSaving(true);
      // Use direct fetch for permissions (no v1 equivalent yet)
      const response = await fetch(
        `/api/relationships/${relationshipId}/permissions`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            permissions: values,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'Failed to update permissions');
      }
      
      const data = await response.json();
      if (data.success || data) {
        notify.success('Permissions updated successfully');
        setPermissions(values);
      }
    } catch (error) {
      console.error('[Permission Settings] Error:', error);
      notify.error(error.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex justify-center items-center py-8">
          <Spinner size="xl" />
        </div>
      </Card>
    );
  }

  const permissionFields = [
    { key: 'canManageProperties', label: 'Manage Properties', description: 'Allow PMC to create, edit, and delete properties' },
    { key: 'canManageTenants', label: 'Manage Tenants', description: 'Allow PMC to add, remove, and manage tenant information' },
    { key: 'canManageLeases', label: 'Manage Leases', description: 'Allow PMC to create and manage lease agreements' },
    { key: 'canManageMaintenance', label: 'Manage Maintenance', description: 'Allow PMC to create and manage maintenance requests' },
    { key: 'canManageFinancials', label: 'Manage Financials', description: 'Allow PMC to manage rent payments and financial records' },
    { key: 'canViewReports', label: 'View Reports', description: 'Allow PMC to view property and financial reports' },
  ];

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <HiLockClosed className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Permission Settings</h3>
      </div>

      <Alert color="info" className="mb-4">
        <div>
          <p className="text-sm">
            Configure what actions your PMC can perform on your behalf. Changes take effect immediately.
          </p>
        </div>
      </Alert>

      <form onSubmit={handleSave} className="space-y-4">
        {permissionFields.map((field) => (
          <div key={field.key} className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                {field.label}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {field.description}
              </p>
            </div>
            <ToggleSwitch
              checked={form.values[field.key] || false}
              onChange={(checked) => form.setFieldsValue({ [field.key]: checked })}
              className="ml-4"
            />
          </div>
        ))}

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button color="gray" onClick={() => form.setFieldsValue(permissions || {})}>
            Reset
          </Button>
          <Button
            type="submit"
            color="blue"
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <Spinner size="sm" />
                Saving...
              </>
            ) : (
              <>
                <HiCheckCircle className="h-4 w-4" />
                Save Permissions
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
