"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  Button, 
  Alert, 
  Spinner,
  Badge,
  Tabs,
} from 'flowbite-react';
import {
  HiHome,
  HiUserGroup,
  HiDocumentText,
  HiWrench,
  HiCurrencyDollar,
  HiChat,
  HiPencil,
  HiArrowLeft,
} from 'react-icons/hi';
import { ProCard } from '@/components/shared/LazyProComponents';
import PropertyOverviewTab from '@/components/property-detail/PropertyOverviewTab';
import PropertyUnitsTab from '@/components/property-detail/PropertyUnitsTab';
import PropertyTenantsTab from '@/components/property-detail/PropertyTenantsTab';
import PropertyMaintenanceTab from '@/components/property-detail/PropertyMaintenanceTab';
import PropertyContextBanner from '@/components/PropertyContextBanner';
import { usePermissions } from '@/lib/hooks/usePermissions';

export default function PropertyDetailClient({ property, error, user }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const permissions = usePermissions(user || { role: 'landlord' });

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Alert color="failure">
          <div>
            <div className="font-semibold mb-2">Error</div>
            <div>{error}</div>
          </div>
          <Button onClick={() => router.push('/properties')} className="mt-4">
            Back to Properties
          </Button>
        </Alert>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center">
        <Spinner size="xl" />
        <div className="mt-4">Loading property...</div>
      </div>
    );
  }

  const propertyAddress = property.addressLine1 
    ? `${property.addressLine1}${property.addressLine2 ? `, ${property.addressLine2}` : ''}, ${property.city}, ${property.provinceState} ${property.postalZip}`
    : property.propertyName || 'Unnamed Property';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Property Context Banner */}
      <PropertyContextBanner userRole="landlord" />

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            color="light"
            onClick={() => router.push('/properties')}
          >
            <HiArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Button>
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <HiHome className="h-6 w-6" />
              {property.propertyName || property.addressLine1 || 'Property'}
            </h2>
            <p className="text-gray-500">{propertyAddress}</p>
          </div>
        </div>
        {permissions.canEditProperties && (
          <Button
            color="blue"
            onClick={() => router.push(`/properties/${property.id}/edit`)}
          >
            <HiPencil className="mr-2 h-4 w-4" />
            Edit Property
          </Button>
        )}
        {!permissions.canEditProperties && permissions.isPMCManaged && (
          <Badge color="warning" className="px-3 py-1 text-sm">
            Managed by {permissions.managingPMC?.companyName || 'PMC'}
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <ProCard>
        <Tabs aria-label="Property tabs" defaultActiveTab="overview">
          <Tabs.Item active title={
            <span className="flex items-center gap-2">
              <HiHome className="h-4 w-4" />
              Overview
            </span>
          }>
            <PropertyOverviewTab property={property} />
          </Tabs.Item>

          <Tabs.Item title={
            <span className="flex items-center gap-2">
              <HiUserGroup className="h-4 w-4" />
              Units & Leases
            </span>
          }>
            <PropertyUnitsTab property={property} />
          </Tabs.Item>

          <Tabs.Item title={
            <span className="flex items-center gap-2">
              <HiUserGroup className="h-4 w-4" />
              Tenants
            </span>
          }>
            <PropertyTenantsTab property={property} />
          </Tabs.Item>

          <Tabs.Item title={
            <span className="flex items-center gap-2">
              <HiWrench className="h-4 w-4" />
              Maintenance
            </span>
          }>
            <PropertyMaintenanceTab property={property} />
          </Tabs.Item>

          <Tabs.Item title={
            <span className="flex items-center gap-2">
              <HiCurrencyDollar className="h-4 w-4" />
              Financials
            </span>
          }>
            <div className="p-4">
              <p>Financial information will be displayed here.</p>
            </div>
          </Tabs.Item>

          <Tabs.Item title={
            <span className="flex items-center gap-2">
              <HiChat className="h-4 w-4" />
              Messages
            </span>
          }>
            <div className="p-4">
              <p>Messages and conversations will be displayed here.</p>
            </div>
          </Tabs.Item>
        </Tabs>
      </ProCard>
    </div>
  );
}
