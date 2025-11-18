"use client";

import dynamic from 'next/dynamic';
import { Spin } from 'antd';

// Lazy load MaintenanceClient for better performance
const MaintenanceClient = dynamic(
  () => import('@/components/shared/MaintenanceClient'),
  {
    loading: () => (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#666' }}>Loading maintenance requests...</div>
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

