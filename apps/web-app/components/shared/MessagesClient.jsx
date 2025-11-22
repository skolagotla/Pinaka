"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, List, Input, Button, Avatar, Badge, Empty, message, Modal, Form, Select, Spin, Typography, Space, Tag, Popconfirm } from 'antd';
import { SendOutlined, MessageOutlined, PlusOutlined, UserOutlined, CloseOutlined, DownloadOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import PageBanner from './PageBanner';
import { usePolling, useModalState, useLoadingState } from '@/lib/hooks';
import dayjs from 'dayjs';
import { formatDateDisplay, formatDateTimeDisplay, formatDateForAPI, formatTimeOnly, formatDateShort } from '@/lib/utils/safe-date-formatter';

const { Text } = Typography;
const { TextArea } = Input;

export default function MessagesClient({ userRole = 'landlord' }) {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { isOpen: newConvoModalOpen, open: openNewConvoModal, close: closeNewConvoModal } = useModalState();
  const [contacts, setContacts] = useState([]); // Generic contacts (tenants for landlord, landlords for tenant)
  const [properties, setProperties] = useState([]); // Properties for landlords/tenants to select when starting conversations
  const { loading: sending, withLoading: withSending } = useLoadingState();
  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [form] = Form.useForm();

  // Role-specific configuration
  // IMPORTANT: Landlords and tenants can ONLY communicate with PMC, not with each other
  const isLandlord = userRole === 'landlord';
  const isTenant = userRole === 'tenant';
  // For landlords and tenants, we don't show contact selection - they can only message PMC
  // The conversations API will automatically filter to only show PMC conversations
  const contactsApiEndpoint = null; // Not used for landlord/tenant - they only see PMC conversations
  const contactFieldName = null;
  const contactLabel = 'PMC';
  const subtitle = isLandlord 
    ? 'Communicate with your PMC' 
    : isTenant 
    ? 'Communicate with your PMC' 
    : 'Communicate with your landlord';

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadCurrentUser = useCallback(async () => {
    try {
      // Use apiClient to call /api/user/current endpoint
      const { apiClient } = await import('@/lib/utils/api-client');
      const response = await apiClient('/api/user/current', {
        method: 'GET',
      });
      const data = await response.json().catch(() => ({}));
      if (data.user || data.id) {
        setCurrentUserId(data.user?.id || data.id);
      }
    } catch (error) {
      // Silently handle errors - only log in development mode
      if (process.env.NODE_ENV === 'development') {
        console.error('[Messages] Error loading current user:', error);
      }
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // For landlords and tenants, only load conversations (they can only communicate with PMC)
      // For other roles, load both conversations and contacts
      // Use v1Api client for conversations
      const { v1Api } = await import('@/lib/api/v1-client');
      const promises = [
        v1Api.conversations.list({ page: 1, limit: 1000 }).then(response => {
          const conversationsData = response.data?.data || response.data || [];
          return { ok: true, json: async () => ({ conversations: Array.isArray(conversationsData) ? conversationsData : [] }) };
        }).catch((err) => {
          console.warn('[Messages] Failed to load conversations:', err?.message || 'Unknown error');
          return null;
        }),
      ];

      // Only load contacts if not landlord/tenant (they can only message PMC)
      if (contactsApiEndpoint && !isLandlord && !isTenant) {
        // Use direct fetch for legacy endpoints that don't have v1 equivalents
        promises.push(
          fetch(contactsApiEndpoint, { credentials: 'include' })
            .then(res => res.ok ? res.json().then(data => ({ ok: true, json: async () => data })) : null)
            .catch((err) => {
              console.warn(`[Messages] Failed to load ${contactLabel.toLowerCase()}s:`, err?.message || 'Unknown error');
              return null;
            })
        );
      }

      // For landlords/tenants, load properties so they can select one when starting a conversation
      if (isLandlord || isTenant) {
        // For landlords: use v1Api.properties
        // For tenants: get properties from their leases via v1Api.leases
        if (isLandlord) {
          promises.push(
            v1Api.properties.list({ page: 1, limit: 1000 }).then(response => {
              const propertiesData = response.data?.data || response.data || [];
              return { ok: true, json: async () => ({ properties: Array.isArray(propertiesData) ? propertiesData : [] }) };
            }).catch((err) => {
              console.warn('[Messages] Failed to load properties:', err?.message || 'Unknown error');
              return null;
            })
          );
        } else {
          promises.push(
            v1Api.leases.list({ page: 1, limit: 1000 }).then(response => {
              const leasesData = response.data?.data || response.data || [];
              return { ok: true, json: async () => (Array.isArray(leasesData) ? leasesData : []) };
            }).catch((err) => {
              console.warn('[Messages] Failed to load leases:', err?.message || 'Unknown error');
              return null;
            })
          );
        }
      }

      const results = await Promise.all(promises);
      const [convoRes, contactsRes, propertiesRes] = results;

      if (convoRes && convoRes.ok) {
        try {
          const data = await convoRes.json();
          setConversations(data.conversations || []);
        } catch (parseError) {
          console.warn('[Messages] Failed to parse conversations response:', parseError);
        }
      }

      if (contactsRes && contactsRes.ok) {
        try {
          const data = await contactsRes.json();
          // Handle different response formats
          if (Array.isArray(data)) {
            setContacts(data);
          } else if (data.tenants) {
            setContacts(data.tenants);
          } else if (data.landlords) {
            setContacts(data.landlords);
          } else if (data.tenant) {
            setContacts([data.tenant]);
          } else if (data.landlord) {
            setContacts([data.landlord]);
          } else {
            setContacts([]);
          }
        } catch (parseError) {
          console.warn(`[Messages] Failed to parse ${contactLabel.toLowerCase()}s response:`, parseError);
        }
      }

      // Load properties for landlords/tenants
      if (propertiesRes && propertiesRes.ok) {
        try {
          const data = await propertiesRes.json();
          if (isLandlord) {
            // Landlord: properties API returns { properties: [...] }
            if (Array.isArray(data)) {
              setProperties(data);
            } else if (data.properties) {
              setProperties(data.properties);
            } else if (data.data) {
              setProperties(Array.isArray(data.data) ? data.data : []);
            } else {
              setProperties([]);
            }
          } else if (isTenant) {
            // Tenant: leases API returns leases, extract unique properties
            const leases = Array.isArray(data) ? data : (data.leases || data.data || []);
            const uniqueProperties = new Map();
            leases.forEach(lease => {
              if (lease.unit && lease.unit.property) {
                const prop = lease.unit.property;
                if (!uniqueProperties.has(prop.id)) {
                  uniqueProperties.set(prop.id, prop);
                }
              }
            });
            setProperties(Array.from(uniqueProperties.values()));
          }
        } catch (parseError) {
          console.warn('[Messages] Failed to parse properties response:', parseError);
        }
      }
    } catch (error) {
      console.warn('[Messages] Error in loadData:', error?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [isLandlord, isTenant, contactsApiEndpoint, contactLabel]);

  // Polling for real-time updates
  const { startPolling, stopPolling } = usePolling({
    callback: async () => {
      if (selectedConversation) {
        await loadMessages(selectedConversation.id);
      }
      await loadConversations();
    },
    interval: 5000,
    enabled: true,
    immediate: false
  });

  useEffect(() => {
    loadCurrentUser();
    loadData();
    if (isLandlord) {
      startPolling();
      return () => stopPolling();
    }
  }, [loadCurrentUser, loadData, isLandlord, startPolling, stopPolling]);

  const loadConversations = async () => {
    try {
      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.conversations.list({ page: 1, limit: 1000 });
      const conversationsData = response.data?.data || response.data || [];
      setConversations(Array.isArray(conversationsData) ? conversationsData : []);
    } catch (error) {
      console.warn('[Messages] Failed to load conversations (polling):', error?.message || 'Unknown error');
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.conversations.get(conversationId);
      const conversation = response.data || response;
      if (conversation) {
        setMessages(conversation.messages || []);
        // Update selected conversation with latest data
        setSelectedConversation(conversation);
      }
    } catch (error) {
      console.warn('[Messages] Failed to load messages:', error?.message || 'Unknown error');
    }
  };

  const handleStartConversation = async (values) => {
    try {
      // For landlords and tenants, they can only create conversations with PMC
      // They need to provide propertyId (PMC will be determined from property)
      const body = {
        subject: values.subject,
      };

      if (isLandlord || isTenant) {
        // Landlords/tenants can only message PMC - propertyId is required
        if (!values.propertyId) {
          message.error('Property is required to start a conversation with PMC');
          return;
        }
        body.propertyId = values.propertyId;
        // Initial message is optional but recommended
        if (values.initialMessage) {
          body.initialMessage = values.initialMessage;
        }
      } else {
        // For other roles (if any), use the old logic
        if (contactFieldName && values[contactFieldName]) {
          body[contactFieldName] = values[contactFieldName];
          body.propertyId = values.propertyId; // Property might be needed
        }
      }

      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      await v1Api.conversations.create(body);

      message.success('Conversation started');
      closeNewConvoModal();
      form.resetFields();
      loadData();
    } catch (error) {
      console.error('[Messages] Error starting conversation:', error);
      message.error(error.message || 'Failed to start conversation');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    // Don't allow sending messages to closed conversations
    if (selectedConversation.status === 'closed') {
      message.warning(isLandlord 
        ? 'This conversation is closed. You cannot send new messages.'
        : 'This conversation is closed. Please reopen it to send messages.');
      return;
    }

    await withSending(async () => {
      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      await v1Api.specialized.sendConversationMessage(selectedConversation.id, newMessage.trim());

      setNewMessage('');
      // Reload messages immediately
      await loadMessages(selectedConversation.id);
      // Reload conversations to update last message preview
      await loadConversations();
    });
  };

  const handleCloseConversation = async () => {
    if (!selectedConversation) return;

    try {
      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      const updatedConversation = await v1Api.conversations.update(selectedConversation.id, {
        status: 'closed'
      });
      const conversation = updatedConversation.data || updatedConversation;
      if (conversation) {
        setSelectedConversation(conversation);
        // Update in conversations list
        setConversations(prev => prev.map(c => 
          c.id === conversation.id ? conversation : c
        ));
        message.success('Conversation closed. You can still view and download it.');
      }
    } catch (error) {
      message.error(error.message || 'Failed to close conversation');
    }
  };

  const handleReopenConversation = async () => {
    if (!selectedConversation) return;

    try {
      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      const updatedConversation = await v1Api.conversations.update(selectedConversation.id, {
        status: 'active'
      });
      const conversation = updatedConversation.data || updatedConversation;
      if (conversation) {
        setSelectedConversation(conversation);
        // Update in conversations list
        setConversations(prev => prev.map(c => 
          c.id === conversation.id ? conversation : c
        ));
        message.success('Conversation reopened. You can now send messages.');
      }
    } catch (error) {
      message.error(error.message || 'Failed to reopen conversation');
    }
  };

  const handleDownloadConversation = () => {
    if (!selectedConversation || !messages.length) {
      message.warning('No messages to download');
      return;
    }

    // Create a formatted text file with conversation details
    const participantNamesStr = typeof selectedConversation.participantNames === 'string' 
      ? selectedConversation.participantNames 
      : (Array.isArray(selectedConversation.participantNames) 
          ? selectedConversation.participantNames.map(p => typeof p === 'string' ? p : p.name).join(', ')
          : 'Unknown');

    const conversationText = [
      `Conversation: ${selectedConversation.subject || 'Untitled'}`,
      `Participants: ${participantNamesStr}`,
      `Status: ${selectedConversation.status || 'active'}`,
      `Created: ${formatDateTimeDisplay(selectedConversation.createdAt)}`,
      `Last Updated: ${formatDateTimeDisplay(selectedConversation.updatedAt)}`,
      '',
      '='.repeat(60),
      'MESSAGES',
      '='.repeat(60),
      '',
      ...messages.map((msg, index) => {
        const senderName = msg.senderName || 'Unknown';
        const timestamp = formatDateTimeDisplay(msg.createdAt);
        return [
          `[${index + 1}] ${senderName} - ${timestamp}`,
          '-'.repeat(60),
          msg.messageText,
          ''
        ].join('\n');
      })
    ].join('\n');

    // Create blob and download
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeSubject = (selectedConversation.subject || 'untitled').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    link.download = `conversation-${safeSubject}-${formatDateForAPI(new Date())}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    message.success('Conversation downloaded successfully');
  };

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.id);
  };

  const unreadCount = conversations.reduce((count, c) => {
    return count + (c.unreadCount || 0);
  }, 0);

  return (
    <div style={{ padding: '24px' }}>
      <PageBanner
        title="Messages"
        subtitle={subtitle}
        stats={[
          { label: 'Conversations', value: conversations.length, color: '#1890ff' },
          { label: 'Unread', value: unreadCount, color: '#ff4d4f' }
        ]}
        actions={[
          {
            icon: <PlusOutlined />,
            label: 'New Message',
            type: 'primary',
            onClick: openNewConvoModal
          }
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, height: 'calc(100vh - 250px)' }}>
        {/* Conversations List */}
        <Card title="Conversations" bodyStyle={{ height: '100%', overflow: 'auto', padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          ) : conversations.length === 0 ? (
            <Empty description="No conversations yet" style={{ marginTop: 50 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={openNewConvoModal}>
                Start a Conversation
              </Button>
            </Empty>
          ) : (
            <List
              dataSource={conversations}
              renderItem={convo => {
                const lastMessage = convo.messages?.[0];
                const preview = lastMessage?.messageText?.substring(0, 50) || 'No messages yet';
                return (
                  <List.Item
                    onClick={() => selectConversation(convo)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: selectedConversation?.id === convo.id ? '#e6f7ff' : undefined,
                      padding: '12px 16px',
                      borderLeft: selectedConversation?.id === convo.id ? '3px solid #1890ff' : '3px solid transparent'
                    }}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text strong>{convo.subject || convo.participantNames || 'Conversation'}</Text>
                          {convo.unreadCount > 0 && (
                            <Badge count={convo.unreadCount} size="small" />
                          )}
                        </div>
                      }
                      description={
                        <div>
                          <Text type="secondary" ellipsis style={{ fontSize: '12px', display: 'block' }}>
                            {preview}{preview.length >= 50 ? '...' : ''}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {formatDateShort(convo.updatedAt)} {formatTimeOnly(convo.updatedAt)}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </Card>

        {/* Messages Thread */}
        <Card 
          title={
            selectedConversation 
              ? (() => {
                  const subject = selectedConversation.subject || 'Conversation';
                  const participantNames = typeof selectedConversation.participantNames === 'string' 
                    ? selectedConversation.participantNames 
                    : (Array.isArray(selectedConversation.participantNames) 
                        ? selectedConversation.participantNames.map(p => typeof p === 'string' ? p : p.name).join(', ')
                        : '');
                  const title = participantNames ? `${subject} - ${participantNames}` : subject;
                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span>{title}</span>
                      <Space>
                        {selectedConversation.status === 'closed' && (
                          <Tag color="default" icon={<CheckCircleOutlined />}>Closed</Tag>
                        )}
                        <Button
                          type="text"
                          icon={<DownloadOutlined />}
                          onClick={handleDownloadConversation}
                          title="Download conversation"
                        />
                        {selectedConversation.status === 'closed' ? (
                          <Popconfirm
                            title="Reopen conversation?"
                            description="This will reopen the conversation so you can send messages again."
                            onConfirm={handleReopenConversation}
                            okText="Yes, reopen it"
                            cancelText="Cancel"
                          >
                            <Button
                              type="text"
                              icon={<ReloadOutlined />}
                              title="Reopen conversation"
                            />
                          </Popconfirm>
                        ) : (
                          <Popconfirm
                            title="Close conversation?"
                            description="This will close the conversation. Both parties can still view and download it, but no new messages can be sent."
                            onConfirm={handleCloseConversation}
                            okText="Yes, close it"
                            cancelText="Cancel"
                          >
                            <Button
                              type="text"
                              icon={<CloseOutlined />}
                              title="Close conversation"
                              danger
                            />
                          </Popconfirm>
                        )}
                      </Space>
                    </div>
                  );
                })()
              : 'Select a conversation'
          }
          bodyStyle={{ height: 'calc(100% - 60px)', display: 'flex', flexDirection: 'column', padding: 0 }}
        >
          {selectedConversation ? (
            <>
              <div 
                ref={messagesContainerRef}
                style={{ 
                  flex: 1, 
                  overflow: 'auto', 
                  padding: '16px',
                  backgroundColor: '#fafafa',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {messages.length === 0 ? (
                  <Empty description="No messages yet. Start the conversation!" style={{ marginTop: 100 }} />
                ) : (
                  messages.map((msg, index) => {
                    // Determine if this is the current user's message
                    const isMyMessage = currentUserId && msg.senderId === currentUserId;
                    const showAvatar = index === 0 || messages[index - 1]?.senderId !== msg.senderId;
                    
                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
                          marginBottom: showAvatar ? '8px' : '4px'
                        }}
                      >
                        <div style={{
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: isMyMessage ? 'row-reverse' : 'row',
                          gap: '8px',
                          alignItems: 'flex-end'
                        }}>
                          {showAvatar && (
                            <Avatar 
                              icon={<UserOutlined />} 
                              style={{ 
                                backgroundColor: isMyMessage ? '#1890ff' : '#52c41a',
                                flexShrink: 0
                              }}
                            />
                          )}
                          {!showAvatar && <div style={{ width: '32px' }} />}
                          <div style={{
                            backgroundColor: isMyMessage ? '#1890ff' : '#ffffff',
                            color: isMyMessage ? '#ffffff' : '#000000',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            wordWrap: 'break-word'
                          }}>
                            {showAvatar && (
                              <Text 
                                strong 
                                style={{ 
                                  fontSize: '12px', 
                                  color: isMyMessage ? '#ffffff' : '#1890ff',
                                  display: 'block',
                                  marginBottom: '4px'
                                }}
                              >
                                {msg.senderName || 'User'}
                              </Text>
                            )}
                            <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                              {msg.messageText}
                            </div>
                            <Text 
                              type="secondary" 
                              style={{ 
                                fontSize: '11px', 
                                display: 'block',
                                marginTop: '4px',
                                color: isMyMessage ? 'rgba(255,255,255,0.8)' : '#999'
                              }}
                            >
                              {formatTimeOnly(msg.createdAt)}
                            </Text>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {selectedConversation.status === 'closed' ? (
                <div style={{ 
                  padding: '16px',
                  borderTop: '1px solid #f0f0f0',
                  backgroundColor: '#f5f5f5',
                  textAlign: 'center'
                }}>
                  <Text type="secondary">
                    <CheckCircleOutlined /> This conversation is closed. You can still view and download it, or reopen it to continue the conversation.
                  </Text>
                </div>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  gap: 8, 
                  padding: '16px',
                  borderTop: '1px solid #f0f0f0',
                  backgroundColor: '#ffffff'
                }}>
                  <TextArea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                    rows={2}
                    style={{ flex: 1 }}
                    disabled={sending}
                  />
                  <Button 
                    type="primary" 
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    loading={sending}
                    style={{ alignSelf: 'flex-end' }}
                  >
                    Send
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Empty description="Select a conversation to view messages" style={{ marginTop: 100 }} />
          )}
        </Card>
      </div>

      {/* New Conversation Modal */}
      <Modal
        title={isLandlord || isTenant ? "Start Conversation with PMC" : "Start New Conversation"}
        open={newConvoModalOpen}
        onCancel={() => {
          closeNewConvoModal();
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleStartConversation}>
          {isLandlord || isTenant ? (
            <>
              {/* For landlords/tenants: show property selection */}
              <Form.Item
                name="propertyId"
                label="Property"
                rules={[{ required: true, message: 'Please select a property' }]}
                help="Select the property related to your conversation with PMC"
              >
                <Select
                  showSearch
                  placeholder="Select property"
                  optionFilterProp="label"
                  options={properties.map(p => ({
                    value: p.id,
                    label: p.propertyName || p.addressLine1 || p.id
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="subject"
                label="Subject"
                rules={[{ required: true, message: 'Please enter a subject' }]}
              >
                <Input placeholder={isLandlord ? "e.g., Question about property management" : "e.g., Question about my lease"} />
              </Form.Item>

              <Form.Item
                name="initialMessage"
                label="Initial Message"
                rules={[{ required: true, message: 'Please enter an initial message' }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="Start your conversation with PMC..." 
                />
              </Form.Item>
            </>
          ) : (
            <>
              {/* For other roles: show contact selection */}
              {contactFieldName && (
                <Form.Item
                  name={contactFieldName}
                  label={contactLabel}
                  rules={[{ required: true, message: `Please select a ${contactLabel.toLowerCase()}` }]}
                >
                  <Select
                    showSearch
                    placeholder={`Select ${contactLabel.toLowerCase()}`}
                    optionFilterProp="label"
                    options={contacts.map(c => ({
                      value: c.id,
                      label: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.name || 'Unknown'
                    }))}
                  />
                </Form.Item>
              )}

              <Form.Item
                name="subject"
                label="Subject"
                rules={[{ required: true, message: 'Please enter a subject' }]}
              >
                <Input placeholder="e.g., Question about property" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}

