/**
 * Unit Detail Page - Migrated to v2 FastAPI
 * 
 * Shows unit details, leases, and related information using v2 FastAPI backend.
 * All data comes from FastAPI v2 endpoints - no Next.js API routes or Prisma.
 */
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useUnit, useProperty, useLeases, useWorkOrders } from '@/lib/hooks/useV2Data';
import { Card, Table, Badge, Button, Spinner, Alert, Tabs } from 'flowbite-react';
import { HiHome, HiPencil, HiTrash } from 'react-icons/hi';
import AttachmentsList from '@/components/shared/AttachmentsList';
import Link from 'next/link';

export default function UnitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const unitId = params?.id as string;
  
  const { user, loading: authLoading, hasRole } = useV2Auth();
  const { data: unit, isLoading: unitLoading } = useUnit(unitId);
  const { data: property, isLoading: propertyLoading } = useProperty(unit?.property_id);
  const { data: leases, isLoading: leasesLoading } = useLeases({ 
    organization_id: user?.organization_id,
    unit_id: unitId 
  });
  const { data: workOrders, isLoading: workOrdersLoading } = useWorkOrders({ 
    organization_id: user?.organization_id,
    property_id: unit?.property_id 
  });
  
  // Filter work orders for this unit
  const unitWorkOrders = workOrders?.filter((wo: any) => wo.unit_id === unitId) || [];
  
  if (authLoading || unitLoading || propertyLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <Alert color="warning" className="m-4">
        Please log in to view unit details.
      </Alert>
    );
  }
  
  if (!unit) {
    return (
      <Alert color="failure" className="m-4">
        Unit not found.
      </Alert>
    );
  }
  
  const canEdit = hasRole('super_admin') || hasRole('pmc_admin') || hasRole('pm');
  const canDelete = hasRole('super_admin') || hasRole('pmc_admin');
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{unit.name || 'Unnamed Unit'}</h1>
          {property && (
            <p className="text-gray-500">
              <Link href={`/properties/${property.id}`} className="text-blue-600 hover:underline">
                {property.name || property.address_line1}
              </Link>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button color="light" onClick={() => router.push(`/units/${unitId}/edit`)}>
              <HiPencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {canDelete && (
            <Button color="failure">
              <HiTrash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>
      
      <Tabs>
        <Tabs.Item active title="Overview" icon={HiHome}>
          <div className="space-y-6 mt-4">
            <Card>
              <h3 className="text-lg font-semibold mb-4">Unit Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge color={
                    unit.status === 'occupied' ? 'success' :
                    unit.status === 'available' ? 'info' :
                    'gray'
                  }>
                    {unit.status || 'available'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{unit.type || '-'}</p>
                </div>
                {unit.bedrooms && (
                  <div>
                    <p className="text-sm text-gray-500">Bedrooms</p>
                    <p className="font-medium">{unit.bedrooms}</p>
                  </div>
                )}
                {unit.bathrooms && (
                  <div>
                    <p className="text-sm text-gray-500">Bathrooms</p>
                    <p className="font-medium">{unit.bathrooms}</p>
                  </div>
                )}
              </div>
            </Card>
            
            <Card>
              <h3 className="text-lg font-semibold mb-4">Active Leases ({leases?.filter((l: any) => l.status === 'active').length || 0})</h3>
              {leasesLoading ? (
                <Spinner />
              ) : leases && leases.length > 0 ? (
                <Table hoverable>
                  <Table.Head>
                    <Table.HeadCell>Tenant</Table.HeadCell>
                    <Table.HeadCell>Rent Amount</Table.HeadCell>
                    <Table.HeadCell>Start Date</Table.HeadCell>
                    <Table.HeadCell>End Date</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {leases.map((lease: any) => (
                      <Table.Row key={lease.id}>
                        <Table.Cell className="font-medium">
                          {lease.tenant_id ? (
                            <Link href={`/tenants/${lease.tenant_id}`} className="text-blue-600 hover:underline">
                              Tenant #{lease.tenant_id.substring(0, 8)}
                            </Link>
                          ) : '-'}
                        </Table.Cell>
                        <Table.Cell>{formatCurrency(lease.rent_amount || 0)}</Table.Cell>
                        <Table.Cell>{new Date(lease.start_date).toLocaleDateString()}</Table.Cell>
                        <Table.Cell>
                          {lease.end_date ? new Date(lease.end_date).toLocaleDateString() : 'Month-to-Month'}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color={lease.status === 'active' ? 'success' : 'gray'}>
                            {lease.status}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Link href={`/leases/${lease.id}`}>
                            <Button size="xs" color="light">View</Button>
                          </Link>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              ) : (
                <p className="text-gray-500">No leases found.</p>
              )}
            </Card>
            
            <Card>
              <h3 className="text-lg font-semibold mb-4">Work Orders ({unitWorkOrders.length})</h3>
              {workOrdersLoading ? (
                <Spinner />
              ) : unitWorkOrders.length > 0 ? (
                <div className="space-y-2">
                  {unitWorkOrders.slice(0, 5).map((wo: any) => (
                    <div key={wo.id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                      <div>
                        <p className="font-medium">{wo.title}</p>
                        <p className="text-sm text-gray-500">{wo.status}</p>
                      </div>
                      <Link href={`/operations/kanban`}>
                        <Button size="xs" color="light">View</Button>
                      </Link>
                    </div>
                  ))}
                  {unitWorkOrders.length > 5 && (
                    <Link href={`/operations/kanban?unit=${unitId}`}>
                      <Button color="light" className="w-full">View All Work Orders</Button>
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No work orders.</p>
              )}
            </Card>
          </div>
        </Tabs.Item>
        
        <Tabs.Item title="Attachments">
          <div className="mt-4">
            <AttachmentsList
              entityType="unit"
              entityId={unitId}
              showUpload={canEdit}
            />
          </div>
        </Tabs.Item>
      </Tabs>
    </div>
  );
}

