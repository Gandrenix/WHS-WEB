import Image from 'next/image';
import { ArrowDown } from 'lucide-react';
import logoPlayingImg from '@/shared/assets/logo-playing.png';
import { Container } from '@/shared/ui/Container';
import { HeroParallaxBackground } from './HeroParallaxBackground';

export function HeroEstrato() {
  return (
    <section
      id="superficie"
      className="min-h-[85vh] bg-[#F2EDE4] text-[#0D0A08] flex flex-col justify-center items-center relative pt-20 pb-16"
    >
      <HeroParallaxBackground />
      <Container className="relative flex flex-col items-center text-center max-w-5xl">
        {/* Studio Main Title - 3D Projected Ground Shadow */}
        <h1
          data-text="Wiener Hound"
          className="estrato-3d-shadow font-mono text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase mb-3 leading-none select-none"
        >
          Wiener Hound
        </h1>
        <h2
          data-text="S T U D I O S"
          className="estrato-3d-shadow-purple font-mono text-xl min-[380px]:text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-[0.25em] uppercase mb-8 select-none"
        >
          S T U D I O S
        </h2>

        {/* Tagline */}
        <p className="font-fraunces text-xl sm:text-2xl md:text-3xl italic font-normal text-[#2B1B14] max-w-3xl mb-10 leading-snug">
          &ldquo;Todo lo que hacemos empieza <span className="text-[#8B2FE0] font-semibold not-italic underline decoration-[#8B2FE0]/40 underline-offset-8">excavando</span>.&rdquo;
        </p>

        <p className="font-mono text-xs sm:text-sm text-[#3A3532]/80 max-w-xl mb-10 uppercase tracking-wider font-medium">
          Atelier de bioinformática &bull; ingeniería creativa &bull; experiencias narrativas
        </p>

        {/* Dachshund Mascot Image */}
        <div className="relative w-48 h-32 md:w-60 md:h-40 mb-10 transform hover:scale-105 transition-transform duration-300">
          <Image
            src={logoPlayingImg}
            alt="Wiener Hound Dachshund Mascot"
            fill
            sizes="(min-width: 768px) 240px, 192px"
            className="object-contain drop-shadow-md"
            preload
          />
        </div>

        {/* Scroll Indicator */}
        {/* Va sobre los estratos oscuros del fondo del Hero, así que es claro: antes era
            texto oscuro y desapareció al oscurecer el fondo. */}
        <div className="flex flex-col items-center gap-2 text-xs font-mono tracking-widest text-[#F2EDE4] uppercase font-bold animate-bounce drop-shadow-[0_1px_8px_rgba(13,10,8,0.95)]">
          <span>DESCENDER POR ESTRATOS</span>
          <div className="w-[2px] h-10 bg-gradient-to-b from-[#C084FC] to-transparent"></div>
          <ArrowDown size={20} strokeWidth={2.75} className="text-[#C084FC]" aria-hidden="true" />
        </div>
      </Container>
    </section>
  );
}
