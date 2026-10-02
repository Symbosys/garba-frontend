import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  Video,
  Info,
  MoreVertical,
  CheckCheck,
  Check,
  CheckCircle2,
  Users,
  Building2,
  ArrowLeft,
  Flag,
  Ban,
  Loader2,
  MessageSquare,
  MessageCircle,
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
  city?: string;
  state?: string;
  lastMessage: string;
  lastMessageAt?: string | null;
  time: string;
  unreadCount: number;
  type: 'match' | 'group' | 'organizer';
}

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

  // Transform backend API conversations to list
  const conversationList: DynamicConversationItem[] = useMemo(() => {
    if (!apiConversations || apiConversations.length === 0) {
      return [];
    }

    return apiConversations.map((c) => {
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
        lastMessage: c.lastMessageText || 'No messages yet',
        lastMessageAt: c.lastMessageAt,
        time: formatChatTime(c.lastMessageAt),
        unreadCount: c.unreadCount || 0,
        type: 'match' as const,
      };
    });
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
      age: activeConversation.age || 22,
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

  // Merge live socket messages for rendering
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
    return [];
  }, [liveMessages, currentUser?.id]);

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
    <div className="max-w-[1400px] mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-6 h-[calc(100dvh-130px)] lg:h-[calc(100vh-80px)] min-h-[480px]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 h-full items-stretch">
        {/* ================= LEFT PANEL: CONVERSATIONS LIST ================= */}
        <div
          className={`md:col-span-4 lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col overflow-hidden h-full ${
            selectedConvId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header Title */}
          <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 space-y-3.5">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-heading flex items-center gap-2">
              Messages{' '}
              <span className="text-slate-500 font-semibold text-base font-sans">
                ({filteredConversations.length})
              </span>
            </h2>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-pink-500 transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'all'
                    ? 'bg-pink-50 text-pink-600 border border-pink-200'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <span>All</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    activeTab === 'all' ? 'bg-pink-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {conversationList.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('matches')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'matches'
                    ? 'bg-pink-50 text-pink-600 border border-pink-200'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                Matches
              </button>

              <button
                onClick={() => setActiveTab('groups')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'groups'
                    ? 'bg-pink-50 text-pink-600 border border-pink-200'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                Groups
              </button>
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1.5 divide-y divide-transparent">
            {isConversationsLoading ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-pink-600" />
                <p className="text-xs text-slate-400 font-medium">Loading conversations…</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center h-full space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">
                    {searchQuery.trim() ? 'No matches found' : 'No conversations yet'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
                    {searchQuery.trim()
                      ? 'Try searching with a different name or message'
                      : 'Connect with dancers and find your Garba partner to start chatting!'}
                  </p>
                </div>
                {!searchQuery.trim() && (
                  <Link
                    to="/find-partner"
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Find Partners
                  </Link>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConvId === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full text-left p-3 rounded-2xl transition-all flex items-center gap-3 border ${
                      isSelected
                        ? 'bg-pink-50/70 border-pink-200 shadow-sm'
                        : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={conv.avatar}
                        alt={conv.name}
                        className="w-11 h-11 rounded-full object-cover ring-1 ring-slate-200"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                            conv.name
                          )}`;
                        }}
                      />
                      {conv.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                      )}
                    </div>

                    {/* Name & Last Message */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-sm font-bold text-slate-900 truncate">{conv.name}</span>
                          {conv.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-100 flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap ml-2">
                          {conv.time}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-slate-500 truncate pr-2 font-normal leading-tight">
                          {conv.lastMessage}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-pink-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
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

        {/* ================= RIGHT PANEL: ACTIVE CHAT WINDOW ================= */}
        <div
          className={`md:col-span-8 lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col overflow-hidden h-full ${
            !selectedConvId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* Chat Top Header */}
              <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 gap-2">
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => {
                      setSelectedConvId('');
                      setSearchParams({});
                    }}
                    className="md:hidden p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 flex-shrink-0"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={activeConversation.avatar}
                      alt={activeConversation.name}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-slate-100"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                          activeConversation.name
                        )}`;
                      }}
                    />
                    {activeConversation.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>

                  {/* User / Partner Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                        {activeConversation.name}
                        {activeConversation.age ? `, ${activeConversation.age}` : ''}
                      </h3>
                      {activeConversation.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 fill-emerald-100 flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate flex items-center gap-1.5 mt-0.5">
                      <span className="text-pink-600 font-semibold truncate">
                        {activeConversation.city || 'Garba Partner'}
                      </span>
                      {activeConversation.state && (
                        <>
                          <span className="text-slate-300 flex-shrink-0">·</span>
                          <span className="text-slate-400 flex-shrink-0">{activeConversation.state}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Header Right Action Buttons */}
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <Link
                    to={
                      activeConversation.partnerId
                        ? `/find-partner`
                        : `/find-partner`
                    }
                    className="hidden lg:inline-flex items-center px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                  >
                    View Profile
                  </Link>

                  {/* Phone Action */}
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="p-2 rounded-xl text-slate-600 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                    title="Call Partner"
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  {/* Video Action */}
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="hidden sm:inline-flex p-2 rounded-xl text-slate-600 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                    title="Video Call"
                  >
                    <Video className="w-4 h-4" />
                  </button>

                  {/* Info Action */}
                  <button
                    onClick={() => navigate('/events')}
                    className="hidden sm:inline-flex p-2 rounded-xl text-slate-600 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                    title="Events"
                  >
                    <Info className="w-4 h-4" />
                  </button>

                  {/* More Options Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                      className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {showOptionsMenu && (
                      <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-2xl border border-slate-100 p-1.5 z-30 text-xs font-semibold animate-in fade-in zoom-in-95">
                        <button
                          onClick={() => {
                            setIsShareModalOpen(true);
                            setShowOptionsMenu(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-pink-50"
                        >
                          <Phone className="w-3.5 h-3.5 text-pink-600" />
                          Share Contact
                        </button>
                        <button
                          onClick={() => {
                            setIsReportModalOpen(true);
                            setShowOptionsMenu(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50"
                        >
                          <Flag className="w-3.5 h-3.5" />
                          Report Partner
                        </button>
                        <button
                          onClick={() => {
                            setIsBlockModalOpen(true);
                            setShowOptionsMenu(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Block User
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF7FD]/50">
                {/* Date Badge */}
                <div className="flex justify-center">
                  <span className="px-3.5 py-1 rounded-full bg-slate-200/80 text-slate-600 text-[11px] font-bold">
                    Today
                  </span>
                </div>

                {displayMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[calc(100%-80px)] py-8 text-center space-y-3">
                    <img
                      src={activeConversation.avatar}
                      alt={activeConversation.name}
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-pink-100 shadow-sm"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                          activeConversation.name
                        )}`;
                      }}
                    />
                    <div className="space-y-1 max-w-xs">
                      <h4 className="text-sm font-bold text-slate-800">
                        Say hello to {activeConversation.name}! 👋
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Send a message to coordinate dance practices, passes, and events.
                      </p>
                    </div>
                  </div>
                ) : (
                  displayMessages.map((msg) => {
                    const isMe = msg.sender === 'me';
                    const isSeen = msg.status === 'READ' || !!msg.seenAt;

                    return (
                      <div key={msg.id} className="space-y-3">
                        <div className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {/* Left Sender Avatar */}
                          {!isMe && (
                            <img
                              src={msg.senderAvatar || activeConversation.avatar}
                              alt="sender"
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 flex-shrink-0 mb-5"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                                  msg.senderName || activeConversation.name
                                )}`;
                              }}
                            />
                          )}

                          <div className="space-y-1 max-w-[82%] sm:max-w-md">
                            {/* Message Bubble */}
                            <div
                              className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                                isMe
                                  ? 'bg-pink-100/90 text-slate-900 rounded-br-none shadow-2xs font-normal'
                                  : 'bg-slate-100 text-slate-800 rounded-bl-none shadow-2xs font-normal'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                            </div>

                            {/* Timestamp & Real-Time Seen / Delivery Status */}
                            <div
                              className={`flex items-center gap-1 text-[10px] text-slate-400 ${
                                isMe ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <span>{msg.time}</span>
                              {isMe &&
                                (isSeen ? (
                                  <span
                                    title={
                                      msg.seenAt
                                        ? `Seen at ${new Date(msg.seenAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })}`
                                        : 'Seen'
                                    }
                                  >
                                    <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                                  </span>
                                ) : msg.status === 'DELIVERED' ? (
                                  <span title="Delivered">
                                    <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                                  </span>
                                ) : (
                                  <span title="Sent">
                                    <Check className="w-3.5 h-3.5 text-slate-400" />
                                  </span>
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
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-pink-300 flex-shrink-0 mb-5"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

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

              {/* Bottom Message Composer Input Bar (WebSocket Powered) */}
              <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3">
                  <div className="flex-1 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-slate-200/90 bg-white focus-within:border-pink-500 focus-within:ring-1 focus-within:ring-pink-500 transition-all shadow-2xs">
                    {/* Emoji Button */}
                    <button
                      type="button"
                      onClick={() => setInputText((prev) => prev + '💃 ')}
                      className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
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
                      className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center shadow-md shadow-pink-500/20 transition-all active:scale-95 disabled:opacity-40 flex-shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* No Conversation Selected Placeholder */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAF7FD]/50 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-pink-100/70 text-pink-600 flex items-center justify-center shadow-xs">
                <MessageCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-base font-bold text-slate-900">Your Messages</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Select a chat or find new Garba partners to start chatting.
                </p>
              </div>
              <Link
                to="/find-partner"
                className="px-5 py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-pink-500/20 transition-all active:scale-95"
              >
                Browse Partners
              </Link>
            </div>
          )}
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
