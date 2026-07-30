import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found | GradGrid",
  description:
    "The page you are looking for does not exist or has been moved.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-fog flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <h1 className="text-6xl font-bold font-display text-brand mb-4">
          404
        </h1>
        <h2 className="text-xl font-bold font-display text-ink mb-2">
          Page Not Found
        </h2>
        <p className="text-sm text-mid leading-relaxed mb-8">
          The page you are looking for does not exist or has been moved.
          Please check the URL or navigate back to the home page.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-hover transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
