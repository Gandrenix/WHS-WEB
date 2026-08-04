import Image from 'next/image';
import Link from 'next/link';
import { FavoriteToggleButton } from './FavoriteToggleButton';
import type { FavoriteWithProject } from '../types';

export function FavoriteCard({ item }: { item: FavoriteWithProject }) {
  const { project } = item;

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#120A08] border border-white/10 hover:border-[#7A1220]/50 shadow-md hover:shadow-xl transition-all duration-300">
      <div className="absolute top-2 right-2 z-10">
        <FavoriteToggleButton projectId={project.id} initialFavorited variant="solid" />
      </div>

      <Link href={`/categorias/${project.id}`} className="flex flex-col flex-1">
        <div className="relative h-36 w-full overflow-hidden bg-black/60">
          <Image
            src={project.image_url || '/images/WIP.png'}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-4">
          <h3 className="font-mono text-sm font-black text-white truncate mb-1">{project.title}</h3>
          <p className="font-mono text-[10px] uppercase tracking-wider text-[#F2EDE4]/50">
            {project.category}
          </p>
        </div>
      </Link>
    </div>
  );
}
