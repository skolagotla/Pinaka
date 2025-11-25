/**
 * Library/Documents Page - Migrated to v2 FastAPI
 * 
 * Unified documents page for all roles using v2 FastAPI backend.
 * All data comes from FastAPI v2 endpoints - no Next.js API routes or Prisma.
 */
"use client";

import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner, Alert } from 'flowbite-react';
import dynamic from 'next/dynamic';

// Lazy load the documents client component
const DocumentsClient = dynamic(() => import('./ui'), {
  loading: () => <Spinner size="xl" />,
  ssr: false,
});

export default function LibraryPage() {
  const router = useRouter();
  const { user, loading: authLoading, hasRole } = useV2Auth();
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);
  
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <Alert color="warning" className="m-4">
        Please log in to view documents.
      </Alert>
    );
  }
  
  // Redirect admin users to platform library for super_admin
  if (hasRole('super_admin')) {
    router.push('/platform/library');
    return null;
  }
  
  // Determine user role
  let userRole = 'tenant';
  if (hasRole('super_admin')) {
    userRole = 'super_admin';
  } else if (hasRole('pmc_admin')) {
    userRole = 'pmc_admin';
  } else if (hasRole('pm')) {
    userRole = 'pm';
  } else if (hasRole('landlord')) {
    userRole = 'landlord';
  } else if (hasRole('tenant')) {
    userRole = 'tenant';
  }
  
  return <DocumentsClient userRole={userRole} />;
}
