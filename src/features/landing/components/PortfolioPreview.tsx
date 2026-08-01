import Link from 'next/link';
import { Container } from '@/shared/ui/Container';
import { ProjectCard, type Project } from '@/entities/project';

export interface PortfolioPreviewProps {
  recentProjects: Project[];
}

export function PortfolioPreview({ recentProjects }: PortfolioPreviewProps) {
  return (
    <section className="portafolio fade-up py-[100px] bg-bg-dark-primary" id="portafolio">
      <Container className="text-center">
        <h2>Explora Nuestro Portafolio</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px] mb-[50px] text-left">
          {recentProjects.length > 0 ? (
            recentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <p className="text-text-secondary text-center col-span-full py-10">
              Los proyectos aparecerán aquí pronto.
            </p>
          )}
        </div>

        <Link href="/categorias" className="btn-primary">
          Ver Todos los Proyectos
        </Link>
      </Container>
    </section>
  );
}
