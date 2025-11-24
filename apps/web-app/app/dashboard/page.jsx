/**
 * Dashboard Page - Migrated to v2 FastAPI
 * 
 * Redirects to portfolio page which provides role-based dashboard.
 * All data comes from FastAPI v2 endpoints.
 */
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from 'flowbite-react';
import { useV2Auth } from '@/lib/hooks/useV2Auth';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useV2Auth();
  
  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect to portfolio which provides role-based dashboard
        router.replace('/portfolio');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);
  
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Spinner size="xl" />
    </div>
  );
}
