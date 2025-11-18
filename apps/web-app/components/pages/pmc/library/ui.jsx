"use client";
import dynamic from 'next/dynamic';
import { Spin } from 'antd';

// Lazy load LibraryClient for better performance
const LibraryClient = dynamic(
  () => import('@/components/shared/LibraryClient'),
  {
    loading: () => (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#666' }}>Loading document library...</div>
      </div>
    ),
    ssr: false,
  }
);

export default function PMCLibraryClient({ pmc, tenants }) {
  return (
    <LibraryClient 
      userRole="pmc"
      user={pmc}
      tenants={tenants}
    />
  );
}

