// ⚠️ ARCHIVO NECESARIO — NO ES CÓDIGO MUERTO, aunque ninguna otra parte del
// código lo importe nunca. Next.js lo detecta y lo ejecuta automáticamente
// por convención de nombre/ubicación (debe vivir en `src/middleware.ts`,
// exactamente en esta ruta), en CADA request que matchee el `config.matcher`
// de abajo — antes de que se renderice cualquier página. No hace falta (ni
// es posible) importarlo desde ningún componente o Server Action.
//
// Qué hace: protege las rutas /admin/dashboard y /biblioteca — si no hay
// sesión de Supabase válida, redirige a /login; si es /admin/dashboard y el
// usuario no tiene role='admin' en la tabla `profiles`, lo redirige a
// /biblioteca. La lógica real vive en updateSession()
// (src/shared/lib/supabase/middleware.ts), este archivo solo la conecta al
// hook de middleware de Next.js.
//
// Si una herramienta de análisis de "archivos sin usar" (Antigravity u otra)
// lo marca como huérfano por no tener imports entrantes, es un falso
// positivo — NO BORRAR.
import { type NextRequest } from 'next/server';
import { updateSession } from '@/shared/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};