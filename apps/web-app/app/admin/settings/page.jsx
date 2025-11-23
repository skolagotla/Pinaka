"use client";

import { useState, useEffect } from 'react';
import { Card, ToggleSwitch, Button, Alert, Spinner } from 'flowbite-react';
import { HiCog, HiRefresh } from 'react-icons/hi';
import { PageLayout, FormTextInput, FormActions } from '@/components/shared';
import { useFormState } from '@/lib/hooks/useFormState';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const initialFormValues = {
    maintenanceMode: false,
    featureFlags: {
      tenantInvitations: false,
      documentVault: false,
      maintenanceRequests: false,
      rentPayments: false,
    },
    email: {
      enabled: false,
      provider: 'gmail',
    },
    notifications: {
      enabled: false,
      channels: ['email'],
    },
  };
  const formState = useFormState(initialFormValues);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getSettings();

      if (data.success) {
        setSettings(data.data);
        formState.setValues(data.data);
      } else {
        setError(data.error || 'Failed to fetch settings');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err?.message || 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const values = formState.values;
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.updateSettings(values);

      if (data.success) {
        setSuccess('Settings saved successfully');
        setSettings(data.data);
        formState.setValues(data.data);
      } else {
        setError(data.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <PageLayout
      headerTitle={
        <div className="flex items-center gap-2">
          <HiCog className="h-5 w-5" />
          <span>Platform Configuration</span>
        </div>
      }
      contentStyle={{ maxWidth: 1000, margin: '0 auto' }}
    >
      {error && (
        <Alert color="failure" className="mb-6">
          <div>
            <div className="font-medium">Error</div>
            <div className="text-sm mt-1">{error}</div>
          </div>
        </Alert>
      )}

      {success && (
        <Alert color="success" className="mb-6">
          <div>
            <div className="font-medium">Success</div>
            <div className="text-sm mt-1">{success}</div>
          </div>
        </Alert>
      )}

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Maintenance Mode
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  When enabled, the platform will be unavailable to users.
                </p>
              </div>
              <ToggleSwitch
                checked={formState.values.maintenanceMode}
                onChange={(checked) => formState.setFieldsValue({ maintenanceMode: checked })}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Feature Flags</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Tenant Invitations
              </label>
              <ToggleSwitch
                checked={formState.values.featureFlags?.tenantInvitations || false}
                onChange={(checked) => formState.setFieldsValue({
                  featureFlags: {
                    ...formState.values.featureFlags,
                    tenantInvitations: checked
                  }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Document Vault
              </label>
              <ToggleSwitch
                checked={formState.values.featureFlags?.documentVault || false}
                onChange={(checked) => formState.setFieldsValue({
                  featureFlags: {
                    ...formState.values.featureFlags,
                    documentVault: checked
                  }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Maintenance Requests
              </label>
              <ToggleSwitch
                checked={formState.values.featureFlags?.maintenanceRequests || false}
                onChange={(checked) => formState.setFieldsValue({
                  featureFlags: {
                    ...formState.values.featureFlags,
                    maintenanceRequests: checked
                  }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Rent Payments
              </label>
              <ToggleSwitch
                checked={formState.values.featureFlags?.rentPayments || false}
                onChange={(checked) => formState.setFieldsValue({
                  featureFlags: {
                    ...formState.values.featureFlags,
                    rentPayments: checked
                  }
                })}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Email Configuration</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Enable Email
              </label>
              <ToggleSwitch
                checked={formState.values.email?.enabled || false}
                onChange={(checked) => formState.setFieldsValue({
                  email: {
                    ...formState.values.email,
                    enabled: checked
                  }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Email Provider
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {settings?.email?.provider || 'gmail'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Enable Notifications
              </label>
              <ToggleSwitch
                checked={formState.values.notifications?.enabled || false}
                onChange={(checked) => formState.setFieldsValue({
                  notifications: {
                    ...formState.values.notifications,
                    enabled: checked
                  }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Notification Channels
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {settings?.notifications?.channels?.join(', ') || 'email'}
              </p>
            </div>
          </div>
        </Card>

        <div className="flex items-center gap-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <Spinner size="sm" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
          <Button
            color="gray"
            onClick={fetchSettings}
            disabled={loading || saving}
            className="flex items-center gap-2"
          >
            <HiRefresh className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}

