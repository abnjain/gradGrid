import type { Metadata } from "next";
import React from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Portal | GradGrid",
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-fog">
      <header className="border-b border-border bg-surface px-4 py-3 flex items-center justify-between">
        <Link href="/portal/home" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold font-display">G</span>
          </div>
          <span className="font-display font-bold text-ink">GradGrid Portal</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/portal/home" className="text-mid hover:text-ink no-underline">
            Home
          </Link>
          <Link href="/portal/id-card" className="text-mid hover:text-ink no-underline">
            ID card
          </Link>
          <Link href="/portal/children" className="text-mid hover:text-ink no-underline">
            Children
          </Link>
        </nav>
      </header>
      <main className="max-w-3xl mx-auto p-4 lg:p-6">{children}</main>
    </div>
  );
}
