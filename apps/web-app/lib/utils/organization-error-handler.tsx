/**
 * Organization Error Handler
 * Handles organization-related errors and displays appropriate messages
 */

"use client";

import React from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined, StopOutlined } from '@ant-design/icons';

/**
 * Handle organization status errors
 */
export function handleOrganizationError(error: any, router?: any) {
  if (!error || !error.code) {
    return false;
  }

  const errorCode = error.code;
  const errorMessage = error.error || error.message || 'An error occurred';

  switch (errorCode) {
    case 'ORGANIZATION_INACTIVE':
    case 'SUSPENDED':
      Modal.error({
        title: 'Account Suspended',
        icon: <StopOutlined />,
        content: errorMessage || 'Your organization account has been suspended. Please contact support for assistance.',
        okText: 'Contact Support',
        onOk: () => {
          if (router) {
            router.push('/settings');
          } else if (typeof window !== 'undefined') {
            window.location.href = '/settings';
          }
        },
      });
      return true;

    case 'CANCELLED':
      Modal.warning({
        title: 'Account Cancelled',
        icon: <ExclamationCircleOutlined />,
        content: errorMessage || 'Your organization account has been cancelled. Please contact support to reactivate.',
        okText: 'View Details',
        onOk: () => {
          if (router) {
            router.push('/settings');
          } else if (typeof window !== 'undefined') {
            window.location.href = '/settings';
          }
        },
      });
      return true;

    case 'TRIAL_EXPIRED':
      Modal.error({
        title: 'Trial Expired',
        icon: <StopOutlined />,
        content: errorMessage || 'Your trial period has ended. Please upgrade to a paid plan to continue using the service.',
        okText: 'Upgrade Plan',
        onOk: () => {
          if (router) {
            router.push('/settings');
          } else if (typeof window !== 'undefined') {
            window.location.href = '/settings';
          }
        },
      });
      return true;

    case 'API_RATE_LIMIT_EXCEEDED':
      Modal.warning({
        title: 'API Rate Limit Exceeded',
        icon: <ExclamationCircleOutlined />,
        content: errorMessage || 'You have reached your monthly API call limit. Please upgrade your plan or wait until the limit resets.',
        okText: 'View Details',
        onOk: () => {
          if (router) {
            router.push('/settings');
          } else if (typeof window !== 'undefined') {
            window.location.href = '/settings';
          }
        },
      });
      return true;

    default:
      return false;
  }
}

/**
 * Check if error is organization-related
 */
export function isOrganizationError(error: any): boolean {
  if (!error || !error.code) {
    return false;
  }

  const organizationErrorCodes = [
    'ORGANIZATION_INACTIVE',
    'SUSPENDED',
    'CANCELLED',
    'TRIAL_EXPIRED',
    'API_RATE_LIMIT_EXCEEDED',
  ];

  return organizationErrorCodes.includes(error.code);
}

