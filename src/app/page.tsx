import { getRecentProjects } from '@/entities/project/server';
import { getSpecimenCards } from '@/entities/specimen-card/server';
import { HomeClient } from '@/features/landing';
import { ContactModal } from '@/features/contact';

export default async function Home() {
  const [recentProjects, specimenCards] = await Promise.all([getRecentProjects(6), getSpecimenCards()]);

  return (
    <HomeClient recentProjects={recentProjects} specimenCards={specimenCards} contactButton={<ContactModal />} />
  );
}