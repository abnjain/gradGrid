/**
 * GradGrid — Performance & Core Web Vitals Utilities
 *
 * Helpers for generating preload/preconnect hints, cache headers,
 * and performance-optimized asset delivery.
 *
 * Use these to ensure GradGrid meets Core Web Vitals targets: LCP < 2.5s, FID < 100ms, CLS < 0.1.
 */

/* ─── Types ─── */

export interface PreloadHint {
  rel: "preload" | "prefetch" | "modulepreload" | "preconnect" | "dns-prefetch";
  href: string;
  as?: "script" | "style" | "font" | "image" | "fetch" | "document";
  type?: string;
  crossOrigin?: "anonymous" | "use-credentials";
}

export interface PreconnectHint {
  rel: "preconnect" | "dns-prefetch";
  href: string;
  crossOrigin?: "anonymous" | "use-credentials";
}

export interface CacheControl {
  /** Cache-Control header value */
  value: string;
  /** CDN max-age in seconds */
  cdnMaxAge: number;
  /** Browser max-age in seconds */
  browserMaxAge: number;
}

/* ─── Preload Hint Generators ─── */

/**
 * Generate preload hints for critical assets.
 * These tell the browser to start loading key resources early.
 */
export function generatePreloadHints(assets: PreloadHint[]): PreloadHint[] {
  return assets;
}

/**
 * Default critical preload hints for GradGrid.
 * Includes fonts and key CSS.
 */
export function getDefaultPreloadHints(): PreloadHint[] {
  return [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
  ];
}

/**
 * Generate preconnect hints for third-party origins.
 * Reduces connection setup time for critical third-party resources.
 */
export function generatePreconnectHints(
  origins: PreconnectHint[]
): PreconnectHint[] {
  return origins;
}

/**
 * Default preconnect hints for GradGrid.
 */
export function getDefaultPreconnectHints(): PreconnectHint[] {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
    { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
    { rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
  ];
}

/* ─── Cache Control ─── */

/**
 * Build standardized Cache-Control header values for different asset types.
 */
export function getCacheHeaders(ttl: number): CacheControl {
  return {
    value: `public, max-age=${ttl}, s-maxage=${ttl * 2}, immutable`,
    cdnMaxAge: ttl * 2,
    browserMaxAge: ttl,
  };
}

/**
 * Predefined cache TTLs for common GradGrid asset types.
 */
export const CACHE_TTL = {
  /** Static assets with content hash (JS, CSS bundles) — 1 year */
  IMMUTABLE: 31536000,
  /** Font files — 1 year */
  FONTS: 31536000,
  /** OG images, logos — 1 week */
  IMAGES: 604800,
  /** API responses (non-sensitive) — 5 minutes */
  API_PUBLIC: 300,
  /** Static pages (CDN) — 10 minutes */
  STATIC_PAGE: 600,
} as const;

/* ─── Performance Budgets ─── */

/**
 * Core Web Vitals and performance budgets for GradGrid.
 * These should be checked in CI/CD to prevent regressions.
 */
export const PERFORMANCE_BUDGETS = {
  /** Largest Contentful Paint target (seconds) */
  LCP: 2.5,
  /** First Input Delay target (milliseconds) */
  FID: 100,
  /** Cumulative Layout Shift target */
  CLS: 0.1,
  /** First Contentful Paint target (seconds) */
  FCP: 1.8,
  /** Time to Interactive target (seconds) */
  TTI: 3.5,
  /** Total bundle size budget (KB) */
  bundleSize: 300,
  /** First load JS budget (KB) */
  initialJs: 150,
} as const;

/* ─── Image Optimization ─── */

/**
 * Default image sizes for different contexts.
 * Aligns with Next.js Image component sizes prop.
 */
export const IMAGE_SIZES = {
  ogImage: { width: 1200, height: 630 },
  favicon: { width: 32, height: 32 },
  appleTouchIcon: { width: 180, height: 180 },
  avatar: { width: 64, height: 64 },
  thumbnail: { width: 300, height: 200 },
  banner: { width: 1920, height: 480 },
} as const;

/**
 * Supported image formats in priority order.
 */
export const IMAGE_FORMATS = ["image/avif", "image/webp", "image/png"] as const;
