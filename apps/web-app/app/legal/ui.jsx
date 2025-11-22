"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const GeneratedFormsClient = dynamic(
  () => import('@/components/pages/landlord/forms/ui').then(mod => mod.default),
  {
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading forms...</div>,
    ssr: false,
  }
);

const PMCGeneratedFormsClient = dynamic(
  () => import('@/components/pages/pmc/forms/ui').then(mod => mod.default),
  {
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading forms...</div>,
    ssr: false,
  }
);

/**
 * Legal Client Component
 * Renders Generated Forms based on user role
 */
export default function LegalClient({ user, userRole, legalData }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ padding: '12px 16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  if (userRole === 'landlord') {
    return (
      <div style={{ padding: '12px 16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <GeneratedFormsClient userRole={userRole} user={user} landlord={legalData?.landlord} />
      </div>
    );
  } else if (userRole === 'pmc') {
    return (
      <div style={{ padding: '12px 16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <PMCGeneratedFormsClient userRole={userRole} user={user} pmc={legalData?.pmc} />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      You do not have access to this page.
    </div>
  );
}

