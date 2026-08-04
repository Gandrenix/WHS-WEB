import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/shared/config/env';
import type { Database } from '@/shared/types/database.types';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  const isProtectedAdminRoute = pathname.startsWith('/admin/dashboard');
  const isProtectedUserRoute = pathname.startsWith('/biblioteca');
  const isProtectedRoute = isProtectedAdminRoute || isProtectedUserRoute;

  // Solo realizar la verificación de red con Supabase Auth si se accede a una zona protegida
  if (!isProtectedRoute) {
    return supabaseResponse;
  }

  // Destino de login: la zona de admin conserva su propio login por compatibilidad,
  // pero ambas zonas usan el mismo formulario unificado en /login
  const loginPath = '/login';

  try {
    const supabase = createServerClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = loginPath;
      return NextResponse.redirect(url);
    }

    // El panel de administración es exclusivo para role='admin'; un lector normal
    // que llegue aquí (con sesión válida) se envía de vuelta a su propia biblioteca.
    if (isProtectedAdminRoute) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        const url = request.nextUrl.clone();
        url.pathname = '/biblioteca';
        return NextResponse.redirect(url);
      }
    }
  } catch (err) {
    console.warn('Middleware auth verification error:', err);
    const url = request.nextUrl.clone();
    url.pathname = loginPath;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
