/**
 * GradGrid — EntityBadge Component
 *
 * Visual and semantic component that marks entity mentions with
 * machine-readable microdata attributes. Helps AI crawlers and
 * search engines identify key entities in content.
 *
 * Renders a styled badge with embedded Schema.org itemProp attributes.
 */

import React from "react";

interface EntityBadgeProps {
  /** The entity name displayed to users */
  name: string;
  /** Schema.org itemProp type (e.g., "name", "applicationCategory", "feature") */
  itemProp?: string;
  /** Schema.org itemScope type URL (e.g., "https://schema.org/SoftwareApplication") */
  itemType?: string;
  /** Optional URL for sameAs / deep link */
  href?: string;
  /** Visual variant */
  variant?: "default" | "subtle" | "accent";
  /** Extra class names */
  className?: string;
}

export function EntityBadge({
  name,
  itemProp,
  itemType,
  href,
  variant = "default",
  className = "",
}: EntityBadgeProps) {
  const baseClass =
    variant === "accent"
      ? "inline-flex items-center px-2 py-0.5 rounded-md bg-accent-dim text-accent-text text-xs font-semibold"
      : variant === "subtle"
        ? "inline-flex items-center px-2 py-0.5 rounded-md bg-fog text-charcoal text-xs font-semibold"
        : "inline-flex items-center px-2 py-0.5 rounded-md bg-brand-dim text-brand-text text-xs font-semibold";

  const attrs: Record<string, string | undefined> = {};
  if (itemProp) attrs.itemProp = itemProp;
  if (itemType) attrs.itemType = itemType;
  if (itemType) attrs.itemScope = "itemScope";

  const content = (
    <span className={`${baseClass} ${className}`} {...attrs}>
      {name}
    </span>
  );

  if (href) {
    return (
      <a href={href} className="no-underline">
        {content}
      </a>
    );
  }

  return content;
}
