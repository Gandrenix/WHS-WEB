import Link from 'next/link';
import type { Profile } from '@/entities/profile';
import { AvatarImage } from '@/shared/ui/AvatarImage';

export interface AccountButtonProps {
  profile: Profile | null;
  className?: string;
}

// Botón de cuenta compartido entre el nav de escritorio y el menú móvil:
// "login" en estilo terminal si no hay sesión, o un chip con avatar si la hay.
export function AccountButton({ profile, className = '' }: AccountButtonProps) {
  if (!profile) {
    return (
      <Link
        href="/login"
        className={`group flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0D0A08] border border-[#8B2FE0]/50 text-[#7ED957] hover:border-[#8B2FE0] hover:shadow-[0_0_16px_rgba(139,47,224,0.45)] transition-all ${className}`}
      >
        <span className="text-[#8B2FE0]">&gt;</span>
        login
        <span className="terminal-caret text-[#7ED957]">&#9615;</span>
      </Link>
    );
  }

  const initial = (profile.display_name || '?').charAt(0).toUpperCase();
  const destination = profile.role === 'admin' ? '/admin/dashboard' : '/biblioteca';

  return (
    <Link
      href={destination}
      className={`group flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full bg-[#0D0A08] border border-[#8B2FE0]/50 hover:border-[#8B2FE0] hover:shadow-[0_0_16px_rgba(139,47,224,0.45)] transition-all ${className}`}
    >
      <span className="relative w-6 h-6 rounded-full bg-gradient-to-br from-[#8B2FE0] to-[#7ED957] flex items-center justify-center text-[10px] font-black text-white shrink-0 overflow-hidden">
        <AvatarImage src={profile.avatar_url} alt="" fallback={initial} className="object-cover" />
      </span>
      <span className="text-[#F2EDE4] text-xs font-bold normal-case tracking-normal truncate max-w-[100px]">
        {profile.display_name || 'Cuenta'}
      </span>
    </Link>
  );
}
