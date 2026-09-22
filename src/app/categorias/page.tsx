import type { Metadata } from 'next';
import { getAllProjects } from '@/entities/project/server';
import { CategoriesClient } from '@/features/categories';

// Sin esto heredaba el title/description genérico del layout raíz (el mismo que la
// home): dos páginas indexadas con idéntico <title> compiten entre sí en Google en vez
// de reforzarse.
export const metadata: Metadata = {
  title: 'Catálogo de Obras',
  description: 'Explora el catálogo de Wiener Hound Studios: Apps, Animaciones, Visual Novels y Games.',
  openGraph: { title: 'Catálogo de Obras — Wiener Hound Studios', url: '/categorias' },
};

export default async function CategoriasPage() {
  const projects = await getAllProjects();

  return <CategoriesClient initialProjects={projects} />;
}
