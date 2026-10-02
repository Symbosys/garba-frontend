export type DanceLevel = 'Beginner' | 'Intermediate' | 'Expert';
export type LookingFor = 'Partner' | 'Group' | 'New Friends' | 'Any';
export type GenderPreference = 'Any' | 'Female' | 'Male';
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  age: number;
  dateOfBirth?: string;
  gender: 'Female' | 'Male' | 'Non-Binary' | 'Other';
  city: string;
  state?: string;
  area: string;
  addressLine?: string;
  bio: string;
  garbaLevel: DanceLevel;
  dandiyaLevel: DanceLevel;
  danceStyle: 'Traditional' | 'Modern Bollywood' | 'Fusion' | 'All Styles';
  lookingFor: LookingFor[];
  preferredGender: GenderPreference;
  preferredAgeMin: number;
  preferredAgeMax: number;
  preferredEvents: string[]; // event IDs
  availability: {
    dates: string[];
    startTime: string;
    endTime: string;
  };
  isVerified: {
    mobile: boolean;
    email: boolean;
    photo: boolean;
  };
  role: UserRole;
  isPremium: boolean;
  premiumPlan?: string;
  profileCompletion: number; // 0-100
  joinedAt: string;
  createdAt?: string;
  status: 'active' | 'suspended' | 'banned';
  reportCount?: number;
}

export interface PartnerProfile extends User {
  matchScore?: number;
  matchReasons?: string[];
  distanceKm?: number;
  currentEventId?: string;
  currentEventName?: string;
  currentEventDate?: string;
}

export interface FestivalEvent {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  bannerImage: string;
  city: string;
  venue: string;
  address: string;
  date: string;
  displayDate: string;
  startTime: string;
  endTime: string;
  price: number;
  originalPrice?: number;
  isFeatured: boolean;
  isTrending?: boolean;
  organizer: {
    name: string;
    verified: boolean;
    contact?: string;
  };
  description: string;
  rules: string[];
  whatToExpect: string[];
  safetyInfo: string[];
  dressCode?: string;
  registeredCount: number;
  lookingForPartnerCount: number;
  groupsCount: number;
  category: 'Garba Night' | 'Dandiya Raas' | 'Mega Utsav' | 'College Fest' | 'Traditional Mandli';
}

export interface CityInfo {
  id: string;
  name: string;
  slug: string;
  state: string;
  image: string;
  partnerCount: number;
  eventCount: number;
  popularAreas: string[];
  description: string;
  isTopCity: boolean;
}

export interface SquadGroup {
  id: string;
  name: string;
  eventId: string;
  eventName: string;
  city: string;
  date: string;
  venue: string;
  description: string;
  leaderId: string;
  leaderName: string;
  leaderAvatar: string;
  maxMembers: number;
  currentMembers: {
    id: string;
    name: string;
    avatar: string;
    role: 'Leader' | 'Member';
    garbaLevel: DanceLevel;
  }[];
  lookingForCount: number;
  tags: string[];
  dressTheme?: string;
}

export interface PartnerRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderCity: string;
  senderAge: number;
  senderGarbaLevel: DanceLevel;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface Match {
  id: string;
  users: [string, string];
  partner: User;
  eventId: string;
  eventName: string;
  eventDate: string;
  matchPercentage: number;
  matchedAt: string;
  status: 'active' | 'archived';
  lastMessageSnippet?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  image?: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  isSystemNotice?: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participant: User;
  eventId: string;
  eventName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  contactShared: {
    userShared: boolean;
    partnerShared: boolean;
    phone?: string;
  };
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'partner_request' | 'request_accepted' | 'new_match' | 'new_message' | 'event_reminder' | 'safety_alert';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  senderAvatar?: string;
}

export interface SafetyReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  reason: 'Harassment' | 'Fake Profile' | 'Offensive Content' | 'Scam' | 'Unwanted Messages' | 'Inappropriate Behaviour' | 'Other';
  description: string;
  evidenceUrl?: string;
  createdAt: string;
  status: 'Pending' | 'Under Review' | 'Resolved' | 'Rejected';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  resolutionNotes?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  duration: string;
  isPopular?: boolean;
  badge?: string;
  features: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedDate: string;
  readTime: string;
  category: string;
  content: string[];
}

export interface FilterState {
  city: string;
  eventId: string;
  date: string;
  tab: 'all' | 'need_partner' | 'groups' | 'new_friends';
  ageRange: [number, number];
  genderPreference: GenderPreference;
  danceLevel: 'All' | DanceLevel;
  lookingFor: string;
  style: string;
  onlyVerified: boolean;
  sortBy: 'match' | 'distance' | 'experience';
}
