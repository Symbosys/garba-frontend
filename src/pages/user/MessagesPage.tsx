import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ShareContactModal } from '../../components/modals/ShareContactModal';
import { ReportModal } from '../../components/modals/ReportModal';
import { BlockModal } from '../../components/modals/BlockModal';
import {
  Search,
  Send,
  Smile,
  Paperclip,
  Image as ImageIcon,
  Phone,
  Video,
  Info,
  MoreVertical,
  CheckCheck,
  Calendar,
  MapPin,
  CheckCircle2,
  Users,
  Building2,
  ArrowLeft,
  Flag,
  Ban
} from 'lucide-react';

interface ChatMessageItem {
  id: string;
  sender: 'me' | 'other';
  senderName: string;
  senderAvatar: string;
  text: string;
  time: string;
  hasEventCard?: boolean;
}

interface ConversationItem {
  id: string;
  name: string;
  age?: number;
  avatar: string;
  isOnline?: boolean;
  isVerified?: boolean;
  isGroup?: boolean;
  isOrganizer?: boolean;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  type: 'match' | 'group' | 'organizer';
  messages: ChatMessageItem[];
}

const INITIAL_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'conv-riya',
    name: 'Riya',
    age: 22,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    isOnline: true,
    isVerified: true,
    eventName: 'Ranchi Garba Night 2026',
    eventDate: '18 Oct 2026',
    eventTime: '7:00 PM',
    eventVenue: 'Morabadi Ground, Ranchi',
    lastMessage: "Great! I'm also intermediate...",
    time: '10:24 AM',
    unreadCount: 2,
    type: 'match',
    messages: [
      {
        id: 'msg-1',
        sender: 'other',
        senderName: 'Riya',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        text: 'Hey! Are you attending the 18 Oct event?',
        time: '10:20 AM'
      },
      {
        id: 'msg-2',
        sender: 'me',
        senderName: 'Aarohi',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        text: "Yes! I'll be there. Are you coming with a group or looking for a partner?",
        time: '10:21 AM'
      },
      {
        id: 'msg-3',
        sender: 'other',
        senderName: 'Riya',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        text: "I'm looking for a partner. I'm intermediate level. How about you?",
        time: '10:22 AM'
      },
      {
        id: 'msg-4',
        sender: 'me',
        senderName: 'Aarohi',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        text: "Great! I'm also intermediate. Let's dance together! 😊",
        time: '10:23 AM'
      },
      {
        id: 'msg-5',
        sender: 'other',
        senderName: 'Riya',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        text: 'Sure! See you there 🎉',
        time: '10:24 AM',
        hasEventCard: true
      }
    ]
  },
  {
    id: 'conv-rahul',
    name: 'Rahul',
    age: 24,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    isOnline: true,
    isVerified: true,
    eventName: 'Ranchi Garba Night 2026',
    eventDate: '18 Oct 2026',
    eventTime: '7:00 PM',
    eventVenue: 'Morabadi Ground, Ranchi',
    lastMessage: 'Are you coming with a group...',
    time: '9:15 AM',
    unreadCount: 1,
    type: 'match',
    messages: [
      {
        id: 'msg-r1',
        sender: 'other',
        senderName: 'Rahul',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        text: 'Hi Aarohi, are you coming with a group or solo for Garba Night?',
        time: '9:15 AM'
      }
    ]
  },
  {
    id: 'conv-neha',
    name: 'Neha',
    age: 21,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    isOnline: false,
    isVerified: true,
    eventName: 'Dandiya Dhoom Extravaganza',
    eventDate: '19 Oct 2026',
    eventTime: '7:30 PM',
    eventVenue: 'Gymkhana Club Ground, Ranchi',
    lastMessage: "Let's meet at the main gate 😊",
    time: '8:30 AM',
    unreadCount: 1,
    type: 'match',
    messages: [
      {
        id: 'msg-n1',
        sender: 'other',
        senderName: 'Neha',
        senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        text: "Let's meet at the main gate 😊 I will wear a red traditional choli!",
        time: '8:30 AM'
      }
    ]
  },
  {
    id: 'conv-squad',
    name: 'Garba Squad',
    avatar: '',
    isGroup: true,
    isVerified: true,
    eventName: 'Ranchi Garba Night 2026',
    eventDate: '18 Oct 2026',
    eventTime: '7:00 PM',
    eventVenue: 'Morabadi Ground, Ranchi',
    lastMessage: 'Aditya: Sure, see you there!',
    time: 'Yesterday',
    unreadCount: 4,
    type: 'group',
    messages: [
      {
        id: 'msg-s1',
        sender: 'other',
        senderName: 'Aditya',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        text: 'Everyone ready with Dandiya sticks? Sure, see you there!',
        time: 'Yesterday'
      }
    ]
  },
  {
    id: 'conv-aditya',
    name: 'Aditya',
    age: 25,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    isOnline: true,
    isVerified: false,
    eventName: 'Ranchi Garba Night 2026',
    eventDate: '18 Oct 2026',
    eventTime: '7:00 PM',
    eventVenue: 'Morabadi Ground, Ranchi',
    lastMessage: "Yes, I'll be there!",
    time: 'Yesterday',
    type: 'match',
    messages: [
      {
        id: 'msg-a1',
        sender: 'other',
        senderName: 'Aditya',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        text: "Yes, I'll be there! Let me know when you arrive.",
        time: 'Yesterday'
      }
    ]
  },
  {
    id: 'conv-karan',
    name: 'Karan',
    age: 26,
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    isOnline: false,
    isVerified: true,
    eventName: 'Navratri Fusion Beats',
    eventDate: '20 Oct 2026',
    eventTime: '8:00 PM',
    eventVenue: 'JSCA Stadium Complex, Ranchi',
    lastMessage: 'Okay, sounds good 👍',
    time: '18 Oct',
    type: 'match',
    messages: [
      {
        id: 'msg-k1',
        sender: 'other',
        senderName: 'Karan',
        senderAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
        text: 'Okay, sounds good 👍',
        time: '18 Oct'
      }
    ]
  },
  {
    id: 'conv-priya',
    name: 'Priya',
    age: 23,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    isOnline: false,
    isVerified: true,
    eventName: 'Dandiya Dhoom Extravaganza',
    eventDate: '19 Oct 2026',
    eventTime: '7:30 PM',
    eventVenue: 'Gymkhana Club Ground, Ranchi',
    lastMessage: 'Are you attending the 19 Oct event?',
    time: '17 Oct',
    type: 'match',
    messages: [
      {
        id: 'msg-p1',
        sender: 'other',
        senderName: 'Priya',
        senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        text: 'Are you attending the 19 Oct event?',
        time: '17 Oct'
      }
    ]
  },
  {
    id: 'conv-organizer',
    name: 'Event Organizers',
    avatar: '',
    isOrganizer: true,
    isVerified: true,
    eventName: 'Ranchi Garba Night 2026',
    eventDate: '18 Oct 2026',
    eventTime: '7:00 PM',
    eventVenue: 'Morabadi Ground, Ranchi',
    lastMessage: 'Ranchi Garba Night 2026',
    time: '16 Oct',
    type: 'organizer',
    messages: [
      {
        id: 'msg-o1',
        sender: 'other',
        senderName: 'Event Organizers',
        senderAvatar: '',
        text: 'Welcome to Ranchi Garba Night 2026! Gates open at 6:30 PM.',
        time: '16 Oct'
      }
    ]
  },
  {
    id: 'conv-ananya',
    name: 'Ananya',
    age: 22,
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    isOnline: false,
    isVerified: true,
    eventName: 'Ranchi Garba Night 2026',
    eventDate: '18 Oct 2026',
    eventTime: '7:00 PM',
    eventVenue: 'Morabadi Ground, Ranchi',
    lastMessage: "I'm looking for a group.",
    time: '15 Oct',
    type: 'match',
    messages: [
      {
        id: 'msg-an1',
        sender: 'other',
        senderName: 'Ananya',
        senderAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
        text: "I'm looking for a group.",
        time: '15 Oct'
      }
    ]
  },
  {
    id: 'conv-arjun',
    name: 'Arjun',
    age: 25,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    isOnline: true,
    isVerified: true,
    eventName: 'Ranchi Garba Night 2026',
    eventDate: '18 Oct 2026',
    eventTime: '7:00 PM',
    eventVenue: 'Morabadi Ground, Ranchi',
    lastMessage: 'No problem, see you there!',
    time: '14 Oct',
    type: 'match',
    messages: [
      {
        id: 'msg-arj1',
        sender: 'other',
        senderName: 'Arjun',
        senderAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
        text: 'No problem, see you there!',
        time: '14 Oct'
      }
    ]
  }
];

