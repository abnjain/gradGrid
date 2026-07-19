"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-fog">
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
