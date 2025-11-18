"use client";
import SettingsClient from '@/components/shared/SettingsClient';

export default function PMCSettingsClient({ pmc, user, userRole, pmcData }) {
  // Support both 'pmc' and 'user' props for backward compatibility
  const userData = user || pmc;
  return <SettingsClient user={userData} userRole={userRole || "pmc"} pmcData={pmcData} />;
}

