/**
 * Shared Ticket View Modal Component
 * Reuses the exact same view from MaintenanceClient
 * Can be used in Financials page or anywhere else to view tickets
 */

"use client";
import { Modal, Card, Row, Col, Badge, Tag, Button, Input, Select, Space, Divider, Tooltip, Avatar, Typography, Spin, Empty, Alert, Timeline, Rate, Table, Upload, message } from 'antd';
import { 
  CloseOutlined, 
  SendOutlined, 
  CheckOutlined, 
  CloseCircleOutlined,
  UserOutlined,
  DownloadOutlined,
  ToolOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  PlusOutlined,
  PaperClipOutlined,
  EyeOutlined,
  UploadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatDateDisplay, formatDateTimeDisplay } from '@/lib/utils/safe-date-formatter';
import { useState, useEffect } from 'react';

const { TextArea } = Input;
const { Text } = Typography;

// Helper function to get priority color (same as MaintenanceClient)
function getPriorityColor(priority, userRole = 'landlord') {
  if (userRole === 'landlord') {
    switch (priority) {
      case 'Urgent': return 'red';
      case 'High': return 'orange';
      case 'Normal': return 'blue';
      case 'Low': return 'default';
      default: return 'default';
    }
  } else {
    switch (priority) {
      case 'Urgent': return '#ff4d4f';
      case 'High': return '#fa8c16';
      case 'Normal': return '#1890ff';
      case 'Low': return '#1890ff';
      default: return '#1890ff';
    }
  }
}

