"use client";

import { useEffect, useState } from 'react';
import { Card, Button, Alert } from 'flowbite-react';
import { HiStop, HiSupport, HiHome } from 'react-icons/hi';
import { useRouter } from 'next/navigation';

export default function AccountSuspendedPage() {
  const router = useRouter();
  const [organizationInfo, setOrganizationInfo] = useState(null);

  useEffect(() => {
    // Try to get organization info to show more details
    (async () => {
      try {
        const { adminApi } = await import('@/lib/api/admin-api');
        const data = await adminApi.getOrganization();
        if (data.success && data.data?.organization) {
          setOrganizationInfo(data.data.organization);
        }
      } catch (err) {
        console.error('Error fetching organization info:', err);
      }
    })();
  }, []);

  const getStatusMessage = () => {
    if (!organizationInfo) {
      return {
        title: 'Account Suspended',
        subTitle: 'Your organization account has been suspended.',
      };
    }

    switch (organizationInfo.status) {
      case 'SUSPENDED':
        return {
          title: 'Account Suspended',
          subTitle: 'Your organization account has been suspended. Please contact support for assistance.',
        };
      case 'CANCELLED':
        return {
          title: 'Account Cancelled',
          subTitle: 'Your organization account has been cancelled. Please contact support to reactivate.',
        };
      case 'TRIAL':
        if (organizationInfo.trialEndsAt && new Date(organizationInfo.trialEndsAt) < new Date()) {
          return {
            title: 'Trial Expired',
            subTitle: 'Your trial period has ended. Please upgrade to a paid plan to continue using the service.',
          };
        }
        return {
          title: 'Account Suspended',
          subTitle: 'Your organization account has been suspended.',
        };
      default:
        return {
          title: 'Account Suspended',
          subTitle: 'Your organization account is in an invalid state. Please contact support.',
        };
    }
  };

  const message = getStatusMessage();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <Card className="max-w-2xl w-full">
        <div className="text-center mb-6">
          <HiStop className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {message.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {message.subTitle}
          </p>
        </div>

        {organizationInfo && (
          <Alert color="info" className="mb-6">
            <div className="text-left">
              <p className="font-semibold mb-2">Organization Details:</p>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-500">Name: </span>
                  <span className="font-medium">{organizationInfo.name}</span>
                </p>
                {organizationInfo.plan && (
                  <p>
                    <span className="text-gray-500">Plan: </span>
                    <span className="font-medium">{organizationInfo.plan}</span>
                  </p>
                )}
                {organizationInfo.trialEndsAt && (
                  <p>
                    <span className="text-gray-500">Trial Ended: </span>
                    <span className="font-medium">
                      {new Date(organizationInfo.trialEndsAt).toLocaleDateString()}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </Alert>
        )}

        <div className="flex gap-3 justify-center">
          <Button
            color="blue"
            onClick={() => window.open('mailto:support@pinaka.com', '_blank')}
            className="flex items-center gap-2"
          >
            <HiSupport className="h-4 w-4" />
            Contact Support
          </Button>
          <Button
            color="gray"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <HiHome className="h-4 w-4" />
            Go Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
