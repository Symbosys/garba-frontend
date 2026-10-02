import { useEffect, useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConversationsApi,
  getMessagesApi,
  startConversationApi,
  ConversationSummary,
  ChatMessage,
} from '../../api/chat';
import { getSocket } from '../../lib/socket';

export const CHAT_QUERY_KEYS = {
  conversations: ['chat', 'conversations'] as const,
  messages: (convId: string | null) => ['chat', 'messages', convId] as const,
};

/**
 * Hook to fetch & manage real-time conversations list
 */
export const useConversations = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CHAT_QUERY_KEYS.conversations,
    queryFn: getConversationsApi,
    staleTime: 10_000,
  });

  // Listen for global real-time new message notifications to update list
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = (data: { conversationId: string; message: ChatMessage }) => {
      queryClient.setQueryData<ConversationSummary[]>(
        CHAT_QUERY_KEYS.conversations,
        (old = []) => {
          const index = old.findIndex((c) => c.conversationId === data.conversationId);
          if (index !== -1) {
            const updated = [...old];
            const existing = updated[index];
            updated[index] = {
              ...existing,
              lastMessageText: data.message.content,
              lastMessageAt: data.message.createdAt,
              unreadCount: existing.unreadCount + 1,
            };
            // Move updated conversation to top
            return [updated[index], ...updated.filter((_, i) => i !== index)];
          }
          // If conversation not in list yet, refetch
          queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.conversations });
          return old;
        }
      );
    };

    const handleMessagesSeen = (data: { conversationId: string; seenAt: string }) => {
      queryClient.setQueryData<ConversationSummary[]>(
        CHAT_QUERY_KEYS.conversations,
        (old = []) =>
          old.map((c) =>
            c.conversationId === data.conversationId ? { ...c, unreadCount: 0 } : c
          )
      );
    };

    socket.on('new_message_notification', handleNewNotification);
    socket.on('unread_count_reset', handleMessagesSeen);

    return () => {
      socket.off('new_message_notification', handleNewNotification);
      socket.off('unread_count_reset', handleMessagesSeen);
    };
  }, [queryClient]);

  return query;
};

/**
 * Hook to manage real-time active conversation chat stream
 */
