'use client';

// Administración de la playlist del reproductor del header. Mismo patrón que
// FooterLinksManager.tsx (modales de crear/editar/borrar, cada uno con su
// propio useActionState), más el campo de archivo MP3 (como
// updateSpecimenCardImageAction, pero acá el archivo va junto con el resto
// del formulario porque una canción sin audio no tiene sentido) y un botón
// para marcar cuál es la "principal" (la que suena al primer clic en el logo).
import { useState, useActionState, useEffect } from 'react';
import { Plus, Edit3, Trash2, X, Loader2, AlertTriangle, Music, Star, Upload } from 'lucide-react';
import type { Song } from '@/entities/song';
import {
  createSongAction,
  updateSongAction,
  deleteSongAction,
  setDefaultSongAction,
} from '../actions/song.actions';
import type { ActionResponse } from '../actions/project.actions';

export interface MusicManagerProps {
  songs: Song[];
}

const initialState: ActionResponse = { error: null };

function formatFileName(url: string): string {
  try {
    return decodeURIComponent(url.split('/').pop() || url);
  } catch {
    return url;
  }
}

export function MusicManager({ songs }: MusicManagerProps) {
  const [editModalSong, setEditModalSong] = useState<Song | 'new' | null>(null);
  const [deleteModalSong, setDeleteModalSong] = useState<Song | null>(null);

  const [createState, createFormAction, isCreatePending] = useActionState(createSongAction, initialState);
  const [updateState, updateFormAction, isUpdatePending] = useActionState(updateSongAction, initialState);
  const [deleteState, deleteFormAction, isDeletePending] = useActionState(deleteSongAction, initialState);
  // Estado independiente: "marcar como principal" se dispara desde la lista, no desde un modal.
  const [defaultState, defaultFormAction, isDefaultPending] = useActionState(setDefaultSongAction, initialState);
  const [pendingDefaultId, setPendingDefaultId] = useState<string | null>(null);

  useEffect(() => {
    if (createState?.success) setEditModalSong(null);
  }, [createState]);

  useEffect(() => {
    if (updateState?.success) setEditModalSong(null);
  }, [updateState]);

  useEffect(() => {
    if (deleteState?.success) setDeleteModalSong(null);
  }, [deleteState]);

  useEffect(() => {
    if (!isDefaultPending) setPendingDefaultId(null);
  }, [isDefaultPending]);

  const isEditing = editModalSong !== null && editModalSong !== 'new';
  const editingSong = isEditing ? (editModalSong as Song) : null;
  const modalError = isEditing ? updateState?.error : createState?.error;
  const isSavePending = isEditing ? isUpdatePending : isCreatePending;

  return (
    <div className="space-y-6 font-mono">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setEditModalSong('new')}
          className="flex items-center gap-2 bg-[#8B2FE0] hover:bg-[#C084FC] text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" /> NUEVA CANCIÓN
        </button>
      </div>

      {defaultState?.error && (
        <div className="p-3 bg-[#7A1220]/40 border border-[#7A1220] rounded-xl text-white text-xs font-bold">
          {defaultState.error}
        </div>
      )}

      {songs.length === 0 ? (
        <div className="text-center py-20 bg-[#160E0A] rounded-2xl border border-dashed border-white/20 flex flex-col items-center">
          <div className="w-16 h-16 bg-[#8B2FE0]/20 rounded-full flex items-center justify-center mb-4 border border-[#8B2FE0]/40">
            <Music className="w-7 h-7 text-[#C084FC]" />
          </div>
          <h3 className="text-white text-xl font-black mb-2 uppercase tracking-tight">SIN CANCIONES TODAVÍA</h3>
          <p className="text-[#F2EDE4]/70 text-xs mb-6 max-w-sm font-sans">
            El reproductor del header (el botón &ldquo;AUD&rdquo; junto al logo) se queda oculto hasta que subas al
            menos una canción acá.
          </p>
        </div>
      ) : (
        // Lista de tamaño fijo por fila con scroll propio a partir de ~7 canciones: agregar
        // más no debe estirar la página — el mismo criterio que el reproductor público.
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {songs.map((song) => (
            <div
              key={song.id}
              className={`bg-[#160E0A] border rounded-2xl p-4 flex items-center gap-4 ${
                song.is_default ? 'border-[#7ED957]/50' : 'border-white/15'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#8B2FE0]/15 border border-[#8B2FE0]/30 flex items-center justify-center shrink-0 text-[#C084FC]">
                <Music className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-white font-black text-sm truncate">{song.title}</span>
                  {song.artist && <span className="text-[#F2EDE4]/50 text-xs truncate">— {song.artist}</span>}
                  <span className="text-[10px] text-[#F2EDE4]/40 shrink-0">POS. {song.position}</span>
                  {song.is_default && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-[#7ED957]/20 text-[#7ED957] rounded text-[9px] font-bold shrink-0">
                      <Star className="w-2.5 h-2.5 fill-current" /> PRINCIPAL
                    </span>
                  )}
                </div>
                <span className="text-[#F2EDE4]/60 text-xs font-sans truncate block">
                  {formatFileName(song.audio_url)}
                </span>
              </div>

              <div className="flex gap-2 text-[10px] shrink-0 flex-wrap justify-end">
                {!song.is_default && (
                  <form
                    action={defaultFormAction}
                    onSubmit={() => setPendingDefaultId(song.id)}
                  >
                    <input type="hidden" name="target_song_id" value={song.id} />
                    <button
                      type="submit"
                      disabled={isDefaultPending}
                      title="Marcar como canción principal"
                      className="px-3 py-1.5 bg-white/10 hover:bg-[#7ED957]/20 text-[#F2EDE4]/70 hover:text-[#7ED957] rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {isDefaultPending && pendingDefaultId === song.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Star className="w-3 h-3" />
                      )}
                      PRINCIPAL
                    </button>
                  </form>
                )}
                <button
                  type="button"
                  onClick={() => setEditModalSong(song)}
                  className="px-3 py-1.5 bg-[#7ED957]/20 hover:bg-[#7ED957] text-[#7ED957] hover:text-[#0D0A08] rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Edit3 className="w-3 h-3" /> EDITAR
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModalSong(song)}
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
      {editModalSong !== null && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-[#120A08] border border-[#8B2FE0] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                {isEditing ? 'EDITAR CANCIÓN' : 'NUEVA CANCIÓN'}
              </span>
              <button
                type="button"
                onClick={() => setEditModalSong(null)}
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

            <form action={isEditing ? updateFormAction : createFormAction} className="space-y-3" encType="multipart/form-data">
              {isEditing && <input type="hidden" name="target_song_id" value={editingSong!.id} />}

              <label className="block">
                <span className="text-[10px] text-[#F2EDE4]/60 font-bold uppercase block mb-1">Título</span>
                <input
                  name="title"
                  defaultValue={editingSong?.title}
                  placeholder="Nombre de la canción"
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8B2FE0]"
                />
              </label>

              <label className="block">
                <span className="text-[10px] text-[#F2EDE4]/60 font-bold uppercase block mb-1">
                  Artista (opcional)
                </span>
                <input
                  name="artist"
                  defaultValue={editingSong?.artist ?? ''}
                  placeholder="Wiener Hound Studios"
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8B2FE0]"
                />
              </label>

              <label className="block">
                <span className="text-[10px] text-[#F2EDE4]/60 font-bold uppercase block mb-1">
                  Posición (orden en la playlist, menor va primero)
                </span>
                <input
                  name="position"
                  type="number"
                  defaultValue={editingSong?.position ?? songs.length + 1}
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8B2FE0]"
                />
              </label>

              <label className="block">
                <span className="text-[10px] text-[#F2EDE4]/60 font-bold uppercase block mb-1 flex items-center gap-1.5">
                  <Upload className="w-3 h-3" />
                  Archivo MP3 {isEditing && <span className="text-[#F2EDE4]/40 normal-case font-normal">(deja vacío para no reemplazarlo)</span>}
                </span>
                <input
                  name="file"
                  type="file"
                  accept="audio/mpeg,audio/mp3,.mp3"
                  required={!isEditing}
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#8B2FE0] file:text-white file:text-[10px] file:font-bold file:cursor-pointer cursor-pointer focus:outline-none focus:border-[#8B2FE0]"
                />
                {isEditing && (
                  <span className="text-[10px] text-[#F2EDE4]/40 font-sans block mt-1 truncate">
                    Actual: {formatFileName(editingSong!.audio_url)}
                  </span>
                )}
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalSong(null)}
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
      {deleteModalSong && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#120A08] border border-[#7A1220] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <span className="font-bold text-[#ff8a95] text-xs uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> ELIMINAR CANCIÓN
              </span>
              <button
                type="button"
                onClick={() => setDeleteModalSong(null)}
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
              Estás a punto de eliminar <strong className="text-white">&ldquo;{deleteModalSong.title}&rdquo;</strong>{' '}
              de la playlist del reproductor. Esta acción{' '}
              <strong className="text-[#ff8a95]">no se puede deshacer</strong> (el archivo MP3 queda en Storage, solo
              se borra el registro).
            </p>

            <form action={deleteFormAction} className="flex justify-end gap-3 pt-2">
              <input type="hidden" name="target_song_id" value={deleteModalSong.id} />
              <button
                type="button"
                onClick={() => setDeleteModalSong(null)}
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
