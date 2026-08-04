// Formatea una fecha ISO como texto relativo en español ("hace 2h", "ayer", "20 may")
// Utilidad pura, sin dependencias — reutilizable en cualquier feature/entidad.

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Ahora mismo';
  if (diffMinutes < 60) return `Hace ${diffMinutes}min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays}d`;

  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }).replace('.', '');
}
