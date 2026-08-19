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

/** Direct API URL for public auth calls — bypasses gradgrid-web 30s proxy timeout on Render. */
export function getDirectApiBase(): string | null {
  const raw = process.env.NEXT_PUBLIC_DIRECT_API_URL?.trim();
  if (!raw) return null;
  return `${raw.replace(/\/$/, '')}/api/v1`;
}

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
      const res = await fetch(`${API_BASE}/auth/institution/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      let body: { data?: { tokens?: { accessToken?: string } } } | null = null;
      if (res.ok) {
        body = await res.json();
      } else {
        for (const path of ['/auth/platform/refresh', '/auth/portal/refresh', '/auth/refresh']) {
          const alt = await fetch(`${API_BASE}${path}`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          if (alt.ok) {
            body = await alt.json();
            break;
          }
        }
      }

      const newToken = body?.data?.tokens?.accessToken;
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

/** Extract a user-facing message from a thrown API response or Error. */
export function getApiErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  return getApiError(err, fallback).message;
}

/** Extract error code and message from a thrown API response. */
export function getApiError(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): { code: string; message: string } {
  if (!err || typeof err !== "object") {
    return { code: "UNKNOWN", message: fallback };
  }

  const body = err as Partial<ApiResponse>;
  if (body.error?.message) {
    return {
      code: body.error.code || "UNKNOWN",
      message: body.error.message,
    };
  }

  const direct = err as { message?: string; code?: string };
  if (typeof direct.message === "string" && direct.message.length > 0) {
    return { code: direct.code || "UNKNOWN", message: direct.message };
  }

  return { code: "UNKNOWN", message: fallback };
}

/**
 * Core request function.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth = true,
  useDirectPublic = false
): Promise<ApiResponse<T>> {
  const base = useDirectPublic && getDirectApiBase() ? getDirectApiBase()! : API_BASE;
  const url = endpoint.startsWith('http') ? endpoint : `${base}${endpoint}`;
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
    credentials: useDirectPublic ? 'omit' : 'include',
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
        credentials: useDirectPublic ? 'omit' : 'include',
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

  /** Public auth endpoints — call API directly when NEXT_PUBLIC_DIRECT_API_URL is set (Render). */
  postPublic<T>(endpoint: string, data?: unknown) {
    return request<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      false,
      true
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
