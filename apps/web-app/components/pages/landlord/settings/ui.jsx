"use client";

import SettingsClient from '@/components/shared/SettingsClient';

export default function LandlordSettingsClient({ landlord, user, userRole }) {
  // Support both 'landlord' and 'user' props for backward compatibility
  const userData = user || landlord;
  return <SettingsClient user={userData} userRole={userRole || "landlord"} />;
}