export const MessagesPage: React.FC = () => {
  const { currentUser, users } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryConvId = searchParams.get('id') || searchParams.get('convId');

  const [conversationList, setConversationList] = useState<ConversationItem[]>(INITIAL_CONVERSATIONS);
  const [selectedConvId, setSelectedConvId] = useState<string>(() => {
    if (queryConvId) return queryConvId;
    // On desktop screens (>= 768px), default to first conversation
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return 'conv-riya';
    }
    // On mobile screens (< 768px), show the conversations list first
    return '';
  });

  useEffect(() => {
    if (queryConvId) {
      setSelectedConvId(queryConvId);
    }
  }, [queryConvId]);
  const [activeTab, setActiveTab] = useState<'all' | 'matches' | 'groups'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversationList.find((c) => c.id === selectedConvId) || conversationList[0];
  const targetUser = users.find((u) => u.name.toLowerCase().includes(activeConversation.name.toLowerCase())) || users[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const filteredConversations = conversationList.filter((conv) => {
    if (activeTab === 'matches' && conv.type !== 'match') return false;
    if (activeTab === 'groups' && conv.type !== 'group') return false;
    if (searchQuery.trim()) {
      return conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessageItem = {
      id: 'msg-' + Date.now(),
      sender: 'me',
      senderName: currentUser?.name || 'Aarohi',
      senderAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversationList((prev) =>
      prev.map((c) => {
        if (c.id === activeConversation.id) {
          return {
            ...c,
            lastMessage: newMsg.text,
            time: 'Just now',
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      })
    );

    setInputText('');
  };

  return (
    <div className="max-w-[1400px] mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-6 h-[calc(100dvh-130px)] lg:h-[calc(100vh-80px)] min-h-[480px]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 h-full items-stretch">
        
        {/* ================= LEFT PANEL: CONVERSATIONS LIST ================= */}
        <div className={`md:col-span-4 lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col overflow-hidden h-full ${
          selectedConvId ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Header Title */}
          <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 space-y-3.5">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-heading flex items-center gap-2">
              Messages <span className="text-slate-500 font-semibold text-base font-sans">(8)</span>
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
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  activeTab === 'all' ? 'bg-pink-600 text-white' : 'bg-slate-300 text-slate-700'
                }`}>
                  8
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
            {filteredConversations.map((conv) => {
              const isSelected = selectedConvId === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all flex items-center gap-3 border ${
                    isSelected
                      ? 'bg-pink-50/70 border-pink-200 shadow-sm'
                      : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  {/* Avatar / Group Icon */}
                  <div className="relative flex-shrink-0">
                    {conv.isGroup ? (
                      <div className="w-11 h-11 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                        <Users className="w-5 h-5" />
                      </div>
                    ) : conv.isOrganizer ? (
                      <div className="w-11 h-11 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                        <Building2 className="w-5 h-5" />
                      </div>
                    ) : (
                      <img
                        src={conv.avatar}
                        alt={conv.name}
                        className="w-11 h-11 rounded-full object-cover ring-1 ring-slate-200"
                      />
                    )}
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
                      {conv.unreadCount && conv.unreadCount > 0 ? (
                        <span className="w-4 h-4 rounded-full bg-pink-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= RIGHT PANEL: ACTIVE CHAT WINDOW ================= */}
        <div className={`md:col-span-8 lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col overflow-hidden h-full ${
          !selectedConvId ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Chat Top Header */}
          <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
              {/* Mobile Back Button */}
              <button
                onClick={() => setSelectedConvId('')}
                className="md:hidden p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 flex-shrink-0"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {activeConversation.isGroup ? (
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                ) : activeConversation.isOrganizer ? (
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                ) : (
                  <img
                    src={activeConversation.avatar}
                    alt={activeConversation.name}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-slate-100"
                  />
                )}
                {activeConversation.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </div>

              {/* User / Partner Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                    {activeConversation.name}{activeConversation.age ? `, ${activeConversation.age}` : ''}
                  </h3>
                  {activeConversation.isVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 fill-emerald-100 flex-shrink-0" />
                  )}
                </div>

                {/* Clean, single-line event context subtitle */}
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate flex items-center gap-1.5 mt-0.5">
                  <span className="text-pink-600 font-semibold truncate">{activeConversation.eventName}</span>
                  <span className="text-slate-300 flex-shrink-0">·</span>
                  <span className="text-slate-400 flex-shrink-0 hidden xs:inline">{activeConversation.eventDate}</span>
                </p>
              </div>
            </div>

            {/* Header Right Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Link
                to="/find-partner"
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

              {/* Video Action (Desktop/Tablet) */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="hidden sm:inline-flex p-2 rounded-xl text-slate-600 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                title="Video Call"
              >
                <Video className="w-4 h-4" />
              </button>

              {/* Info Action (Desktop/Tablet) */}
              <button
                onClick={() => navigate('/events')}
                className="hidden sm:inline-flex p-2 rounded-xl text-slate-600 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                title="Event Information"
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
                        navigate('/events');
                        setShowOptionsMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-purple-50 sm:hidden"
                    >
                      <Info className="w-3.5 h-3.5 text-blue-600" />
                      Event Details
                    </button>
                    <button
                      onClick={() => {
                        setIsShareModalOpen(true);
                        setShowOptionsMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-purple-50"
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF7FD]/50">
            {/* Today Date Badge */}
            <div className="flex justify-center">
              <span className="px-3.5 py-1 rounded-full bg-slate-200/80 text-slate-600 text-[11px] font-bold">
                Today
              </span>
            </div>

            {/* Messages Stream */}
            {activeConversation.messages.map((msg) => {
              const isMe = msg.sender === 'me';
              return (
                <div key={msg.id} className="space-y-3">
                  <div className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {/* Left Sender Avatar */}
                    {!isMe && (
                      <img
                        src={msg.senderAvatar || activeConversation.avatar}
                        alt="sender"
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 flex-shrink-0 mb-5"
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
                        <p>{msg.text}</p>
                      </div>

                      {/* Timestamp & Double checkmark */}
                      <div className={`flex items-center gap-1 text-[10px] text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span>{msg.time}</span>
                        {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                      </div>
                    </div>

                    {/* Right Sender (Me) Avatar */}
                    {isMe && (
                      <img
                        src={msg.senderAvatar}
                        alt="me"
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-pink-300 flex-shrink-0 mb-5"
                      />
                    )}
                  </div>

                  {/* Embedded Event Card (if message has event card) */}
                  {msg.hasEventCard && (
                    <div className="max-w-md p-2.5 sm:p-3 rounded-2xl border border-pink-100 bg-white shadow-xs flex items-center justify-between gap-2.5 sm:gap-4 my-2 ml-0 sm:ml-10">
                      <img
                        src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80"
                        alt="Ranchi Garba Night"
                        className="w-14 h-14 sm:w-20 sm:h-16 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {activeConversation.eventName}
                        </h4>
                        <div className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                          <Calendar className="w-3 h-3 text-pink-600 flex-shrink-0" />
                          <span className="truncate">{activeConversation.eventDate} · {activeConversation.eventTime}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate mt-0.5">
                          <MapPin className="w-3 h-3 text-pink-600 flex-shrink-0" />
                          <span className="truncate">{activeConversation.eventVenue}</span>
                        </div>
                      </div>
                      <Link
                        to="/events"
                        className="py-1.5 px-3 sm:py-2 sm:px-3.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-[11px] sm:text-xs font-bold whitespace-nowrap shadow-sm transition-transform active:scale-95 flex-shrink-0"
                      >
                        View Event
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Message Composer Input Bar */}
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
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />

                {/* Image Upload Button */}
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                  title="Attach Image"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* Attachment Button */}
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                  title="Attach File"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>

              {/* Pink Circular Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center shadow-md shadow-pink-500/20 transition-all active:scale-95 disabled:opacity-40 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Modals */}
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
    </div>
  );
};
