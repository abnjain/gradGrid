import { NextRequest, NextResponse } from "next/server";
import {
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PLATFORM,
  REFRESH_COOKIE_INSTITUTION,
  REFRESH_COOKIE_PORTAL,
  PORTAL_COOKIE_NAME,
} from "@/lib/auth-routes";

/**
 * Runtime API proxy for Render (and any split-host deployment).
 * Browser calls same-origin /api/v1/*; this forwards to API_INTERNAL_URL.
 */

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

/** Cookie paths used historically for the refresh token — clear all on logout. */
const REFRESH_COOKIE_NAMES = [
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PLATFORM,
  REFRESH_COOKIE_INSTITUTION,
  REFRESH_COOKIE_PORTAL,
] as const;
const REFRESH_COOKIE_PATHS = [
  "/",
  "/api/v1/auth/refresh",
  "/api/v1/auth/platform/refresh",
  "/api/v1/auth/institution/refresh",
  "/api/v1/auth/portal/refresh",
] as const;

function getApiBase(): string | null {
  const base = process.env.API_INTERNAL_URL?.replace(/\/$/, "");
  if (base) return base;
  if (process.env.NODE_ENV === "development") return "http://localhost:4000";
  return null;
}

function appendUpstreamSetCookies(response: NextResponse, upstream: Response) {
  const setCookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : [];

  if (setCookies.length > 0) {
    for (const cookie of setCookies) {
      response.headers.append("Set-Cookie", cookie);
    }
    return;
  }

  const raw = upstream.headers.get("set-cookie");
  if (raw) {
    response.headers.append("Set-Cookie", raw);
  }
}

function clearRefreshCookiesOnResponse(response: NextResponse) {
  for (const name of REFRESH_COOKIE_NAMES) {
    for (const path of REFRESH_COOKIE_PATHS) {
      response.cookies.set(name, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path,
        maxAge: 0,
      });
    }
  }
  response.cookies.set(PORTAL_COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

function buildJsonResponse(
  upstream: Response,
  responseText: string,
  clearRefreshCookie: boolean
): NextResponse {
  const response = new NextResponse(responseText, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  });
  appendUpstreamSetCookies(response, upstream);
  if (clearRefreshCookie) {
    clearRefreshCookiesOnResponse(response);
  }
  return response;
}

async function proxy(request: NextRequest, path: string[]): Promise<NextResponse> {
  const apiBase = getApiBase();
  if (!apiBase) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "API_PROXY_UNCONFIGURED",
          message: "API_INTERNAL_URL is not set on the frontend service.",
        },
      },
      { status: 502 }
    );
  }

  const targetPath = path.length > 0 ? `/api/${path.join("/")}` : "/api";
  const targetUrl = `${apiBase}${targetPath}${request.nextUrl.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (!HOP_BY_HOP.has(lower)) {
      headers.set(key, value);
    }
  });

  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.text();
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
  }

  let upstream: Response;
  const controller = new AbortController();
  const timeoutMs = 25_000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      signal: controller.signal,
    });
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: isTimeout ? "API_COLD_START" : "API_PROXY_ERROR",
          message: isTimeout
            ? "Server is waking up (Render free tier). Wait 30–60 seconds and try again."
            : error instanceof Error
              ? error.message
              : "Upstream API unreachable",
        },
      },
      { status: isTimeout ? 503 : 502 }
    );
  } finally {
    clearTimeout(timer);
  }

  const responseText = await upstream.text();
  const contentType = upstream.headers.get("content-type") || "";
  const isLogout =
    request.method === "POST" &&
    /^v1\/auth\/(?:logout|(?:platform|institution|portal)\/logout)$/.test(path.join("/"));

  if (contentType.includes("application/json")) {
    return buildJsonResponse(upstream, responseText, isLogout);
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "API_UPSTREAM_ERROR",
        message: responseText.trim() || upstream.statusText || "Upstream API error",
      },
    },
    { status: upstream.status >= 400 ? upstream.status : 502 }
  );
}

type RouteContext = { params: Promise<{ path?: string[] }> };

async function handle(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  return proxy(request, path);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
