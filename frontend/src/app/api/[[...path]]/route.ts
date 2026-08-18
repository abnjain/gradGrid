import { NextRequest, NextResponse } from "next/server";

/**
 * Runtime API proxy for Render (and any split-host deployment).
 * Browser calls same-origin /api/v1/*; this forwards to API_INTERNAL_URL.
 */

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
]);

function getApiBase(): string | null {
  const base = process.env.API_INTERNAL_URL?.replace(/\/$/, "");
  if (base) return base;
  if (process.env.NODE_ENV === "development") return "http://localhost:4000";
  return null;
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
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
    init.duplex = "half";
  }

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, init);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upstream API unreachable";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "API_PROXY_ERROR",
          message,
        },
      },
      { status: 502 }
    );
  }
  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      responseHeaders.append(key, value);
    }
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
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
