// Sidebar compartido de las 3 páginas del panel de admin (dashboard, nuevo,
// comunidad) — antes estaba duplicado carácter por carácter en cada page.tsx.
// Sin 'use client': no tiene estado propio, solo Links. El botón de cerrar
// sesión llega ya resuelto como ReactNode (patrón favoriteButton/contactButton
// de este codebase) porque admin-dashboard no puede importar `features/auth`
// directo (boundaries prohíbe feature->feature).
import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logoPlayingImg from '@/shared/assets/logo-playing.png';

export type AdminSection = 'publicaciones' | 'nueva-obra' | 'comunidad' | 'especimenes' | 'footer';

export interface AdminSidebarProps {
  activeSection: AdminSection;
  userEmail: string;
  signOutButton: ReactNode;
  projectCount?: number;
  commentCount?: number;
}

const linkClass = (isActive: boolean) =>
  `px-4 py-3 rounded-xl text-xs font-bold transition-colors border flex items-center justify-between ${
    isActive
      ? 'bg-[#8B2FE0]/20 text-[#C084FC] border-[#8B2FE0]/40'
      : 'text-[#F2EDE4]/70 hover:bg-white/5 hover:text-white border-transparent'
  }`;

export function AdminSidebar({ activeSection, userEmail, signOutButton, projectCount, commentCount }: AdminSidebarProps) {
  const isNuevaObra = activeSection === 'nueva-obra';

  return (
    <aside className="w-72 bg-[#120A08] border-r border-white/15 flex flex-col hidden md:flex sticky top-0 h-screen">
      <div className="pt-4 px-4 pb-4 border-b border-white/15">
        <Link href="/" className="flex flex-col items-center group text-center">
          <div className="relative w-44 h-28 shrink-0">
            <Image
              src={logoPlayingImg}
              alt="WHS Logo"
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_15px_rgba(139,47,224,0.4)]"
            />
          </div>
          <div className="-mt-1">
            <span className="font-mono font-black text-white text-xl tracking-tight block">
              WH<span className="text-[#8B2FE0] group-hover:text-[#C084FC] transition-colors">-</span>STUDIOS
            </span>
            <span className="text-[11px] text-[#7ED957] font-bold tracking-widest uppercase block mt-0.5">
              CONTROL ESTRATO
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-2">
        <Link href="/admin/dashboard" className={linkClass(activeSection === 'publicaciones')}>
          <span>📁 PUBLICACIONES</span>
          {typeof projectCount === 'number' && (
            <span className="px-2 py-0.5 bg-[#8B2FE0] text-white rounded text-[10px]">{projectCount}</span>
          )}
        </Link>

        <Link href="/admin/dashboard/nuevo" className={linkClass(isNuevaObra)}>
          <span>{isNuevaObra ? '+ REGISTRAR OBRA' : '+ AÑADIR NUEVA OBRA'}</span>
          {isNuevaObra && (
            <span className="px-2 py-0.5 bg-[#8B2FE0] text-white rounded text-[9px] font-bold">NUEVO</span>
          )}
        </Link>

        <Link href="/admin/dashboard/comunidad" className={linkClass(activeSection === 'comunidad')}>
          <span>💬 COMUNIDAD</span>
          {typeof commentCount === 'number' && (
            <span className="px-2 py-0.5 bg-[#8B2FE0] text-white rounded text-[10px]">{commentCount}</span>
          )}
        </Link>

        <Link href="/admin/dashboard/especimenes" className={linkClass(activeSection === 'especimenes')}>
          <span>🧪 ESPECÍMENES (STRATA I)</span>
        </Link>

        <Link href="/admin/dashboard/footer" className={linkClass(activeSection === 'footer')}>
          <span>🔗 FOOTER</span>
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
          <p className="text-xs text-white font-bold truncate mb-3" title={userEmail}>
            {userEmail}
          </p>
          {signOutButton}
        </div>
      </div>
    </aside>
  );
}
