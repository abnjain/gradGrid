"use client";

/**
 * GradGrid — SeoHead Component
 *
 * Client-side escape hatch for dynamic meta updates.
 * Only use when SSR metadata is insufficient (e.g., live preview in editors).
 * In most cases, prefer the server-side metadata export.
 *
 * Updates document.title and meta tags dynamically.
 */

import React, { useEffect } from "react";

interface SeoHeadProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
  canonical?: string;
}

export function SeoHead({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  noIndex,
  canonical,
}: SeoHeadProps) {
  useEffect(() => {
    const updates: Array<{
      selector: string;
      attribute?: string;
      value: string;
    }> = [];

    if (title) {
      document.title = title;
      updates.push({
        selector: 'meta[property="og:title"]',
        attribute: "content",
        value: title,
      });
      updates.push({
        selector: 'meta[name="twitter:title"]',
        attribute: "content",
        value: title,
      });
    }

    if (description) {
      updates.push({
        selector: 'meta[name="description"]',
        attribute: "content",
        value: description,
      });
      updates.push({
        selector: 'meta[property="og:description"]',
        attribute: "content",
        value: ogDescription ?? description,
      });
      updates.push({
        selector: 'meta[name="twitter:description"]',
        attribute: "content",
        value: ogDescription ?? description,
      });
    }

    if (ogTitle) {
      updates.push({
        selector: 'meta[property="og:title"]',
        attribute: "content",
        value: ogTitle,
      });
    }

    if (ogImage) {
      updates.push({
        selector: 'meta[property="og:image"]',
        attribute: "content",
        value: ogImage,
      });
      updates.push({
        selector: 'meta[name="twitter:image"]',
        attribute: "content",
        value: ogImage,
      });
    }

    if (noIndex !== undefined) {
      const value = noIndex ? "noindex, nofollow" : "index, follow";
      updates.push({
        selector: 'meta[name="robots"]',
        attribute: "content",
        value,
      });
    }

    if (canonical) {
      updates.push({
        selector: 'link[rel="canonical"]',
        attribute: "href",
        value: canonical,
      });
    }

    for (const { selector, attribute, value } of updates) {
      const el = document.querySelector(selector);
      if (el && attribute) {
        el.setAttribute(attribute, value);
      }
    }
  }, [title, description, ogTitle, ogDescription, ogImage, noIndex, canonical]);

  return null;
}