// Helper function to render comment text with styled status (same as MaintenanceClient)
function renderCommentText(text) {
  const statusColors = {
    'Pending': '#fa8c16', // Orange
    'In Progress': '#1890ff', // Blue
    'Closed': '#52c41a', // Green
    'Close': '#52c41a', // Green (for "Close" word)
    'New': '#8c8c8c'
  };

  // Check for full phrases first
  if (text.includes('Ticket Acknowledged: Pending')) {
    const parts = text.split('Ticket Acknowledged: Pending');
    return (
      <Text>
        {parts[0]}
        Ticket Acknowledged: <Text strong style={{ color: statusColors['Pending'], fontWeight: 700 }}>Pending</Text>
        {parts[1]}
      </Text>
    );
  }
  if (text.includes('In Progress')) {
    const parts = text.split('In Progress');
    return (
      <Text>
        {parts[0]}
        <Text strong style={{ color: statusColors['In Progress'], fontWeight: 700 }}>In Progress</Text>
        {parts[1]}
      </Text>
    );
  }
  if (text.includes('Status: Pending')) {
    const parts = text.split('Status: Pending');
    return (
      <Text>
        {parts[0]}
        Status: <Text strong style={{ color: statusColors['Pending'], fontWeight: 700 }}>Pending</Text>
        {parts[1]}
      </Text>
    );
  }
  if (text.includes('Status: In Progress')) {
    const parts = text.split('Status: In Progress');
    return (
      <Text>
        {parts[0]}
        Status: <Text strong style={{ color: statusColors['In Progress'], fontWeight: 700 }}>In Progress</Text>
        {parts[1]}
      </Text>
    );
  }
  if (text.includes('Status: Closed') || text.includes('Status: Close')) {
    const parts = text.split(/Status: (Closed|Close)/);
    return (
      <Text>
        {parts[0]}
        Status: <Text strong style={{ color: statusColors['Closed'], fontWeight: 700 }}>{parts[1]}</Text>
        {parts[2]}
      </Text>
    );
  }
  if (text.includes('Closed') || text.includes('Close')) {
    const parts = text.split(/(Closed|Close)/);
    return (
      <Text>
        {parts[0]}
        <Text strong style={{ color: statusColors['Closed'], fontWeight: 700 }}>{parts[1]}</Text>
        {parts[2]}
      </Text>
    );
  }
  return <Text>{text}</Text>;
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
  const [invoiceFileList, setInvoiceFileList] = useState([]);
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
      // Use v1Api for expenses filtered by maintenance request
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.expenses.list({ 
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
    if (!uploadingExpenseId || !invoiceFileList || invoiceFileList.length === 0 || !invoiceFileList[0].originFileObj) {
      message.warning('Please select an invoice file');
      return;
    }

    setUploadingInvoice(true);
    try {
      // First upload the file
      const formData = new FormData();
      formData.append('invoice', invoiceFileList[0].originFileObj);
      
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

      // Then update the expense with the receiptUrl using v1Api
      const { v1Api } = await import('@/lib/api/v1-client');
      const updateResponse = await v1Api.expenses.update(uploadingExpenseId, { 
        receiptUrl: uploadData.receiptUrl 
      });
      const updateData = updateResponse.data || updateResponse;
      if (updateData.success && updateData.expense) {
        // Update local expenses state
        setExpenses(prevExpenses => 
          prevExpenses.map(exp => 
            exp.id === uploadingExpenseId 
              ? { ...exp, receiptUrl: uploadData.receiptUrl }
              : exp
          )
        );
        message.success('Invoice uploaded successfully');
        setInvoiceUploadModalOpen(false);
        setInvoiceFileList([]);
        setUploadingExpenseId(null);
      } else {
        throw new Error('Failed to update expense');
      }
    } catch (error) {
      console.error('[TicketViewModal] Invoice upload error:', error);
      message.error('Failed to upload invoice');
    } finally {
      setUploadingInvoice(false);
    }
  }

  if (!ticket) return null;

  const handleDownload = onDownload || (() => {
    window.open(`/api/v1/maintenance/${ticket.id}/download-pdf`, '_blank');
  });

  return (
    <>
    <Modal
      title={
        <Row align="middle" justify="space-between" style={{ padding: '8px 0', paddingRight: '40px' }}>
          <Col>
            <Text type="secondary" style={{ fontSize: 13, fontFamily: 'monospace' }}>
              Ticket# {ticket?.ticketNumber || ticket?.id}
            </Text>
          </Col>
          <Col flex="auto" style={{ textAlign: 'center', padding: '0 24px' }}>
            <Text strong style={{ fontSize: 16 }}>
              {ticket?.title}
            </Text>
          </Col>
          <Col>
            <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
              Ticket Opened : {ticket?.createdAt ? formatDateTimeDisplay(ticket.createdAt, ', ') : ''}
            </Text>
          </Col>
        </Row>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      destroyOnClose
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Loading ticket details...</Text>
          </div>
        </div>
      ) : (
        <div>
          {/* Status Bar */}
          <div style={{ 
            background: '#fafafa', 
            padding: '12px 16px', 
            marginBottom: 24,
            borderRadius: 8,
            border: '1px solid #f0f0f0'
          }}>
            <Row gutter={24} align="middle">
              <Col>
                <Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>Opened by :</Text>
                  <Text strong>
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
                  </Text>
                  <Tag color="default" style={{ margin: 0, fontSize: 11 }}>
                    {ticket.initiatedBy === 'landlord' ? 'Landlord' : 'Tenant'}
                  </Tag>
                </Space>
              </Col>
              <Col>
                <Space size={4}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Category:</Text>
                  <Text strong>{ticket.category}</Text>
                </Space>
              </Col>
              <Col>
                <Space size={4}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Priority:</Text>
                  <Tag color={getPriorityColor(ticket.priority, userRole)} style={{ margin: 0 }}>
                    {ticket.priority}
                  </Tag>
                </Space>
              </Col>
              <Col>
                <Space size={4}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Status:</Text>
                  {ticket.status === 'Closed' && 
                   ticket.landlordApproved && 
                   ticket.tenantApproved ? (
                    <Badge 
                      status="success"
                      text="Closed"
                    />
                  ) : ticket.status === 'Closed' && 
                      !(ticket.landlordApproved && ticket.tenantApproved) ? (
                    <Badge 
                      status="processing"
                      text="In Progress"
                    />
                  ) : readOnly ? (
                    <Badge 
                      status={ticket.status === 'In Progress' ? 'processing' : ticket.status === 'Pending' ? 'warning' : 'default'}
                      text={ticket.status}
                    />
                  ) : (
                    <Select
                      value={ticket.status === 'Closed' && !(ticket.landlordApproved && ticket.tenantApproved) ? 'In Progress' : ticket.status}
                      onChange={onStatusChange}
                      style={{ minWidth: 140 }}
                      size="small"
                      disabled={
                        ticket.status === 'Closed' && 
                        ticket.landlordApproved && 
                        ticket.tenantApproved
                      }
                    >
                      <Select.Option value="Pending">Pending</Select.Option>
                      <Select.Option value="In Progress">In Progress</Select.Option>
                      <Select.Option value="Closed">Close</Select.Option>
                    </Select>
                  )}
                </Space>
              </Col>
              <Col flex="auto" style={{ textAlign: 'right' }}>
                <Space size="small">
                  {/* Approve/Reject buttons - show when other party has requested closure */}
                  {!readOnly && ticket.status === 'Closed' && 
                   !(ticket.landlordApproved && ticket.tenantApproved) && 
                   (() => {
                     const awaitingMyApproval = (userRole === 'landlord' && ticket.tenantApproved && !ticket.landlordApproved) ||
                                                 (userRole === 'tenant' && ticket.landlordApproved && !ticket.tenantApproved);
                     return awaitingMyApproval;
                   })() && (
                    <>
                      <Tooltip title="Approve & Close">
                        <Button 
                          type="primary" 
                          icon={<CheckOutlined />}
                          shape="circle"
                          onClick={() => onApprove && onApprove(true)}
                          loading={statusUpdateLoading}
                          style={{ 
                            background: '#52c41a', 
                            borderColor: '#52c41a'
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="Reject & Continue Work">
                        <Button 
                          danger
                          icon={<CloseOutlined />}
                          shape="circle"
                          onClick={() => onReject && onReject(false)}
                          loading={statusUpdateLoading}
                        />
                      </Tooltip>
                    </>
                  )}
                  <Tooltip title="Download PDF">
                    <Button 
                      type="primary" 
                      icon={<DownloadOutlined />}
                      shape="circle"
                      onClick={handleDownload}
                    />
                  </Tooltip>
                </Space>
              </Col>
            </Row>
          </div>

          {/* Description */}
          <Card size="small" title="Description" style={{ marginBottom: 16 }}>
            <Text>{ticket.description || 'No description provided'}</Text>
          </Card>

          {/* Select Vendor Button (Landlord Only) */}
          {userRole === 'landlord' && ticket.category && !ticket.assignedToVendorId && (
            <Card 
              size="small" 
              style={{ marginBottom: 16 }}
              bodyStyle={{ padding: '12px' }}
            >
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <ToolOutlined />
                  <Text strong>Assign Vendor</Text>
                  <Tag color="blue" size="small">
                    {ticket.category}
                  </Tag>
                </Space>
                {!readOnly ? (
                  <Button
                    type="primary"
                    icon={<ToolOutlined />}
                    onClick={() => {
                      // In read-only mode, this won't be called, but we can navigate to maintenance page
                      if (readOnly) {
                        window.location.href = `/operations?ticketId=${ticket.id}&tab=maintenance`;
                      }
                    }}
                  >
                    Select Vendor
                  </Button>
                ) : (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Go to Maintenance page to assign vendor
                  </Text>
                )}
              </Space>
            </Card>
          )}

          {/* Vendor Info Card (Tenant View) */}
          {userRole === 'tenant' && ticket.assignedToVendorId && ticket.assignedToVendor && (
            <Card 
              size="small" 
              style={{ marginBottom: 16, border: '2px solid #1890ff', background: '#f0f7ff' }}
              title={
                <Space>
                  <ToolOutlined style={{ color: '#1890ff' }} />
                  <Text strong style={{ color: '#1890ff' }}>Assigned Contractor</Text>
                </Space>
              }
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Space direction="vertical" size={8}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>Business Name:</Text>
                      <br />
                      <Text strong style={{ fontSize: 14 }}>
                        {ticket.assignedToVendor.businessName || ticket.assignedToVendor.name}
                      </Text>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>Contact Person:</Text>
                      <br />
                      <Text>{ticket.assignedToVendor.name}</Text>
                    </div>
                    {ticket.assignedToVendor.rating && (
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Rating:</Text>
                        <br />
                        <Rate disabled value={ticket.assignedToVendor.rating} style={{ fontSize: 14 }} />
                        <Text style={{ marginLeft: 8 }}>{ticket.assignedToVendor.rating.toFixed(1)}</Text>
                      </div>
                    )}
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" size={8}>
                    {ticket.assignedToVendor.phone && (
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Phone:</Text>
                        <br />
                        <Text strong style={{ fontSize: 14, color: '#1890ff' }}>
                          {ticket.assignedToVendor.phone}
                        </Text>
                      </div>
                    )}
                    {ticket.assignedToVendor.email && (
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Email:</Text>
                        <br />
                        <Text strong style={{ fontSize: 14, color: '#1890ff' }}>
                          {ticket.assignedToVendor.email}
                        </Text>
                      </div>
                    )}
                    {ticket.assignedToVendor.hourlyRate && ticket.assignedToVendor.hourlyRate > 0 && (
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Hourly Rate:</Text>
                        <br />
                        <Text strong style={{ fontSize: 14 }}>
                          ${ticket.assignedToVendor.hourlyRate}/hr
                        </Text>
                      </div>
                    )}
                  </Space>
                </Col>
              </Row>
              <Alert
                message="Please contact the contractor to schedule an appointment"
                type="info"
                showIcon
                style={{ marginTop: 12 }}
              />
            </Card>
          )}

          {/* Timeline View (Tenant) */}
          {userRole === 'tenant' && (
            <Card 
              size="small" 
              title={
                <Space>
                  <ClockCircleOutlined />
                  <Text strong>Timeline</Text>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Timeline
                items={[
                  {
                    color: 'blue',
                    children: (
                      <div>
                        <Text strong>Ticket Created</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatDateTimeDisplay(ticket.createdAt, ' • ')}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Status: {ticket.status}
                        </Text>
                      </div>
                    )
                  },
                  ...(ticket.comments || []).map((comment, idx) => {
                    const isStatusUpdate = comment.comment.includes('Status:') || 
                                          comment.comment.includes('Ticket Acknowledged') ||
                                          comment.comment.includes('In Progress') ||
                                          comment.comment.includes('assigned to');
                    return {
                      color: isStatusUpdate ? 'green' : 'gray',
                      children: (
                        <div>
                          <Text strong>{comment.authorName || 'Unknown'}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatDateTimeDisplay(comment.createdAt, ' • ')}
                          </Text>
                          <br />
                          <div style={{ 
                            marginTop: 4,
                            padding: '8px 12px',
                            background: '#fafafa',
                            borderRadius: 4,
                            fontSize: 13
                          }}>
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
                        <Text strong>Ticket Closed</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Approved by both parties
                        </Text>
                      </div>
                    )
                  }] : [])
                ]}
              />
            </Card>
          )}

          {/* Comments Section */}
          <Card 
            size="small" 
            title={
              <Space>
                <Text strong>Activity</Text>
                <Badge 
                  count={ticket.comments?.length || 0} 
                  showZero 
                  style={{ backgroundColor: '#1890ff' }}
                />
              </Space>
            }
          >
            <div style={{ 
              maxHeight: '350px', 
              overflowY: 'auto',
              marginBottom: 16
            }}>
              {ticket.comments && ticket.comments.length > 0 ? (
                <div>
                  {[...ticket.comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((comment, idx) => {
                    const isCurrentUser = userRole === 'landlord'
                      ? comment.authorEmail === userEmail
                      : comment.authorEmail === user?.email;
                    
                    return (
                      <div key={idx} style={{ marginBottom: idx < ticket.comments.length - 1 ? 24 : 0 }}>
                        <Row gutter={12}>
                          <Col>
                            <Avatar 
                              icon={<UserOutlined />} 
                              style={{ 
                                background: isCurrentUser 
                                  ? (userRole === 'landlord' ? '#1890ff' : '#8c8c8c')
                                  : (userRole === 'landlord' ? '#8c8c8c' : '#1890ff')
                              }}
                            />
                          </Col>
                          <Col flex="auto">
                            <div>
                              <Space align="center" style={{ marginBottom: 4 }}>
                                <Text strong style={{ fontSize: 14 }}>
                                  {comment.authorName || 'Unknown'}
                                </Text>
                                {isCurrentUser ? (
                                  <Tag color={userRole === 'landlord' ? 'blue' : 'default'} style={{ margin: 0, fontSize: 11 }}>
                                    {userRole === 'landlord' ? 'Landlord' : 'Tenant'}
                                  </Tag>
                                ) : (
                                  <Tag color={userRole === 'landlord' ? 'default' : 'blue'} style={{ margin: 0, fontSize: 11 }}>
                                    {userRole === 'landlord' ? 'Tenant' : 'Landlord'}
                                  </Tag>
                                )}
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {formatDateTimeDisplay(comment.createdAt, ' • ')}
                                </Text>
                              </Space>
                              <div style={{ 
                                background: '#fafafa',
                                padding: '12px 16px',
                                borderRadius: 8,
                                border: '1px solid #f0f0f0',
                                marginTop: 8
                              }}>
                                {renderCommentText(comment.comment)}
                              </div>
                            </div>
                          </Col>
                        </Row>
                        {idx < ticket.comments.length - 1 && (
                          <Divider style={{ margin: '16px 0' }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Empty 
                  description="No activity yet" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ padding: '32px 0' }}
                />
              )}
            </div>

            {/* Comment Input Section - only show if ticket is not fully closed and not read-only */}
            {!readOnly && !(ticket.status === 'Closed' && ticket.landlordApproved && ticket.tenantApproved) && (
              <div style={{ paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                <Space.Compact style={{ width: '100%' }}>
                  <TextArea
                    rows={2}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => onCommentChange && onCommentChange(e.target.value)}
                    style={{ resize: 'none' }}
                  />
                  <Button 
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={() => onAddComment && onAddComment()}
                    loading={commentLoading}
                    disabled={!newComment.trim()}
                    style={{ height: 'auto' }}
                  >
                    Send
                  </Button>
                </Space.Compact>
              </div>
            )}
          </Card>

          {/* Expense Tracking Section (Landlord Only - always show for landlords) */}
          {userRole === 'landlord' && (
            <Card 
              size="small" 
              title={
                <Space>
                  <DollarOutlined />
                  <Text strong>Expenses</Text>
                  <Badge 
                    count={expenses.length} 
                    showZero 
                    style={{ backgroundColor: '#1890ff' }}
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Total: ${expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                  </Text>
                </Space>
              }
              extra={
                !readOnly ? (
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      // Navigate to maintenance page to add expense
                      window.location.href = `/operations?tab=maintenance&ticketId=${ticket.id}`;
                    }}
                  >
                    Add Expense
                  </Button>
                ) : null
              }
              style={{ marginTop: 16 }}
            >
              <Spin spinning={expenseLoading}>
                {expenses.length > 0 ? (
                  <Table
                    dataSource={expenses}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    scroll={{ x: 'max-content' }}
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
                          <Text strong style={{ color: '#ff4d4f' }}>
                            ${amount.toFixed(2)}
                          </Text>
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
                        fixed: 'right',
                        render: (_, record) => {
                          if (!record.receiptUrl) {
                            // Show upload button if no invoice and not read-only
                            if (!readOnly && userRole === 'landlord') {
                              return (
                                <Button
                                  type="link"
                                  icon={<UploadOutlined />}
                                  size="small"
                                  onClick={() => {
                                    setUploadingExpenseId(record.id);
                                    setInvoiceFileList([]);
                                    setInvoiceUploadModalOpen(true);
                                  }}
                                >
                                  Upload
                                </Button>
                              );
                            }
                            return <Text type="secondary">—</Text>;
                          }
                          return (
                            <Space size="small">
                              <Tooltip title="View Invoice">
                                <Button
                                  type="link"
                                  icon={<EyeOutlined />}
                                  size="small"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setViewingInvoiceUrl(record.receiptUrl);
                                    setInvoiceViewModalOpen(true);
                                  }}
                                />
                              </Tooltip>
                              <Tooltip title="Download Invoice">
                                <Button
                                  type="link"
                                  icon={<DownloadOutlined />}
                                  size="small"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = record.receiptUrl;
                                    link.download = `invoice_${record.id}.pdf`;
                                    link.target = '_blank';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                />
                              </Tooltip>
                            </Space>
                          );
                        }
                      }
                    ]}
                  />
                ) : (
                  <Empty 
                    description="No expenses recorded yet" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ padding: '16px 0' }}
                  />
                )}
              </Spin>
            </Card>
          )}
        </div>
      )}

    </Modal>

    {/* Invoice Upload Modal - Separate modal */}
    <Modal
      title="Upload Invoice"
      open={invoiceUploadModalOpen}
      onCancel={() => {
        setInvoiceUploadModalOpen(false);
        setInvoiceFileList([]);
        setUploadingExpenseId(null);
      }}
      footer={[
        <Button
          key="cancel"
          onClick={() => {
            setInvoiceUploadModalOpen(false);
            setInvoiceFileList([]);
            setUploadingExpenseId(null);
          }}
        >
          Cancel
        </Button>,
        <Button
          key="upload"
          type="primary"
          icon={<UploadOutlined />}
          loading={uploadingInvoice}
          onClick={handleUploadInvoice}
          disabled={!invoiceFileList || invoiceFileList.length === 0}
        >
          Upload
        </Button>
      ]}
      width={500}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text strong>Select Invoice File</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
          </Text>
        </div>
        <Upload
          beforeUpload={() => false}
          maxCount={1}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          fileList={invoiceFileList}
          onChange={({ fileList }) => {
            setInvoiceFileList(fileList);
          }}
          onRemove={() => {
            setInvoiceFileList([]);
          }}
        >
          <Button icon={<UploadOutlined />}>Select File</Button>
        </Upload>
      </Space>
    </Modal>

    {/* Invoice View Modal with iframe */}
    <Modal
      title="Invoice"
      open={invoiceViewModalOpen}
      onCancel={() => {
        setInvoiceViewModalOpen(false);
        setViewingInvoiceUrl(null);
      }}
      footer={[
        <Button
          key="close"
          onClick={() => {
            setInvoiceViewModalOpen(false);
            setViewingInvoiceUrl(null);
          }}
        >
          Close
        </Button>
      ]}
      width="90%"
      style={{ top: 20 }}
      styles={{ body: { height: 'calc(100vh - 200px)', padding: 0 } }}
    >
      {viewingInvoiceUrl && (
        <iframe
          src={`${viewingInvoiceUrl}#view=FitH`}
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          title="Invoice"
          type="application/pdf"
        />
      )}
    </Modal>
    </>
  );
}

