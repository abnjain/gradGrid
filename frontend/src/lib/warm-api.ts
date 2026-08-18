/**
 * Wake Render free-tier API before slow mutations (cold start ~30–90s).
 */

import { getDirectApiBase } from "./api-client";

export async function warmApi(timeoutMs = 90_000): Promise<boolean> {
  const directBase = getDirectApiBase();
  const healthUrl = directBase
    ? `${directBase}/health`
    : `${process.env.NEXT_PUBLIC_API_URL || "/api/v1"}/health`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(healthUrl, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
      credentials: directBase ? "omit" : "include",
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
