import Link from 'next/link';
import { Container } from '@/shared/ui/Container';

export function Hero() {
  return (
    <section
      className="hero relative text-center pt-[160px] pb-[160px] px-5 bg-cover bg-center bg-fixed overflow-hidden bg-[image:linear-gradient(to_bottom,rgba(10,10,11,0.3),var(--color-bg-dark-primary,#0a0a0b)),url('/images/banner.png')]"
      id="inicio"
    >
      <Container className="relative z-[2]">
        {/* Fix Bug C: Tamaño de tipografía adaptativo para no romper en pantallas pequeñas */}
        <h1 className="hero-h1 text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] leading-[1.1] mb-6 text-text-primary font-poppins font-bold tracking-tight">
          Transformando ideas en<br />{' '}
          <span className="text-secondary">experiencias inmersivas</span>
          <span className="block w-[80px] md:w-[120px] h-1 bg-gradient-to-r from-primary to-secondary mx-auto mt-[30px] rounded-[2px]" />
        </h1>

        <p className="hero-p text-[1.1rem] md:text-[1.25rem] mx-auto mb-[50px] max-w-[700px] text-text-secondary">
          Skill lies not in what you’re taught, but in what you make real. If you can dream it, you can breathe life into it.
        </p>

        <div className="hero-btns flex justify-center gap-4 flex-wrap">
          <Link href="/categorias" className="btn-primary">
            Explorar Proyectos
          </Link>
          <Link href="#sobre-nosotros" className="btn-secondary">
            Conocer Más
          </Link>
        </div>
      </Container>
    </section>
  );
}