export const useActiveChat = (conversationId: string | null, currentUserId?: string) => {
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);
  const isTypingActiveRef = useRef(false);
  const stopTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingIndicatorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Fetch initial message history
  const messagesQuery = useQuery({
    queryKey: CHAT_QUERY_KEYS.messages(conversationId),
    queryFn: async () => {
      if (!conversationId) return [];
      const res = await getMessagesApi(conversationId, 1, 100);
      return res.messages;
    },
    enabled: !!conversationId,
    staleTime: Infinity, // Real-time updates managed by socket
  });

  // 2. Manage Socket connection, Room Joining, and Real-Time Listeners
  useEffect(() => {
    if (!conversationId) return;

    const socket = getSocket();
    if (!socket) return;

    // Reset local typing state on conversation change
    setIsTyping(false);
    isTypingActiveRef.current = false;
    if (stopTypingTimeoutRef.current) clearTimeout(stopTypingTimeoutRef.current);
    if (typingIndicatorTimeoutRef.current) clearTimeout(typingIndicatorTimeoutRef.current);

    // Join conversation room
    socket.emit('join_conversation', { conversationId });

    // Mark seen on join
    socket.emit('mark_seen', { conversationId });

    // Listen for new messages
    const handleNewMessage = (payload: { message: ChatMessage; conversationId: string }) => {
      if (payload.conversationId === conversationId) {
        queryClient.setQueryData<ChatMessage[]>(
          CHAT_QUERY_KEYS.messages(conversationId),
          (old = []) => {
            // Avoid duplicate if already optimistically added
            if (old.some((m) => m.id === payload.message.id)) return old;
            return [...old, payload.message];
          }
        );

        // If message sent by the other partner while this chat is open, auto-mark seen
        if (payload.message.senderId !== currentUserId) {
          socket.emit('mark_seen', { conversationId });
          setIsTyping(false);
          if (typingIndicatorTimeoutRef.current) clearTimeout(typingIndicatorTimeoutRef.current);
        }
      }
    };

    // Listen for seen status updates (Double blue checkmarks ✓✓)
    const handleMessagesSeen = (payload: { conversationId: string; seenAt: string; seenBy: string }) => {
      if (payload.conversationId === conversationId) {
        queryClient.setQueryData<ChatMessage[]>(
          CHAT_QUERY_KEYS.messages(conversationId),
          (old = []) =>
            old.map((m) => {
              if (m.senderId === currentUserId && (!m.seenAt || m.status !== 'READ')) {
                return { ...m, status: 'READ', seenAt: payload.seenAt };
              }
              return m;
            })
        );
      }
    };

    // Listen for typing indicator with 3.5-second debounce
    const handleUserTyping = (payload: { conversationId: string; isTyping: boolean }) => {
      if (payload.conversationId === conversationId) {
        if (payload.isTyping) {
          setIsTyping(true);
          if (typingIndicatorTimeoutRef.current) {
            clearTimeout(typingIndicatorTimeoutRef.current);
          }
          // Auto-clear typing indicator after 3.5 seconds of inactivity
          typingIndicatorTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 3500);
        } else {
          if (typingIndicatorTimeoutRef.current) {
            clearTimeout(typingIndicatorTimeoutRef.current);
          }
          setIsTyping(false);
        }
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('messages_seen', handleMessagesSeen);
    socket.on('user_typing', handleUserTyping);

    return () => {
      if (stopTypingTimeoutRef.current) clearTimeout(stopTypingTimeoutRef.current);
      if (typingIndicatorTimeoutRef.current) clearTimeout(typingIndicatorTimeoutRef.current);
      socket.emit('leave_conversation', { conversationId });
      socket.off('new_message', handleNewMessage);
      socket.off('messages_seen', handleMessagesSeen);
      socket.off('user_typing', handleUserTyping);
    };
  }, [conversationId, currentUserId, queryClient]);

  // 3. Send message via WebSocket
  const sendMessage = useCallback(
    (content: string, clientTempId?: string) => {
      if (!conversationId || !content.trim()) return;

      const socket = getSocket();
      if (!socket) return;

      const tempId = clientTempId || `temp-${Date.now()}`;

      // Optimistic message addition
      if (currentUserId) {
        const optimisticMsg: ChatMessage = {
          id: tempId,
          conversationId,
          senderId: currentUserId,
          senderName: 'Me',
          senderAvatar: null,
          content: content.trim(),
          status: 'SENT',
          seenAt: null,
          createdAt: new Date().toISOString(),
        };

        queryClient.setQueryData<ChatMessage[]>(
          CHAT_QUERY_KEYS.messages(conversationId),
          (old = []) => [...old, optimisticMsg]
        );
      }

      // Stop typing immediately when sending
      if (stopTypingTimeoutRef.current) clearTimeout(stopTypingTimeoutRef.current);
      if (isTypingActiveRef.current) {
        isTypingActiveRef.current = false;
        socket.emit('typing_stop', { conversationId });
      }

      // Emit over WebSocket
      socket.emit(
        'send_message',
        {
          conversationId,
          content: content.trim(),
          clientTempId: tempId,
        },
        (res: { success: boolean; data?: ChatMessage; clientTempId?: string; message?: string }) => {
          if (res.success && res.data) {
            // Replace optimistic with real DB message
            queryClient.setQueryData<ChatMessage[]>(
              CHAT_QUERY_KEYS.messages(conversationId),
              (old = []) =>
                old.map((m) => (m.id === res.clientTempId ? res.data! : m))
            );
          }
        }
      );
    },
    [conversationId, currentUserId, queryClient]
  );

  // 4. Typing indicator triggers with 3.5-second debounce
  const sendTyping = useCallback(
    (isTypingNow: boolean) => {
      if (!conversationId) return;
      const socket = getSocket();
      if (!socket) return;

      if (isTypingNow) {
        // Emit start typing event once when user starts typing
        if (!isTypingActiveRef.current) {
          isTypingActiveRef.current = true;
          socket.emit('typing_start', { conversationId });
        }

        // Debounce typing_stop by 3.5 seconds
        if (stopTypingTimeoutRef.current) {
          clearTimeout(stopTypingTimeoutRef.current);
        }

        stopTypingTimeoutRef.current = setTimeout(() => {
          isTypingActiveRef.current = false;
          socket.emit('typing_stop', { conversationId });
        }, 3500); // 3.5 sec debouncing
      } else {
        if (stopTypingTimeoutRef.current) {
          clearTimeout(stopTypingTimeoutRef.current);
        }
        if (isTypingActiveRef.current) {
          isTypingActiveRef.current = false;
          socket.emit('typing_stop', { conversationId });
        }
      }
    },
    [conversationId]
  );

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    isTyping,
    sendMessage,
    sendTyping,
  };
};

/**
 * Hook to initiate or open conversation with a target partner
 */
export const useStartConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: string) => startConversationApi(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.conversations });
    },
  });
};
