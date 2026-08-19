/**
 * GradGrid — Robots.txt Route
 *
 * Next.js App Router convention: /robots.ts → generates /robots.txt
 * Uses the centralized SEO library for consistent rules.
 */

import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gradgrid.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/platform/", "/app/", "/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
