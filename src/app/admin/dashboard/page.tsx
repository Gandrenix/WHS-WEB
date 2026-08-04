import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/shared/lib/supabase/server';
import { getAllProjects } from '@/entities/project/server';
import { getProfile } from '@/entities/profile/server';
import { getTotalCommentsCount } from '@/entities/comment/server';
import { ProjectList, AdminSidebar } from '@/features/admin-dashboard';
import { SignOutButton } from '@/features/auth';

export default async function DashboardPage() {
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

  const projects = await getAllProjects();
  const lightweightProjects = projects.map(({ markdown_content, ...rest }) => rest);
  const commentCount = await getTotalCommentsCount();

  return (
    <div className="min-h-screen bg-[#0D0A08] text-[#F2EDE4] flex font-mono">
      <AdminSidebar
        activeSection="publicaciones"
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

        <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {/* Metrics Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-5 rounded-xl bg-[#160E0A] border border-white/15">
              <div className="text-[10px] text-[#F2EDE4]/60 font-bold uppercase mb-1">
                REGISTROS PUBLICADOS
              </div>
              <div className="text-3xl font-black text-white">{projects.length}</div>
            </div>
            <div className="p-5 rounded-xl bg-[#160E0A] border border-white/15">
              <div className="text-[10px] text-[#7ED957] font-bold uppercase mb-1">
                SISTEMA OPERATIVO
              </div>
              <div className="text-3xl font-black text-[#7ED957]">100% OK</div>
            </div>
            <div className="p-5 rounded-xl bg-[#160E0A] border border-white/15">
              <div className="text-[10px] text-[#C084FC] font-bold uppercase mb-1">
                CATEGORÍAS DE OBRA
              </div>
              <div className="text-xs font-bold text-[#F2EDE4] mt-2">
                APPS &bull; ANIMACIONES &bull; VISUAL NOVELS &bull; GAMES
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-white/15">
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                Panel de Comando &amp; Registro
              </h1>
              <p className="text-[#F2EDE4]/70 text-xs mt-1">
                Administración de la base de datos de publicaciones y prototipos de Wiener Hound Studios.
              </p>
            </div>
            <Link
              href="/admin/dashboard/nuevo"
              className="bg-[#8B2FE0] hover:bg-[#C084FC] text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg whitespace-nowrap"
            >
              + REGISTRAR OBRA
            </Link>
          </div>

          <ProjectList projects={lightweightProjects as any} />
        </div>
      </main>
    </div>
  );
}