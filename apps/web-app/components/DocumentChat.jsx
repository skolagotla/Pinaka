"use client";
import { useState, useEffect, useRef } from 'react';
import { Card, Textarea, Button, Avatar, Badge, Spinner } from 'flowbite-react';
import { Empty } from '@/components/shared';
import { HiChat, HiPaperAirplane, HiUser } from 'react-icons/hi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { notify } from '@/lib/utils/notification-helper';

dayjs.extend(relativeTime);

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
      const { v2Api } = await import('@/lib/api/v2-client');
      const data = await v2Api.specialized.getDocumentMessages(documentId);
      setMessages(data);
      setTimeout(scrollToBottom, 100);
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
      const { v2Api } = await import('@/lib/api/v2-client');
      const sentMessage = await v2Api.specialized.sendDocumentMessage(documentId, newMessage.trim());
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage('');
      setTimeout(scrollToBottom, 100);
      notify.success('Message sent');
    } catch (error) {
      console.error('[DocumentChat] Error sending message:', error);
      notify.error('Failed to send message');
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
    <Card className="h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiChat className="h-5 w-5" />
          <h3 className="font-semibold">Discussion</h3>
          {unreadCount > 0 && (
            <Badge color="blue">{unreadCount}</Badge>
          )}
        </div>
        {onClose && (
          <Button color="light" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900"
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner size="xl" />
          </div>
        ) : (() => {
          const systemMessages = getSystemMessages();
          const allMessages = [...systemMessages, ...messages];
          return allMessages.length === 0 ? (
            <Empty description="No messages yet">
              <p className="text-sm text-gray-500 mt-2">
                Start a conversation about this document
              </p>
            </Empty>
          ) : (
            <div className="space-y-3">
              {allMessages.map((msg) => {
                const isCurrentUser = msg.senderRole === userRole;
                const isSystemMessage = msg.isSystem;
                
                // System message styling
                if (isSystemMessage) {
                  return (
                    <div
                      key={msg.id}
                      className="flex justify-center w-full"
                    >
                      <div
                        className={`max-w-[90%] p-3 rounded-lg text-center ${
                          msg.type === 'approved'
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                            : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                        }`}
                      >
                        <p
                          className={`text-xs font-semibold mb-1 uppercase tracking-wide ${
                            msg.type === 'approved' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                          }`}
                        >
                          {msg.type === 'approved' ? '✓ Document Approved' : '✗ Document Rejected'}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {msg.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          by {msg.senderName} • {dayjs(msg.createdAt).fromNow()}
                        </p>
                      </div>
                    </div>
                  );
                }
                
                // Regular message styling
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${
                      isCurrentUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isCurrentUser && (
                      <Avatar
                        placeholderInitials={msg.senderName?.[0] || 'U'}
                        className={`${
                          msg.senderRole === 'landlord' ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                      />
                    )}
                    <div
                      className={`max-w-[70%] p-2 rounded-lg ${
                        isCurrentUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {!isCurrentUser && (
                        <p className="text-xs font-semibold mb-1 text-blue-600 dark:text-blue-400">
                          {msg.senderName}
                        </p>
                      )}
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {dayjs(msg.createdAt).fromNow()}
                      </p>
                    </div>
                    {isCurrentUser && (
                      <Avatar
                        placeholderInitials={userName?.[0] || 'U'}
                        className={`${
                          userRole === 'landlord' ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          );
        })()}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
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
            placeholder="Type a message... (Shift+Enter for new line)"
            rows={2}
            className="flex-1"
          />
          <Button
            color="blue"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="flex items-center gap-2"
          >
            {sending ? (
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
    </Card>
  );
}
