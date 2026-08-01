# Wiener Hound Studios (WHS) - Frontend Summary & Analysis

## 1. Development Environment
- **IDE:** Visual Studio Code (VS Code)
- **Framework:** Next.js 16.2.4 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4.0
- **Database/Auth:** Supabase
- **Animations:** GSAP (GreenSock Animation Platform)

---

## 2. Project Overview
The `whs-frontend` folder contains a modern web application built for **Wiener Hound Studios**. It transitions the previous static HTML site into a dynamic, full-stack application. Key features include:
- **Dynamic Portafolio:** Projects are fetched directly from a Supabase database.
- **Admin Dashboard:** A secure area to manage (Add/Edit) projects without touching code.
- **Supabase Integration:** Real-time data and secure authentication for admins.
- **Premium Aesthetics:** Dark theme with neon accents, glassmorphism, and smooth scroll animations.

---

## 3. Folder Structure & File Summaries

### Root Configuration
- **`package.json`**: Defines dependencies (Next.js 16, React 19, Supabase, GSAP) and scripts.
- **`tsconfig.json`**: TypeScript configuration with path aliases (e.g., `@/*`).
- **`next.config.ts`**: Next.js configuration (currently default).
- **`postcss.config.mjs`**: Configuration for PostCSS, enabling Tailwind 4.
- **`.env.local`**: (Private) Contains Supabase credentials (`URL` and `ANON_KEY`).
- **`AGENTS.md`**: Specialized instructions for AI agents, noting that this is a modified version of Next.js.

### Source Code (`/src`)
#### `app/` (Routes & Layouts)
- **`layout.tsx`**: The root layout. Sets up fonts (Inter, Poppins), global styles, and persistent components like `<Navbar />` and `<Footer />`.
- **`page.tsx`**: The main landing page (Server Component). Fetches the 6 most recent projects and passes them to `HomeClient`.
- **`HomeClient.tsx`**: The client-side logic for the landing page. Handles GSAP animations (Hero and Scroll) and renders the UI sections (Services, Reel, Portfolio, Team, Contact).
- **`globals.css`**: Global styles, Tailwind directives, CSS variables for the color palette, and base button styles.
- **`middleware.ts`**: Protects the `/admin/dashboard` route. Redirects unauthenticated users to the login page.
- **`categorias/`**: Contains `page.tsx` (Server) and `CategoriasClient.tsx` (Client) to display projects filtered by type (Manga, Anime, Visual Novel).
- **`admin/`**: Contains the login page and the protected dashboard for managing projects.
- **`auth/signout/`**: Route handler for signing out users.

#### `components/` (Reusable UI)
- **`Navbar.tsx`**: Navigation bar with a mobile menu and an Easter egg audio player on the logo.
- **`Footer.tsx`**: Standard footer with links to privacy and terms.

#### `lib/` & `utils/` (Infrastructure)
- **`supabase.ts`**: Basic Supabase client initialization.
- **`utils/supabase/`**: Next.js-specific Supabase helpers for Server Components, Client Components, and Middleware session management.

---

## 4. Current Issues & Bugs

### A. Mobile Menu (Navbar)
- **Menu Icon Issue:** The "Hamburger" button (`☰`) is present but reportedly "doesn't deploy." Analysis shows the `hidden` class might not be correctly overridden by the dynamic `block` class due to Tailwind 4's specific cascade or z-index conflicts with the sticky header.
- **Centering:** The menu items on mobile use `items-center` but may not be perfectly centered within the absolute container if there are padding/margin imbalances.
- **Mobile Sub-menu Bug:** The "Categorías" sub-menu on mobile is set to `flex` whenever the main menu is open, meaning it's always expanded instead of togglable.

### B. Visual/Design Troubles
- **Centering:** Some sections in the `HomeClient` may have alignment issues on smaller screens.
- **Glitches:** The use of `backdrop-blur` on the mobile menu can cause performance or rendering glitches on certain browsers.
- **Responsiveness:** The `Hero` text size (`text-[4.5rem]`) is very large and likely breaks on small mobile devices without proper media query overrides.

---

## 5. Full Code of Core Files

### `whs-frontend/src/app/layout.tsx`
```tsx
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ 
  weight: ['300', '400', '600', '700', '800'],
  subsets: ['latin'], 
  variable: '--font-poppins' 
});

export const metadata: Metadata = {
  title: 'Wiener Hound Studios',
  description: 'Transformando ideas en experiencias inmersivas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable} scroll-smooth`}>
      <body className="bg-[#0a0a0b] text-[#f8fafc] font-inter overflow-x-hidden antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

