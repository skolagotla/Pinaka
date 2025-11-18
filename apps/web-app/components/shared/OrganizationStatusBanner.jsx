"use client";

import { useState, useEffect } from 'react';
import { Alert, Button, Space } from 'antd';
import { WarningOutlined, StopOutlined, ClockCircleOutlined } from '@ant-design/icons';
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
      type: 'error',
      icon: <StopOutlined />,
      message: 'Account Suspended',
      description: 'Your organization account has been suspended. Please contact support for assistance.',
      action: (
        <Button size="small" onClick={() => router.push('/settings')}>
          View Details
        </Button>
      ),
    });
  }

  // Account cancelled
  if (organization.status === 'CANCELLED') {
    alerts.push({
      key: 'cancelled',
      type: 'warning',
      icon: <StopOutlined />,
      message: 'Account Cancelled',
      description: 'Your organization account has been cancelled. Please contact support to reactivate.',
      action: (
        <Button size="small" onClick={() => router.push('/settings')}>
          View Details
        </Button>
      ),
    });
  }

  // Trial expired
  if (trialStatus?.hasTrial && trialStatus.isExpired) {
    alerts.push({
      key: 'trial-expired',
      type: 'error',
      icon: <StopOutlined />,
      message: 'Trial Expired',
      description: 'Your trial period has ended. Please upgrade to a paid plan to continue using the service.',
      action: (
        <Button size="small" type="primary" onClick={() => router.push('/settings')}>
          Upgrade Plan
        </Button>
      ),
    });
  }

  // Trial ending soon
  if (trialStatus?.hasTrial && !trialStatus.isExpired && trialStatus.daysRemaining !== null && trialStatus.daysRemaining <= 3) {
    alerts.push({
      key: 'trial-warning',
      type: 'warning',
      icon: <ClockCircleOutlined />,
      message: `Trial Ending Soon - ${trialStatus.daysRemaining} days remaining`,
      description: `Your trial period ends on ${trialStatus.expiresAt?.toLocaleDateString()}. Please upgrade to avoid service interruption.`,
      action: (
        <Button size="small" type="primary" onClick={() => router.push('/settings')}>
          Upgrade Now
        </Button>
      ),
    });
  }

  // Usage limits exceeded
  if (limits && !limits.withinLimits && limits.exceededLimits.length > 0) {
    alerts.push({
      key: 'limits-exceeded',
      type: 'warning',
      icon: <WarningOutlined />,
      message: 'Usage Limits Exceeded',
      description: `You have exceeded the following limits: ${limits.exceededLimits.join(', ')}. Please upgrade your plan.`,
      action: (
        <Button size="small" onClick={() => router.push('/settings')}>
          View Usage
        </Button>
      ),
    });
  }

  // API rate limit warning
  if (apiStats && apiStats.remaining !== null && apiStats.remaining <= 100) {
    alerts.push({
      key: 'api-limit-warning',
      type: 'warning',
      icon: <WarningOutlined />,
      message: 'API Rate Limit Warning',
      description: `You have ${apiStats.remaining} API calls remaining this month. Limit resets on ${apiStats.resetAt?.toLocaleDateString()}.`,
      action: (
        <Button size="small" onClick={() => router.push('/settings')}>
          View Details
        </Button>
      ),
    });
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 16 }}>
      {alerts.map(alert => (
        <Alert
          key={alert.key}
          message={alert.message}
          description={alert.description}
          type={alert.type}
          icon={alert.icon}
          showIcon
          action={alert.action}
          style={{ borderRadius: 8 }}
        />
      ))}
    </Space>
  );
}

