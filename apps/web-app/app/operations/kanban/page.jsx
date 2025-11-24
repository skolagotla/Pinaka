/**
 * Work Orders Kanban Board - v2 FastAPI
 * 
 * Kanban-style board for managing work orders with drag-and-drop status updates.
 * All data comes from FastAPI v2 backend.
 */
"use client";

import { useState } from 'react';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useWorkOrders, useUpdateWorkOrder, useCreateWorkOrder } from '@/lib/hooks/useV2Data';
import { Card, Button, Badge, Modal, Textarea, TextInput, Select, Spinner, Alert } from 'flowbite-react';
import { HiPlus, HiChat, HiClipboardList } from 'react-icons/hi';
import AttachmentsList from '@/components/shared/AttachmentsList';
import { PageHeader, PageSkeleton } from '@/components/shared';

const COLUMNS = [
  { id: 'new', label: 'New', status: 'new' },
  { id: 'in_progress', label: 'In Progress', status: 'in_progress' },
  { id: 'waiting_on_vendor', label: 'Waiting on Vendor', status: 'waiting_on_vendor' },
  { id: 'completed', label: 'Completed', status: 'completed' },
];

export default function WorkOrdersKanbanPage() {
  const { user, loading: authLoading, hasRole } = useV2Auth();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  const [newWorkOrder, setNewWorkOrder] = useState({
    title: '',
    description: '',
    priority: 'medium',
    property_id: '',
    unit_id: '',
    tenant_id: '',
  });
  
  const organizationId = user?.organization_id || undefined;
  const { data: workOrders, isLoading } = useWorkOrders({ organization_id: organizationId });
  const updateWorkOrder = useUpdateWorkOrder();
  const createWorkOrder = useCreateWorkOrder();
  
  const handleStatusChange = async (workOrderId, newStatus) => {
    try {
      await updateWorkOrder.mutateAsync({
        id: workOrderId,
        data: { status: newStatus },
      });
    } catch (error) {
      console.error('Failed to update work order status:', error);
      alert('Failed to update work order status');
    }
  };
  
  const handleCreateWorkOrder = async () => {
    if (!newWorkOrder.title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    try {
      await createWorkOrder.mutateAsync({
        organization_id: organizationId,
        property_id: newWorkOrder.property_id || undefined,
        unit_id: newWorkOrder.unit_id || undefined,
        tenant_id: newWorkOrder.tenant_id || undefined,
        title: newWorkOrder.title,
        description: newWorkOrder.description || undefined,
        priority: newWorkOrder.priority,
        status: 'new',
      });
      
      setCreateModalOpen(false);
      setNewWorkOrder({
        title: '',
        description: '',
        priority: 'medium',
        property_id: '',
        unit_id: '',
        tenant_id: '',
      });
    } catch (error) {
      console.error('Failed to create work order:', error);
      alert('Failed to create work order');
    }
  };
  
  const getStatusColor = (status) => {
    const colors = {
      new: 'blue',
      in_progress: 'yellow',
      waiting_on_vendor: 'purple',
      completed: 'green',
      canceled: 'red',
    };
    return colors[status] || 'gray';
  };
  
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'gray',
      medium: 'blue',
      high: 'orange',
      emergency: 'red',
    };
    return colors[priority] || 'gray';
  };
  
  if (authLoading || isLoading) {
    return <PageSkeleton />;
  }
  
  if (!user) {
    return (
      <div className="p-6">
        <Alert color="warning">
          Please log in to view work orders.
        </Alert>
      </div>
    );
  }
  
  // Filter work orders by role
  let filteredWorkOrders = workOrders || [];
  if (hasRole('tenant')) {
    // Tenants only see their own work orders
    // Note: Backend should filter this, but we can add client-side filter as backup
  } else if (hasRole('vendor')) {
    // Vendors only see assigned work orders
    // Note: Backend should filter this
  }
  
  // Group work orders by status
  const workOrdersByStatus = COLUMNS.reduce((acc, column) => {
    acc[column.status] = filteredWorkOrders.filter((wo) => wo.status === column.status);
    return acc;
  }, {});
  
  const totalWorkOrders = filteredWorkOrders.length;
  const canCreateWorkOrder = hasRole('tenant') || hasRole('landlord') || hasRole('pm') || hasRole('pmc_admin') || hasRole('super_admin');
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Work Orders"
        description={`Manage and track work orders across your properties. ${totalWorkOrders} total work orders.`}
        actions={
          canCreateWorkOrder ? (
            <Button color="blue" onClick={() => setCreateModalOpen(true)}>
              <HiPlus className="mr-2 h-4 w-4" />
              New Work Order
            </Button>
          ) : null
        }
      />
      
      {/* Kanban Board */}
      {totalWorkOrders === 0 ? (
        <Card>
          <div className="text-center py-12">
            <HiClipboardList className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No work orders yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Get started by creating your first work order
            </p>
            {canCreateWorkOrder && (
              <Button color="blue" onClick={() => setCreateModalOpen(true)}>
                <HiPlus className="mr-2 h-4 w-4" />
                Create Work Order
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((column) => {
            const columnWorkOrders = workOrdersByStatus[column.status] || [];
            const count = columnWorkOrders.length;
            
            return (
              <div key={column.id} className="flex flex-col">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{column.label}</h3>
                    <Badge color={getStatusColor(column.status)} size="sm">
                      {count}
                    </Badge>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-b-lg min-h-[500px] space-y-3 overflow-y-auto max-h-[600px]">
                  {columnWorkOrders.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                      No items
                    </div>
                  ) : (
                    columnWorkOrders.map((wo) => (
                      <Card
                        key={wo.id}
                        className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
                        onClick={() => {
                          setSelectedWorkOrder(wo);
                          setDetailModalOpen(true);
                        }}
                      >
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">
                            {wo.title}
                          </h4>
                          {wo.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {wo.description}
                            </p>
                          )}
                          <div className="flex gap-2 flex-wrap items-center">
                            <Badge color={getPriorityColor(wo.priority)} size="sm" className="capitalize">
                              {wo.priority}
                            </Badge>
                            {wo.property && (
                              <span className="text-xs text-gray-500 truncate max-w-[100px]">
                                {wo.property.name || wo.property.address_line1}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            {new Date(wo.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Create Work Order Modal */}
      <Modal show={createModalOpen} onClose={() => setCreateModalOpen(false)} size="lg">
        <Modal.Header>Create New Work Order</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <TextInput
                value={newWorkOrder.title}
                onChange={(e) => setNewWorkOrder({ ...newWorkOrder, title: e.target.value })}
                placeholder="Enter work order title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={newWorkOrder.description}
                onChange={(e) => setNewWorkOrder({ ...newWorkOrder, description: e.target.value })}
                placeholder="Enter description"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <Select
                value={newWorkOrder.priority}
                onChange={(e) => setNewWorkOrder({ ...newWorkOrder, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="emergency">Emergency</option>
              </Select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={handleCreateWorkOrder}
            disabled={!newWorkOrder.title.trim() || createWorkOrder.isPending}
          >
            {createWorkOrder.isPending ? 'Creating...' : 'Create Work Order'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Work Order Detail Modal */}
      <Modal show={detailModalOpen} onClose={() => setDetailModalOpen(false)} size="4xl">
        {selectedWorkOrder && (
          <>
            <Modal.Header>
              <div className="flex items-center justify-between w-full">
                <span>{selectedWorkOrder.title}</span>
                <div className="flex gap-2">
                  <Badge color={getStatusColor(selectedWorkOrder.status)}>
                    {selectedWorkOrder.status}
                  </Badge>
                  <Badge color={getPriorityColor(selectedWorkOrder.priority)}>
                    {selectedWorkOrder.priority}
                  </Badge>
                </div>
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="space-y-6">
                {selectedWorkOrder.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-700">{selectedWorkOrder.description}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  <Select
                    value={selectedWorkOrder.status}
                    onChange={(e) => handleStatusChange(selectedWorkOrder.id, e.target.value)}
                  >
                    {COLUMNS.map((col) => (
                      <option key={col.id} value={col.status}>
                        {col.label}
                      </option>
                    ))}
                  </Select>
                </div>
                
                {selectedWorkOrder.comments && selectedWorkOrder.comments.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Comments</h3>
                    <div className="space-y-2">
                      {selectedWorkOrder.comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 p-3 rounded">
                          <p className="text-sm font-medium">
                            {comment.author?.full_name || comment.author?.email || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-700">{comment.body}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(comment.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <AttachmentsList
                  entityType="work_order"
                  entityId={selectedWorkOrder.id}
                  showUpload={hasRole('tenant') || hasRole('landlord') || hasRole('pm') || hasRole('pmc_admin') || hasRole('super_admin')}
                />
              </div>
            </Modal.Body>
          </>
        )}
      </Modal>
    </div>
  );
}
