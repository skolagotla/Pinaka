/**
 * Lease Detail Page - Migrated to v2 FastAPI
 * 
 * Shows lease details, tenant information, and related data using v2 FastAPI backend.
 * All data comes from FastAPI v2 endpoints - no Next.js API routes or Prisma.
 */
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useLease, useProperty, useUnit, useTenant, useWorkOrders } from '@/lib/hooks/useV2Data';
import { Card, Badge, Button, Spinner, Alert, Tabs } from 'flowbite-react';
import { HiDocumentText, HiPencil, HiTrash, HiHome, HiUser } from 'react-icons/hi';
import AttachmentsList from '@/components/shared/AttachmentsList';
import Link from 'next/link';

export default function LeaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leaseId = params?.id as string;
  
  const { user, loading: authLoading, hasRole } = useV2Auth();
  const { data: lease, isLoading: leaseLoading } = useLease(leaseId);
  const { data: property, isLoading: propertyLoading } = useProperty(lease?.property_id);
  const { data: unit, isLoading: unitLoading } = useUnit(lease?.unit_id);
  const { data: tenant, isLoading: tenantLoading } = useTenant(lease?.tenant_id);
  const { data: workOrders, isLoading: workOrdersLoading } = useWorkOrders({ 
    organization_id: user?.organization_id,
    property_id: lease?.property_id 
  });
  
  // Filter work orders for this lease's unit
  const leaseWorkOrders = workOrders?.filter((wo: any) => wo.unit_id === lease?.unit_id) || [];
  
  if (authLoading || leaseLoading || propertyLoading || unitLoading || tenantLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <Alert color="warning" className="m-4">
        Please log in to view lease details.
      </Alert>
    );
  }
  
  if (!lease) {
    return (
      <Alert color="failure" className="m-4">
        Lease not found.
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
  
  const formatDate = (date: string | null) => {
    if (!date) return 'Month-to-Month';
    return new Date(date).toLocaleDateString();
  };
  
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Lease Details</h1>
          <p className="text-gray-500">
            {property && (
              <Link href={`/properties/${property.id}`} className="text-blue-600 hover:underline">
                {property.name || property.address_line1}
              </Link>
            )}
            {unit && (
              <> - <Link href={`/units/${unit.id}`} className="text-blue-600 hover:underline">{unit.name}</Link></>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button color="light" onClick={() => router.push(`/leases/${leaseId}/edit`)}>
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
        <Tabs.Item active title="Overview" icon={HiDocumentText}>
          <div className="space-y-6 mt-4">
            <Card>
              <h3 className="text-lg font-semibold mb-4">Lease Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge color={
                    lease.status === 'active' ? 'success' :
                    lease.status === 'terminated' ? 'failure' :
                    'gray'
                  }>
                    {lease.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rent Amount</p>
                  <p className="font-medium">{formatCurrency(lease.rent_amount || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{formatDate(lease.start_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">{formatDate(lease.end_date)}</p>
                </div>
                {lease.security_deposit && (
                  <div>
                    <p className="text-sm text-gray-500">Security Deposit</p>
                    <p className="font-medium">{formatCurrency(lease.security_deposit)}</p>
                  </div>
                )}
              </div>
            </Card>
            
            {property && (
              <Card>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <HiHome className="h-5 w-5" />
                  Property
                </h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {property.name || 'Unnamed Property'}</p>
                  <p><span className="font-medium">Address:</span> {property.address_line1}</p>
                  {property.address_line2 && <p>{property.address_line2}</p>}
                  <p>
                    {[property.city, property.state, property.postal_code].filter(Boolean).join(', ')}
                  </p>
                  <Link href={`/properties/${property.id}`}>
                    <Button size="xs" color="light">View Property</Button>
                  </Link>
                </div>
              </Card>
            )}
            
            {unit && (
              <Card>
                <h3 className="text-lg font-semibold mb-4">Unit</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {unit.name || 'Unnamed Unit'}</p>
                  <p><span className="font-medium">Type:</span> {unit.type || '-'}</p>
                  <p><span className="font-medium">Status:</span> 
                    <Badge color={unit.status === 'occupied' ? 'success' : 'gray'} className="ml-2">
                      {unit.status || 'available'}
                    </Badge>
                  </p>
                  <Link href={`/units/${unit.id}`}>
                    <Button size="xs" color="light">View Unit</Button>
                  </Link>
                </div>
              </Card>
            )}
            
            {tenant && (
              <Card>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <HiUser className="h-5 w-5" />
                  Tenant
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Name:</span>{' '}
                    {tenant.first_name && tenant.last_name
                      ? `${tenant.first_name} ${tenant.last_name}`
                      : tenant.email}
                  </p>
                  {tenant.email && <p><span className="font-medium">Email:</span> {tenant.email}</p>}
                  {tenant.phone && <p><span className="font-medium">Phone:</span> {tenant.phone}</p>}
                  <Link href={`/tenants/${tenant.id}`}>
                    <Button size="xs" color="light">View Tenant</Button>
                  </Link>
                </div>
              </Card>
            )}
            
            <Card>
              <h3 className="text-lg font-semibold mb-4">Work Orders ({leaseWorkOrders.length})</h3>
              {workOrdersLoading ? (
                <Spinner />
              ) : leaseWorkOrders.length > 0 ? (
                <div className="space-y-2">
                  {leaseWorkOrders.slice(0, 5).map((wo: any) => (
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
                  {leaseWorkOrders.length > 5 && (
                    <Link href={`/operations/kanban?lease=${leaseId}`}>
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
              entityType="lease"
              entityId={leaseId}
              showUpload={canEdit}
            />
          </div>
        </Tabs.Item>
      </Tabs>
    </div>
  );
}

