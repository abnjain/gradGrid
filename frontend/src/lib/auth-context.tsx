/**
 * GradGrid — Auth Context
 *
 * Manages authentication state globally.
 * - Access token is stored in React state (in-memory only)
 * - Refresh token is stored in an httpOnly cookie (set by backend)
 * - On mount, attempts a silent refresh using the cookie
 * - Exposes login, registerInstitution, logout, tenant selection, and auth state via useAuth()
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, configureAuth, getApiError, getApiErrorMessage } from './api-client';
import {
  audienceFromUserType,
  authApiPrefix,
  clearPortalCookie,
  clearRefreshCookie,
  clearLoggedOutMarker,
  markLoggedOut,
  setPortalCookie,
  type AuthAudience,
} from './auth-routes';
import type {
  AuthState,
  AuthUserType,
  TenantContext,
  User,
  UserRole,
  WorkspaceOrganization,
} from '@/types';

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
    roleName?: string;
    sessionId?: string;
    institutionId?: string | null;
    organizationId?: string | null;
    organizationName?: string | null;
    institutionName?: string | null;
    tenantContext?: TenantContext | null;
  };
}

interface SelectContextResponse {
  tokens: { accessToken: string };
  context: TenantContext;
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
  login: (credentials: LoginCredentials, audience?: AuthAudience) => Promise<AuthUserType>;
  registerInstitution: (data: RegisterInstitutionInput) => Promise<{ email: string; verificationOtp?: string }>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<{ verificationOtp?: string }>;
  logout: () => Promise<void>;
  loadWorkspaces: () => Promise<WorkspaceOrganization[]>;
  selectContext: (organizationId: string, institutionId: string) => Promise<TenantContext>;
  clearTenantContext: () => void;
  updateUser: (patch: Partial<Pick<User, 'name' | 'email'>>) => void;
}

function normalizeUserType(value?: string | null): AuthUserType {
  if (value === 'platform') return 'platform';
  if (value === 'parent') return 'parent';
  if (value === 'student') return 'student';
  return 'institution';
}

function mapTenantContext(
  tenantContext?: TenantContext | null,
  fallback?: {
    organizationId?: string | null;
    organizationName?: string | null;
    institutionId?: string | null;
    institutionName?: string | null;
  }
): TenantContext | null {
  if (tenantContext?.organizationId && tenantContext.institutionId) {
    return tenantContext;
  }

  if (fallback?.organizationId && fallback.institutionId && fallback.organizationName && fallback.institutionName) {
    return {
      organizationId: fallback.organizationId,
      organizationName: fallback.organizationName,
      institutionId: fallback.institutionId,
      institutionName: fallback.institutionName,
    };
  }

  return null;
}

function mapAuthUser(payload: AuthUserPayload, tenantContext?: TenantContext | null): User {
  const userType = normalizeUserType(payload.userType);
  return {
    id: payload.id,
    name: `${payload.firstName} ${payload.lastName}`.trim(),
    email: payload.email,
    userType,
    roleName: payload.roleName,
    role: (userType === 'platform' ? 'platform_admin' : 'owner') as UserRole,
    permissions: payload.permissions || [],
    institutionId: tenantContext?.institutionId || payload.institutionId || undefined,
    institutionName: tenantContext?.institutionName,
    organizationId: tenantContext?.organizationId,
    organizationName: tenantContext?.organizationName,
    sessionId: payload.sessionId,
  };
}

function mapMeUser(u: MeResponseData['user']): { user: User; tenantContext: TenantContext | null } {
  const userType = normalizeUserType(u.userType || u.user_type);
  const tenantContext = mapTenantContext(u.tenantContext, {
    organizationId: u.organizationId,
    organizationName: u.organizationName,
    institutionId: u.institutionId,
    institutionName: u.institutionName,
  });

  return {
    tenantContext,
    user: {
      id: u.id,
      name: `${u.firstName || u.first_name || ''} ${u.lastName || u.last_name || ''}`.trim(),
      email: u.email,
      userType,
      role: (userType === 'platform' ? 'platform_admin' : 'owner') as UserRole,
      roleName: u.roleName,
      permissions: u.permissions || [],
      institutionId: tenantContext?.institutionId || u.institutionId || undefined,
      institutionName: tenantContext?.institutionName || u.institutionName || undefined,
      organizationId: tenantContext?.organizationId || u.organizationId || undefined,
      organizationName: tenantContext?.organizationName || u.organizationName || undefined,
      sessionId: u.sessionId,
    },
  };
}

function throwApiError(err: unknown, fallback: string): never {
  const { code, message } = getApiError(err, fallback);
  throw new AuthApiError(code, message);
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    tenantContext: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const tokenRef = React.useRef<string | null>(null);
  const authGenerationRef = React.useRef(0);
  const sessionInvalidatedRef = React.useRef(false);

  useEffect(() => {
    configureAuth({
      getToken: () => tokenRef.current,
      setToken: (token: string | null) => {
        if (token && sessionInvalidatedRef.current) return;
        tokenRef.current = token;
        if (!token) {
          setState({
            user: null,
            accessToken: null,
            tenantContext: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
      onUnauthenticated: () => {
        authGenerationRef.current += 1;
        sessionInvalidatedRef.current = true;
        tokenRef.current = null;
        clearPortalCookie();
        markLoggedOut();
        setState({
          user: null,
          accessToken: null,
          tenantContext: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const generation = authGenerationRef.current;

    const isStale = () => cancelled || generation !== authGenerationRef.current;

    async function trySilentRefresh() {
      try {
        const refreshRes = await api.post<{ tokens: { accessToken: string } }>(
          '/auth/institution/refresh',
          {},
          false
        );
        if (isStale()) return;

        if (!refreshRes.success || !refreshRes.data) {
          // try platform then portal
          for (const path of ['/auth/platform/refresh', '/auth/portal/refresh', '/auth/refresh'] as const) {
            try {
              const alt = await api.post<{ tokens: { accessToken: string } }>(path, {}, false);
              if (isStale()) return;
              if (alt.success && alt.data) {
                const accessToken = alt.data.tokens.accessToken;
                tokenRef.current = accessToken;
                const mePath = path.includes('platform')
                  ? '/auth/platform/me'
                  : path.includes('portal')
                    ? '/auth/portal/me'
                    : '/auth/institution/me';
                const meRes = await api.get<MeResponseData>(mePath, true);
                if (isStale()) return;
                if (meRes.success && meRes.data?.user) {
                  const { user, tenantContext } = mapMeUser(meRes.data.user);
                  setPortalCookie(user.userType);
                  setState({
                    user,
                    accessToken,
                    tenantContext,
                    isAuthenticated: true,
                    isLoading: false,
                  });
                  return;
                }
              }
            } catch {
              // continue
            }
          }
          return;
        }

        const accessToken = refreshRes.data.tokens.accessToken;
        tokenRef.current = accessToken;

        const meRes = await api.get<MeResponseData>('/auth/institution/me', true);
        if (isStale()) return;

        if (meRes.success && meRes.data?.user) {
          const { user, tenantContext } = mapMeUser(meRes.data.user);
          setPortalCookie(user.userType);
          setState({
            user,
            accessToken,
            tenantContext,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      } catch {
        // no session
      }

      if (!isStale()) {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }

    trySilentRefresh();
    return () => { cancelled = true; };
  }, []);

  const applySession = useCallback(
    (user: User, accessToken: string, tenantContext: TenantContext | null = null) => {
      sessionInvalidatedRef.current = false;
      clearLoggedOutMarker();
      tokenRef.current = accessToken;
      setState({
        user,
        accessToken,
        tenantContext,
        isAuthenticated: true,
        isLoading: false,
      });
    },
    []
  );

  const login = useCallback(async (credentials: LoginCredentials, audience: AuthAudience = 'institution'): Promise<AuthUserType> => {
    try {
      const res = await api.post<LoginResponseData>(`${authApiPrefix(audience)}/login`, credentials, false);
      if (!res.success || !res.data) throw res;
      const user = mapAuthUser(res.data.user);
      setPortalCookie(user.userType);
      applySession(user, res.data.tokens.accessToken, null);
      return user.userType;
    } catch (err) {
      throwApiError(err, 'Invalid email or password');
    }
  }, [applySession]);

  const registerInstitution = useCallback(async (data: RegisterInstitutionInput) => {
    try {
      const res = await api.postPublic<{
        email: string;
        requiresEmailVerification: boolean;
        verificationOtp?: string;
      }>('/auth/institution/register-institution', data);
      if (!res.success || !res.data) throw res;
      return { email: res.data.email, verificationOtp: res.data.verificationOtp };
    } catch (err) {
      throwApiError(err, 'Sign up failed. Please try again.');
    }
  }, []);

  const verifyEmail = useCallback(async (email: string, otp: string) => {
    try {
      const res = await api.postPublic('/auth/institution/verify-email', { email, otp });
      if (!res.success) throw res;
    } catch (err) {
      throwApiError(err, 'Verification failed. Please try again.');
    }
  }, []);

  const resendOtp = useCallback(async (email: string) => {
    try {
      const res = await api.postPublic<{ verificationOtp?: string }>('/auth/institution/resend-otp', { email });
      if (!res.success) throw res;
      return { verificationOtp: res.data?.verificationOtp };
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Could not resend code. Please try again.'));
    }
  }, []);

  const loadWorkspaces = useCallback(async () => {
    const res = await api.get<{ organizations: WorkspaceOrganization[] }>('/auth/institution/workspaces');
    if (!res.success || !res.data) throw res;
    return res.data.organizations;
  }, []);

  const selectContext = useCallback(async (organizationId: string, institutionId: string) => {
    try {
      const res = await api.post<SelectContextResponse>('/auth/institution/select-context', {
        organizationId,
        institutionId,
      });
      if (!res.success || !res.data) throw res;

      const { context } = res.data;
      const accessToken = res.data.tokens.accessToken;
      tokenRef.current = accessToken;

      setState((prev) => {
        if (!prev.user) return prev;
        return {
          ...prev,
          accessToken,
          tenantContext: context,
          user: {
            ...prev.user,
            organizationId: context.organizationId,
            organizationName: context.organizationName,
            institutionId: context.institutionId,
            institutionName: context.institutionName,
          },
        };
      });

      return context;
    } catch (err) {
      throwApiError(err, 'Could not select workspace. Please try again.');
    }
  }, []);

  const clearTenantContext = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tenantContext: null,
      user: prev.user
        ? {
            ...prev.user,
            organizationId: undefined,
            organizationName: undefined,
            institutionId: undefined,
            institutionName: undefined,
          }
        : null,
    }));
  }, []);

  const logout = useCallback(async () => {
    const audience = audienceFromUserType(state.user?.userType);
    authGenerationRef.current += 1;
    sessionInvalidatedRef.current = true;

    // Start the server logout while the current access token is available,
    // without allowing a 401 to create a new refresh session.
    const logoutRequest = api.postNoRefresh(`${authApiPrefix(audience)}/logout`);

    // Clear the UI immediately so protected layouts cannot remain visible while
    // the server revokes the session and clears its httpOnly cookies.
    tokenRef.current = null;
    clearPortalCookie();
    clearRefreshCookie();
    markLoggedOut();
    setState({
      user: null,
      accessToken: null,
      tenantContext: null,
      isAuthenticated: false,
      isLoading: false,
    });

    try {
      await logoutRequest;
    } catch {
      // proceed — still clear local session
    }
    clearRefreshCookie();
  }, [state.user?.userType]);

  const updateUser = useCallback((patch: Partial<Pick<User, 'name' | 'email'>>) => {
    setState((prev) => (prev.user ? { ...prev, user: { ...prev.user, ...patch } } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        registerInstitution,
        verifyEmail,
        resendOtp,
        logout,
        loadWorkspaces,
        selectContext,
        clearTenantContext,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
