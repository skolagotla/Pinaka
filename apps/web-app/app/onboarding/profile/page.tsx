"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextInput, Alert, Spinner } from 'flowbite-react';
import { HiMail, HiPhone, HiUser, HiArrowRight, HiArrowLeft } from 'react-icons/hi';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import { v2Api } from '@/lib/api/v2-client';

export default function OnboardingProfilePage() {
  const router = useRouter();
  const { user, hasRole } = useV2Auth();
  const { status, updateStatus, loading } = useOnboarding();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.user) {
      setFullName(user.user.full_name || '');
      setPhone(user.user.phone || '');
    }
  }, [user]);

  const getRoleSteps = () => {
    if (hasRole('super_admin')) {
      return {
        totalSteps: 5,
        stepLabels: ['Welcome', 'Profile', 'PMCs', 'Invite Admins', 'Complete'],
        nextStep: '/onboarding/organization',
      };
    } else if (hasRole('pmc_admin')) {
      return {
        totalSteps: 6,
        stepLabels: ['Welcome', 'Profile', 'Organization', 'Properties', 'Invite Team', 'Complete'],
        nextStep: '/onboarding/organization',
      };
    } else if (hasRole('pm')) {
      return {
        totalSteps: 5,
        stepLabels: ['Welcome', 'Profile', 'Properties', 'Preferences', 'Complete'],
        nextStep: '/onboarding/properties',
      };
    } else if (hasRole('landlord')) {
      return {
        totalSteps: 5,
        stepLabels: ['Welcome', 'Profile', 'Properties', 'Preferences', 'Complete'],
        nextStep: '/onboarding/properties',
      };
    } else if (hasRole('tenant')) {
      return {
        totalSteps: 5,
        stepLabels: ['Welcome', 'Profile', 'Lease', 'Preferences', 'Complete'],
        nextStep: '/onboarding/preferences',
      };
    } else if (hasRole('vendor')) {
      return {
        totalSteps: 4,
        stepLabels: ['Welcome', 'Profile', 'Services', 'Complete'],
        nextStep: '/onboarding/preferences',
      };
    }
    return {
      totalSteps: 3,
      stepLabels: ['Welcome', 'Profile', 'Complete'],
      nextStep: '/onboarding/complete',
    };
  };

  const roleSteps = getRoleSteps();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      // Update user profile
      await v2Api.request(`/users/me`, {
        method: 'PATCH',
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
        }),
      });

      // Update onboarding step
      await updateStatus({
        step: 2,
        data: {
          profile: {
            full_name: fullName.trim(),
            phone: phone.trim(),
          },
        },
      });

      router.push(roleSteps.nextStep);
    } catch (err: any) {
      setError(err.detail || err.message || 'Failed to save profile');
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
      currentStep={2}
      totalSteps={roleSteps.totalSteps}
      stepLabels={roleSteps.stepLabels}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Profile
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Let's start with some basic information about you.
          </p>
        </div>

        {error && (
          <Alert color="failure" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Email Address
            </label>
            <TextInput
              id="email"
              type="email"
              icon={HiMail}
              value={user?.user?.email || ''}
              disabled
              className="bg-gray-50 dark:bg-gray-800"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label htmlFor="fullName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Full Name
            </label>
            <TextInput
              id="fullName"
              type="text"
              icon={HiUser}
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Phone Number
            </label>
            <TextInput
              id="phone"
              type="tel"
              icon={HiPhone}
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              color="gray"
              onClick={() => router.push('/onboarding/start')}
              disabled={saving}
            >
              <HiArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={saving || !fullName.trim()}
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

