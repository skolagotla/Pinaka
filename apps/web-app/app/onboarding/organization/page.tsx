"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextInput, Select, Alert, Spinner } from 'flowbite-react';
import { HiOfficeBuilding, HiArrowRight, HiArrowLeft } from 'react-icons/hi';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import { v2Api } from '@/lib/api/v2-client';

export default function OnboardingOrganizationPage() {
  const router = useRouter();
  const { user, hasRole } = useV2Auth();
  const { status, updateStatus, loading } = useOnboarding();

  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('PMC');
  const [timezone, setTimezone] = useState('America/Toronto');
  const [country, setCountry] = useState('Canada');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load existing organization data if available
    if (user?.user?.organization_id && status?.onboarding_data?.organization) {
      const orgData = status.onboarding_data.organization;
      setOrgName(orgData.name || '');
      setOrgType(orgData.type || 'PMC');
      setTimezone(orgData.timezone || 'America/Toronto');
      setCountry(orgData.country || 'Canada');
    }
  }, [user, status]);

  const getRoleSteps = () => {
    if (hasRole('super_admin')) {
      return {
        totalSteps: 5,
        stepLabels: ['Welcome', 'Profile', 'PMCs', 'Invite Admins', 'Complete'],
        nextStep: '/onboarding/properties',
      };
    } else if (hasRole('pmc_admin')) {
      return {
        totalSteps: 6,
        stepLabels: ['Welcome', 'Profile', 'Organization', 'Properties', 'Invite Team', 'Complete'],
        nextStep: '/onboarding/properties',
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
      let organizationId = user?.user?.organization_id;

      // For super_admin, they might create a new PMC
      // For pmc_admin, they should already have an org, but we can update it
      if (hasRole('super_admin') && !organizationId) {
        // Create new organization
        const newOrg = await v2Api.request('/organizations', {
          method: 'POST',
          body: JSON.stringify({
            name: orgName.trim(),
            type: orgType,
            timezone,
            country,
          }),
        });
        organizationId = newOrg.id;
      } else if (organizationId) {
        // Update existing organization - use PATCH if available, otherwise skip
        try {
          await v2Api.request(`/organizations/${organizationId}`, {
            method: 'PATCH',
            body: JSON.stringify({
              name: orgName.trim(),
              timezone,
              country,
            }),
          });
        } catch (err) {
          // If update endpoint doesn't exist, just continue
          console.warn('Organization update not available:', err);
        }
      }

      // Update onboarding step
      await updateStatus({
        step: 3,
        data: {
          ...status?.onboarding_data,
          organization: {
            id: organizationId,
            name: orgName.trim(),
            type: orgType,
            timezone,
            country,
          },
        },
      });

      router.push(roleSteps.nextStep);
    } catch (err: any) {
      setError(err.detail || err.message || 'Failed to save organization');
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
      currentStep={hasRole('super_admin') ? 3 : 3}
      totalSteps={roleSteps.totalSteps}
      stepLabels={roleSteps.stepLabels}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {hasRole('super_admin') ? 'Create or Select PMC' : 'Organization Settings'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {hasRole('super_admin')
              ? 'Set up your Property Management Company or select an existing one.'
              : 'Configure your organization details.'}
          </p>
        </div>

        {error && (
          <Alert color="failure" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="orgName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Organization Name
            </label>
            <TextInput
              id="orgName"
              type="text"
              icon={HiOfficeBuilding}
              placeholder="Enter organization name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
          </div>

          {hasRole('super_admin') && (
            <div>
              <label htmlFor="orgType" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Organization Type
              </label>
              <Select
                id="orgType"
                value={orgType}
                onChange={(e) => setOrgType(e.target.value)}
                required
              >
                <option value="PMC">Property Management Company</option>
                <option value="LANDLORD">Landlord</option>
              </Select>
            </div>
          )}

          <div>
            <label htmlFor="timezone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Timezone
            </label>
            <Select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              required
            >
              <option value="America/Toronto">Eastern Time (Toronto)</option>
              <option value="America/Vancouver">Pacific Time (Vancouver)</option>
              <option value="America/Edmonton">Mountain Time (Edmonton)</option>
              <option value="America/Winnipeg">Central Time (Winnipeg)</option>
            </Select>
          </div>

          <div>
            <label htmlFor="country" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Country
            </label>
            <Select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            >
              <option value="Canada">Canada</option>
              <option value="United States">United States</option>
            </Select>
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              color="gray"
              onClick={() => router.push('/onboarding/profile')}
              disabled={saving}
            >
              <HiArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={saving || !orgName.trim()}
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

