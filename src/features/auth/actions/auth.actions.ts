'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/shared/lib/supabase/server';

const LoginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const SignUpSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Tu nombre debe tener al menos 2 caracteres')
    .max(60, 'Tu nombre es demasiado largo'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export interface AuthState {
  error?: string | null;
  success?: boolean;
  message?: string | null;
}

function humanizeAuthError(message: string): string {
  if (message.includes('fetch failed') || message.includes('ENOTFOUND')) {
    return 'No se pudo conectar con el servidor de Supabase. Revisa las credenciales en .env.local.';
  }
  if (message === 'Invalid login credentials') return 'Credenciales inválidas.';
  if (message.includes('User already registered')) {
    return 'Ya existe una cuenta con este correo. Intenta iniciar sesión.';
  }
  if (message.includes('Password should be at least')) return 'La contraseña es demasiado corta.';
  return message;
}

// Reconstruye el origen público del sitio a partir de los headers de la petición,
// necesario para armar el link de redirección de OAuth/confirmación de correo.
async function getSiteOrigin(): Promise<string> {
  const headersList = await headers();
  const origin = headersList.get('origin');
  if (origin) return origin;

  const host = headersList.get('host');
  const proto =
    headersList.get('x-forwarded-proto') ?? (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  if (host) return `${proto}://${host}`;

  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

async function resolvePostLoginPath(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<string> {
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
  return data?.role === 'admin' ? '/admin/dashboard' : '/biblioteca';
}

export async function loginAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const parsed = LoginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Datos incompletos' };
  }

  let redirectPath = '/biblioteca';

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return { error: humanizeAuthError(error.message) };
    }

    if (data.user) {
      redirectPath = await resolvePostLoginPath(supabase, data.user.id);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: humanizeAuthError(message) };
  }

  redirect(redirectPath);
}

export async function signUpAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const displayName = formData.get('displayName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const parsed = SignUpSchema.safeParse({ displayName, email, password });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Datos incompletos' };
  }

  try {
    const supabase = await createClient();
    const origin = await getSiteOrigin();

    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { display_name: parsed.data.displayName },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      return { error: humanizeAuthError(error.message) };
    }

    // Si el proyecto de Supabase exige confirmación por correo, todavía no hay sesión activa
    if (data.user && !data.session) {
      return {
        success: true,
        message: 'Creamos tu cuenta. Revisa tu correo y confirma tu registro para iniciar sesión.',
      };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: humanizeAuthError(message) };
  }

  redirect('/biblioteca');
}

export async function signOutAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignorar errores de red en signout
  }
  redirect('/');
}
