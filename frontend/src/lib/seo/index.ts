/**
 * GradGrid — SEO Library Barrel
 *
 * Centralized exports — every module/page imports from here.
 */

// Config
export { siteConfig, getDefaultMetadata } from "./config";
export type { SiteConfig } from "./config";

// Metadata
export {
  buildPageMetadata,
  buildInstitutionMetadata,
  buildArticleMetadata,
} from "./metadata";
export type { PageMetaInput, InstitutionPublic } from "./metadata";

// Structured Data
export {
  organizationSchema,
  softwareApplicationSchema,
  webSiteSchema,
  faqSchema,
  howToSchema,
  breadcrumbSchema,
  articleSchema,
  educationalOrganizationSchema,
  courseSchema,
  entityMarkup,
  citationMarkup,
  renderJsonLd,
} from "./structured-data";
export type {
  FAQ,
  HowToStep,
  BreadcrumbItem,
  ArticleInput,
  CourseInput,
  EntityInput,
  Citation,
} from "./structured-data";

// Sitemap
export {
  STATIC_ROUTES,
  generateSitemapIndex,
  generateStaticSitemap,
  generateDynamicSitemap,
} from "./sitemap";
export type { SitemapEntry, SitemapIndexEntry } from "./sitemap";

// AEO
export {
  generateFaqContent,
  generateHowToContent,
  generateDefinitionContent,
  generateDefinitionTable,
  AEO_GUIDELINES,
} from "./aeo";

// GEO
export {
  generateEntitySignals,
  generateCitationMarkup,
  analyzeContentSignals,
  GEO_GUIDELINES,
} from "./geo";
export type { ContentSignals } from "./geo";

// Robots
export { generateRobotsTxt, defaultRobotsTxt } from "./robots";
export type { RobotsOptions } from "./robots";

// Performance
export {
  getDefaultPreloadHints,
  getDefaultPreconnectHints,
  getCacheHeaders,
  CACHE_TTL,
  PERFORMANCE_BUDGETS,
  IMAGE_SIZES,
  IMAGE_FORMATS,
} from "./performance";
export type { PreloadHint, PreconnectHint, CacheControl } from "./performance";

// Validation
export {
  validateMetadata,
  validateAuthNoindex,
  validateJsonLd,
  lintPageContent,
  checkPublicPageSeo,
} from "./validate";
export type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  LintResult,
} from "./validate";
