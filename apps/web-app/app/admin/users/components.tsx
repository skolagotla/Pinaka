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

export const UsersFilters = dynamic(
  () => import('@/components/admin/users/UsersFilters'),
  { 
    ssr: false,
    loading: () => <div style={{ height: 60 }} />
  }
);

