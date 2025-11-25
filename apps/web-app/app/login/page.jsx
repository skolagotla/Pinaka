/**
 * Legacy Login Page - Redirects to new unified login at /auth/login
 * This page is kept for backward compatibility and redirects to the new location.
 */
"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from 'flowbite-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    // Redirect to new login page, preserving query params
    const next = searchParams?.get('next');
    const error = searchParams?.get('error');
    const params = new URLSearchParams();
    if (next) params.set('next', next);
    if (error) params.set('error', error);
    const queryString = params.toString();
    router.replace(`/auth/login${queryString ? `?${queryString}` : ''}`);
  }, [router, searchParams]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Spinner size="xl" />
    </div>
  );
}
