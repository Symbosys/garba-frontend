import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useConversations, useActiveChat } from '../../hooks/chat/useChat';
import { ShareContactModal } from '../../components/modals/ShareContactModal';
import { ReportModal } from '../../components/modals/ReportModal';
import { BlockModal } from '../../components/modals/BlockModal';
import { User } from '../../types';
import {
  Search,
  Send,
  Smile,
  Phone,
  MoreVertical,
  CheckCheck,
  Check,
  CheckCircle2,
  Users,
  ArrowLeft,
  Flag,
  Ban,
  Loader2,
  Calendar,
  Image as ImageIcon,
  Paperclip,
} from 'lucide-react';

interface ChatMessageItem {
  id: string;
  sender: 'me' | 'other';
  senderId?: string;
  senderName: string;
  senderAvatar?: string | null;
  text: string;
  time: string;
  status?: 'SENT' | 'DELIVERED' | 'READ';
  seenAt?: string | null;
}

interface DynamicConversationItem {
  id: string;
  partnerId?: string;
  name: string;
  age?: number;
  avatar: string;
  isOnline: boolean;
  isVerified: boolean;
  isGroup?: boolean;
  city?: string;
  state?: string;
  eventName?: string;
  lastMessage: string;
  lastMessageAt?: string | null;
  time: string;
  unreadCount: number;
  type: 'match' | 'group' | 'organizer';
}

const DEFAULT_CONVERSATIONS: DynamicConversationItem[] = [
  {
    id: 'conv-riya',
    partnerId: 'user-riya',
    name: 'Riya',
    age: 22,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    isOnline: true,
    isVerified: true,
    eventName: 'Going to Ranchi Garba Night 2026',
    lastMessage: "Great! I'm also intermediate...",
    time: '10:24 AM',
    unreadCount: 2,
    type: 'match',
  },
  {
    id: 'conv-rahul',
    partnerId: 'user-rahul',
    name: 'Rahul',
    age: 24,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    isOnline: true,
    isVerified: true,
    eventName: 'Going to Ranchi Garba Night 2026',
    lastMessage: 'Are you coming with a group...',
    time: '9:15 AM',
    unreadCount: 1,
    type: 'match',
  },
  {
    id: 'conv-neha',
    partnerId: 'user-neha',
    name: 'Neha',
    age: 21,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    isOnline: false,
    isVerified: true,
    eventName: 'Going to Dandiya Dhoom Extravaganza',
    lastMessage: "Let's meet at the main gate 😊",
    time: '8:30 AM',
    unreadCount: 1,
    type: 'match',
  },
  {
    id: 'conv-squad',
    name: 'Garba Squad',
    avatar: '',
    isOnline: false,
    isVerified: true,
    isGroup: true,
    eventName: 'Going to Ranchi Garba Night 2026',
    lastMessage: 'Aditya: Sure, see you there!',
    time: 'Yesterday',
    unreadCount: 4,
    type: 'group',
  },
  {
    id: 'conv-aditya',
    partnerId: 'user-aditya',
    name: 'Aditya',
    age: 25,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    isOnline: true,
    isVerified: false,
    eventName: 'Going to Ranchi Garba Night ...',
    lastMessage: "Yes, I'll be there!",
    time: 'Yesterday',
    unreadCount: 0,
    type: 'match',
  },
  {
    id: 'conv-karan',
    partnerId: 'user-karan',
    name: 'Karan',
    age: 26,
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    isOnline: false,
    isVerified: true,
    eventName: 'Going to Navratri Fusion Beats',
    lastMessage: 'Okay, sounds good 👍',
    time: '18 Oct',
    unreadCount: 0,
    type: 'match',
  },
  {
    id: 'conv-priya',
    partnerId: 'user-priya',
    name: 'Priya',
    age: 23,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    isOnline: false,
    isVerified: true,
    eventName: 'Going to Ranchi Garba Night 2026',
    lastMessage: 'Are you attending the 19 Oct event?',
    time: '17 Oct',
    unreadCount: 0,
    type: 'match',
  },
];

