/**
 * Tenant Detail Page - Migrated to v2 FastAPI
 * 
 * Shows tenant details, leases, and work orders using v2 FastAPI backend.
 * All data comes from FastAPI v2 endpoints - no Next.js API routes or Prisma.
 */
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useTenant, useLeases, useWorkOrders, useProperties, useUnits } from '@/lib/hooks/useV2Data';
import { Card, Table, Badge, Button, Spinner, Alert, Tabs } from 'flowbite-react';
import { HiUser, HiPencil, HiTrash, HiDocumentText, HiCog } from 'react-icons/hi';
import AttachmentsList from '@/components/shared/AttachmentsList';
import Link from 'next/link';

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params?.id || "";
  
  const { user, loading: authLoading, hasRole } = useV2Auth();
  const organizationId = user?.organization_id;
  
  const { data: tenant, isLoading: tenantLoading } = useTenant(tenantId);
  const { data: leases, isLoading: leasesLoading } = useLeases({ 
    organization_id: organizationId,
    tenant_id: tenantId 
  });
  const { data: workOrders, isLoading: workOrdersLoading } = useWorkOrders({ 
    organization_id: organizationId,
    tenant_id: tenantId 
  });
  const { data: properties } = useProperties(organizationId);
  const { data: units } = useUnits();
  
  // Create lookup maps
  const propertyMap = properties?.reduce((acc, prop) => {
    acc[prop.id] = prop;
    return acc;
  }, {}) || {};
  
  const unitMap = units?.reduce((acc, unit) => {
    acc[unit.id] = unit;
    return acc;
  }, {}) || {};
  
  if (authLoading || tenantLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <Alert color="warning" className="m-4">
        Please log in to view tenant details.
      </Alert>
    );
  }
  
  if (!tenant) {
    return (
      <Alert color="failure" className="m-4">
        Tenant not found.
      </Alert>
    );
  }
  
  const canEdit = hasRole('super_admin') || hasRole('pmc_admin') || hasRole('pm');
  const canDelete = hasRole('super_admin') || hasRole('pmc_admin');
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {tenant.first_name && tenant.last_name
              ? `${tenant.first_name} ${tenant.last_name}`
              : tenant.email}
          </h1>
          <p className="text-gray-500">{tenant.email}</p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button color="light" onClick={() => router.push(`/tenants/${tenantId}/edit`)}>
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
        <Tabs.Item active title="Overview" icon={HiUser}>
          <div className="space-y-6 mt-4">
            <Card>
              <h3 className="text-lg font-semibold mb-4">Tenant Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{tenant.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{tenant.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge color={
                    tenant.approval_status === 'approved' ? 'success' :
                    tenant.approval_status === 'pending' ? 'warning' :
                    tenant.approval_status === 'rejected' ? 'failure' :
                    'gray'
                  }>
                    {tenant.approval_status || 'pending'}
                  </Badge>
                </div>
              </div>
            </Card>
            
            <Card>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <HiDocumentText className="h-5 w-5" />
                Leases ({leases?.length || 0})
              </h3>
              {leasesLoading ? (
                <Spinner />
              ) : leases && leases.length > 0 ? (
                <Table hoverable>
                  <Table.Head>
                    <Table.HeadCell>Property</Table.HeadCell>
                    <Table.HeadCell>Unit</Table.HeadCell>
                    <Table.HeadCell>Rent Amount</Table.HeadCell>
                    <Table.HeadCell>Start Date</Table.HeadCell>
                    <Table.HeadCell>End Date</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {leases.map((lease) => {
                      const property = propertyMap[lease.property_id];
                      const unit = unitMap[lease.unit_id];
                      return (
                        <Table.Row key={lease.id}>
                          <Table.Cell>
                            {property ? (
                              <Link href={`/properties/${property.id}`} className="text-blue-600 hover:underline">
                                {property.name || property.address_line1}
                              </Link>
                            ) : '-'}
                          </Table.Cell>
                          <Table.Cell>
                            {unit ? (
                              <Link href={`/units/${unit.id}`} className="text-blue-600 hover:underline">
                                {unit.name}
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
                      );
                    })}
                  </Table.Body>
                </Table>
              ) : (
                <p className="text-gray-500">No leases found.</p>
              )}
            </Card>
            
            <Card>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <HiCog className="h-5 w-5" />
                Work Orders ({workOrders?.length || 0})
              </h3>
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
                    <Link href={`/operations/kanban?tenant=${tenantId}`}>
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
              entityType="tenant"
              entityId={tenantId}
              showUpload={canEdit}
            />
          </div>
        </Tabs.Item>
      </Tabs>
    </div>
  );
}

