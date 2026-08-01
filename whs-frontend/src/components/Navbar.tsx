'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSubMenuOpen, setIsMobileSubMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    audioRef.current = new Audio('/audio/musica-fondo.mp3');
    audioRef.current.loop = true;
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsMobileSubMenuOpen(false);
  }, [pathname]); // eslint-disable-line react-hooks/set-state-in-effect

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) setIsMobileSubMenuOpen(false);
  };

  const toggleMobileSubMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMobileSubMenuOpen(!isMobileSubMenuOpen);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.log("Audio play failed:", err));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <header className="sticky top-0 z-[1000] bg-[#0a0a0b]/85 backdrop-blur-[16px] py-[15px] border-b border-white/5 transition-all duration-300">
      <div className="container-custom flex items-center justify-between">
        <Link href="/" onClick={toggleMusic} className="logo flex items-center group">
          <div className="relative w-[60px] h-[60px]">
            <Image 
              src={isPlaying ? "/images/logo-playing.png" : "/images/logo.png"} 
              alt="Wiener Hound Studios Logo" 
              fill
              className="object-contain transition-transform duration-400 group-hover:scale-105 group-hover:-rotate-2" 
            />
          </div>
          <span className="logo-text ml-[15px] text-[2rem] font-poppins font-extrabold text-[#f8fafc] tracking-[-0.05em] whitespace-nowrap">
            WH<span className="text-[#9d2ec5]">-</span>STUDIOS
          </span> 
        </Link>
        
        <div className="nav-wrapper flex items-center">
          <nav className="main-nav">
            {/* Desktop and Mobile Menu */}
            <ul className={`menu flex gap-[40px] items-center transition-all duration-300 ${isMenuOpen ? 'flex absolute top-[70px] left-0 w-full bg-[#121214]/98 border-b border-white/5 py-5 flex-col' : 'hidden md:flex'}`}>
              <li className="w-full md:w-auto text-center">
                <Link href="/" className="nav-link block py-2">Inicio</Link>
              </li>
              
              <li className="relative group w-full md:w-auto text-center">
                <Link 
                  href="/categorias" 
                  className="nav-link block py-2"
                  onClick={(e) => {
                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                      toggleMobileSubMenu(e);
                    }
                  }}
                >
                  Categorías {isMenuOpen && <span className="md:hidden text-xs ml-1">{isMobileSubMenuOpen ? '▲' : '▼'}</span>}
                </Link>
                {/* Dropdown - only visible on hover (desktop) */}
                <ul className="absolute top-[calc(100%+15px)] left-1/2 -translate-x-1/2 bg-[#121214] border border-white/5 p-2 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 translate-y-[10px] transition-all duration-300 hidden md:flex flex-col min-w-[200px] z-50">
                  <li><Link href="/categorias#manga" className="block px-6 py-3 text-[#94a3b8] hover:bg-[#9d2ec5]/10 hover:text-[#9d2ec5] rounded-lg transition-all">Manga</Link></li>
                  <li><Link href="/categorias#anime" className="block px-6 py-3 text-[#94a3b8] hover:bg-[#9d2ec5]/10 hover:text-[#9d2ec5] rounded-lg transition-all">Anime</Link></li>
                  <li><Link href="/categorias#visual-novel" className="block px-6 py-3 text-[#94a3b8] hover:bg-[#9d2ec5]/10 hover:text-[#9d2ec5] rounded-lg transition-all">Visual Novel</Link></li>
                </ul>
                
                {/* Mobile Dropdown (simplified) */}
                <div className={`${isMobileSubMenuOpen ? 'flex' : 'hidden'} md:hidden flex-col gap-2 mt-2 bg-white/5 p-4 rounded-lg mx-4`}>
                  <Link href="/categorias#manga" className="text-[#94a3b8] py-2 hover:text-[#9d2ec5]">Manga</Link>
                  <Link href="/categorias#anime" className="text-[#94a3b8] py-2 hover:text-[#9d2ec5]">Anime</Link>
                  <Link href="/categorias#visual-novel" className="text-[#94a3b8] py-2 hover:text-[#9d2ec5]">Visual Novel</Link>
                </div>
              </li>

              <li className="w-full md:w-auto text-center">
                <Link href="/#portafolio" className="nav-link block py-2">Portafolio</Link>
              </li>
              <li className="w-full md:w-auto text-center">
                <Link href="/#sobre-nosotros" className="nav-link block py-2">Nosotros</Link>
              </li>
              <li className="w-full md:w-auto text-center">
                <Link href="/#contacto" className="nav-link block py-2">Contacto</Link>
              </li>
            </ul>
          </nav>
          <button 
            className="md:hidden bg-transparent border-none text-[#f8fafc] text-[1.8rem] cursor-pointer ml-5 p-2" 
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            ☰
          </button>
        </div>
      </div>

      <style jsx>{`
        .nav-link {
          color: #94a3b8;
          font-weight: 500;
          font-size: 1.05rem;
          padding: 8px 0;
          position: relative;
          transition: color 0.3s ease;
        }
        .nav-link:hover {
          color: #f8fafc;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background: #00e68a;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .nav-link:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }
      `}</style>
    </header>
  );
}
