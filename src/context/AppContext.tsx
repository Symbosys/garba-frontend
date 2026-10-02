import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import {
  User,
  FestivalEvent,
  CityInfo,
  SquadGroup,
  PartnerRequest,
  Match,
  Conversation,
  ChatMessage,
  AppNotification,
  SafetyReport,
  FilterState
} from '../types';
import {
  CURRENT_DEMO_USER,
  DEMO_ADMIN_USER,
  MOCK_USERS,
  MOCK_EVENTS,
  MOCK_CITIES,
  MOCK_GROUPS,
  MOCK_PARTNER_REQUESTS,
  MOCK_MATCHES,
  MOCK_CONVERSATIONS,
  MOCK_CHAT_MESSAGES,
  MOCK_NOTIFICATIONS,
  MOCK_SAFETY_REPORTS
} from '../data/mockData';
import { storageService } from '../services/storageService';
import { calculateMatchScore } from '../utils/matching';
import { useAuth } from './AuthContext';
import type { AuthUser } from '../api/types';
import { useLocationStore } from '../store/useLocationStore';

const mapAuthenticatedUser = (user: AuthUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  avatar: user.photos[0]?.url || '/favicon.svg',
  age: user.age || 18,
  gender: user.gender === 'MALE' ? 'Male' : user.gender === 'FEMALE' ? 'Female' : user.gender === 'NON_BINARY' ? 'Non-Binary' : 'Other',
  city: user.city,
  state: user.state,
  addressLine: user.addressLine,
  area: user.addressLine || user.state,
  bio: `${user.role === 'PARTNER' ? 'Festival Dancer' : 'Event Organizer'} from ${user.city}`,
  garbaLevel: 'Beginner',
  dandiyaLevel: 'Beginner',
  danceStyle: 'Traditional',
  lookingFor: ['Partner'],
  preferredGender: 'Any',
  preferredAgeMin: 18,
  preferredAgeMax: 35,
  preferredEvents: [],
  availability: { dates: [], startTime: '19:00', endTime: '23:00' },
  isVerified: { mobile: true, email: true, photo: user.photos.length > 0 },
  role: user.role === 'SUPER_ADMIN' ? 'admin' : 'user',
  isPremium: false,
  profileCompletion: 85,
  joinedAt: user.createdAt,
  createdAt: user.createdAt,
  status: user.status === 'SUSPENDED' ? 'suspended' : 'active',
});

