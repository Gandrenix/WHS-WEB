import { getRecentProjects } from '@/entities/project/server';
import { getSpecimenCards } from '@/entities/specimen-card/server';
import { getFooterSocialLinks } from '@/entities/footer-social-link/server';
import { HomeClient } from '@/features/landing';
import { ContactModal } from '@/features/contact';

export default async function Home() {
  const [recentProjects, specimenCards, socialLinks] = await Promise.all([
    getRecentProjects(6),
    getSpecimenCards(),
    getFooterSocialLinks(),
  ]);

  return (
    <HomeClient
      recentProjects={recentProjects}
      specimenCards={specimenCards}
      socialLinks={socialLinks}
      contactButton={<ContactModal />}
    />
  );
}