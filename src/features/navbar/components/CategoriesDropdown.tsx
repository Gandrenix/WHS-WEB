import Link from 'next/link';

export function CategoriesDropdown() {
  return (
    <li className="relative group/cat w-full md:w-auto text-center focus-within:outline-none">
      <Link
        href="/categorias"
        className="nav-link block py-2 text-[#0D0A08] hover:text-[#8B2FE0] font-bold transition-colors"
      >
        Categorías
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
            href="/categorias#manga"
            className="block px-5 py-3 font-mono text-xs font-bold text-[#F2EDE4] hover:bg-[#8B2FE0]/25 hover:text-[#C084FC] rounded-lg transition-all text-left"
          >
            &bull; Manga
          </Link>
        </li>
        <li>
          <Link
            href="/categorias#anime"
            className="block px-5 py-3 font-mono text-xs font-bold text-[#F2EDE4] hover:bg-[#8B2FE0]/25 hover:text-[#C084FC] rounded-lg transition-all text-left"
          >
            &bull; Anime
          </Link>
        </li>
        <li>
          <Link
            href="/categorias#visual-novel"
            className="block px-5 py-3 font-mono text-xs font-bold text-[#F2EDE4] hover:bg-[#8B2FE0]/25 hover:text-[#C084FC] rounded-lg transition-all text-left"
          >
            &bull; Visual Novel
          </Link>
        </li>
      </ul>
    </li>
  );
}
