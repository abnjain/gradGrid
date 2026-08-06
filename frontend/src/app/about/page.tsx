import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { StaticShell } from "@/components/shared/static-shell";
import { buildPageMetadata, siteConfig } from "@/lib/seo";
import {
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export const metadata: Metadata = buildPageMetadata({
  title: "About Us",
  description:
    "Learn about GradGrid — the all-in-one education platform built for schools, colleges, and educational organizations to run smoothly and focus on what matters most: education.",
  path: "/about",
});

const values = [
  {
    title: "Put Students First",
    description:
      "Every feature starts with a simple question: does this help students and the people who support them? If the answer isn't yes, we don't build it.",
    icon: GraduationCap,
  },
  {
    title: "Simple by Design",
    description:
      "Institutions shouldn't need an IT department to run their day-to-day. We keep things intuitive, so your team can focus on teaching, not troubleshooting software.",
    icon: Lightbulb,
  },
  {
    title: "Security You Can Trust",
    description:
      "Your data is protected with strong encryption, role-based access, and a complete record of every action. We treat your institution's information as our own.",
    icon: ShieldCheck,
  },
  {
    title: "Built to Grow With You",
    description:
      "From a single classroom to a multi-campus group, the platform grows with you — no painful migrations, no surprise limits.",
    icon: Users,
  },
  {
    title: "Support That Cares",
    description:
      "Real people who understand education, ready to help when you need it. We're with you every step of the way.",
    icon: HeartHandshake,
  },
  {
    title: "Always Improving",
    description:
      "We listen to institutions every day and ship improvements continuously, so the platform gets better even while you sleep.",
    icon: Sparkles,
  },
];

export default function AboutPage() {
  const { contact } = siteConfig;

  return (
    <StaticShell
      eyebrow="About GradGrid"
      title="Built for education, designed around people"
      subtitle="GradGrid is an all-in-one platform that brings student management, attendance, examinations, fees, and communication together — so institutions can run smoothly and focus on what matters most."
    >
      {/* ─── Our story ─── */}
      <div className="space-y-6">
        <div className="bg-surface border border-border rounded-2xl p-8">
          <h2 className="text-2xl font-bold font-display text-ink mb-4">Our Story</h2>
          <div className="space-y-4 text-mid leading-relaxed text-base">
            <p>
              GradGrid began with a simple observation: schools and colleges were still running
              their most important work on scattered spreadsheets, paper registers, and half-connected
              tools. Teachers spent hours on attendance and reports. Accountants juggled fee records.
              Administrators pieced together answers from five different places.
            </p>
            <p>
              We believed education deserved better. So we set out to build one simple, secure
              platform that brings everything together — not a generic business tool with education
              bolted on, but software designed from the ground up around how institutions actually work.
            </p>
            <p>
              Today, {siteConfig.name} serves schools, colleges, universities, coaching institutes,
              and educational trusts, helping them manage students, staff, attendance, examinations,
              and fees from a single dashboard.
            </p>
          </div>
        </div>

        {/* ─── Mission ─── */}
        <div className="bg-gradient-to-br from-brand to-brand-active rounded-2xl p-8 md:p-10 text-white">
          <h2 className="text-xl font-bold font-display mb-3">Our Mission</h2>
          <p className="text-white/90 leading-relaxed">
            To give every educational institution a simple, secure platform that removes the
            administrative burden — so teachers can teach, students can learn, and institutions
            can grow with confidence.
          </p>
        </div>

        {/* ─── Values ─── */}
        <div>
          <h2 className="text-2xl font-bold font-display text-ink mb-6 text-center">What We Stand For</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-surface border border-border rounded-xl p-6 hover:border-brand-mid hover:shadow-sm transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-dim flex items-center justify-center mb-4 text-brand">
                  <v.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold font-display text-ink mb-2">{v.title}</h3>
                <p className="text-sm text-mid leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── CTA ─── */}
        <div className="bg-fog border border-border rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold font-display text-ink mb-2">Let&rsquo;s talk</h2>
          <p className="text-sm text-mid mb-5">
            Have questions about {siteConfig.name}? We&rsquo;d love to hear from you.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors no-underline hover:no-underline"
            >
              Contact Us
            </Link>
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-surface border border-border-strong text-charcoal text-sm font-medium hover:bg-surface-raised transition-colors no-underline hover:no-underline"
            >
              {contact.email}
            </a>
          </div>
        </div>
      </div>
    </StaticShell>
  );
}
