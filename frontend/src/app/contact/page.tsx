import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { StaticShell } from "@/components/shared/static-shell";
import { ContactForm } from "@/components/shared/contact-form";
import { buildPageMetadata, siteConfig } from "@/lib/seo";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Us",
  description:
    "Get in touch with the GradGrid team. We're happy to answer your questions, schedule a demo, or help you get started.",
  path: "/contact",
});

const supportHours = [
  { days: "Monday – Friday", hours: "9:00 AM – 7:00 PM IST" },
  { days: "Saturday", hours: "10:00 AM – 4:00 PM IST" },
  { days: "Sunday & Holidays", hours: "Email support available" },
];

export default function ContactPage() {
  const { contact } = siteConfig;

  return (
    <StaticShell
      eyebrow="Contact Us"
      title="We'd love to hear from you"
      subtitle="Questions, feedback, or want to see GradGrid in action? Reach out — a real person from our team will get back to you."
    >
      <div className="space-y-8">
        {/* ─── Contact cards ─── */}
        <div className="grid sm:grid-cols-3 gap-4">
          <a
            href={`mailto:${contact.email}`}
            className="bg-surface border border-border rounded-xl p-6 text-center hover:border-brand-mid hover:shadow-sm transition-all duration-200 no-underline hover:no-underline group"
          >
            <div className="w-11 h-11 rounded-xl bg-brand-dim flex items-center justify-center mx-auto mb-4 text-brand group-hover:bg-brand group-hover:text-white transition-colors duration-200">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold font-display text-ink mb-1">Email Us</h3>
            <p className="text-xs text-mid break-all">{contact.email}</p>
          </a>
          <a
            href={`tel:${contact.phone.replace(/\s/g, "")}`}
            className="bg-surface border border-border rounded-xl p-6 text-center hover:border-brand-mid hover:shadow-sm transition-all duration-200 no-underline hover:no-underline group"
          >
            <div className="w-11 h-11 rounded-xl bg-brand-dim flex items-center justify-center mx-auto mb-4 text-brand group-hover:bg-brand group-hover:text-white transition-colors duration-200">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold font-display text-ink mb-1">Call Us</h3>
            <p className="text-xs text-mid">{contact.phone}</p>
          </a>
          <div className="bg-surface border border-border rounded-xl p-6 text-center">
            <div className="w-11 h-11 rounded-xl bg-brand-dim flex items-center justify-center mx-auto mb-4 text-brand">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold font-display text-ink mb-1">Visit Us</h3>
            <p className="text-xs text-mid leading-relaxed">
              {contact.address}, {contact.city}, {contact.state}, {contact.country}
            </p>
          </div>
        </div>

        {/* ─── Form + hours ─── */}
        <div className="grid md:grid-cols-5 gap-6">
          {/* Form (client component) */}
          <ContactForm />

          {/* Hours */}
          <div className="md:col-span-2 bg-fog border border-border rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-bold font-display text-ink mb-1 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand" />
              Support hours
            </h2>
            <p className="text-xs text-mid mb-5">We typically respond within one business day.</p>
            <ul className="space-y-4">
              {supportHours.map((s) => (
                <li key={s.days} className="flex flex-col">
                  <span className="text-sm font-semibold text-ink">{s.days}</span>
                  <span className="text-xs text-mid">{s.hours}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-mist leading-relaxed">
                Prefer email? Write to us at{" "}
                <a href={`mailto:${contact.supportEmail}`} className="text-brand hover:underline">
                  {contact.supportEmail}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* ─── Note ─── */}
        <p className="text-xs text-mist text-center leading-relaxed">
          Looking for help with an existing account?{" "}
          <Link href="/login" className="text-brand hover:underline font-medium">
            Sign in
          </Link>{" "}
          or check the{" "}
          <Link href="/#faq" className="text-brand hover:underline font-medium">
            FAQ
          </Link>
          .
        </p>
      </div>
    </StaticShell>
  );
}
