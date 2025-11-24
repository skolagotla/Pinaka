/**
 * Calendar Page - Migrated to v2 FastAPI
 * 
 * Role-based calendar page using v2 FastAPI backend.
 * All data comes from FastAPI v2 endpoints - no Next.js API routes or Prisma.
 */
"use client";

import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useProperties } from '@/lib/hooks/useV2Data';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner, Alert } from 'flowbite-react';
import dynamic from 'next/dynamic';

// Lazy load calendar clients
const LandlordCalendarClient = dynamic(() => import('@/components/pages/landlord/calendar/ui').then(mod => mod.default));
const PMCCalendarClient = dynamic(() => import('@/components/pages/pmc/calendar/ui').then(mod => mod.default));

export default function CalendarPage() {
  const router = useRouter();
  const { user, loading: authLoading, hasRole } = useV2Auth();
  const organizationId = user?.organization_id;
  
  // Fetch properties for calendar
  const { data: properties, isLoading: propertiesLoading } = useProperties(organizationId);
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);
  
  if (authLoading || propertiesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <Alert color="warning" className="m-4">
        Please log in to view calendar.
      </Alert>
    );
  }
  
  // Determine user role
  let userRole = null;
  if (hasRole('landlord')) {
    userRole = 'landlord';
  } else if (hasRole('pmc_admin') || hasRole('pm')) {
    userRole = 'pmc';
  }
  
  if (!userRole) {
    return (
      <Alert color="failure" className="m-4">
        Calendar is only available for landlords and PMC admins.
      </Alert>
    );
  }
  
  // Format properties for calendar components
  const formattedProperties = properties?.map((prop) => ({
    id: prop.id,
    propertyName: prop.name || prop.address_line1,
    addressLine1: prop.address_line1,
  })) || [];
  
  if (userRole === 'landlord') {
    return (
      <LandlordCalendarClient
        landlord={{
          id: user.user_id || user.id,
          email: user.email,
          full_name: user.full_name,
        }}
        properties={formattedProperties}
      />
    );
  } else if (userRole === 'pmc') {
    return (
      <PMCCalendarClient
        pmc={{
          id: user.user_id || user.id,
          email: user.email,
          full_name: user.full_name,
        }}
        properties={formattedProperties}
      />
    );
  }
  
  return null;
}
