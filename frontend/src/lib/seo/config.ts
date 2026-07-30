/**
 * GradGrid — SEO Configuration
 *
 * Central source of truth for all SEO-related constants.
 * Every SEO module reads from this config — never hardcode values.
 */

import type { Metadata } from "next";

export interface SiteConfig {
  name: string;
  tagline: string;
  url: string;
  baseUrl: string;
  locale: string;
  ogImage: string;
  ogImageAlt: string;
  twitterHandle: string;
  twitterCreator: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  verification: {
    google?: string;
  };
}

export const siteConfig: SiteConfig = {
  name: "GradGrid",
  tagline: "Cloud-Native Education ERP",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://gradgrid.com",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://gradgrid.com",
  locale: "en_IN",
  ogImage: "/og-image.png",
  ogImageAlt: "GradGrid — Cloud-Native Multi-Tenant Education ERP SaaS Platform",
  twitterHandle: "@gradgrid",
  twitterCreator: "@gradgrid",
  defaultTitle: "GradGrid — Cloud-Native Education ERP",
  titleTemplate: "%s | GradGrid",
  defaultDescription:
    "A secure, scalable, cloud-native multi-tenant Education ERP SaaS platform for schools, colleges, universities, and educational organizations. Manage students, attendance, examinations, fees, and more.",
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || "",
  },
};

/**
 * Default metadata base — shared across all pages.
 * Each page overrides title, description, and optionally robots/canonical.
 */
export function getDefaultMetadata(): Metadata {
  return {
    metadataBase: new URL(siteConfig.baseUrl),
    title: {
      default: siteConfig.defaultTitle,
      template: siteConfig.titleTemplate,
    },
    description: siteConfig.defaultDescription,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title: siteConfig.defaultTitle,
      description: siteConfig.defaultDescription,
      url: siteConfig.baseUrl,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterCreator,
      title: siteConfig.defaultTitle,
      description: siteConfig.defaultDescription,
      images: [siteConfig.ogImage],
    },
    alternates: {
      canonical: siteConfig.baseUrl,
    },
    ...(siteConfig.verification.google
      ? { verification: { google: siteConfig.verification.google } }
      : {}),
  };
}
