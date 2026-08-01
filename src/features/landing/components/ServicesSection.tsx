import { Container } from '@/shared/ui/Container';

export function ServicesSection() {
  const services = [
    {
      title: 'Creación de Manga',
      desc: 'Desarrollamos historias gráficas originales con arte detallado y narrativas profundas.',
    },
    {
      title: 'Producción de Anime',
      desc: 'Llevamos tus ideas a la pantalla con animaciones fluidas y dirección artística de primer nivel.',
    },
    {
      title: 'Visual Novels',
      desc: 'Construimos mundos interactivos donde tus decisiones forjan el destino. Experiencias envolventes.',
    },
    {
      title: 'Diseño de Personajes',
      desc: 'Creamos personajes memorables con diseños únicos que reflejan su personalidad.',
    },
  ];

  return (
    <section className="servicios fade-up py-[100px] bg-bg-dark-primary relative before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent">
      <Container>
        <h2>Nuestros Servicios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[30px]">
          {services.map((s, i) => (
            <div
              key={i}
              className="service-card bg-bg-dark-secondary rounded-[16px] p-[40px_30px] text-center transition-all duration-400 border border-white/5 relative overflow-hidden group hover:-translate-y-2.5 hover:bg-white/5 after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-1 after:bg-gradient-to-r after:from-primary after:to-secondary after:scale-x-0 after:origin-left after:transition-transform after:duration-400 hover:after:scale-x-100"
            >
              <h3 className="text-xl mb-[15px] text-white font-poppins font-bold">
                {s.title}
              </h3>
              <p className="text-text-secondary text-[1.125rem]">{s.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
