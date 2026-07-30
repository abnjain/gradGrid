/**
 * GradGrid — SEO Routes
 *
 * Public routes for sitemap generation and SEO tooling.
 * No authentication required — these are consumed by search engine crawlers.
 */

import { Router } from 'express';
import { SeoController } from './seo.controller';

const router = Router();
const controller = new SeoController();

// Sitemap for all institutions (public profiles)
router.get('/institutions-sitemap.xml', controller.getInstitutionsSitemap);

// Aggregated sitemap for all public content
router.get('/sitemap.xml', controller.getAllSitemap);

export default router;
