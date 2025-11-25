/**
 * Home Page - Migrated to v2 FastAPI
 * 
 * Uses v2 authentication to check user roles and redirect appropriately.
 * No Prisma dependencies - all data comes from FastAPI v2 backend.
 */
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { Spinner, Alert } from 'flowbite-react';

export default function Home() {
  const router = useRouter();
  const { user, loading, hasRole } = useV2Auth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Check onboarding status first
    const onboardingCompleted = user.user?.onboarding_completed ?? false;
    
    if (!onboardingCompleted) {
      router.push('/onboarding/start');
      return;
    }

    // Onboarding completed - check roles and redirect based on priority:
    // Landlord > Tenant > PMC (including PMC Admin) > Vendor > Contractor
    
    // Check for landlord role
    if (hasRole('landlord')) {
      router.push('/portfolio');
      return;
    }

    // Check for tenant role
    if (hasRole('tenant')) {
      router.push('/portfolio');
      return;
    }

    // Check for PMC roles (pmc_admin, pm)
    if (hasRole('pmc_admin') || hasRole('pm')) {
      router.push('/portfolio');
      return;
    }

    // Check for vendor role
    if (hasRole('vendor')) {
      router.push('/portfolio');
      return;
    }

    // Check for contractor role
    if (hasRole('contractor')) {
      router.push('/portfolio');
      return;
    }

    // Check for super_admin
    if (hasRole('super_admin')) {
      router.push('/portfolio');
      return;
    }

    // Default redirect to portfolio
    router.push('/portfolio');
  }, [user, loading, hasRole, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  // Redirect to login page if not authenticated
  if (!user) {
    useEffect(() => {
      router.push('/auth/login');
    }, [router]);
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
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
