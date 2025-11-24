/**
 * Messages Page - Migrated to v2 FastAPI
 * 
 * Role-based messages page using v2 FastAPI backend.
 * All data comes from FastAPI v2 endpoints - no Next.js API routes or Prisma.
 */
"use client";

import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner, Alert } from 'flowbite-react';
import dynamic from 'next/dynamic';

// Lazy load message clients
const LandlordMessagesClient = dynamic(() => import('@/components/pages/landlord/messages/ui').then(mod => mod.default));
const PMCMessagesClient = dynamic(() => import('@/components/pages/pmc/messages/ui').then(mod => mod.default));
const TenantMessagesClient = dynamic(() => import('@/components/pages/tenant/messages/ui').then(mod => mod.default));

export default function MessagesPage() {
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
        Please log in to view messages.
      </Alert>
    );
  }
  
  // Determine user role
  let userRole = null;
  if (hasRole('landlord')) {
    userRole = 'landlord';
  } else if (hasRole('pmc_admin') || hasRole('pm')) {
    userRole = 'pmc';
  } else if (hasRole('tenant')) {
    userRole = 'tenant';
  }
  
  if (!userRole) {
    return (
      <Alert color="failure" className="m-4">
        Messages are only available for landlords, PMC admins, and tenants.
      </Alert>
    );
  }
  
  try {
    if (userRole === 'landlord') {
      return <LandlordMessagesClient />;
    } else if (userRole === 'pmc') {
      return <PMCMessagesClient />;
    } else if (userRole === 'tenant') {
      return <TenantMessagesClient />;
    }
    
    return null;
  } catch (error) {
    console.error('[Messages Page] Error:', error);
    return (
      <Alert color="failure" className="m-4">
        <h2>Error Loading Messages</h2>
        <p>An error occurred while loading messages. Please try again later.</p>
        <p className="text-sm text-gray-500 mt-2">
          {error?.message || 'Unknown error'}
        </p>
      </Alert>
    );
  }
}
