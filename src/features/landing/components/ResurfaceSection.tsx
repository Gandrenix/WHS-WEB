'use client';

import Image from 'next/image';

export function ResurfaceSection() {
  const showLegalModal = (title: string) => {
    alert(`${title}: Próximamente la versión completa del documento legal de Wiener Hound Studios.`);
  };

  return (
    <footer
      id="resurface"
      className="py-20 bg-[#F2EDE4] text-[#0D0A08] border-t border-[#3A3532]/20 font-sans relative"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center pb-12 border-b border-[#3A3532]/20">
          {/* Column 1: Lab Coat Mascot & Tagline */}
          <div className="md:col-span-4 flex flex-col items-start gap-4">
            <div className="flex items-center gap-3 font-mono text-xs text-[#8B2FE0] font-bold">
              <span className="px-2 py-0.5 bg-[#8B2FE0] text-white rounded">05</span>
              <span className="uppercase tracking-widest text-[#0D0A08] font-bold">RESURFACED</span>
            </div>
            <div className="relative w-36 h-36">
              <Image
                src="/images/logo-playing.png"
                alt="Wiener Hound Lab Coat Mascot"
                fill
                className="object-contain"
              />
            </div>
            <p className="font-fraunces italic text-xl font-semibold text-[#0D0A08]">
              &ldquo;Siempre volvemos a la luz.&rdquo;
            </p>
          </div>

          {/* Column 2: Contact Info */}
          <div className="md:col-span-4 space-y-3 font-mono text-sm">
            <h3 className="font-bold text-[#0D0A08] uppercase tracking-wider mb-2 text-base">CONTACTO</h3>
            <p className="text-[#0D0A08] font-bold">wienerhoundstudios@gmail.com</p>
            <p className="text-[#2B1B14] font-medium">Bucaramanga, Colombia [ UTC-05:00 ]</p>
            <a
              href="mailto:wienerhoundstudios@gmail.com"
              className="inline-block mt-3 px-4 py-2 rounded-lg bg-[#8B2FE0] text-white font-bold hover:bg-[#8B2FE0]/90 transition-all shadow-sm"
            >
              HABLEMOS DE TU PROYECTO &rarr;
            </a>
          </div>

          {/* Column 3: Social & Signature */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="font-mono text-base font-bold text-[#0D0A08] uppercase tracking-wider">
              ENCUÉNTRANOS
            </h3>
            <div className="flex flex-wrap gap-4 font-mono text-xs md:text-sm font-bold text-[#0D0A08]">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#8B2FE0] transition-colors underline underline-offset-4 decoration-[#8B2FE0]/40"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#8B2FE0] transition-colors underline underline-offset-4 decoration-[#8B2FE0]/40"
              >
                LinkedIn
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#8B2FE0] transition-colors underline underline-offset-4 decoration-[#8B2FE0]/40"
              >
                YouTube
              </a>
              <a
                href="https://soundcloud.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#8B2FE0] transition-colors underline underline-offset-4 decoration-[#8B2FE0]/40"
              >
                SoundCloud
              </a>
              <a
                href="https://itch.io"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#8B2FE0] transition-colors underline underline-offset-4 decoration-[#8B2FE0]/40"
              >
                Itch.io
              </a>
            </div>

            {/* Signature */}
            <div className="pt-4 border-t border-[#3A3532]/20 font-fraunces text-2xl italic font-bold text-[#8B2FE0]">
              Wiener Hound
              <span className="block font-mono text-xs not-italic text-[#0D0A08] font-bold tracking-widest mt-1">
                EST. 2024
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright & Legal buttons */}
        <div className="pt-6 flex flex-wrap justify-between items-center text-xs font-mono font-bold text-[#0D0A08] uppercase tracking-wider gap-4">
          <div>&copy; 2026 Wiener Hound Studios. Todos los derechos excavados.</div>
          
          {/* Legal Privacy & Terms buttons */}
          <div className="flex gap-6 items-center">
            <button
              onClick={() => showLegalModal('Política de Privacidad')}
              className="text-[#0D0A08] hover:text-[#8B2FE0] transition-colors cursor-pointer bg-transparent border-none p-0 font-mono text-xs font-bold uppercase"
            >
              Política de Privacidad
            </button>
            <span className="text-[#3A3532]/40">•</span>
            <button
              onClick={() => showLegalModal('Términos de Servicio')}
              className="text-[#0D0A08] hover:text-[#8B2FE0] transition-colors cursor-pointer bg-transparent border-none p-0 font-mono text-xs font-bold uppercase"
            >
              Términos de Servicio
            </button>
          </div>

          <div className="text-[#8B2FE0]">EXCAVAMOS EN TODOS LOS ESTRATOS 🐾</div>
        </div>
      </div>
    </footer>
  );
}
