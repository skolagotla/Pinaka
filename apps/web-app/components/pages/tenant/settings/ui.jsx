"use client";

import SettingsClient from '@/components/shared/SettingsClient';

export default function TenantSettingsClient({ tenant, user, userRole }) {
  // Support both 'tenant' and 'user' props for backward compatibility
  const userData = user || tenant;
  return <SettingsClient user={userData} userRole={userRole || "tenant"} />;
}
