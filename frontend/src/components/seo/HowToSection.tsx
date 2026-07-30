/**
 * GradGrid — HowToSection Component
 *
 * Reusable HowTo section that renders:
 * 1. HowTo JSON-LD structured data
 * 2. Semantic HTML with step-by-step numbered instructions
 *
 * Each step includes microdata for crawler compatibility.
 */

import React from "react";
import { JsonLd } from "./JsonLd";
import { howToSchema, type HowToStep } from "@/lib/seo";

interface HowToSectionProps {
  title?: string;
  description?: string;
  steps: HowToStep[];
  className?: string;
}

export function HowToSection({
  title = "How to Use GradGrid",
  description,
  steps,
  className,
}: HowToSectionProps) {
  if (steps.length === 0) return null;

  return (
    <>
      {/* JSON-LD structured data for search engines */}
      <JsonLd schema={howToSchema(steps)} id="howto-schema" />

      {/* Visual HowTo section */}
      <section
        className={className}
        aria-labelledby="howto-heading"
        itemScope
        itemType="https://schema.org/HowTo"
      >
        <h2 id="howto-heading" itemProp="name">
          {title}
        </h2>
        {description && (
          <p itemProp="description">{description}</p>
        )}

        <ol>
          {steps.map((step, index) => (
            <li
              key={index}
              itemProp="step"
              itemScope
              itemType="https://schema.org/HowToStep"
            >
              <meta itemProp="position" content={String(index + 1)} />
              <h3 itemProp="name">{step.name}</h3>
              <p itemProp="text">{step.text}</p>
              {step.image && (
                <img
                  src={step.image}
                  alt={step.name}
                  itemProp="image"
                />
              )}
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
