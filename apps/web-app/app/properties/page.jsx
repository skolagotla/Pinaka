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
import { HiPlus, HiHome } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PropertiesPage() {
  const router = useRouter();
  const { user, loading: authLoading, hasRole } = useV2Auth();
  
  const organizationId = user?.organization_id || undefined;
  const { data: properties, isLoading } = useProperties(organizationId);
  const { data: units } = useUnits();
  
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
        Please log in to view properties.
      </Alert>
    );
  }
  
  // Role-based access control
  const canViewProperties = hasRole('super_admin') || hasRole('pmc_admin') || hasRole('pm') || hasRole('landlord');
  
  if (!canViewProperties) {
    return (
      <Alert color="failure" className="m-4">
        You don't have permission to view properties.
      </Alert>
    );
  }
  
  const canCreateProperties = hasRole('super_admin') || hasRole('pmc_admin') || hasRole('pm');
  
  // Count units per property
  const propertyUnitCounts = units?.reduce((acc: Record<string, number>, unit: any) => {
    acc[unit.property_id] = (acc[unit.property_id] || 0) + 1;
    return acc;
  }, {}) || {};
  
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Properties</h1>
        {canCreateProperties && (
          <Button color="blue" onClick={() => router.push('/properties/new')}>
            <HiPlus className="mr-2 h-4 w-4" />
            New Property
          </Button>
        )}
      </div>
      
      {properties && properties.length > 0 ? (
        <Card>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Address</Table.HeadCell>
              <Table.HeadCell>City</Table.HeadCell>
              <Table.HeadCell>State</Table.HeadCell>
              <Table.HeadCell>Units</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {properties.map((property: any) => (
                <Table.Row key={property.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {property.name || 'Unnamed Property'}
                  </Table.Cell>
                  <Table.Cell>{property.address_line1}</Table.Cell>
                  <Table.Cell>{property.city || '-'}</Table.Cell>
                  <Table.Cell>{property.state || '-'}</Table.Cell>
                  <Table.Cell>{propertyUnitCounts[property.id] || 0}</Table.Cell>
                  <Table.Cell>
                    <Badge color={property.status === 'active' ? 'success' : 'gray'}>
                      {property.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Link href={`/properties/${property.id}`}>
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
            <HiHome className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No properties found.</p>
            {canCreateProperties && (
              <Button color="blue" className="mt-4" onClick={() => router.push('/properties/new')}>
                <HiPlus className="mr-2 h-4 w-4" />
                Create Your First Property
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
