import { Container } from '@/shared/ui/Container';

export function VideoSection() {
  return (
    <section className="video fade-up py-[100px] bg-bg-dark-secondary">
      <Container>
        <h2>Nuestra Visión en Acción</h2>
        <div className="relative pb-[56.25%] h-0 overflow-hidden max-w-[900px] mx-auto mb-[30px] rounded-[16px] shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-white/5">
          <iframe
            src="https://www.youtube.com/embed/cz1aqWVUNTQ?si=FlwmpM2Hl8RME0Bv"
            title="Wiener Hound Studios - Reel"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full border-0"
          />
        </div>
        <p className="italic text-text-secondary text-center mt-[30px]">
          Descubre el detrás de cámaras y la pasión que ponemos en cada proyecto.
        </p>
      </Container>
    </section>
  );
}
