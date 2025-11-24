/**
 * Units Page - Migrated to v2 FastAPI
 * 
 * Lists units using v2 FastAPI backend with role-based filtering.
 * All data comes from FastAPI v2 endpoints - no Next.js API routes or Prisma.
 */
"use client";

import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useUnits, useProperties, useLeases } from '@/lib/hooks/useV2Data';
import { Card, Table, Badge, Button, Spinner, Alert } from 'flowbite-react';
import { HiPlus, HiHome } from 'react-icons/hi';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function UnitsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams?.get('property_id') || undefined;
  
  const { user, loading: authLoading, hasRole } = useV2Auth();
  const organizationId = user?.organization_id || undefined;
  
  const { data: units, isLoading } = useUnits(propertyId);
  const { data: properties } = useProperties(organizationId);
  const { data: leases } = useLeases({ organization_id: organizationId });
  
  // Create lookup maps
  const propertyMap = properties?.reduce((acc, prop) => {
    acc[prop.id] = prop;
    return acc;
  }, {}) || {};
  
  // Count leases per unit
  const unitLeaseCounts = leases?.reduce((acc, lease) => {
    if (lease.unit_id && lease.status === 'active') {
      acc[lease.unit_id] = (acc[lease.unit_id] || 0) + 1;
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
        Please log in to view units.
      </Alert>
    );
  }
  
  const canViewUnits = hasRole('super_admin') || hasRole('pmc_admin') || hasRole('pm') || hasRole('landlord');
  
  if (!canViewUnits) {
    return (
      <Alert color="failure" className="m-4">
        You don't have permission to view units.
      </Alert>
    );
  }
  
  const canCreateUnits = hasRole('super_admin') || hasRole('pmc_admin') || hasRole('pm');
  
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Units</h1>
          {propertyId && propertyMap[propertyId] && (
            <p className="text-gray-500">
              Property: {propertyMap[propertyId].name || propertyMap[propertyId].address_line1}
            </p>
          )}
        </div>
        {canCreateUnits && (
          <Button color="blue" onClick={() => router.push(`/units/new${propertyId ? `?property_id=${propertyId}` : ''}`)}>
            <HiPlus className="mr-2 h-4 w-4" />
            New Unit
          </Button>
        )}
      </div>
      
      {units && units.length > 0 ? (
        <Card>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Unit Name</Table.HeadCell>
              <Table.HeadCell>Property</Table.HeadCell>
              <Table.HeadCell>Type</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Active Leases</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {units.map((unit) => {
                const property = propertyMap[unit.property_id];
                return (
                  <Table.Row key={unit.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {unit.name || 'Unnamed Unit'}
                    </Table.Cell>
                    <Table.Cell>
                      {property ? (
                        <Link href={`/properties/${property.id}`} className="text-blue-600 hover:underline">
                          {property.name || property.address_line1}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </Table.Cell>
                    <Table.Cell>{unit.type || '-'}</Table.Cell>
                    <Table.Cell>
                      <Badge color={
                        unit.status === 'occupied' ? 'success' :
                        unit.status === 'available' ? 'info' :
                        'gray'
                      }>
                        {unit.status || 'available'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>{unitLeaseCounts[unit.id] || 0}</Table.Cell>
                    <Table.Cell>
                      <Link href={`/units/${unit.id}`}>
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
            <HiHome className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No units found.</p>
            {canCreateUnits && (
              <Button color="blue" className="mt-4" onClick={() => router.push(`/units/new${propertyId ? `?property_id=${propertyId}` : ''}`)}>
                <HiPlus className="mr-2 h-4 w-4" />
                Create Your First Unit
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

