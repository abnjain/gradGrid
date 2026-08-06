/**
 * GradGrid — SiteFooter Component
 *
 * Shared footer used on the landing page and all public static pages.
 * Reads branding from the single siteConfig source of truth.
 */

import React from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/seo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-mid">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-brand rounded flex items-center justify-center">
            <span className="text-white text-[10px] font-bold font-display">G</span>
          </div>
          <span>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </span>
        </div>
        <nav className="flex items-center gap-5" aria-label="Footer">
          <Link href="/about" className="text-mid hover:text-ink transition-colors duration-200 no-underline hover:no-underline">About</Link>
          <Link href="/contact" className="text-mid hover:text-ink transition-colors duration-200 no-underline hover:no-underline">Contact</Link>
          <Link href="/terms" className="text-mid hover:text-ink transition-colors duration-200 no-underline hover:no-underline">Terms</Link>
          <Link href="/privacy" className="text-mid hover:text-ink transition-colors duration-200 no-underline hover:no-underline">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}
