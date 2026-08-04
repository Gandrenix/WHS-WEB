'use client';

// Administración de las fichas de "espécimen" de la landing (STRATA I).
// Mismo patrón que ProjectList/CommunityModerationList: modales de
// crear/editar/imagen/borrar, cada uno con su propio useActionState.
import { useState, useActionState, useEffect, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Edit3, Trash2, Upload, X, Loader2, AlertTriangle, ImageIcon, FlaskConical } from 'lucide-react';
import type { SpecimenCard } from '@/entities/specimen-card';
import {
  createSpecimenCardAction,
  updateSpecimenCardAction,
  deleteSpecimenCardAction,
  updateSpecimenCardImageAction,
  removeSpecimenCardImageAction,
} from '../actions/specimenCard.actions';
import type { ActionResponse } from '../actions/project.actions';

export interface SpecimenCardsManagerProps {
  cards: SpecimenCard[];
}

const initialState: ActionResponse = { error: null };

export function SpecimenCardsManager({ cards }: SpecimenCardsManagerProps) {
  const router = useRouter();

  const [editModalCard, setEditModalCard] = useState<SpecimenCard | 'new' | null>(null);
  const [imageModalCard, setImageModalCard] = useState<SpecimenCard | null>(null);
  const [deleteModalCard, setDeleteModalCard] = useState<SpecimenCard | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removingImageId, setRemovingImageId] = useState<string | null>(null);

  const [createState, createFormAction, isCreatePending] = useActionState(createSpecimenCardAction, initialState);
  const [updateState, updateFormAction, isUpdatePending] = useActionState(updateSpecimenCardAction, initialState);
  const [deleteState, deleteFormAction, isDeletePending] = useActionState(deleteSpecimenCardAction, initialState);
  const [imageState, imageFormAction, isImagePending] = useActionState(updateSpecimenCardImageAction, initialState);

  useEffect(() => {
    if (createState?.success) setEditModalCard(null);
  }, [createState]);

  useEffect(() => {
    if (updateState?.success) setEditModalCard(null);
  }, [updateState]);

  useEffect(() => {
    if (deleteState?.success) setDeleteModalCard(null);
  }, [deleteState]);

  useEffect(() => {
    if (imageState?.success) {
      setImageModalCard(null);
      setImagePreview(null);
    }
  }, [imageState]);

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleRemoveImage = async (card: SpecimenCard) => {
    if (typeof window !== 'undefined' && !window.confirm('¿Quitar la imagen y volver al ícono?')) return;
    setRemovingImageId(card.id);
    await removeSpecimenCardImageAction(card.id);
    setRemovingImageId(null);
    router.refresh();
  };

  const isEditing = editModalCard !== null && editModalCard !== 'new';
  const editingCard = isEditing ? (editModalCard as SpecimenCard) : null;
  const modalError = isEditing ? updateState?.error : createState?.error;
  const isSavePending = isEditing ? isUpdatePending : isCreatePending;

  return (
    <div className="space-y-6 font-mono">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setEditModalCard('new')}
          className="flex items-center gap-2 bg-[#8B2FE0] hover:bg-[#C084FC] text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" /> NUEVA FICHA
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-20 bg-[#160E0A] rounded-2xl border border-dashed border-white/20 flex flex-col items-center">
          <div className="w-16 h-16 bg-[#8B2FE0]/20 rounded-full flex items-center justify-center mb-4 border border-[#8B2FE0]/40">
            <FlaskConical className="w-7 h-7 text-[#C084FC]" />
          </div>
          <h3 className="text-white text-xl font-black mb-2 uppercase tracking-tight">SIN FICHAS TODAVÍA</h3>
          <p className="text-[#F2EDE4]/70 text-xs mb-6 max-w-sm font-sans">
            La grilla de STRATA I en la home se ve vacía hasta que registres al menos una ficha acá.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((card) => (
            <div key={card.id} className="bg-[#160E0A] border border-white/15 rounded-2xl p-5 flex gap-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black/60 border border-white/15 shrink-0 flex items-center justify-center text-3xl">
                {card.image_url ? (
                  <Image src={card.image_url} alt={card.title} fill className="object-cover" />
                ) : (
                  <span>{card.icon || '❔'}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] text-[#C084FC] font-bold truncate">{card.cat}</span>
                  <span className="text-[10px] text-[#F2EDE4]/40 shrink-0">POS. {card.position}</span>
                </div>
                <h3 className="text-white font-black text-sm mb-1 truncate">{card.title}</h3>
                <p className="text-[#F2EDE4]/70 text-xs font-sans line-clamp-2 mb-3 leading-relaxed">
                  {card.description}
                </p>

                <div className="flex flex-wrap gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setEditModalCard(card)}
                    className="px-3 py-1.5 bg-[#7ED957]/20 hover:bg-[#7ED957] text-[#7ED957] hover:text-[#0D0A08] rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Edit3 className="w-3 h-3" /> EDITAR
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageModalCard(card);
                      setImagePreview(card.image_url);
                    }}
                    className="px-3 py-1.5 bg-[#8B2FE0]/20 hover:bg-[#8B2FE0] text-[#C084FC] hover:text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Upload className="w-3 h-3" /> IMAGEN
                  </button>
                  {card.image_url && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(card)}
                      disabled={removingImageId === card.id}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold cursor-pointer transition-all disabled:opacity-50"
                    >
                      {removingImageId === card.id ? 'QUITANDO…' : 'QUITAR IMG'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeleteModalCard(card)}
                    className="px-3 py-1.5 bg-[#7A1220]/25 hover:bg-[#7A1220] text-[#ff8a95] hover:text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3 h-3" /> ELIMINAR
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREAR / EDITAR */}
      {editModalCard !== null && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-[#120A08] border border-[#8B2FE0] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                {isEditing ? 'EDITAR FICHA' : 'NUEVA FICHA'}
              </span>
              <button
                type="button"
                onClick={() => setEditModalCard(null)}
                className="p-1 text-[#F2EDE4]/60 hover:text-white cursor-pointer"
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
              {isEditing && <input type="hidden" name="target_card_id" value={editingCard!.id} />}

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] text-[#F2EDE4]/60 font-bold uppercase block mb-1">Categoría</span>
                  <input
                    name="cat"
                    defaultValue={editingCard?.cat}
                    placeholder="CAT. WC-003"
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8B2FE0]"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] text-[#F2EDE4]/60 font-bold uppercase block mb-1">Posición</span>
                  <input
                    name="position"
                    type="number"
                    defaultValue={editingCard?.position ?? cards.length + 1}
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8B2FE0]"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-[10px] text-[#F2EDE4]/60 font-bold uppercase block mb-1">Título</span>
                <input
                  name="title"
                  defaultValue={editingCard?.title}
                  placeholder="WienerCalc"
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8B2FE0]"
                />
              </label>

              <label className="block">
                <span className="text-[10px] text-[#F2EDE4]/60 font-bold uppercase block mb-1">Descripción</span>
                <textarea
                  name="description"
                  defaultValue={editingCard?.description}
                  rows={3}
                  maxLength={300}
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white resize-none focus:outline-none focus:border-[#8B2FE0]"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] text-[#F2EDE4]/60 font-bold uppercase block mb-1">Input</span>
                  <input
                    name="input_label"
                    defaultValue={editingCard?.input_label}
                    placeholder="CSV_FOODDATA"
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8B2FE0]"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] text-[#F2EDE4]/60 font-bold uppercase block mb-1">Output</span>
                  <input
                    name="output_label"
                    defaultValue={editingCard?.output_label}
                    placeholder="CSV / XLSX"
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8B2FE0]"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] text-[#F2EDE4]/60 font-bold uppercase block mb-1">
                    Stack / Lenguaje
                  </span>
                  <input
                    name="lang_label"
                    defaultValue={editingCard?.lang_label}
                    placeholder="ELECTRON / REACT / TS"
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8B2FE0]"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] text-[#F2EDE4]/60 font-bold uppercase block mb-1">Estado</span>
                  <input
                    name="status"
                    defaultValue={editingCard?.status ?? 'ACTIVO'}
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8B2FE0]"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-[10px] text-[#F2EDE4]/60 font-bold uppercase block mb-1">
                  Ícono (emoji — se usa solo si no hay imagen subida)
                </span>
                <input
                  name="icon"
                  defaultValue={editingCard?.icon ?? ''}
                  placeholder="💻"
                  maxLength={8}
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8B2FE0]"
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalCard(null)}
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

      {/* IMAGEN */}
      {imageModalCard && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#120A08] border border-[#8B2FE0] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#C084FC]" /> IMAGEN DE LA FICHA
              </span>
              <button
                type="button"
                onClick={() => {
                  setImageModalCard(null);
                  setImagePreview(null);
                }}
                className="p-1 text-[#F2EDE4]/60 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {imageState?.error && (
              <div className="p-3 bg-[#7A1220]/40 border border-[#7A1220] rounded-xl text-white text-xs font-bold">
                {imageState.error}
              </div>
            )}

            <form action={imageFormAction} className="space-y-4">
              <input type="hidden" name="target_card_id" value={imageModalCard.id} />

              <div className="relative w-full h-48 bg-black/60 border-2 border-dashed border-white/20 rounded-xl overflow-hidden flex flex-col items-center justify-center group cursor-pointer">
                <input
                  type="file"
                  name="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {imagePreview ? (
                  <Image src={imagePreview} alt="Vista previa" fill className="object-cover opacity-80" />
                ) : (
                  <div className="flex flex-col items-center text-center p-4">
                    <ImageIcon className="w-8 h-8 text-[#C084FC] mb-2" />
                    <span className="text-white text-xs font-bold">Haz clic para subir una imagen</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setImageModalCard(null);
                    setImagePreview(null);
                  }}
                  className="px-4 py-2.5 bg-white/10 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={isImagePending}
                  className="px-6 py-2.5 bg-[#8B2FE0] hover:bg-[#C084FC] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isImagePending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SUBIR IMAGEN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ELIMINAR */}
      {deleteModalCard && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#120A08] border border-[#7A1220] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <span className="font-bold text-[#ff8a95] text-xs uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> ELIMINAR FICHA
              </span>
              <button
                type="button"
                onClick={() => setDeleteModalCard(null)}
                className="p-1 text-[#F2EDE4]/60 hover:text-white cursor-pointer"
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
              Estás a punto de eliminar la ficha{' '}
              <strong className="text-white">&ldquo;{deleteModalCard.title}&rdquo;</strong> de la sección STRATA I de
              la landing. Esta acción <strong className="text-[#ff8a95]">no se puede deshacer</strong>.
            </p>

            <form action={deleteFormAction} className="flex justify-end gap-3 pt-2">
              <input type="hidden" name="target_card_id" value={deleteModalCard.id} />
              <button
                type="button"
                onClick={() => setDeleteModalCard(null)}
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
