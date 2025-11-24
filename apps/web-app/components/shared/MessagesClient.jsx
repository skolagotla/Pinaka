/**
 * Messages Client Component - Migrated to Flowbite UI + v2 FastAPI
 * 
 * Uses v2 API endpoints for conversations and messages
 * UI converted from Ant Design to Flowbite
 */
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Card, Button, Modal, TextInput, Label, Textarea, Badge, 
  Spinner, Avatar, List, Tooltip, Alert
} from 'flowbite-react';
import { Empty } from '@/components/shared';
import { 
  HiPaperAirplane, HiChat, HiPlus, HiUser, HiX, HiDownload, 
  HiCheckCircle, HiRefresh, HiClock
} from 'react-icons/hi';
import PageLayout from './PageLayout';
import { usePolling, useModalState } from '@/lib/hooks';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { 
  useConversations, useConversation, useCreateConversation, 
  useMessages, useCreateMessage, useProperties, useLeases 
} from '@/lib/hooks/useV2Data';
import { useFormState } from '@/lib/hooks/useFormState';
import { v2Api } from '@/lib/api/v2-client';
import { notify } from '@/lib/utils/notification-helper';
import { formatDateTimeDisplay, formatDateForAPI, formatTimeOnly, formatDateShort } from '@/lib/utils/safe-date-formatter';
import FlowbitePopconfirm from './FlowbitePopconfirm';

