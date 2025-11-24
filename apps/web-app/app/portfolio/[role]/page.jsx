/**
 * Role-Based Portfolio Dashboard - Migrated to v2 FastAPI
 * 
 * Displays different portfolio views based on user role using v2 FastAPI backend.
 * All data comes from FastAPI v2 endpoints - no Next.js API routes or Prisma.
 */
"use client";

import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { 
  useProperties, 
  useUnits, 
  useLeases, 
  useWorkOrders,
  useTenants,
  useLandlords,
  useOrganizations
} from '@/lib/hooks/useV2Data';
import { Card, Spinner, Alert, Button, Badge } from 'flowbite-react';
import { HiHome, HiDocumentText, HiUserGroup, HiClipboardList, HiOfficeBuilding } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PageHeader, StatCard, PageSkeleton, StatCardSkeleton } from '@/components/shared';

export default function RoleBasedPortfolioPage() {
  const router = useRouter();
  const { user, loading: authLoading, hasRole } = useV2Auth();
  
  // Determine role from v2 auth
  let userRole = null;
  if (user) {
    if (hasRole('super_admin')) {
      userRole = 'super_admin';
    } else if (hasRole('pmc_admin')) {
      userRole = 'pmc_admin';
    } else if (hasRole('pm')) {
      userRole = 'pm';
    } else if (hasRole('landlord')) {
      userRole = 'landlord';
    } else if (hasRole('tenant')) {
      userRole = 'tenant';
    } else if (hasRole('vendor')) {
      userRole = 'vendor';
    }
  }
  
  const organizationId = user?.organization_id || undefined;
  
  // Fetch data based on role
  const { data: properties, isLoading: propertiesLoading } = useProperties(organizationId);
  const { data: units, isLoading: unitsLoading } = useUnits();
  const { data: leases, isLoading: leasesLoading } = useLeases({ organization_id: organizationId });
  const { data: workOrders, isLoading: workOrdersLoading } = useWorkOrders({ organization_id: organizationId });
  const { data: tenants, isLoading: tenantsLoading } = useTenants(organizationId);
  const { data: landlords, isLoading: landlordsLoading } = useLandlords(organizationId);
  const { data: organizations, isLoading: orgsLoading } = useOrganizations();
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);
  
  if (authLoading) {
    return <PageSkeleton />;
  }
  
  if (!user || !userRole) {
    return (
      <div className="p-6">
        <Alert color="warning">
          Please log in to view your portfolio.
        </Alert>
      </div>
    );
  }
  
  const isLoading = propertiesLoading || unitsLoading || leasesLoading || workOrdersLoading || 
                    tenantsLoading || landlordsLoading || orgsLoading;
  
  // Calculate metrics based on role with icons and colors
  let metrics = [];
  
  if (userRole === 'super_admin') {
    metrics = [
      { key: 'organizations', title: 'Organizations', value: organizations?.length || 0, icon: HiOfficeBuilding, color: 'purple' },
      { key: 'properties', title: 'Properties', value: properties?.length || 0, icon: HiHome, color: 'blue' },
      { key: 'leases', title: 'Leases', value: leases?.length || 0, icon: HiDocumentText, color: 'green' },
      { key: 'tenants', title: 'Tenants', value: tenants?.length || 0, icon: HiUserGroup, color: 'yellow' },
      { key: 'workOrders', title: 'Work Orders', value: workOrders?.length || 0, icon: HiClipboardList, color: 'red' },
    ];
  } else if (userRole === 'pmc_admin' || userRole === 'pm') {
    const openWorkOrders = workOrders?.filter((wo) => wo.status !== 'completed' && wo.status !== 'canceled')?.length || 0;
    metrics = [
      { key: 'properties', title: 'Properties', value: properties?.length || 0, icon: HiHome, color: 'blue' },
      { key: 'leases', title: 'Active Leases', value: leases?.length || 0, icon: HiDocumentText, color: 'green' },
      { key: 'tenants', title: 'Tenants', value: tenants?.length || 0, icon: HiUserGroup, color: 'yellow' },
      { key: 'openWorkOrders', title: 'Open Work Orders', value: openWorkOrders, icon: HiClipboardList, color: 'red' },
    ];
  } else if (userRole === 'landlord') {
    metrics = [
      { key: 'properties', title: 'Properties', value: properties?.length || 0, icon: HiHome, color: 'blue' },
      { key: 'leases', title: 'Active Leases', value: leases?.length || 0, icon: HiDocumentText, color: 'green' },
      { key: 'tenants', title: 'Tenants', value: tenants?.length || 0, icon: HiUserGroup, color: 'yellow' },
      { key: 'workOrders', title: 'Work Orders', value: workOrders?.length || 0, icon: HiClipboardList, color: 'red' },
    ];
  } else if (userRole === 'tenant') {
    metrics = [
      { key: 'currentLeases', title: 'Current Leases', value: leases?.length || 0, icon: HiDocumentText, color: 'green' },
      { key: 'workOrders', title: 'My Work Orders', value: workOrders?.length || 0, icon: HiClipboardList, color: 'blue' },
    ];
  } else if (userRole === 'vendor') {
    const completed = workOrders?.filter((wo) => wo.status === 'completed')?.length || 0;
    metrics = [
      { key: 'assignedWorkOrders', title: 'Assigned', value: workOrders?.length || 0, icon: HiClipboardList, color: 'blue' },
      { key: 'completedWorkOrders', title: 'Completed', value: completed, icon: HiClipboardList, color: 'green' },
    ];
  }
  
  const getRoleTitle = () => {
    const titles = {
      super_admin: 'System Admin',
      pmc_admin: 'PMC Admin',
      pm: 'Property Manager',
      landlord: 'Landlord',
      tenant: 'Tenant',
      vendor: 'Vendor',
    };
    return titles[userRole] || 'Dashboard';
  };
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title={`${getRoleTitle()} Portfolio`}
        description="Overview of your properties, leases, and work orders"
      />
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <StatCard
              key={metric.key}
              title={metric.title}
              value={metric.value}
              icon={<metric.icon className="h-6 w-6" />}
              color={metric.color}
            />
          ))}
        </div>
      )}
      
      {/* Role-specific sections */}
      {userRole === 'super_admin' && organizations && organizations.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Organizations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org) => (
              <Card key={org.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <HiOfficeBuilding className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{org.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{org.type || 'Organization'}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {workOrders && workOrders.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Recent Work Orders</h2>
            <Button 
              color="light" 
              size="sm"
              onClick={() => router.push('/operations/kanban')}
            >
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workOrders.slice(0, 6).map((wo) => (
              <Card key={wo.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/work-orders/${wo.id}`)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{wo.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {wo.description || 'No description'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge color={
                    wo.status === 'completed' ? 'success' :
                    wo.status === 'in_progress' ? 'warning' :
                    wo.status === 'new' ? 'info' :
                    'gray'
                  }>
                    {wo.status?.replace('_', ' ')}
                  </Badge>
                  {wo.priority && (
                    <Badge color={
                      wo.priority === 'high' ? 'failure' :
                      wo.priority === 'medium' ? 'warning' :
                      'gray'
                    } size="sm">
                      {wo.priority}
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
