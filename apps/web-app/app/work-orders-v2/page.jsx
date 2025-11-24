/**
 * Work Orders Page (v2 FastAPI Backend)
 * Sample page demonstrating v2 API integration
 */
"use client";

import { useState } from 'react';
import { useV2Auth } from '../../lib/hooks/useV2Auth';
import { useWorkOrders, useCreateWorkOrder, useAddWorkOrderComment } from '../../lib/hooks/useV2Data';
import { Button, Card, Badge, Textarea, Modal } from 'flowbite-react';
import { HiPlus, HiChat } from 'react-icons/hi';

export default function WorkOrdersV2Page() {
  const { user, loading: authLoading } = useV2Auth();
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  const { data: workOrders, isLoading: workOrdersLoading } = useWorkOrders({
    organization_id: user?.organization_id || undefined,
  });
  
  const createWorkOrder = useCreateWorkOrder();
  const addComment = useAddWorkOrderComment();

  const handleAddComment = async () => {
    if (!selectedWorkOrder || !newComment.trim()) return;
    
    try {
      await addComment.mutateAsync({
        workOrderId: selectedWorkOrder.id,
        body: newComment,
      });
      setNewComment('');
      setCommentModalOpen(false);
      setSelectedWorkOrder(null);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  if (authLoading || workOrdersLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <p>Please log in to view work orders.</p>
        </Card>
      </div>
    );
  }

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

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Work Orders (v2 API)</h1>
        <Button color="blue">
          <HiPlus className="mr-2 h-4 w-4" />
          New Work Order
        </Button>
      </div>

      {workOrders && workOrders.length > 0 ? (
        <div className="grid gap-4">
          {workOrders.map((wo) => (
            <Card key={wo.id} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{wo.title}</h3>
                  {wo.description && (
                    <p className="text-gray-600 mb-3">{wo.description}</p>
                  )}
                  <div className="flex gap-2 mb-3">
                    <Badge color={getStatusColor(wo.status)}>{wo.status}</Badge>
                    <Badge color={getPriorityColor(wo.priority)}>{wo.priority}</Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    Created: {new Date(wo.created_at).toLocaleDateString()}
                  </div>
                  {wo.comments && wo.comments.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">Comments ({wo.comments.length}):</p>
                      <div className="space-y-1">
                        {wo.comments.map((comment) => (
                          <div key={comment.id} className="text-sm bg-gray-50 p-2 rounded">
                            <p className="font-medium">{comment.author?.full_name || comment.author?.email}</p>
                            <p>{comment.body}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(comment.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <Button
                    size="sm"
                    color="gray"
                    onClick={() => {
                      setSelectedWorkOrder(wo);
                      setCommentModalOpen(true);
                    }}
                  >
                    <HiChat className="mr-1 h-4 w-4" />
                    Add Comment
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-gray-500">No work orders found.</p>
        </Card>
      )}

      <Modal show={commentModalOpen} onClose={() => setCommentModalOpen(false)}>
        <Modal.Header>Add Comment</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Comment</label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Enter your comment..."
                rows={4}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setCommentModalOpen(false)}>
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={handleAddComment}
            disabled={!newComment.trim() || addComment.isPending}
          >
            {addComment.isPending ? 'Adding...' : 'Add Comment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

