import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AuthUser, UserRole } from '../api/types';
import { apiRequest } from '../lib/api-client';
import { authStorage } from '../lib/auth-storage';

interface LoginResponse { token: string; user: { id: string; name: string; role: UserRole; status: string }; redirectTo: string }
interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<LoginResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const meQuery = () => ({ queryKey: ['auth', 'me'] as const, queryFn: () => apiRequest<AuthUser>('/auth/me'), retry: false, staleTime: 60_000 });

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const hasToken = Boolean(authStorage.getToken());
  const query = useQuery({ ...meQuery(), enabled: hasToken });

  useEffect(() => {
    // Query results are the external authentication source synchronized into local session state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (query.data) setUser(query.data);
    if (query.isError) { authStorage.clear(); setUser(null); }
  }, [query.data, query.isError]);

  useEffect(() => {
    const clearSession = () => setUser(null);
    window.addEventListener('garbamitra:unauthorized', clearSession);
    return () => window.removeEventListener('garbamitra:unauthorized', clearSession);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: Boolean(user),
    isRestoring: hasToken && query.isPending,
    login: async (email, password, remember) => {
      const result = await apiRequest<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      authStorage.setToken(result.token, remember);
      const profile = await queryClient.fetchQuery(meQuery());
      setUser(profile);
      return result;
    },
    logout: () => {
      authStorage.clear();
      setUser(null);
      queryClient.removeQueries({ queryKey: ['auth'] });
    },
  }), [user, hasToken, query.isPending, queryClient]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
};
