/**
 * GradGrid — Structured Data (JSON-LD) Factories
 *
 * Typed Schema.org JSON-LD builders.
 * Every function returns a plain object with @context and @type.
 * These are consumed by the JsonLd component.
 */

/* ─── Types ─── */

export interface FAQ {
  question: string;
  answer: string;
}

export interface HowToStep {
  name: string;
  text: string;
  image?: string;
  url?: string;
}

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export interface ArticleInput {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  authorUrl?: string;
  publisherName?: string;
  publisherLogo?: string;
}

export interface InstitutionPublic {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  establishedYear?: number;
  institutionType?: string;
  affiliation?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
}

export interface CourseInput {
  name: string;
  description: string;
  providerName: string;
  url: string;
  image?: string;
}

export interface EntityInput {
  name: string;
  description: string;
  url: string;
  sameAs?: string[];
  image?: string;
  type?: "Organization" | "EducationalOrganization" | "SoftwareApplication";
}

export interface Citation {
  title: string;
  url: string;
  publisher?: string;
  datePublished?: string;
}

/* ─── Helpers ─── */

/**
 * Render a JSON-LD script tag string for injection in JSX.
 */
export function renderJsonLd(schema: Record<string, unknown>): string {
  return JSON.stringify(schema, null, 2);
}

/* ─── Schema Factories ─── */

/**
 * GradGrid Organization — appears on every page.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://gradgrid.com/#organization",
    name: "GradGrid",
    url: "https://gradgrid.com",
    logo: "https://gradgrid.com/og-image.png",
    description:
      "Cloud-Native Multi-Tenant Education ERP SaaS Platform for schools, colleges, universities, coaching institutes, and educational organizations.",
    sameAs: [
      "https://twitter.com/gradgrid",
      "https://linkedin.com/company/gradgrid",
      "https://github.com/gradgrid",
    ],
    foundingDate: "2026",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "hello@gradgrid.com",
    },
  };
}

/**
 * SoftwareApplication — marks GradGrid as a SaaS product.
 */
export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": "https://gradgrid.com/#softwareapplication",
    name: "GradGrid",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      description: "Subscription-based SaaS pricing. Contact for details.",
    },
    description:
      "A cloud-native multi-tenant Education ERP platform for managing students, teachers, attendance, examinations, fees, communication, and more.",
    url: "https://gradgrid.com",
  };
}

/**
 * WebSite — with SearchAction for site search.
 */
export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://gradgrid.com/#website",
    name: "GradGrid",
    url: "https://gradgrid.com",
    description: "Cloud-Native Multi-Tenant Education ERP SaaS Platform",
    publisher: { "@id": "https://gradgrid.com/#organization" },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://gradgrid.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * FAQPage — for answer-engine-optimized Q&A sections.
 */
export function faqSchema(items: FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://gradgrid.com/#faq",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/**
 * HowTo — for step-by-step instructional content.
 */
export function howToSchema(steps: HowToStep[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use GradGrid",
    description:
      "Step-by-step instructions for common GradGrid workflows.",
    step: steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.name,
      text: step.text,
      ...(step.image ? { image: step.image } : {}),
      ...(step.url ? { url: step.url } : {}),
    })),
  };
}

/**
 * BreadcrumbList — for navigation breadcrumbs.
 */
export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://gradgrid.com/#breadcrumb",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.item.startsWith("http")
        ? item.item
        : `https://gradgrid.com${item.item}`,
    })),
  };
}

/**
 * Article — for blog posts and documentation.
 */
export function articleSchema(article: ArticleInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${article.url}#article`,
    headline: article.headline,
    description: article.description,
    url: article.url,
    ...(article.image ? { image: article.image } : {}),
    datePublished: article.datePublished,
    ...(article.dateModified ? { dateModified: article.dateModified } : {}),
    author: {
      "@type": "Person",
      name: article.authorName,
      ...(article.authorUrl ? { url: article.authorUrl } : {}),
    },
    publisher: {
      "@type": "Organization",
      name: article.publisherName ?? "GradGrid",
      ...(article.publisherLogo
        ? {
            logo: {
              "@type": "ImageObject",
              url: article.publisherLogo,
            },
          }
        : {}),
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
  };
}

/**
 * EducationalOrganization — for public institution profiles (Phase 6).
 */
export function educationalOrganizationSchema(
  institution: InstitutionPublic
) {
  const baseUrl = `https://gradgrid.com/institution/${institution.id}`;
  const sameAs: string[] = [];
  if (institution.socialLinks?.facebook)
    sameAs.push(institution.socialLinks.facebook);
  if (institution.socialLinks?.instagram)
    sameAs.push(institution.socialLinks.instagram);
  if (institution.socialLinks?.youtube)
    sameAs.push(institution.socialLinks.youtube);
  if (institution.socialLinks?.linkedin)
    sameAs.push(institution.socialLinks.linkedin);
  if (institution.website) sameAs.push(institution.website);

  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${baseUrl}#organization`,
    name: institution.name,
    ...(institution.description
      ? { description: institution.description }
      : {}),
    ...(institution.logoUrl ? { logo: institution.logoUrl } : {}),
    url: baseUrl,
    ...(institution.address
      ? { address: { "@type": "PostalAddress", streetAddress: institution.address } }
      : {}),
    ...(institution.city
      ? { address: { "@type": "PostalAddress", addressLocality: institution.city } }
      : {}),
    ...(institution.state
      ? { address: { "@type": "PostalAddress", addressRegion: institution.state } }
      : {}),
    ...(institution.contactEmail ? { email: institution.contactEmail } : {}),
    ...(institution.contactPhone
      ? { telephone: institution.contactPhone }
      : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(institution.establishedYear
      ? { foundingDate: String(institution.establishedYear) }
      : {}),
    ...(institution.affiliation
      ? { affiliation: { "@type": "Organization", name: institution.affiliation } }
      : {}),
    parentOrganization: { "@id": "https://gradgrid.com/#organization" },
  };
}

/**
 * Course — for public course listings (Phase 6).
 */
export function courseSchema(course: CourseInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.name,
    description: course.description,
    provider: {
      "@type": "Organization",
      name: course.providerName,
      sameAs: course.url,
    },
    ...(course.image ? { image: course.image } : {}),
    url: course.url,
  };
}

/**
 * Entity markup — for GEO entity enrichment.
 */
export function entityMarkup(entity: EntityInput) {
  return {
    "@context": "https://schema.org",
    "@type": entity.type ?? "Organization",
    name: entity.name,
    description: entity.description,
    url: entity.url,
    ...(entity.sameAs && entity.sameAs.length > 0
      ? { sameAs: entity.sameAs }
      : {}),
    ...(entity.image ? { image: entity.image } : {}),
  };
}

/**
 * Citation markup — for GEO citation signals.
 */
export function citationMarkup(source: Citation) {
  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    ...(source.title ? { headline: source.title } : {}),
    ...(source.url ? { url: source.url } : {}),
    ...(source.publisher
      ? { publisher: { "@type": "Organization", name: source.publisher } }
      : {}),
    ...(source.datePublished ? { datePublished: source.datePublished } : {}),
  };
}
