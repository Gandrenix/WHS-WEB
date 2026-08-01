'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  image_url: string | null;
}

export default function HomeClient({ recentProjects }: { recentProjects: Project[] }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Animations
    gsap.fromTo(".hero h1", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" });
    gsap.fromTo(".hero p", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: "power3.out" });
    gsap.fromTo(".hero .btns", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, delay: 0.4, ease: "back.out(1.7)" });

    // Scroll Animations
    gsap.utils.toArray<HTMLElement>('.fade-up').forEach((section) => {
      gsap.fromTo(section, 
        { opacity: 0, y: 50 }, 
        {
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
          },
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: "power2.out"
        }
      );
    });
  }, []);

  return (
    <main>
      <section className="hero relative text-center pt-[160px] pb-[160px] px-5 bg-cover bg-center bg-fixed overflow-hidden bg-[image:linear-gradient(to_bottom,rgba(10,10,11,0.3),var(--bg-dark-primary)),url('/images/banner.png')]" id="inicio">
        <div className="container-custom relative z-[2]">
          <h1 className="text-[2.8rem] md:text-[4.5rem] leading-[1.1] mb-6 text-[#f8fafc] font-poppins font-bold tracking-tight">
            Transformando ideas en<br /> <span className="text-[#00e68a]">experiencias inmersivas</span>
            <span className="block w-[80px] md:w-[120px] h-1 bg-gradient-to-r from-[#9d2ec5] to-[#00e68a] mx-auto mt-[30px] rounded-[2px]"></span>
          </h1>
          <p className="text-[1.1rem] md:text-[1.25rem] mx-auto mb-[50px] max-w-[700px] text-[#94a3b8]">
            Skill lies not in what you’re taught, but in what you make real. If you can dream it, you can breathe life into it.
          </p>
          
          <div className="btns flex justify-center gap-4 flex-wrap">
            <Link href="/categorias" className="btn-primary">Explorar Proyectos</Link>
            <Link href="#sobre-nosotros" className="btn-secondary">Conocer Más</Link>
          </div>
        </div>
      </section>

      <section className="servicios fade-up py-[100px] bg-[#0a0a0b] relative before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent">
        <div className="container-custom">
          <h2>Nuestros Servicios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[30px]">
            {[
              {title: "Creación de Manga", desc: "Desarrollamos historias gráficas originales con arte detallado y narrativas profundas."},
              {title: "Producción de Anime", desc: "Llevamos tus ideas a la pantalla con animaciones fluidas y dirección artística de primer nivel."},
              {title: "Visual Novels", desc: "Construimos mundos interactivos donde tus decisiones forjan el destino. Experiencias envolventes."},
              {title: "Diseño de Personajes", desc: "Creamos personajes memorables con diseños únicos que reflejan su personalidad."}
            ].map((s, i) => (
              <div key={i} className="service-card bg-[#121214] rounded-[16px] p-[40px_30px] text-center transition-all duration-400 border border-white/5 relative overflow-hidden group hover:-translate-y-2.5 hover:bg-white/5 after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-1 after:bg-gradient-to-r after:from-[#9d2ec5] after:to-[#00e68a] after:scale-x-0 after:origin-left after:transition-transform after:duration-400 hover:after:scale-x-100">
                <h3 className="text-xl mb-[15px] text-white font-poppins font-bold">{s.title}</h3>
                <p className="text-[#94a3b8] text-[1.125rem]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="video fade-up py-[100px] bg-[#121214]">
        <div className="container-custom">
          <h2>Nuestra Visión en Acción</h2>
          <div className="relative pb-[56.25%] h-0 overflow-hidden max-w-[900px] mx-auto mb-[30px] rounded-[16px] shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-white/5">
            <iframe 
              src="https://www.youtube.com/embed/cz1aqWVUNTQ?si=FlwmpM2Hl8RME0Bv" 
              title="Wiener Hound Studios - Reel" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full border-0"
            ></iframe>
          </div>
          <p className="italic text-[#94a3b8] text-center mt-[30px]">Descubre el detrás de cámaras y la pasión que ponemos en cada proyecto.</p>
        </div>
      </section>

      <section className="portafolio fade-up py-[100px] bg-[#0a0a0b]" id="portafolio">
        <div className="container-custom text-center">
          <h2>Explora Nuestro Portafolio</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px] mb-[50px] text-left">
             {recentProjects.length > 0 ? (
               recentProjects.map((project) => (
                 <article key={project.id} className="project-card flex flex-col bg-[#121214] rounded-[16px] overflow-hidden border border-white/5 transition-all duration-400 hover:-translate-y-2 group">
                    <div className="relative h-[240px] overflow-hidden bg-black/50">
                      <Image 
                        src={project.image_url || "/images/WIP.png"} 
                        alt={project.title} 
                        fill
                        className="object-cover transition-transform duration-600 group-hover:scale-105" 
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-[#9d2ec5]/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md uppercase tracking-wider">{project.category}</span>
                      </div>
                    </div>
                    <div className="card-content flex-grow p-[25px] flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-[1.5rem] text-[#f8fafc] font-poppins font-bold">{project.title}</h4>
                        <span className="text-xs text-[#00e68a] border border-[#00e68a]/30 px-2 py-1 rounded whitespace-nowrap">{project.status}</span>
                      </div>
                      <p className="text-[1.05rem] text-[#94a3b8] flex-grow mb-[25px]">{project.description}</p>
                    </div>
                  </article>
               ))
             ) : (
               <p className="text-[#94a3b8] text-center col-span-full py-10">Los proyectos aparecerán aquí pronto.</p>
             )}
          </div>

          <Link href="/categorias" className="btn-primary">Ver Todos los Proyectos</Link>
        </div>
      </section>

      <section className="sobre-nosotros fade-up py-[100px] bg-[#121214] text-center" id="sobre-nosotros">
        <div className="container-custom">
          <h2>Sobre Wiener Hound Studios</h2>
          <p className="max-w-[800px] mx-auto mb-[60px] text-[#94a3b8] text-[1.125rem]">Somos un equipo apasionado de creadores, artistas y desarrolladores unidos por el amor al anime, el manga y los videojuegos.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[40px]">
            {[
              {name: "Wiener", role: "Directora Creativa", img: "/images/gata.jpg"},
              {name: "Wiener", role: "Jefe de Animación", img: "/images/gataa.jpg"},
              {name: "Wiener", role: "Guionista Principal", img: "/images/gata.jpg"}
            ].map((team, i) => (
              <div key={i} className="bg-[#0a0a0b] rounded-[16px] border border-white/5 p-[30px] transition-transform duration-300 hover:-translate-y-2">
                <div className="relative w-[140px] h-[140px] mx-auto mb-5">
                  <Image src={team.img} alt={team.name} fill className="rounded-full object-cover border-4 border-[#0a0a0b] shadow-[0_0_0_2px_#9d2ec5]" />
                </div>
                <h3 className="text-[1.4rem] mb-[5px] text-white font-poppins font-bold">{team.name}</h3>
                <p className="text-[0.95rem] text-[#00e68a] font-medium m-0">{team.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="contacto fade-up py-[100px] bg-[#0a0a0b]" id="contacto">
        <div className="container-custom">
          <h2>Contáctanos</h2>
          <p className="text-center text-[#94a3b8] mb-10">Estamos emocionados de escuchar tus ideas. ¡Envíanos un mensaje!</p>
          <form className="max-w-[600px] mx-auto p-[40px] bg-[#121214] rounded-[16px] border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.3)]" method="POST" action="https://formspree.io/f/mzzawwyb">
            <div className="mb-[25px]">
              <label htmlFor="nombre" className="block mb-2.5 font-medium text-[#94a3b8]">Nombre</label>
              <input type="text" id="nombre" name="nombre" placeholder="Tu nombre" required className="w-full p-[14px] border border-white/10 bg-white/5 text-white rounded-[8px] focus:border-[#9d2ec5] focus:outline-none focus:bg-white/10 transition-all" />
            </div>
            <div className="mb-[25px]">
              <label htmlFor="email" className="block mb-2.5 font-medium text-[#94a3b8]">Email</label>
              <input type="email" id="email" name="email" placeholder="tu@correo.com" required className="w-full p-[14px] border border-white/10 bg-white/5 text-white rounded-[8px] focus:border-[#9d2ec5] focus:outline-none focus:bg-white/10 transition-all" />
            </div>
            <div className="mb-[25px]">
              <label htmlFor="mensaje" className="block mb-2.5 font-medium text-[#94a3b8]">Mensaje</label>
              <textarea id="mensaje" name="mensaje" rows={6} placeholder="Cuéntanos sobre tu proyecto..." required className="w-full p-[14px] border border-white/10 bg-white/5 text-white rounded-[8px] focus:border-[#9d2ec5] focus:outline-none focus:bg-white/10 transition-all resize-none"></textarea>
            </div>
            <button type="submit" className="w-full btn-primary text-[1.1rem]">Enviar Mensaje</button>
          </form>
          <div className="text-center mt-[50px] flex justify-center gap-8">
            <Link href="#" className="w-[56px] h-[56px] flex items-center justify-center rounded-full bg-[#121214] border border-white/5 hover:-translate-y-1 hover:bg-[#9d2ec5] transition-all group">
              <Image src="/images/x.png" alt="X" width={24} height={24} className="brightness-0 invert" />
            </Link>
            <Link href="#" className="w-[56px] h-[56px] flex items-center justify-center rounded-full bg-[#121214] border border-white/5 hover:-translate-y-1 hover:bg-[#9d2ec5] transition-all group">
              <Image src="/images/tiktok.png" alt="Tiktok" width={24} height={24} className="brightness-0 invert" />
            </Link>
            <Link href="#" className="w-[56px] h-[56px] flex items-center justify-center rounded-full bg-[#121214] border border-white/5 hover:-translate-y-1 hover:bg-[#9d2ec5] transition-all group">
              <Image src="/images/youtube.png" alt="YouTube" width={24} height={24} className="brightness-0 invert" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
