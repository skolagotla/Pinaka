"use client";

import dynamic from 'next/dynamic';
import { Spin } from 'antd';

// Lazy load MessagesClient for better performance and code splitting
const MessagesClient = dynamic(
  () => import('@/components/shared/MessagesClient'),
  {
    loading: () => (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#666' }}>Loading messages...</div>
      </div>
    ),
    ssr: false, // Not needed for SEO, improves initial load
  }
);

export default function LandlordMessagesClient() {
  return <MessagesClient userRole="landlord" />;
}
