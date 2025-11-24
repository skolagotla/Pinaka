/**
 * Invitations Page - Migrated to v2 FastAPI
 * 
 * PMC invitations page using v2 FastAPI backend.
 * All data comes from FastAPI v2 endpoints - no Next.js API routes or Prisma.
 */
"use client";

import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner, Alert } from 'flowbite-react';
import dynamic from 'next/dynamic';

// Lazy load invitations client (PMC-only)
const PMCInvitationsClient = dynamic(() => import('@/components/pages/pmc/invitations/ui').then(mod => mod.default));

export default function InvitationsPage() {
  const router = useRouter();
  const { user, loading: authLoading, hasRole } = useV2Auth();
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (!authLoading && user && !hasRole('pmc_admin') && !hasRole('pm')) {
      router.push('/portfolio');
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
        Please log in to view invitations.
      </Alert>
    );
  }
  
  if (!hasRole('pmc_admin') && !hasRole('pm')) {
    return (
      <Alert color="failure" className="m-4">
        Invitations are only available for PMC admins.
      </Alert>
    );
  }
  
  // Component will handle data fetching internally via v2 API
  return (
    <main className="page">
      <PMCInvitationsClient initialInvitations={[]} />
    </main>
  );
}
