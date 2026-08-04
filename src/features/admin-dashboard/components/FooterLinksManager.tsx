'use client';

// Administración de los enlaces sociales del footer ("ENCUÉNTRANOS": GitHub,
// LinkedIn, YouTube, SoundCloud, Itch.io). Mismo patrón que
// SpecimenCardsManager.tsx (modales de crear/editar/borrar, cada uno con su
// propio useActionState) pero sin subida de imagen — solo texto + URL.
import { useState, useActionState, useEffect } from 'react';
import { Plus, Edit3, Trash2, X, Loader2, AlertTriangle, Link2 } from 'lucide-react';
import type { FooterSocialLink } from '@/entities/footer-social-link';
import {
  createFooterSocialLinkAction,
  updateFooterSocialLinkAction,
  deleteFooterSocialLinkAction,
} from '../actions/footerSocialLink.actions';
import type { ActionResponse } from '../actions/project.actions';

export interface FooterLinksManagerProps {
  links: FooterSocialLink[];
}

const initialState: ActionResponse = { error: null };

export function FooterLinksManager({ links }: FooterLinksManagerProps) {
  const [editModalLink, setEditModalLink] = useState<FooterSocialLink | 'new' | null>(null);
  const [deleteModalLink, setDeleteModalLink] = useState<FooterSocialLink | null>(null);

  const [createState, createFormAction, isCreatePending] = useActionState(createFooterSocialLinkAction, initialState);
  const [updateState, updateFormAction, isUpdatePending] = useActionState(updateFooterSocialLinkAction, initialState);
  const [deleteState, deleteFormAction, isDeletePending] = useActionState(deleteFooterSocialLinkAction, initialState);

  useEffect(() => {
    if (createState?.success) setEditModalLink(null);
  }, [createState]);

  useEffect(() => {
    if (updateState?.success) setEditModalLink(null);
  }, [updateState]);

  useEffect(() => {
    if (deleteState?.success) setDeleteModalLink(null);
  }, [deleteState]);

  const isEditing = editModalLink !== null && editModalLink !== 'new';
  const editingLink = isEditing ? (editModalLink as FooterSocialLink) : null;
  const modalError = isEditing ? updateState?.error : createState?.error;
  const isSavePending = isEditing ? isUpdatePending : isCreatePending;

  return (
    <div className="space-y-6 font-mono">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setEditModalLink('new')}
          className="flex items-center gap-2 bg-[#8B2FE0] hover:bg-[#C084FC] text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" /> NUEVO ENLACE
        </button>
      </div>

      {links.length === 0 ? (
        <div className="text-center py-20 bg-[#160E0A] rounded-2xl border border-dashed border-white/20 flex flex-col items-center">
          <div className="w-16 h-16 bg-[#8B2FE0]/20 rounded-full flex items-center justify-center mb-4 border border-[#8B2FE0]/40">
            <Link2 className="w-7 h-7 text-[#C084FC]" />
          </div>
          <h3 className="text-white text-xl font-black mb-2 uppercase tracking-tight">SIN ENLACES TODAVÍA</h3>
          <p className="text-[#F2EDE4]/70 text-xs mb-6 max-w-sm font-sans">
            La sección &ldquo;ENCUÉNTRANOS&rdquo; del footer se ve vacía hasta que registres al menos un enlace acá.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.id}
              className="bg-[#160E0A] border border-white/15 rounded-2xl p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[#8B2FE0]/15 border border-[#8B2FE0]/30 flex items-center justify-center shrink-0 text-[#C084FC]">
                <Link2 className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-black text-sm truncate">{link.label}</span>
                  <span className="text-[10px] text-[#F2EDE4]/40 shrink-0">POS. {link.position}</span>
                </div>
                <span className="text-[#F2EDE4]/60 text-xs font-sans truncate block">{link.url}</span>
              </div>

              <div className="flex gap-2 text-[10px] shrink-0">
                <button
                  type="button"
                  onClick={() => setEditModalLink(link)}
                  className="px-3 py-1.5 bg-[#7ED957]/20 hover:bg-[#7ED957] text-[#7ED957] hover:text-[#0D0A08] rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Edit3 className="w-3 h-3" /> EDITAR
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModalLink(link)}
                  className="px-3 py-1.5 bg-[#7A1220]/25 hover:bg-[#7A1220] text-[#ff8a95] hover:text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Trash2 className="w-3 h-3" /> ELIMINAR
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREAR / EDITAR */}
      {editModalLink !== null && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-[#120A08] border border-[#8B2FE0] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                {isEditing ? 'EDITAR ENLACE' : 'NUEVO ENLACE'}
              </span>
              <button
                type="button"
                onClick={() => setEditModalLink(null)}
                className="p-2 text-[#F2EDE4]/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-[#7A1220]/40 border border-[#7A1220] rounded-xl text-white text-xs font-bold">
                {modalError}
              </div>
            )}

            <form action={isEditing ? updateFormAction : createFormAction} className="space-y-3">
              {isEditing && <input type="hidden" name="target_link_id" value={editingLink!.id} />}

              <label className="block">
                <span className="text-[10px] text-[#F2EDE4]/60 font-bold uppercase block mb-1">
                  Texto del enlace
                </span>
                <input
                  name="label"
                  defaultValue={editingLink?.label}
                  placeholder="GitHub"
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8B2FE0]"
                />
              </label>

              <label className="block">
                <span className="text-[10px] text-[#F2EDE4]/60 font-bold uppercase block mb-1">URL</span>
                <input
                  name="url"
                  type="url"
                  defaultValue={editingLink?.url}
                  placeholder="https://github.com/tu-usuario"
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8B2FE0]"
                />
              </label>

              <label className="block">
                <span className="text-[10px] text-[#F2EDE4]/60 font-bold uppercase block mb-1">
                  Posición (orden de aparición, menor va primero)
                </span>
                <input
                  name="position"
                  type="number"
                  defaultValue={editingLink?.position ?? links.length + 1}
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8B2FE0]"
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalLink(null)}
                  className="px-4 py-2.5 bg-white/10 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={isSavePending}
                  className="px-6 py-2.5 bg-[#8B2FE0] hover:bg-[#C084FC] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isSavePending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'GUARDAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ELIMINAR */}
      {deleteModalLink && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#120A08] border border-[#7A1220] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <span className="font-bold text-[#ff8a95] text-xs uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> ELIMINAR ENLACE
              </span>
              <button
                type="button"
                onClick={() => setDeleteModalLink(null)}
                className="p-2 text-[#F2EDE4]/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {deleteState?.error && (
              <div className="p-3 bg-[#7A1220]/40 border border-[#7A1220] rounded-xl text-white text-xs font-bold">
                {deleteState.error}
              </div>
            )}

            <p className="font-sans text-xs text-[#F2EDE4]/90 leading-relaxed">
              Estás a punto de eliminar el enlace{' '}
              <strong className="text-white">&ldquo;{deleteModalLink.label}&rdquo;</strong> de la sección
              &ldquo;ENCUÉNTRANOS&rdquo; del footer. Esta acción{' '}
              <strong className="text-[#ff8a95]">no se puede deshacer</strong>.
            </p>

            <form action={deleteFormAction} className="flex justify-end gap-3 pt-2">
              <input type="hidden" name="target_link_id" value={deleteModalLink.id} />
              <button
                type="button"
                onClick={() => setDeleteModalLink(null)}
                className="px-4 py-2.5 bg-white/10 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                disabled={isDeletePending}
                className="px-6 py-2.5 bg-[#7A1220] hover:bg-[#a01a2b] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isDeletePending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SÍ, ELIMINAR'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
