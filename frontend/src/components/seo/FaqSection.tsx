/**
 * GradGrid — FaqSection Component
 *
 * Accessible FAQ accordion that renders:
 * 1. FAQPage JSON-LD structured data (for search engines)
 * 2. Semantic HTML with an expand/collapse disclosure pattern
 *
 * Each Q&A pair keeps Schema.org microdata attributes for crawlers
 * while exposing a fully keyboard-accessible accordion for users.
 */

"use client";

import React, { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { JsonLd } from "./JsonLd";
import { faqSchema, type FAQ } from "@/lib/seo";
import { cn } from "@/lib/utils";

interface FaqSectionProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items: FAQ[];
  className?: string;
  /** Index of the item opened by default. Pass -1 to start fully collapsed. */
  defaultOpenIndex?: number;
}

export function FaqSection({
  eyebrow = "FAQs",
  title = "Frequently Asked Questions",
  subtitle,
  items,
  className,
  defaultOpenIndex = 0,
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number>(defaultOpenIndex);
  const baseId = useId();

  if (items.length === 0) return null;

  return (
    <>
      {/* JSON-LD structured data for search engines */}
      <JsonLd schema={faqSchema(items)} id="faq-schema" />

      {/* Visual FAQ section */}
      <section className={cn("mx-auto", className)} aria-labelledby="faq-heading">
        {/* Section header */}
        <div className="text-center">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 bg-brand-dim border border-brand-mid rounded-full px-4 py-1.5 mb-5">
              <span className="w-2 h-2 rounded-full bg-brand" />
              <span className="text-xs font-semibold text-brand-text">{eyebrow}</span>
            </div>
          )}
          <h2
            id="faq-heading"
            className="text-3xl md:text-4xl font-bold font-display text-ink leading-tight mb-4"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-base text-mid max-w-xl mx-auto mb-12 leading-relaxed">{subtitle}</p>
          )}
        </div>

        {/* Accordion */}
        <div className="text-left space-y-3" itemScope itemType="https://schema.org/FAQPage">
          {items.map((item, index) => {
            const open = openIndex === index;
            const headingId = `${baseId}-q-${index}`;
            const panelId = `${baseId}-a-${index}`;

            return (
              <section
                key={index}
                itemScope
                itemType="https://schema.org/Question"
                itemProp="mainEntity"
                className={cn(
                  "bg-surface border rounded-xl overflow-hidden transition-all duration-200",
                  open
                    ? "border-brand-mid shadow-[0_0_0_2px_rgba(13,148,136,0.08)]"
                    : "border-border hover:border-brand-mid/60 hover:shadow-sm"
                )}
              >
                <h3 itemProp="name" className="m-0">
                  <button
                    type="button"
                    id={headingId}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(open ? -1 : index)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer select-none"
                  >
                    <span
                      className={cn(
                        "text-sm md:text-[15px] font-semibold font-display leading-snug transition-colors duration-200",
                        open ? "text-brand-active" : "text-ink"
                      )}
                    >
                      {item.question}
                    </span>
                    <span
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200",
                        open ? "bg-brand text-white" : "bg-brand-dim text-brand"
                      )}
                    >
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform duration-300",
                          open && "rotate-180"
                        )}
                      />
                    </span>
                  </button>
                </h3>

                {/* Animated panel */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={headingId}
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div
                      itemScope
                      itemType="https://schema.org/Answer"
                      itemProp="acceptedAnswer"
                      className="px-6 pb-6"
                    >
                      <p itemProp="text" className="text-sm text-mid leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </>
  );
}
