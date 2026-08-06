import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  JsonLd,
  BreadcrumbJsonLd,
  FaqSection,
} from "@/components/seo";
import { organizationSchema, softwareApplicationSchema } from "@/lib/seo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SiteFooter } from "@/components/shared/site-footer";
import {
  ArrowRight,
  Shield,
  Users,
  ClipboardCheck,
  BookOpen,
  DollarSign,
  BarChart3,
  School,
  Building2,
  GraduationCap,
  Lock,
  Gauge,
  Puzzle,
  Expand,
  HeartHandshake,
  Eye,
  Server,
  Layers,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "GradGrid — Cloud-Native Education ERP for Schools & Colleges",
  description:
    "GradGrid is a secure, scalable, multi-tenant Education ERP SaaS platform purpose-built for schools, colleges, universities, and educational organizations. Manage operations, students, staff, and growth — all from one platform.",
  openGraph: {
    title: "GradGrid — The Operating System for Educational Institutions",
    description:
      "A cloud-native, multi-tenant Education ERP built for schools, colleges, universities, and educational trusts. Secure, scalable, and modular by design.",
  },
  twitter: {
    title: "GradGrid — The Operating System for Educational Institutions",
    description:
      "A cloud-native, multi-tenant Education ERP built for schools, colleges, universities, and educational trusts. Secure, scalable, and modular by design.",
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
    "Cloud-Native ERP",
  ].join(", "),
};

const principles = [
  {
    title: "Security You Can Rely On",
    description:
      "Your data is protected with strong encryption, and only the people you choose can access it. Every important action is recorded, so you always have a clear, trustworthy record.",
    icon: Lock,
  },
  {
    title: "Grows With You",
    description:
      "From a single classroom to a multi-campus group, GradGrid handles more students, more staff, and more locations — without missing a beat.",
    icon: Gauge,
  },
  {
    title: "Everything in One Place",
    description:
      "Admissions, attendance, exams, and fees all live together in one simple platform — no more juggling separate tools or drowning in paperwork.",
    icon: Puzzle,
  },
  {
    title: "Ready for What's Next",
    description:
      "As your institution evolves, GradGrid grows with you. New needs and new features fit right in, without ever disrupting your day-to-day work.",
    icon: Expand,
  },
  {
    title: "Always There When You Need It",
    description:
      "Institutions rely on GradGrid every single day, so we build for stability and uptime. Your operations keep running — no interruptions, no surprises.",
    icon: HeartHandshake,
  },
  {
    title: "Clear and Accountable",
    description:
      "Every action on the platform is tracked and easy to review, so you always know what happened and who did it. Accountability is built in, not bolted on.",
    icon: Eye,
  },
];

const capabilities = [
  { label: "Student Management", icon: Users, description: "Keep every student's records and journey organized — from their first day to graduation and beyond." },
  { label: "Attendance Tracking", icon: ClipboardCheck, description: "Mark attendance in a few clicks, with automatic registers and instant reports for every class." },
  { label: "Examinations", icon: BookOpen, description: "Plan exams, publish results, and share grade cards — all in one straightforward place." },
  { label: "Fee Management", icon: DollarSign, description: "Set up fees, track installments and scholarships, generate receipts, and see what's collected at a glance." },
  { label: "Reports & Analytics", icon: BarChart3, description: "Clear dashboards and easy-to-export reports give you a simple view of everything at your institution." },
  { label: "Multi-Institution", icon: School, description: "Manage one school or many campuses from a single account, with each institution kept neatly separate." },
];

