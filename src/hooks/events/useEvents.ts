import { useQuery, useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { apiRequest, toQueryString } from '../../lib/api-client';
import type { ApiPhoto, EventStatus, Pagination } from '../../api/types';

export interface EventOrganizer {
  id: string;
  name: string;
  city: string;
  state: string;
  photos?: ApiPhoto[];
}

export interface EventSlotItem {
  id: string;
  eventId: string;
  title: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  entryFee: number;
  capacity?: number | null;
  status: 'OPEN' | 'SOLD_OUT' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  venueName: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  startsAt?: string;
  endsAt?: string;
  entryFeePaise?: number;
  entryFee?: number;
  capacity?: number | null;
  contactEmail?: string;
  contactPhone?: string;
  status: EventStatus;
  createdAt: string;
  images: ApiPhoto[];
  slots?: EventSlotItem[];
  organizer: EventOrganizer;
}

export interface EventQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  city?: string;
  status?: 'PUBLISHED' | 'DRAFT' | 'CANCELLED' | 'ALL';
  startsFrom?: string;
  startsBefore?: string;
  minFeePaise?: number;
  maxFeePaise?: number;
  isFree?: boolean;
  sortBy?: 'upcoming' | 'newest' | 'fee_asc' | 'fee_desc' | 'title_asc';
}

export interface EventsResponse {
  items: EventItem[];
  pagination: Pagination & { hasNextPage: boolean; hasPrevPage: boolean };
  filters: {
    search: string | null;
    state: string | null;
    city: string | null;
    status: string;
    isFree: boolean | null;
    minFeePaise: number | null;
    maxFeePaise: number | null;
    sortBy: string;
  };
}

export const eventsQueryKeys = {
  all: ['events'] as const,
  lists: () => [...eventsQueryKeys.all, 'list'] as const,
  list: (params?: EventQueryParams) => [...eventsQueryKeys.lists(), params ?? {}] as const,
  infinite: (params?: Omit<EventQueryParams, 'page'>) => [...eventsQueryKeys.lists(), 'infinite', params ?? {}] as const,
  details: () => [...eventsQueryKeys.all, 'detail'] as const,
  detail: (idOrSlug: string) => [...eventsQueryKeys.details(), idOrSlug] as const,
};

export function useEvents(params: EventQueryParams = {}) {
  const query = useQuery({
    queryKey: eventsQueryKeys.list(params),
    queryFn: async () => {
      const queryString = toQueryString(params as unknown as Record<string, string | number | boolean | null | undefined>);
      return apiRequest<EventsResponse>(`/events${queryString}`);
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  return {
    ...query,
    events: query.data?.items ?? [],
    pagination: query.data?.pagination,
    filters: query.data?.filters,
  };
}

export function useInfiniteEvents(params: Omit<EventQueryParams, 'page'> = {}) {
  const query = useInfiniteQuery({
    queryKey: eventsQueryKeys.infinite(params),
    queryFn: async ({ pageParam = 1 }) => {
      const queryString = toQueryString({
        ...params,
        page: pageParam,
      } as unknown as Record<string, string | number | boolean | null | undefined>);
      return apiRequest<EventsResponse>(`/events${queryString}`);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasNextPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 30_000,
  });

  const allEvents = query.data?.pages?.flatMap((page) => page.items) ?? [];
  const totalCount = query.data?.pages?.[0]?.pagination?.total ?? 0;

  return {
    ...query,
    events: allEvents,
    totalCount,
    isEmpty: !query.isLoading && allEvents.length === 0,
  };
}

export function useEvent(eventIdOrSlug: string | undefined) {
  return useQuery({
    queryKey: eventsQueryKeys.detail(eventIdOrSlug ?? ''),
    queryFn: async () => {
      if (!eventIdOrSlug) throw new Error('Event ID or slug is required');
      return apiRequest<EventItem>(`/events/${eventIdOrSlug}`);
    },
    enabled: Boolean(eventIdOrSlug),
    staleTime: 60_000,
  });
}
