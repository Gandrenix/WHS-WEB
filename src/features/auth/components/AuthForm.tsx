'use client';
// Client: formulario de acceso/registro con estado de pestaña local y dos Server Actions distintas

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { loginAction, signUpAction, type AuthState } from '../actions/auth.actions';
import { GoogleAuthButton } from './GoogleAuthButton';

const initialState: AuthState = { error: null };

type Tab = 'login' | 'signup';

export interface AuthFormProps {
  /** Error proveniente de un redirect (ej. /auth/callback tras un fallo de OAuth) */
  initialError?: string;
}

export function AuthForm({ initialError }: AuthFormProps) {
  const [tab, setTab] = useState<Tab>('login');
  const [dismissedInitialError, setDismissedInitialError] = useState(false);
  const [loginState, loginFormAction, isLoginPending] = useActionState(loginAction, initialState);
  const [signUpState, signUpFormAction, isSignUpPending] = useActionState(signUpAction, initialState);

  const state = tab === 'login' ? loginState : signUpState;

  return (
    <div className="w-full max-w-[440px] bg-[#120A08]/95 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.5)] relative z-10 font-mono">
      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 mb-7 bg-black/40 rounded-2xl border border-white/10">
        <button
          type="button"
          onClick={() => setTab('login')}
          className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            tab === 'login'
              ? 'bg-[#8B2FE0] text-white shadow-lg'
              : 'text-[#F2EDE4]/60 hover:text-white'
          }`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => setTab('signup')}
          className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            tab === 'signup'
              ? 'bg-[#7ED957] text-[#0D0A08] shadow-lg'
              : 'text-[#F2EDE4]/60 hover:text-white'
          }`}
        >
          Crear cuenta
        </button>
      </div>

      <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-1">
        {tab === 'login' ? 'Bienvenido de vuelta' : 'Únete a la excavación'}
      </h2>
      <p className="text-xs text-[#F2EDE4]/60 mb-6">
        {tab === 'login'
          ? 'Continúa explorando los estratos donde los dejaste.'
          : 'Crea tu cuenta para guardar tu progreso y tus obras favoritas.'}
      </p>

      <GoogleAuthButton />

      <div className="flex items-center gap-3 my-6">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-[10px] text-[#F2EDE4]/40 uppercase tracking-widest">
          o con tu correo
        </span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      {initialError && !dismissedInitialError && (
        <div className="mb-5 p-4 bg-[#7A1220]/30 border border-[#7A1220] rounded-xl text-[#F2EDE4] text-xs font-bold leading-relaxed flex items-start justify-between gap-3">
          <span>⚠️ {initialError}</span>
          <button
            type="button"
            onClick={() => setDismissedInitialError(true)}
            className="text-[#F2EDE4]/60 hover:text-white shrink-0 cursor-pointer"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      )}

      {state?.error && (
        <div className="mb-5 p-4 bg-[#7A1220]/30 border border-[#7A1220] rounded-xl text-[#F2EDE4] text-xs font-bold leading-relaxed">
          ⚠️ {state.error}
        </div>
      )}
      {state?.success && state?.message && (
        <div className="mb-5 p-4 bg-[#7ED957]/15 border border-[#7ED957]/50 rounded-xl text-[#7ED957] text-xs font-bold leading-relaxed">
          ✓ {state.message}
        </div>
      )}

      {tab === 'login' ? (
        <form key="login" action={loginFormAction} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1.5 text-[10px] text-[#F2EDE4]/70 font-bold uppercase tracking-wider">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              placeholder="tu@correo.com"
              required
              className="w-full p-3.5 border border-white/15 bg-black/50 text-white rounded-xl focus:border-[#8B2FE0] focus:bg-black focus:outline-none focus:ring-2 focus:ring-[#8B2FE0]/40 transition-all text-xs font-mono"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-[10px] text-[#F2EDE4]/70 font-bold uppercase tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              className="w-full p-3.5 border border-white/15 bg-black/50 text-white rounded-xl focus:border-[#8B2FE0] focus:bg-black focus:outline-none focus:ring-2 focus:ring-[#8B2FE0]/40 transition-all text-xs font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isLoginPending}
            className="w-full mt-2 bg-[#8B2FE0] hover:bg-[#C084FC] text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 text-xs uppercase tracking-widest cursor-pointer"
          >
            {isLoginPending ? 'Verificando…' : 'Entrar'}
          </button>
        </form>
      ) : (
        <form key="signup" action={signUpFormAction} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1.5 text-[10px] text-[#F2EDE4]/70 font-bold uppercase tracking-wider">
              Nombre
            </label>
            <input
              type="text"
              name="displayName"
              placeholder="¿Cómo quieres que te llamemos?"
              required
              className="w-full p-3.5 border border-white/15 bg-black/50 text-white rounded-xl focus:border-[#7ED957] focus:bg-black focus:outline-none focus:ring-2 focus:ring-[#7ED957]/40 transition-all text-xs font-mono"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-[10px] text-[#F2EDE4]/70 font-bold uppercase tracking-wider">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              placeholder="tu@correo.com"
              required
              className="w-full p-3.5 border border-white/15 bg-black/50 text-white rounded-xl focus:border-[#7ED957] focus:bg-black focus:outline-none focus:ring-2 focus:ring-[#7ED957]/40 transition-all text-xs font-mono"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-[10px] text-[#F2EDE4]/70 font-bold uppercase tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              className="w-full p-3.5 border border-white/15 bg-black/50 text-white rounded-xl focus:border-[#7ED957] focus:bg-black focus:outline-none focus:ring-2 focus:ring-[#7ED957]/40 transition-all text-xs font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isSignUpPending}
            className="w-full mt-2 bg-[#7ED957] hover:bg-[#9AE873] text-[#0D0A08] font-bold py-4 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 text-xs uppercase tracking-widest cursor-pointer"
          >
            {isSignUpPending ? 'Creando cuenta…' : 'Crear mi cuenta'}
          </button>
        </form>
      )}

      <div className="mt-8 text-center pt-5 border-t border-white/10">
        <Link
          href="/"
          className="text-xs text-[#F2EDE4]/60 hover:text-[#C084FC] transition-colors font-bold"
        >
          &larr; Volver al sitio principal
        </Link>
      </div>
    </div>
  );
}
