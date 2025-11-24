/**
 * Tenants Page - Migrated to v2 FastAPI
 * 
 * Lists tenants using v2 FastAPI backend with role-based filtering.
 * All data comes from FastAPI v2 endpoints - no Next.js API routes or Prisma.
 */
"use client";

import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useTenants, useLeases } from '@/lib/hooks/useV2Data';
import { Card, Table, Badge, Button, Spinner, Alert } from 'flowbite-react';
import { HiPlus, HiUser } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TenantsPage() {
  const router = useRouter();
  const { user, loading: authLoading, hasRole } = useV2Auth();
  
  const organizationId = user?.organization_id || undefined;
  const { data: tenants, isLoading } = useTenants(organizationId);
  const { data: leases } = useLeases({ organization_id: organizationId });
  
  // Count active leases per tenant
  const tenantLeaseCounts = leases?.reduce((acc, lease) => {
    if (lease.status === 'active') {
      acc[lease.tenant_id] = (acc[lease.tenant_id] || 0) + 1;
    }
    return acc;
  }, {}) || {};
  
  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <Alert color="warning" className="m-4">
        Please log in to view tenants.
      </Alert>
    );
  }
  
  const canViewTenants = hasRole('super_admin') || hasRole('pmc_admin') || hasRole('pm') || hasRole('landlord');
  
  if (!canViewTenants) {
    return (
      <Alert color="failure" className="m-4">
        You don't have permission to view tenants.
      </Alert>
    );
  }
  
  const canCreateTenants = hasRole('super_admin') || hasRole('pmc_admin') || hasRole('pm');
  
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tenants</h1>
        {canCreateTenants && (
          <Button color="blue" onClick={() => router.push('/tenants/new')}>
            <HiPlus className="mr-2 h-4 w-4" />
            New Tenant
          </Button>
        )}
      </div>
      
      {tenants && tenants.length > 0 ? (
        <Card>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Phone</Table.HeadCell>
              <Table.HeadCell>Active Leases</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {tenants.map((tenant) => (
                <Table.Row key={tenant.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {tenant.first_name && tenant.last_name
                      ? `${tenant.first_name} ${tenant.last_name}`
                      : tenant.email}
                  </Table.Cell>
                  <Table.Cell>{tenant.email || '-'}</Table.Cell>
                  <Table.Cell>{tenant.phone || '-'}</Table.Cell>
                  <Table.Cell>{tenantLeaseCounts[tenant.id] || 0}</Table.Cell>
                  <Table.Cell>
                    <Badge color={
                      tenant.approval_status === 'approved' ? 'success' :
                      tenant.approval_status === 'pending' ? 'warning' :
                      tenant.approval_status === 'rejected' ? 'failure' :
                      'gray'
                    }>
                      {tenant.approval_status || 'pending'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Link href={`/tenants/${tenant.id}`}>
                      <Button size="xs" color="light">View</Button>
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-8">
            <HiUser className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No tenants found.</p>
            {canCreateTenants && (
              <Button color="blue" className="mt-4" onClick={() => router.push('/tenants/new')}>
                <HiPlus className="mr-2 h-4 w-4" />
                Add Your First Tenant
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
