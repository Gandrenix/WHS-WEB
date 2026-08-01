import Image from 'next/image';
import { Container } from '@/shared/ui/Container';

export function TeamSection() {
  const teamMembers = [
    { name: 'Wiener', role: 'Directora Creativa', img: '/images/gata.jpg' },
    { name: 'Wiener', role: 'Jefe de Animación', img: '/images/gataa.jpg' },
    { name: 'Wiener', role: 'Guionista Principal', img: '/images/gata.jpg' },
  ];

  return (
    <section className="sobre-nosotros fade-up py-[100px] bg-bg-dark-secondary text-center" id="sobre-nosotros">
      <Container>
        <h2>Sobre Wiener Hound Studios</h2>
        <p className="max-w-[800px] mx-auto mb-[60px] text-text-secondary text-[1.125rem]">
          Somos un equipo apasionado de creadores, artistas y desarrolladores unidos por el amor al anime, el manga y los videojuegos.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[40px]">
          {teamMembers.map((member, i) => (
            <div
              key={i}
              className="bg-bg-dark-primary rounded-[16px] border border-white/5 p-[30px] transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="relative w-[140px] h-[140px] mx-auto mb-5">
                <Image
                  src={member.img}
                  alt={member.name}
                  fill
                  className="rounded-full object-cover border-4 border-bg-dark-primary shadow-[0_0_0_2px_var(--color-primary,#9d2ec5)]"
                />
              </div>
              <h3 className="text-[1.4rem] mb-[5px] text-white font-poppins font-bold">
                {member.name}
              </h3>
              <p className="text-[0.95rem] text-secondary font-medium m-0">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
