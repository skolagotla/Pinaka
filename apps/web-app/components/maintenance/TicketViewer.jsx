/**
 * Shared Maintenance Ticket Viewer Component
 * Displays ticket details, comments, status updates, and approval workflow
 * Used by both landlord and tenant maintenance pages
 */

import { Modal, Card, Badge, Button, Textarea, Label, Alert, Divider, Tooltip, Avatar } from 'flowbite-react';
import { 
  HiX, 
  HiPaperAirplane, 
  HiCheckCircle, 
  HiXCircle,
  HiUser,
  HiDownload,
  HiInformationCircle,
} from 'react-icons/hi';
import dayjs from 'dayjs';

export default function TicketViewer({
  open,
  ticket,
  userRole,
  userName,
  userEmail,
  newComment,
  commentLoading,
  statusUpdateLoading,
  onClose,
  onCommentChange,
  onAddComment,
  onStatusChange,
  onApprove,
  onReject,
  onDownload,
}) {
  if (!ticket) return null;

  // Determine if user can edit status (only for tickets initiated by the other party)
  const canEditStatus = ticket.initiatedBy !== userRole;

  // Determine if awaiting approval
  const awaitingApproval = userRole === 'landlord' 
    ? (ticket.tenantApproved && !ticket.landlordApproved)
    : (ticket.landlordApproved && !ticket.tenantApproved);

  // Determine if ticket is completed
  const isCompleted = ticket.status === 'Completed';

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'New': 'gray',
      'Pending': 'warning',
      'In Progress': 'info',
      'Completed': 'success',
    };
    return colors[status] || 'gray';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'gray',
      'Medium': 'warning',
      'High': 'failure',
    };
    return colors[priority] || 'gray';
  };

  // Get opener name
  const openerName = ticket.initiatedBy === 'landlord'
    ? `${ticket.property?.landlord?.firstName || ''} ${ticket.property?.landlord?.lastName || ''}`.trim()
    : `${ticket.tenant?.firstName || ''} ${ticket.tenant?.lastName || ''}`.trim();

  return (
    <Modal
      show={open}
      onClose={onClose}
      size="4xl"
    >
      <Modal.Header>
        <div className="flex items-center justify-between w-full">
          <h3 className="text-xl font-semibold text-blue-600">
            Ticket# {ticket.ticketNumber || ticket.id}
          </h3>
          <span className="text-sm text-gray-500">
            Ticket Opened: {dayjs(ticket.createdAt).format('MMM D, YYYY, h:mm A')}
          </span>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          {/* Ticket Title */}
          <h4 className="text-lg font-semibold text-center">
            {ticket.title}
          </h4>

          {/* Status Bar */}
          <Card className="bg-gray-50 dark:bg-gray-800">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Opened by:</span>
                <Badge color="gray">{ticket.initiatedBy === 'landlord' ? 'Landlord' : 'Tenant'}</Badge>
                <span className="text-sm font-semibold">{openerName}</span>
              </div>
              
              <Divider orientation="vertical" className="h-6" />
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Category:</span>
                <span className="text-sm font-semibold">{ticket.category}</span>
              </div>
              
              <Divider orientation="vertical" className="h-6" />
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Priority:</span>
                <Badge color={getPriorityColor(ticket.priority)}>
                  {ticket.priority}
                </Badge>
              </div>
              
              <Divider orientation="vertical" className="h-6" />
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Status:</span>
                <Badge color={getStatusColor(ticket.status)}>
                  {ticket.status}
                </Badge>
              </div>

              {onDownload && (
                <>
                  <Divider orientation="vertical" className="h-6" />
                  <Tooltip content="Download Ticket PDF">
                    <Button
                      color="light"
                      size="sm"
                      onClick={() => onDownload(ticket.id)}
                      className="p-2"
                    >
                      <HiDownload className="h-5 w-5" />
                    </Button>
                  </Tooltip>
                </>
              )}
            </div>
          </Card>

          {/* Description */}
          <Card>
            <h5 className="font-semibold mb-2">Description</h5>
            <p className="text-gray-700 dark:text-gray-300">{ticket.description}</p>
          </Card>

          {/* Approval Section */}
          {awaitingApproval && (
            <Alert color="info" className="mb-4">
              <div className="space-y-3">
                <p className="font-semibold">
                  {userRole === 'landlord' 
                    ? "Tenant Has Marked This Case as Completed" 
                    : "Landlord Has Marked This Case as Completed"}
                </p>
                <p>Do you agree to close this ticket?</p>
                <div className="flex gap-2">
                  <Button
                    color="success"
                    onClick={onApprove}
                    disabled={statusUpdateLoading}
                    className="flex items-center gap-2"
                  >
                    <HiCheckCircle className="h-4 w-4" />
                    Yes, Close Case
                  </Button>
                  <Button
                    color="light"
                    onClick={onReject}
                    disabled={statusUpdateLoading}
                    className="flex items-center gap-2"
                  >
                    <HiXCircle className="h-4 w-4" />
                    No, Continue Work
                  </Button>
                </div>
              </div>
            </Alert>
          )}

          {/* Awaiting Other Party Approval */}
          {!isCompleted && ((userRole === 'landlord' && ticket.landlordApproved) || (userRole === 'tenant' && ticket.tenantApproved)) && (
            <Alert color="warning">
              Awaiting Approval - Waiting for {userRole === 'landlord' ? 'tenant' : 'landlord'} to approve ticket closure.
            </Alert>
          )}

          {/* Completed Message */}
          {isCompleted && (
            <Alert color="success">
              Ticket Successfully Closed - This ticket has been marked as completed by both parties.
            </Alert>
          )}

          {/* Comments/Activity */}
          <Card>
            <h5 className="font-semibold mb-4">Activity</h5>
            <div className="max-h-96 overflow-y-auto space-y-4">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((comment, index) => {
                  const isLandlord = comment.authorRole === 'landlord';
                  const isStatus = comment.isStatusUpdate;
                  
                  return (
                    <div key={comment.id || index}>
                      <div className="flex items-start gap-3">
                        <Avatar
                          placeholderInitials={comment.authorName?.[0] || 'U'}
                          className={`${
                            isLandlord ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{comment.authorName}</span>
                            <Badge color={isLandlord ? 'blue' : 'green'} size="sm">
                              {isLandlord ? 'Landlord' : 'Tenant'}
                            </Badge>
                            {isStatus && (
                              <Badge color="warning" size="sm">
                                Status Update
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            {dayjs(comment.createdAt).format('MMM D, YYYY • h:mm A')}
                          </p>
                          <div
                            className={`p-3 rounded-lg ${
                              isLandlord
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                                : 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500'
                            }`}
                          >
                            <p className="text-sm">{comment.comment}</p>
                          </div>
                        </div>
                      </div>
                      {index < ticket.comments.length - 1 && <Divider className="my-4" />}
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">No activity yet</p>
              )}
            </div>
          </Card>

          {/* Status Update Dropdown (only for tickets initiated by other party) */}
          {canEditStatus && !isCompleted && (
            <Card>
              <div className="space-y-3">
                <Label className="font-semibold">Update Status:</Label>
                <div className="flex gap-2">
                  <Button
                    color="light"
                    onClick={() => onStatusChange('Pending')}
                    disabled={ticket.status === 'Pending' || statusUpdateLoading}
                  >
                    Pending
                  </Button>
                  <Button
                    color="light"
                    onClick={() => onStatusChange('In Progress')}
                    disabled={ticket.status === 'In Progress' || statusUpdateLoading}
                  >
                    In Progress
                  </Button>
                  <Button
                    color="blue"
                    onClick={() => onStatusChange('Mark as Completed')}
                    disabled={statusUpdateLoading}
                  >
                    Mark as Completed
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Comment Input (only if not completed) */}
          {!isCompleted && (
            <Card>
              <div className="space-y-3">
                <Label className="font-semibold">Add Comment:</Label>
                <Textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => onCommentChange(e.target.value)}
                  placeholder="Type your message..."
                  disabled={commentLoading}
                />
                <div className="flex justify-end">
                  <Button
                    color="blue"
                    onClick={onAddComment}
                    disabled={commentLoading || !newComment.trim()}
                    className="flex items-center gap-2"
                  >
                    {commentLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <HiPaperAirplane className="h-4 w-4" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}
