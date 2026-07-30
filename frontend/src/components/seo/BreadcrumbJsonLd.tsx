/**
 * GradGrid — BreadcrumbJsonLd Component
 *
 * Server component that renders BreadcrumbList JSON-LD.
 * Used on every public-facing page for navigation context.
 */

import React from "react";
import { breadcrumbSchema, type BreadcrumbItem } from "@/lib/seo";
import { JsonLd } from "./JsonLd";

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const schema = breadcrumbSchema(items);
  return <JsonLd schema={schema} id="breadcrumb-schema" />;
}
