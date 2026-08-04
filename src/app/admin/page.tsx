import { redirect } from 'next/navigation';

// El login de administrador se unificó con el de usuarios regulares en /login
// (mismo formulario, redirección post-login según el rol del perfil).
export default function AdminLoginPage() {
  redirect('/login');
}