### `whs-frontend/src/components/Navbar.tsx`
```tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/audio/musica-fondo.mp3');
  }, []);

  const toggleMusic = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <header className="sticky top-0 z-[1000] bg-[#0a0a0b]/85 backdrop-blur-[16px] py-[15px] border-b border-white/5 transition-all duration-300">
      <div className="container mx-auto px-5 flex items-center justify-between max-w-[1200px]">
        <Link href="/" onClick={toggleMusic} className="logo flex items-center group">
          <Image 
            src={isPlaying ? "/images/logo-playing.png" : "/images/logo.png"} 
            alt="Wiener Hound Studios Logo" 
            width={60} 
            height={60} 
            className="mr-[15px] transition-transform duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)] group-hover:scale-105 group-hover:-rotate-2" 
          />
          <span className="logo-text text-2xl font-poppins font-extrabold text-[#f8fafc] tracking-[-0.05em] whitespace-nowrap transition-colors duration-300">
            WH<span className="text-[#9d2ec5]">-</span>STUDIOS
          </span> 
        </Link>
        
        <div className="nav-wrapper flex items-center">
          <nav className={`main-nav md:block ${isMenuOpen ? 'block absolute top-full left-0 w-full bg-[#121214]/95 backdrop-blur-[10px] border-b border-white/5 py-5 z-50' : 'hidden'}`}>
            <ul className={`menu flex md:flex-row flex-col gap-10 md:gap-[40px] ${isMenuOpen ? 'items-center' : ''}`}>
              <li className="text-center"><Link href="/" onClick={() => setIsMenuOpen(false)} className="text-[#94a3b8] font-medium text-[1.05rem] py-2 relative transition-colors duration-300 hover:text-white after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-[#00e68a] after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left after:transition-transform after:duration-400 after:ease-[cubic-bezier(0.25,0.8,0.25,1)]">Inicio</Link></li>
              
              <li className="submenu relative text-center group">
                <div className="flex items-center justify-center gap-1 text-[#94a3b8] font-medium text-[1.05rem] py-2 transition-colors duration-300 hover:text-white cursor-default">
                  <span>Categorías</span>
                  <svg className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                <div className="hidden md:block absolute top-full left-1/2 -translate-x-1/2 pt-4 min-w-[200px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50">
                  <ul className="flex flex-col bg-[#121214] border border-white/10 p-2 rounded-xl shadow-2xl relative before:content-[''] before:absolute before:-top-2 before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-b-[#121214]">
                    <li><Link href="/categorias#manga" className="block px-4 py-3 text-[#94a3b8] font-medium text-sm text-left hover:bg-white/10 hover:text-white rounded-lg transition-colors">Manga</Link></li>
                    <li><Link href="/categorias#anime" className="block px-4 py-3 text-[#94a3b8] font-medium text-sm text-left hover:bg-white/10 hover:text-white rounded-lg transition-colors">Anime</Link></li>
                    <li><Link href="/categorias#visual-novel" className="block px-4 py-3 text-[#94a3b8] font-medium text-sm text-left hover:bg-white/10 hover:text-white rounded-lg transition-colors">Visual Novel</Link></li>
                  </ul>
                </div>

                <ul className={`md:hidden flex-col mt-2 bg-black/20 rounded-lg p-2 ${isMenuOpen ? 'flex' : 'hidden'}`}>
                  <li><Link href="/categorias#manga" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-[#94a3b8] hover:text-white text-[1.05rem]">Manga</Link></li>
                  <li><Link href="/categorias#anime" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-[#94a3b8] hover:text-white text-[1.05rem]">Anime</Link></li>
                  <li><Link href="/categorias#visual-novel" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-[#94a3b8] hover:text-white text-[1.05rem]">Visual Novel</Link></li>
                </ul>
              </li>

              <li className="text-center"><Link href="/#portafolio" onClick={() => setIsMenuOpen(false)} className="text-[#94a3b8] font-medium text-[1.05rem] py-2 relative transition-colors duration-300 hover:text-white after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-[#00e68a] after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left after:transition-transform after:duration-400 after:ease-[cubic-bezier(0.25,0.8,0.25,1)]">Portafolio</Link></li>
              <li className="text-center"><Link href="/#sobre-nosotros" onClick={() => setIsMenuOpen(false)} className="text-[#94a3b8] font-medium text-[1.05rem] py-2 relative transition-colors duration-300 hover:text-white after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-[#00e68a] after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left after:transition-transform after:duration-400 after:ease-[cubic-bezier(0.25,0.8,0.25,1)]">Sobre nosotros</Link></li>
              <li className="text-center"><Link href="/#contacto" onClick={() => setIsMenuOpen(false)} className="text-[#94a3b8] font-medium text-[1.05rem] py-2 relative transition-colors duration-300 hover:text-white after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-[#00e68a] after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left after:transition-transform after:duration-400 after:ease-[cubic-bezier(0.25,0.8,0.25,1)]">Contacto</Link></li>
            </ul>
          </nav>
          <button 
            className="md:hidden bg-transparent border-none text-[#f8fafc] text-[1.8rem] cursor-pointer z-[1001]" 
            aria-label="Abrir menú"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
```