export default function MessagesClient({ userRole = 'landlord' }) {
  const { user } = useV2Auth();
  const organizationId = user?.organization_id;
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const { isOpen: newConvoModalOpen, open: openNewConvoModal, close: closeNewConvoModal } = useModalState();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Role-specific configuration
  const isLandlord = userRole === 'landlord';
  const isTenant = userRole === 'tenant';
  const subtitle = isLandlord 
    ? 'Communicate with your PMC' 
    : isTenant 
    ? 'Communicate with your PMC' 
    : 'Communicate with your landlord';

  // Load conversations using v2 API
  const { data: conversationsData, isLoading: conversationsLoading, refetch: refetchConversations } = useConversations(organizationId);
  const conversations = conversationsData && Array.isArray(conversationsData) ? conversationsData : [];

  // Load selected conversation
  const { data: selectedConversation, refetch: refetchConversation } = useConversation(selectedConversationId || '');
  
  // Load messages for selected conversation
  const { data: messagesData, refetch: refetchMessages } = useMessages(selectedConversationId || '');
  const messages = messagesData && Array.isArray(messagesData) ? messagesData : [];

  // Load properties for landlords/tenants
  const { data: propertiesData } = useProperties(organizationId);
  const properties = propertiesData && Array.isArray(propertiesData) ? propertiesData : [];

  // Load leases for tenants
  const { data: leasesData } = useLeases({ tenant_id: user?.id });
  const leases = leasesData && Array.isArray(leasesData) ? leasesData : [];

  // Extract unique properties from leases (for tenants)
  const tenantProperties = isTenant ? leases
    .map(lease => lease.unit?.property)
    .filter(Boolean)
    .filter((prop, index, self) => self.findIndex(p => p.id === prop.id) === index) : [];

  const availableProperties = isLandlord ? properties : tenantProperties;

  // Mutations
  const createConversation = useCreateConversation();
  const createMessage = useCreateMessage();

  const conversationForm = useFormState({
    propertyId: '',
    subject: '',
    initialMessage: '',
  });

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Polling for real-time updates
  const { startPolling, stopPolling } = usePolling({
    callback: async () => {
      if (selectedConversationId) {
        refetchMessages();
      }
      refetchConversations();
    },
    interval: 5000,
    enabled: true,
    immediate: false
  });

  useEffect(() => {
    if (isLandlord) {
      startPolling();
      return () => stopPolling();
    }
  }, [isLandlord, startPolling, stopPolling]);

  const handleStartConversation = async () => {
    try {
      const values = conversationForm.getFieldsValue();
      
      if (!values.subject || !values.propertyId) {
        notify.error('Subject and property are required');
        return;
      }

      // Get property to find PMC organization
      const property = availableProperties.find(p => p.id === values.propertyId);
      if (!property) {
        notify.error('Property not found');
        return;
      }

      // Get PMC users from the property's organization
      // TODO: Add helper endpoint to get PMC users for a property
      const pmcUsers = await v2Api.listUsers(property.organization_id);
      const pmcUserIds = Array.isArray(pmcUsers) 
        ? pmcUsers.filter(u => u.roles?.some(r => r.name === 'pmc_admin' || r.name === 'pm')).map(u => u.id)
        : [];

      if (pmcUserIds.length === 0) {
        notify.error('No PMC users found for this property');
        return;
      }

      // Create conversation
      const conversation = await createConversation.mutateAsync({
        organization_id: organizationId || '',
        subject: values.subject,
        entity_type: 'property',
        entity_id: values.propertyId,
        participant_user_ids: pmcUserIds,
      });

      // If initial message provided, send it
      if (values.initialMessage) {
        await createMessage.mutateAsync({
          conversationId: conversation.id,
          data: { body: values.initialMessage },
        });
      }

      notify.success('Conversation started');
      closeNewConvoModal();
      conversationForm.reset();
      setSelectedConversationId(conversation.id);
      refetchConversations();
    } catch (error) {
      console.error('[Messages] Error starting conversation:', error);
      notify.error(error.message || 'Failed to start conversation');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    
    if (selectedConversation?.status === 'closed') {
      notify.warning('This conversation is closed. Please reopen it to send messages.');
      return;
    }

    try {
      await createMessage.mutateAsync({
        conversationId: selectedConversationId,
        data: { body: newMessage.trim() },
      });

      setNewMessage('');
      refetchMessages();
      refetchConversations();
    } catch (error) {
      console.error('[Messages] Error sending message:', error);
      notify.error(error.message || 'Failed to send message');
    }
  };

  const handleCloseConversation = async () => {
    if (!selectedConversationId) return;

    try {
      await v2Api.updateConversation(selectedConversationId, { status: 'closed' });
      notify.success('Conversation closed. You can still view and download it.');
      refetchConversation();
      refetchConversations();
    } catch (error) {
      notify.error(error.message || 'Failed to close conversation');
    }
  };

  const handleReopenConversation = async () => {
    if (!selectedConversationId) return;

    try {
      await v2Api.updateConversation(selectedConversationId, { status: 'active' });
      notify.success('Conversation reopened. You can now send messages.');
      refetchConversation();
      refetchConversations();
    } catch (error) {
      notify.error(error.message || 'Failed to reopen conversation');
    }
  };

  const handleDownloadConversation = () => {
    if (!selectedConversation || !messages.length) {
      notify.warning('No messages to download');
      return;
    }

    const participantNames = selectedConversation.participants?.map(p => p.user?.full_name || p.user?.email || 'Unknown').join(', ') || 'Unknown';

    const conversationText = [
      `Conversation: ${selectedConversation.subject || 'Untitled'}`,
      `Participants: ${participantNames}`,
      `Status: ${selectedConversation.status || 'active'}`,
      `Created: ${formatDateTimeDisplay(selectedConversation.created_at)}`,
      `Last Updated: ${formatDateTimeDisplay(selectedConversation.updated_at)}`,
      '',
      '='.repeat(60),
      'MESSAGES',
      '='.repeat(60),
      '',
      ...messages.map((msg, index) => {
        const senderName = msg.sender?.full_name || msg.sender?.email || 'Unknown';
        const timestamp = formatDateTimeDisplay(msg.created_at);
        return [
          `[${index + 1}] ${senderName} - ${timestamp}`,
          '-'.repeat(60),
          msg.body,
          ''
        ].join('\n');
      })
    ].join('\n');

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

    notify.success('Conversation downloaded successfully');
  };

  const selectConversation = (conversation) => {
    setSelectedConversationId(conversation.id);
  };

  // Calculate unread count (messages where is_read is false and sender is not current user)
  const unreadCount = conversations.reduce((count, conv) => {
    const unread = conv.messages?.filter(msg => 
      !msg.is_read && msg.sender_user_id !== user?.id
    ).length || 0;
    return count + unread;
  }, 0);

  // Get last message preview
  const getLastMessage = (conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) return null;
    const sorted = [...conversation.messages].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    return sorted[0];
  };

  return (
    <PageLayout
      title="Messages"
      subtitle={subtitle}
       stats={[
         { label: 'Conversations', value: conversations.length, color: 'blue' },
         { label: 'Unread', value: unreadCount, color: 'red' }
        ]}
       actions={[
        {
          key: 'new-message',
          icon: <HiPlus className="h-5 w-5" />,
          label: 'New Message',
          type: 'primary',
          onClick: openNewConvoModal
        }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-250px)]">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Conversations</h3>
            {conversationsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Spinner size="xl" />
              </div>
            ) : conversations.length === 0 ? (
              <Empty description="No conversations yet">
                <Button onClick={openNewConvoModal} color="blue">
                  <HiPlus className="h-4 w-4 mr-2" />
                  Start a Conversation
                </Button>
              </Empty>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto">
                {conversations.map(convo => {
                  const lastMessage = getLastMessage(convo);
                  const preview = lastMessage?.body?.substring(0, 50) || 'No messages yet';
                  const unread = convo.messages?.filter(msg => 
                    !msg.is_read && msg.sender_user_id !== user?.id
                  ).length || 0;
                  
                  return (
                    <div
                      key={convo.id}
                      onClick={() => selectConversation(convo)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversationId === convo.id 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-sm">{convo.subject || 'Conversation'}</h4>
                        {unread > 0 && (
                          <Badge color="failure" size="sm">{unread}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                        {preview}{preview.length >= 50 ? '...' : ''}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDateShort(convo.updated_at)} {formatTimeOnly(convo.updated_at)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Messages Thread */}
        <div className="lg:col-span-2">
          <Card>
            {selectedConversation ? (
              <>
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedConversation.subject || 'Conversation'}</h3>
                    {selectedConversation.status === 'closed' && (
                      <Badge color="gray" className="mt-1">
                        <HiCheckCircle className="h-3 w-3 mr-1" />
                        Closed
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Tooltip content="Download conversation">
                      <Button size="xs" color="light" onClick={handleDownloadConversation}>
                        <HiDownload className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                    {selectedConversation.status === 'closed' ? (
                      <FlowbitePopconfirm
                        title="Reopen conversation?"
                        description="This will reopen the conversation so you can send messages again."
                        onConfirm={handleReopenConversation}
                      >
                        <Button size="xs" color="light">
                          <HiRefresh className="h-4 w-4" />
                        </Button>
                      </FlowbitePopconfirm>
                    ) : (
                      <FlowbitePopconfirm
                        title="Close conversation?"
                        description="This will close the conversation. Both parties can still view and download it, but no new messages can be sent."
                        onConfirm={handleCloseConversation}
                      >
                        <Button size="xs" color="failure">
                          <HiX className="h-4 w-4" />
                        </Button>
                      </FlowbitePopconfirm>
                    )}
                  </div>
                </div>

                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg mb-4"
                  style={{ maxHeight: 'calc(100vh - 400px)' }}
                >
                  {messages.length === 0 ? (
                    <Empty description="No messages yet. Start the conversation" />
                  ) : (
                    messages.map((msg, index) => {
                      const isMyMessage = user?.id && msg.sender_user_id === user.id;
                      const showAvatar = index === 0 || messages[index - 1]?.sender_user_id !== msg.sender_user_id;
                      const senderName = msg.sender?.full_name || msg.sender?.email || 'User';
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex gap-2 max-w-[70%] ${isMyMessage ? 'flex-row-reverse' : 'flex-row'} items-end`}>
                            {showAvatar ? (
                              <Avatar
                                rounded
                                img={null}
                                className={isMyMessage ? 'bg-blue-500' : 'bg-green-500'}
                              >
                                <HiUser className="h-5 w-5" />
                              </Avatar>
                            ) : (
                              <div className="w-8" />
                            )}
                            <div
                              className={`rounded-lg px-4 py-2 ${
                                isMyMessage 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                              } shadow-sm`}
                            >
                              {showAvatar && (
                                <div className={`text-xs font-semibold mb-1 ${
                                  isMyMessage ? 'text-white' : 'text-blue-600 dark:text-blue-400'
                                }`}>
                                  {senderName}
                                </div>
                              )}
                              <div className="text-sm">{msg.body}</div>
                                <div className={`text-xs mt-1 ${
                                isMyMessage ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {formatTimeOnly(msg.created_at)}
                              </div>
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
                  <Alert color="info" className="mb-0">
                    <div className="flex items-center gap-2">
                      <HiCheckCircle className="h-5 w-5" />
                      <span>This conversation is closed. You can still view and download it, or reopen it to continue the conversation.</span>
                    </div>
                  </Alert>
                ) : (
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                      rows={2}
                      className="flex-1"
                      disabled={createMessage.isPending}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || createMessage.isPending}
                      color="blue"
                      className="self-end"
                    >
                      {createMessage.isPending ? (
                        <Spinner size="sm" />
                      ) : (
                        <>
                          <HiPaperAirplane className="h-4 w-4 mr-2" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Empty description="Select a conversation to view messages" />
            )}
          </Card>
        </div>
      </div>

      {/* New Conversation Modal */}
      <Modal show={newConvoModalOpen} onClose={closeNewConvoModal} size="md">
        <Modal.Header>
          {isLandlord || isTenant ? "Start Conversation with PMC" : "Start New Conversation"}
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            {(isLandlord || isTenant) && (
              <>
                <div>
                  <Label htmlFor="propertyId" className="mb-2 block">
                    Property <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="propertyId"
                    value={conversationForm.getFieldValue('propertyId') || ''}
                    onChange={(e) => conversationForm.setField('propertyId', e.target.value)}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    required
                  >
                    <option value="">Select property</option>
                    {availableProperties.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name || p.address_line1 || p.id}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">Select the property related to your conversation with PMC</p>
                </div>

                <div>
                  <Label htmlFor="subject" className="mb-2 block">
                    Subject <span className="text-red-500">*</span>
                  </Label>
                  <TextInput
                    id="subject"
                    value={conversationForm.getFieldValue('subject') || ''}
                    onChange={(e) => conversationForm.setField('subject', e.target.value)}
                    placeholder={isLandlord ? "e.g., Question about property management" : "e.g., Question about my lease"}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="initialMessage" className="mb-2 block">
                    Initial Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="initialMessage"
                    rows={4}
                    value={conversationForm.getFieldValue('initialMessage') || ''}
                    onChange={(e) => conversationForm.setField('initialMessage', e.target.value)}
                    placeholder="Start your conversation with PMC..."
                    required
                  />
                </div>
              </>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={closeNewConvoModal} color="gray">
            Cancel
          </Button>
          <Button 
            onClick={handleStartConversation} 
            color="blue"
            disabled={createConversation.isPending}
          >
            {createConversation.isPending ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Creating...
              </>
            ) : (
              'Start Conversation'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </PageLayout>
  );
}
