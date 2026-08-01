import { createClient } from '@/utils/supabase/server';
import HomeClient from './HomeClient';

export default async function Home() {
  const supabase = await createClient();

  // Fetch the 6 most recent projects to show on the landing page
  const { data: recentProjects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6);

  return <HomeClient recentProjects={recentProjects || []} />;
}