"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Alert, Spinner, Table } from 'flowbite-react';
import { HiArrowRight, HiArrowLeft, HiHome, HiCheckCircle } from 'react-icons/hi';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import { v2Api } from '@/lib/api/v2-client';

export default function OnboardingPropertiesPage() {
  const router = useRouter();
  const { user, hasRole } = useV2Auth();
  const { status, updateStatus, loading } = useOnboarding();

  const [properties, setProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProperties();
  }, [user]);

  const loadProperties = async () => {
    try {
      setLoadingProperties(true);
      const data = await v2Api.listProperties();
      setProperties(data || []);
    } catch (err: any) {
      setError(err.detail || 'Failed to load properties');
    } finally {
      setLoadingProperties(false);
    }
  };

  const getRoleSteps = () => {
    if (hasRole('pm')) {
      return {
        totalSteps: 5,
        stepLabels: ['Welcome', 'Profile', 'Properties', 'Preferences', 'Complete'],
        nextStep: '/onboarding/preferences',
      };
    } else if (hasRole('landlord')) {
      return {
        totalSteps: 5,
        stepLabels: ['Welcome', 'Profile', 'Properties', 'Preferences', 'Complete'],
        nextStep: '/onboarding/preferences',
      };
    } else if (hasRole('super_admin')) {
      return {
        totalSteps: 5,
        stepLabels: ['Welcome', 'Profile', 'PMCs', 'Invite Admins', 'Complete'],
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

  const handleContinue = async () => {
    try {
      await updateStatus({
        step: hasRole('super_admin') ? 4 : 3,
        data: {
          ...status?.onboarding_data,
          properties_reviewed: true,
        },
      });
      router.push(roleSteps.nextStep);
    } catch (err: any) {
      setError(err.detail || 'Failed to save progress');
    }
  };

  if (loading || loadingProperties) {
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
      currentStep={hasRole('super_admin') ? 4 : 3}
      totalSteps={roleSteps.totalSteps}
      stepLabels={roleSteps.stepLabels}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {hasRole('super_admin') ? 'Invite PMC Admins' : 'Review Your Properties'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {hasRole('super_admin')
              ? 'Invite administrators to manage your PMCs.'
              : hasRole('pm')
              ? 'Review the properties assigned to you.'
              : 'Confirm the properties under your management.'}
          </p>
        </div>

        {error && (
          <Alert color="failure" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {hasRole('super_admin') ? (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You can invite PMC administrators after completing onboarding. For now, let's continue.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.length === 0 ? (
              <Alert color="info">
                <div className="flex items-center">
                  <HiHome className="mr-2 h-5 w-5" />
                  <span>No properties found. Properties will be available after setup.</span>
                </div>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <Table.Head>
                    <Table.HeadCell>Property Name</Table.HeadCell>
                    <Table.HeadCell>Address</Table.HeadCell>
                    <Table.HeadCell>Type</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {properties.slice(0, 5).map((property) => (
                      <Table.Row key={property.id}>
                        <Table.Cell className="font-medium">{property.name || 'Unnamed'}</Table.Cell>
                        <Table.Cell>
                          {property.address_line1 || 'N/A'}
                          {property.address_line2 && `, ${property.address_line2}`}
                          {property.city && `, ${property.city}`}
                          {property.state && `, ${property.state}`}
                        </Table.Cell>
                        <Table.Cell>{property.status || 'N/A'}</Table.Cell>
                        <Table.Cell>
                          <span className="inline-flex items-center">
                            <HiCheckCircle className="mr-1 h-4 w-4 text-green-500" />
                            {property.status || 'Active'}
                          </span>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center pt-4">
          <Button
            color="gray"
            onClick={() => router.push(hasRole('super_admin') ? '/onboarding/organization' : '/onboarding/profile')}
          >
            <HiArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleContinue}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            Continue
            <HiArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}

