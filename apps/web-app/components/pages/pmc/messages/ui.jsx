"use client";

import { useState, useEffect } from 'react';
import { Card, Button, TextInput, Textarea, Select, Label, Badge, Tooltip, Tabs, Avatar, Modal, Spinner, Alert } from 'flowbite-react';
import { StandardModal, FormTextInput, FormSelect } from '@/components/shared';
import { notify } from '@/lib/utils/notification-helper';
import { useLoading } from '@/lib/hooks/useLoading';
import { HiChat, HiPaperAirplane, HiPlus, HiUser, HiUserGroup, HiHome } from 'react-icons/hi';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import { useModalState } from '@/lib/hooks/useModalState';
import FlowbiteStatistic from '@/components/shared/FlowbiteStatistic';
import { formatDateTimeDisplay } from '@/lib/utils/safe-date-formatter';
import { rules } from '@/lib/utils/validation-rules';
import { useFormState } from '@/lib/hooks/useFormState';

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
  const createForm = useFormState();
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

  const handleCreateConversation = async (e) => {
    e?.preventDefault();
    const values = createForm.getFieldsValue();
    const conversationType = values.contactType === 'landlord' ? 'LANDLORD_PMC' : 'PMC_TENANT';
    const contactId = values.contactType === 'landlord' ? values.landlordId : values.tenantId;

    try {
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
    <div className="p-0 max-w-full h-full flex flex-col" suppressHydrationWarning>
      {/* Header Section */}
      <div className="mb-3 flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold m-0 flex items-center gap-2">
            <HiChat className="h-6 w-6 text-blue-600" />
            Messages
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Communicate with landlords and tenants
          </p>
        </div>
        <Button
          color="blue"
          onClick={openCreateModalForCreate}
          className="flex items-center gap-2"
        >
          <HiPlus className="h-4 w-4" />
          New Conversation
        </Button>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 mb-3">
        <Card>
          <FlowbiteStatistic
            title="Total Conversations"
            value={filteredConversations.length}
            prefix={<HiChat className="h-4 w-4 text-blue-600" />}
            valueStyle={{ fontSize: 20, fontWeight: 600 }}
          />
        </Card>
        <Card>
          <FlowbiteStatistic
            title="Unread Messages"
            value={unreadCount}
            valueStyle={{ color: '#ff4d4f', fontSize: 20, fontWeight: 600 }}
            prefix={<HiChat className="h-4 w-4 text-red-600" />}
          />
        </Card>
      </div>

      {/* Main Messages Interface */}
      <Card className="flex-1 min-h-0 flex flex-col p-0">
        <div className="flex flex-1 min-h-0">
          {/* Conversations Sidebar */}
          <div className="w-[360px] border-r border-gray-200 flex flex-col bg-gray-50 flex-shrink-0">
            {/* Tabs */}
            <div className="p-3 border-b border-gray-200 bg-white">
              <Tabs activeTab={activeTab} onActiveTabChange={setActiveTab}>
                <Tabs.Item active={activeTab === 'all'} title={
                  <div className="flex items-center gap-2">
                    <HiChat className="h-4 w-4" />
                    <span>All</span>
                  </div>
                } />
                <Tabs.Item active={activeTab === 'landlords'} title={
                  <div className="flex items-center gap-2">
                    <HiHome className="h-4 w-4" />
                    <span>Landlords</span>
                  </div>
                } />
                <Tabs.Item active={activeTab === 'tenants'} title={
                  <div className="flex items-center gap-2">
                    <HiUserGroup className="h-4 w-4" />
                    <span>Tenants</span>
                  </div>
                } />
              </Tabs>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-1.5">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Spinner size="xl" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No conversations</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredConversations.map((conversation) => {
                    const isUnread = !conversation.pmcLastReadAt || 
                      (conversation.lastMessage && new Date(conversation.lastMessage.createdAt) > new Date(conversation.pmcLastReadAt));
                    const isSelected = selectedConversation?.id === conversation.id;
                    
                    return (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`p-3 mb-1 rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-blue-50 border border-blue-500' 
                            : isUnread 
                              ? 'bg-blue-50 border border-transparent hover:bg-gray-100' 
                              : 'bg-transparent border border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar
                            size="md"
                            img={null}
                            rounded
                            className={`${
                              getParticipantType(conversation) === 'landlord' ? 'bg-blue-600' : 'bg-green-600'
                            }`}
                          >
                            <HiUser className="h-5 w-5 text-white" />
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <span className={`font-semibold text-sm flex-1 truncate ${isUnread ? 'text-blue-600' : ''}`}>
                                {conversation.subject}
                              </span>
                              {isUnread && (
                                <div className="w-2 h-2 rounded-full bg-red-600 ml-2 mt-1 flex-shrink-0" />
                              )}
                            </div>
                            <div className="mb-1.5 flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-gray-500">
                                {getParticipantName(conversation)}
                              </span>
                              <Badge 
                                size="sm" 
                                color={getParticipantType(conversation) === 'landlord' ? 'blue' : 'success'}
                              >
                                {getParticipantType(conversation) === 'landlord' ? 'Landlord' : 'Tenant'}
                              </Badge>
                            </div>
                            {conversation.property && (
                              <div className="mb-1">
                                <Badge size="sm" icon={HiHome} color="gray">
                                  {conversation.property.propertyName || conversation.property.addressLine1}
                                </Badge>
                              </div>
                            )}
                            {conversation.lastMessage && (
                              <span className={`text-xs block mt-1 truncate ${
                                isUnread ? 'text-blue-600' : 'text-gray-500'
                              }`}>
                                {formatDateTimeDisplay(conversation.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center mb-1.5">
                    <h5 className="text-base font-semibold m-0">
                      {selectedConversation.subject}
                    </h5>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      color={getParticipantType(selectedConversation) === 'landlord' ? 'blue' : 'success'}
                      icon={getParticipantType(selectedConversation) === 'landlord' ? HiHome : HiUserGroup}
                    >
                      {getParticipantType(selectedConversation) === 'landlord' ? 'Landlord' : 'Tenant'}: {getParticipantName(selectedConversation)}
                    </Badge>
                    {selectedConversation.property && (
                      <Badge icon={HiHome} color="gray">
                        {selectedConversation.property.propertyName || selectedConversation.property.addressLine1}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <HiChat className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, index) => {
                        const isPMC = msg.senderRole === 'pmc';
                        const showDateSeparator = index === 0 || 
                          new Date(msg.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();
                        
                        return (
                          <div key={msg.id}>
                            {showDateSeparator && (
                              <div className="text-center my-4 relative">
                                <div className="inline-block px-3 py-1 bg-white rounded-full text-xs text-gray-500 border border-gray-200">
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
                              className={`mb-4 flex items-end gap-3 ${
                                isPMC ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              {!isPMC && (
                                <Avatar 
                                  size="md"
                                  img={null}
                                  rounded
                                  className={`flex-shrink-0 ${
                                    getParticipantType(selectedConversation) === 'landlord' ? 'bg-blue-600' : 'bg-green-600'
                                  }`}
                                >
                                  <HiUser className="h-5 w-5 text-white" />
                                </Avatar>
                              )}
                              <div className={`max-w-[65%] flex flex-col ${
                                isPMC ? 'items-end' : 'items-start'
                              }`}>
                                <div
                                  className={`px-4 py-3 rounded-2xl shadow-sm break-words ${
                                    isPMC 
                                      ? 'bg-blue-600 text-white rounded-br-sm' 
                                      : 'bg-white text-gray-800 rounded-bl-sm'
                                  }`}
                                >
                                  <div className="text-sm whitespace-pre-wrap">
                                    {msg.messageText || msg.content}
                                  </div>
                                </div>
                                <span className="text-xs text-gray-500 mt-1 px-1">
                                  {formatDateTimeDisplay(msg.createdAt)}
                                </span>
                              </div>
                              {isPMC && (
                                <Avatar 
                                  size="md"
                                  img={null}
                                  rounded
                                  className="flex-shrink-0 bg-blue-600"
                                >
                                  <HiUser className="h-5 w-5 text-white" />
                                </Avatar>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-3 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      rows={2}
                      className="flex-1 rounded-lg resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      color="blue"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="flex items-center gap-2 px-5"
                    >
                      <HiPaperAirplane className="h-4 w-4" />
                      Send
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full flex-col gap-4">
                <HiChat className="h-16 w-16 text-gray-300" />
                <div className="text-center">
                  <p className="text-gray-500 text-base mb-2">
                    Select a conversation to view messages
                  </p>
                  <Button 
                    color="blue" 
                    onClick={openCreateModalForCreate}
                    className="flex items-center gap-2"
                  >
                    <HiPlus className="h-4 w-4" />
                    Start New Conversation
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Create Conversation Modal */}
      <Modal
        show={createModalVisible}
        onClose={() => {
          closeCreateModal();
          createForm.resetFields();
        }}
        size="md"
      >
        <Modal.Header>New Conversation</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleCreateConversation} className="space-y-4">
            <div>
              <Label htmlFor="contactType" className="mb-2">
                Contact Type <span className="text-red-500">*</span>
              </Label>
              <Select
                id="contactType"
                name="contactType"
                value={createForm.values.contactType || 'landlord'}
                onChange={(e) => {
                  createForm.setFieldsValue({ contactType: e.target.value });
                  createForm.setFieldsValue({ landlordId: '', tenantId: '' });
                }}
                required
              >
                <option value="landlord">Landlord</option>
                <option value="tenant">Tenant</option>
              </Select>
            </div>

            {createForm.values.contactType === 'landlord' && (
              <div>
                <Label htmlFor="landlordId" className="mb-2">
                  Landlord <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="landlordId"
                  name="landlordId"
                  value={createForm.values.landlordId || ''}
                  onChange={(e) => createForm.setFieldsValue({ landlordId: e.target.value })}
                  required
                >
                  <option value="">Select landlord</option>
                  {(Array.isArray(landlords) ? landlords : []).map((landlord) => {
                    if (!landlord || !landlord.id) return null;
                    return (
                      <option key={landlord.id} value={landlord.id}>
                        {landlord.firstName} {landlord.lastName} ({landlord.email})
                      </option>
                    );
                  })}
                </Select>
              </div>
            )}

            {createForm.values.contactType === 'tenant' && (
              <div>
                <Label htmlFor="tenantId" className="mb-2">
                  Tenant <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="tenantId"
                  name="tenantId"
                  value={createForm.values.tenantId || ''}
                  onChange={(e) => createForm.setFieldsValue({ tenantId: e.target.value })}
                  required
                >
                  <option value="">Select tenant</option>
                  {(Array.isArray(tenants) ? tenants : []).map((tenant) => {
                    if (!tenant || !tenant.id) return null;
                    return (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.firstName} {tenant.lastName} ({tenant.email})
                      </option>
                    );
                  })}
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="subject" className="mb-2">
                Subject <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id="subject"
                name="subject"
                type="text"
                placeholder="Conversation subject"
                value={createForm.values.subject || ''}
                onChange={(e) => createForm.setFieldsValue({ subject: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="initialMessage" className="mb-2">
                Initial Message <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="initialMessage"
                name="initialMessage"
                rows={4}
                placeholder="Start the conversation..."
                value={createForm.values.initialMessage || ''}
                onChange={(e) => createForm.setFieldsValue({ initialMessage: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button color="gray" onClick={() => {
                closeCreateModal();
                createForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button color="blue" type="submit" className="flex items-center gap-2">
                <HiPlus className="h-4 w-4" />
                Create
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
