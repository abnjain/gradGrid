/**
 * GradGrid — ContentStructure Component
 *
 * Wrapper component that enforces GEO-friendly content structure:
 * - Clear hierarchical headings
 * - Short paragraphs for scannability
 * - Semantic HTML5 elements (<article>, <section>, <aside>)
 * - Proper ARIA labels
 *
 * Use this as a layout wrapper for any page or section
 * that needs to be optimized for AI crawler parsing.
 */

import React from "react";

interface ContentStructureProps {
  /** The content type — affects the wrapper element used */
  as?: "article" | "section" | "main";
  /** Heading level for the title (1-6). Default: 1 for main, 2 for sections */
  headingLevel?: 1 | 2 | 3;
  /** Page or section title */
  title?: string;
  /** Optional description/subtitle */
  description?: string;
  /** Content children */
  children: React.ReactNode;
  /** Extra class names */
  className?: string;
  /** ARIA label for accessibility */
  ariaLabel?: string;
  /** Schema.org itemType for rich results */
  itemType?: string;
}

const HEADING_TAGS = {
  1: "h1",
  2: "h2",
  3: "h3",
} as const;

export function ContentStructure({
  as: Tag = "section",
  headingLevel = 2,
  title,
  description,
  children,
  className = "",
  ariaLabel,
  itemType,
}: ContentStructureProps) {
  const HeadingTag = HEADING_TAGS[headingLevel];

  const attrs: Record<string, string | undefined> = {};
  if (ariaLabel) attrs["aria-label"] = ariaLabel;
  if (itemType) {
    attrs.itemScope = "itemScope";
    attrs.itemType = itemType;
  }

  return (
    <Tag className={className} {...attrs}>
      {title && (
        <header className="mb-4">
          <HeadingTag className="text-xl font-bold font-display text-ink">
            {title}
          </HeadingTag>
          {description && (
            <p className="text-sm text-mid mt-1">{description}</p>
          )}
        </header>
      )}
      <div className="space-y-3 [&_p]:max-w-prose [&_p]:leading-relaxed [&_p]:text-sm [&_p]:text-charcoal">
        {children}
      </div>
    </Tag>
  );
}
