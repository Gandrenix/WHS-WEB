import Image from 'next/image';
import { Container } from '@/shared/ui/Container';

export function HeroEstrato() {
  return (
    <section
      id="superficie"
      className="min-h-[85vh] bg-[#F2EDE4] text-[#0D0A08] flex flex-col justify-center items-center relative pt-20 pb-16 border-b border-[#3A3532]/15"
    >
      <Container className="flex flex-col items-center text-center max-w-5xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#8B2FE0]/40 font-mono text-xs uppercase tracking-widest text-[#8B2FE0] mb-8 bg-white/70 shadow-sm font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8B2FE0] animate-pulse"></span>
          SISTEMA ESTRATO v1.0 &bull; WIENER HOUND STUDIOS
        </div>

        {/* Studio Main Title - 3D Projected Ground Shadow */}
        <h1
          data-text="Wiener Hound"
          className="estrato-3d-shadow font-mono text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase mb-3 leading-none select-none"
        >
          Wiener Hound
        </h1>
        <h2
          data-text="S T U D I O S"
          className="estrato-3d-shadow-purple font-mono text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-[0.25em] uppercase mb-8 select-none"
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
            src="/images/logo-playing.png"
            alt="Wiener Hound Dachshund Mascot"
            fill
            className="object-contain drop-shadow-md"
            priority
          />
        </div>

        {/* Scroll Indicator */}
        <div className="flex flex-col items-center gap-2 text-xs font-mono tracking-widest text-[#0D0A08]/70 uppercase font-bold animate-bounce">
          <span>DESCENDER POR ESTRATOS</span>
          <div className="w-[2px] h-10 bg-gradient-to-b from-[#8B2FE0] to-transparent"></div>
          <span className="text-sm">↓</span>
        </div>
      </Container>
    </section>
  );
}
