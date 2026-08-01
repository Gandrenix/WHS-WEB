'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/server';

const LoginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export interface AuthState {
  error?: string | null;
  success?: boolean;
}

export async function loginAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const parsed = LoginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Datos incompletos',
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      if (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND')) {
        return {
          error: 'No se pudo conectar con el servidor de Supabase. Revisa las credenciales en .env.local.',
        };
      }
      return {
        error: error.message === 'Invalid login credentials' ? 'Credenciales inválidas' : error.message,
      };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('fetch failed') || message.includes('ENOTFOUND')) {
      return {
        error: 'No se pudo conectar con el servidor de Supabase. Revisa las credenciales en .env.local.',
      };
    }
    return { error: 'Ocurrió un error al intentar iniciar sesión.' };
  }

  redirect('/admin/dashboard');
}

export async function signOutAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignorar errores de red en signout
  }
  redirect('/admin');
}
