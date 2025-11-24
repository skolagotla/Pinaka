"use client";

import { useState, useEffect } from 'react';
import { Card, Button, Textarea, Label, Avatar, Badge, Modal, Select, Spinner } from 'flowbite-react';
import { HiChat, HiPaperAirplane, HiPlus, HiUser } from 'react-icons/hi';
import { ProCard } from '../shared/LazyProComponents';
import { formatDateTimeDisplay } from '@/lib/utils/safe-date-formatter';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useConversations, useConversation, useCreateConversation, useCreateMessage } from '@/lib/hooks/useV2Data';
import { useFormState } from '@/lib/hooks/useFormState';
import { notify } from '@/lib/utils/notification-helper';

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
  const createForm = useFormState({
    subject: '',
    propertyId: '',
    initialMessage: '',
  });
  
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
        notify.error('Organization ID is required');
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
      notify.error(error.message || 'Failed to send message');
    }
  };

  const handleCreateConversation = async (e) => {
    e.preventDefault();
    const values = createForm.getFieldsValue();

    try {
      if (!organizationId) {
        notify.error('Organization ID is required');
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

      notify.success('Conversation created');
      setCreateModalVisible(false);
      createForm.resetForm();
      refetchConversations();
      if (conversation) {
        setSelectedConversation(conversation);
      }
    } catch (error) {
      console.error('[PMC Communication] Error creating conversation:', error);
      notify.error(error.message || 'Failed to create conversation');
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
      <ProCard className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HiChat className="h-5 w-5" />
            <h3 className="text-lg font-semibold">PMC Communication</h3>
          </div>
          <Button
            color="blue"
            onClick={() => setCreateModalVisible(true)}
            className="flex items-center gap-2"
          >
            <HiPlus className="h-4 w-4" />
            New Conversation
          </Button>
        </div>

        <div className="flex h-[600px]">
          {/* Conversations List */}
          <div className="w-[300px] border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Spinner size="xl" />
              </div>
            ) : conversations.length === 0 ? (
              <Empty description="No conversations" />
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Avatar
                        placeholderInitials={getParticipantName(conversation)?.[0] || 'U'}
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{conversation.subject}</p>
                        <p className="text-xs text-gray-500 truncate">{getParticipantName(conversation)}</p>
                        {conversation.property && (
                          <Badge color="gray" size="sm" className="mt-1">
                            {conversation.property.propertyName || conversation.property.addressLine1}
                          </Badge>
                        )}
                        {conversation.messages?.[0] && (
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDateTimeDisplay(conversation.messages[0].createdAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold">{selectedConversation.subject}</h3>
                  {selectedConversation.property && (
                    <Badge color="gray" className="mt-1">
                      {selectedConversation.property.propertyName || selectedConversation.property.addressLine1}
                    </Badge>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderRole === 'pmc' ? 'justify-end' : 'justify-start'}`}
                    >
                      <Card
                        className={`max-w-[70%] ${
                          msg.senderRole === 'pmc'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-2 ${
                          msg.senderRole === 'pmc' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatDateTimeDisplay(msg.createdAt)}
                        </p>
                      </Card>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      color="blue"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="flex items-center gap-2"
                    >
                      <HiPaperAirplane className="h-4 w-4" />
                      Send
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <Empty description="Select a conversation to view messages" />
              </div>
            )}
          </div>
        </div>
      </ProCard>

      {/* Create Conversation Modal */}
      <Modal
        show={createModalVisible}
        onClose={() => {
          setCreateModalVisible(false);
          createForm.resetForm();
        }}
        size="md"
      >
        <Modal.Header>New Conversation</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleCreateConversation} className="space-y-4">
            <div>
              <Label htmlFor="subject" className="mb-2 block">
                Subject <span className="text-red-500">*</span>
              </Label>
              <input
                id="subject"
                type="text"
                className="w-full rounded-lg border-gray-300 dark:border-gray-600"
                placeholder="Conversation subject"
                value={createForm.values.subject}
                onChange={(e) => createForm.setFieldsValue({ subject: e.target.value })}
                required
              />
            </div>

            {!propertyId && (
              <div>
                <Label htmlFor="propertyId" className="mb-2 block">
                  Property (Optional)
                </Label>
                <Select
                  id="propertyId"
                  value={createForm.values.propertyId}
                  onChange={(value) => createForm.setFieldsValue({ propertyId: value })}
                >
                  <option value="">Select property</option>
                  {/* Property options would be loaded here */}
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="initialMessage" className="mb-2 block">
                Initial Message <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="initialMessage"
                rows={4}
                placeholder="Start the conversation..."
                value={createForm.values.initialMessage}
                onChange={(e) => createForm.setFieldsValue({ initialMessage: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                color="gray"
                onClick={() => {
                  setCreateModalVisible(false);
                  createForm.resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" color="blue">
                Create
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
