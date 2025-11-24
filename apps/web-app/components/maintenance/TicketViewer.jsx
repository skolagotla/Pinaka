/**
 * Shared Maintenance Ticket Viewer Component
 * Displays ticket details, comments, status updates, and approval workflow
 * Used by both landlord and tenant maintenance pages
 */

import { Modal, Card, Row, Col, Badge, Tag, Button, Input, Space, Alert, Divider, Tooltip, Avatar, Typography } from 'antd';
import { 
  CloseOutlined, 
  SendOutlined, 
  CheckOutlined, 
  CloseCircleOutlined,
  UserOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text, Title } = Typography;

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
      'New': 'default',
      'Pending': 'warning',
      'In Progress': 'processing',
      'Completed': 'success',
    };
    return colors[status] || 'default';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'default',
      'Medium': 'warning',
      'High': 'error',
    };
    return colors[priority] || 'default';
  };

  // Get opener name
  const openerName = ticket.initiatedBy === 'landlord'
    ? `${ticket.property?.landlord?.firstName || ''} ${ticket.property?.landlord?.lastName || ''}`.trim()
    : `${ticket.tenant?.firstName || ''} ${ticket.tenant?.lastName || ''}`.trim();

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      closeIcon={<CloseOutlined />}
      destroyOnClose
    >
      {/* Header */}
      <Row 
        align="middle" 
        justify="space-between" 
        style={{ 
          paddingBottom: 16,
          paddingRight: 40, // Space for close button
        }}
      >
        <Col flex="auto">
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            Ticket# {ticket.ticketNumber || ticket.id}
          </Title>
        </Col>
        <Col>
          <Text 
            type="secondary" 
            style={{ 
              fontSize: 13,
              whiteSpace: 'nowrap',
            }}
          >
            Ticket Opened: {dayjs(ticket.createdAt).format('MMM D, YYYY, h:mm A')}
          </Text>
        </Col>
      </Row>

      {/* Ticket Title */}
      <Title level={5} style={{ margin: '16px 0', textAlign: 'center' }}>
        {ticket.title}
      </Title>

      {/* Status Bar */}
      <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
        <Row gutter={[16, 8} align="middle">
          <Col>
            <Text type="secondary" style={{ fontSize: 12 }}>Opened by:</Text>{' '}
            <Tag color="default" style={{ margin: 0, fontSize: 11 }}>
              {ticket.initiatedBy === 'landlord' ? 'Landlord' : 'Tenant'}
            </Tag>{' '}
            <Text strong style={{ fontSize: 13 }}openerName}</Text>
          </Col>
          
          <Divider type="vertical" style={{ height: 24, margin: '0 12px' }} />
          
          <Col>
            <Text type="secondary" style={{ fontSize: 12 }}>Category:</Text>{' '}
            <Text strong style={{ fontSize: 13 }}ticket.category}</Text>
          </Col>
          
          <Divider type="vertical" style={{ height: 24, margin: '0 12px' }} />
          
          <Col>
            <Text type="secondary" style={{ fontSize: 12 }}>Priority:</Text>{' '}
            <Tag color={getPriorityColor(ticket.priority)} style={{ fontSize: 12 }}>
              {ticket.priority}
            </Tag>
          </Col>
          
          <Divider type="vertical" style={{ height: 24, margin: '0 12px' }} />
          
          <Col>
            <Text type="secondary" style={{ fontSize: 12 }}>Status:</Text>{' '}
            <Badge 
              color={getStatusColor(ticket.status) === 'warning' ? 'orange' : undefined}
              status={getStatusColor(ticket.status) === 'warning' ? undefined : getStatusColor(ticket.status)} 
              text={
                <Text strong style={{ fontSize: 13 }}>
                  {ticket.status}
                </Text>
              }
            />
          </Col>

          {onDownload && (
            <>
              <Divider type="vertical" style={{ height: 24, margin: '0 12px' }} />
              <Col>
                <Tooltip title="Download Ticket PDF">
                  <Button
                    type="text"
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => onDownload(ticket.id)}
                    style={{ fontSize: 18 }}
                  />
                </Tooltip>
              </Col>
            </>
          )}
        </Row>
      </Card>

      {/* Description */}
      <Card title="Description" size="small" style={{ marginBottom: 16 }}>
        <Text>{ticket.description}</Text>
      </Card>

      {/* Approval Section */}
      {awaitingApproval && (
        <Alert
          message={userRole === 'landlord' 
            ? "Tenant Has Marked This Case as Completed" 
            : "Landlord Has Marked This Case as Completed"}
          description={
            <Space direction="vertical" style={{ width: '100%', marginTop: 12 }}>
              <Text>Do you agree to close this ticket?</Text>
              <Space>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={onApprove}
                  loading={statusUpdateLoading}
                >
                  Yes, Close Case
                </Button>
                <Button
                  icon={<CloseCircleOutlined />}
                  onClick={onReject}
                  loading={statusUpdateLoading}
                >
                  No, Continue Work
                </Button>
              </Space>
            </Space>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Awaiting Other Party Approval */}
      {!isCompleted && ((userRole === 'landlord' && ticket.landlordApproved) || (userRole === 'tenant' && ticket.tenantApproved)) && (
        <Alert
          message="Awaiting Approval"
          description={`Waiting for ${userRole === 'landlord' ? 'tenant' : 'landlord'} to approve ticket closure.`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Completed Message */}
      {isCompleted && (
        <Alert
          message="Ticket Successfully Closed"
          description="This ticket has been marked as completed by both parties."
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Comments/Activity */}
      <Card 
        title="Activity" 
        size="small" 
        style={{ marginBottom: 16, maxHeight: 400, overflowY: 'auto' }}
      >
        {ticket.comments && ticket.comments.length > 0 ? (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {ticket.comments.map((comment, index) => {
              const isLandlord = comment.authorRole === 'landlord';
              const isStatus = comment.isStatusUpdate;
              
              return (
                <div key={comment.id || index}>
                  <Space align="start" style={{ width: '100%' }}>
                    <Avatar 
                      icon={<UserOutlined />} 
                      style={{ 
                        backgroundColor: isLandlord ? '#1890ff' : '#52c41a',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <Space size={4}>
                        <Text strong>{comment.authorName}</Text>
                        <Tag color={isLandlord ? 'blue' : 'green'} style={{ margin: 0, fontSize: 10 }}>
                          {isLandlord ? 'Landlord' : 'Tenant'}
                        </Tag>
                        {isStatus && (
                          <Tag color="orange" style={{ margin: 0, fontSize: 10 }}>
                            Status Update
                          </Tag>
                        )}
                      </Space>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(comment.createdAt).format('MMM D, YYYY • h:mm A')}
                      </Text>
                      <div
                        style={{
                          marginTop: 8,
                          padding: '12px 16px',
                          background: isLandlord ? '#e6f7ff' : '#f6ffed',
                          borderRadius: 8,
                          borderLeft: `3px solid ${isLandlord ? '#1890ff' : '#52c41a'}`,
                        }}
                      >
                        <Text>{comment.comment}</Text>
                      </div>
                    </div>
                  </Space>
                  {index < ticket.comments.length - 1 && <Divider style={{ margin: '16px 0' }} />}
                </div>
              );
            })}
          </Space>
        ) : (
          <Text type="secondary">No activity yet</Text>
        )}
      </Card>

      {/* Status Update Dropdown (only for tickets initiated by other party) */}
      {canEditStatus && !isCompleted && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Update Status:</Text>
            <Space.Compact style={{ width: '100%' }}>
              <Button
                onClick={() => onStatusChange('Pending')}
                disabled={ticket.status === 'Pending'}
                loading={statusUpdateLoading}
              >
                Pending
              </Button>
              <Button
                onClick={() => onStatusChange('In Progress')}
                disabled={ticket.status === 'In Progress'}
                loading={statusUpdateLoading}
              >
                In Progress
              </Button>
              <Button
                onClick={() => onStatusChange('Mark as Completed')}
                type="primary"
                loading={statusUpdateLoading}
              >
                Mark as Completed
              </Button>
            </Space.Compact>
          </Space>
        </Card>
      )}

      {/* Comment Input (only if not completed) */}
      {!isCompleted && (
        <Card size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Add Comment:</Text>
            <TextArea
              rows={3}
              value={newComment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Type your message..."
              disabled={commentLoading}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={onAddComment}
              loading={commentLoading}
              disabled={!newComment.trim()}
              style={{ alignSelf: 'flex-end' }}
            >
              Send
            </Button>
          </Space>
        </Card>
      )}
    </Modal>
  );
}

