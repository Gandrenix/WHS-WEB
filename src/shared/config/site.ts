// Sin protocolo final ni slash: así se concatena limpio en metadataBase, Open Graph,
// robots.ts y sitemap.ts. En producción, define NEXT_PUBLIC_SITE_URL con el dominio real
// (ej. https://wienerhoundstudios.com) — sin esa variable, los <meta> de Open Graph y el
// sitemap apuntan a localhost, que los rastreadores no pueden seguir.
const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const siteConfig = {
  name: 'Wiener Hound Studios',
  description: 'Estudio creativo de animación, manga y desarrollo multimedia.',
  url: rawUrl.replace(/\/$/, ''),
  navLinks: [
    { label: 'Inicio', href: '/' },
    { label: 'Servicios', href: '/#servicios' },
    { label: 'Categorías', href: '/categorias' },
    { label: 'Portafolio', href: '/#portafolio' },
    { label: 'Equipo', href: '/#equipo' },
    { label: 'Contacto', href: '/#contacto' },
  ],
  categories: [
    { label: 'Apps', href: '/categorias?type=apps' },
    { label: 'Animaciones', href: '/categorias?type=animaciones' },
    { label: 'Visual Novels', href: '/categorias?type=visual-novel' },
    { label: 'Games', href: '/categorias?type=games' },
  ],
};
