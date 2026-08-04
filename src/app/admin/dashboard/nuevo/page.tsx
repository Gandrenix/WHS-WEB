import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/shared/lib/supabase/server';
import { ProjectForm, AdminSidebar } from '@/features/admin-dashboard';
import { SignOutButton } from '@/features/auth';
import { getAllProjects } from '@/entities/project/server';
import { getTotalCommentsCount } from '@/entities/comment/server';

export default async function NuevoProyectoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const projects = await getAllProjects();
  const commentCount = await getTotalCommentsCount();

  return (
    <div className="min-h-screen bg-[#0D0A08] text-[#F2EDE4] flex font-mono">
      <AdminSidebar
        activeSection="nueva-obra"
        userEmail={user.email || ''}
        signOutButton={<SignOutButton />}
        projectCount={projects.length}
        commentCount={commentCount}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden bg-[#120A08] border-b border-white/15 p-4 flex justify-between items-center sticky top-0 z-10">
          <Link
            href="/admin/dashboard"
            className="text-xs text-[#F2EDE4] flex items-center gap-1 font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> VOLVER
          </Link>
          <SignOutButton />
        </header>

        <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full">
          <div className="mb-8">
            <Link
              href="/admin/dashboard"
              className="hidden md:inline-flex items-center text-xs text-[#C084FC] hover:text-white transition-colors mb-4 font-bold bg-[#8B2FE0]/15 px-3.5 py-2 rounded-xl border border-[#8B2FE0]/30"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              &larr; VOLVER A DASHBOARD
            </Link>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Gestión de Obras &amp; Registro de Capítulos
            </h1>
            <p className="text-[#F2EDE4]/70 text-xs mt-1">
              Crea nuevas obras o añade capítulos jerárquicos a publicaciones existentes en el catálogo.
            </p>
          </div>

          <ProjectForm projects={projects} />
        </div>
      </main>
    </div>
  );
}