interface ToastInfo {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface AppContextType {
  // Auth
  currentUser: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (email: string, role?: 'user' | 'admin') => Promise<{ success: boolean; message?: string }>;
  loginAsDemoUser: () => void;
  loginAsDemoAdmin: () => void;
  logout: () => void;
  registerUser: (userData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  updateUserProfile: (data: Partial<User>) => void;

  // Events
  events: FestivalEvent[];
  userEvents: string[]; // event IDs
  joinEvent: (eventId: string) => void;
  leaveEvent: (eventId: string) => void;
  isEventJoined: (eventId: string) => boolean;
  addNewEvent: (event: FestivalEvent) => void;

  // State & City
  cities: CityInfo[];
  selectedStateCode: string;
  selectedStateName: string;
  setSelectedStateCode: (stateCode: string, explicitName?: string, defaultCity?: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;

  // Partner Discovery & Requests
  users: User[];
  partnerRequests: PartnerRequest[];
  sendPartnerRequest: (recipientId: string, eventId: string, message?: string) => Promise<{ success: boolean; message?: string }>;
  acceptPartnerRequest: (requestId: string) => void;
  declinePartnerRequest: (requestId: string) => void;
  hasRequestedPartner: (candidateId: string, eventId: string) => boolean;

  // Matches
  matches: Match[];
  newMatchModalData: { partner: User; eventName: string } | null;
  closeMatchModal: () => void;

  // Favorites
  favorites: string[]; // user IDs
  toggleFavorite: (userId: string) => void;
  isFavorite: (userId: string) => boolean;

  // Groups
  groups: SquadGroup[];
  joinSquadGroup: (groupId: string) => void;
  createSquadGroup: (groupData: Partial<SquadGroup>) => void;

  // Chat & Messages
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (conversationId: string, text: string, image?: string) => void;
  shareContactInChat: (conversationId: string) => void;

  // Notifications
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Safety, Reports & Blocks
  reports: SafetyReport[];
  submitReport: (report: Partial<SafetyReport>) => void;
  blockedUsers: string[]; // user IDs
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  isUserBlocked: (userId: string) => boolean;

  // Subscription
  upgradeSubscription: (planId: string) => void;

  // Search & Filter state for Partner Page
  searchFilters: FilterState;
  setSearchFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;

  // Global Toasts
  toasts: ToastInfo[];
  showToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const defaultFilterState: FilterState = {
  city: 'Ranchi',
  eventId: 'event-ranchi-01',
  date: '2026-10-18',
  tab: 'all',
  ageRange: [18, 35],
  genderPreference: 'Any',
  danceLevel: 'All',
  lookingFor: 'All',
  style: 'All',
  onlyVerified: false,
  sortBy: 'match'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: authenticatedUser, logout: logoutAuth } = useAuth();
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(authenticatedUser ? mapAuthenticatedUser(authenticatedUser) : null);

  useEffect(() => {
    // Keep legacy presentation models synchronized with the API-backed auth identity.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentUser(authenticatedUser ? mapAuthenticatedUser(authenticatedUser) : null);
  }, [authenticatedUser]);

  // Data Collections with localStorage caching
  const [events, setEvents] = useState<FestivalEvent[]>(() => {
    return storageService.get<FestivalEvent[]>('events', MOCK_EVENTS);
  });

  const [users, setUsers] = useState<User[]>(() => {
    return storageService.get<User[]>('users', MOCK_USERS);
  });

  const [cities] = useState<CityInfo[]>(MOCK_CITIES);
  const {
    selectedStateCode,
    selectedStateName,
    selectedCity,
    setSelectedStateCode,
    setSelectedCity,
  } = useLocationStore();

  const [userEvents, setUserEvents] = useState<string[]>(() => {
    return storageService.get<string[]>('userEvents', ['event-ranchi-01']);
  });

  const [partnerRequests, setPartnerRequests] = useState<PartnerRequest[]>(() => {
    return storageService.get<PartnerRequest[]>('partnerRequests', MOCK_PARTNER_REQUESTS);
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    return storageService.get<Match[]>('matches', MOCK_MATCHES);
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    return storageService.get<string[]>('favorites', ['user-007', 'user-003']);
  });

  const [groups, setGroups] = useState<SquadGroup[]>(() => {
    return storageService.get<SquadGroup[]>('groups', MOCK_GROUPS);
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    return storageService.get<Conversation[]>('conversations', MOCK_CONVERSATIONS);
  });

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    return storageService.get<Record<string, ChatMessage[]>>('messages', MOCK_CHAT_MESSAGES);
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv-001');

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    return storageService.get<AppNotification[]>('notifications', MOCK_NOTIFICATIONS);
  });

  const [reports, setReports] = useState<SafetyReport[]>(() => {
    return storageService.get<SafetyReport[]>('reports', MOCK_SAFETY_REPORTS);
  });

  const [blockedUsers, setBlockedUsers] = useState<string[]>(() => {
    return storageService.get<string[]>('blockedUsers', []);
  });

  const [searchFilters, setSearchFilters] = useState<FilterState>(defaultFilterState);

  // Modals & Toasts
  const [newMatchModalData, setNewMatchModalData] = useState<{ partner: User; eventName: string } | null>(null);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Sync to localStorage
  useEffect(() => {
    storageService.set('currentUser', currentUser);
  }, [currentUser]);

  useEffect(() => {
    storageService.set('events', events);
  }, [events]);

  useEffect(() => {
    storageService.set('users', users);
  }, [users]);

  useEffect(() => {
    storageService.set('userEvents', userEvents);
  }, [userEvents]);

