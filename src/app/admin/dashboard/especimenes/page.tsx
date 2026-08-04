import { redirect } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/server';
import { getAllProjects } from '@/entities/project/server';
import { getProfile } from '@/entities/profile/server';
import { getTotalCommentsCount } from '@/entities/comment/server';
import { getSpecimenCards } from '@/entities/specimen-card/server';
import { AdminSidebar, SpecimenCardsManager } from '@/features/admin-dashboard';
import { SignOutButton } from '@/features/auth';

export default async function EspecimenesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Defensa en profundidad: el middleware ya filtra por rol, pero esta página
  // también verifica por si se accede en un contexto donde el middleware no corrió.
  const profile = await getProfile(user.id);
  if (profile?.role !== 'admin') {
    redirect('/biblioteca');
  }

  const [projects, commentCount, cards] = await Promise.all([
    getAllProjects(),
    getTotalCommentsCount(),
    getSpecimenCards(),
  ]);

  return (
    <div className="min-h-screen bg-[#0D0A08] text-[#F2EDE4] flex font-mono">
      <AdminSidebar
        activeSection="especimenes"
        userEmail={user.email || ''}
        signOutButton={<SignOutButton />}
        projectCount={projects.length}
        commentCount={commentCount}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden bg-[#120A08] border-b border-white/15 p-4 flex justify-between items-center sticky top-0 z-10">
          <div className="font-mono font-bold text-white text-sm">WHS CONTROL</div>
          <SignOutButton />
        </header>

        <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full">
          <div className="mb-10 pb-6 border-b border-white/15">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Fichas de la Landing &mdash; STRATA I
            </h1>
            <p className="text-[#F2EDE4]/70 text-xs mt-1">
              Edita las fichas de espécimen que se muestran en la sección &ldquo;HealthTech &amp; Bioinformática&rdquo;
              de la página principal, texto e imagen incluidos.
            </p>
          </div>

          <SpecimenCardsManager cards={cards} />
        </div>
      </main>
    </div>
  );
}
