import { getAllProjects } from '@/entities/project/server';
import { CategoriesClient } from '@/features/categories';

export default async function CategoriasPage() {
  const projects = await getAllProjects();

  return <CategoriesClient initialProjects={projects} />;
}