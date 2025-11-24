/**
 * Reports Page - Migrated to v2 FastAPI
 * 
 * Role-based reports dashboard using v2 FastAPI backend.
 * All data comes from FastAPI v2 endpoints - no Next.js API routes or Prisma.
 */
"use client";

import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useProperties, useLeases, useWorkOrders, useTenants, useUnits } from '@/lib/hooks/useV2Data';
import { Card, Tabs, Alert, Spinner, Table, Badge } from 'flowbite-react';
import { HiChartBar, HiDocumentText, HiCurrencyDollar, HiClipboard } from 'react-icons/hi';
import { useMemo } from 'react';

export default function ReportsPage() {
  const { user, loading: authLoading, hasRole } = useV2Auth();
  const organizationId = user?.organization_id;
  
  const { data: properties, isLoading: propertiesLoading } = useProperties(organizationId);
  const { data: leases, isLoading: leasesLoading } = useLeases({ organization_id: organizationId });
  const { data: workOrders, isLoading: workOrdersLoading } = useWorkOrders({ organization_id: organizationId });
  const { data: tenants, isLoading: tenantsLoading } = useTenants(organizationId);
  const { data: units, isLoading: unitsLoading } = useUnits();
  
  const canViewReports = hasRole('super_admin') || hasRole('pmc_admin') || hasRole('pm') || hasRole('landlord');
  
  if (authLoading || propertiesLoading || leasesLoading || workOrdersLoading || tenantsLoading || unitsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <Alert color="warning" className="m-4">
        Please log in to view reports.
      </Alert>
    );
  }
  
  if (!canViewReports) {
    return (
      <Alert color="failure" className="m-4">
        You don't have permission to view reports.
      </Alert>
    );
  }
  
  // Calculate metrics
  const metrics = useMemo(() => {
    const activeLeases = leases?.filter((l) => l.status === 'active') || [];
    const occupiedUnits = units?.filter((u) => u.status === 'occupied') || [];
    const totalUnits = units?.length || 0;
    const occupancyRate = totalUnits > 0 ? (occupiedUnits.length / totalUnits) * 100 : 0;
    
    const totalRent = activeLeases.reduce((sum, lease) => sum + (lease.rent_amount || 0), 0);
    const monthlyRevenue = totalRent;
    const annualRevenue = monthlyRevenue * 12;
    
    const openWorkOrders = workOrders?.filter((wo) => wo.status !== 'completed' && wo.status !== 'cancelled') || [];
    const completedWorkOrders = workOrders?.filter((wo) => wo.status === 'completed') || [];
    
    return {
      totalProperties: properties?.length || 0,
      totalUnits: totalUnits,
      occupiedUnits: occupiedUnits.length,
      vacantUnits: totalUnits - occupiedUnits.length,
      occupancyRate: occupancyRate.toFixed(1),
      activeLeases: activeLeases.length,
      totalTenants: tenants?.length || 0,
      monthlyRevenue,
      annualRevenue,
      openWorkOrders: openWorkOrders.length,
      completedWorkOrders: completedWorkOrders.length,
      totalWorkOrders: workOrders?.length || 0,
    };
  }, [properties, units, leases, tenants, workOrders]);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Reports
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and analyze your portfolio performance
        </p>
      </div>

      <Tabs>
        <Tabs.Item active title="Overview" icon={HiChartBar}>
          <div className="mt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500 mb-1">Total Properties</p>
                  <p className="text-2xl font-bold">{metrics.totalProperties}</p>
                </div>
              </Card>
              <Card>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500 mb-1">Occupancy Rate</p>
                  <p className="text-2xl font-bold">{metrics.occupancyRate}%</p>
                </div>
              </Card>
              <Card>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500 mb-1">Monthly Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.monthlyRevenue)}</p>
                </div>
              </Card>
              <Card>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500 mb-1">Open Work Orders</p>
                  <p className="text-2xl font-bold">{metrics.openWorkOrders}</p>
                </div>
              </Card>
            </div>
            
            <Card>
              <h3 className="text-lg font-semibold mb-4">Portfolio Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Units</p>
                  <p className="text-xl font-bold">{metrics.totalUnits}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Occupied</p>
                  <p className="text-xl font-bold text-green-600">{metrics.occupiedUnits}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vacant</p>
                  <p className="text-xl font-bold text-red-600">{metrics.vacantUnits}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Leases</p>
                  <p className="text-xl font-bold">{metrics.activeLeases}</p>
                </div>
              </div>
            </Card>
          </div>
        </Tabs.Item>
        
        <Tabs.Item title="Financial" icon={HiCurrencyDollar}>
          <div className="mt-4 space-y-6">
            <Card>
              <h3 className="text-lg font-semibold mb-4">Revenue Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Monthly Revenue</p>
                  <p className="text-3xl font-bold">{formatCurrency(metrics.monthlyRevenue)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Annual Revenue (Projected)</p>
                  <p className="text-3xl font-bold">{formatCurrency(metrics.annualRevenue)}</p>
                </div>
              </div>
            </Card>
            
            {leases && leases.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold mb-4">Active Leases</h3>
                <Table hoverable>
                  <Table.Head>
                    <Table.HeadCell>Property</Table.HeadCell>
                    <Table.HeadCell>Rent Amount</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {leases.filter((l) => l.status === 'active').slice(0, 10).map((lease) => (
                      <Table.Row key={lease.id}>
                        <Table.Cell>{lease.property_id ? `Property ${lease.property_id.substring(0, 8)}` : '-'}</Table.Cell>
                        <Table.Cell>{formatCurrency(lease.rent_amount || 0)}</Table.Cell>
                        <Table.Cell>
                          <Badge color="success">{lease.status}</Badge>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Card>
            )}
          </div>
        </Tabs.Item>
        
        <Tabs.Item title="Operations" icon={HiClipboard}>
          <div className="mt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500 mb-1">Total Work Orders</p>
                  <p className="text-2xl font-bold">{metrics.totalWorkOrders}</p>
                </div>
              </Card>
              <Card>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500 mb-1">Open</p>
                  <p className="text-2xl font-bold text-orange-600">{metrics.openWorkOrders}</p>
                </div>
              </Card>
              <Card>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.completedWorkOrders}</p>
                </div>
              </Card>
            </div>
            
            {workOrders && workOrders.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold mb-4">Recent Work Orders</h3>
                <Table hoverable>
                  <Table.Head>
                    <Table.HeadCell>Title</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Priority</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {workOrders.slice(0, 10).map((wo) => (
                      <Table.Row key={wo.id}>
                        <Table.Cell className="font-medium">{wo.title}</Table.Cell>
                        <Table.Cell>
                          <Badge color={
                            wo.status === 'completed' ? 'success' :
                            wo.status === 'in_progress' ? 'info' :
                            'warning'
                          }>
                            {wo.status}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>{wo.priority || 'normal'}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Card>
            )}
          </div>
        </Tabs.Item>
      </Tabs>
    </div>
  );
}
