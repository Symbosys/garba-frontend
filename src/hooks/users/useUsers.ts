import { useQuery, useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { apiRequest, toQueryString } from '../../lib/api-client';
import type { ApiPhoto, Pagination, UserRole } from '../../api/types';

export interface PublicUser {
  id: string;
  name: string;
  age: number;
  gender: string;
  city: string;
  state: string;
  role: UserRole;
  status: string;
  createdAt: string;
  photos: ApiPhoto[];
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  state?: string;
  city?: string;
  userType?: 'PARTNER' | 'ORGANIZER' | 'ALL';
  role?: 'PARTNER' | 'ORGANIZER' | 'ALL';
  gender?: string;
  minAge?: number;
  maxAge?: number;
  hasPhoto?: boolean;
  sortBy?: 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'age_asc' | 'age_desc';
}

export interface UsersResponse {
  items: PublicUser[];
  pagination: Pagination & { hasNextPage: boolean; hasPrevPage: boolean };
  filters: {
    search: string | null;
    state: string | null;
    city: string | null;
    role: string;
    gender: string;
    minAge: number | null;
    maxAge: number | null;
    sortBy: string;
  };
}

export const usersQueryKeys = {
  all: ['users'] as const,
  lists: () => [...usersQueryKeys.all, 'list'] as const,
  list: (params?: UserQueryParams) => [...usersQueryKeys.lists(), params ?? {}] as const,
  infinite: (params?: Omit<UserQueryParams, 'page'>) => [...usersQueryKeys.lists(), 'infinite', params ?? {}] as const,
  details: () => [...usersQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersQueryKeys.details(), id] as const,
};

export function useUsers(params: UserQueryParams = {}) {
  const query = useQuery({
    queryKey: usersQueryKeys.list(params),
    queryFn: async () => {
      const queryString = toQueryString(params as unknown as Record<string, string | number | boolean | null | undefined>);
      return apiRequest<UsersResponse>(`/users${queryString}`);
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  return {
    ...query,
    users: query.data?.items ?? [],
    pagination: query.data?.pagination,
    filters: query.data?.filters,
  };
}

export function useInfiniteUsers(params: Omit<UserQueryParams, 'page'> = {}) {
  const query = useInfiniteQuery({
    queryKey: usersQueryKeys.infinite(params),
    queryFn: async ({ pageParam = 1 }) => {
      const queryString = toQueryString({
        ...params,
        page: pageParam,
      } as unknown as Record<string, string | number | boolean | null | undefined>);
      return apiRequest<UsersResponse>(`/users${queryString}`);
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

  const allUsers = query.data?.pages?.flatMap((page) => page.items) ?? [];
  const totalCount = query.data?.pages?.[0]?.pagination?.total ?? 0;

  return {
    ...query,
    users: allUsers,
    totalCount,
    isEmpty: !query.isLoading && allUsers.length === 0,
  };
}

export function useUser(userId: string | undefined) {
  return useQuery({
    queryKey: usersQueryKeys.detail(userId ?? ''),
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      return apiRequest<PublicUser>(`/users/${userId}`);
    },
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
}
