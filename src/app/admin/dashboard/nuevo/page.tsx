import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/shared/lib/supabase/server';
import { ProjectForm } from '@/features/admin-dashboard';
import { SignOutButton } from '@/features/auth';

export default async function NuevoProyectoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin');
  }

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
            className="px-4 py-3 text-[#F2EDE4]/70 hover:bg-white/5 hover:text-white rounded-xl text-xs font-bold transition-colors border border-transparent"
          >
            📁 PUBLICACIONES
          </Link>
          <Link
            href="/admin/dashboard/nuevo"
            className="px-4 py-3 bg-[#8B2FE0]/20 text-[#C084FC] rounded-xl text-xs font-bold border border-[#8B2FE0]/40 flex items-center justify-between"
          >
            <span>+ REGISTRAR OBRA</span>
            <span className="px-2 py-0.5 bg-[#8B2FE0] text-white rounded text-[9px] font-bold">
              NUEVO
            </span>
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
              Ficha de Registro de Especimen / Obra
            </h1>
            <p className="text-[#F2EDE4]/70 text-xs mt-1">
              Ingresa la información requerida para registrar una nueva publicación en la base pública.
            </p>
          </div>

          <ProjectForm />
        </div>
      </main>
    </div>
  );
}