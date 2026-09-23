// Rutas estáticas + una entrada por obra publicada, para que Google encuentre el catálogo
// completo sin depender de que rastree los enlaces uno por uno. Las rutas privadas
// (/admin, /biblioteca, /login) no van aquí — ya las excluye robots.ts.
import type { MetadataRoute } from 'next';
import { siteConfig } from '@/shared/config/site';
import { getAllProjects } from '@/entities/project/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getAllProjects().catch(() => []);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteConfig.url}/categorias`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteConfig.url}/politica-privacidad`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${siteConfig.url}/terminos-servicio`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${siteConfig.url}/categorias/${p.slug}`,
    lastModified: p.created_at,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes];
}
