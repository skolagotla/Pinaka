/**
 * Legal/Forms Page - Migrated to v2 FastAPI
 * 
 * Generated forms page for landlord and PMC roles using v2 FastAPI backend.
 * All data comes from FastAPI v2 endpoints - no Next.js API routes or Prisma.
 */
"use client";

import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner, Alert } from 'flowbite-react';
import dynamic from 'next/dynamic';

// Lazy load the legal client component
const LegalClient = dynamic(() => import('./ui'), {
  loading: () => <Spinner size="xl" />,
  ssr: false,
});

export default function LegalPage() {
  const router = useRouter();
  const { user, loading: authLoading, hasRole } = useV2Auth();
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (!authLoading && user) {
      // Redirect non-landlord/pmc users to /library
      if (!hasRole('landlord') && !hasRole('pmc_admin') && !hasRole('pm')) {
        router.push('/library');
      }
    }
  }, [authLoading, user, router, hasRole]);
  
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
        Please log in to view legal forms.
      </Alert>
    );
  }
  
  // Determine user role
  let userRole = 'landlord';
  if (hasRole('pmc_admin')) {
    userRole = 'pmc_admin';
  } else if (hasRole('pm')) {
    userRole = 'pm';
  } else if (hasRole('landlord')) {
    userRole = 'landlord';
  }
  
  return (
    <main className="page">
      <LegalClient userRole={userRole} />
    </main>
  );
}
