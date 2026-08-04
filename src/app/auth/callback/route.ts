import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';

// Punto de retorno único para: (1) el flujo OAuth de Google y (2) el link de
// confirmación de correo del registro. Ambos llegan aquí con un `code` que se
// intercambia por una sesión válida, y luego redirige según el rol del perfil.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // Si Google/Supabase rechazó el intento de OAuth (proveedor mal configurado,
  // consentimiento cancelado, app en modo prueba sin el correo autorizado, etc.)
  // el redirect llega aquí con `error`/`error_description` en vez de `code`.
  const providerError = searchParams.get('error_description') || searchParams.get('error');
  if (providerError) {
    console.error('[auth/callback] Error devuelto por el proveedor OAuth:', providerError);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(providerError)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[auth/callback] exchangeCodeForSession falló:', error.message);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const destination = profile?.role === 'admin' ? '/admin/dashboard' : '/biblioteca';
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  console.error('[auth/callback] Llegó sin `code` ni `error` en la URL:', request.url);
  return NextResponse.redirect(`${origin}/login?error=No pudimos verificar tu sesión`);
}
