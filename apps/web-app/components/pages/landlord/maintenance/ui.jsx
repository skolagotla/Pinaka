"use client";
import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import PropertyContextBanner from '@/components/PropertyContextBanner';

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
 * Landlord Maintenance Client
 * Wrapper component that uses the unified MaintenanceClient
 * Now with lazy loading for better performance
 */
export default function LandlordMaintenanceClient({ initialRequests, landlordEmail, landlordName }) {
  // Parse landlord name into first and last name
  const nameParts = (landlordName || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  return (
    <div>
      <PropertyContextBanner userRole="landlord" />
      <MaintenanceClient 
        userRole="landlord"
        user={{ email: landlordEmail, firstName, lastName }}
        initialRequests={initialRequests}
        userEmail={landlordEmail}
        userName={landlordName}
      />
    </div>
  );
}
