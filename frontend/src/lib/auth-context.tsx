/**
 * GradGrid — Auth Context
 *
 * Manages authentication state globally.
 * - Access token is stored in React state (in-memory only)
 * - Refresh token is stored in an httpOnly cookie (set by backend)
 * - On mount, attempts a silent refresh using the cookie
 * - Exposes login, registerInstitution, logout, and auth state via useAuth() hook
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, configureAuth, getApiError, getApiErrorMessage } from './api-client';
import type { AuthState, AuthUserType, User, UserRole } from '@/types';

export interface RegisterInstitutionInput {
  organizationName: string;
  institutionName: string;
  institutionCode: string;
  city?: string;
  state?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthUserPayload {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  roleName?: string;
  permissions?: string[];
  sessionId?: string;
  institutionId?: string | null;
}

interface LoginResponseData {
  user: AuthUserPayload;
  tokens: { accessToken: string };
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
    institutionId?: string | null;
  };
}

export class AuthApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'AuthApiError';
  }
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthUserType>;
  registerInstitution: (data: RegisterInstitutionInput) => Promise<{ email: string }>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Update the in-memory user after profile changes (e.g. name/phone). */
  updateUser: (patch: Partial<Pick<User, "name" | "email">>) => void;
}

/* ─── Helpers ─── */

function normalizeUserType(value?: string | null): AuthUserType {
  return value === 'platform' ? 'platform' : 'institution';
}

function mapAuthUser(payload: AuthUserPayload): User {
  const userType = normalizeUserType(payload.userType);
  return {
    id: payload.id,
    name: `${payload.firstName} ${payload.lastName}`.trim(),
    email: payload.email,
    userType,
    roleName: payload.roleName,
    // Default role until RBAC assigns granular roles
    role: (userType === 'platform' ? 'platform_admin' : 'owner') as UserRole,
    permissions: payload.permissions || [],
    institutionId: payload.institutionId || undefined,
    sessionId: payload.sessionId,
  };
}

function mapMeUser(u: MeResponseData['user']): User {
  const userType = normalizeUserType(u.userType || u.user_type);
  return {
    id: u.id,
    name: `${u.firstName || u.first_name || ''} ${u.lastName || u.last_name || ''}`.trim(),
    email: u.email,
    userType,
    role: (userType === 'platform' ? 'platform_admin' : 'owner') as UserRole,
    permissions: u.permissions || [],
    institutionId: u.institutionId || undefined,
    sessionId: u.sessionId,
  };
}

function throwApiError(err: unknown, fallback: string): never {
  const { code, message } = getApiError(err, fallback);
  throw new AuthApiError(code, message);
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ─── Hook ─── */

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
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
          setState({
            user: mapMeUser(meRes.data.user),
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      } catch {
        // No valid session
      }

      if (!cancelled) {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }

    trySilentRefresh();
    return () => { cancelled = true; };
  }, []);

  const applySession = useCallback((user: User, accessToken: string) => {
    tokenRef.current = accessToken;
    setState({ user, accessToken, isAuthenticated: true, isLoading: false });
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthUserType> => {
    try {
      const res = await api.post<LoginResponseData>('/auth/login', credentials, false);
      if (!res.success || !res.data) throw res;
      const user = mapAuthUser(res.data.user);
      applySession(user, res.data.tokens.accessToken);
      return user.userType;
    } catch (err) {
      throwApiError(err, 'Invalid email or password');
    }
  }, [applySession]);

  const registerInstitution = useCallback(async (data: RegisterInstitutionInput) => {
    try {
      const res = await api.post<{ email: string; requiresEmailVerification: boolean }>(
        '/auth/register-institution',
        data,
        false
      );
      if (!res.success || !res.data) throw res;
      return { email: res.data.email };
    } catch (err) {
      throwApiError(err, 'Sign up failed. Please try again.');
    }
  }, []);

  const verifyEmail = useCallback(async (email: string, otp: string) => {
    try {
      const res = await api.post('/auth/verify-email', { email, otp }, false);
      if (!res.success) throw res;
    } catch (err) {
      throwApiError(err, 'Verification failed. Please try again.');
    }
  }, []);

  const resendOtp = useCallback(async (email: string) => {
    try {
      const res = await api.post('/auth/resend-otp', { email }, false);
      if (!res.success) throw res;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Could not resend code. Please try again.'));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // proceed
    }
    tokenRef.current = null;
    setState({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateUser = useCallback((patch: Partial<Pick<User, 'name' | 'email'>>) => {
    setState((prev) => (prev.user ? { ...prev, user: { ...prev.user, ...patch } } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, registerInstitution, verifyEmail, resendOtp, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
