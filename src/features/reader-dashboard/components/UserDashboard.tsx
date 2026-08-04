import type { ReactNode } from 'react';
import Link from 'next/link';
import { BookOpen, Heart, Flame, Sparkles, Clock, Layers, Settings, Bookmark } from 'lucide-react';
import type { Profile } from '@/entities/profile';
import { AvatarImage } from '@/shared/ui/AvatarImage';
import { StatChip } from './StatChip';
import { ContinueReadingCard } from './ContinueReadingCard';
import { FavoriteCard } from './FavoriteCard';
import { RecentActivityFeed } from './RecentActivityFeed';
import { BookmarkedChaptersList } from './BookmarkedChaptersList';
import { DashboardSection } from './DashboardSection';
import type {
  ProgressWithProject,
  FavoriteWithProject,
  BookmarkedChapterWithProject,
  ActivityEntry,
  DashboardStats,
} from '../types';

export interface UserDashboardProps {
  profile: Profile;
  continueReading: ProgressWithProject[];
  favorites: FavoriteWithProject[];
  bookmarkedChapters: BookmarkedChapterWithProject[];
  activity: ActivityEntry[];
  stats: DashboardStats;
  /** Botón de cerrar sesión, resuelto por la página (evita el import cruzado feature->feature con `auth`) */
  signOutSlot: ReactNode;
}

export function UserDashboard({
  profile,
  continueReading,
  favorites,
  bookmarkedChapters,
  activity,
  stats,
  signOutSlot,
}: UserDashboardProps) {
  const displayName = profile.display_name || 'Viajero';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F2EDE4] text-[#0D0A08]">
      {/* HERO — reutiliza el motif de "corte geológico" del login para dar continuidad de marca */}
      <section className="relative overflow-hidden bg-[#0D0A08] text-[#F2EDE4] border-b border-white/10">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(139,47,224,0.28),transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_60%,rgba(126,217,87,0.18),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(122,18,32,0.2),transparent_55%)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-14 pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8B2FE0]/20 border border-[#8B2FE0]/40 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest text-[#C084FC] mb-4">
              <Layers className="w-3 h-3" /> Tu biblioteca personal
            </div>
            <h1 className="font-fraunces text-4xl sm:text-5xl font-bold mb-2 leading-tight">
              Bienvenido, <span className="text-[#C084FC]">{displayName}</span>.
            </h1>
            <p className="font-mono text-xs text-[#F2EDE4]/60 uppercase tracking-wider">
              {profile.role === 'admin' ? 'Administrador' : 'Explorador registrado'} &bull; Wiener Hound Studios
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md shrink-0">
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#8B2FE0] to-[#7ED957] flex items-center justify-center text-xl font-black text-white shrink-0 overflow-hidden">
              <AvatarImage src={profile.avatar_url} alt={displayName} fallback={initial} className="object-cover" />
            </div>
            <div>
              <p className="font-bold text-sm text-white truncate max-w-[160px]">{displayName}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <Link
                  href="/biblioteca/ajustes"
                  className="inline-flex items-center gap-1 text-[11px] text-[#F2EDE4]/50 hover:text-[#C084FC] font-bold uppercase tracking-wider transition-colors"
                >
                  <Settings className="w-3 h-3" /> Editar
                </Link>
                {signOutSlot}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatChip icon={Flame} label="Leyendo" value={stats.reading} color="#8B2FE0" />
          <StatChip icon={Sparkles} label="Completadas" value={stats.completed} color="#7ED957" />
          <StatChip icon={Heart} label="Favoritos" value={stats.favorites} color="#7A1220" />
          <StatChip icon={Bookmark} label="Capítulos" value={stats.bookmarks} color="#FFD700" />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-14">
        <DashboardSection
          title="Continuar leyendo"
          icon={BookOpen}
          accent="#8B2FE0"
          isEmpty={continueReading.length === 0}
          emptyMessage="Aún no has empezado ninguna obra. Elige algo del catálogo y tu progreso se guardará solo."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {continueReading.map((item) => (
              <ContinueReadingCard key={item.id} item={item} />
            ))}
          </div>
        </DashboardSection>

        <DashboardSection
          title="Tus favoritos"
          icon={Heart}
          accent="#7A1220"
          isEmpty={favorites.length === 0}
          emptyMessage="Todavía no has guardado ninguna obra. Usa el corazón dentro del lector para guardarla aquí."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {favorites.map((item) => (
              <FavoriteCard key={item.id} item={item} />
            ))}
          </div>
        </DashboardSection>

        <DashboardSection
          title="Capítulos guardados"
          icon={Bookmark}
          accent="#B8860B"
          isEmpty={bookmarkedChapters.length === 0}
          emptyMessage="Aún no has guardado ningún capítulo. Usa el marcador dentro del lector para volver directo a él."
        >
          <BookmarkedChaptersList items={bookmarkedChapters} />
        </DashboardSection>

        <DashboardSection
          title="Actividad reciente"
          icon={Clock}
          accent="#2B1B14"
          isEmpty={activity.length === 0}
          emptyMessage="Tu actividad reciente aparecerá aquí en cuanto empieces a leer o guardes una obra."
        >
          <div className="bg-[#120A08] rounded-2xl border border-white/10 px-4 py-2">
            <RecentActivityFeed entries={activity} />
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}
