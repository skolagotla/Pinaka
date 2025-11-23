"use client";

import dynamic from 'next/dynamic';
import { Spinner } from 'flowbite-react';

// Lazy load MaintenanceClient for better performance
const MaintenanceClient = dynamic(
  () => import('@/components/shared/MaintenanceClient'),
  {
    loading: () => (
      <div className="flex flex-col justify-center items-center min-h-[400px]">
        <Spinner size="xl" />
        <div className="mt-4 text-gray-500">Loading maintenance requests...</div>
      </div>
    ),
    ssr: false,
  }
);

/**
 * PMC Maintenance Client
 * Wrapper component that uses the unified MaintenanceClient
 */
export default function PMCMaintenanceClient({ initialRequests, pmcEmail, pmcName }) {
  return (
    <MaintenanceClient 
      userRole="pmc"
      user={{ email: pmcEmail, companyName: pmcName }}
      initialRequests={initialRequests}
      userEmail={pmcEmail}
      userName={pmcName}
    />
  );
}

