import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/**
 * Shared layout for Settings sub-pages.
 * Renders a "back to Settings" link, a title + description header,
 * and the page content in a consistent, readable column.
 */
export function SettingsPageLayout({
  title,
  description,
  children,
  backHref = "/app/settings",
  backLabel = "Settings",
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  /** Optional — override the back link destination. */
  backHref?: string;
  /** Optional — override the back link label. */
  backLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Back link + header */}
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-mid hover:text-charcoal transition-colors no-underline"
        >
          <ChevronLeft className="w-4 h-4" />
          {backLabel}
        </Link>
        <h1 className="text-xl font-bold font-display text-ink mt-2">{title}</h1>
        <p className="text-sm text-mid mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}
