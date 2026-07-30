/**
 * GradGrid — Sitemap Generators
 *
 * Programmatic XML sitemap builders for static and dynamic content.
 * The Next.js /sitemap.ts route uses these to generate the final sitemap.
 */

/* ─── Types ─── */

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
}

export interface SitemapIndexEntry {
  loc: string;
  lastmod?: string;
}

/* ─── Static Route Definitions ─── */

/**
 * Static routes that are always available.
 * These are used by the Next.js /sitemap.ts to build the sitemap.
 */
export const STATIC_ROUTES: SitemapEntry[] = [
  {
    url: "/",
    lastmod: new Date().toISOString().split("T")[0],
    changefreq: "weekly",
    priority: 1.0,
  },
  {
    url: "/login",
    lastmod: new Date().toISOString().split("T")[0],
    changefreq: "monthly",
    priority: 0.3,
  },
  {
    url: "/forgot-password",
    lastmod: new Date().toISOString().split("T")[0],
    changefreq: "monthly",
    priority: 0.1,
  },
];

/* ─── Generators ─── */

/**
 * Generate a sitemap index XML (multiple sitemaps).
 */
export function generateSitemapIndex(
  baseUrl: string,
  entries: SitemapIndexEntry[]
): string {
  const sitemaps = entries
    .map(
      (entry) => `  <sitemap>
    <loc>${escapeXml(entry.loc)}</loc>
    ${entry.lastmod ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : ""}
  </sitemap>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>`;
}

/**
 * Generate a static sitemap XML from an array of entries.
 */
export function generateStaticSitemap(
  baseUrl: string,
  entries: SitemapEntry[]
): string {
  const urls = entries
    .map((entry) => {
      const fullUrl = `${baseUrl.replace(/\/$/, "")}${entry.url}`;
      return `  <url>
    <loc>${escapeXml(fullUrl)}</loc>
    ${entry.lastmod ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : ""}
    ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ""}
    ${entry.priority !== undefined ? `<priority>${entry.priority.toFixed(1)}</priority>` : ""}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/**
 * Generate a dynamic sitemap XML (for backend-generated content).
 * Same structure as static, used for institution profiles, blog, etc.
 */
export function generateDynamicSitemap(
  baseUrl: string,
  entries: SitemapEntry[]
): string {
  return generateStaticSitemap(baseUrl, entries);
}

/* ─── Helpers ─── */

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
