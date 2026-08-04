import Link from 'next/link';
import { Heart, BookOpen, CheckCircle2, Bookmark } from 'lucide-react';
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime';
import type { ActivityEntry } from '../types';

const ACTIVITY_META: Record<ActivityEntry['type'], { icon: typeof Heart; color: string; verb: string }> = {
  progress: { icon: BookOpen, color: '#8B2FE0', verb: 'Sigues leyendo' },
  completed: { icon: CheckCircle2, color: '#7ED957', verb: 'Completaste' },
  favorite: { icon: Heart, color: '#7A1220', verb: 'Guardaste en favoritos' },
  bookmark: { icon: Bookmark, color: '#FFD700', verb: 'Guardaste un capítulo de' },
};

export function RecentActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  return (
    <div className="flex flex-col">
      {entries.map((entry, i) => {
        const meta = ACTIVITY_META[entry.type];
        const Icon = meta.icon;
        const href =
          entry.type === 'bookmark' && entry.chapterNumber
            ? `/categorias/${entry.project.id}?chapter=${entry.chapterNumber}`
            : `/categorias/${entry.project.id}`;
        return (
          <Link
            key={entry.id}
            href={href}
            className={`flex items-center gap-4 py-4 group hover:bg-white/5 -mx-4 px-4 rounded-xl transition-colors ${
              i !== entries.length - 1 ? 'border-b border-white/10' : ''
            }`}
          >
            <div
              className="p-2.5 rounded-full shrink-0"
              style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-[#F2EDE4]/90">
                <span className="font-bold" style={{ color: meta.color }}>
                  {meta.verb}
                </span>{' '}
                <span className="text-white font-bold group-hover:underline">{entry.project.title}</span>
              </p>
            </div>
            <span className="text-[10px] font-mono text-[#F2EDE4]/40 uppercase tracking-wider shrink-0">
              {formatRelativeTime(entry.timestamp)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
