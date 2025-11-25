/**
 * Protected Layout - Route group layout
 * Routes in this group automatically use the unified protected layout
 */
"use client";

import ProtectedLayoutWrapper from '@/components/layout/ProtectedLayoutWrapper';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayoutWrapper>{children}</ProtectedLayoutWrapper>;
}
