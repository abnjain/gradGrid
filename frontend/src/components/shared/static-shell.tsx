/**
 * GradGrid — StaticShell Component
 *
 * Shared layout for public static pages (About, Contact, Terms, Privacy).
 * Provides a consistent header, page hero, and content container.
 */

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SiteFooter } from "@/components/shared/site-footer";
import { ArrowLeft } from "lucide-react";

interface StaticShellProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function StaticShell({ eyebrow, title, subtitle, children }: StaticShellProps) {
  return (
    <div className="min-h-screen bg-fog">
      {/* ─── Header ─── */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline hover:no-underline">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold font-display">G</span>
            </div>
            <span className="font-display font-bold text-[15px] text-ink tracking-tight">GradGrid</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-mid hover:text-ink transition-colors duration-200 no-underline hover:no-underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 text-center">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 bg-brand-dim border border-brand-mid rounded-full px-4 py-1.5 mb-5">
              <span className="w-2 h-2 rounded-full bg-brand" />
              <span className="text-xs font-semibold text-brand-text">{eyebrow}</span>
            </div>
          )}
          <h1 className="text-3xl md:text-5xl font-bold font-display text-ink leading-tight max-w-3xl mx-auto">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base md:text-lg text-mid max-w-2xl mx-auto mt-4 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </section>

      {/* ─── Content ─── */}
      <section className="max-w-3xl mx-auto px-6 py-16">{children}</section>

      {/* ─── Footer ─── */}
      <SiteFooter />
    </div>
  );
}
