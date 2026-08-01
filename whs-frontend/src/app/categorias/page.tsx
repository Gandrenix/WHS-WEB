import { createClient } from '@/utils/supabase/server';
import CategoriasClient from './CategoriasClient';

// We fetch data on the server component
export default async function Categorias() {
  const supabase = await createClient();
  
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  return <CategoriasClient initialProjects={projects || []} />;
}