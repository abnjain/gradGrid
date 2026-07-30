/**
 * GradGrid — Sitemap Route
 *
 * Next.js App Router convention: /sitemap.ts → generates /sitemap.xml
 * Returns a sitemap of all static public routes.
 * Dynamic content (institution profiles, blog) is delegated to the backend.
 */

import type { MetadataRoute } from "next";
import { STATIC_ROUTES } from "@/lib/seo";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gradgrid.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.url}`,
    lastModified: route.lastmod ? new Date(route.lastmod) : new Date(),
    changeFrequency: route.changefreq ?? "monthly",
    priority: route.priority ?? 0.5,
  }));
}
