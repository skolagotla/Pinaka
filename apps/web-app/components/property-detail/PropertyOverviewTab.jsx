"use client";

import { Badge } from 'flowbite-react';
import {
  HiHome,
  HiUserGroup,
  HiDocumentText,
  HiCurrencyDollar,
} from 'react-icons/hi';
import { Card } from 'flowbite-react';
import FlowbiteStatistic from '../shared/FlowbiteStatistic';

export default function PropertyOverviewTab({ property }) {
  if (!property) return null;

  const totalUnits = property.units?.length || 0;
  const activeLeases = property.units?.reduce(
    (sum, unit) => sum + (unit.leases?.filter(l => l.status === 'Active').length || 0),
    0
  ) || 0;
  const totalTenants = new Set(
    property.units?.flatMap(unit =>
      unit.leases?.flatMap(lease =>
        lease.leaseTenants?.map(lt => lt.tenant?.id).filter(Boolean) || []
      ) || []
    ) || []
  ).size;
  const vacantUnits = totalUnits - activeLeases;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <FlowbiteStatistic
            title="Total Units"
            value={totalUnits}
            icon={<HiHome className="h-6 w-6" />}
          />
        </Card>
        <Card>
          <FlowbiteStatistic
            title="Active Leases"
            value={activeLeases}
            icon={<HiDocumentText className="h-6 w-6" />}
          />
        </Card>
        <Card>
          <FlowbiteStatistic
            title="Total Tenants"
            value={totalTenants}
            icon={<HiUserGroup className="h-6 w-6" />}
          />
        </Card>
        <Card>
          <FlowbiteStatistic
            title="Vacant Units"
            value={vacantUnits}
            icon={<HiHome className="h-6 w-6" />}
          />
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Property Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Property ID</div>
            <div>
              <Badge color="gray">{property.propertyId}</Badge>
            </div>
          </div>
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Type</div>
            <div>
              <Badge color="gray">{property.propertyType || 'N/A'}</Badge>
            </div>
          </div>
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Address</div>
            <div className="text-gray-900 dark:text-white">
              {property.addressLine1}
              {property.addressLine2 && `, ${property.addressLine2}`}
            </div>
          </div>
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">City</div>
            <div className="text-gray-900 dark:text-white">
              {property.city}, {property.provinceState} {property.postalZip}
            </div>
          </div>
          {property.yearBuilt && (
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Year Built</div>
              <div className="text-gray-900 dark:text-white">{property.yearBuilt}</div>
            </div>
          )}
          {property.rent && (
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Base Rent</div>
              <div className="text-gray-900 dark:text-white">
                ${property.rent.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
