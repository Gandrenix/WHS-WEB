// Le dice a los rastreadores qué indexar. /admin y /biblioteca ya están protegidas por
// middleware (redirigen a /login sin sesión), pero un rastreador no inicia sesión: sin
// este Disallow, Google intentaría indexar la pantalla de login/redirect de cada una.
import type { MetadataRoute } from 'next';
import { siteConfig } from '@/shared/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/biblioteca', '/auth/'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
