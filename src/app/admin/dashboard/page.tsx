import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/shared/lib/supabase/server';
import { getAllProjects } from '@/entities/project/server';
import { ProjectList } from '@/features/admin-dashboard';
import { SignOutButton } from '@/features/auth';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin');
  }

  const projects = await getAllProjects();

  return (
    <div className="min-h-screen bg-[#0D0A08] text-[#F2EDE4] flex font-mono">
      {/* Sidebar */}
      <aside className="w-72 bg-[#120A08] border-r border-white/15 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 border-b border-white/15">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8">
              <Image
                src="/images/logo-playing.png"
                alt="WHS Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-mono font-black text-white text-sm tracking-tight block">
                WH-STUDIOS
              </span>
              <span className="text-[9px] text-[#7ED957] font-bold tracking-widest uppercase">
                CONTROL ESTRATO
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link
            href="/admin/dashboard"
            className="px-4 py-3 bg-[#8B2FE0]/20 text-[#C084FC] rounded-xl text-xs font-bold border border-[#8B2FE0]/40 flex items-center justify-between"
          >
            <span>📁 PUBLICACIONES</span>
            <span className="px-2 py-0.5 bg-[#8B2FE0] text-white rounded text-[10px]">
              {projects.length}
            </span>
          </Link>
          <Link
            href="/admin/dashboard/nuevo"
            className="px-4 py-3 text-[#F2EDE4]/70 hover:bg-white/5 hover:text-white rounded-xl text-xs font-bold transition-colors border border-transparent"
          >
            + AÑADIR NUEVA OBRA
          </Link>
          <Link
            href="/categorias"
            target="_blank"
            className="px-4 py-3 text-[#F2EDE4]/70 hover:bg-white/5 hover:text-white rounded-xl text-xs font-bold transition-colors border border-transparent"
          >
            🌐 VER CATÁLOGO VIVO &rarr;
          </Link>
        </nav>

        <div className="p-4 border-t border-white/15">
          <div className="bg-black/50 rounded-xl p-4 border border-white/15">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#7ED957] animate-pulse"></span>
              <span className="text-[10px] text-[#7ED957] font-bold uppercase">ADMINISTRADOR ACTIVO</span>
            </div>
            <p className="text-xs text-white font-bold truncate mb-3" title={user.email}>
              {user.email}
            </p>
            <SignOutButton />
          </div>
        </div>
      </aside>

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
                APPS &bull; MANGA &bull; ANIME &bull; VN
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

          <ProjectList projects={projects} />
        </div>
      </main>
    </div>
  );
}