/**
 * Verifications Page - Migrated to v2 FastAPI
 * 
 * Unified verifications page for all roles using v2 FastAPI backend.
 * All data comes from FastAPI v2 endpoints - no Next.js API routes or Prisma.
 */
"use client";

import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Spinner, Alert } from 'flowbite-react';
import VerificationsClient from './ui';

export default function VerificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading, hasRole } = useV2Auth();
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
    expired: 0,
    total: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);
  
  // Fetch verification stats from v2 API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TODO: Replace with v2 API endpoint when available
        // For now, use placeholder stats
        setStats({
          pending: 0,
          verified: 0,
          rejected: 0,
          expired: 0,
          total: 0,
        });
      } catch (error) {
        console.error('[Verifications Page] Error loading stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    
    if (user) {
      fetchStats();
    }
  }, [user]);
  
  if (authLoading || statsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <Alert color="warning" className="m-4">
        Please log in to view verifications.
      </Alert>
    );
  }
  
  // Determine user role
  let userRole = 'landlord';
  if (hasRole('super_admin')) {
    userRole = 'admin';
  } else if (hasRole('pmc_admin') || hasRole('pm')) {
    userRole = 'pmc';
  } else if (hasRole('landlord')) {
    userRole = 'landlord';
  } else if (hasRole('tenant')) {
    userRole = 'tenant';
  }
  
  return (
    <main className="page">
      <VerificationsClient
        user={{
          id: user.user_id || user.id,
          email: user.email,
          full_name: user.full_name,
          role: userRole,
        }}
        initialStats={stats}
      />
    </main>
  );
}
