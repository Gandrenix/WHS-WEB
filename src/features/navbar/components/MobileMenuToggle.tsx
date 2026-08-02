'use client';
// Client: isla pequeña para el botón hamburguesa y el panel móvil condicional (Fix Bugs A y B)

import Link from 'next/link';
import { useMobileMenu } from '../hooks/useMobileMenu';

export function MobileMenuToggle({ isDark = false }: { isDark?: boolean }) {
  const { isOpen, isCategoriesOpen, toggleMenu, toggleCategories, closeMenu } =
    useMobileMenu();

  return (
    <div className="md:hidden">
      <button
        type="button"
        className={`bg-transparent border-none text-[1.8rem] cursor-pointer p-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg transition-colors ${
          isDark ? 'text-white' : 'text-text-primary'
        }`}
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Renderizado condicional JSX para eliminar bugs de apilamiento CSS (Bug A) */}
      {isOpen && (
        <div className="fixed inset-x-0 top-[88px] bg-bg-dark-secondary/95 border-b border-white/5 py-6 px-6 z-[2000] shadow-2xl backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-md">
          <nav>
            <ul className="flex flex-col gap-4 text-center">
              <li>
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="block py-2 text-lg text-text-secondary hover:text-text-primary font-medium"
                >
                  Inicio
                </Link>
              </li>

              <li className="border-y border-white/5 py-2">
                <div className="flex items-center justify-between px-2">
                  <Link
                    href="/categorias"
                    onClick={closeMenu}
                    className="text-lg text-text-secondary hover:text-text-primary font-medium"
                  >
                    Categorías
                  </Link>
                  <button
                    type="button"
                    onClick={toggleCategories}
                    className="text-sm text-secondary p-2 focus:outline-none"
                    aria-label="Desplegar submenú de categorías"
                  >
                    {isCategoriesOpen ? '▲' : '▼'}
                  </button>
                </div>

                {/* Submenú de categorías con estado independiente (Bug B) */}
                {isCategoriesOpen && (
                  <div className="flex flex-col gap-2 mt-3 bg-white/5 p-4 rounded-xl text-left">
                    <Link
                      href="/categorias#manga"
                      onClick={closeMenu}
                      className="text-text-secondary py-1 hover:text-primary transition-colors"
                    >
                      Manga
                    </Link>
                    <Link
                      href="/categorias#anime"
                      onClick={closeMenu}
                      className="text-text-secondary py-1 hover:text-primary transition-colors"
                    >
                      Anime
                    </Link>
                    <Link
                      href="/categorias#visual-novel"
                      onClick={closeMenu}
                      className="text-text-secondary py-1 hover:text-primary transition-colors"
                    >
                      Visual Novel
                    </Link>
                  </div>
                )}
              </li>

              <li>
                <Link
                  href="/#portafolio"
                  onClick={closeMenu}
                  className="block py-2 text-lg text-text-secondary hover:text-text-primary font-medium"
                >
                  Portafolio
                </Link>
              </li>
              <li>
                <Link
                  href="/#sobre-nosotros"
                  onClick={closeMenu}
                  className="block py-2 text-lg text-text-secondary hover:text-text-primary font-medium"
                >
                  Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/#contacto"
                  onClick={closeMenu}
                  className="block py-2 text-lg text-text-secondary hover:text-text-primary font-medium"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
