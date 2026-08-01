'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { loginAction, type AuthState } from '../actions/auth.actions';

const initialState: AuthState = {
  error: null,
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="w-full max-w-[440px] bg-[#0D0A08] backdrop-blur-2xl p-8 sm:p-10 rounded-2xl border border-[#8B2FE0]/40 shadow-[0_20px_60px_rgba(139,47,224,0.25)] relative z-10 font-mono">
      {/* Header */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="relative w-16 h-16 mb-3">
          <Image
            src="/images/logo-playing.png"
            alt="WHS Logo"
            fill
            className="object-contain drop-shadow-md"
          />
        </div>

        <div className="px-3 py-1 bg-[#8B2FE0]/20 text-[#C084FC] border border-[#8B2FE0]/40 text-[10px] font-bold rounded-full uppercase tracking-wider mb-2">
          TERMINAL ESTRATO v1.0
        </div>

        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Acceso a Comando</h2>
        <p className="text-xs text-[#F2EDE4]/70 mt-1">
          Panel de Administración y Control de Publicaciones
        </p>
      </div>

      {state?.error && (
        <div className="mb-6 p-4 bg-[#7A1220]/30 border border-[#7A1220] rounded-xl text-[#F2EDE4] text-xs font-bold leading-relaxed">
          ⚠️ {state.error}
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-5">
        <div>
          <label className="block mb-2 text-xs text-[#F2EDE4] font-bold uppercase tracking-wider">
            Correo Electrónico
          </label>
          <input
            type="email"
            name="email"
            placeholder="admin@wienerhound.studio"
            required
            className="w-full p-3.5 border border-white/20 bg-black/60 text-white rounded-xl focus:border-[#8B2FE0] focus:bg-black focus:outline-none focus:ring-2 focus:ring-[#8B2FE0]/40 transition-all text-xs font-mono"
          />
        </div>

        <div>
          <label className="block mb-2 text-xs text-[#F2EDE4] font-bold uppercase tracking-wider">
            Contraseña
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            required
            className="w-full p-3.5 border border-white/20 bg-black/60 text-white rounded-xl focus:border-[#8B2FE0] focus:bg-black focus:outline-none focus:ring-2 focus:ring-[#8B2FE0]/40 transition-all text-xs font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 bg-[#8B2FE0] hover:bg-[#C084FC] text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 text-xs uppercase tracking-widest cursor-pointer"
        >
          {isPending ? 'AUTENTICANDO...' : 'INICIAR SESIÓN EN TERMINAL'}
        </button>
      </form>

      <div className="mt-8 text-center pt-4 border-t border-white/10">
        <Link
          href="/"
          className="text-xs text-[#F2EDE4]/70 hover:text-[#C084FC] transition-colors font-bold"
        >
          &larr; Volver al Sitio Principal
        </Link>
      </div>
    </div>
  );
}
