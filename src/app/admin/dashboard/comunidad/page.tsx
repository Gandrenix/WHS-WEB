import { redirect } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/server';
import { getAllProjects } from '@/entities/project/server';
import { getProfile } from '@/entities/profile/server';
import { getCommentsForModeration, getTotalCommentsCount } from '@/entities/comment/server';
import { AdminSidebar, CommunityModerationList } from '@/features/admin-dashboard';
import { SignOutButton } from '@/features/auth';

export default async function ComunidadPage() {
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

  const [projects, { comments, hasMore }, commentCount] = await Promise.all([
    getAllProjects(),
    getCommentsForModeration(),
    getTotalCommentsCount(),
  ]);

  return (
    <div className="min-h-screen bg-[#0D0A08] text-[#F2EDE4] flex font-mono">
      <AdminSidebar
        activeSection="comunidad"
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

        <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full">
          <div className="mb-10 pb-6 border-b border-white/15">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Comunidad &amp; Moderación</h1>
            <p className="text-[#F2EDE4]/70 text-xs mt-1">
              Comentarios de usuarios en todas las obras del catálogo, del más reciente al más antiguo.
            </p>
          </div>

          <CommunityModerationList initialComments={comments} initialHasMore={hasMore} />
        </div>
      </main>
    </div>
  );
}
