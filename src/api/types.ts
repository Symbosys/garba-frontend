export type UserRole = 'PARTNER' | 'ORGANIZER' | 'SUPER_ADMIN';
export type AccountStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED';

export interface ApiPhoto { id: string; url: string; sortOrder: number }

export interface AuthUser {
  id: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  gender: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  photos: ApiPhoto[];
}

export interface RegistrationPayment {
  amountPaise: number;
  currency: string;
  status: PaymentStatus;
  proofUrl?: string;
  proofMimeType?: string;
  proofBytes?: number;
  createdAt: string;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  reviewedBy?: { id: string; name: string } | null;
}

export interface AdminUser {
  id: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  addressLine?: string;
  city: string;
  state: string;
  gender: string;
  role: 'PARTNER' | 'ORGANIZER';
  status: AccountStatus;
  rejectionReason?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  photos: ApiPhoto[];
  registrationPayment: RegistrationPayment | null;
}

export interface AdminDashboardData {
  users: { total: number; verified: number; unverified: number; rejected: number; partners: number; organizers: number };
  payments: { total: number; verified: number; unverified: number; rejected: number; verifiedRevenuePaise: number };
  events: { total: number; published: number; draft: number; cancelled: number };
  recentPending: AdminUser[];
}

export interface AdminEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  venueName: string;
  addressLine: string;
  city: string;
  state: string;
  latitude: string;
  longitude: string;
  startsAt: string;
  endsAt: string;
  entryFeePaise: number;
  currency: string;
  capacity?: number | null;
  status: EventStatus;
  createdAt: string;
  images: ApiPhoto[];
  organizer: { id: string; name: string; email: string; phone: string; city: string; state: string; status: AccountStatus };
}

export interface Pagination { page: number; limit: number; total: number; pages: number }
export interface Paginated<T> { items: T[]; pagination: Pagination }
