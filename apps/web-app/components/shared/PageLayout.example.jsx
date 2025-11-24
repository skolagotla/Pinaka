/**
 * PageLayout Usage Examples
 * 
 * This file demonstrates how to use the PageLayout component
 * for consistent page layouts across the application.
 */

import React from 'react';
import { Button, Table } from 'flowbite-react';
import { HiPlus, HiRefresh, HiHome, HiUserGroup } from 'react-icons/hi';
import PageLayout, { EmptyState, TableWrapper } from './PageLayout';

// ============================================
// Example 1: Simple page with header and table
// ============================================
export function SimplePageExample({ data, loading }) {
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
  ];

  return (
    <PageLayout
      headerTitle={<><HiHome className="inline mr-2" /> Properties</>}
      headerActions={
        <>
          <Button key="refresh" size="sm" className="flex items-center gap-2">
            <HiRefresh className="h-4 w-4" />
            Refresh
          </Button>
          <Button key="add" color="blue" className="flex items-center gap-2">
            <HiPlus className="h-4 w-4" />
            Add Property
          </Button>
        </>
      }
    >
      {data.length === 0 ? (
        <EmptyState
          icon={<HiHome className="h-12 w-12 text-gray-400" />}
          title="No properties yet"
          description="Click 'Add Property' to add your first property"
        />
      ) : (
        <TableWrapper>
          <Table
            data={data}
            columns={columns}
            loading={loading}
          />
        </TableWrapper>
      )}
    </PageLayout>
  );
}

// ============================================
// Example 2: Page with statistics cards
// ============================================
export function PageWithStatsExample({ properties, units, leases, landlords }) {
  const stats = [
    {
      title: 'Properties',
      value: properties.length,
      prefix: <HiHome className="h-4 w-4" />,
      color: '#3b82f6',
    },
    {
      title: 'Total Units',
      value: units.length,
      prefix: <HiHome className="h-4 w-4" />,
      color: '#22c55e',
    },
    {
      title: 'Active Leases',
      value: leases.length,
      prefix: <HiUserGroup className="h-4 w-4" />,
      color: '#a855f7',
    },
    {
      title: 'Landlords',
      value: landlords.length,
      prefix: <HiUserGroup className="h-4 w-4" />,
      color: '#eab308',
    },
  ];

  return (
    <PageLayout
      headerTitle={<><HiHome className="inline mr-2" /> Managed Properties</>}
      stats={stats}
      statsCols={4}
    >
      <TableWrapper>
        <Table
          data={properties}
          columns={[]}
        />
      </TableWrapper>
    </PageLayout>
  );
}

// ============================================
// Example 3: Custom header
// ============================================
export function CustomHeaderExample() {
  const customHeader = (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-3">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h4 className="text-lg font-semibold m-0">Custom Header</h4>
          <div className="text-xs text-gray-500">With subtitle</div>
        </div>
        <input
          type="text"
          placeholder="Search..."
          className="w-72 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
        />
      </div>
    </div>
  );

  return (
    <PageLayout header={customHeader}>
      <TableWrapper>
        <Table data={[]} columns={[]} />
      </TableWrapper>
    </PageLayout>
  );
}

// ============================================
// Example 4: Tabs-based page (for unified pages)
// ============================================
export function TabsPageExample() {
  return (
    <div className="p-3 h-full flex flex-col">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tabs would be implemented using Flowbite Tabs component */}
        <div className="flex-1 overflow-auto pt-3">
          <PageLayout
            headerTitle="Tab Content"
            stats={[]}
          >
            <TableWrapper>
              <Table data={[]} columns={[]} />
            </TableWrapper>
          </PageLayout>
        </div>
      </div>
    </div>
  );
}
