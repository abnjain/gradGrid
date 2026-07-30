/**
 * GradGrid — AEO (Answer Engine Optimization) Utilities
 *
 * Generates HTML content structures optimized for answer engine extraction:
 * Google Featured Snippets, voice search, and AI answer engines.
 *
 * Every function produces semantic HTML that pairs with JSON-LD
 * structured data from structured-data.ts.
 */

import type { FAQ, HowToStep } from "./structured-data";

/* ─── Content Guidelines ─── */

export const AEO_GUIDELINES = {
  /** Recommended max question length for featured snippets */
  maxQuestionLength: 110,
  /** Recommended max answer paragraph length */
  maxAnswerLength: 350,
  /** Recommended heading depth for answer-engine-friendly content */
  headingDepth: 2,
  /** Use definitional format for key terms */
  definitionFormat: "term: definition" as const,
} as const;

/* ─── Generators ─── */

/**
 * Generate FAQ-rich HTML with clear Q&A structure.
 * Uses <h2> for questions and <p> for answers — optimized for
 * Google Featured Snippets and voice search extraction.
 */
export function generateFaqContent(questions: FAQ[]): string {
  return questions
    .map(
      (q) =>
        `<section class="aeo-faq-item">
  <h2>${escapeHtml(q.question)}</h2>
  <p>${escapeHtml(q.answer)}</p>
</section>`
    )
    .join("\n");
}

/**
 * Generate HowTo content with step-by-step instructions.
 * Uses <h2> for the title and <ol>/<li> for numbered steps.
 */
export function generateHowToContent(
  title: string,
  steps: HowToStep[]
): string {
  const stepsHtml = steps
    .map(
      (step, i) =>
        `<li class="aeo-howto-step">
  <h3>${i + 1}. ${escapeHtml(step.name)}</h3>
  <p>${escapeHtml(step.text)}</p>
  ${step.image ? `<img src="${escapeHtml(step.image)}" alt="${escapeHtml(step.name)}" />` : ""}
</li>`
    )
    .join("\n");

  return `<section class="aeo-howto">
  <h2>${escapeHtml(title)}</h2>
  <ol class="aeo-howto-steps">
${stepsHtml}
  </ol>
</section>`;
}

/**
 * Generate definition-style content for knowledge panels.
 * Optimized for "What is X?" queries in voice search and featured snippets.
 */
export function generateDefinitionContent(
  term: string,
  definition: string,
  context?: string
): string {
  const sections: string[] = [];

  // Definition block
  sections.push(
    `<section class="aeo-definition">
  <h2>What is ${escapeHtml(term)}?</h2>
  <p>${escapeHtml(term)} is ${escapeHtml(definition)}</p>
</section>`
  );

  // Optional context/elaboration
  if (context) {
    sections.push(
      `<section class="aeo-context">
  <h3>Why ${escapeHtml(term)} matters</h3>
  <p>${escapeHtml(context)}</p>
</section>`
    );
  }

  return sections.join("\n");
}

/**
 * Generate a compact definition table for entity listings.
 * Used for "compare" style featured snippets.
 */
export function generateDefinitionTable(
  entries: Array<{ term: string; definition: string }>
): string {
  const rows = entries
    .map(
      (entry) =>
        `<tr>
  <td><strong>${escapeHtml(entry.term)}</strong></td>
  <td>${escapeHtml(entry.definition)}</td>
</tr>`
    )
    .join("\n");

  return `<table class="aeo-definition-table">
  <thead>
    <tr>
      <th>Feature</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
${rows}
  </tbody>
</table>`;
}

/* ─── Helpers ─── */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
