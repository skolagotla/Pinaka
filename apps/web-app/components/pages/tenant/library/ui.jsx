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
 * Tenant Library Client
 * Wrapper component that uses the unified LibraryClient
 * Now with lazy loading for better performance
 */
export default function TenantLibraryClient({ tenant, initialDocuments, leaseDocuments }) {
  return (
    <LibraryClient 
      userRole="tenant"
      user={tenant}
      initialDocuments={initialDocuments}
      leaseDocuments={leaseDocuments}
    />
  );
}
