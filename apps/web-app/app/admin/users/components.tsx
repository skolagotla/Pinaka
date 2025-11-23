/**
 * Lazy-loaded Admin Users Components
 * Route-level code splitting for admin users page
 */

"use client";

import dynamic from 'next/dynamic';
import { Spinner } from 'flowbite-react';

const LoadingComponent = () => (
  <div className="flex justify-center items-center min-h-[400px] p-10">
    <Spinner size="xl" />
  </div>
);

// Lazy load heavy components
export const UsersTable = dynamic(
  () => import('@/components/admin/users/UsersTable'),
  { 
    ssr: false,
    loading: () => <LoadingComponent />
  }
);

// UsersFilters component - placeholder for future implementation
export const UsersFilters = () => null;

