'use client';
// Client: formulario de edición de perfil con preview de avatar en memoria antes de subir

import { useActionState, useState } from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import { updateProfileAction, type ProfileActionState } from '../actions/profile.actions';
import type { Profile } from '@/entities/profile';

const initialState: ProfileActionState = { error: null };

export interface ProfileSettingsFormProps {
  profile: Profile;
}

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.avatar_url);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
  };

  const initial = (profile.display_name || '?').charAt(0).toUpperCase();

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state?.error && (
        <div className="p-4 bg-[#7A1220]/30 border border-[#7A1220] rounded-xl text-[#F2EDE4] text-xs font-bold leading-relaxed">
          ⚠️ {state.error}
        </div>
      )}
      {state?.success && (
        <div className="p-4 bg-[#7ED957]/15 border border-[#7ED957]/50 rounded-xl text-[#7ED957] text-xs font-bold leading-relaxed">
          ✓ Perfil actualizado.
        </div>
      )}

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-[#8B2FE0] to-[#7ED957] flex items-center justify-center shrink-0 border-2 border-white/10">
          {previewUrl ? (
            <Image src={previewUrl} alt="Avatar" fill className="object-cover" unoptimized />
          ) : (
            <span className="text-2xl font-black text-white">{initial}</span>
          )}
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 hover:border-[#8B2FE0]/50 text-xs font-mono font-bold uppercase tracking-wider text-[#F2EDE4]/80 hover:text-white transition-all cursor-pointer">
          <Camera className="w-4 h-4" />
          Cambiar foto
          <input type="file" name="avatar" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleAvatarChange} className="hidden" />
        </label>
      </div>

      {/* Display name */}
      <div>
        <label className="block mb-1.5 text-[10px] text-[#F2EDE4]/70 font-bold uppercase tracking-wider font-mono">
          Nombre visible
        </label>
        <input
          type="text"
          name="displayName"
          defaultValue={profile.display_name ?? ''}
          required
          minLength={2}
          maxLength={60}
          className="w-full p-3.5 border border-white/15 bg-black/50 text-white rounded-xl focus:border-[#8B2FE0] focus:bg-black focus:outline-none focus:ring-2 focus:ring-[#8B2FE0]/40 transition-all text-sm font-mono"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="self-start px-6 py-3 bg-[#8B2FE0] hover:bg-[#C084FC] text-white font-bold rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 text-xs uppercase tracking-widest cursor-pointer font-mono"
      >
        {isPending ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  );
}
