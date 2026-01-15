'use client';

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { api, setTokens, clearTokens, getAccessToken } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (): Promise<void> => {
    try {
      const { data } = await api.get('/api/auth/me');
      setUser(data.data || data);
    } catch {
      setUser(null);
      clearTokens();
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (token) {
        await fetchProfile();
      }
      setLoading(false);
    };

    initAuth();
  }, [fetchProfile]);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const { data } = await api.post('/api/auth/login', { email, password });

      const tokens = data.data || data;
      setTokens(tokens.accessToken, tokens.refreshToken);

      await fetchProfile();
    },
    [fetchProfile]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName?: string,
      lastName?: string
    ): Promise<void> => {
      const { data } = await api.post('/api/auth/register', {
        email,
        password,
        firstName,
        lastName,
      });

      const tokens = data.data || data;
      if (tokens.accessToken) {
        setTokens(tokens.accessToken, tokens.refreshToken);
        await fetchProfile();
      }
    },
    [fetchProfile]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Proceed with local logout even if server call fails
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  const refreshProfile = useCallback(async (): Promise<void> => {
    await fetchProfile();
  }, [fetchProfile]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, loading, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
