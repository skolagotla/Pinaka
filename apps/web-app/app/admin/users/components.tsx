/**
 * Lazy-loaded Admin Users Components
 * Route-level code splitting for admin users page
 */

"use client";

import dynamic from 'next/dynamic';
import { Spin } from 'antd';

const LoadingComponent = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: 400,
    padding: 40 
  }}>
    <Spin size="large" />
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

