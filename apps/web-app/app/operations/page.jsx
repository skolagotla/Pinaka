/**
 * Work Orders Page - Migrated to v2 FastAPI
 * 
 * Lists work orders using v2 FastAPI backend with role-based filtering.
 * Redirects to Kanban board view.
 */
"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner } from 'flowbite-react';

export default function WorkOrdersPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to Kanban board
    router.replace('/operations/kanban');
  }, [router]);
  
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Spinner size="xl" />
    </div>
  );
}
