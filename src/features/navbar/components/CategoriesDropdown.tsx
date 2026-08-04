import Link from 'next/link';

export function CategoriesDropdown({
  isDark = false,
  isActive = false,
}: {
  isDark?: boolean;
  isActive?: boolean;
}) {
  const linkStyles = isDark
    ? 'text-[#F2EDE4] hover:text-[#C084FC]'
    : 'text-[#0D0A08] hover:text-[#8B2FE0]';

  return (
    <li className="relative group/cat w-full md:w-auto text-center focus-within:outline-none">
      <Link
        href="/categorias"
        className={`nav-link group relative inline-flex items-center gap-1.5 py-1 transition-colors ${linkStyles}`}
      >
        <span
          className={`font-mono text-[10px] transition-opacity ${
            isActive ? 'opacity-100 text-[#8B2FE0]' : 'opacity-40 group-hover:opacity-70'
          }`}
        >
          &#9670;
        </span>
        {/* Peso fijo (ver Navbar.tsx NavItem): alternar bold/black según isActive
            cambia el ancho del texto y empuja al resto del nav de posición. */}
        <span className="font-black">Categorías</span>
        <span
          className={`pointer-events-none absolute left-0 -bottom-1.5 h-[2px] w-full origin-left bg-gradient-to-r from-[#8B2FE0] to-[#7ED957] transition-transform duration-300 ${
            isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
          }`}
        />
      </Link>
      {/* Dropdown escritorio en fondo oscuro #0D0A08 de alto contraste */}
      <ul className="absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 bg-[#0D0A08] border border-white/20 p-2 rounded-xl shadow-2xl opacity-0 invisible group-hover/cat:opacity-100 group-hover/cat:visible group-hover/cat:translate-y-0 focus-within:opacity-100 focus-within:visible focus-within:translate-y-0 translate-y-[10px] transition-all duration-300 hidden md:flex flex-col min-w-[220px] z-[100]">
        <li>
          <Link
            href="/categorias#apps"
            className="block px-5 py-3 font-mono text-xs font-bold text-[#7ED957] hover:bg-[#7ED957]/20 rounded-lg transition-all text-left"
          >
            &bull; Apps &amp; BioTech
          </Link>
        </li>
        <li>
          <Link
            href="/categorias#animaciones"
            className="block px-5 py-3 font-mono text-xs font-bold text-[#F2EDE4] hover:bg-[#8B2FE0]/25 hover:text-[#C084FC] rounded-lg transition-all text-left"
          >
            &bull; Animaciones
          </Link>
        </li>
        <li>
          <Link
            href="/categorias#visual-novel"
            className="block px-5 py-3 font-mono text-xs font-bold text-[#F2EDE4] hover:bg-[#8B2FE0]/25 hover:text-[#C084FC] rounded-lg transition-all text-left"
          >
            &bull; Visual Novels
          </Link>
        </li>
        <li>
          <Link
            href="/categorias#games"
            className="block px-5 py-3 font-mono text-xs font-bold text-[#F2EDE4] hover:bg-[#8B2FE0]/25 hover:text-[#C084FC] rounded-lg transition-all text-left"
          >
            &bull; Games
          </Link>
        </li>
      </ul>
    </li>
  );
}
