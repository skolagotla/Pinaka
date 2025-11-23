"use client";
import dynamic from 'next/dynamic';
import { Spinner } from 'flowbite-react';

// Lazy load MaintenanceClient for better performance and code splitting
const MaintenanceClient = dynamic(
  () => import('@/components/shared/MaintenanceClient'),
  {
    loading: () => (
      <div className="flex flex-col justify-center items-center min-h-[400px]">
        <Spinner size="xl" />
        <div className="mt-4 text-gray-500">Loading maintenance requests...</div>
      </div>
    ),
    ssr: false, // Not needed for SEO, improves initial load
  }
);

/**
 * Tenant Maintenance Client
 * Wrapper component that uses the unified MaintenanceClient
 * Now with lazy loading for better performance
 */
export default function TenantMaintenanceClient({ tenant, initialRequests, properties }) {
  return (
    <MaintenanceClient 
      userRole="tenant"
      user={tenant}
      initialRequests={initialRequests}
      properties={properties}
    />
  );
}
