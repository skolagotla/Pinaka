/**
 * Shared Ticket View Modal Component
 * Reuses the exact same view from MaintenanceClient
 * Can be used in Financials page or anywhere else to view tickets
 */

"use client";
import { Modal, Card, Badge, Button, Textarea, Select, Tooltip, Spinner, Alert, Table } from 'flowbite-react';
import { 
  HiX, 
  HiPaperAirplane, 
  HiCheck, 
  HiXCircle,
  HiUser,
  HiDownload,
  HiCog,
  HiClock,
  HiCurrencyDollar,
  HiPlus,
  HiPaperClip,
  HiEye,
  HiCloudUpload
} from 'react-icons/hi';
import dayjs from 'dayjs';
import { formatDateDisplay, formatDateTimeDisplay } from '@/lib/utils/safe-date-formatter';
import { useState, useEffect } from 'react';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useExpenses, useUpdateExpense } from '@/lib/hooks/useV2Data';
import FlowbiteTable from './FlowbiteTable';
import SimpleTimeline from './SimpleTimeline';
import PDFViewerModal from './PDFViewerModal';
import { notify } from '@/lib/utils/notification-helper';

// Helper function to get priority color (same as MaintenanceClient)
function getPriorityColor(priority, userRole = 'landlord') {
  if (userRole === 'landlord') {
    switch (priority) {
      case 'Urgent': return 'failure';
      case 'High': return 'warning';
      case 'Normal': return 'info';
      case 'Low': return 'gray';
      default: return 'gray';
    }
  } else {
    switch (priority) {
      case 'Urgent': return 'failure';
      case 'High': return 'warning';
      case 'Normal': return 'info';
      case 'Low': return 'info';
      default: return 'info';
    }
  }
}

// Helper function to render comment text with styled status (same as MaintenanceClient)
function renderCommentText(text) {
  const statusColors = {
    'Pending': '#f59e0b', // Orange
    'In Progress': '#3b82f6', // Blue
    'Closed': '#10b981', // Green
    'Close': '#10b981', // Green (for "Close" word)
    'New': '#6b7280'
  };

  // Check for full phrases first
  if (text.includes('Ticket Acknowledged: Pending')) {
    const parts = text.split('Ticket Acknowledged: Pending');
    return (
      <span>
        {parts[0]}
        Ticket Acknowledged: <span className="font-bold" style={{ color: statusColors['Pending'] }}>Pending</span>
        {parts[1]}
      </span>
    );
  }
  if (text.includes('In Progress')) {
    const parts = text.split('In Progress');
    return (
      <span>
        {parts[0]}
        <span className="font-bold" style={{ color: statusColors['In Progress'] }}>In Progress</span>
        {parts[1]}
      </span>
    );
  }
  if (text.includes('Status: Pending')) {
    const parts = text.split('Status: Pending');
    return (
      <span>
        {parts[0]}
        Status: <span className="font-bold" style={{ color: statusColors['Pending'] }}>Pending</span>
        {parts[1]}
      </span>
    );
  }
  if (text.includes('Status: In Progress')) {
    const parts = text.split('Status: In Progress');
    return (
      <span>
        {parts[0]}
        Status: <span className="font-bold" style={{ color: statusColors['In Progress'] }}>In Progress</span>
        {parts[1]}
      </span>
    );
  }
  if (text.includes('Status: Closed') || text.includes('Status: Close')) {
    const parts = text.split(/Status: (Closed|Close)/);
    return (
      <span>
        {parts[0]}
        Status: <span className="font-bold" style={{ color: statusColors['Closed'] }}>{parts[1]}</span>
        {parts[2]}
      </span>
    );
  }
  if (text.includes('Closed') || text.includes('Close')) {
    const parts = text.split(/(Closed|Close)/);
    return (
      <span>
        {parts[0]}
        <span className="font-bold" style={{ color: statusColors['Closed'] }}>{parts[1]}</span>
        {parts[2]}
      </span>
    );
  }
  return <span>{text}</span>;
}

