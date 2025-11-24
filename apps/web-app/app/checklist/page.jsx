/**
 * Checklist Page - Migrated to v2 FastAPI
 * 
 * Tenant checklist page using v2 FastAPI backend.
 * All data comes from FastAPI v2 endpoints - no Next.js API routes or Prisma.
 */
"use client";

import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useTenant } from '@/lib/hooks/useV2Data';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner, Alert } from 'flowbite-react';
import dynamic from 'next/dynamic';

// Lazy load checklist client (tenant-only)
const TenantChecklistClient = dynamic(() => import('@/components/pages/tenant/checklist/ui').then(mod => mod.default));

export default function ChecklistPage() {
  const router = useRouter();
  const { user, loading: authLoading, hasRole } = useV2Auth();
  
  // Get tenant ID from user
  const tenantId = user?.user_id || user?.id;
  const { data: tenant, isLoading: tenantLoading } = useTenant(tenantId || '');
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (!authLoading && user && !hasRole('tenant')) {
      router.push('/portfolio');
    }
  }, [authLoading, user, router, hasRole]);
  
  if (authLoading || tenantLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <Alert color="warning" className="m-4">
        Please log in to view checklist.
      </Alert>
    );
  }
  
  if (!hasRole('tenant')) {
    return (
      <Alert color="failure" className="m-4">
        Checklist is only available for tenants.
      </Alert>
    );
  }
  
  if (!tenant) {
    return (
      <Alert color="failure" className="m-4">
        Tenant information not found.
      </Alert>
    );
  }
  
  return <TenantChecklistClient tenant={tenant} />;
}
