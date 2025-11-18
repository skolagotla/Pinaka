"use client";

import { useState, useEffect } from 'react';
import { Card, List, Button, Input, Space, Avatar, Tag, Empty, Modal, Form, Select, Tabs, Typography, Row, Col, Statistic } from 'antd';
import { StandardModal, FormTextInput, FormSelect } from '@/components/shared';
import { notify } from '@/lib/utils/notification-helper';
import { useLoading } from '@/lib/hooks/useLoading';
import { MessageOutlined, SendOutlined, PlusOutlined, UserOutlined, TeamOutlined, HomeOutlined } from '@ant-design/icons';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import { useModalState } from '@/lib/hooks/useModalState';
import { ProCard } from '@/components/shared/LazyProComponents';
import { formatDateTimeDisplay } from '@/lib/utils/safe-date-formatter';
import { rules } from '@/lib/utils/validation-rules';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

/**
 * PMC Messages Component
 * Direct messaging between PMC and both landlords and tenants
 */
export default function PMCMessagesClient() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { loading, withLoading } = useLoading(true);
  const { loading: loadingContacts, withLoading: withLoadingContacts } = useLoading(true);
  const { isOpen: createModalVisible, open: openCreateModal, close: closeCreateModal, openForCreate: openCreateModalForCreate } = useModalState();
  const [createForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'landlords', 'tenants'
  const [landlords, setLandlords] = useState([]);
  const [tenants, setTenants] = useState([]);
  const { fetch } = useUnifiedApi({ showUserMessage: true });

  useEffect(() => {
    fetchConversations();
    fetchContacts();
  }, [activeTab]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const fetchContacts = async () => {
    await withLoadingContacts(async () => {
      try {
        // Use v1Api client (Note: landlords/tenants endpoints might not be in v1 yet, keep legacy for now)
        const { v1Api } = await import('@/lib/api/v1-client');
        const [landlordsData, tenantsData] = await Promise.all([
          v1Api.landlords.list({ page: 1, limit: 1000 }).then(response => {
            const landlords = response.data?.data || response.data || [];
            return { landlords: Array.isArray(landlords) ? landlords : [], data: Array.isArray(landlords) ? landlords : [] };
          }).catch(() => ({ landlords: [], data: [] })),
          v1Api.tenants.list({ page: 1, limit: 1000 }).then(response => {
            const tenants = response.data?.data || response.data || [];
            return Array.isArray(tenants) ? tenants : [];
          }).catch(() => []),
        ]);

        const landlordsArray = landlordsData.landlords || landlordsData.data || (Array.isArray(landlordsData) ? landlordsData : []);
        setLandlords(Array.isArray(landlordsArray) ? landlordsArray : []);
        setTenants(Array.isArray(tenantsData) ? tenantsData : []);
      } catch (error) {
        console.error('[PMC Messages] Error loading contacts:', error);
      }
    });
  };

  const fetchConversations = async () => {
    await withLoading(async () => {
      try {
        const params = new URLSearchParams();
        if (activeTab === 'landlords') {
          params.append('type', 'LANDLORD_PMC');
        } else if (activeTab === 'tenants') {
          params.append('type', 'PMC_TENANT');
        }

        // Use v1Api client
        const { v1Api } = await import('@/lib/api/v1-client');
        const response = await v1Api.conversations.list({ 
          page: 1, 
          limit: 1000,
          ...(activeTab === 'landlords' && { type: 'LANDLORD_PMC' }),
          ...(activeTab === 'tenants' && { type: 'PMC_TENANT' })
        });
        const conversationsData = response.data?.data || response.data || [];
        setConversations(Array.isArray(conversationsData) ? conversationsData : []);
        if (conversationsData.length > 0 && !selectedConversation) {
          setSelectedConversation(conversationsData[0]);
        }
      } catch (error) {
        console.error('[PMC Messages] Error:', error);
      }
    });
  };

  const fetchMessages = async (conversationId) => {
    try {
      // Use v1Api client - get conversation which includes messages
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.conversations.get(conversationId);
      const conversation = response.data || response;
      if (conversation && conversation.messages) {
        setMessages(Array.isArray(conversation.messages) ? conversation.messages : []);
      }
    } catch (error) {
      console.error('[PMC Messages] Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      await v1Api.specialized.sendConversationMessage(selectedConversation.id, newMessage.trim());
      setNewMessage('');
      fetchMessages(selectedConversation.id);
      fetchConversations();
    } catch (error) {
      console.error('[PMC Messages] Error sending message:', error);
      notify.error(error.message || 'Failed to send message');
    }
  };

  const handleCreateConversation = async (values) => {
    try {
      const conversationType = values.contactType === 'landlord' ? 'LANDLORD_PMC' : 'PMC_TENANT';
      const contactId = values.contactType === 'landlord' ? values.landlordId : values.tenantId;

      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.conversations.create({
        contactType: values.contactType,
        contactId: contactId,
        propertyId: values.propertyId,
        subject: values.subject,
        initialMessage: values.initialMessage,
      });
      const conversation = response.data || response;
      
      notify.success('Conversation created');
      closeCreateModal();
      createForm.resetFields();
      fetchConversations();
      if (conversation) {
        setSelectedConversation(conversation);
      }
    } catch (error) {
      console.error('[PMC Messages] Error creating conversation:', error);
      notify.error(error.message || 'Failed to create conversation');
    }
  };

  const getParticipantName = (conversation) => {
    if (conversation.landlord) {
      return `${conversation.landlord.firstName || ''} ${conversation.landlord.lastName || ''}`.trim() || conversation.landlord.email;
    }
    if (conversation.tenant) {
      return `${conversation.tenant.firstName || ''} ${conversation.tenant.lastName || ''}`.trim() || conversation.tenant.email;
    }
    return 'Unknown';
  };

  const getParticipantType = (conversation) => {
    if (conversation.conversationType === 'LANDLORD_PMC') return 'landlord';
    if (conversation.conversationType === 'PMC_TENANT') return 'tenant';
    return 'unknown';
  };

  const filteredConversations = conversations.filter(conv => {
    if (activeTab === 'all') return true;
    if (activeTab === 'landlords') return conv.conversationType === 'LANDLORD_PMC';
    if (activeTab === 'tenants') return conv.conversationType === 'PMC_TENANT';
    return true;
  });

  // Calculate statistics
  const unreadCount = filteredConversations.filter(conv => {
    if (!conv.pmcLastReadAt) return true;
    if (conv.lastMessage && new Date(conv.lastMessage.createdAt) > new Date(conv.pmcLastReadAt)) return true;
    return false;
  }).length;

  return (
    <div style={{ padding: 0, maxWidth: '100%', height: '100%', display: 'flex', flexDirection: 'column' }} suppressHydrationWarning>
      {/* Header Section */}
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 20 }}>
            <MessageOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            Messages
          </Title>
          <Typography.Text type="secondary" style={{ fontSize: 13, marginTop: 2, display: 'block' }}>
            Communicate with landlords and tenants
          </Typography.Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModalForCreate}
          style={{ height: 36 }}
        >
          New Conversation
        </Button>
      </div>

      {/* Statistics Section */}
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col xs={24} sm={12} md={6}>
          <ProCard hoverable bodyStyle={{ padding: '16px' }}>
            <Statistic
              title="Total Conversations"
              value={filteredConversations.length}
              prefix={<MessageOutlined style={{ color: '#1890ff', fontSize: 16 }} />}
              valueStyle={{ fontSize: 20, fontWeight: 600 }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard hoverable bodyStyle={{ padding: '16px' }}>
            <Statistic
              title="Unread Messages"
              value={unreadCount}
              valueStyle={{ color: '#ff4d4f', fontSize: 20, fontWeight: 600 }}
              prefix={<MessageOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />}
            />
          </ProCard>
        </Col>
      </Row>

      {/* Main Messages Interface */}
      <ProCard
        style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
        bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* Conversations Sidebar */}
          <div style={{ 
            width: '360px', 
            borderRight: '1px solid #f0f0f0', 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: '#fafafa',
            flexShrink: 0
          }}>
            {/* Tabs */}
            <div style={{ padding: '12px 12px 0 12px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fff' }}>
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  {
                    key: 'all',
                    label: (
                      <Space>
                        <MessageOutlined />
                        <span>All</span>
                      </Space>
                    ),
                  },
                  {
                    key: 'landlords',
                    label: (
                      <Space>
                        <HomeOutlined />
                        <span>Landlords</span>
                      </Space>
                    ),
                  },
                  {
                    key: 'tenants',
                    label: (
                      <Space>
                        <TeamOutlined />
                        <span>Tenants</span>
                      </Space>
                    ),
                  },
                ]}
                style={{ marginBottom: 0 }}
              />
            </div>

            {/* Conversations List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
              <List
                dataSource={filteredConversations}
                loading={loading}
                locale={{ emptyText: <Empty description="No conversations" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                renderItem={(conversation) => {
                  const isUnread = !conversation.pmcLastReadAt || 
                    (conversation.lastMessage && new Date(conversation.lastMessage.createdAt) > new Date(conversation.pmcLastReadAt));
                  const isSelected = selectedConversation?.id === conversation.id;
                  
                  return (
                    <List.Item
                      style={{
                        cursor: 'pointer',
                        padding: '12px 16px',
                        marginBottom: 4,
                        borderRadius: 8,
                        backgroundColor: isSelected ? '#e6f7ff' : isUnread ? '#f0f9ff' : 'transparent',
                        border: isSelected ? '1px solid #1890ff' : '1px solid transparent',
                        transition: 'all 0.2s',
                      }}
                      onClick={() => setSelectedConversation(conversation)}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#f5f5f5';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = isUnread ? '#f0f9ff' : 'transparent';
                        }
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            size={48}
                            icon={<UserOutlined />}
                            style={{ 
                              backgroundColor: getParticipantType(conversation) === 'landlord' ? '#1890ff' : '#52c41a' 
                            }}
                          />
                        }
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                            <Text strong style={{ fontSize: 15, flex: 1 }} ellipsis>
                              {conversation.subject}
                            </Text>
                            {isUnread && (
                              <div style={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                backgroundColor: '#ff4d4f',
                                marginLeft: 8,
                                marginTop: 4
                              }} />
                            )}
                          </div>
                        }
                        description={
                          <div>
                            <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <Text type="secondary" style={{ fontSize: 13 }}>
                                {getParticipantName(conversation)}
                              </Text>
                              <Tag 
                                size="small" 
                                color={getParticipantType(conversation) === 'landlord' ? 'blue' : 'green'}
                                style={{ margin: 0 }}
                              >
                                {getParticipantType(conversation) === 'landlord' ? 'Landlord' : 'Tenant'}
                              </Tag>
                            </div>
                            {conversation.property && (
                              <div style={{ marginBottom: 4 }}>
                                <Tag size="small" icon={<HomeOutlined />} style={{ margin: 0 }}>
                                  {conversation.property.propertyName || conversation.property.addressLine1}
                                </Tag>
                              </div>
                            )}
                            {conversation.lastMessage && (
                              <Text 
                                type="secondary" 
                                style={{ 
                                  fontSize: 12, 
                                  display: 'block',
                                  marginTop: 4,
                                  color: isUnread ? '#1890ff' : '#8c8c8c'
                                }}
                                ellipsis
                              >
                                {formatDateTimeDisplay(conversation.lastMessage.createdAt)}
                              </Text>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            </div>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div style={{ 
                  padding: '12px 16px', 
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: '#fafafa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Title level={5} style={{ margin: 0, fontSize: 16 }}>
                      {selectedConversation.subject}
                    </Title>
                  </div>
                  <Space size="middle" wrap>
                    <Tag 
                      color={getParticipantType(selectedConversation) === 'landlord' ? 'blue' : 'green'}
                      icon={getParticipantType(selectedConversation) === 'landlord' ? <HomeOutlined /> : <TeamOutlined />}
                    >
                      {getParticipantType(selectedConversation) === 'landlord' ? 'Landlord' : 'Tenant'}: {getParticipantName(selectedConversation)}
                    </Tag>
                    {selectedConversation.property && (
                      <Tag icon={<HomeOutlined />}>
                        {selectedConversation.property.propertyName || selectedConversation.property.addressLine1}
                      </Tag>
                    )}
                  </Space>
                </div>

                {/* Messages Container */}
                <div style={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  padding: '16px',
                  backgroundColor: '#f5f5f5'
                }}>
                  {messages.length === 0 ? (
                    <Empty 
                      description="No messages yet. Start the conversation!" 
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      style={{ marginTop: 100 }}
                    />
                  ) : (
                    messages.map((msg, index) => {
                      const isPMC = msg.senderRole === 'pmc';
                      const showDateSeparator = index === 0 || 
                        new Date(msg.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();
                      
                      return (
                        <div key={msg.id}>
                          {showDateSeparator && (
                            <div style={{ 
                              textAlign: 'center', 
                              margin: '16px 0',
                              position: 'relative'
                            }}>
                              <div style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                backgroundColor: '#fff',
                                borderRadius: 12,
                                fontSize: 12,
                                color: '#8c8c8c',
                                border: '1px solid #f0f0f0'
                              }}>
                                {new Date(msg.createdAt).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </div>
                            </div>
                          )}
                          <div
                            style={{
                              marginBottom: 16,
                              display: 'flex',
                              justifyContent: isPMC ? 'flex-end' : 'flex-start',
                              alignItems: 'flex-end',
                              gap: 12,
                            }}
                          >
                            {!isPMC && (
                              <Avatar 
                                size={36}
                                icon={<UserOutlined />}
                                style={{ 
                                  backgroundColor: getParticipantType(selectedConversation) === 'landlord' ? '#1890ff' : '#52c41a',
                                  flexShrink: 0
                                }}
                              />
                            )}
                            <div style={{ 
                              maxWidth: '65%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: isPMC ? 'flex-end' : 'flex-start'
                            }}>
                              <div
                                style={{
                                  padding: '12px 16px',
                                  borderRadius: isPMC ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                  backgroundColor: isPMC ? '#1890ff' : '#fff',
                                  color: isPMC ? '#fff' : '#262626',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                  wordBreak: 'break-word',
                                  lineHeight: 1.5,
                                }}
                              >
                                <div style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>
                                  {msg.messageText || msg.content}
                                </div>
                              </div>
                              <Text 
                                type="secondary" 
                                style={{ 
                                  fontSize: 11, 
                                  marginTop: 4,
                                  padding: '0 4px'
                                }}
                              >
                                {formatDateTimeDisplay(msg.createdAt)}
                              </Text>
                            </div>
                            {isPMC && (
                              <Avatar 
                                size={36}
                                icon={<UserOutlined />}
                                style={{ 
                                  backgroundColor: '#1890ff',
                                  flexShrink: 0
                                }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input */}
                <div style={{ 
                  padding: '12px 16px', 
                  borderTop: '1px solid #f0f0f0',
                  backgroundColor: '#fff'
                }}>
                  <Space.Compact style={{ width: '100%' }}>
                    <Input.TextArea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      rows={2}
                      style={{ 
                        borderRadius: '6px 0 0 6px',
                        resize: 'none'
                      }}
                      onPressEnter={(e) => {
                        if (e.shiftKey) return;
                        e.preventDefault();
                        handleSendMessage();
                      }}
                    />
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      style={{ 
                        height: 'auto',
                        borderRadius: '0 6px 6px 0',
                        padding: '0 20px'
                      }}
                    >
                      Send
                    </Button>
                  </Space.Compact>
                </div>
              </>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                flexDirection: 'column',
                gap: 16
              }}>
                <MessageOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
                <Empty 
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                        Select a conversation to view messages
                      </Text>
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={openCreateModalForCreate}
                      >
                        Start New Conversation
                      </Button>
                    </div>
                  } 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            )}
          </div>
        </div>
      </ProCard>

      {/* Create Conversation Modal */}
      <StandardModal
        title="New Conversation"
        open={createModalVisible}
        form={createForm}
        loading={false}
        submitText="Create"
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        onFinish={handleCreateConversation}
        width={600}
      >
          <Form.Item
            name="contactType"
            label="Contact Type"
            rules={[rules.required('Contact type')]}
            initialValue="landlord"
          >
            <Select placeholder="Select contact type">
              <Option value="landlord">Landlord</Option>
              <Option value="tenant">Tenant</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.contactType !== currentValues.contactType}
          >
            {({ getFieldValue }) => {
              const contactType = getFieldValue('contactType');
              if (contactType === 'landlord') {
                return (
                  <Form.Item
                    name="landlordId"
                    label="Landlord"
                    rules={[rules.required('Landlord')]}
                  >
                    <Select
                      placeholder="Select landlord"
                      loading={loadingContacts}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.children?.toString() || '').toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {(Array.isArray(landlords) ? landlords : []).map((landlord) => {
                        if (!landlord || !landlord.id) {
                          return null;
                        }
                        return (
                          <Option key={landlord.id} value={landlord.id}>
                            {landlord.firstName} {landlord.lastName} ({landlord.email})
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                );
              } else if (contactType === 'tenant') {
                return (
                  <Form.Item
                    name="tenantId"
                    label="Tenant"
                    rules={[rules.required('Tenant')]}
                  >
                    <Select
                      placeholder="Select tenant"
                      loading={loadingContacts}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.children?.toString() || '').toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {(Array.isArray(tenants) ? tenants : []).map((tenant) => {
                        if (!tenant || !tenant.id) {
                          return null;
                        }
                        return (
                          <Option key={tenant.id} value={tenant.id}>
                            {tenant.firstName} {tenant.lastName} ({tenant.email})
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>

          <Form.Item
            name="subject"
            label="Subject"
            rules={[rules.required('Subject')]}
          >
            <Input placeholder="Conversation subject" />
          </Form.Item>

          <Form.Item
            name="initialMessage"
            label="Initial Message"
            rules={[rules.required('Initial message')]}
          >
            <TextArea rows={4} placeholder="Start the conversation..." />
          </Form.Item>
      </StandardModal>
    </div>
  );
}

