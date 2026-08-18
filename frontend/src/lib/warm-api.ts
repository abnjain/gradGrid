/**
 * Wake Render free-tier API before slow mutations (cold start ~30–90s).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export async function warmApi(timeoutMs = 90_000): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}/health`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
