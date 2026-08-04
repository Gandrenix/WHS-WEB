import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

export interface DashboardSectionProps {
  title: string;
  icon: LucideIcon;
  accent: string;
  isEmpty: boolean;
  emptyMessage: string;
  children: ReactNode;
}

export function DashboardSection({
  title,
  icon: Icon,
  accent,
  isEmpty,
  emptyMessage,
  children,
}: DashboardSectionProps) {
  return (
    <section>
      <div className="flex items-center gap-2.5 mb-5">
        <Icon className="w-4 h-4" style={{ color: accent }} />
        <h2 className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>
          {title}
        </h2>
        <span className="flex-1 h-px bg-[#3A3532]/15" />
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 rounded-2xl border border-dashed border-[#3A3532]/25 bg-white/40 text-center">
          <p className="text-sm text-[#3A3532]/70 font-medium max-w-md">{emptyMessage}</p>
          <Link
            href="/categorias"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#8B2FE0] hover:text-[#0D0A08] transition-colors"
          >
            Explorar catálogo &rarr;
          </Link>
        </div>
      ) : (
        children
      )}
    </section>
  );
}
