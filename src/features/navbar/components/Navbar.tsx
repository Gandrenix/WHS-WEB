'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogoAudioPlayer } from './LogoAudioPlayer';
import { CategoriesDropdown } from './CategoriesDropdown';
import { MobileMenuToggle } from './MobileMenuToggle';
import { AccountButton } from './AccountButton';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { useActiveSection } from '../hooks/useActiveSection';
import type { Profile } from '@/entities/profile';

const HOME_SECTIONS = ['strata-1', 'strata-2', 'bedrock', 'resurface'] as const;

const DEPTH_READOUT: Record<string, { code: string; name: string }> = {
  'strata-1': { code: '01', name: 'STRATA I' },
  'strata-2': { code: '02', name: 'STRATA II' },
  bedrock: { code: '03', name: 'BEDROCK' },
  resurface: { code: '04', name: 'RESURFACED' },
};
const SURFACE_READOUT = { code: '00', name: 'SUPERFICIE' };

interface NavItemProps {
  href: string;
  label: string;
  code: string;
  isActive: boolean;
  textStyles: string;
}

function NavItem({ href, label, code, isActive, textStyles }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`group relative inline-flex items-center gap-1.5 py-1 transition-colors ${textStyles}`}
    >
      <span
        className={`font-mono text-[10px] transition-opacity ${
          isActive ? 'opacity-100 text-[#8B2FE0]' : 'opacity-40 group-hover:opacity-70'
        }`}
      >
        {code}
      </span>
      {/* Peso de fuente SIEMPRE font-black, activo o no: alternar entre font-bold
          y font-black cambiaba el ancho del texto según cuál item estaba activo,
          y eso empujaba a todos los siguientes items de la fila (efecto dominó
          horizontal). El estado activo ya se distingue por color (arriba) y por
          la barra inferior (abajo) — ninguno de los dos afecta el layout. */}
      <span className="font-black">{label}</span>
      <span
        className={`pointer-events-none absolute left-0 -bottom-1.5 h-[2px] w-full origin-left bg-gradient-to-r from-[#8B2FE0] to-[#7ED957] transition-transform duration-300 ${
          isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`}
      />
    </Link>
  );
}

export interface NavbarProps {
  profile: Profile | null;
  /** Campana de notificaciones ya resuelta por app/layout.tsx (patrón favoriteButton/contactButton). */
  notificationBell?: ReactNode;
}

export function Navbar({ profile, notificationBell }: NavbarProps) {
  const pathname = usePathname();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isHome = pathname === '/';
  const scrollProgress = useScrollProgress();
  const activeSection = useActiveSection(HOME_SECTIONS, isHome);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Publica la altura real del header como variable CSS (--header-height) para
  // que cualquier elemento que deba posicionarse justo debajo (el indicador de
  // profundidad, el panel del menú móvil) no dependa de un número fijo a mano
  // que se desactualiza cada vez que el header cambia de tamaño.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateHeight = () => {
      document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);

    return () => observer.disconnect();
    // Se reengancha si el header aparece/desaparece (fullscreen, cambio de ruta)
  }, [pathname, isFullscreen]);

  // 1. Hide Navbar completely when in Fullscreen mode (PDF, Video, Reader Fullscreen)
  if (isFullscreen) {
    return null;
  }

  // 2. Hide Navbar on admin dashboard routes as they have their own control sidebar/header
  if (pathname.startsWith('/admin/dashboard')) {
    return null;
  }

  const isCategoriesRoute = pathname.startsWith('/categorias');

  // Styling based on route: Dark theme for /categorias, light theme for Home / default
  const headerStyles = isCategoriesRoute
    ? 'bg-[#0D0A08]/95 border-white/15 text-[#F2EDE4] shadow-2xl'
    : 'bg-[#F2EDE4]/95 border-[#3A3532]/15 text-[#0D0A08] shadow-sm';

  const textStyles = isCategoriesRoute
    ? 'text-[#F2EDE4] hover:text-[#C084FC]'
    : 'text-[#0D0A08] hover:text-[#8B2FE0]';

  const readout = activeSection ? DEPTH_READOUT[activeSection] ?? SURFACE_READOUT : SURFACE_READOUT;

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-[80] backdrop-blur-md py-2 border-b transition-all duration-300 relative ${headerStyles}`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <LogoAudioPlayer isDark={isCategoriesRoute} />

          {/* Lectura de profundidad en vivo: eco del DepthIndicator lateral, solo en Home.
              El texto cambia de longitud según la sección ("SUPERFICIE" vs "BEDROCK" vs
              "STRATA II"...) — sin un ancho reservado, esa diferencia de longitud
              empuja horizontalmente todo lo que está a la derecha (el nav, la cuenta),
              haciendo que el header entero "salte" de posición al cambiar de sección.
              min-w fija el hueco al tamaño de la etiqueta más larga para que el resto
              del header no se mueva nunca, sin importar cuál sección esté activa. */}
          {isHome && (
            <div
              className={`hidden lg:flex items-center gap-2 pl-4 border-l ${
                isCategoriesRoute ? 'border-white/15' : 'border-[#3A3532]/20'
              }`}
            >
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#7ED957] opacity-75 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#7ED957]" />
              </span>
              <span
                key={readout.code}
                className="font-mono text-[10px] uppercase tracking-widest text-[#7ED957] whitespace-nowrap min-w-[130px]"
              >
                {readout.code} &middot; {readout.name}
              </span>
            </div>
          )}
        </div>

        <div className="nav-wrapper flex items-center">
          <nav className="main-nav hidden md:block font-mono text-xs uppercase tracking-wider">
            <ul className="flex gap-8 items-center font-bold">
              <li>
                <NavItem
                  href="/"
                  label="Inicio"
                  code="00"
                  isActive={isHome && !activeSection}
                  textStyles={textStyles}
                />
              </li>

              <CategoriesDropdown isDark={isCategoriesRoute} isActive={isCategoriesRoute} />

              <li>
                <NavItem
                  href="/#strata-1"
                  label="Strata I"
                  code="01"
                  isActive={isHome && activeSection === 'strata-1'}
                  textStyles={textStyles}
                />
              </li>
              <li>
                <NavItem
                  href="/#strata-2"
                  label="Strata II"
                  code="02"
                  isActive={isHome && activeSection === 'strata-2'}
                  textStyles={textStyles}
                />
              </li>
              <li>
                <NavItem
                  href="/#bedrock"
                  label="Bedrock"
                  code="03"
                  isActive={isHome && activeSection === 'bedrock'}
                  textStyles={textStyles}
                />
              </li>
              {notificationBell && <li>{notificationBell}</li>}
              <li>
                <AccountButton profile={profile} />
              </li>
            </ul>
          </nav>

          <MobileMenuToggle
            isDark={isCategoriesRoute}
            activeSection={isHome ? activeSection : null}
            profile={profile}
            notificationBell={notificationBell}
          />
        </div>
      </div>

      {/* Barra de progreso de excavación: cuánto se ha recorrido de la página */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[2px] ${
          isCategoriesRoute ? 'bg-white/10' : 'bg-[#3A3532]/10'
        }`}
      >
        <div
          className="h-full bg-gradient-to-r from-[#8B2FE0] to-[#7ED957] transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>
    </header>
  );
}
