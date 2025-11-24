"use client";

import { useState, useEffect } from 'react';
import { Card, List, Button, Input, Space, Avatar, Tag, Empty, Modal, Form, Select, message } from 'antd';
import { MessageOutlined, SendOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { ProCard } from '../shared/LazyProComponents';
import { formatDateTimeDisplay } from '@/lib/utils/safe-date-formatter';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useConversations, useConversation, useCreateConversation, useCreateMessage } from '@/lib/hooks/useV2Data';

const { TextArea } = Input;
const { Option } = Select;

/**
 * PMC Communication Channel Component
 * Direct messaging between PMC and landlords
 */
export default function PMCCommunicationChannel({ landlordId, propertyId }) {
  const { user } = useV2Auth();
  const organizationId = user?.organization_id;
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  
  // v2 API hooks
  const { data: conversationsData, isLoading: conversationsLoading, refetch: refetchConversations } = useConversations(organizationId);
  const { data: conversationData, refetch: refetchConversation } = useConversation(selectedConversation?.id);
  const createConversation = useCreateConversation();
  const createMessage = useCreateMessage();
  
  const conversations = conversationsData || [];
  const messages = conversationData?.messages || [];
  const loading = conversationsLoading;

  useEffect(() => {
    refetchConversations();
  }, [landlordId, propertyId, refetchConversations]);
  
  useEffect(() => {
    if (selectedConversation) {
      refetchConversation();
    }
  }, [selectedConversation, refetchConversation]);
  
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      if (!organizationId) {
        message.error('Organization ID is required');
        return;
      }
      
      await createMessage.mutateAsync({
        conversation_id: selectedConversation.id,
        content: newMessage.trim(),
        sender_id: user.id,
      });
      setNewMessage('');
      refetchConversation();
      refetchConversations();
    } catch (error) {
      console.error('[PMC Communication] Error sending message:', error);
      message.error(error.message || 'Failed to send message');
    }
  };

  const handleCreateConversation = async (values) => {
    try {
      if (!organizationId) {
        message.error('Organization ID is required');
        return;
      }
      
      const conversation = await createConversation.mutateAsync({
        organization_id: organizationId,
        conversation_type: 'LANDLORD_PMC',
        participant_ids: [values.landlordId || landlordId],
        property_id: values.propertyId || propertyId || null,
        subject: values.subject || null,
      });
      
      // If there's an initial message, send it
      if (values.initialMessage) {
        await createMessage.mutateAsync({
          conversation_id: conversation.id,
          content: values.initialMessage,
          sender_id: user.id,
        });
      }

      message.success('Conversation created');
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchConversations();
      if (conversation) {
        setSelectedConversation(conversation);
      }
    } catch (error) {
      console.error('[PMC Communication] Error creating conversation:', error);
      message.error(error.message || 'Failed to create conversation');
    }
  };

  const getParticipantName = (conversation) => {
    if (conversation.landlord) {
      return `${conversation.landlord.firstName} ${conversation.landlord.lastName}`;
    }
    return 'Unknown';
  };

  return (
    <div>
      <ProCard
        title={
          <Space>
            <MessageOutlined />
            <span>PMC Communication</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            New Conversation
          </Button>
        }
      >
        <div style={{ display: 'flex', height: '600px' }}>
          {/* Conversations List */}
          <div style={{ width: '300px', borderRight: '1px solid #f0f0f0', padding: '16px' }}>
            <List
              dataSource={conversations}
              loading={loading}
              locale={{ emptyText: <Empty description="No conversations" /> }}
              renderItem={(conversation) => (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedConversation?.id === conversation.id ? '#e6f7ff' : 'transparent',
                  }}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={conversation.subject}
                    description={
                      <div>
                        <div>{getParticipantName(conversation)}</div>
                        {conversation.property && (
                          <Tag size="small">{conversation.property.propertyName || conversation.property.addressLine1}</Tag>
                        )}
                        {conversation.messages?.[0] && (
                          <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
                            {formatDateTimeDisplay(conversation.messages[0].createdAt)}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <>
                <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                  <h3>{selectedConversation.subject}</h3>
                  {selectedConversation.property && (
                    <Tag>{selectedConversation.property.propertyName || selectedConversation.property.addressLine1}</Tag>
                  )}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        marginBottom: 16,
                        textAlign: msg.senderRole === 'pmc' ? 'right' : 'left',
                      }}
                    >
                      <Card
                        size="small"
                        style={{
                          display: 'inline-block',
                          maxWidth: '70%',
                          backgroundColor: msg.senderRole === 'pmc' ? '#1890ff' : '#f0f0f0',
                          color: msg.senderRole === 'pmc' ? 'white' : 'black',
                        }}
                      >
                        <div>{msg.content}</div>
                        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: 4 }}>
                          {formatDateTimeDisplay(msg.createdAt)}
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
                  <Space.Compact style={{ width: '100%' }}>
                    <Input.TextArea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      rows={2}
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
                    >
                      Send
                    </Button>
                  </Space.Compact>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Empty description="Select a conversation to view messages" />
              </div>
            )}
          </div>
        </div>
      </ProCard>

      {/* Create Conversation Modal */}
      <Modal
        title="New Conversation"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        onOk={() => createForm.submit()}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateConversation}
        >
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please enter a subject' }}
          >
            <Input placeholder="Conversation subject" />
          </Form.Item>

          {!propertyId && (
            <Form.Item
              name="propertyId"
              label="Property (Optional)"
            >
              <Select placeholder="Select property" allowClear>
                {/* Property options would be loaded here */}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="initialMessage"
            label="Initial Message"
            rules={[{ required: true, message: 'Please enter an initial message' }}
          >
            <TextArea rows={4} placeholder="Start the conversation..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