const DEFAULT_MESSAGES_MAP: Record<string, ChatMessageItem[]> = {
  'conv-aditya': [
    {
      id: 'aditya-1',
      sender: 'other',
      senderName: 'Aditya',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      text: "Yes, I'll be there! Let me know when you arrive.",
      time: 'Yesterday',
      status: 'READ',
    },
  ],
  'conv-riya': [
    {
      id: 'riya-1',
      sender: 'other',
      senderName: 'Riya',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      text: 'Hey! Are you attending the 18 Oct event?',
      time: '10:20 AM',
      status: 'READ',
    },
    {
      id: 'riya-2',
      sender: 'other',
      senderName: 'Riya',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      text: "Great! I'm also intermediate...",
      time: '10:24 AM',
      status: 'READ',
    },
  ],
};

function formatChatTime(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return 'Yesterday';
  }

  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

export const MessagesPage: React.FC = () => {
  const { currentUser, users } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryConvId = searchParams.get('id') || searchParams.get('convId');

  // 1. Fetch live dynamic conversations from backend API
  const { data: apiConversations, isLoading: isConversationsLoading } = useConversations();

  // Transform backend API conversations to list or fallback to default
  const conversationList: DynamicConversationItem[] = useMemo(() => {
    if (apiConversations && apiConversations.length > 0) {
      const dynamicList = apiConversations.map((c) => {
        const partnerName = c.partner?.name || 'Garba Partner';
        const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          c.partner?.id || c.conversationId
        )}`;

        return {
          id: c.conversationId,
          partnerId: c.partner?.id,
          name: partnerName,
          age: c.partner?.age || undefined,
          avatar: c.partner?.avatar || defaultAvatar,
          isOnline: true,
          isVerified: true,
          city: c.partner?.city || undefined,
          state: c.partner?.state || undefined,
          eventName: c.partner?.city ? `Going to ${c.partner.city} Garba Night ...` : 'Going to Ranchi Garba Night ...',
          lastMessage: c.lastMessageText || 'No messages yet',
          lastMessageAt: c.lastMessageAt,
          time: formatChatTime(c.lastMessageAt),
          unreadCount: c.unreadCount || 0,
          type: 'match' as const,
        };
      });

      // Merge remaining default conversations for full UI representation
      const existingIds = new Set(dynamicList.map((d) => d.id));
      const remainingDefaults = DEFAULT_CONVERSATIONS.filter((d) => !existingIds.has(d.id));
      return [...dynamicList, ...remainingDefaults];
    }

    return DEFAULT_CONVERSATIONS;
  }, [apiConversations]);

  const [selectedConvId, setSelectedConvId] = useState<string>(() => {
    if (queryConvId) return queryConvId;
    return '';
  });

  // Sync selected conversation with URL parameter or default to first conversation on desktop
  useEffect(() => {
    if (queryConvId && selectedConvId !== queryConvId) {
      setSelectedConvId(queryConvId);
    } else if (!selectedConvId && conversationList.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 768) {
      setSelectedConvId(conversationList[0].id);
    }
  }, [queryConvId, conversationList, selectedConvId]);

  const [activeTab, setActiveTab] = useState<'all' | 'matches' | 'groups'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);

  // 2. Active Chat hook with real-time WebSocket connection
  const {
    messages: liveMessages,
    isTyping,
    sendMessage,
    sendTyping,
  } = useActiveChat(selectedConvId || null, currentUser?.id);

  // Keep window firmly at top when entering messages screen
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  // Resolve currently active conversation object
  const activeConversation: DynamicConversationItem | null = useMemo(() => {
    if (!selectedConvId) {
      return conversationList[0] || null;
    }
    return conversationList.find((c) => c.id === selectedConvId) || conversationList[0] || null;
  }, [conversationList, selectedConvId]);

  // Construct target user representation for safety modals
  const targetUser: User | null = useMemo(() => {
    if (!activeConversation) return null;
    const found = users.find(
      (u) =>
        (activeConversation.partnerId && u.id === activeConversation.partnerId) ||
        u.name.toLowerCase() === activeConversation.name.toLowerCase()
    );
    if (found) return found;

    return {
      id: activeConversation.partnerId || activeConversation.id,
      name: activeConversation.name,
      email: '',
      avatar: activeConversation.avatar,
      age: activeConversation.age || 25,
      gender: 'Other',
      city: activeConversation.city || 'Ahmedabad',
      area: '',
      bio: '',
      garbaLevel: 'Intermediate',
      dandiyaLevel: 'Intermediate',
      danceStyle: 'Traditional',
      lookingFor: ['Partner'],
      preferredGender: 'Any',
      preferredAgeMin: 18,
      preferredAgeMax: 40,
      preferredEvents: [],
      availability: { dates: [], startTime: '', endTime: '' },
      isVerified: { mobile: true, email: true, photo: true },
      role: 'user',
      isPremium: false,
      profileCompletion: 80,
      joinedAt: new Date().toISOString(),
      status: 'active',
    };
  }, [activeConversation, users]);

  // Merge live socket messages for rendering with default mock fallback
  const displayMessages: ChatMessageItem[] = useMemo(() => {
    if (liveMessages && liveMessages.length > 0) {
      return liveMessages.map((m) => ({
        id: m.id,
        sender: (m.senderId === currentUser?.id ? 'me' : 'other') as 'me' | 'other',
        senderId: m.senderId,
        senderName: m.senderName,
        senderAvatar: m.senderAvatar,
        text: m.content,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: m.status,
        seenAt: m.seenAt,
      }));
    }

    if (selectedConvId && DEFAULT_MESSAGES_MAP[selectedConvId]) {
      return DEFAULT_MESSAGES_MAP[selectedConvId];
    }

    return [];
  }, [liveMessages, selectedConvId, currentUser?.id]);

  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  // Only scroll inner container when new messages arrive (never triggers window scroll)
  useEffect(() => {
    if (displayMessages.length > prevMessagesLengthRef.current) {
      scrollToBottom(true);
    }
    prevMessagesLengthRef.current = displayMessages.length;
  }, [displayMessages.length]);

  // Instant scroll to bottom when opening a conversation
  useEffect(() => {
    if (selectedConvId) {
      const timer = setTimeout(() => scrollToBottom(false), 50);
      return () => clearTimeout(timer);
    }
  }, [selectedConvId]);

  const filteredConversations = useMemo(() => {
    return conversationList.filter((conv) => {
      if (activeTab === 'matches' && conv.type !== 'match') return false;
      if (activeTab === 'groups' && conv.type !== 'group') return false;
      if (searchQuery.trim()) {
        return (
          conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return true;
    });
  }, [conversationList, activeTab, searchQuery]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Send real-time message over WebSocket
    sendMessage(inputText.trim());
    sendTyping(false);
    setInputText('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    sendTyping(true);
  };

  const handleSelectConversation = (convId: string) => {
    setSelectedConvId(convId);
    setSearchParams({ id: convId });
  };

  return (
    <div className="w-full bg-[#FAF7FD] min-h-[100dvh] md:min-h-[calc(100vh-80px)] flex flex-col justify-stretch">
      <div className="max-w-[1400px] w-full mx-auto md:px-4 lg:px-6 md:py-4 h-[100dvh] md:h-[calc(100vh-85px)]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-6 h-full items-stretch">
          {/* ================= LEFT PANEL: CONVERSATIONS LIST (Image 1) ================= */}
          <div
            className={`md:col-span-4 lg:col-span-4 bg-white md:rounded-3xl md:border md:border-slate-200/90 md:shadow-xs flex flex-col overflow-hidden h-full ${
              selectedConvId ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Header: ArrowLeft + Messages (10) */}
            <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 space-y-3.5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="p-1 -ml-1 text-slate-800 hover:text-pink-600 transition-colors cursor-pointer"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading flex items-center gap-2">
                  <span>Messages</span>
                  <span className="text-slate-500 font-normal text-lg">
                    ({conversationList.length > 0 ? conversationList.length : 10})
                  </span>
                </h1>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-pink-500 transition-all"
                />
              </div>

              {/* Filter Tabs matching Image 1 */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-[#FDF2F8] text-[#E60067] border border-pink-200 shadow-2xs'
                      : 'bg-[#F1F5F9] text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>All</span>
                  <span
                    className={`w-5 h-5 rounded-full text-[11px] font-extrabold flex items-center justify-center text-white ${
                      activeTab === 'all' ? 'bg-[#E60067]' : 'bg-slate-400'
                    }`}
                  >
                    {conversationList.length > 0 ? conversationList.length : 8}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('matches')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'matches'
                      ? 'bg-[#FDF2F8] text-[#E60067] border border-pink-200 shadow-2xs'
                      : 'bg-[#F1F5F9] text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Matches
                </button>

                <button
                  onClick={() => setActiveTab('groups')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'groups'
                      ? 'bg-[#FDF2F8] text-[#E60067] border border-pink-200 shadow-2xs'
                      : 'bg-[#F1F5F9] text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Groups
                </button>
              </div>
            </div>

            {/* Conversations List matching Image 1 */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1 divide-y divide-transparent">
              {isConversationsLoading && conversationList.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#E60067]" />
                  <p className="text-xs text-slate-400 font-medium">Loading conversations…</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedConvId === conv.id;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`w-full text-left p-3 rounded-2xl transition-all flex items-center gap-3 border cursor-pointer ${
                        isSelected
                          ? 'bg-pink-50/70 border-pink-200 shadow-2xs'
                          : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      {/* Avatar with Online indicator */}
                      <div className="relative flex-shrink-0">
                        {conv.isGroup ? (
                          <div className="w-12 h-12 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold shadow-xs">
                            <Users className="w-6 h-6" />
                          </div>
                        ) : (
                          <img
                            src={conv.avatar}
                            alt={conv.name}
                            className="w-12 h-12 rounded-full object-cover ring-1 ring-slate-200 shadow-xs"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                                conv.name
                              )}`;
                            }}
                          />
                        )}
                        {conv.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                        )}
                      </div>

                      {/* Name & Last Message */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-base font-bold text-slate-900 truncate font-heading">{conv.name}</span>
                            {conv.isVerified && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100 flex-shrink-0" />
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-medium whitespace-nowrap ml-2">
                            {conv.time}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-slate-500 truncate pr-2 font-normal leading-tight">
                            {conv.lastMessage}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-[#E60067] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 shadow-2xs">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ================= RIGHT PANEL: ACTIVE CHAT SCREEN (Image 2) ================= */}
          <div
            className={`md:col-span-8 lg:col-span-8 bg-white md:rounded-3xl md:border md:border-slate-200/90 md:shadow-xs flex flex-col overflow-hidden h-full ${
              !selectedConvId ? 'hidden md:flex' : 'flex'
            }`}
          >
            {activeConversation ? (
              <>
                {/* Chat Top Header matching Image 2 */}
                <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Back Button */}
                    <button
                      onClick={() => {
                        setSelectedConvId('');
                        setSearchParams({});
                      }}
                      className="p-1 -ml-1 rounded-xl text-slate-800 hover:text-pink-600 transition-colors flex-shrink-0 cursor-pointer"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
                    </button>

                    {/* Avatar with Online Dot */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={activeConversation.avatar}
                        alt={activeConversation.name}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-1 ring-slate-100 shadow-xs"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                            activeConversation.name
                          )}`;
                        }}
                      />
                      {activeConversation.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                      )}
                    </div>

                    {/* Partner Name & Subtitle */}
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate font-heading">
                        {activeConversation.name}
                        {activeConversation.age ? `, ${activeConversation.age}` : ''}
                      </h2>

                      {/* Subtitle with Calendar icon */}
                      <p className="text-xs text-slate-600 font-normal truncate flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-[#E60067] flex-shrink-0 fill-pink-50" />
                        <span className="truncate">{activeConversation.eventName || 'Going to Ranchi Garba Night ...'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Header Right Action Buttons: Phone & More */}
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="p-2 rounded-full text-slate-700 hover:text-[#E60067] hover:bg-pink-50 transition-colors cursor-pointer"
                      title="Call Partner"
                    >
                      <Phone className="w-5 h-5" />
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                        className="p-2 rounded-full text-slate-700 hover:text-[#E60067] hover:bg-pink-50 transition-colors cursor-pointer"
                        title="More options"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {showOptionsMenu && (
                        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-2xl border border-slate-100 p-1.5 z-30 text-xs font-semibold animate-in fade-in zoom-in-95">
                          <button
                            onClick={() => {
                              setIsShareModalOpen(true);
                              setShowOptionsMenu(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-pink-50 cursor-pointer"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#E60067]" />
                            Share Contact
                          </button>
                          <button
                            onClick={() => {
                              setIsReportModalOpen(true);
                              setShowOptionsMenu(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Flag className="w-3.5 h-3.5" />
                            Report Partner
                          </button>
                          <button
                            onClick={() => {
                              setIsBlockModalOpen(true);
                              setShowOptionsMenu(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Block User
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chat Messages Body matching Image 2 */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF7FD]"
                >
                  {/* Today Date Badge */}
                  <div className="flex justify-center mb-2">
                    <span className="px-3.5 py-1 rounded-full bg-[#E2E8F0]/90 text-slate-600 text-xs font-semibold shadow-2xs">
                      Today
                    </span>
                  </div>

                  {displayMessages.map((msg) => {
                    const isMe = msg.sender === 'me';
                    const isSeen = msg.status === 'READ' || !!msg.seenAt;

                    return (
                      <div key={msg.id} className="space-y-1">
                        <div className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {/* Left Sender Avatar (Image 2 style) */}
                          {!isMe && (
                            <img
                              src={msg.senderAvatar || activeConversation.avatar}
                              alt="sender"
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 flex-shrink-0 mb-5 shadow-2xs"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                                  msg.senderName || activeConversation.name
                                )}`;
                              }}
                            />
                          )}

                          <div className="space-y-1 max-w-[82%] sm:max-w-md">
                            {/* Message Bubble (Image 2 style) */}
                            <div
                              className={`p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed shadow-2xs ${
                                isMe
                                  ? 'bg-[#FCE7F3] text-slate-900 rounded-tr-xs font-normal border border-pink-200/60'
                                  : 'bg-white text-slate-800 rounded-tl-xs font-normal border border-slate-100'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                            </div>

                            {/* Timestamp below bubble */}
                            <div
                              className={`flex items-center gap-1 text-[11px] text-slate-400 ${
                                isMe ? 'justify-end mr-1' : 'justify-start ml-1'
                              }`}
                            >
                              <span>{msg.time}</span>
                              {isMe &&
                                (isSeen ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                                ) : msg.status === 'DELIVERED' ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-slate-400" />
                                ))}
                            </div>
                          </div>

                          {/* Right Sender (Me) Avatar */}
                          {isMe && (
                            <img
                              src={
                                currentUser?.avatar ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                                  currentUser?.name || 'Me'
                                )}`
                              }
                              alt="me"
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-pink-300 flex-shrink-0 mb-5 shadow-2xs"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Real-Time Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-center gap-2 text-xs text-pink-600 font-medium py-1 px-1">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce [animation-delay:0.3s]" />
                      </span>
                      <span>{activeConversation.name} is typing…</span>
                    </div>
                  )}
                </div>

                {/* Bottom Message Composer matching Image 2 */}
                <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2.5 sm:gap-3">
                    {/* Pill Input Container */}
                    <div className="flex-1 flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full border border-slate-200/90 bg-white focus-within:border-pink-500 focus-within:ring-1 focus-within:ring-pink-500 transition-all shadow-2xs">
                      {/* Emoji Icon */}
                      <button
                        type="button"
                        onClick={() => setInputText((prev) => prev + '💃 ')}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer flex-shrink-0"
                        title="Insert emoji"
                      >
                        <Smile className="w-5 h-5" />
                      </button>

                      {/* Text Input */}
                      <input
                        type="text"
                        value={inputText}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none min-w-0"
                      />

                      {/* Image Upload Icon */}
                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer flex-shrink-0"
                        title="Send photo"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </button>

                      {/* Attachment Paperclip Icon */}
                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer flex-shrink-0"
                        title="Attach file"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Circular Pink Send Button (Image 2 style) */}
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="w-11 h-11 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white flex items-center justify-center shadow-md shadow-pink-500/25 transition-all active:scale-95 disabled:opacity-40 flex-shrink-0 cursor-pointer"
                      title="Send"
                    >
                      <Send className="w-5 h-5 text-white" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* No Conversation Selected Placeholder (Desktop) */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAF7FD] space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-pink-100/70 text-[#E60067] flex items-center justify-center shadow-xs">
                  <Smile className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-lg font-bold text-slate-900 font-heading">Your Messages</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Select a conversation to start chatting with your Garba partners.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeConversation && (
        <>
          <ShareContactModal
            conversationId={activeConversation.id}
            partnerName={activeConversation.name}
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
          />

          <ReportModal
            userToReport={targetUser}
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
          />

          <BlockModal
            userToBlock={targetUser}
            isOpen={isBlockModalOpen}
            onClose={() => setIsBlockModalOpen(false)}
          />
        </>
      )}
    </div>
  );
};

export default MessagesPage;
