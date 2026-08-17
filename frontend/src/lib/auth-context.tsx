/**
 * GradGrid — Auth Context
 *
 * Manages authentication state globally.
 * - Access token is stored in React state (in-memory only)
 * - Refresh token is stored in an httpOnly cookie (set by backend)
 * - On mount, attempts a silent refresh using the cookie
 * - Exposes login, logout, and auth state via useAuth() hook
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, configureAuth } from './api-client';
import type { AuthState, User } from '@/types';

/* ─── Types ─── */

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponseData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    userType: string;
    roleName: string;
    permissions: string[];
    sessionId?: string;
  };
  tokens: {
    accessToken: string;
  };
}

/** Shape returned by GET /auth/me (used for silent refresh + profile prefill). */
interface MeResponseData {
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    first_name?: string;
    last_name?: string;
    email: string;
    userType?: string;
    user_type?: string;
    permissions?: string[];
    sessionId?: string;
  };
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  /** Update the in-memory user after profile changes (e.g. name/phone). */
  updateUser: (patch: Partial<Pick<User, "name" | "email">>) => void;
}

/* ─── Context ─── */

const AuthContext = createContext<AuthContextValue | null>(null);

/* ─── Hook ─── */

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

/* ─── Provider ─── */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true, // starts true while we check for an existing session
  });

  // Keep a ref to the current token for the API client
  const tokenRef = React.useRef<string | null>(null);

  // ── Configure API client token management on mount ──
  useEffect(() => {
    configureAuth({
      getToken: () => tokenRef.current,
      setToken: (token: string | null) => {
        tokenRef.current = token;
        if (!token) {
          setState({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
        }
      },
      onUnauthenticated: () => {
        tokenRef.current = null;
        setState({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      },
    });
  }, []);

  // ── Silent refresh on mount — tries /auth/refresh using httpOnly cookie ──
  useEffect(() => {
    let cancelled = false;

    async function trySilentRefresh() {
      try {
        // Step 1: Refresh the access token using the httpOnly cookie
        const refreshRes = await api.post<{ tokens: { accessToken: string } }>(
          '/auth/refresh',
          {},
          false // no auth required — uses cookie
        );

        if (cancelled || !refreshRes.success || !refreshRes.data) return;

        const accessToken = refreshRes.data.tokens.accessToken;
        tokenRef.current = accessToken;

        // Step 2: Fetch the user profile with the new token
        const meRes = await api.get<MeResponseData>('/auth/me', true);

        if (cancelled) return;

        if (meRes.success && meRes.data?.user) {
          const u = meRes.data.user;
          setState({
            user: {
              id: u.id,
              name: `${u.firstName || u.first_name || ''} ${u.lastName || u.last_name || ''}`.trim(),
              email: u.email,
              role: (u.userType || u.user_type || 'institution') as User['role'],
              permissions: u.permissions || [],
              sessionId: u.sessionId,
            },
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      } catch {
        // No valid session — stay unauthenticated
      }

      if (!cancelled) {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }

    trySilentRefresh();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Login ──
  const login = useCallback(async (credentials: LoginCredentials) => {
    const res = await api.post<LoginResponseData>('/auth/login', credentials, false);

    if (!res.success || !res.data) {
      throw res.error || new Error('Login failed');
    }

    const { user, tokens } = res.data;
    tokenRef.current = tokens.accessToken;

    setState({
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.userType as User['role'],
        permissions: user.permissions || [],
        sessionId: user.sessionId,
      },
      accessToken: tokens.accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  // ── Logout ──
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Proceed even if the server call fails
    }

    tokenRef.current = null;
    setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  // ── Update in-memory user (after profile edits) ──
  const updateUser = useCallback((patch: Partial<Pick<User, "name" | "email">>) => {
    setState((prev) => (prev.user ? { ...prev, user: { ...prev.user, ...patch } } : prev));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
