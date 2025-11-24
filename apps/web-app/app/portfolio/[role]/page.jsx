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
import { Card, Spinner, Alert } from 'flowbite-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }
  
  if (!user || !userRole) {
    return (
      <Alert color="warning" className="m-4">
        Please log in to view your portfolio.
      </Alert>
    );
  }
  
  const isLoading = propertiesLoading || unitsLoading || leasesLoading || workOrdersLoading;
  
  // Calculate metrics based on role
  let metrics = {};
  
  if (userRole === 'super_admin') {
    metrics = {
      organizations: organizations?.length || 0,
      properties: properties?.length || 0,
      leases: leases?.length || 0,
      tenants: tenants?.length || 0,
      workOrders: workOrders?.length || 0,
    };
  } else if (userRole === 'pmc_admin' || userRole === 'pm') {
    metrics = {
      properties: properties?.length || 0,
      leases: leases?.length || 0,
      tenants: tenants?.length || 0,
      workOrders: workOrders?.length || 0,
      openWorkOrders: workOrders?.filter((wo: any) => wo.status !== 'completed')?.length || 0,
    };
  } else if (userRole === 'landlord') {
    metrics = {
      properties: properties?.length || 0,
      leases: leases?.length || 0,
      tenants: tenants?.length || 0,
      workOrders: workOrders?.length || 0,
    };
  } else if (userRole === 'tenant') {
    metrics = {
      currentLeases: leases?.length || 0,
      workOrders: workOrders?.length || 0,
    };
  } else if (userRole === 'vendor') {
    metrics = {
      assignedWorkOrders: workOrders?.length || 0,
      completedWorkOrders: workOrders?.filter((wo: any) => wo.status === 'completed')?.length || 0,
    };
  }
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Portfolio Dashboard</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spinner size="xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(metrics).map(([key, value]) => (
            <Card key={key} className="shadow-md">
              <div className="flex flex-col">
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Role-specific sections */}
      {userRole === 'super_admin' && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Organizations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations?.map((org: any) => (
              <Card key={org.id} className="shadow-md">
                <h3 className="text-lg font-semibold">{org.name}</h3>
                <p className="text-sm text-gray-500">{org.type}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {workOrders && workOrders.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Recent Work Orders</h2>
          <div className="space-y-2">
            {workOrders.slice(0, 5).map((wo: any) => (
              <Card key={wo.id} className="shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{wo.title}</h4>
                    <p className="text-sm text-gray-500">{wo.status}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    wo.status === 'completed' ? 'bg-green-100 text-green-800' :
                    wo.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {wo.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
