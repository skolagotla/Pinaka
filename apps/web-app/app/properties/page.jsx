/**
 * Properties Page - Migrated to v2 FastAPI
 * 
 * Lists properties using v2 FastAPI backend with role-based filtering.
 * All data comes from FastAPI v2 endpoints - no Next.js API routes or Prisma.
 */
"use client";

import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useProperties, useUnits } from '@/lib/hooks/useV2Data';
import { Card, Table, Badge, Button, Spinner, Alert } from 'flowbite-react';
import { HiPlus, HiHome, HiEye } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader, TableWrapper, EmptyState, TableSkeleton } from '@/components/shared';

export default function PropertiesPage() {
  const router = useRouter();
  const { user, loading: authLoading, hasRole } = useV2Auth();
  
  const organizationId = user?.organization_id || undefined;
  const { data: properties, isLoading } = useProperties(organizationId);
  const { data: units } = useUnits();
  
  if (authLoading) {
    return <TableSkeleton />;
  }
  
  if (!user) {
    return (
      <div className="p-6">
        <Alert color="warning">
          Please log in to view properties.
        </Alert>
      </div>
    );
  }
  
  // Role-based access control
  const canViewProperties = hasRole('super_admin') || hasRole('pmc_admin') || hasRole('pm') || hasRole('landlord');
  
  if (!canViewProperties) {
    return (
      <div className="p-6">
        <Alert color="failure">
          You don't have permission to view properties.
        </Alert>
      </div>
    );
  }
  
  const canCreateProperties = hasRole('super_admin') || hasRole('pmc_admin') || hasRole('pm');
  
  // Count units per property
  const propertyUnitCounts = units?.reduce((acc, unit) => {
    acc[unit.property_id] = (acc[unit.property_id] || 0) + 1;
    return acc;
  }, {}) || {};
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Properties"
        description="Manage your property portfolio"
        actions={
          canCreateProperties ? (
            <Button color="blue" onClick={() => router.push('/properties/new')}>
              <HiPlus className="mr-2 h-4 w-4" />
              New Property
            </Button>
          ) : null
        }
      />
      
      {isLoading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : properties && properties.length > 0 ? (
        <TableWrapper>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Address</Table.HeadCell>
              <Table.HeadCell>City</Table.HeadCell>
              <Table.HeadCell>State</Table.HeadCell>
              <Table.HeadCell>Units</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>
                <span className="sr-only">Actions</span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {properties.map((property) => (
                <Table.Row key={property.id} className="bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {property.name || 'Unnamed Property'}
                  </Table.Cell>
                  <Table.Cell className="text-gray-600 dark:text-gray-400">
                    {property.address_line1 || '-'}
                  </Table.Cell>
                  <Table.Cell className="text-gray-600 dark:text-gray-400">
                    {property.city || '-'}
                  </Table.Cell>
                  <Table.Cell className="text-gray-600 dark:text-gray-400">
                    {property.state || '-'}
                  </Table.Cell>
                  <Table.Cell className="text-gray-600 dark:text-gray-400">
                    {propertyUnitCounts[property.id] || 0}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={property.status === 'active' ? 'success' : 'gray'} className="capitalize">
                      {property.status || 'active'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Link href={`/properties/${property.id}`}>
                      <Button size="xs" color="light" className="flex items-center gap-1">
                        <HiEye className="h-3 w-3" />
                        View
                      </Button>
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </TableWrapper>
      ) : (
        <TableWrapper>
          <EmptyState
            image={<HiHome className="mx-auto h-16 w-16 text-gray-400" />}
            description="No properties found. Get started by creating your first property."
            action={
              canCreateProperties ? (
                <Button color="blue" onClick={() => router.push('/properties/new')}>
                  <HiPlus className="mr-2 h-4 w-4" />
                  Create Your First Property
                </Button>
              ) : null
            }
          />
        </TableWrapper>
      )}
    </div>
  );
}
