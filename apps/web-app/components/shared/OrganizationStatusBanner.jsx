"use client";

import { useState, useEffect } from 'react';
import { Alert, Button } from 'flowbite-react';
import { HiExclamation, HiStop, HiClock } from 'react-icons/hi';
import { useRouter } from 'next/navigation';

/**
 * Organization Status Banner Component
 * Displays organization status alerts (suspended, cancelled, trial expiration, etc.)
 * Can be used in any page to show organization status
 */
export default function OrganizationStatusBanner() {
  const router = useRouter();
  const [organizationStatus, setOrganizationStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { adminApi } = await import('@/lib/api/admin-api');
        const data = await adminApi.getOrganization();
        if (data.success && data.data?.organization) {
          setOrganizationStatus(data.data);
        }
      } catch (err) {
        console.error('Error fetching organization status:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !organizationStatus) {
    return null;
  }

  const { organization, trialStatus, limits, apiStats } = organizationStatus;
  const alerts = [];

  // Account suspended
  if (organization.status === 'SUSPENDED') {
    alerts.push({
      key: 'suspended',
      color: 'failure',
      icon: HiStop,
      message: 'Account Suspended',
      description: 'Your organization account has been suspended. Please contact support for assistance.',
      action: (
        <Button size="sm" onClick={() => router.push('/settings')}>
          View Details
        </Button>
      ),
    });
  }

  // Account cancelled
  if (organization.status === 'CANCELLED') {
    alerts.push({
      key: 'cancelled',
      color: 'warning',
      icon: HiStop,
      message: 'Account Cancelled',
      description: 'Your organization account has been cancelled. Please contact support to reactivate.',
      action: (
        <Button size="sm" onClick={() => router.push('/settings')}>
          View Details
        </Button>
      ),
    });
  }

  // Trial expired
  if (trialStatus?.hasTrial && trialStatus.isExpired) {
    alerts.push({
      key: 'trial-expired',
      color: 'failure',
      icon: HiStop,
      message: 'Trial Expired',
      description: 'Your trial period has ended. Please upgrade to a paid plan to continue using the service.',
      action: (
        <Button size="sm" color="blue" onClick={() => router.push('/settings')}>
          Upgrade Plan
        </Button>
      ),
    });
  }

  // Trial ending soon
  if (trialStatus?.hasTrial && !trialStatus.isExpired && trialStatus.daysRemaining !== null && trialStatus.daysRemaining <= 3) {
    alerts.push({
      key: 'trial-warning',
      color: 'warning',
      icon: HiClock,
      message: `Trial Ending Soon - ${trialStatus.daysRemaining} days remaining`,
      description: `Your trial period ends on ${trialStatus.expiresAt?.toLocaleDateString()}. Please upgrade to avoid service interruption.`,
      action: (
        <Button size="sm" color="blue" onClick={() => router.push('/settings')}>
          Upgrade Now
        </Button>
      ),
    });
  }

  // Usage limits exceeded
  if (limits && !limits.withinLimits && limits.exceededLimits.length > 0) {
    alerts.push({
      key: 'limits-exceeded',
      color: 'warning',
      icon: HiExclamation,
      message: 'Usage Limits Exceeded',
      description: `You have exceeded the following limits: ${limits.exceededLimits.join(', ')}. Please upgrade your plan.`,
      action: (
        <Button size="sm" onClick={() => router.push('/settings')}>
          View Usage
        </Button>
      ),
    });
  }

  // API rate limit warning
  if (apiStats && apiStats.remaining !== null && apiStats.remaining <= 100) {
    alerts.push({
      key: 'api-limit-warning',
      color: 'warning',
      icon: HiExclamation,
      message: 'API Rate Limit Warning',
      description: `You have ${apiStats.remaining} API calls remaining this month. Limit resets on ${apiStats.resetAt?.toLocaleDateString()}.`,
      action: (
        <Button size="sm" onClick={() => router.push('/settings')}>
          View Details
        </Button>
      ),
    });
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-4">
      {alerts.map(alert => (
        <Alert
          key={alert.key}
          color={alert.color}
          icon={alert.icon ? <alert.icon className="h-5 w-5" /> : undefined}
          onDismiss={() => {}}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{alert.message}</h3>
              <p className="text-sm">{alert.description}</p>
            </div>
            {alert.action && <div className="ml-4">{alert.action}</div>}
          </div>
        </Alert>
      ))}
    </div>
  );
}
