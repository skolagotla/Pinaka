"use client";

import { useState, useEffect } from 'react';
import { Alert, Button, Spinner } from 'flowbite-react';
import { HiX, HiUser } from 'react-icons/hi';

export default function ImpersonationBanner() {
  const [impersonation, setImpersonation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for impersonation cookie on mount
    const checkImpersonation = () => {
      const cookies = document.cookie.split(';');
      const impersonationCookie = cookies.find(c => c.trim().startsWith('admin_impersonation='));
      if (impersonationCookie) {
        try {
          const cookieValue = impersonationCookie.split('=').slice(1).join('=');
          const data = JSON.parse(decodeURIComponent(cookieValue));
          setImpersonation(data);
        } catch (e) {
          console.error('Failed to parse impersonation cookie:', e);
        }
      }
    };
    checkImpersonation();
  }, []);

  const handleStopImpersonation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setImpersonation(null);
        // Reload page to clear impersonation state
        window.location.reload();
      } else {
        console.error('Failed to stop impersonation:', data.error);
        // Still reload to clear state
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to stop impersonation:', err);
      // Still reload to clear state
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  if (!impersonation) return null;

  return (
    <Alert color="warning" className="sticky top-0 z-50 rounded-none border-b-2 border-yellow-400">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HiUser className="h-5 w-5" />
          <div>
            <p className="font-semibold">Impersonating User</p>
            <p className="text-sm">
              You are viewing as: <strong>{impersonation.impersonatedUserType}</strong> (ID: {impersonation.impersonatedUserId})
            </p>
          </div>
        </div>
        <Button
          color="failure"
          size="sm"
          onClick={handleStopImpersonation}
          disabled={loading}
        >
          {loading ? (
            <Spinner size="sm" className="mr-2" />
          ) : (
            <HiX className="h-4 w-4 mr-2" />
          )}
          Stop Impersonation
        </Button>
      </div>
    </Alert>
  );
}

