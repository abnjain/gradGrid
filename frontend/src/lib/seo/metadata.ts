/**
 * GradGrid — Metadata Builders
 *
 * Typed helpers that produce Next.js Metadata objects.
 * Every page calls these instead of hand-rolling metadata.
 */

import type { Metadata } from "next";
import { siteConfig, getDefaultMetadata } from "./config";

/* ─── Types ─── */

export interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogImageAlt?: string;
  noIndex?: boolean;
  canonicalOverride?: string;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  openGraph?: Partial<Metadata["openGraph"]>;
  twitter?: Partial<Metadata["twitter"]>;
  alternates?: Metadata["alternates"];
  verification?: Metadata["verification"];
  robots?: Metadata["robots"];
}

export interface InstitutionPublic {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  establishedYear?: number;
  institutionType?: string;
  affiliation?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
}

/* ─── Builders ─── */

/**
 * Build a full Metadata object for a standard page.
 * All pages that should be indexed use this.
 */
export function buildPageMetadata(input: PageMetaInput): Metadata {
  const defaults = getDefaultMetadata();
  const url = `${siteConfig.baseUrl}${input.path}`;

  return {
    ...defaults,
    title: input.title,
    description: input.description,
    robots: input.noIndex
      ? { index: false, follow: false }
      : input.robots ?? defaults.robots,
    openGraph: {
      ...defaults.openGraph,
      title: `${input.title} | ${siteConfig.name}`,
      description: input.description,
      url,
      images: input.ogImage
        ? [
            {
              url: input.ogImage,
              width: 1200,
              height: 630,
              alt: input.ogImageAlt ?? siteConfig.ogImageAlt,
            },
          ]
        : defaults.openGraph?.images,
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
      ...(input.openGraph ?? {}),
    },
    twitter: {
      ...defaults.twitter,
      title: `${input.title} | ${siteConfig.name}`,
      description: input.description,
      images: input.ogImage ? [input.ogImage] : defaults.twitter?.images,
      ...(input.twitter ?? {}),
    },
    alternates: {
      canonical: input.canonicalOverride ?? url,
      ...(input.alternates ?? {}),
    },
    keywords: input.keywords?.join(", "),
    ...(input.verification ?? {}),
  };
}

/**
 * Build metadata for a public institution profile page.
 * Ready for Phase 6 Website module — pre-built for future use.
 */
export function buildInstitutionMetadata(
  institution: InstitutionPublic
): Metadata {
  const title = institution.name;
  const description =
    institution.description ??
    `${institution.name} — ${institution.institutionType ?? "Educational Institution"} in ${institution.city ?? ""}, ${institution.state ?? ""}. Managed via GradGrid.`;
  const path = `/institution/${institution.id}`;

  return buildPageMetadata({
    title,
    description,
    path,
    ogImage: institution.logoUrl ?? undefined,
    ogImageAlt: `${institution.name} logo`,
    openGraph: {
      locale: siteConfig.locale,
      siteName: institution.name,
    },
  });
}

/**
 * Build metadata for blog / documentation articles.
 */
export function buildArticleMetadata(
  input: PageMetaInput & {
    author?: string;
    category?: string;
  }
): Metadata {
  const meta = buildPageMetadata(input);
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      ...(input.author ? { authors: [input.author] } : {}),
      ...(input.category ? { tags: [input.category] } : {}),
    },
  };
}
