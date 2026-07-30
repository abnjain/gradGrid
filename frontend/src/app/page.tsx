import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  JsonLd,
  BreadcrumbJsonLd,
  FaqSection,
  EntityBadge,
} from "@/components/seo";
import {
  organizationSchema,
  softwareApplicationSchema,
} from "@/lib/seo";
import {
  GraduationCap,
  Shield,
  ArrowRight,
  BookOpen,
  Users,
  DollarSign,
  ClipboardCheck,
  BarChart3,
  School,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cloud-Native Education ERP for Schools & Colleges | GradGrid",
  description:
    "GradGrid is a secure, scalable, multi-tenant Education ERP SaaS platform. Manage students, teachers, attendance, exams, fees, and communication — all from one platform.",
  openGraph: {
    title: "GradGrid — Cloud-Native Education ERP for Schools & Colleges",
    description:
      "Manage students, teachers, attendance, exams, fees, and communication — all from one secure, cloud-native platform.",
  },
  twitter: {
    title: "GradGrid — Cloud-Native Education ERP for Schools & Colleges",
    description:
      "Manage students, teachers, attendance, exams, fees, and communication — all from one secure, cloud-native platform.",
  },
  keywords: [
    "Education ERP",
    "School Management System",
    "College ERP",
    "Student Management",
    "Attendance System",
    "Fee Management",
    "Multi-Tenant SaaS",
    "Educational Platform",
    "GradGrid",
  ].join(", "),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-fog">
      {/* Structured data */}
      <JsonLd schema={organizationSchema()} id="landing-organization" />
      <JsonLd schema={softwareApplicationSchema()} id="landing-software" />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "/" }]} />

      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold font-display">G</span>
            </div>
            <span className="font-display font-bold text-[15px] text-ink tracking-tight">GradGrid</span>
          </div>
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-dim border border-brand-mid rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-brand" />
          <span className="text-xs font-semibold text-brand-text">Education ERP Platform</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-display text-ink leading-tight max-w-3xl mx-auto mb-4">
          The operating system for<br />
          <span className="text-brand">educational institutions</span>
        </h1>
        <p className="text-lg text-mid max-w-xl mx-auto mb-10 leading-relaxed">
          Manage students, teachers, attendance, examinations, fees, and more — all from a single, secure, cloud-native platform.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/login">
            <Button size="lg">
              Go to Institution Portal
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/admin/dashboard">
            <Button variant="secondary" size="lg">
              <Shield className="w-4 h-4" />
              Platform Admin
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Student Management", icon: <Users className="w-5 h-5" /> },
            { label: "Attendance Tracking", icon: <ClipboardCheck className="w-5 h-5" /> },
            { label: "Examinations", icon: <BookOpen className="w-5 h-5" /> },
            { label: "Fee Management", icon: <DollarSign className="w-5 h-5" /> },
            { label: "Reports & Analytics", icon: <BarChart3 className="w-5 h-5" /> },
            { label: "Multi-Institution", icon: <School className="w-5 h-5" /> },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-surface border border-border rounded-xl p-4 flex flex-col items-center text-center gap-2.5 hover:shadow-sm transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-dim flex items-center justify-center text-brand">
                {f.icon}
              </div>
              <span className="text-xs font-semibold text-charcoal">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Portal cards */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-surface border border-border rounded-xl p-8 hover:border-brand-mid hover:shadow-sm transition-all">
            <div className="w-12 h-12 rounded-xl bg-brand-dim flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6 text-brand" />
            </div>
            <h2 className="text-lg font-bold font-display text-ink mb-2">Institution Portal</h2>
            <p className="text-sm text-mid leading-relaxed mb-5">
              Manage day-to-day operations — admissions, attendance, exams, fees, staff, and more.
            </p>
            <Link href="/login">
              <Button variant="secondary" className="w-full justify-center">
                Open Institution Portal
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="bg-surface border border-border rounded-xl p-8 hover:border-accent-mid hover:shadow-sm transition-all">
            <div className="w-12 h-12 rounded-xl bg-accent-dim flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <h2 className="text-lg font-bold font-display text-ink mb-2">Platform Admin Portal</h2>
            <p className="text-sm text-mid leading-relaxed mb-5">
              Oversee organizations, institutions, platform users, system configuration, and audit logs.
            </p>
            <Link href="/admin/dashboard">
              <Button variant="secondary" className="w-full justify-center">
                Open Admin Portal
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section — AEO optimized */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <FaqSection
          title="Frequently Asked Questions"
          items={[
            {
              question: "What is GradGrid?",
              answer:
                "GradGrid is a cloud-native, multi-tenant Education ERP SaaS platform designed for schools, colleges, universities, coaching institutes, and educational organizations. It provides a unified system to manage students, teachers, attendance, examinations, fees, communication, and administrative operations from a single dashboard.",
            },
            {
              question: "How does GradGrid help schools manage attendance?",
              answer:
                "GradGrid simplifies attendance tracking with class-wise and student-wise daily marking, automatic register generation, teacher attendance management, and comprehensive attendance reports. Teachers can mark attendance quickly, and administrators get real-time visibility into attendance rates across classes and sessions.",
            },
            {
              question: "What features does GradGrid offer for fee management?",
              answer:
                "GradGrid provides end-to-end fee management including fee structure configuration with installments, scholarships and discounts, payment recording, receipt generation, fee reports, and outstanding tracking. The system supports multiple fee types and provides a clear collection summary for accountants and owners.",
            },
            {
              question: "Is GradGrid suitable for multi-campus institutions?",
              answer:
                "Yes. GradGrid is built from the ground up as a multi-tenant platform. It supports organizations managing multiple institutions under a single account, with complete data isolation per institution. Each institution can have its own branding, academic sessions, and user roles while the parent organization retains centralized oversight.",
            },
            {
              question: "How does GradGrid ensure data security?",
              answer:
                "Security is a foundational principle of GradGrid. The platform follows Zero Trust architecture, encrypts sensitive fields (Aadhaar, PAN) with AES-256-GCM at the application layer, enforces least-privilege authorization, maintains complete audit logs for all privileged operations, and uses httpOnly refresh tokens with rotation for session management.",
            },
          ]}
        />
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-mid">
          <span>&copy; {new Date().getFullYear()} GradGrid. All rights reserved.</span>
          <span>Cloud-Native Education ERP</span>
        </div>
      </footer>
    </div>
  );
}
