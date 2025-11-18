/**
 * Lazy-loaded Pro Components
 * Dynamically imports ProTable and ProForm to reduce initial bundle size
 * Saves ~200KB on initial load
 */

"use client";

import dynamic from 'next/dynamic';
import { Spin } from 'antd';

// Loading component for Pro components
const ProLoading = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: 200,
    padding: 20 
  }}>
    <Spin size="large" />
  </div>
);

// Dynamically import ProTable (large component, ~150KB)
export const ProTable = dynamic(
  () => import('@ant-design/pro-components').then(mod => mod.ProTable),
  { 
    ssr: false,
    loading: () => <ProLoading />
  }
);

// Dynamically import ProForm (large component, ~100KB)
export const ProForm = dynamic(
  () => import('@ant-design/pro-components').then(mod => mod.ProForm),
  { 
    ssr: false,
    loading: () => <ProLoading />
  }
);

// Dynamically import ProForm components
export const ProFormText = dynamic(
  () => import('@ant-design/pro-components').then(mod => mod.ProFormText),
  { ssr: false }
);

export const ProFormSelect = dynamic(
  () => import('@ant-design/pro-components').then(mod => mod.ProFormSelect),
  { ssr: false }
);

export const ProFormDigit = dynamic(
  () => import('@ant-design/pro-components').then(mod => mod.ProFormDigit),
  { ssr: false }
);

export const ProFormDatePicker = dynamic(
  () => import('@ant-design/pro-components').then(mod => mod.ProFormDatePicker),
  { ssr: false }
);

export const ProFormTextArea = dynamic(
  () => import('@ant-design/pro-components').then(mod => mod.ProFormTextArea),
  { ssr: false }
);

// Dynamically import ProCard (smaller, but still benefits from lazy loading)
// Enable SSR to prevent hydration mismatch
export const ProCard = dynamic(
  () => import('@ant-design/pro-card').then(mod => mod.ProCard),
  { 
    ssr: true,
    loading: () => <div style={{ minHeight: 100 }} />
  }
);