// Simple Star Rating Component (replaces Ant Design Rate)
function StarRating({ value, max = 5, size = 'sm' }) {
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.5;
  const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: fullStars }).map((_, i) => (
        <span key={i} className="text-yellow-400">★</span>
      ))}
      {hasHalfStar && <span className="text-yellow-400">☆</span>}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <span key={i} className="text-gray-300">★</span>
      ))}
      <span className="ml-2 text-sm text-gray-600">{value.toFixed(1)}</span>
    </div>
  );
}

export default function TicketViewModal({
  ticket,
  open,
  onClose,
  userRole = 'landlord',
  userName,
  userEmail,
  user,
  loading = false,
  readOnly = false, // If true, hides action buttons and comment input
  onAddComment,
  onStatusChange,
  onApprove,
  onReject,
  onDownload,
  newComment = '',
  onCommentChange,
  commentLoading = false,
  statusUpdateLoading = false,
}) {
  const [expenses, setExpenses] = useState([]);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [invoiceUploadModalOpen, setInvoiceUploadModalOpen] = useState(false);
  const [uploadingExpenseId, setUploadingExpenseId] = useState(null);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const [invoiceViewModalOpen, setInvoiceViewModalOpen] = useState(false);
  const [viewingInvoiceUrl, setViewingInvoiceUrl] = useState(null);

  // Fetch expenses when ticket is opened (landlord only)
  useEffect(() => {
    if (userRole === 'landlord' && ticket && open) {
      fetchExpenses(ticket.id);
    }
  }, [ticket?.id, open, userRole]);

  async function fetchExpenses(ticketId) {
    try {
      setExpenseLoading(true);
      // Use v2Api for expenses filtered by maintenance request
      const { v2Api } = await import('@/lib/api/v2-client');
      const response = await v2Api.expenses.list({ 
        maintenanceRequestId: ticketId,
        page: 1,
        limit: 1000,
      });
      const expensesArray = response.data?.data || response.data || [];
      console.log('[TicketViewModal] Fetched expenses:', expensesArray.length, 'expenses');
      if (expensesArray.length > 0) {
        console.log('[TicketViewModal] First expense receiptUrl:', expensesArray[0].receiptUrl);
      }
      setExpenses(expensesArray);
    } catch (error) {
      console.error('[TicketViewModal] Error fetching expenses:', error);
      setExpenses([]);
    } finally {
      setExpenseLoading(false);
    }
  }

  // Handle invoice upload for existing expense
  async function handleUploadInvoice() {
    if (!uploadingExpenseId || !invoiceFile) {
      notify.warning('Please select an invoice file');
      return;
    }

    setUploadingInvoice(true);
    try {
      // First upload the file
      const formData = new FormData();
      formData.append('invoice', invoiceFile);
      
      // Use v1 API for expense invoice upload
      const uploadResponse = await fetch(
        '/api/v1/expenses/upload-invoice',
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );
      
      if (!uploadResponse.ok) {
        const error = await uploadResponse.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'Failed to upload invoice');
      }
      
      const uploadData = await uploadResponse.json();
      if (!uploadData.success || !uploadData.receiptUrl) {
        throw new Error('Failed to upload invoice');
      }

      // Then update the expense with the receiptUrl using v2Api
      const { v2Api } = await import('@/lib/api/v2-client');
      const updateData = await v2Api.updateExpense(uploadingExpenseId, { 
        receipt_url: uploadData.receiptUrl 
      });
      if (updateData.success && updateData.expense) {
        // Update local expenses state
        setExpenses(prevExpenses => 
          prevExpenses.map(exp => 
            exp.id === uploadingExpenseId 
              ? { ...exp, receiptUrl: uploadData.receiptUrl }
              : exp
          )
        );
        notify.success('Invoice uploaded successfully');
        setInvoiceUploadModalOpen(false);
        setInvoiceFile(null);
        setUploadingExpenseId(null);
      } else {
        throw new Error('Failed to update expense');
      }
    } catch (error) {
      console.error('[TicketViewModal] Invoice upload error:', error);
      notify.error('Failed to upload invoice');
    } finally {
      setUploadingInvoice(false);
    }
  }

  if (!ticket) return null;

  const handleDownload = onDownload || (() => {
    window.open(`/api/v1/maintenance/${ticket.id}/download-pdf`, '_blank');
  });

  // Build timeline items
  const timelineItems = [
    {
      color: 'blue',
      children: (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">Ticket Created</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatDateTimeDisplay(ticket.createdAt, ' • ')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Status: {ticket.status}
          </p>
        </div>
      )
    },
    ...(ticket.comments || []).map((comment) => {
      const isStatusUpdate = comment.comment.includes('Status:') || 
                            comment.comment.includes('Ticket Acknowledged') ||
                            comment.comment.includes('In Progress') ||
                            comment.comment.includes('assigned to');
      return {
        color: isStatusUpdate ? 'green' : 'gray',
        children: (
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{comment.authorName || 'Unknown'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatDateTimeDisplay(comment.createdAt, ' • ')}
            </p>
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
              {renderCommentText(comment.comment)}
            </div>
          </div>
        )
      };
    }),
    ...(ticket.status === 'Closed' && ticket.landlordApproved && ticket.tenantApproved ? [{
      color: 'green',
      children: (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">Ticket Closed</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Approved by both parties
          </p>
        </div>
      )
    }] : [])
  ];

  return (
    <>
    <Modal show={open} onClose={onClose} size="7xl">
      <Modal.Header>
        <div className="flex items-center justify-between w-full pr-10">
          <span className="text-xs font-mono text-gray-500">
            Ticket# {ticket?.ticketNumber || ticket?.id}
          </span>
          <h3 className="text-lg font-semibold flex-1 text-center px-6">
            {ticket?.title}
          </h3>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            Ticket Opened: {ticket?.createdAt ? formatDateTimeDisplay(ticket.createdAt, ', ') : ''}
          </span>
        </div>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-12">
            <Spinner size="xl" />
            <p className="mt-4 text-gray-600">Loading ticket details...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status Bar */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Opened by:</span>
                  <span className="font-semibold text-sm">
                    {userRole === 'landlord' ? (
                      ticket.initiatedBy === 'landlord'
                        ? `${userName || 'Landlord'}`
                        : (ticket.tenant 
                          ? `${ticket.tenant.firstName} ${ticket.tenant.lastName}`
                          : 'Unknown Tenant')
                    ) : (
                      ticket.initiatedBy === 'landlord' 
                        ? (ticket.property?.landlord 
                          ? `${ticket.property.landlord.firstName} ${ticket.property.landlord.lastName}`
                          : 'Landlord')
                        : (user ? `${user.firstName} ${user.lastName}` : 'Tenant')
                    )}
                  </span>
                  <Badge color="gray" size="sm">
                    {ticket.initiatedBy === 'landlord' ? 'Landlord' : 'Tenant'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Category:</span>
                  <span className="font-semibold text-sm">{ticket.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Priority:</span>
                  <Badge color={getPriorityColor(ticket.priority, userRole)} size="sm">
                    {ticket.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Status:</span>
                  {ticket.status === 'Closed' && 
                   ticket.landlordApproved && 
                   ticket.tenantApproved ? (
                    <Badge color="success" size="sm">Closed</Badge>
                  ) : ticket.status === 'Closed' && 
                      !(ticket.landlordApproved && ticket.tenantApproved) ? (
                    <Badge color="info" size="sm">In Progress</Badge>
                  ) : readOnly ? (
                    <Badge 
                      color={
                        ticket.status === 'In Progress' ? 'info' : 
                        ticket.status === 'Pending' ? 'warning' : 
                        'gray'
                      } 
                      size="sm"
                    >
                      {ticket.status}
                    </Badge>
                  ) : (
                    <Select
                      value={ticket.status === 'Closed' && !(ticket.landlordApproved && ticket.tenantApproved) ? 'In Progress' : ticket.status}
                      onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
                      className="min-w-[140px]"
                      disabled={
                        ticket.status === 'Closed' && 
                        ticket.landlordApproved && 
                        ticket.tenantApproved
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Close</option>
                    </Select>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2">
                  {/* Approve/Reject buttons */}
                  {!readOnly && ticket.status === 'Closed' && 
                   !(ticket.landlordApproved && ticket.tenantApproved) && 
                   (() => {
                     const awaitingMyApproval = (userRole === 'landlord' && ticket.tenantApproved && !ticket.landlordApproved) ||
                                                 (userRole === 'tenant' && ticket.landlordApproved && !ticket.tenantApproved);
                     return awaitingMyApproval;
                   })() && (
                    <>
                      <Tooltip content="Approve & Close">
                        <Button 
                          color="success"
                          size="sm"
                          onClick={() => onApprove && onApprove(true)}
                          disabled={statusUpdateLoading}
                          className="flex items-center justify-center w-10 h-10 rounded-full"
                        >
                          <HiCheck className="h-5 w-5" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Reject & Continue Work">
                        <Button 
                          color="failure"
                          size="sm"
                          onClick={() => onReject && onReject(false)}
                          disabled={statusUpdateLoading}
                          className="flex items-center justify-center w-10 h-10 rounded-full"
                        >
                          <HiX className="h-5 w-5" />
                        </Button>
                      </Tooltip>
                    </>
                  )}
                  <Tooltip content="Download PDF">
                    <Button 
                      color="blue"
                      size="sm"
                      onClick={handleDownload}
                      className="flex items-center justify-center w-10 h-10 rounded-full"
                    >
                      <HiDownload className="h-5 w-5" />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Description */}
            <Card>
              <h5 className="text-lg font-semibold mb-2">Description</h5>
              <p className="text-gray-700 dark:text-gray-300">
                {ticket.description || 'No description provided'}
              </p>
            </Card>

            {/* Select Vendor Button (Landlord Only) */}
            {userRole === 'landlord' && ticket.category && !ticket.assignedToVendorId && (
              <Card>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HiCog className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">Assign Vendor</span>
                    <Badge color="info" size="sm">{ticket.category}</Badge>
                  </div>
                  {!readOnly ? (
                    <Button
                      color="blue"
                      onClick={() => {
                        window.location.href = `/operations?ticketId=${ticket.id}&tab=maintenance`;
                      }}
                      className="flex items-center gap-2"
                    >
                      <HiCog className="h-4 w-4" />
                      Select Vendor
                    </Button>
                  ) : (
                    <span className="text-sm text-gray-500">
                      Go to Maintenance page to assign vendor
                    </span>
                  )}
                </div>
              </Card>
            )}

            {/* Vendor Info Card (Tenant View) */}
            {userRole === 'tenant' && ticket.assignedToVendorId && ticket.assignedToVendor && (
              <Card className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center gap-2 mb-4">
                  <HiWrench className="h-5 w-5 text-blue-600" />
                  <h5 className="text-lg font-semibold text-blue-600">Assigned Contractor</h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Business Name:</p>
                      <p className="font-semibold text-sm">
                        {ticket.assignedToVendor.businessName || ticket.assignedToVendor.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Contact Person:</p>
                      <p className="text-sm">{ticket.assignedToVendor.name}</p>
                    </div>
                    {ticket.assignedToVendor.rating && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Rating:</p>
                        <StarRating value={ticket.assignedToVendor.rating} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {ticket.assignedToVendor.phone && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Phone:</p>
                        <p className="font-semibold text-sm text-blue-600">
                          {ticket.assignedToVendor.phone}
                        </p>
                      </div>
                    )}
                    {ticket.assignedToVendor.email && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Email:</p>
                        <p className="font-semibold text-sm text-blue-600">
                          {ticket.assignedToVendor.email}
                        </p>
                      </div>
                    )}
                    {ticket.assignedToVendor.hourlyRate && ticket.assignedToVendor.hourlyRate > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Hourly Rate:</p>
                        <p className="font-semibold text-sm">
                          ${ticket.assignedToVendor.hourlyRate}/hr
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <Alert color="info" className="mt-4">
                  <p className="text-sm">Please contact the contractor to schedule an appointment</p>
                </Alert>
              </Card>
            )}

            {/* Timeline View (Tenant) */}
            {userRole === 'tenant' && (
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <HiClock className="h-5 w-5" />
                  <h5 className="text-lg font-semibold">Timeline</h5>
                </div>
                <SimpleTimeline items={timelineItems} />
              </Card>
            )}

            {/* Comments Section */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <h5 className="text-lg font-semibold">Activity</h5>
                <Badge color="info">{ticket.comments?.length || 0}</Badge>
              </div>
              <div className="max-h-[350px] overflow-y-auto mb-4">
                {ticket.comments && ticket.comments.length > 0 ? (
                  <div className="space-y-4">
                    {[...ticket.comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((comment, idx) => {
                      const isCurrentUser = userRole === 'landlord'
                        ? comment.authorEmail === userEmail
                        : comment.authorEmail === user?.email;
                      
                      return (
                        <div key={idx} className={idx < ticket.comments.length - 1 ? 'pb-4 border-b border-gray-200 dark:border-gray-700' : ''}>
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                              isCurrentUser 
                                ? (userRole === 'landlord' ? 'bg-blue-500' : 'bg-gray-500')
                                : (userRole === 'landlord' ? 'bg-gray-500' : 'bg-blue-500')
                            }`}>
                              <HiUser className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                  {comment.authorName || 'Unknown'}
                                </span>
                                <Badge 
                                  color={isCurrentUser ? (userRole === 'landlord' ? 'info' : 'gray') : (userRole === 'landlord' ? 'gray' : 'info')} 
                                  size="sm"
                                >
                                  {isCurrentUser ? (userRole === 'landlord' ? 'Landlord' : 'Tenant') : (userRole === 'landlord' ? 'Tenant' : 'Landlord')}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {formatDateTimeDisplay(comment.createdAt, ' • ')}
                                </span>
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                                {renderCommentText(comment.comment)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <HiPaperClip className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No activity yet</p>
                  </div>
                )}
              </div>

              {/* Comment Input Section */}
              {!readOnly && !(ticket.status === 'Closed' && ticket.landlordApproved && ticket.tenantApproved) && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <Textarea
                      rows={2}
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => onCommentChange && onCommentChange(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      color="blue"
                      onClick={() => onAddComment && onAddComment()}
                      disabled={commentLoading || !newComment.trim()}
                      className="flex items-center gap-2"
                    >
                      {commentLoading ? (
                        <Spinner size="sm" />
                      ) : (
                        <>
                          <HiPaperAirplane className="h-4 w-4" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Expense Tracking Section (Landlord Only) */}
            {userRole === 'landlord' && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <HiCurrencyDollar className="h-5 w-5" />
                    <h5 className="text-lg font-semibold">Expenses</h5>
                    <Badge color="info">{expenses.length}</Badge>
                    <span className="text-sm text-gray-500">
                      Total: ${expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                    </span>
                  </div>
                  {!readOnly && (
                    <Button
                      color="blue"
                      size="sm"
                      onClick={() => {
                        window.location.href = `/operations?tab=maintenance&ticketId=${ticket.id}`;
                      }}
                      className="flex items-center gap-2"
                    >
                      <HiPlus className="h-4 w-4" />
                      Add Expense
                    </Button>
                  )}
                </div>
                {expenseLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="xl" />
                  </div>
                ) : expenses.length > 0 ? (
                  <FlowbiteTable
                    dataSource={expenses}
                    rowKey="id"
                    pagination={false}
                    columns={[
                      {
                        title: 'Date',
                        dataIndex: 'date',
                        key: 'date',
                        render: (date) => formatDateDisplay(date),
                        width: 120
                      },
                      {
                        title: 'Description',
                        dataIndex: 'description',
                        key: 'description'
                      },
                      {
                        title: 'Paid To',
                        dataIndex: 'paidTo',
                        key: 'paidTo',
                        width: 150
                      },
                      {
                        title: 'Amount',
                        dataIndex: 'amount',
                        key: 'amount',
                        render: (amount) => (
                          <span className="font-semibold text-red-600">
                            ${amount.toFixed(2)}
                          </span>
                        ),
                        width: 100,
                        align: 'right'
                      },
                      {
                        title: 'Payment Method',
                        dataIndex: 'paymentMethod',
                        key: 'paymentMethod',
                        width: 120
                      },
                      {
                        title: 'Invoice',
                        key: 'invoice',
                        width: 150,
                        align: 'center',
                        render: (_, record) => {
                          if (!record.receiptUrl) {
                            if (!readOnly && userRole === 'landlord') {
                              return (
                                <Button
                                  color="light"
                                  size="sm"
                                  onClick={() => {
                                    setUploadingExpenseId(record.id);
                                    setInvoiceFile(null);
                                    setInvoiceUploadModalOpen(true);
                                  }}
                                  className="flex items-center gap-2"
                                >
                                  <HiCloudUpload className="h-4 w-4" />
                                  Upload
                                </Button>
                              );
                            }
                            return <span className="text-gray-400">—</span>;
                          }
                          return (
                            <div className="flex items-center gap-2 justify-center">
                              <Tooltip content="View Invoice">
                                <Button
                                  color="light"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setViewingInvoiceUrl(record.receiptUrl);
                                    setInvoiceViewModalOpen(true);
                                  }}
                                >
                                  <HiEye className="h-4 w-4" />
                                </Button>
                              </Tooltip>
                              <Tooltip content="Download Invoice">
                                <Button
                                  color="light"
                                  size="sm"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = record.receiptUrl;
                                    link.download = `invoice_${record.id}.pdf`;
                                    link.target = '_blank';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                >
                                  <HiDownload className="h-4 w-4" />
                                </Button>
                              </Tooltip>
                            </div>
                          );
                        }
                      }
                    ]}
                  />
                ) : (
                  <div className="text-center py-8">
                    <HiCurrencyDollar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No expenses recorded yet</p>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}
      </Modal.Body>
    </Modal>

    {/* Invoice Upload Modal */}
    <Modal
      show={invoiceUploadModalOpen}
      onClose={() => {
        setInvoiceUploadModalOpen(false);
        setInvoiceFile(null);
        setUploadingExpenseId(null);
      }}
      size="md"
    >
      <Modal.Header>Upload Invoice</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white mb-1">Select Invoice File</p>
            <p className="text-xs text-gray-500">
              Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
            </p>
          </div>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          color="gray"
          onClick={() => {
            setInvoiceUploadModalOpen(false);
            setInvoiceFile(null);
            setUploadingExpenseId(null);
          }}
        >
          Cancel
        </Button>
        <Button
          color="blue"
          onClick={handleUploadInvoice}
          disabled={uploadingInvoice || !invoiceFile}
          className="flex items-center gap-2"
        >
          {uploadingInvoice ? (
            <>
              <Spinner size="sm" />
              Uploading...
            </>
          ) : (
            <>
              <HiCloudUpload className="h-4 w-4" />
              Upload
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>

    {/* Invoice View Modal */}
    {viewingInvoiceUrl && (
      <PDFViewerModal
        open={invoiceViewModalOpen}
        title="Invoice"
        pdfUrl={viewingInvoiceUrl}
        onClose={() => {
          setInvoiceViewModalOpen(false);
          setViewingInvoiceUrl(null);
        }}
        width={1200}
        height={800}
      />
    )}
    </>
  );
}