  useEffect(() => {
    storageService.set('partnerRequests', partnerRequests);
  }, [partnerRequests]);

  useEffect(() => {
    storageService.set('matches', matches);
  }, [matches]);

  useEffect(() => {
    storageService.set('favorites', favorites);
  }, [favorites]);

  useEffect(() => {
    storageService.set('groups', groups);
  }, [groups]);

  useEffect(() => {
    storageService.set('conversations', conversations);
  }, [conversations]);

  useEffect(() => {
    storageService.set('messages', messages);
  }, [messages]);

  useEffect(() => {
    storageService.set('notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    storageService.set('reports', reports);
  }, [reports]);

  useEffect(() => {
    storageService.set('blockedUsers', blockedUsers);
  }, [blockedUsers]);

  // Toast helper with Sonner
  const showToast = (title: string, message?: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const description = message && message.trim() ? message : undefined;
    if (type === 'error') {
      toast.error(title, { description });
    } else if (type === 'success') {
      toast.success(title, { description });
    } else if (type === 'warning') {
      toast.warning(title, { description });
    } else {
      toast.info(title, { description });
    }
  };

  const removeToast = (_id: string) => {
    toast.dismiss();
  };

  // Auth Methods
  const login = async (email: string, role: 'user' | 'admin' = 'user') => {
    if (email === 'admin@garbamitra.com' || role === 'admin') {
      setCurrentUser(DEMO_ADMIN_USER);
      showToast('Admin Login Successful', 'Logged in as Platform Moderator', 'success');
      return { success: true };
    }
    const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || CURRENT_DEMO_USER;
    setCurrentUser(foundUser);
    showToast(`Welcome back, ${foundUser.name}! 👋`, 'Ready for Navratri 2026', 'success');
    return { success: true };
  };

  const loginAsDemoUser = () => {
    setCurrentUser(CURRENT_DEMO_USER);
    showToast('Logged in as Demo User', 'Aarohi Verma (Ranchi)', 'success');
  };

  const loginAsDemoAdmin = () => {
    setCurrentUser(DEMO_ADMIN_USER);
    showToast('Logged in as Demo Admin', 'Vikramaditya Rathore', 'success');
  };

  const logout = () => {
    logoutAuth();
    setCurrentUser(null);
    showToast('Logged out successfully', 'See you on the dance floor!', 'info');
  };

  const registerUser = async (userData: Partial<User>) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name || 'Festival Dancer',
      email: userData.email || '',
      phone: userData.phone || '',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      age: userData.age || 22,
      gender: userData.gender || 'Female',
      city: userData.city || 'Ranchi',
      area: userData.area || 'City Center',
      bio: userData.bio || 'Excited to dance Garba and Dandiya!',
      garbaLevel: userData.garbaLevel || 'Beginner',
      dandiyaLevel: userData.dandiyaLevel || 'Beginner',
      danceStyle: userData.danceStyle || 'Traditional',
      lookingFor: userData.lookingFor || ['Partner'],
      preferredGender: userData.preferredGender || 'Any',
      preferredAgeMin: 18,
      preferredAgeMax: 35,
      preferredEvents: userData.preferredEvents || ['event-ranchi-01'],
      availability: {
        dates: ['2026-10-18'],
        startTime: '19:00',
        endTime: '23:30'
      },
      isVerified: {
        mobile: true,
        email: true,
        photo: false
      },
      role: 'user',
      isPremium: false,
      profileCompletion: 70,
      joinedAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    showToast('Registration Successful! 🎉', 'Welcome to GarbaMitra', 'success');
    return { success: true };
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    showToast('Profile Updated Successfully', 'Your preferences are saved', 'success');
  };

  // Event Methods
  const joinEvent = (eventId: string) => {
    if (!userEvents.includes(eventId)) {
      setUserEvents((prev) => [...prev, eventId]);
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e))
      );
      const ev = events.find((e) => e.id === eventId);
      showToast('Event Joined! 🎟️', `Added ${ev?.title || 'Event'} to your schedule`, 'success');

