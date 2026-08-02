'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogoAudioPlayer } from './LogoAudioPlayer';
import { CategoriesDropdown } from './CategoriesDropdown';
import { MobileMenuToggle } from './MobileMenuToggle';

export function Navbar() {
  const pathname = usePathname();
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  return (
    <header
      className={`sticky top-0 z-[80] backdrop-blur-md py-3.5 border-b transition-all duration-300 ${headerStyles}`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <LogoAudioPlayer isDark={isCategoriesRoute} />

        <div className="nav-wrapper flex items-center">
          <nav className="main-nav hidden md:block font-mono text-xs uppercase tracking-wider">
            <ul className="flex gap-8 items-center font-bold">
              <li>
                <Link href="/" className={`py-1 transition-colors ${textStyles}`}>
                  Inicio
                </Link>
              </li>

              <CategoriesDropdown isDark={isCategoriesRoute} />

              <li>
                <Link href="/#strata-1" className={`py-1 transition-colors ${textStyles}`}>
                  Strata I
                </Link>
              </li>
              <li>
                <Link href="/#strata-2" className={`py-1 transition-colors ${textStyles}`}>
                  Strata II
                </Link>
              </li>
              <li>
                <Link href="/#bedrock" className={`py-1 transition-colors ${textStyles}`}>
                  Bedrock
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="px-4 py-2 rounded-lg bg-[#8B2FE0] text-white font-bold hover:bg-[#8B2FE0]/90 transition-all shadow-sm"
                >
                  Admin
                </Link>
              </li>
            </ul>
          </nav>

          <MobileMenuToggle isDark={isCategoriesRoute} />
        </div>
      </div>
    </header>
  );
}
