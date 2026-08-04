'use client';
// Client: pantalla de error para la ruta del dashboard de administración

import Link from 'next/link';

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-bg-dark-primary flex items-center justify-center p-6 text-center">
      <div className="max-w-md bg-bg-dark-secondary p-8 rounded-2xl border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-3">Error en el Dashboard</h2>
        <p className="text-text-secondary text-sm mb-6">
          {error?.message || 'Ocurrió un error inesperado al cargar el panel.'}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="btn-primary text-sm py-2.5 px-6"
          >
            Reintentar
          </button>
          <Link href="/login" className="btn-secondary text-sm py-2.5 px-6">
            Volver a Login
          </Link>
        </div>
      </div>
    </div>
  );
}