      // Add event notification
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        userId: currentUser?.id || 'user-001',
        type: 'event_reminder',
        title: `Joined: ${ev?.title || 'Festival Event'}`,
        message: 'You can now discover other dancers attending this event.',
        timestamp: 'Just now',
        isRead: false,
        actionUrl: `/events/${eventId}`
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const leaveEvent = (eventId: string) => {
    setUserEvents((prev) => prev.filter((id) => id !== eventId));
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, registeredCount: Math.max(0, e.registeredCount - 1) } : e))
    );
    showToast('Event removed from schedule', '', 'info');
  };

  const isEventJoined = (eventId: string) => userEvents.includes(eventId);

  const addNewEvent = (newEvent: FestivalEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
    showToast('New Event Created Successfully', newEvent.title, 'success');
  };

  // Partner Request Methods
  const hasRequestedPartner = (candidateId: string, eventId: string) => {
    if (!currentUser) return false;
    return partnerRequests.some(
      (r) => r.senderId === currentUser.id && r.recipientId === candidateId && r.eventId === eventId && r.status !== 'declined'
    );
  };

  const sendPartnerRequest = async (recipientId: string, eventId: string, message?: string) => {
    if (!currentUser) {
      showToast('Please log in to send requests', '', 'warning');
      return { success: false, message: 'Please log in' };
    }

    const recipient = users.find((u) => u.id === recipientId);
    const event = events.find((e) => e.id === eventId) || events[0];

    const newRequest: PartnerRequest = {
      id: `req-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderCity: currentUser.city,
      senderAge: currentUser.age,
      senderGarbaLevel: currentUser.garbaLevel,
      recipientId,
      recipientName: recipient?.name || 'Festival Dancer',
      recipientAvatar: recipient?.avatar || '',
      eventId: event.id,
      eventName: event.title,
      eventDate: event.displayDate,
      message: message || `Hi! I saw you are attending ${event.title}. Let's dance together!`,
      status: 'pending',
      createdAt: 'Just now'
    };

    setPartnerRequests((prev) => [newRequest, ...prev]);
    showToast('Partner Request Sent Successfully! 💃', `Request sent to ${recipient?.name}`, 'success');
    return { success: true };
  };

  const acceptPartnerRequest = (requestId: string) => {
    const req = partnerRequests.find((r) => r.id === requestId);
    if (!req || !currentUser) return;

    // Update request state
    setPartnerRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'accepted' } : r))
    );

    const partner = users.find((u) => u.id === req.senderId) || CURRENT_DEMO_USER;
    const matchScore = calculateMatchScore(currentUser, partner, events.find((e) => e.id === req.eventId)).score;

    // Create Match
    const newMatch: Match = {
      id: `match-${Date.now()}`,
      users: [currentUser.id, partner.id],
      partner: partner,
      eventId: req.eventId,
      eventName: req.eventName,
      eventDate: req.eventDate,
      matchPercentage: matchScore,
      matchedAt: 'Just now',
      status: 'active',
      lastMessageSnippet: '🎉 Mutual Festival Match!'
    };

    setMatches((prev) => [newMatch, ...prev]);

    // Create Conversation
    const convId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: convId,
      participantId: partner.id,
      participant: partner,
      eventId: req.eventId,
      eventName: req.eventName,
      lastMessage: '🎉 Mutual Festival Match! Start your conversation safely.',
      lastMessageTime: 'Just now',
      unreadCount: 0,
      isOnline: true,
      contactShared: {
        userShared: false,
        partnerShared: false
      }
    };

    setConversations((prev) => [newConv, ...prev]);

    // Initial system chat message
    setMessages((prev) => ({
      ...prev,
      [convId]: [
        {
          id: `msg-${Date.now()}`,
          conversationId: convId,
          senderId: 'system',
          text: `🎉 Mutual Festival Match! You and ${partner.name} matched for ${req.eventName}. Always meet inside the registered public venue.`,
          timestamp: 'Just now',
          status: 'read',
          isSystemNotice: true
        }
      ]
    }));

    // Trigger celebration modal
    setNewMatchModalData({ partner, eventName: req.eventName });

    // Toast
    showToast(`🎉 You matched with ${partner.name}!`, 'Open chat to coordinate your festival meetup', 'success');
  };

  const declinePartnerRequest = (requestId: string) => {
    setPartnerRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'declined' } : r))
    );
    showToast('Partner request declined', '', 'info');
  };

  const closeMatchModal = () => {
    setNewMatchModalData(null);
  };

  // Favorite Methods
  const toggleFavorite = (userId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(userId);
      if (exists) {
        showToast('Removed from saved partners', '', 'info');
        return prev.filter((id) => id !== userId);
      } else {
        showToast('Saved to your favorites! ❤️', '', 'success');
        return [...prev, userId];
      }
    });
  };

  const isFavorite = (userId: string) => favorites.includes(userId);

  // Squad Group Methods
  const joinSquadGroup = (groupId: string) => {
    if (!currentUser) {
      showToast('Please log in to join squads', '', 'warning');
      return;
    }

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const alreadyIn = g.currentMembers.some((m) => m.id === currentUser.id);
          if (alreadyIn) return g;
          return {
            ...g,
            lookingForCount: Math.max(0, g.lookingForCount - 1),
            currentMembers: [
              ...g.currentMembers,
              {
                id: currentUser.id,
                name: currentUser.name,
                avatar: currentUser.avatar,
                role: 'Member',
                garbaLevel: currentUser.garbaLevel
              }
            ]
          };
        }
        return g;
      })
    );
    showToast('Joined Squad Group! 💃🕺', 'Coordinate your group dance entry', 'success');
  };

  const createSquadGroup = (groupData: Partial<SquadGroup>) => {
    if (!currentUser) return;
    const newGroup: SquadGroup = {
      id: `group-${Date.now()}`,
      name: groupData.name || 'Navratri Squad',
      eventId: groupData.eventId || 'event-ranchi-01',
      eventName: groupData.eventName || 'Ranchi Garba Night 2026',
      city: groupData.city || currentUser.city,
      date: groupData.date || '18 October 2026',
      venue: groupData.venue || 'Morabadi Ground',
      description: groupData.description || 'Excited to dance together in synchronized steps!',
      leaderId: currentUser.id,
      leaderName: currentUser.name,
      leaderAvatar: currentUser.avatar,
      maxMembers: groupData.maxMembers || 8,
      currentMembers: [
        {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: 'Leader',
          garbaLevel: currentUser.garbaLevel
        }
      ],
      lookingForCount: (groupData.maxMembers || 8) - 1,
      tags: groupData.tags || ['Squad', 'Navratri 2026'],
      dressTheme: groupData.dressTheme || 'Festive Ethnic'
    };

    setGroups((prev) => [newGroup, ...prev]);
    showToast('Squad Group Created Successfully! 🎉', newGroup.name, 'success');
  };

  // Chat Methods
  const sendMessage = (conversationId: string, text: string, image?: string) => {
    if (!currentUser || !text.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      text: text.trim(),
      image,
      timestamp: 'Just now',
      status: 'sent'
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg]
    }));

    // Update conversation last message snippet
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: text.trim(),
              lastMessageTime: 'Just now'
            }
          : c
      )
    );

    // Simulate partner automated reply in demo mode after 2 seconds
    setTimeout(() => {
      const partnerReplies = [
        'Awesome! See you near the main entrance around 7 PM!',
        'Sounds like a plan! Let’s get ready for the 3-taali round!',
        'Got it! Looking forward to dancing together.',
        'Great! I’ll be wearing Royal Blue/Festive colors.'
      ];
      const randomReply = partnerReplies[Math.floor(Math.random() * partnerReplies.length)];

      const replyMsg: ChatMessage = {
        id: `msg-rep-${Date.now()}`,
        conversationId,
        senderId: 'partner-reply',
        text: randomReply,
        timestamp: 'Just now',
        status: 'delivered'
      };

      setMessages((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), replyMsg]
      }));

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                lastMessage: randomReply,
                lastMessageTime: 'Just now'
              }
            : c
        )
      );
    }, 2000);
  };

  const shareContactInChat = (conversationId: string) => {
    if (!currentUser) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              contactShared: {
                ...c.contactShared,
                userShared: true,
                phone: currentUser.phone
              }
            }
          : c
      )
    );

    const noticeMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: 'system',
      text: `📱 ${currentUser.name} shared their verified contact: ${currentUser.phone || '+91 98765 43210'}. Always prioritize public safety.`,
      timestamp: 'Just now',
      status: 'read',
      isSystemNotice: true
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), noticeMsg]
    }));

    showToast('Contact Shared Safely', 'Phone number shared in mutual chat', 'info');
  };

  // Notification Methods
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('All notifications marked as read', '', 'info');
  };

  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  // Safety, Reports & Blocks
  const submitReport = (reportData: Partial<SafetyReport>) => {
    const newReport: SafetyReport = {
      id: `rep-${Date.now()}`,
      reporterId: currentUser?.id || 'user-001',
      reporterName: currentUser?.name || 'Aarohi Verma',
      reportedUserId: reportData.reportedUserId || 'unknown',
      reportedUserName: reportData.reportedUserName || 'Reported User',
      reason: reportData.reason || 'Harassment',
      description: reportData.description || 'No additional details provided.',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Pending',
      priority: 'High'
    };

    setReports((prev) => [newReport, ...prev]);
    showToast('Report Submitted Successfully', 'Our safety moderation team is reviewing this promptly.', 'success');
  };

  const blockUser = (userId: string) => {
    if (!blockedUsers.includes(userId)) {
      setBlockedUsers((prev) => [...prev, userId]);
      // Remove any active matches or pending requests with this user
      setPartnerRequests((prev) => prev.filter((r) => r.senderId !== userId && r.recipientId !== userId));
      setMatches((prev) => prev.filter((m) => !m.users.includes(userId)));
      showToast('User Blocked Successfully', 'They can no longer view your profile or message you.', 'info');
    }
  };

  const unblockUser = (userId: string) => {
    setBlockedUsers((prev) => prev.filter((id) => id !== userId));
    showToast('User unblocked', '', 'info');
  };

  const isUserBlocked = (userId: string) => blockedUsers.includes(userId);

  // Subscription
  const upgradeSubscription = (planId: string) => {
    if (!currentUser) return;
    const planName = planId === 'plan-premium' ? 'Premium Festival Pass' : 'Festival Pass';
    const updated = {
      ...currentUser,
      isPremium: true,
      premiumPlan: planName
    };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    showToast('✨ Premium Pass Activated!', `You are now on ${planName}`, 'success');
  };

  const resetFilters = () => {
    setSearchFilters(defaultFilterState);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isLoggedIn: !!authenticatedUser,
        isAdmin: authenticatedUser?.role === 'SUPER_ADMIN',
        login,
        loginAsDemoUser,
        loginAsDemoAdmin,
        logout,
        registerUser,
        updateUserProfile,

        events,
        userEvents,
        joinEvent,
        leaveEvent,
        isEventJoined,
        addNewEvent,

        cities,
        selectedStateCode,
        selectedStateName,
        setSelectedStateCode,
        selectedCity,
        setSelectedCity,

        users,
        partnerRequests,
        sendPartnerRequest,
        acceptPartnerRequest,
        declinePartnerRequest,
        hasRequestedPartner,

        matches,
        newMatchModalData,
        closeMatchModal,

        favorites,
        toggleFavorite,
        isFavorite,

        groups,
        joinSquadGroup,
        createSquadGroup,

        conversations,
        messages,
        activeConversationId,
        setActiveConversationId,
        sendMessage,
        shareContactInChat,

        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,

        reports,
        submitReport,
        blockedUsers,
        blockUser,
        unblockUser,
        isUserBlocked,

        upgradeSubscription,

        searchFilters,
        setSearchFilters,
        resetFilters,

        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
