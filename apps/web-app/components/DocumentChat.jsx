"use client";
import { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, Space, Typography, Badge, Avatar, Spin, Empty, App } from 'antd';
import { SendOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;
const { TextArea } = Input;

/**
 * DocumentChat Component
 * Real-time chat for discussing specific documents between landlord and tenant
 * 
 * Props:
 * - documentId: The document ID to fetch messages for
 * - document: The full document object (for verification/rejection status)
 * - userRole: "landlord" or "tenant"
 * - userName: Current user's display name
 * - onClose: Callback when chat is closed
 */
export default function DocumentChat({ documentId, document, userRole, userName, onClose }) {
  const { message } = App.useApp();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // Generate system messages for verification/rejection
  const getSystemMessages = () => {
    const systemMessages = [];
    
    if (document?.isVerified) {
      systemMessages.push({
        id: 'system-verified',
        isSystem: true,
        type: 'approved',
        message: document.verificationComment || 'Document approved',
        senderName: document.verifiedByName || 'System',
        senderRole: document.verifiedByRole || 'landlord',
        createdAt: document.verifiedAt,
      });
    }
    
    if (document?.isRejected) {
      systemMessages.push({
        id: 'system-rejected',
        isSystem: true,
        type: 'rejected',
        message: document.rejectionReason || 'Document rejected',
        senderName: document.rejectedByName || 'System',
        senderRole: document.rejectedByRole || 'landlord',
        createdAt: document.rejectedAt,
      });
    }
    
    return systemMessages;
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/documents/${documentId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('[DocumentChat] Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const res = await fetch(`/api/documents/${documentId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      if (res.ok) {
        const sentMessage = await res.json();
        setMessages((prev) => [...prev, sentMessage]);
        setNewMessage('');
        setTimeout(scrollToBottom, 100);
        message.success('Message sent');
      } else {
        message.error('Failed to send message');
      }
    } catch (error) {
      console.error('[DocumentChat] Error sending message:', error);
      message.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Load messages on mount
  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [documentId]);

  return (
    <Card
      title={
        <Space>
          <MessageOutlined />
          <Text>Discussion</Text>
          {unreadCount > 0 && <Badge count={unreadCount} />}
        </Space>
      }
      size="small"
      style={{ height: '400px', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}
    >
      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#fafafa',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin />
          </div>
        ) : (() => {
          const systemMessages = getSystemMessages();
          const allMessages = [...systemMessages, ...messages];
          return allMessages.length === 0 ? (
            <Empty
              description="No messages yet"
              style={{ marginTop: '40px' }}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>
                Start a conversation about this document
              </Text>
            </Empty>
          ) : (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {allMessages.map((msg) => {
                const isCurrentUser = msg.senderRole === userRole;
                const isSystemMessage = msg.isSystem;
                
                // System message styling
                if (isSystemMessage) {
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%',
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '90%',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          backgroundColor: msg.type === 'approved' ? '#f6ffed' : '#fff2e8',
                          border: `1px solid ${msg.type === 'approved' ? '#b7eb8f' : '#ffbb96'}`,
                          textAlign: 'center',
                        }}
                      >
                        <Text
                          strong
                          style={{
                            fontSize: 12,
                            color: msg.type === 'approved' ? '#52c41a' : '#fa8c16',
                            display: 'block',
                            marginBottom: 4,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {msg.type === 'approved' ? '✓ Document Approved' : '✗ Document Rejected'}
                        </Text>
                        <Text style={{ fontSize: 13, color: '#595959' }}>
                          {msg.message}
                        </Text>
                        <Text
                          type="secondary"
                          style={{
                            fontSize: 11,
                            display: 'block',
                            marginTop: 8,
                          }}
                        >
                          by {msg.senderName} • {dayjs(msg.createdAt).fromNow()}
                        </Text>
                      </div>
                    </div>
                  );
                }
                
                // Regular message styling
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                      alignItems: 'flex-start',
                    }}
                  >
                    {!isCurrentUser && (
                      <Avatar
                        icon={<UserOutlined />}
                        style={{
                          backgroundColor: msg.senderRole === 'landlord' ? '#1890ff' : '#52c41a',
                          marginRight: 8,
                        }}
                      />
                    )}
                    <div
                      style={{
                        maxWidth: '70%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: isCurrentUser ? '#1890ff' : '#fff',
                        color: isCurrentUser ? '#fff' : '#000',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      }}
                    >
                      {!isCurrentUser && (
                        <Text
                          strong
                          style={{
                            fontSize: 11,
                            color: isCurrentUser ? '#fff' : '#1890ff',
                            display: 'block',
                            marginBottom: 4,
                          }}
                        >
                          {msg.senderName}
                        </Text>
                      )}
                    <Text style={{ color: isCurrentUser ? '#fff' : '#000', display: 'block' }}>
                      {msg.message}
                    </Text>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 10,
                        color: isCurrentUser ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.45)',
                        display: 'block',
                        marginTop: 4,
                      }}
                    >
                      {dayjs(msg.createdAt).fromNow()}
                    </Text>
                  </div>
                  {isCurrentUser && (
                    <Avatar
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor: msg.senderRole === 'landlord' ? '#1890ff' : '#52c41a',
                        marginLeft: 8,
                      }}
                    />
                  )}
                </div>
                );
              })}
              <div ref={messagesEndRef} />
            </Space>
          );
        })()}
      </div>

      {/* Input Area */}
      <div style={{ padding: '12px', borderTop: '1px solid #f0f0f0', backgroundColor: '#fff' }}>
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message... (Shift+Enter for new line)"
            autoSize={{ minRows: 1, maxRows: 3 }}
            disabled={sending}
            style={{ resize: 'none' }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={sending}
            disabled={!newMessage.trim()}
          >
            Send
          </Button>
        </Space.Compact>
      </div>
    </Card>
  );
}

