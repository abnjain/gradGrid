/**
 * GradGrid — SEO Service
 *
 * Business logic for sitemap generation and SEO-related data aggregation.
 * Queries the database for public content that should appear in sitemaps.
 */

import { prisma } from '../../config/database';

export interface SitemapEntry {
  url: string;
  lastmod: Date;
  changefreq: string;
  priority: number;
}

export class SeoService {
  /**
   * Generate sitemap entries for all active institutions.
   * These will appear in the dynamic sitemap for public institution profiles.
   */
  async getInstitutionSitemapEntries(): Promise<SitemapEntry[]> {
    const institutions = await prisma.institutions.findMany({
      where: { is_active: true, deleted_at: null },
      select: {
        id: true,
        updated_at: true,
      },
      orderBy: { updated_at: 'desc' },
    });

    return institutions.map((inst) => ({
      url: `/institution/${inst.id}`,
      lastmod: inst.updated_at,
      changefreq: 'weekly' as const,
      priority: 0.6,
    }));
  }

  /**
   * Generate sitemap entries for all active organizations.
   */
  async getOrganizationSitemapEntries(): Promise<SitemapEntry[]> {
    const organizations = await prisma.organizations.findMany({
      where: { is_active: true, deleted_at: null },
      select: {
        id: true,
        updated_at: true,
      },
      orderBy: { updated_at: 'desc' },
    });

    return organizations.map((org) => ({
      url: `/organization/${org.id}`,
      lastmod: org.updated_at,
      changefreq: 'weekly' as const,
      priority: 0.5,
    }));
  }

  /**
   * Aggregate all dynamic sitemap entries from across the platform.
   * As new public content types are added (blog, docs, etc.),
   * add their entry generators here.
   */
  async getAllDynamicEntries(): Promise<SitemapEntry[]> {
    const [institutions, organizations] = await Promise.all([
      this.getInstitutionSitemapEntries(),
      this.getOrganizationSitemapEntries(),
    ]);

    return [...institutions, ...organizations];
  }
}
