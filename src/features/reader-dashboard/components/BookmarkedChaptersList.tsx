import Link from 'next/link';
import Image from 'next/image';
import { Bookmark } from 'lucide-react';
import type { BookmarkedChapterWithProject } from '../types';

export function BookmarkedChaptersList({ items }: { items: BookmarkedChapterWithProject[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/categorias/${item.project.id}?chapter=${item.chapterNumber}`}
          className="group flex items-center gap-3 p-3 rounded-xl bg-[#120A08] border border-white/10 hover:border-[#FFD700]/50 transition-all"
        >
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black/60 shrink-0">
            <Image
              src={item.project.image_url || '/images/WIP.png'}
              alt={item.project.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-mono font-bold text-white truncate group-hover:text-[#FFD700] transition-colors">
              {item.project.title}
            </p>
            <p className="text-[11px] text-[#FFD700] font-mono truncate flex items-center gap-1 mt-0.5">
              <Bookmark className="w-3 h-3 fill-current shrink-0" />
              Cap. {item.chapterNumber}
              {item.chapterTitle ? `: ${item.chapterTitle}` : ''}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
