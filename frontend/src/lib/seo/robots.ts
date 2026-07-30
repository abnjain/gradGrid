/**
 * GradGrid — Robots.txt Generator
 *
 * Produces the robots.txt content based on environment and config.
 * The Next.js /robots.ts route consumes this.
 */

import { siteConfig } from "./config";

export interface RobotsOptions {
  disallowAdmin?: boolean;
  disallowApp?: boolean;
  extraDisallow?: string[];
  extraAllow?: string[];
  crawlDelay?: number;
}

/**
 * Generate robots.txt content.
 *
 * By default:
 * - Allow all crawlers on public pages
 * - Disallow /admin/ (platform admin portal)
 * - Disallow /app/ (institution portal)
 * - Reference the sitemap
 */
export function generateRobotsTxt(
  baseUrl: string,
  options: RobotsOptions = {}
): string {
  const {
    disallowAdmin = true,
    disallowApp = true,
    extraDisallow = [],
    extraAllow = [],
    crawlDelay,
  } = options;

  const lines: string[] = [];

  // Default rule for all crawlers
  lines.push("User-agent: *");

  // Allow specific paths that should be crawled
  if (extraAllow.length > 0) {
    for (const path of extraAllow) {
      lines.push(`Allow: ${path}`);
    }
  }

  // Disallow authenticated / private sections
  if (disallowAdmin) {
    lines.push("Disallow: /admin/");
  }
  if (disallowApp) {
    lines.push("Disallow: /app/");
  }

  // Extra disallow paths
  for (const path of extraDisallow) {
    lines.push(`Disallow: ${path}`);
  }

  // Crawl delay (if specified)
  if (crawlDelay !== undefined) {
    lines.push(`Crawl-delay: ${crawlDelay}`);
  }

  // Sitemap reference
  const normalizedBase = baseUrl.replace(/\/$/, "");
  lines.push(`Sitemap: ${normalizedBase}/sitemap.xml`);

  lines.push(""); // trailing newline
  return lines.join("\n");
}

/**
 * Default robots.txt for production.
 */
export function defaultRobotsTxt(): string {
  return generateRobotsTxt(siteConfig.baseUrl, {
    disallowAdmin: true,
    disallowApp: true,
    extraDisallow: ["/api/"],
    extraAllow: [],
  });
}
