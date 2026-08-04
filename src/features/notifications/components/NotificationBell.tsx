'use client';

// Campana de notificaciones del Navbar. Se resuelve como ReactNode desde
// app/layout.tsx (mismo patrón que favoriteButton/contactButton) y NO como
// ComponentType<Shape>: a diferencia de CommentsSection, no depende de
// estado reactivo de la página (capítulo activo, etc.) — es autocontenida.
//
// Estilo con paleta fija (no sigue el toggle claro/oscuro del Navbar según
// ruta), igual que AccountButton: ambos son "chips" oscuros que quedan bien
// tanto sobre el header claro (home) como sobre el oscuro (/categorias).
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, Loader2 } from 'lucide-react';
import {
  fetchNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from '../actions/notifications.actions';
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime';
import type { NotificationWithContext } from '@/entities/notification';

export interface NotificationBellProps {
  initialUnreadCount: number;
}

function buildHref(notification: NotificationWithContext): string {
  if (!notification.project_id) return '/biblioteca';
  const chapterQuery = notification.chapter_number ? `?chapter=${notification.chapter_number}` : '';
  return `/categorias/${notification.project_id}${chapterQuery}`;
}

export function NotificationBell({ initialUnreadCount }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [notifications, setNotifications] = useState<NotificationWithContext[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggleOpen = async () => {
    const next = !isOpen;
    setIsOpen(next);

    if (next && !hasLoadedOnce) {
      setIsLoading(true);
      const result = await fetchNotificationsAction();
      setNotifications(result.notifications);
      setIsLoading(false);
      setHasLoadedOnce(true);
    }
  };

  const handleMarkAllRead = async () => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await markAllNotificationsReadAction();
  };

  const handleItemClick = async (notification: NotificationWithContext) => {
    if (!notification.is_read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)));
      await markNotificationReadAction(notification.id);
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggleOpen}
        aria-label="Notificaciones"
        aria-expanded={isOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-[#0D0A08] border border-[#8B2FE0]/50 text-[#7ED957] hover:border-[#8B2FE0] hover:shadow-[0_0_16px_rgba(139,47,224,0.45)] transition-all cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#8B2FE0] text-white text-[9px] font-bold flex items-center justify-center border border-[#0D0A08]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-[#120A08] border border-white/15 rounded-xl shadow-2xl z-[90] font-mono">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/15 sticky top-0 bg-[#120A08]">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Notificaciones</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[10px] text-[#C084FC] hover:text-white font-bold cursor-pointer"
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="p-6 flex justify-center text-[#F2EDE4]/50">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#F2EDE4]/50 font-sans">
              Todavía no tienes notificaciones.
            </div>
          ) : (
            <ul>
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`border-b border-white/5 last:border-0 ${notification.is_read ? '' : 'bg-[#8B2FE0]/10'}`}
                >
                  <Link
                    href={buildHref(notification)}
                    onClick={() => handleItemClick(notification)}
                    className="block px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <p className="text-xs text-[#F2EDE4]/90 font-sans leading-relaxed">
                      <strong className="text-white">{notification.actor?.display_name || 'Alguien'}</strong>{' '}
                      respondió a tu comentario
                      {notification.project && (
                        <>
                          {' '}
                          en <strong className="text-[#C084FC]">{notification.project.title}</strong>
                        </>
                      )}
                    </p>
                    <span className="text-[10px] text-[#F2EDE4]/40">
                      {formatRelativeTime(notification.created_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
