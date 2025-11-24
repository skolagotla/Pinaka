/**
 * Organization Error Handler
 * Handles organization-related errors and displays appropriate messages
 */

"use client";

import React from 'react';
import { Modal } from 'flowbite-react';
import { HiExclamationCircle, HiStop } from 'react-icons/hi';

/**
 * Handle organization status errors
 */
export function handleOrganizationError(error: any, router?: any) {
  if (!error || !error.code) {
    return false;
  }

  const errorCode = error.code;
  const errorMessage = error.error || error.message || 'An error occurred';

  const handleOk = () => {
    if (router) {
      router.push('/settings');
    } else if (typeof window !== 'undefined') {
      window.location.href = '/settings';
    }
  };

  switch (errorCode) {
    case 'ORGANIZATION_INACTIVE':
    case 'SUSPENDED':
      // Show error modal using Flowbite
      if (typeof window !== 'undefined') {
        const modal = document.createElement('div');
        modal.innerHTML = `
          <div id="org-error-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div class="p-6">
                <div class="flex items-center gap-3 mb-4">
                  <HiStop class="h-6 w-6 text-red-500" />
                  <h3 class="text-lg font-semibold">Account Suspended</h3>
                </div>
                <p class="text-gray-600 dark:text-gray-400 mb-4">
                  ${errorMessage || 'Your organization account has been suspended. Please contact support for assistance.'}
                </p>
                <button onclick="this.closest('#org-error-modal').remove(); handleOk();" class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        // Store handleOk in window for the onclick
        (window as any).handleOk = handleOk;
      }
      return true;

    case 'CANCELLED':
      // Similar modal for cancelled
      return true;

    case 'TRIAL_EXPIRED':
      // Similar modal for trial expired
      return true;

    case 'API_RATE_LIMIT_EXCEEDED':
      // Similar modal for rate limit
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
