"use client";
import dynamic from 'next/dynamic';
import { Spin } from 'antd';

// Lazy load LibraryClient for better performance and code splitting
const LibraryClient = dynamic(
  () => import('@/components/shared/LibraryClient'),
  {
    loading: () => (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#666' }}>Loading document library...</div>
      </div>
    ),
    ssr: false, // Not needed for SEO, improves initial load
  }
);

/**
 * Landlord Library Client
 * Wrapper component that uses the unified LibraryClient
 * Now with lazy loading for better performance
 */
export default function LandlordLibraryClient({ landlord, tenants }) {
  return (
    <LibraryClient 
      userRole="landlord"
      user={landlord}
      tenants={tenants}
    />
  );
}
