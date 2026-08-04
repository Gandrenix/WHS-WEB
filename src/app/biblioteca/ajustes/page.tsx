import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/shared/lib/supabase/server';
import { getProfile } from '@/entities/profile/server';
import { ProfileSettingsForm } from '@/features/account-settings';

export default async function AjustesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await getProfile(user.id);

  return (
    <main className="min-h-screen bg-[#0D0A08] text-[#F2EDE4] font-mono">
      <div className="max-w-2xl mx-auto px-6 py-14">
        <Link
          href="/biblioteca"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#F2EDE4]/60 hover:text-[#C084FC] transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mi biblioteca
        </Link>

        <div className="mb-8">
          <span className="inline-block mb-3 px-3 py-1 rounded-full bg-[#8B2FE0]/10 text-[#8B2FE0] text-[11px] font-bold uppercase tracking-widest border border-[#8B2FE0]/30">
            Ajustes de cuenta
          </span>
          <h1 className="font-fraunces text-3xl sm:text-4xl font-bold text-white">Tu perfil</h1>
          <p className="text-sm text-[#F2EDE4]/60 mt-2">
            Cambia tu foto y el nombre con el que te reconocemos en el sitio.
          </p>
        </div>

        <div className="bg-[#120A08] border border-white/10 rounded-2xl p-6 sm:p-8">
          <ProfileSettingsForm
            profile={
              profile ?? { id: user.id, display_name: user.email ?? 'Viajero', avatar_url: null, role: 'user' }
            }
          />
        </div>

        <p className="text-[11px] text-[#F2EDE4]/40 mt-6">
          Correo asociado a tu cuenta: <span className="text-[#F2EDE4]/70">{user.email}</span>
        </p>
      </div>
    </main>
  );
}
