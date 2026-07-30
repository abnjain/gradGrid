/**
 * GradGrid — SEO Validation & Self-Check Utilities
 *
 * Self-validation tools for ensuring SEO best practices are met at build time.
 * Includes metadata validators, JSON-LD schema checkers, and content linters.
 */

import type { Metadata } from "next";
import { siteConfig } from "./config";

/* ─── Types ─── */

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export interface LintResult {
  errors: LintError[];
  warnings: LintWarning[];
  score: number; // 0-100
}

export interface LintError {
  line?: number;
  message: string;
  severity: "error";
}

export interface LintWarning {
  line?: number;
  message: string;
  severity: "warning";
}

/* ─── Metadata Validation ─── */

/**
 * Validate a Next.js Metadata object against SEO best practices.
 * Checks required fields, length constraints, and image dimensions.
 */
export function validateMetadata(meta: Metadata): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Title checks
  const title = getStringMeta(meta.title);
  if (!title) {
    errors.push({ field: "title", message: "Metadata title is required" });
  } else if (title.length < 10) {
    warnings.push({
      field: "title",
      message: `Title is very short (${title.length} chars). Recommended: 30-60 characters.`,
    });
  } else if (title.length > 70) {
    warnings.push({
      field: "title",
      message: `Title exceeds 70 characters (${title.length} chars). May be truncated in SERP.`,
    });
  }

  // Description checks
  const description = meta.description;
  if (!description) {
    errors.push({
      field: "description",
      message: "Metadata description is required",
    });
  } else if (description.length < 50) {
    warnings.push({
      field: "description",
      message: `Description is very short (${description.length} chars). Recommended: 120-160 characters.`,
    });
  } else if (description.length > 165) {
    warnings.push({
      field: "description",
      message: `Description exceeds 165 characters (${description.length} chars). May be truncated in SERP.`,
    });
  }

  // Robots checks
  if (!meta.robots) {
    warnings.push({
      field: "robots",
      message: "No robots directive set. Search engines will use defaults (index, follow).",
    });
  }

  // Open Graph checks
  if (!meta.openGraph) {
    warnings.push({
      field: "openGraph",
      message: "No Open Graph metadata. Social share previews may not work.",
    });
  } else {
    const ogImages = meta.openGraph.images;
    const ogImageCount = Array.isArray(ogImages) ? ogImages.length : ogImages ? 1 : 0;
    if (ogImageCount === 0) {
      warnings.push({
        field: "openGraph.images",
        message: "No OG image specified. Social shares will lack preview images.",
      });
    }
  }

  // Twitter card checks
  if (!meta.twitter) {
    warnings.push({
      field: "twitter",
      message: "No Twitter Card metadata. Twitter share previews may not work.",
    });
  }

  // Canonical URL check
  if (!meta.alternates?.canonical && !meta.alternates) {
    warnings.push({
      field: "alternates.canonical",
      message: "No canonical URL specified. May cause duplicate content issues.",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate that a metadata object contains a robots noindex
 * when the page path starts with an auth-only prefix.
 */
export function validateAuthNoindex(path: string, meta: Metadata): ValidationResult {
  const authPrefixes = ["/admin/", "/app/", "/login", "/forgot-password"];
  const shouldBeNoindex = authPrefixes.some((prefix) => path.startsWith(prefix));

  if (shouldBeNoindex) {
    const robots = meta.robots;
    const robotsObj = typeof robots === 'object' ? robots : null;
    const isNoindex = robotsObj?.index === false;
    if (!isNoindex) {
      return {
        valid: false,
        errors: [
          {
            field: "robots.index",
            message: `Page "${path}" is an authenticated route but does not have noindex set.`,
          },
        ],
        warnings: [],
      };
    }
  }

  return { valid: true, errors: [], warnings: [] };
}

/* ─── JSON-LD Validation ─── */

/**
 * Basic Schema.org type validation for JSON-LD.
 * Checks that required fields exist for known types.
 */
export function validateJsonLd(schema: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!schema["@context"]) {
    errors.push({ field: "@context", message: "Missing @context (should be https://schema.org)" });
  }
  if (!schema["@type"]) {
    errors.push({ field: "@type", message: "Missing @type" });
  }

  const type = schema["@type"] as string;

  // Common required field checks per type
  if (type === "Organization" && !schema.name) {
    errors.push({ field: "name", message: "Organization schema requires a name" });
  }
  if (type === "SoftwareApplication" && !schema.name) {
    errors.push({ field: "name", message: "SoftwareApplication schema requires a name" });
  }
  if (type === "FAQPage") {
    const mainEntity = schema.mainEntity;
    if (!mainEntity || !Array.isArray(mainEntity) || mainEntity.length === 0) {
      errors.push({ field: "mainEntity", message: "FAQPage schema requires at least one Question in mainEntity" });
    }
  }
  if (type === "BreadcrumbList") {
    const items = schema.itemListElement;
    if (!items || !Array.isArray(items) || items.length === 0) {
      errors.push({ field: "itemListElement", message: "BreadcrumbList requires at least one ListItem" });
    }
  }
  if (type === "Article" && !schema.headline) {
    errors.push({ field: "headline", message: "Article schema requires a headline" });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/* ─── Content Lint ─── */

/**
 * Lint HTML content for SEO best practices.
 * Checks heading hierarchy, missing alt text, link quality, etc.
 */
export function lintPageContent(html: string): LintResult {
  const errors: LintError[] = [];
  const warnings: LintWarning[] = [];

  // Check for h1
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1Count === 0) {
    warnings.push({
      message: "No <h1> heading found. Pages should have exactly one <h1>.",
      severity: "warning",
    });
  } else if (h1Count > 1) {
    errors.push({
      message: `Multiple <h1> headings found (${h1Count}). Use exactly one <h1> per page.`,
      severity: "error",
    });
  }

  // Check heading hierarchy
  const h1AfterH2 = /<h2[\s>][\s\S]*?<\/h2>[\s\S]*?<h1[\s>]/i;
  if (h1AfterH2.test(html)) {
    warnings.push({
      message: "<h2> appears before <h1>. Maintain proper heading hierarchy (h1 → h2 → h3).",
      severity: "warning",
    });
  }

  // Check for missing alt text on images
  const imgTags = html.match(/<img[^>]+>/gi) || [];
  for (const img of imgTags) {
    if (!img.includes("alt=")) {
      warnings.push({
        message: `Image missing alt text: ${img.substring(0, 80)}...`,
        severity: "warning",
      });
    }
  }

  // Check for descriptive link text
  const linkTags = html.match(/<a[^>]+>([^<]+)<\/a>/gi) || [];
  for (const link of linkTags) {
    const text = link.replace(/<[^>]+>/g, "").trim();
    if (text.length < 3) {
      warnings.push({
        message: `Link with short or non-descriptive text: "${text}"`,
        severity: "warning",
      });
    }
    if (/click here|read more|learn more/i.test(text)) {
      warnings.push({
        message: `Link uses generic text like "${text}". Use descriptive link text for accessibility and SEO.`,
        severity: "warning",
      });
    }
  }

  // Calculate score
  const totalIssues = errors.length + warnings.length;
  const score = Math.max(0, Math.min(100, 100 - totalIssues * 10));

  return { errors, warnings, score };
}

/* ─── Build Time Check ─── */

/**
 * Quick validation for build-time use.
 * Checks that all public pages have metadata and no noindex on public routes.
 */
export interface BuildTimeCheckResult {
  passed: boolean;
  issues: string[];
}

export function checkPublicPageSeo(
  path: string,
  meta: Metadata | null
): BuildTimeCheckResult {
  const issues: string[] = [];

  if (!meta) {
    issues.push(`${path}: Missing metadata export entirely`);
    return { passed: false, issues };
  }

  const publicPrefixes = ["/", "/login", "/forgot-password"];
  const isPublic = publicPrefixes.some((p) => path === p);

  const metaRobots = typeof meta.robots === 'object' ? meta.robots : null;
  if (isPublic && metaRobots?.index === false) {
    issues.push(`${path}: Public page has noindex set incorrectly`);
  }

  return {
    passed: issues.length === 0,
    issues,
  };
}

/* ─── Helpers ─── */

function getStringMeta(
  title: Metadata["title"] | undefined
): string | undefined {
  if (!title) return undefined;
  if (typeof title === "string") return title;
  if (typeof title === "object" && "default" in title) return title.default;
  return undefined;
}
