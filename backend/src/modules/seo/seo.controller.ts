/**
 * GradGrid — SEO Controller
 *
 * Handles HTTP requests for SEO-related endpoints.
 * Produces XML sitemaps for dynamic content (institutions, organizations, etc.).
 */

import { Request, Response } from 'express';
import { SeoService } from './seo.service';
import { logger } from '../../shared/utils/logger';

const seoService = new SeoService();

export class SeoController {
  /**
   * GET /seo/institutions-sitemap.xml
   * Returns an XML sitemap of all active institutions.
   */
  async getInstitutionsSitemap(req: Request, res: Response): Promise<void> {
    try {
      const entries = await seoService.getInstitutionSitemapEntries();
      const xml = this.buildSitemapXml(entries);
      res.set('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      logger.error({ err: error }, 'Failed to generate institutions sitemap');
      res.status(500).json({
        success: false,
        error: { code: 'SITEMAP_ERROR', message: 'Failed to generate sitemap' },
      });
    }
  }

  /**
   * GET /seo/sitemap.xml
   * Returns a combined XML sitemap of all public dynamic content.
   */
  async getAllSitemap(req: Request, res: Response): Promise<void> {
    try {
      const entries = await seoService.getAllDynamicEntries();
      const xml = this.buildSitemapXml(entries);
      res.set('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      logger.error({ err: error }, 'Failed to generate aggregated sitemap');
      res.status(500).json({
        success: false,
        error: { code: 'SITEMAP_ERROR', message: 'Failed to generate sitemap' },
      });
    }
  }

  /**
   * Build an XML sitemap string from a list of entries.
   */
  private buildSitemapXml(entries: Array<{
    url: string;
    lastmod: Date;
    changefreq: string;
    priority: number;
  }>): string {
    const baseUrl = process.env.SITE_URL || 'https://gradgrid.com';
    const urls = entries
      .map(
        (entry) => `  <url>
    <loc>${baseUrl}${this.escapeXml(entry.url)}</loc>
    <lastmod>${entry.lastmod.toISOString().split('T')[0]}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
