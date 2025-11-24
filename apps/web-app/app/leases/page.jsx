/**
 * Leases Page - Migrated to v2 FastAPI
 * 
 * Lists leases using v2 FastAPI backend with role-based filtering.
 * All data comes from FastAPI v2 endpoints - no Next.js API routes or Prisma.
 */
"use client";

import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useLeases, useProperties, useTenants } from '@/lib/hooks/useV2Data';
import { Card, Table, Badge, Button, Spinner, Alert } from 'flowbite-react';
import { HiPlus, HiDocumentText } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LeasesPage() {
  const router = useRouter();
  const { user, loading: authLoading, hasRole } = useV2Auth();
  
  const organizationId = user?.organization_id || undefined;
  
  // Build filters based on role
  let filters: any = { organization_id: organizationId };
  if (hasRole('tenant')) {
    // Tenants only see their own leases - backend should filter, but we can add tenant_id if available
  } else if (hasRole('landlord')) {
    // Landlords see leases for their properties - backend should filter
  }
  
  const { data: leases, isLoading } = useLeases(filters);
  const { data: properties } = useProperties(organizationId);
  const { data: tenants } = useTenants(organizationId);
  
  // Create lookup maps
  const propertyMap = properties?.reduce((acc: Record<string, any>, prop: any) => {
    acc[prop.id] = prop;
    return acc;
  }, {}) || {};
  
  const tenantMap = tenants?.reduce((acc: Record<string, any>, tenant: any) => {
    acc[tenant.id] = tenant;
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
        Please log in to view leases.
      </Alert>
    );
  }
  
  const canViewLeases = hasRole('super_admin') || hasRole('pmc_admin') || hasRole('pm') || hasRole('landlord') || hasRole('tenant');
  
  if (!canViewLeases) {
    return (
      <Alert color="failure" className="m-4">
        You don't have permission to view leases.
      </Alert>
    );
  }
  
  const canCreateLeases = hasRole('super_admin') || hasRole('pmc_admin') || hasRole('pm');
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Leases</h1>
        {canCreateLeases && (
          <Button color="blue" onClick={() => router.push('/leases/new')}>
            <HiPlus className="mr-2 h-4 w-4" />
            New Lease
          </Button>
        )}
      </div>
      
      {leases && leases.length > 0 ? (
        <Card>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Property</Table.HeadCell>
              <Table.HeadCell>Tenant</Table.HeadCell>
              <Table.HeadCell>Rent Amount</Table.HeadCell>
              <Table.HeadCell>Start Date</Table.HeadCell>
              <Table.HeadCell>End Date</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {leases.map((lease: any) => {
                const property = propertyMap[lease.property_id];
                const tenant = tenantMap[lease.tenant_id];
                
                return (
                  <Table.Row key={lease.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {property?.name || property?.address_line1 || 'Unknown Property'}
                    </Table.Cell>
                    <Table.Cell>
                      {tenant?.first_name && tenant?.last_name 
                        ? `${tenant.first_name} ${tenant.last_name}`
                        : tenant?.email || 'Unknown Tenant'}
                    </Table.Cell>
                    <Table.Cell>{formatCurrency(lease.rent_amount || 0)}</Table.Cell>
                    <Table.Cell>{new Date(lease.start_date).toLocaleDateString()}</Table.Cell>
                    <Table.Cell>
                      {lease.end_date ? new Date(lease.end_date).toLocaleDateString() : 'Month-to-Month'}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={
                        lease.status === 'active' ? 'success' :
                        lease.status === 'terminated' ? 'failure' :
                        'gray'
                      }>
                        {lease.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Link href={`/leases/${lease.id}`}>
                        <Button size="xs" color="light">View</Button>
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-8">
            <HiDocumentText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No leases found.</p>
            {canCreateLeases && (
              <Button color="blue" className="mt-4" onClick={() => router.push('/leases/new')}>
                <HiPlus className="mr-2 h-4 w-4" />
                Create Your First Lease
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
