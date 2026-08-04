'use client';

// Formulario reutilizable para las 3 operaciones de escritura de la Fase 4:
// publicar (raíz), responder y editar. No sabe nada de Supabase — recibe
// `onSubmit` ya resuelto por quien lo use (CommentsSection/CommentItem) y
// solo maneja su propio estado de texto/pendiente/error.
import { useState, type FormEvent } from 'react';

const MAX_LENGTH = 2000;

export interface CommentFormProps {
  onSubmit: (body: string) => Promise<{ error?: string }>;
  onCancel?: () => void;
  initialValue?: string;
  placeholder?: string;
  submitLabel?: string;
  /** false para el form de edición: al éxito, el padre lo desmonta con onCancel en vez de vaciarlo. */
  clearOnSuccess?: boolean;
  autoFocus?: boolean;
}

export function CommentForm({
  onSubmit,
  onCancel,
  initialValue = '',
  placeholder = 'Escribe un comentario...',
  submitLabel = 'Publicar',
  clearOnSuccess = true,
  autoFocus = false,
}: CommentFormProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isPending) return;

    setIsPending(true);
    const result = await onSubmit(trimmed);
    setIsPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setError(null);
    if (clearOnSuccess) setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        maxLength={MAX_LENGTH}
        autoFocus={autoFocus}
        rows={3}
        className="w-full resize-none rounded-xl border border-white/15 bg-black/40 p-3 text-sm font-sans text-[#F2EDE4] placeholder:text-[#F2EDE4]/30 focus:outline-none focus:border-[#8B2FE0] transition-colors"
      />

      {error && <p className="mt-1.5 text-xs font-sans text-red-400">{error}</p>}

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] font-mono text-[#F2EDE4]/30">
          {value.length}/{MAX_LENGTH}
        </span>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-[#F2EDE4]/60 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isPending || !value.trim()}
            className="px-4 py-1.5 rounded-lg bg-[#8B2FE0] hover:bg-[#C084FC] text-white text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            {isPending ? 'Enviando…' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
