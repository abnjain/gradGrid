/**
 * GradGrid — FaqSection Component
 *
 * Reusable FAQ section that renders:
 * 1. FAQPage JSON-LD structured data
 * 2. Semantic HTML (<h2> questions, <p> answers) optimized for answer engines
 *
 * Each Q&A pair is wrapped in a <section> with microdata attributes
 * for maximum crawler compatibility.
 */

import React from "react";
import { JsonLd } from "./JsonLd";
import { faqSchema, type FAQ } from "@/lib/seo";

interface FaqSectionProps {
  title?: string;
  items: FAQ[];
  className?: string;
}

export function FaqSection({
  title = "Frequently Asked Questions",
  items,
  className,
}: FaqSectionProps) {
  if (items.length === 0) return null;

  return (
    <>
      {/* JSON-LD structured data for search engines */}
      <JsonLd schema={faqSchema(items)} id="faq-schema" />

      {/* Visual FAQ section */}
      <section className={className} aria-labelledby="faq-heading">
        <h2 id="faq-heading">{title}</h2>
        <div itemScope itemType="https://schema.org/FAQPage">
          {items.map((item, index) => (
            <section
              key={index}
              itemScope
              itemType="https://schema.org/Question"
              itemProp="mainEntity"
            >
              <h3 itemProp="name">{item.question}</h3>
              <div
                itemScope
                itemType="https://schema.org/Answer"
                itemProp="acceptedAnswer"
              >
                <p itemProp="text">{item.answer}</p>
              </div>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