const audiences = [
  { label: "Schools", icon: Building2 },
  { label: "Colleges", icon: GraduationCap },
  { label: "Universities", icon: Building2 },
  { label: "Coaching Institutes", icon: BookOpen },
  { label: "Training Centers", icon: Users },
  { label: "Educational Trusts", icon: Shield },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-fog">
      {/* Structured data */}
      <JsonLd schema={organizationSchema()} id="landing-organization" />
      <JsonLd schema={softwareApplicationSchema()} id="landing-software" />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "/" }]} />

      {/* ─── Header ─── */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 no-underline hover:no-underline">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold font-display">G</span>
            </div>
            <span className="font-display font-bold text-[15px] text-ink tracking-tight">GradGrid</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6" aria-label="Main">
            {[
              { label: "About", href: "#about" },
              { label: "Features", href: "#features" },
              { label: "Why GradGrid", href: "#why" },
              { label: "FAQ", href: "#faq" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-mid hover:text-ink transition-colors duration-200 no-underline hover:no-underline"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-dim/50 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-dim/30 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-dim border border-brand-mid rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span className="text-xs font-semibold text-brand-text">The All-in-One Platform for Education</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-ink leading-[1.1] max-w-4xl mx-auto mb-5">
            The digital operating system for<br />
            <span className="text-brand">educational institutions</span>
          </h1>

          <p className="text-lg md:text-xl text-mid max-w-2xl mx-auto mb-10 leading-relaxed">
            GradGrid brings student management, attendance, examinations, fees, and administration
            together in one simple, secure platform — so schools and colleges can run smoothly and
            focus on what matters most: education.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/login">
              <Button size="xl">
                Explore the Platform
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="#about">
              <Button variant="secondary" size="xl">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── About GradGrid ─── */}
      <section id="about" className="border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-dim border border-brand-mid rounded-full px-4 py-1.5 mb-5">
                <span className="w-2 h-2 rounded-full bg-brand" />
                <span className="text-xs font-semibold text-brand-text">About GradGrid</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-ink leading-tight mb-5">
                Built for institutions that need more than just software
              </h2>
              <p className="text-base text-mid leading-relaxed mb-4">
                GradGrid brings everything your institution runs on into <strong className="text-charcoal">one simple, secure platform</strong> —
                built for schools, colleges, universities, coaching institutes, and educational organizations.
                No more juggling multiple tools, scattered spreadsheets, and manual paperwork. Students, staff,
                attendance, exams, and fees all live in one easy-to-use place that works the way your
                institution actually works.
              </p>
              <p className="text-base text-mid leading-relaxed">
                Whether you run a single school, a multi-campus college, or a trust managing several
                institutions, GradGrid adapts to you — not the other way around. Everything stays
                organized, connected, and easy to manage from one dashboard.
              </p>
            </div>
            <div className="bg-fog border border-border rounded-2xl p-8 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-brand-dim flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Server className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display text-ink mb-1">Accessible Anywhere</h3>
                  <p className="text-sm text-mid leading-relaxed">Your data lives safely in the cloud, so you and your team can work from anywhere — and the platform grows effortlessly as your institution grows.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent-dim flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Layers className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display text-ink mb-1">One Account, Many Institutions</h3>
                  <p className="text-sm text-mid leading-relaxed">Run a single school or several campuses from one account. Each institution stays private and separate, while you keep a clear view of everything.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-success-dim flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display text-ink mb-1">Security You Can Trust</h3>
                  <p className="text-sm text-mid leading-relaxed">Your data is protected with strong encryption and role-based access, and every action is recorded — so you always know who did what.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Core Principles ─── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-brand-dim border border-brand-mid rounded-full px-4 py-1.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-brand" />
            <span className="text-xs font-semibold text-brand-text">Design Philosophy</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-ink leading-tight mb-4">
            Principles that shape every feature
          </h2>
          <p className="text-base text-mid max-w-xl mx-auto">
            Six simple promises guide everything we build — so the platform stays secure,
            dependable, and easy to use.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {principles.map((p) => (
            <div
              key={p.title}
              className="bg-surface border border-border rounded-xl p-6 hover:shadow-sm hover:border-brand-mid transition-all duration-200 group"
            >
              <div className="w-11 h-11 rounded-xl bg-brand-dim flex items-center justify-center mb-4 text-brand group-hover:bg-brand group-hover:text-white transition-colors duration-200">
                <p.icon className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-base font-bold font-display text-ink mb-2">{p.title}</h3>
              <p className="text-sm text-mid leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Platform Capabilities ─── */}
      <section id="features" className="bg-surface border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-brand-dim border border-brand-mid rounded-full px-4 py-1.5 mb-5">
              <span className="w-2 h-2 rounded-full bg-brand" />
              <span className="text-xs font-semibold text-brand-text">Platform Capabilities</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-ink leading-tight mb-4">
              Everything your institution needs
            </h2>
            <p className="text-base text-mid max-w-xl mx-auto">
              Everything you need to run your institution smoothly — from the moment a student
              joins to the day they graduate.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map((c) => (
              <div
                key={c.label}
                className="bg-fog border border-border rounded-xl p-5 flex items-start gap-4 hover:bg-surface hover:border-brand-mid hover:shadow-sm transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-dim flex items-center justify-center flex-shrink-0 text-brand">
                  <c.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display text-ink mb-1">{c.label}</h3>
                  <p className="text-xs text-mid leading-relaxed">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Target Audience ─── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-brand-dim border border-brand-mid rounded-full px-4 py-1.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-brand" />
            <span className="text-xs font-semibold text-brand-text">Who It&rsquo;s For</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-ink leading-tight mb-4">
            Built for every kind of educational organization
          </h2>
          <p className="text-base text-mid max-w-xl mx-auto">
            Whether you&rsquo;re a single school or a group of campuses, GradGrid fits the way you work.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {audiences.map((a) => (
            <div
              key={a.label}
              className="inline-flex items-center gap-2.5 bg-surface border border-border rounded-xl px-5 py-3 hover:border-brand-mid hover:shadow-sm hover:bg-brand-dim/30 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-dim flex items-center justify-center text-brand">
                <a.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-charcoal">{a.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Why GradGrid ─── */}
      <section id="why" className="bg-surface border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-brand-dim border border-brand-mid rounded-full px-4 py-1.5 mb-5">
              <span className="w-2 h-2 rounded-full bg-brand" />
              <span className="text-xs font-semibold text-brand-text">Why GradGrid</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-ink leading-tight mb-4">
              A platform you can trust
            </h2>
            <p className="text-base text-mid max-w-xl mx-auto">
              We built GradGrid the right way from the start — secure by design, and made with a
              deep understanding of how schools and colleges really work.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: "Made for Education",
                description: "GradGrid isn't a generic business tool with education bolted on. Every feature is designed around the real day-to-day work of schools, colleges, and universities.",
                icon: GraduationCap,
              },
              {
                title: "Serious Security, Built In",
                description: "Your data is encrypted, access is controlled by role, and every action is logged — so your information stays safe without you having to think about it.",
                icon: Lock,
              },
              {
                title: "One Platform, Every Campus",
                description: "Run a single institution or many from one easy dashboard. Each one stays private and separate, while you keep full control of everything.",
                icon: Layers,
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-dim flex items-center justify-center mx-auto mb-5 text-brand">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold font-display text-ink mb-2">{item.title}</h3>
                <p className="text-sm text-mid leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="bg-gradient-to-br from-brand to-brand-active rounded-2xl p-12 md:p-16 text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/5" />

          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white leading-tight mb-4">
              Ready to transform your institution?
            </h2>
            <p className="text-base text-white/80 max-w-lg mx-auto mb-8 leading-relaxed">
              Explore GradGrid and discover how a purpose-built, cloud-native platform can simplify
              your operations and empower your team.
            </p>
            <Link href="/login">
              <Button
                size="xl"
                className="bg-white text-brand hover:bg-white/90 border-white shadow-lg"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="bg-surface border-t border-border">
        <FaqSection
          className="max-w-3xl mx-auto px-6 py-24"
          eyebrow="FAQs"
          title="Frequently Asked Questions"
          subtitle="Quick answers to the questions we hear most often. Can&rsquo;t find what you&rsquo;re looking for? Reach out to our team and we&rsquo;ll be happy to help."
            items={[
            {
              question: "What is GradGrid?",
              answer:
                "GradGrid is a cloud-native, multi-tenant Education ERP SaaS platform designed for schools, colleges, universities, coaching institutes, and educational organizations. It provides a unified system to manage students, teachers, attendance, examinations, fees, communication, and administrative operations from a single dashboard.",
            },
            {
              question: "How much does GradGrid cost?",
              answer:
                "Pricing is refreshingly simple: a flat ₹10,000 per institution (per year), with no hidden fees, no per-student charges, and no surprise add-ons. That one predictable price covers your entire institution — every module, every feature, and full support included. Whether you run a single school or a multi-campus group, you always know exactly what you're paying. Curious about what this looks like for your institution? Our team would love to walk you through it.",
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

      {/* ─── Footer ─── */}
      <SiteFooter />
    </div>
  );
}
