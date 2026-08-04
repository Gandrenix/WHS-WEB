import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad — Wiener Hound Studios',
  description:
    'Cómo Wiener Hound Studios recopila, usa y protege los datos de quienes visitan este sitio.',
};

const LAST_UPDATED = '2 de agosto de 2026';

export default function PoliticaPrivacidadPage() {
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
            Política de Privacidad
          </h1>
          <p className="font-mono text-xs text-[#3A3532]/70 uppercase tracking-wider">
            Última actualización: {LAST_UPDATED}
          </p>
        </div>

        {/* Body */}
        <div className="space-y-10 font-sans leading-relaxed text-[#2B1B14]">
          <p>
            En Wiener Hound Studios respetamos la privacidad de quienes visitan este sitio. Este
            documento explica, de forma clara y concreta, qué información recopilamos, con qué
            propósito, y qué derechos tienes sobre ella.
          </p>

          <section className="space-y-3">
            <h2 className="font-fraunces text-2xl font-bold text-[#0D0A08]">
              1. Responsable del tratamiento
            </h2>
            <p>
              El responsable del tratamiento de los datos recopilados a través de este sitio es{' '}
              <strong>Wiener Hound Studios</strong>, con sede en Bucaramanga, Colombia. Puedes
              contactarnos en cualquier momento escribiendo a{' '}
              <a
                href="mailto:wienerhoundstudios@gmail.com"
                className="text-[#8B2FE0] font-bold hover:underline"
              >
                wienerhoundstudios@gmail.com
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces text-2xl font-bold text-[#0D0A08]">
              2. Qué datos recopilamos
            </h2>
            <p>Este sitio recopila datos personales únicamente en los siguientes casos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Formulario de contacto:</strong> si nos escribes a través del formulario
                de contacto, recopilamos tu nombre, correo electrónico y el mensaje que nos
                envías. Este formulario es procesado por{' '}
                <a
                  href="https://formspree.io/legal/privacy-policy"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#8B2FE0] font-bold hover:underline"
                >
                  Formspree
                </a>
                , un proveedor externo que actúa como encargado del tratamiento y nos entrega tu
                mensaje por correo. No almacenamos estos datos en nuestra propia base de datos.
              </li>
              <li>
                <strong>Cookies técnicas:</strong> el sitio público no utiliza cookies de
                seguimiento, publicidad ni analítica. Únicamente el panel de administración
                interno (uso exclusivo del equipo de Wiener Hound Studios) genera una cookie de
                sesión necesaria para iniciar sesión de forma segura. Esta cookie no recopila
                información sobre visitantes del sitio público.
              </li>
              <li>
                <strong>Contenido embebido de terceros:</strong> algunas publicaciones incluyen
                reproductores incrustados de YouTube, TikTok o Google Drive. Si interactúas con
                ese contenido (por ejemplo, reproduces un video), esas plataformas pueden
                establecer sus propias cookies conforme a sus propias políticas de privacidad,
                independientes de la nuestra.
              </li>
            </ul>
            <p>No utilizamos herramientas de analítica, píxeles de rastreo ni publicidad.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces text-2xl font-bold text-[#0D0A08]">
              3. Finalidad del tratamiento
            </h2>
            <p>Los datos que recopilamos se usan exclusivamente para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Responder a tus mensajes o solicitudes de contacto.</li>
              <li>Gestionar propuestas de colaboración o consultas sobre nuestros proyectos.</li>
            </ul>
            <p>No usamos tus datos con fines publicitarios ni los vendemos ni cedemos a terceros.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces text-2xl font-bold text-[#0D0A08]">
              4. Conservación de los datos
            </h2>
            <p>
              Los mensajes enviados por el formulario de contacto se conservan en nuestra bandeja
              de correo solo durante el tiempo necesario para atender tu solicitud, o hasta que
              solicites su eliminación.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces text-2xl font-bold text-[#0D0A08]">
              5. Tus derechos
            </h2>
            <p>
              De acuerdo con la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia (régimen de
              protección de datos personales — Habeas Data), tienes derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Conocer, actualizar y rectificar tus datos personales.</li>
              <li>Solicitar prueba de la autorización otorgada para el tratamiento de tus datos.</li>
              <li>Ser informado sobre el uso que se ha dado a tus datos.</li>
              <li>Revocar la autorización y/o solicitar la supresión de tus datos.</li>
              <li>
                Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por
                infracciones a la normativa de protección de datos.
              </li>
            </ul>
            <p>
              Para ejercer cualquiera de estos derechos, escríbenos a{' '}
              <a
                href="mailto:wienerhoundstudios@gmail.com"
                className="text-[#8B2FE0] font-bold hover:underline"
              >
                wienerhoundstudios@gmail.com
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces text-2xl font-bold text-[#0D0A08]">
              6. Seguridad
            </h2>
            <p>
              Adoptamos medidas razonables para proteger la información que procesamos, incluyendo
              el uso de conexiones cifradas (HTTPS) y proveedores externos (Formspree, Supabase)
              que mantienen sus propios estándares de seguridad para los datos que gestionan en
              nuestro nombre.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces text-2xl font-bold text-[#0D0A08]">
              7. Menores de edad
            </h2>
            <p>
              Este sitio no está dirigido a menores de edad y no recopilamos conscientemente datos
              personales de menores de 18 años.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces text-2xl font-bold text-[#0D0A08]">
              8. Cambios a esta política
            </h2>
            <p>
              Podemos actualizar esta política ocasionalmente para reflejar cambios en el sitio o
              en la normativa aplicable. La fecha de la última actualización siempre aparecerá en
              la parte superior de este documento.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces text-2xl font-bold text-[#0D0A08]">
              9. Contacto
            </h2>
            <p>
              Si tienes preguntas sobre esta política de privacidad, escríbenos a{' '}
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
