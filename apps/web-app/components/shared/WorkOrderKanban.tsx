/**
 * ═══════════════════════════════════════════════════════════════
 * WORK ORDER KANBAN BOARD
 * ═══════════════════════════════════════════════════════════════
 * 
 * Drag-and-drop Kanban board for work orders (maintenance requests)
 * Columns: New, In Progress, Waiting on Vendor, Completed
 */

"use client";

import { useState, useMemo } from 'react';
import { Card, Badge, Spinner, Alert } from 'flowbite-react';
import { useWorkOrders, useUpdateWorkOrderStatus } from '@/lib/hooks/useDataQueries';
import {
  HiCog,
  HiClock,
  HiCheckCircle,
  HiExclamationCircle,
} from 'react-icons/hi';

const COLUMNS = [
  { id: 'new', label: 'New', color: 'gray' },
  { id: 'in_progress', label: 'In Progress', color: 'blue' },
  { id: 'waiting_on_vendor', label: 'Waiting on Vendor', color: 'yellow' },
  { id: 'completed', label: 'Completed', color: 'green' },
];

const STATUS_MAP = {
  'new': 'new',
  'pending': 'new',
  'in_progress': 'in_progress',
  'waiting_on_vendor': 'waiting_on_vendor',
  'waiting': 'waiting_on_vendor',
  'completed': 'completed',
  'closed': 'completed',
};

export default function WorkOrderKanban({ filters = {} }) {
  const { data, isLoading, error } = useWorkOrders(filters);
  const updateStatusMutation = useUpdateWorkOrderStatus();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Group work orders by status
  const groupedOrders = useMemo(() => {
    // Handle different data structures
    const orders = data?.data || data?.requests || data || [];
    
    const groups: Record<string, any[]> = {
      new: [],
      in_progress: [],
      waiting_on_vendor: [],
      completed: [],
    };

    (Array.isArray(orders) ? orders : []).forEach((order: any) => {
      const status = STATUS_MAP[order.status?.toLowerCase()] || 'new';
      if (groups[status]) {
        groups[status].push(order);
      }
    });

    return groups;
  }, [data]);

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    setDraggedItem(orderId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: draggedItem,
        status: targetStatus,
      });
    } catch (error) {
      console.error('Failed to update work order status:', error);
    } finally {
      setDraggedItem(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="failure">
        Failed to load work orders. Please try again.
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {COLUMNS.map((column) => {
        const orders = groupedOrders[column.id] || [];
        const colorClasses = {
          gray: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700',
          blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
          yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700',
          green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
        };
        
        return (
          <div
            key={column.id}
            className="flex flex-col"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className={`${colorClasses[column.color]} rounded-t-lg p-3 border-b`}>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {column.label}
                <Badge color={column.color} size="sm">
                  {orders.length}
                </Badge>
              </h3>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-b-lg p-2 min-h-[400px] space-y-2">
              {orders.map((order: any) => (
                <Card
                  key={order.id}
                  className="cursor-move hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => handleDragStart(e, order.id)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                        {order.title || order.description?.substring(0, 50) || 'Untitled'}
                      </h4>
                      {order.priority === 'urgent' && (
                        <HiExclamationCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    
                    {order.property?.propertyName && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {order.property.propertyName}
                      </p>
                    )}
                    
                    {order.ticketNumber && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        #{order.ticketNumber}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Badge color={column.color} size="xs">
                        {order.category || 'General'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
              
              {orders.length === 0 && (
                <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-600">
                  <p className="text-sm">No work orders</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

