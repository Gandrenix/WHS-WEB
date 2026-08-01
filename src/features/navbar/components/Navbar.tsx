import Link from 'next/link';
import { LogoAudioPlayer } from './LogoAudioPlayer';
import { CategoriesDropdown } from './CategoriesDropdown';
import { MobileMenuToggle } from './MobileMenuToggle';

export function Navbar() {
  return (
    <header className="sticky top-0 z-[80] bg-[#F2EDE4]/95 backdrop-blur-md py-3.5 border-b border-[#3A3532]/15 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <LogoAudioPlayer />

        <div className="nav-wrapper flex items-center">
          <nav className="main-nav hidden md:block font-mono text-xs uppercase tracking-wider">
            <ul className="flex gap-8 items-center font-bold">
              <li>
                <Link
                  href="/"
                  className="py-1 text-[#0D0A08] hover:text-[#8B2FE0] transition-colors"
                >
                  Inicio
                </Link>
              </li>

              <CategoriesDropdown />

              <li>
                <Link
                  href="/#strata-1"
                  className="py-1 text-[#0D0A08] hover:text-[#8B2FE0] transition-colors"
                >
                  Strata I
                </Link>
              </li>
              <li>
                <Link
                  href="/#strata-2"
                  className="py-1 text-[#0D0A08] hover:text-[#8B2FE0] transition-colors"
                >
                  Strata II
                </Link>
              </li>
              <li>
                <Link
                  href="/#bedrock"
                  className="py-1 text-[#0D0A08] hover:text-[#8B2FE0] transition-colors"
                >
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

          <MobileMenuToggle />
        </div>
      </div>
    </header>
  );
}
