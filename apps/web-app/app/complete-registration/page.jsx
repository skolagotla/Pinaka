/**
 * Complete Registration Page - Migrated to v2 FastAPI
 * 
 * Removed all Prisma dependencies. Now uses v2 FastAPI for user checks.
 * Registration is handled client-side via the UI component.
 */
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner, Alert } from 'flowbite-react';
import CompleteRegistrationForm from "./ui";
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { v2Api } from '@/lib/api/v2-client';

export default function CompleteRegistration() {
  const router = useRouter();
  const { user, loading: authLoading } = useV2Auth();
  const [checking, setChecking] = useState(true);
  const [invitationData, setInvitationData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If user is already logged in, check their status
    if (!authLoading) {
      if (user) {
        // User is already authenticated, redirect to dashboard
        router.push("/dashboard");
        return;
      }
      
      // No user logged in - allow registration form
      setChecking(false);
    }
  }, [authLoading, user, router]);

  if (authLoading || checking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-600 mx-auto p-6">
        <Alert color="failure">
          <h2 className="text-lg font-semibold mb-2">Registration Error</h2>
          <p>{error}</p>
        </Alert>
      </div>
    );
  }

  // Extract name from URL params or use defaults
  // In a real implementation, you'd get this from invitation token
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const email = searchParams?.get('email') || '';
  const name = searchParams?.get('name') || '';
  
  const nameParts = name.trim().split(/\s+/);
  let firstName = "";
  let middleName = "";
  let lastName = "";

  if (nameParts.length === 1) {
    firstName = nameParts[0];
  } else if (nameParts.length === 2) {
    firstName = nameParts[0];
    lastName = nameParts[1];
  } else if (nameParts.length >= 3) {
    firstName = nameParts[0];
    lastName = nameParts[nameParts.length - 1];
    middleName = nameParts.slice(1, -1).join(" ");
  }

  return (
    <main className="page">
      <CompleteRegistrationForm
        firstName={firstName}
        middleName={middleName}
        lastName={lastName}
        email={email}
      />
    </main>
  );
}
