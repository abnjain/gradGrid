/**
 * GradGrid — JsonLd Component
 *
 * Renders a JSON-LD script tag from any schema object.
 * Server Component — no client interactivity needed.
 */

import React from "react";
import { renderJsonLd } from "@/lib/seo";

interface JsonLdProps {
  schema: Record<string, unknown>;
  id?: string;
}

export function JsonLd({ schema, id }: JsonLdProps) {
  const json = renderJsonLd(schema);
  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
