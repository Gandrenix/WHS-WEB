import type { Metadata } from 'next';
import Image from 'next/image';
import logoPlayingImg from '@/shared/assets/logo-playing.png';
import { AuthForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Login — Wiener Hound Studios',
  description: 'Inicia sesión o crea tu cuenta para guardar tu progreso de lectura y tus obras favoritas.',
};

const DEPTH_MARKERS = [
  // SUPERFICIE se posiciona sobre la banda clara (#F2EDE4): necesita texto
  // oscuro, no el text-white/70 que usan las demás (sobre bandas oscuras).
  { code: '00', name: 'SUPERFICIE', color: '#F2EDE4', labelClass: 'text-[#0D0A08]/70' },
  { code: '01', name: 'STRATA I', color: '#8B2FE0', labelClass: 'text-white/70' },
  { code: '02', name: 'STRATA II', color: '#C084FC', labelClass: 'text-white/70' },
  { code: '03', name: 'BEDROCK', color: '#7ED957', labelClass: 'text-white/70' },
];

export interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-[#0D0A08] text-[#F2EDE4] flex items-stretch font-mono">
      {/* Panel izquierdo: identidad de marca — corte geológico ESTRATO */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-white/10">
        {/* Bandas geológicas (corte transversal de estratos) */}
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 bg-[#F2EDE4] relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#8B2FE0]/10" />
          </div>
          <div className="flex-[1.4] bg-[#2B1B14] relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,47,224,0.35),transparent_60%)]" />
          </div>
          <div className="flex-[1.4] bg-[#1A120E] relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(192,132,252,0.25),transparent_55%)]" />
          </div>
          <div className="flex-[1.6] bg-[#0D0A08] relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,rgba(126,217,87,0.2),transparent_60%)]" />
          </div>
        </div>

        {/* Línea de profundidad con marcadores, ecoando el DepthIndicator del sitio */}
        <div className="absolute left-10 top-16 bottom-16 w-px bg-white/20">
          {DEPTH_MARKERS.map((marker, i) => (
            <div
              key={marker.code}
              className="absolute -left-[7px] flex items-center gap-3"
              style={{ top: `${(i / (DEPTH_MARKERS.length - 1)) * 100}%` }}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border-2 border-[#0D0A08] shadow-[0_0_10px_rgba(0,0,0,0.4)]"
                style={{ backgroundColor: marker.color }}
              />
              <span
                className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${marker.labelClass}`}
              >
                {marker.code} &middot; {marker.name}
              </span>
            </div>
          ))}
        </div>

        {/* Contenido central: wordmark + mascota + cita */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-16 text-center">
          <div className="px-3 py-1 bg-black/40 backdrop-blur-md text-[#7ED957] border border-[#7ED957]/40 text-[10px] font-bold rounded-full uppercase tracking-widest mb-6">
            &#9670; ACCESO AL SISTEMA ESTRATO
          </div>

          <h1
            data-text="Bienvenido"
            className="estrato-3d-shadow-purple font-mono text-5xl xl:text-6xl font-black tracking-tighter uppercase mb-4 select-none"
            style={{
              background: 'linear-gradient(180deg, #F2EDE4 0%, #C084FC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Bienvenido
          </h1>

          <div className="relative w-32 h-24 my-4 drop-shadow-2xl">
            <Image
              src={logoPlayingImg}
              alt="Wiener Hound Dachshund Mascot"
              fill
              className="object-contain"
              priority
            />
          </div>

          <p className="font-fraunces italic text-lg xl:text-xl text-[#F2EDE4]/90 max-w-sm leading-snug mt-4">
            &ldquo;Toda historia es un sueño al que alguien decidió regresar.&rdquo;
          </p>

          <p className="font-mono text-[11px] text-[#F2EDE4]/50 uppercase tracking-widest mt-8">
            Tu biblioteca, tu progreso, tus favoritos &mdash; en un solo lugar
          </p>
        </div>
      </div>

      {/* Panel derecho: formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8B2FE0]/15 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#7ED957]/10 blur-[110px] rounded-full pointer-events-none" />
        <AuthForm initialError={error} />
      </div>
    </main>
  );
}
