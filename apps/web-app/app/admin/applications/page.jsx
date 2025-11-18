"use client";

import ApplicationsTable from '@/components/shared/ApplicationsTable';

export default function AdminApplicationsPage() {
  return (
    <ApplicationsTable
      title="Applications"
      apiEndpoint="/api/admin/applications"
      approveEndpoint="/api/admin/applications/{id}/approve"
      rejectEndpoint="/api/admin/applications/{id}/reject"
      applicationType="landlord"
      showTypeFilter={true}
    />
  );
}
