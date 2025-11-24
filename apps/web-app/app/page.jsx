/**
 * Home Page - Migrated to v2 FastAPI
 * 
 * Uses v2 authentication to check user roles and redirect appropriately.
 * No Prisma dependencies - all data comes from FastAPI v2 backend.
 */
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SignInCard from '@/components/SignInCard';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { Spinner, Alert } from 'flowbite-react';

export default function Home() {
  const router = useRouter();
  const { user, loading, hasRole } = useV2Auth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Not authenticated - show sign-in card (already rendered below)
      return;
    }

    // Check roles and redirect based on priority:
    // Landlord > Tenant > PMC (including PMC Admin) > Vendor > Contractor
    
    // Check for landlord role
    if (hasRole('landlord')) {
      router.push('/dashboard');
      return;
    }

    // Check for tenant role
    if (hasRole('tenant')) {
      router.push('/dashboard');
      return;
    }

    // Check for PMC roles (pmc_admin, pm)
    if (hasRole('pmc_admin') || hasRole('pm')) {
      router.push('/dashboard');
      return;
    }

    // Check for vendor role
    if (hasRole('vendor')) {
      router.push('/vendor/dashboard');
      return;
    }

    // Check for contractor role
    if (hasRole('contractor')) {
      router.push('/contractor/dashboard');
      return;
    }

    // Check for super_admin
    if (hasRole('super_admin')) {
      router.push('/dashboard');
      return;
    }

    // User has no recognized role - show pending approval or error
    // Note: Approval status checking would require additional API calls
    // For now, redirect to dashboard and let the dashboard handle approval checks
    router.push('/dashboard');
  }, [user, loading, hasRole, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  // Show sign-in card if not authenticated
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <SignInCard />
        </div>
      </div>
    );
  }

  // While redirecting, show loading state
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Spinner size="xl" />
      <p className="ml-4 text-gray-600">Redirecting...</p>
    </div>
  );
}
