import { apiRequest, toQueryString } from '../lib/api-client';

export interface ChatPartner {
  id: string;
  name: string;
  age: number;
  city: string;
  state: string;
  role: string;
  avatar: string | null;
}

export interface ConversationSummary {
  conversationId: string;
  partner: ChatPartner | null;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  lastReadAt: string | null;
  isMuted: boolean;
  isArchived: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  seenAt: string | null;
  createdAt: string;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getConversationsApi = async (): Promise<ConversationSummary[]> => {
  return apiRequest<ConversationSummary[]>('/chat/conversations');
};

export const startConversationApi = async (targetUserId: string): Promise<{ conversationId: string; isNew: boolean }> => {
  return apiRequest<{ conversationId: string; isNew: boolean }>('/chat/conversations/start', {
    method: 'POST',
    body: JSON.stringify({ targetUserId }),
  });
};

export const getMessagesApi = async (
  conversationId: string,
  page: number = 1,
  limit: number = 50
): Promise<MessagesResponse> => {
  return apiRequest<MessagesResponse>(
    `/chat/conversations/${conversationId}/messages${toQueryString({ page, limit })}`
  );
};
