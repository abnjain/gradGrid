/**
 * GradGrid — PageMeta
 *
 * Helper function so pages can declare metadata with a simple call:
 *
 *   export const metadata = pageMeta({ title: "Features", path: "/features", description: "..." });
 *
 * This is NOT a React component — it returns a Next.js Metadata object.
 */

import type { Metadata } from "next";
import { buildPageMetadata, type PageMetaInput } from "@/lib/seo";

/**
 * Direct helper for Next.js metadata export.
 * Use in any page.tsx:
 *
 *   export const metadata = pageMeta({ title: "Features", path: "/features", description: "..." });
 */
export function pageMeta(input: PageMetaInput): Metadata {
  return buildPageMetadata(input);
}

/**
 * For dynamic metadata generation (pages that need async data).
 * Use in generateMetadata:
 *
 *   export async function generateMetadata(): Promise<Metadata> {
 *     return generatePageMeta({ title: "Features", path: "/features", description: "..." });
 *   }
 */
export { buildPageMetadata as generatePageMeta };
