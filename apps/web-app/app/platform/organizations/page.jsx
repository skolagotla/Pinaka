/**
 * Platform Organizations Page - Super Admin Only
 * Manage all organizations (PMCs)
 */
"use client";

import { withRoleGuard } from '@/lib/utils/withRoleGuard';
import { Card, Button, Spinner, Badge } from 'flowbite-react';
import { HiOfficeBuilding, HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import { useOrganizations } from '@/lib/hooks/useV2Data';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import { PageLayout } from '@/components/shared';

function OrganizationsContent() {
  const { data: organizations, isLoading, error } = useOrganizations();

  const columns = [
    { key: 'name', label: 'Name', render: (org) => org.name },
    { key: 'type', label: 'Type', render: (org) => <Badge>{org.type}</Badge> },
    { key: 'city', label: 'City', render: (org) => org.city || 'N/A' },
    { key: 'country', label: 'Country', render: (org) => org.country || 'N/A' },
    { key: 'created_at', label: 'Created', render: (org) => new Date(org.created_at).toLocaleDateString() },
  ];

  if (isLoading) {
    return (
      <PageLayout headerTitle="Organizations">
        <div className="flex justify-center items-center min-h-64">
          <Spinner size="xl" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout headerTitle="Organizations">
        <Card>
          <div className="text-red-600">Error loading organizations: {error.message}</div>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      headerTitle="Organizations"
      headerActions={
        <Button color="blue">
          <HiPlus className="h-4 w-4 mr-2" />
          New Organization
        </Button>
      }
    >
      <FlowbiteTable
        dataSource={organizations || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
      />
    </PageLayout>
  );
}

export default withRoleGuard(OrganizationsContent, {
  allowedRoles: ['super_admin'],
  redirectTo: '/login',
});

