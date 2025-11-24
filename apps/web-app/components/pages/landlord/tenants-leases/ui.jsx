"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Spinner } from 'flowbite-react';

export default function TenantsLeasesClient({ units, tenants: initialTenants, initialLeases }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Redirect based on tab parameter or default to leases
  useEffect(() => {
    const tab = searchParams.get('tab') || 'leases';
    if (tab === 'tenants') {
      router.replace('/tenants');
    } else {
      router.replace('/leases');
    }
  }, [searchParams, router]);
  
  // Show loading state while redirecting
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Card>
        <div className="text-center py-10">
          <Spinner size="xl" className="mx-auto mb-4" />
          <div className="text-gray-600 mt-4">Redirecting...</div>
        </div>
      </Card>
    </div>
  );
}
