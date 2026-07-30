/**
 * GradGrid — GEO (Generative Engine Optimization) Utilities
 *
 * Utilities for optimizing content for AI search engines and crawlers
 * (ChatGPT, Google SGE, Bing Copilot, Perplexity, etc.).
 *
 * Focus on entity clarity, content structure signals, and citation/reference markup.
 */

import type { EntityInput, Citation } from "./structured-data";

/* ─── Content Guidelines for GEO ─── */

export const GEO_GUIDELINES = {
  /** Maximum recommended paragraph length (chars) for AI readability */
  maxParagraphLength: 250,
  /** Maximum recommended sentence length (words) */
  maxSentenceLength: 25,
  /** Minimum heading depth required for structure clarity */
  minHeadingDepth: 2,
  /** Maximum heading depth before AI loses structure */
  maxHeadingDepth: 4,
  /** Recommended entity mentions per 1000 words */
  entityDensityPer1K: 8,
  /** Recommended reading grade level (US school grade) */
  targetGradeLevel: 8,
  /** Minimum words needed for AI to consider content substantive */
  minSubstantiveContent: 300,
} as const;

/* ─── Types ─── */

export interface ContentSignals {
  /** Estimated reading grade level (US school grade) */
  gradeLevel: number;
  /** Number of heading levels used */
  headingDepth: number;
  /** Number of entity mentions found */
  entityCount: number;
  /** Content word count */
  wordCount: number;
  /** Whether content meets minimum substantive threshold */
  isSubstantive: boolean;
  /** Number of citation/reference links */
  citationCount: number;
  /** Average paragraph length in chars */
  avgParagraphLength: number;
  /** Whether the content has a clear hierarchical structure */
  hasClearStructure: boolean;
  /** Recommendations for improvement */
  recommendations: string[];
}

/* ─── Generators ─── */

/**
 * Generate entity markup enriched with sameAs links and descriptions.
 * This helps AI crawlers build entity knowledge graphs.
 */
export function generateEntitySignals(entity: EntityInput): string {
  const signals: string[] = [];

  signals.push(`<meta itemProp="name" content="${escapeAttr(entity.name)}" />`);
  signals.push(`<meta itemProp="description" content="${escapeAttr(entity.description)}" />`);
  signals.push(`<meta itemProp="url" content="${escapeAttr(entity.url)}" />`);

  if (entity.sameAs && entity.sameAs.length > 0) {
    for (const link of entity.sameAs) {
      signals.push(`<link itemProp="sameAs" href="${escapeAttr(link)}" />`);
    }
  }

  return signals.join("\n");
}

/**
 * Generate citation markup for GEO credibility signals.
 * AI crawlers prioritize content with clear, verifiable citations.
 */
export function generateCitationMarkup(source: Citation): string {
  return `<cite itemScope itemType="https://schema.org/CreativeWork">
  <meta itemProp="headline" content="${escapeAttr(source.title)}" />
  <link itemProp="url" href="${escapeAttr(source.url)}" />
  ${source.publisher ? `<meta itemProp="publisher" content="${escapeAttr(source.publisher)}" />` : ""}
  ${source.datePublished ? `<meta itemProp="datePublished" content="${escapeAttr(source.datePublished)}" />` : ""}
</cite>`;
}

/**
 * Generate content signals analysis for GEO readiness.
 * Returns a structured report with recommendations.
 */
export function analyzeContentSignals(html: string): ContentSignals {
  // Strip HTML tags for text analysis
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Count heading levels
  const h2Count = (html.match(/<h2[\s>]/gi) || []).length;
  const h3Count = (html.match(/<h3[\s>]/gi) || []).length;
  const h4Count = (html.match(/<h4[\s>]/gi) || []).length;
  const headingDepth =
    h4Count > 0 ? 4 : h3Count > 0 ? 3 : h2Count > 0 ? 2 : 1;

  // Count entity mentions (itemProp attributes)
  const entityCount = (html.match(/itemProp=/gi) || []).length;

  // Count citation links
  const citationCount = (html.match(/<cite[\s>]/gi) || []).length;

  // Estimate grade level (simplified Flesch-Kincaid)
  const syllables = words.reduce(
    (count, word) => count + countSyllables(word),
    0
  );
  const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
  const gradeLevel = Math.round(
    0.39 * (words.length / sentences) +
      11.8 * (syllables / words.length) -
      15.59
  );

  // Average paragraph length
  const paragraphs = html
    .split(/<\/?p[^>]*>/gi)
    .filter((s) => s.trim().length > 0);
  const avgParagraphLength = paragraphs.length
    ? Math.round(
        paragraphs.reduce((sum, p) => sum + p.replace(/<[^>]*>/g, "").length, 0) /
          paragraphs.length
      )
    : 0;

  // Structure assessment
  const hasClearStructure = headingDepth >= 2 && wordCount >= 100;

  // Recommendations
  const recommendations: string[] = [];
  if (gradeLevel > GEO_GUIDELINES.targetGradeLevel + 2) {
    recommendations.push(
      `Content reading level is Grade ${gradeLevel}. Consider simplifying language to Grade ${GEO_GUIDELINES.targetGradeLevel} or below for better AI comprehension.`
    );
  }
  if (headingDepth < 2) {
    recommendations.push(
      "Add at least <h2> headings to create a clear hierarchical structure."
    );
  }
  if (wordCount < GEO_GUIDELINES.minSubstantiveContent) {
    recommendations.push(
      `Content is ${wordCount} words. AI crawlers favor content with at least ${GEO_GUIDELINES.minSubstantiveContent} words for substantive coverage.`
    );
  }
  if (avgParagraphLength > GEO_GUIDELINES.maxParagraphLength) {
    recommendations.push(
      `Average paragraph length is ${avgParagraphLength} chars. Break into shorter paragraphs (max ${GEO_GUIDELINES.maxParagraphLength} chars) for better AI parsing.`
    );
  }
  if (entityCount < 3) {
    recommendations.push(
      "Add semantic entity markup (itemProp attributes) to help AI understand key entities."
    );
  }
  if (citationCount === 0 && wordCount > 200) {
    recommendations.push(
      "Consider adding citations to build credibility signals for AI crawlers."
    );
  }

  return {
    gradeLevel: Math.max(1, Math.min(20, gradeLevel)),
    headingDepth,
    entityCount,
    wordCount,
    isSubstantive: wordCount >= GEO_GUIDELINES.minSubstantiveContent,
    citationCount,
    avgParagraphLength,
    hasClearStructure,
    recommendations,
  };
}

/* ─── Helpers ─── */

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function countSyllables(word: string): number {
  word = word.toLowerCase();
  let count = 0;
  let prevVowel = false;
  const vowels = new Set(["a", "e", "i", "o", "u", "y"]);

  for (const char of word) {
    const isVowel = vowels.has(char);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }

  // Adjust for silent e
  if (word.endsWith("e")) count--;
  // Every word has at least one syllable
  return Math.max(1, count);
}
