"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, ToggleSwitch, Label, Alert, Spinner } from 'flowbite-react';
import { HiArrowRight, HiArrowLeft, HiBell } from 'react-icons/hi';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';

export default function OnboardingPreferencesPage() {
  const router = useRouter();
  const { user, hasRole } = useV2Auth();
  const { status, updateStatus, loading } = useOnboarding();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [workOrderUpdates, setWorkOrderUpdates] = useState(true);
  const [leaseReminders, setLeaseReminders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load existing preferences if available
    if (status?.onboarding_data?.preferences) {
      const prefs = status.onboarding_data.preferences;
      setEmailNotifications(prefs.emailNotifications ?? true);
      setSmsNotifications(prefs.smsNotifications ?? false);
      setWorkOrderUpdates(prefs.workOrderUpdates ?? true);
      setLeaseReminders(prefs.leaseReminders ?? true);
    }
  }, [status]);

  const getRoleSteps = () => {
    if (hasRole('super_admin')) {
      return {
        totalSteps: 5,
        stepLabels: ['Welcome', 'Profile', 'PMCs', 'Invite Admins', 'Complete'],
      };
    } else if (hasRole('pmc_admin')) {
      return {
        totalSteps: 6,
        stepLabels: ['Welcome', 'Profile', 'Organization', 'Properties', 'Invite Team', 'Complete'],
      };
    } else if (hasRole('pm')) {
      return {
        totalSteps: 5,
        stepLabels: ['Welcome', 'Profile', 'Properties', 'Preferences', 'Complete'],
      };
    } else if (hasRole('landlord')) {
      return {
        totalSteps: 5,
        stepLabels: ['Welcome', 'Profile', 'Properties', 'Preferences', 'Complete'],
      };
    } else if (hasRole('tenant')) {
      return {
        totalSteps: 5,
        stepLabels: ['Welcome', 'Profile', 'Lease', 'Preferences', 'Complete'],
      };
    } else if (hasRole('vendor')) {
      return {
        totalSteps: 4,
        stepLabels: ['Welcome', 'Profile', 'Services', 'Complete'],
      };
    }
    return {
      totalSteps: 3,
      stepLabels: ['Welcome', 'Profile', 'Complete'],
    };
  };

  const roleSteps = getRoleSteps();
  const currentStep = roleSteps.totalSteps - 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await updateStatus({
        step: currentStep,
        data: {
          ...status?.onboarding_data,
          preferences: {
            emailNotifications,
            smsNotifications,
            workOrderUpdates,
            leaseReminders,
          },
        },
      });

      router.push('/onboarding/complete');
    } catch (err: any) {
      setError(err.detail || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <OnboardingLayout>
        <div className="flex justify-center items-center py-12">
          <Spinner size="xl" />
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={roleSteps.totalSteps}
      stepLabels={roleSteps.stepLabels}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Notification Preferences
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Choose how you'd like to receive updates and notifications.
          </p>
        </div>

        {error && (
          <Alert color="failure" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <HiBell className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <Label htmlFor="emailNotifications" className="text-base font-medium text-gray-900 dark:text-white">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive updates via email
                  </p>
                </div>
              </div>
              <ToggleSwitch
                id="emailNotifications"
                checked={emailNotifications}
                onChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <HiBell className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <Label htmlFor="smsNotifications" className="text-base font-medium text-gray-900 dark:text-white">
                    SMS Notifications
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive updates via text message
                  </p>
                </div>
              </div>
              <ToggleSwitch
                id="smsNotifications"
                checked={smsNotifications}
                onChange={setSmsNotifications}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <HiBell className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <Label htmlFor="workOrderUpdates" className="text-base font-medium text-gray-900 dark:text-white">
                    Work Order Updates
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get notified about work order status changes
                  </p>
                </div>
              </div>
              <ToggleSwitch
                id="workOrderUpdates"
                checked={workOrderUpdates}
                onChange={setWorkOrderUpdates}
              />
            </div>

            {(hasRole('landlord') || hasRole('tenant') || hasRole('pm')) && (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <HiBell className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <Label htmlFor="leaseReminders" className="text-base font-medium text-gray-900 dark:text-white">
                      Lease Reminders
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get reminders about lease renewals and important dates
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  id="leaseReminders"
                  checked={leaseReminders}
                  onChange={setLeaseReminders}
                />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              color="gray"
              onClick={() => {
                if (hasRole('tenant')) {
                  router.push('/onboarding/preferences');
                } else if (hasRole('pm') || hasRole('landlord')) {
                  router.push('/onboarding/properties');
                } else {
                  router.push('/onboarding/organization');
                }
              }}
              disabled={saving}
            >
              <HiArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {saving ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <HiArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </OnboardingLayout>
  );
}

