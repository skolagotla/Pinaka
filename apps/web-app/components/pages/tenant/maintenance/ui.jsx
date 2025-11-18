"use client";
import dynamic from 'next/dynamic';
import { Spin } from 'antd';

// Lazy load MaintenanceClient for better performance and code splitting
const MaintenanceClient = dynamic(
  () => import('@/components/shared/MaintenanceClient'),
  {
    loading: () => (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#666' }}>Loading maintenance requests...</div>
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
