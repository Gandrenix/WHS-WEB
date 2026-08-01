import { getRecentProjects } from '@/entities/project/server';
import { HomeClient } from '@/features/landing';

export default async function Home() {
  const recentProjects = await getRecentProjects(6);

  return <HomeClient recentProjects={recentProjects} />;
}