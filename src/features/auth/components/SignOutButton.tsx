'use client';
// Client: botón de cierre de sesión interactivo que invoca signOutAction

import { signOutAction } from '../actions/auth.actions';

export function SignOutButton({ className = '' }: { className?: string }) {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className={className || 'text-xs text-red-400 hover:text-red-300 transition-colors font-medium'}
      >
        Cerrar Sesión
      </button>
    </form>
  );
}
