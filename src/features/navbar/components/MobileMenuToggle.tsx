'use client';
// Client: isla pequeña para el botón hamburguesa y el panel móvil condicional (Fix Bugs A y B)

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useMobileMenu } from '../hooks/useMobileMenu';
import { AccountButton } from './AccountButton';
import type { Profile } from '@/entities/profile';

interface MobileMenuToggleProps {
  isDark?: boolean;
  activeSection?: string | null;
  profile?: Profile | null;
  notificationBell?: ReactNode;
}

const MOBILE_LINKS = [
  { href: '/', label: 'Inicio', code: '00', id: null },
  { href: '/#strata-1', label: 'Strata I', code: '01', id: 'strata-1' },
  { href: '/#strata-2', label: 'Strata II', code: '02', id: 'strata-2' },
  { href: '/#bedrock', label: 'Bedrock', code: '03', id: 'bedrock' },
  { href: '/#resurface', label: 'Contacto', code: '04', id: 'resurface' },
];

export function MobileMenuToggle({
  isDark = false,
  activeSection = null,
  profile = null,
  notificationBell = null,
}: MobileMenuToggleProps) {
  const { isOpen, isCategoriesOpen, toggleMenu, toggleCategories, closeMenu } =
    useMobileMenu();

  return (
    <div className="md:hidden">
      {/* Botón hamburguesa animado: dos líneas que giran en X */}
      <button
        type="button"
        className="relative w-10 h-10 flex flex-col items-center justify-center gap-[6px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8B2FE0] rounded-lg z-[2001]"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        <span
          className={`block h-[2px] w-6 rounded-full transition-all duration-300 ${
            isDark || isOpen ? 'bg-[#F2EDE4]' : 'bg-[#0D0A08]'
          } ${isOpen ? 'translate-y-[4px] rotate-45' : ''}`}
        />
        <span
          className={`block h-[2px] w-6 rounded-full transition-all duration-300 ${
            isDark || isOpen ? 'bg-[#F2EDE4]' : 'bg-[#0D0A08]'
          } ${isOpen ? '-translate-y-[4px] -rotate-45' : ''}`}
        />
      </button>

      {/* Overlay de cierre al tocar fuera del panel */}
      <div
        onClick={closeMenu}
        aria-hidden="true"
        style={{ top: 'var(--header-height, 88px)' }}
        className={`fixed inset-x-0 bottom-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 z-[1500] ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Panel del menú */}
      <div
        style={{ top: 'var(--header-height, 88px)' }}
        className={`fixed inset-x-0 bg-[#0D0A08]/98 border-b border-[#8B2FE0]/30 py-6 px-6 z-[2000] shadow-2xl backdrop-blur-md transition-all duration-300 ease-out ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-3 pointer-events-none'
        }`}
      >
        <nav>
          <ul className="flex flex-col gap-1 font-mono">
            {MOBILE_LINKS.map((link) => {
              const isActive = link.id ? activeSection === link.id : !activeSection;
              return (
                <li key={link.href} className="border-b border-white/5 last:border-none">
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 py-3.5 text-base uppercase tracking-wider transition-colors ${
                      isActive ? 'text-[#C084FC] font-black' : 'text-[#F2EDE4]/80 hover:text-white font-bold'
                    }`}
                  >
                    <span
                      className={`text-[11px] ${isActive ? 'text-[#8B2FE0]' : 'text-white/30'}`}
                    >
                      {link.code}
                    </span>
                    {link.label}
                  </Link>
                </li>
              );
            })}

            {/* Categorías con submenú desplegable independiente (Bug B) */}
            <li className="border-b border-white/5">
              <div className="flex items-center justify-between">
                <Link
                  href="/categorias"
                  onClick={closeMenu}
                  className="flex items-center gap-3 py-3.5 text-base uppercase tracking-wider font-bold text-[#F2EDE4]/80 hover:text-white transition-colors"
                >
                  <span className="text-[11px] text-white/30">&#9670;</span>
                  Categorías
                </Link>
                <button
                  type="button"
                  onClick={toggleCategories}
                  className="text-[#7ED957] p-3 focus:outline-none transition-transform duration-300"
                  style={{ transform: isCategoriesOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  aria-label="Desplegar submenú de categorías"
                  aria-expanded={isCategoriesOpen}
                >
                  &#9660;
                </button>
              </div>

              <div
                className={`grid transition-all duration-300 ease-out ${
                  isCategoriesOpen ? 'grid-rows-[1fr] opacity-100 mb-3' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col gap-1 bg-white/5 rounded-xl p-2">
                    <Link
                      href="/categorias#apps"
                      onClick={closeMenu}
                      className="px-3 py-2.5 text-sm text-[#7ED957] hover:bg-[#7ED957]/15 rounded-lg transition-colors"
                    >
                      &bull; Apps &amp; BioTech
                    </Link>
                    <Link
                      href="/categorias#animaciones"
                      onClick={closeMenu}
                      className="px-3 py-2.5 text-sm text-[#F2EDE4]/80 hover:bg-[#8B2FE0]/20 hover:text-[#C084FC] rounded-lg transition-colors"
                    >
                      &bull; Animaciones
                    </Link>
                    <Link
                      href="/categorias#visual-novel"
                      onClick={closeMenu}
                      className="px-3 py-2.5 text-sm text-[#F2EDE4]/80 hover:bg-[#8B2FE0]/20 hover:text-[#C084FC] rounded-lg transition-colors"
                    >
                      &bull; Visual Novels
                    </Link>
                    <Link
                      href="/categorias#games"
                      onClick={closeMenu}
                      className="px-3 py-2.5 text-sm text-[#F2EDE4]/80 hover:bg-[#8B2FE0]/20 hover:text-[#C084FC] rounded-lg transition-colors"
                    >
                      &bull; Games
                    </Link>
                  </div>
                </div>
              </div>
            </li>

            {/* Sin onClick={closeMenu}: si lo tuviera, abrir el dropdown de la
                campana cerraría el drawer entero en el mismo clic. */}
            {notificationBell && <li className="pt-4 flex justify-center">{notificationBell}</li>}

            <li className="pt-2" onClick={closeMenu}>
              <AccountButton profile={profile} className="w-full justify-center" />
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
