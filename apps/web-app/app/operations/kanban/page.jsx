/**
 * Work Order Kanban Board Page
 * 
 * Displays work orders (maintenance requests) in a Kanban board view
 * with drag-and-drop functionality
 */

"use client";

import { useState } from 'react';
import { Card, Tabs, Button } from 'flowbite-react';
import { HiViewGrid, HiViewList } from 'react-icons/hi';
import WorkOrderKanban from '@/components/shared/WorkOrderKanban';
import { useWorkOrders } from '@/lib/hooks/useDataQueries';
import FlowbiteTable from '@/components/shared/FlowbiteTable';

export default function WorkOrderKanbanPage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const { data, isLoading } = useWorkOrders();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Work Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track maintenance requests
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            color={viewMode === 'kanban' ? 'blue' : 'gray'}
            size="sm"
            onClick={() => setViewMode('kanban')}
          >
            <HiViewGrid className="h-4 w-4 mr-2" />
            Kanban
          </Button>
          <Button
            color={viewMode === 'list' ? 'blue' : 'gray'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <HiViewList className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <WorkOrderKanban />
      ) : (
        <Card>
          <FlowbiteTable
            data={data?.data || []}
            columns={[
              { key: 'ticketNumber', label: 'Ticket #' },
              { key: 'title', label: 'Title' },
              { key: 'status', label: 'Status' },
              { key: 'priority', label: 'Priority' },
              { key: 'property.propertyName', label: 'Property' },
              { key: 'requestedDate', label: 'Requested' },
            ]}
            loading={isLoading}
          />
        </Card>
      )}
    </div>
  );
}