### `whs-frontend/src/app/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-color: #9d2ec5;
  --secondary-color: #00e68a;
  --accent-color: #5b21b6;
  --bg-dark-primary: #0a0a0b;
  --bg-dark-secondary: #121214;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-on-accent: #ffffff;
}

body {
  font-family: var(--font-inter), sans-serif;
  background: var(--bg-dark-primary);
  color: var(--text-primary);
  line-height: 1.6;
  overflow-x: hidden;
}

/* Base Headings */
h1, h2, h3, h4 {
  font-family: var(--font-poppins), sans-serif;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

/* Global Buttons */
.btn-primary {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 12px 28px;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  color: var(--text-on-accent);
  border-radius: 30px;
  font-weight: 600;
  font-family: var(--font-poppins), sans-serif;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 8px 25px rgba(157, 46, 197, 0.15);
  border: none;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(157, 46, 197, 0.3);
  background: linear-gradient(135deg, var(--accent-color), var(--primary-color));
}

.btn-secondary {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 12px 28px;
  background-color: transparent;
  color: var(--secondary-color);
  border: 2px solid var(--secondary-color);
  border-radius: 30px;
  font-weight: 600;
  font-family: var(--font-poppins), sans-serif;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: var(--secondary-color);
  color: var(--bg-dark-primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 230, 138, 0.15);
}

/* GSAP fade-up utility */
.fade-up {
  opacity: 0;
  transform: translateY(30px);
}
```

### `whs-frontend/src/app/HomeClient.tsx`
```tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  image_url: string | null;
}

export default function HomeClient({ recentProjects }: { recentProjects: Project[] }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Animations
    gsap.fromTo(".hero h1", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" });
    gsap.fromTo(".hero p", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: "power3.out" });
    gsap.fromTo(".hero .btn-primary", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, delay: 0.4, ease: "back.out(1.7)" });
    gsap.fromTo(".hero .btn-secondary", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, delay: 0.5, ease: "back.out(1.7)" });

    // Scroll Animations
    gsap.utils.toArray('.fade-up').forEach((section: any) => {
      gsap.fromTo(section, 
        { opacity: 0, y: 50 }, 
        {
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
          },
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: "power2.out"
        }
      );
    });
  }, []);

  return (
    <main>
      <section className="hero relative text-center pt-[160px] pb-[160px] px-5 bg-cover bg-center bg-fixed overflow-hidden bg-[image:linear-gradient(to_bottom,rgba(10,10,11,0.3),#0a0a0b),url('/images/hero-background.jpg')]" id="inicio">
        <div className="container mx-auto relative z-[2] max-w-[1200px]">
          <h1 className="text-[4.5rem] leading-[1.1] mb-6 text-[#f8fafc] font-poppins font-bold tracking-tight">
            Transformando ideas en<br /> <span className="text-[#00e68a]">experiencias inmersivas</span>
            <span className="block w-[120px] h-1 bg-gradient-to-r from-[#9d2ec5] to-[#00e68a] mx-auto mt-[30px] rounded-[2px]"></span>
          </h1>
          <p className="text-xl mx-auto mb-[50px] max-w-[700px] text-[#94a3b8]">
            Skill lies not in what you’re taught, but in what you make real. If you can dream it, you can breathe life into it.
          </p>
          
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/categorias" className="btn-primary">Explorar Proyectos</Link>
            <Link href="#sobre-nosotros" className="btn-secondary">Conocer Más</Link>
          </div>
        </div>
      </section>

      {/* ... Other sections omitted for brevity in this view, full content in file ... */}
    </main>
  );
}
```

---

## 6. Conclusion
The foundation of the **Wiener Hound Studios** frontend is solid, utilizing high-end technologies like **Next.js 16**, **Tailwind 4**, and **Supabase**. However, the reported bugs with the mobile menu and centering must be addressed to achieve the "premium studio" look intended. The core logic for data fetching and administration is functional, but the UI layer needs surgical fixes.

**Recommendation:** Fix the `Navbar.tsx` logic to ensure the mobile menu triggers correctly and refine the CSS media queries in `globals.css` for better mobile responsiveness.
