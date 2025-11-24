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
import { HiPlus, HiDocumentText, HiEye } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader, TableWrapper, EmptyState, TableSkeleton } from '@/components/shared';

export default function LeasesPage() {
  const router = useRouter();
  const { user, loading: authLoading, hasRole } = useV2Auth();
  
  const organizationId = user?.organization_id || undefined;
  
  // Build filters based on role
  let filters = { organization_id: organizationId };
  if (hasRole('tenant')) {
    // Tenants only see their own leases - backend should filter, but we can add tenant_id if available
  } else if (hasRole('landlord')) {
    // Landlords see leases for their properties - backend should filter
  }
  
  const { data: leases, isLoading } = useLeases(filters);
  const { data: properties } = useProperties(organizationId);
  const { data: tenants } = useTenants(organizationId);
  
  // Create lookup maps
  const propertyMap = properties?.reduce((acc, prop) => {
    acc[prop.id] = prop;
    return acc;
  }, {}) || {};
  
  const tenantMap = tenants?.reduce((acc, tenant) => {
    acc[tenant.id] = tenant;
    return acc;
  }, {}) || {};
  
  if (authLoading) {
    return <TableSkeleton />;
  }
  
  if (!user) {
    return (
      <div className="p-6">
        <Alert color="warning">
          Please log in to view leases.
        </Alert>
      </div>
    );
  }
  
  const canViewLeases = hasRole('super_admin') || hasRole('pmc_admin') || hasRole('pm') || hasRole('landlord') || hasRole('tenant');
  
  if (!canViewLeases) {
    return (
      <div className="p-6">
        <Alert color="failure">
          You don't have permission to view leases.
        </Alert>
      </div>
    );
  }
  
  const canCreateLeases = hasRole('super_admin') || hasRole('pmc_admin') || hasRole('pm');
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Leases"
        description="Manage rental agreements and tenant leases"
        actions={
          canCreateLeases ? (
            <Button color="blue" onClick={() => router.push('/leases/new')}>
              <HiPlus className="mr-2 h-4 w-4" />
              New Lease
            </Button>
          ) : null
        }
      />
      
      {isLoading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : leases && leases.length > 0 ? (
        <TableWrapper>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Property</Table.HeadCell>
              <Table.HeadCell>Tenant</Table.HeadCell>
              <Table.HeadCell>Rent Amount</Table.HeadCell>
              <Table.HeadCell>Start Date</Table.HeadCell>
              <Table.HeadCell>End Date</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>
                <span className="sr-only">Actions</span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {leases.map((lease) => {
                const property = propertyMap[lease.property_id];
                const tenant = tenantMap[lease.tenant_id];
                
                return (
                  <Table.Row key={lease.id} className="bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {property?.name || property?.address_line1 || 'Unknown Property'}
                    </Table.Cell>
                    <Table.Cell className="text-gray-600 dark:text-gray-400">
                      {tenant?.first_name && tenant?.last_name 
                        ? `${tenant.first_name} ${tenant.last_name}`
                        : tenant?.email || 'Unknown Tenant'}
                    </Table.Cell>
                    <Table.Cell className="text-gray-600 dark:text-gray-400 font-medium">
                      {formatCurrency(lease.rent_amount || 0)}
                    </Table.Cell>
                    <Table.Cell className="text-gray-600 dark:text-gray-400">
                      {new Date(lease.start_date).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell className="text-gray-600 dark:text-gray-400">
                      {lease.end_date ? new Date(lease.end_date).toLocaleDateString() : 'Month-to-Month'}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge 
                        color={
                          lease.status === 'active' ? 'success' :
                          lease.status === 'terminated' ? 'failure' :
                          lease.status === 'pending' ? 'warning' :
                          'gray'
                        }
                        className="capitalize"
                      >
                        {lease.status || 'active'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Link href={`/leases/${lease.id}`}>
                        <Button size="xs" color="light" className="flex items-center gap-1">
                          <HiEye className="h-3 w-3" />
                          View
                        </Button>
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </TableWrapper>
      ) : (
        <TableWrapper>
          <EmptyState
            image={<HiDocumentText className="mx-auto h-16 w-16 text-gray-400" />}
            description="No leases found. Get started by creating your first lease agreement."
            action={
              canCreateLeases ? (
                <Button color="blue" onClick={() => router.push('/leases/new')}>
                  <HiPlus className="mr-2 h-4 w-4" />
                  Create Your First Lease
                </Button>
              ) : null
            }
          />
        </TableWrapper>
      )}
    </div>
  );
}
