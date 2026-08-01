import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/shared/ui/Container';

export function ContactSection() {
  return (
    <section className="contacto fade-up py-[100px] bg-bg-dark-primary" id="contacto">
      <Container>
        <h2>Contáctanos</h2>
        <p className="text-center text-text-secondary mb-10">
          Estamos emocionados de escuchar tus ideas. ¡Envíanos un mensaje!
        </p>

        <form
          className="max-w-[600px] mx-auto p-[40px] bg-bg-dark-secondary rounded-[16px] border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
          method="POST"
          action="https://formspree.io/f/mzzawwyb"
        >
          <div className="mb-[25px]">
            <label htmlFor="nombre" className="block mb-2.5 font-medium text-text-secondary">
              Nombre
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              placeholder="Tu nombre"
              required
              className="w-full p-[14px] border border-white/10 bg-white/5 text-white rounded-[8px] focus:border-primary focus:outline-none focus:bg-white/10 transition-all"
            />
          </div>

          <div className="mb-[25px]">
            <label htmlFor="email" className="block mb-2.5 font-medium text-text-secondary">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="tu@correo.com"
              required
              className="w-full p-[14px] border border-white/10 bg-white/5 text-white rounded-[8px] focus:border-primary focus:outline-none focus:bg-white/10 transition-all"
            />
          </div>

          <div className="mb-[25px]">
            <label htmlFor="mensaje" className="block mb-2.5 font-medium text-text-secondary">
              Mensaje
            </label>
            <textarea
              id="mensaje"
              name="mensaje"
              rows={6}
              placeholder="Cuéntanos sobre tu proyecto..."
              required
              className="w-full p-[14px] border border-white/10 bg-white/5 text-white rounded-[8px] focus:border-primary focus:outline-none focus:bg-white/10 transition-all resize-none"
            />
          </div>

          <button type="submit" className="w-full btn-primary text-[1.1rem]">
            Enviar Mensaje
          </button>
        </form>

        <div className="text-center mt-[50px] flex justify-center gap-8">
          <Link
            href="#"
            className="w-[56px] h-[56px] flex items-center justify-center rounded-full bg-bg-dark-secondary border border-white/5 hover:-translate-y-1 hover:bg-primary transition-all group"
          >
            <Image
              src="/images/x.png"
              alt="X"
              width={24}
              height={24}
              className="brightness-0 invert"
            />
          </Link>
          <Link
            href="#"
            className="w-[56px] h-[56px] flex items-center justify-center rounded-full bg-bg-dark-secondary border border-white/5 hover:-translate-y-1 hover:bg-primary transition-all group"
          >
            <Image
              src="/images/tiktok.png"
              alt="Tiktok"
              width={24}
              height={24}
              className="brightness-0 invert"
            />
          </Link>
          <Link
            href="#"
            className="w-[56px] h-[56px] flex items-center justify-center rounded-full bg-bg-dark-secondary border border-white/5 hover:-translate-y-1 hover:bg-primary transition-all group"
          >
            <Image
              src="/images/youtube.png"
              alt="YouTube"
              width={24}
              height={24}
              className="brightness-0 invert"
            />
          </Link>
        </div>
      </Container>
    </section>
  );
}
