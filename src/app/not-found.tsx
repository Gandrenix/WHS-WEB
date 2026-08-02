import Link from 'next/link';
import { DarkGradientBg, RollingCube404 } from '@/shared';
import { Home, Layers } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <DarkGradientBg
      showStars
      starCount={240}
      starSpeed={0.8}
      accentColor="#7ED957"
      className="min-h-screen w-full font-mono text-[#F2EDE4] text-center"
    >
      <div className="w-full min-h-screen flex flex-col justify-center items-center py-10 px-4 overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
          {/* Badge Status */}
          <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-[#8B2FE0]/30 text-[#C084FC] text-xs sm:text-sm font-bold uppercase tracking-widest mb-4 border border-[#8B2FE0]/60 shadow-xl backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7ED957] animate-ping" />
            ERROR 404 &bull; ESTRATO INEXISTENTE O INACCESIBLE
          </div>

          {/* 3D Rolling Cube & Stamp Rail Animation - Full Width */}
          <div className="w-full my-2">
            <RollingCube404 />
          </div>

          {/* Informative Messages */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase text-white tracking-tight mb-4 drop-shadow-lg">
            Especimen No Encontrado
          </h1>

          <p className="font-sans text-base sm:text-xl text-[#F2EDE4]/90 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            El estrato o documento al que intentas acceder ha sido reubicado, archivado o no existe en la base de datos de publicaciones de Wiener Hound Studios.
          </p>

          {/* Navigation Actions */}
          <div className="flex flex-wrap justify-center gap-5">
            <Link
              href="/categorias"
              className="bg-[#8B2FE0] hover:bg-[#C084FC] text-white font-bold px-10 py-4 rounded-2xl text-xs sm:text-sm uppercase tracking-widest transition-all shadow-2xl flex items-center gap-2.5 cursor-pointer hover:scale-105"
            >
              <Layers className="w-5 h-5" /> EXPLORAR CATÁLOGO
            </Link>
            <Link
              href="/"
              className="bg-black/80 hover:bg-black text-[#F2EDE4] border border-white/20 hover:border-white/40 font-bold px-10 py-4 rounded-2xl text-xs sm:text-sm uppercase tracking-widest transition-all shadow-xl flex items-center gap-2.5 cursor-pointer hover:scale-105"
            >
              <Home className="w-5 h-5" /> REGRESAR A LA SUPERFICIE
            </Link>
          </div>
        </div>
      </div>
    </DarkGradientBg>
  );
}

