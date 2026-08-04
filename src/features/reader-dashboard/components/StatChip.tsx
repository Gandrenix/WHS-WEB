import type { LucideIcon } from 'lucide-react';

export interface StatChipProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}

export function StatChip({ icon: Icon, label, value, color }: StatChipProps) {
  return (
    <div
      className="flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-md"
      style={{ backgroundColor: `${color}1A`, borderColor: `${color}66` }}
    >
      <div
        className="p-2.5 rounded-xl shrink-0"
        style={{ backgroundColor: `${color}33`, color }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-black text-white leading-none">{value}</div>
        <div className="text-[10px] font-mono font-bold uppercase tracking-widest mt-1" style={{ color }}>
          {label}
        </div>
      </div>
    </div>
  );
}
