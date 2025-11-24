/**
 * Property Detail Page - Migrated to v2 FastAPI
 * 
 * Shows property details, units, and related information using v2 FastAPI backend.
 * All data comes from FastAPI v2 endpoints - no Next.js API routes or Prisma.
 */
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useProperty, useUnits, useLeases, useWorkOrders } from '@/lib/hooks/useV2Data';
import { Card, Table, Badge, Button, Spinner, Alert, Tabs } from 'flowbite-react';
import { HiHome, HiPencil, HiTrash } from 'react-icons/hi';
import AttachmentsList from '@/components/shared/AttachmentsList';
import Link from 'next/link';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id || '';
  
  const { user, loading: authLoading, hasRole } = useV2Auth();
  const { data: property, isLoading: propertyLoading } = useProperty(propertyId);
  const { data: units, isLoading: unitsLoading } = useUnits(propertyId);
  const { data: leases, isLoading: leasesLoading } = useLeases({ organization_id: user?.organization_id });
  const { data: workOrders, isLoading: workOrdersLoading } = useWorkOrders({ 
    organization_id: user?.organization_id,
    property_id: propertyId 
  });
  
  if (authLoading || propertyLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <Alert color="warning" className="m-4">
        Please log in to view property details.
      </Alert>
    );
  }
  
  if (!property) {
    return (
      <Alert color="failure" className="m-4">
        Property not found.
      </Alert>
    );
  }
  
  const canEdit = hasRole('super_admin') || hasRole('pmc_admin') || hasRole('pm');
  const canDelete = hasRole('super_admin') || hasRole('pmc_admin');
  
  // Filter leases for this property
  const propertyLeases = leases?.filter((lease) => {
    // Check if lease's unit belongs to this property
    return units?.some((unit) => unit.id === lease.unit_id);
  }) || [];
  
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{property.name || 'Unnamed Property'}</h1>
          <p className="text-gray-500">{property.address_line1}</p>
          {property.address_line2 && <p className="text-gray-500">{property.address_line2}</p>}
          <p className="text-gray-500">
            {[property.city, property.state, property.postal_code].filter(Boolean).join(', ')}
          </p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button color="light" onClick={() => router.push(`/properties/${propertyId}/edit`)}>
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
              <h3 className="text-lg font-semibold mb-4">Property Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge color={property.status === 'active' ? 'success' : 'gray'}>
                    {property.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="font-medium">{property.country || '-'}</p>
                </div>
              </div>
            </Card>
            
            <Card>
              <h3 className="text-lg font-semibold mb-4">Units ({units?.length || 0})</h3>
              {unitsLoading ? (
                <Spinner />
              ) : units && units.length > 0 ? (
                <Table hoverable>
                  <Table.Head>
                    <Table.HeadCell>Unit Name</Table.HeadCell>
                    <Table.HeadCell>Type</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {units.map((unit) => (
                      <Table.Row key={unit.id}>
                        <Table.Cell className="font-medium">{unit.name}</Table.Cell>
                        <Table.Cell>{unit.type || '-'}</Table.Cell>
                        <Table.Cell>
                          <Badge color={unit.status === 'occupied' ? 'success' : 'gray'}>
                            {unit.status || 'available'}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Link href={`/units/${unit.id}`}>
                            <Button size="xs" color="light">View</Button>
                          </Link>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              ) : (
                <p className="text-gray-500">No units found.</p>
              )}
            </Card>
            
            <Card>
              <h3 className="text-lg font-semibold mb-4">Active Leases ({propertyLeases.length})</h3>
              {leasesLoading ? (
                <Spinner />
              ) : propertyLeases.length > 0 ? (
                <Table hoverable>
                  <Table.Head>
                    <Table.HeadCell>Unit</Table.HeadCell>
                    <Table.HeadCell>Rent Amount</Table.HeadCell>
                    <Table.HeadCell>Start Date</Table.HeadCell>
                    <Table.HeadCell>End Date</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {propertyLeases.map((lease) => {
                      const unit = units?.find((u) => u.id === lease.unit_id);
                      return (
                        <Table.Row key={lease.id}>
                          <Table.Cell>{unit?.name || '-'}</Table.Cell>
                          <Table.Cell>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(lease.rent_amount || 0)}
                          </Table.Cell>
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
                      );
                    })}
                  </Table.Body>
                </Table>
              ) : (
                <p className="text-gray-500">No active leases.</p>
              )}
            </Card>
            
            <Card>
              <h3 className="text-lg font-semibold mb-4">Work Orders ({workOrders?.length || 0})</h3>
              {workOrdersLoading ? (
                <Spinner />
              ) : workOrders && workOrders.length > 0 ? (
                <div className="space-y-2">
                  {workOrders.slice(0, 5).map((wo) => (
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
                  {workOrders.length > 5 && (
                    <Link href={`/operations/kanban?property=${propertyId}`}>
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
              entityType="property"
              entityId={propertyId}
              showUpload={canEdit}
            />
          </div>
        </Tabs.Item>
      </Tabs>
    </div>
  );
}
