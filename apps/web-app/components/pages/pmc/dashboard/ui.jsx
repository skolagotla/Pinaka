"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Card, Button, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell } from 'flowbite-react';
import {
  HiHome,
  HiUser,
  HiDocumentText,
  HiClipboard,
  HiArrowRight,
  HiCurrencyDollar,
} from 'react-icons/hi';
import { PageLayout, TableWrapper } from '@/components/shared';
import Link from 'next/link';

export default function PMCDashboardClient({
  pmc,
  stats,
  managedProperties = [],
  pmcRelationships = [],
}) {
  const router = useRouter();

  const quickActions = useMemo(() => [
    {
      key: 'properties',
      label: 'View Properties',
      icon: HiHome,
      onClick: () => router.push('/properties'),
      primary: true,
    },
    {
      key: 'landlords',
      label: 'Manage Landlords',
      icon: HiUser,
      onClick: () => router.push('/landlords'),
    },
    {
      key: 'maintenance',
      label: 'Maintenance',
      icon: HiClipboard,
      onClick: () => router.push('/operations?tab=maintenance'),
    },
    {
      key: 'expenses',
      label: 'Expenses',
      icon: HiCurrencyDollar,
      onClick: () => router.push('/financials'),
    },
  ], [router]);

  const propertyColumns = [
    {
      header: 'Property',
      accessorKey: 'addressLine1',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold">{row.original.addressLine1 || row.original.propertyName}</div>
          <div className="text-sm text-gray-500">
            {row.original.city}, {row.original.provinceState}
          </div>
        </div>
      ),
    },
    {
      header: 'Landlord',
      accessorKey: 'landlord',
      cell: ({ row }) => (
        <span>
          {row.original.landlord ? `${row.original.landlord.firstName} ${row.original.landlord.lastName}` : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Units',
      accessorKey: 'units',
      cell: ({ row }) => row.original.units?.length || 0,
    },
    {
      header: 'Active Leases',
      accessorKey: 'leases',
      cell: ({ row }) => {
        const leaseCount = row.original.units?.reduce((sum, unit) => sum + (unit.leases?.length || 0), 0) || 0;
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">{leaseCount}</span>;
      },
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: () => (
        <Button
          color="light"
          onClick={() => router.push('/properties')}
          className="flex items-center gap-1"
        >
          View <HiArrowRight className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const statsData = [
    {
      title: 'Managed Landlords',
      value: stats.totalLandlords,
      prefix: <HiUser className="h-6 w-6" />,
      onClick: () => router.push('/landlords'),
    },
    {
      title: 'Properties',
      value: stats.totalProperties,
      prefix: <HiHome className="h-6 w-6" />,
      onClick: () => router.push('/properties'),
    },
    {
      title: 'Total Units',
      value: stats.totalUnits,
      prefix: <HiCurrencyDollar className="h-6 w-6" />,
    },
    {
      title: 'Active Leases',
      value: stats.activeLeases,
      prefix: <HiDocumentText className="h-6 w-6" />,
    },
  ];

  return (
    <PageLayout
      headerTitle={<>Welcome back, <span className="text-blue-600">{pmc.companyName}</span>!</>}
      headerDescription="Property Management Company Dashboard"
      stats={statsData}
      statsCols={4}
      contentStyle={{ maxWidth: 1400, margin: '0 auto' }}
    >
      <div className="space-y-6">
        {/* Quick Actions with Flowbite Pro enhanced styling */}
        <Card className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            <Button color="light" size="sm" className="text-sm">
              View All
              <HiArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.key}
                  className={`cursor-pointer hover:shadow-xl transition-all duration-200 border-2 ${
                    action.primary 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:border-blue-600' 
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  } group`}
                  onClick={action.onClick}
                >
                  <div className="flex flex-col items-center justify-center gap-3 h-20">
                    <div className={`p-3 rounded-xl ${
                      action.primary 
                        ? 'bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60' 
                        : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                    } transition-colors`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`text-sm font-semibold ${
                      action.primary 
                        ? 'text-blue-700 dark:text-blue-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {action.label}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>

        {/* Managed Properties Table */}
        {managedProperties.length > 0 && (
          <TableWrapper>
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    {propertyColumns.map((col) => (
                      <TableHeadCell key={col.header}col.header}</TableHeadCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody className="divide-y">
                  {managedProperties.map((property) => (
                    <TableRow key={property.id}>
                      {propertyColumns.map((col) => (
                        <TableCell key={col.header}>
                          {col.cell ? col.cell({ row: { original: property } }) : property[col.accessorKey]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TableWrapper>
        )}

        {managedProperties.length === 0 && (
          <Card>
            <div className="text-center py-12 text-gray-500">
              <HiHome className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No properties managed yet</p>
              <Button color="blue" onClick={() => router.push('/properties')} className="mt-4">
                View Properties
              </Button>
            </div>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
