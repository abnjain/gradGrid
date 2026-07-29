/**
 * GradGrid — API Client
 *
 * Lightweight fetch wrapper with automatic token refresh.
 * The access token is injected via a callback (set by AuthContext).
 * The refresh token is sent automatically via httpOnly cookie.
 */

type TokenGetter = () => string | null;
type TokenSetter = (token: string | null) => void;
type OnUnauthenticated = () => void;

let getAccessToken: TokenGetter = () => null;
let setAccessToken: TokenSetter = () => {};
let onUnauthenticated: OnUnauthenticated = () => {};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// Track refresh state to avoid concurrent refresh calls
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Configure token management callbacks — called by AuthProvider on mount.
 */
export function configureAuth(config: {
  getToken: TokenGetter;
  setToken: TokenSetter;
  onUnauthenticated: OnUnauthenticated;
}) {
  getAccessToken = config.getToken;
  setAccessToken = config.setToken;
  onUnauthenticated = config.onUnauthenticated;
}

/**
 * Attempt to refresh the access token using the httpOnly cookie.
 */
async function attemptRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // sends the httpOnly cookie
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        setAccessToken(null);
        return false;
      }

      const body = await res.json();
      const newToken = body.data?.tokens?.accessToken;
      if (newToken) {
        setAccessToken(newToken);
        return true;
      }

      setAccessToken(null);
      return false;
    } catch {
      setAccessToken(null);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Typed API response matching the backend envelope.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Core request function.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth = true
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (requireAuth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // On 401, attempt token refresh and retry once
  if (res.status === 401 && requireAuth) {
    const refreshed = await attemptRefresh();
    if (refreshed) {
      const newToken = getAccessToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
      }
      res = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
    } else {
      onUnauthenticated();
      return {
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Session expired. Please login again.',
        },
      };
    }
  }

  const body: ApiResponse<T> = await res.json();

  if (!res.ok) {
    throw body;
  }

  return body;
}

// ─── Public Methods ───

export const api = {
  get<T>(endpoint: string, requireAuth = true) {
    return request<T>(endpoint, { method: 'GET' }, requireAuth);
  },

  post<T>(endpoint: string, data?: unknown, requireAuth = true) {
    return request<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      requireAuth
    );
  },

  put<T>(endpoint: string, data?: unknown, requireAuth = true) {
    return request<T>(
      endpoint,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      requireAuth
    );
  },

  patch<T>(endpoint: string, data?: unknown, requireAuth = true) {
    return request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      },
      requireAuth
    );
  },

  delete<T>(endpoint: string, requireAuth = true) {
    return request<T>(endpoint, { method: 'DELETE' }, requireAuth);
  },
};
