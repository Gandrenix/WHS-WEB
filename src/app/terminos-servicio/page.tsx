import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos de Servicio — Wiener Hound Studios',
  description:
    'Condiciones de uso del sitio web y los contenidos publicados por Wiener Hound Studios.',
};

const LAST_UPDATED = '2 de agosto de 2026';

export default function TerminosServicioPage() {
  return (
    <main className="min-h-screen bg-[#F2EDE4] text-[#0D0A08] font-sans">
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 sm:py-20">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#0D0A08]/70 hover:text-[#8B2FE0] transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        {/* Header */}
        <div className="mb-12 pb-8 border-b border-[#3A3532]/20">
          <span className="inline-block mb-4 px-3 py-1 rounded-full bg-[#8B2FE0]/10 text-[#8B2FE0] text-[11px] font-mono font-bold uppercase tracking-widest border border-[#8B2FE0]/30">
            Documento Legal
          </span>
          <h1 className="font-fraunces text-4xl sm:text-5xl font-bold tracking-tight text-[#0D0A08] mb-3">
            Términos de Servicio
          </h1>
          <p className="font-mono text-xs text-[#3A3532]/70 uppercase tracking-wider">
            Última actualización: {LAST_UPDATED}
          </p>
        </div>

        {/* Body */}
        <div className="space-y-10 font-sans leading-relaxed text-[#2B1B14]">
          <p>
            Estos Términos de Servicio regulan el acceso y uso del sitio web de Wiener Hound
            Studios. Al navegar por este sitio aceptas las condiciones descritas a continuación.
          </p>

          <section className="space-y-3">
            <h2 className="font-fraunces text-2xl font-bold text-[#0D0A08]">
              1. Sobre este sitio
            </h2>
            <p>
              Este sitio es un portafolio y catálogo digital del estudio creativo{' '}
              <strong>Wiener Hound Studios</strong>, con sede en Bucaramanga, Colombia. A través de
              él presentamos proyectos, publicaciones, manuscritos, ilustraciones, audio y video
              propios, organizados bajo el sistema de exploración que llamamos &ldquo;ESTRATO&rdquo;.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces text-2xl font-bold text-[#0D0A08]">
              2. Propiedad intelectual
            </h2>
            <p>
              Salvo que se indique lo contrario, todo el contenido publicado en este sitio —
              textos, manuscritos, ilustraciones, música, video, nombres, logotipos y el diseño del
              sitio— es propiedad de Wiener Hound Studios o de sus respectivos autores, y está
              protegido por la legislación de derechos de autor aplicable en Colombia y los
              tratados internacionales de los que Colombia hace parte.
            </p>
            <p>
              No está permitido reproducir, distribuir, modificar o explotar comercialmente este
              contenido sin autorización previa y escrita de Wiener Hound Studios.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces text-2xl font-bold text-[#0D0A08]">
              3. Uso permitido
            </h2>
            <p>Al usar este sitio te comprometes a no:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Extraer contenido de forma masiva o automatizada (scraping) sin autorización.</li>
              <li>
                Intentar vulnerar la seguridad del sitio, del panel administrativo o de la
                infraestructura que lo soporta.
              </li>
              <li>Usar el sitio con fines fraudulentos, difamatorios o ilícitos.</li>
              <li>
                Suplantar la identidad de Wiener Hound Studios o de terceros al utilizar el
                formulario de contacto.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces text-2xl font-bold text-[#0D0A08]">
              4. Contenido y enlaces de terceros
            </h2>
            <p>
              Este sitio incluye enlaces a plataformas externas (GitHub, LinkedIn, YouTube,
              SoundCloud, Itch.io, entre otras) y, en algunas publicaciones, contenido incrustado
              proveniente de YouTube, TikTok o Google Drive. No somos responsables del contenido,
              disponibilidad, políticas de privacidad ni prácticas de dichas plataformas externas.
              El acceso a esos servicios queda sujeto a los términos y condiciones propios de cada
              plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces text-2xl font-bold text-[#0D0A08]">
              5. Formulario de contacto
            </h2>
            <p>
              El formulario de contacto de este sitio es procesado por el servicio externo{' '}
              <a
                href="https://formspree.io/legal/terms-of-service"
                target="_blank"
                rel="noreferrer"
                className="text-[#8B2FE0] font-bold hover:underline"
              >
                Formspree
              </a>
              . Al enviar el formulario, tu información también queda sujeta a los términos de ese
              proveedor.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces text-2xl font-bold text-[#0D0A08]">
              6. Disponibilidad del servicio
            </h2>
            <p>
              Nos esforzamos por mantener el sitio disponible y funcionando correctamente, pero no
              garantizamos un acceso ininterrumpido o libre de errores. Podemos modificar,
              suspender o discontinuar partes del sitio en cualquier momento, sin previo aviso.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces text-2xl font-bold text-[#0D0A08]">
              7. Limitación de responsabilidad
            </h2>
            <p>
              El sitio y su contenido se ofrecen &ldquo;tal cual&rdquo;, sin garantías de ningún
              tipo. En la medida permitida por la ley, Wiener Hound Studios no será responsable por
              daños directos o indirectos derivados del uso o la imposibilidad de uso de este
              sitio.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces text-2xl font-bold text-[#0D0A08]">
              8. Modificaciones a estos términos
            </h2>
            <p>
              Podemos actualizar estos Términos de Servicio ocasionalmente. La fecha de la última
              actualización siempre aparecerá en la parte superior de este documento. El uso
              continuado del sitio después de una modificación implica la aceptación de los nuevos
              términos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces text-2xl font-bold text-[#0D0A08]">
              9. Ley aplicable y jurisdicción
            </h2>
            <p>
              Estos términos se rigen por las leyes de la República de Colombia. Cualquier
              controversia derivada del uso de este sitio se someterá a los jueces y tribunales
              competentes de Bucaramanga, Colombia.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces text-2xl font-bold text-[#0D0A08]">
              10. Contacto
            </h2>
            <p>
              Si tienes preguntas sobre estos Términos de Servicio, escríbenos a{' '}
              <a
                href="mailto:wienerhoundstudios@gmail.com"
                className="text-[#8B2FE0] font-bold hover:underline"
              >
                wienerhoundstudios@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
