/**
 * Landlords Page - Migrated to v2 FastAPI
 * 
 * Lists landlords using v2 FastAPI backend with role-based filtering.
 * All data comes from FastAPI v2 endpoints - no Next.js API routes or Prisma.
 */
"use client";

import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useLandlords, useProperties } from '@/lib/hooks/useV2Data';
import { Card, Table, Badge, Button, Spinner, Alert } from 'flowbite-react';
import { HiPlus, HiUser } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LandlordsPage() {
  const router = useRouter();
  const { user, loading: authLoading, hasRole } = useV2Auth();
  
  const organizationId = user?.organization_id || undefined;
  const { data: landlords, isLoading } = useLandlords(organizationId);
  const { data: properties } = useProperties(organizationId);
  
  // Count properties per landlord
  const landlordPropertyCounts = properties?.reduce((acc, prop) => {
    if (prop.landlord_id) {
      acc[prop.landlord_id] = (acc[prop.landlord_id] || 0) + 1;
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
        Please log in to view landlords.
      </Alert>
    );
  }
  
  const canViewLandlords = hasRole('super_admin') || hasRole('pmc_admin') || hasRole('pm');
  
  if (!canViewLandlords) {
    return (
      <Alert color="failure" className="m-4">
        You don't have permission to view landlords.
      </Alert>
    );
  }
  
  const canCreateLandlords = hasRole('super_admin') || hasRole('pmc_admin') || hasRole('pm');
  
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Landlords</h1>
        {canCreateLandlords && (
          <Button color="blue" onClick={() => router.push('/landlords/new')}>
            <HiPlus className="mr-2 h-4 w-4" />
            New Landlord
          </Button>
        )}
      </div>
      
      {landlords && landlords.length > 0 ? (
        <Card>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Phone</Table.HeadCell>
              <Table.HeadCell>Properties</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {landlords.map((landlord) => (
                <Table.Row key={landlord.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {landlord.first_name && landlord.last_name
                      ? `${landlord.first_name} ${landlord.last_name}`
                      : landlord.email}
                  </Table.Cell>
                  <Table.Cell>{landlord.email || '-'}</Table.Cell>
                  <Table.Cell>{landlord.phone || '-'}</Table.Cell>
                  <Table.Cell>{landlordPropertyCounts[landlord.id] || 0}</Table.Cell>
                  <Table.Cell>
                    <Badge color={
                      landlord.approval_status === 'approved' ? 'success' :
                      landlord.approval_status === 'pending' ? 'warning' :
                      landlord.approval_status === 'rejected' ? 'failure' :
                      'gray'
                    }>
                      {landlord.approval_status || 'pending'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Link href={`/landlords/${landlord.id}`}>
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
            <p className="text-gray-500">No landlords found.</p>
            {canCreateLandlords && (
              <Button color="blue" className="mt-4" onClick={() => router.push('/landlords/new')}>
                <HiPlus className="mr-2 h-4 w-4" />
                Add Your First Landlord
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
