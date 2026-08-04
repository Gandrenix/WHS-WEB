'use client';

import { useActionState, useEffect, useState } from 'react';
import { X, Loader2, CheckCircle2, Mail } from 'lucide-react';
import { sendContactMessageAction, type ContactActionResponse } from '../actions/contact.actions';

export interface ContactModalProps {
  /** Clase del botón disparador, para que cada sitio de uso (Footer, Resurface...) mantenga su propio estilo. */
  triggerClassName?: string;
  triggerLabel?: string;
}

const initialState: ContactActionResponse = { error: null };

export function ContactModal({
  triggerClassName = 'inline-block mt-3 px-4 py-2 rounded-lg bg-[#8B2FE0] text-white font-bold hover:bg-[#8B2FE0]/90 transition-all shadow-sm',
  triggerLabel = 'HABLEMOS DE TU PROYECTO →',
}: ContactModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(sendContactMessageAction, initialState);

  // Cierra el modal solo (nunca) automáticamente en error, para que el
  // visitante vea el mensaje y pueda corregir sin perder lo que ya escribió.
  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => setIsOpen(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-mono animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#120A08] border border-[#8B2FE0] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C084FC]" /> HABLEMOS DE TU PROYECTO
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-[#F2EDE4]/60 hover:text-white cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {state?.success ? (
              <div className="py-8 flex flex-col items-center text-center gap-3">
                <CheckCircle2 className="w-10 h-10 text-[#7ED957]" />
                <p className="text-white font-bold text-sm">¡Mensaje enviado!</p>
                <p className="text-[#F2EDE4]/70 text-xs font-sans">
                  Te responderemos pronto a tu correo.
                </p>
              </div>
            ) : (
              <form action={formAction} className="space-y-4">
                {/* Honeypot: campo invisible para humanos (los bots que rellenan
                    todos los inputs de un form sí lo completan). No usar
                    display:none/visibility:hidden porque algunos bots los
                    detectan y los saltan; en cambio se saca de pantalla. */}
                <input
                  type="text"
                  name="company_website"
                  tabIndex={-1}
                  autoComplete="off"
                  className="absolute -left-[9999px] w-px h-px opacity-0"
                  aria-hidden="true"
                />

                {state?.error && (
                  <div className="p-3 bg-[#7A1220]/40 border border-[#7A1220] rounded-xl text-white text-xs font-bold">
                    {state.error}
                  </div>
                )}

                <div>
                  <label className="block mb-1.5 text-[11px] font-bold text-[#F2EDE4]/80 uppercase tracking-wider">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Tu nombre"
                    className="w-full p-3 border border-white/20 bg-black/60 text-white rounded-xl focus:border-[#8B2FE0] focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-[11px] font-bold text-[#F2EDE4]/80 uppercase tracking-wider">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="tu@correo.com"
                    className="w-full p-3 border border-white/20 bg-black/60 text-white rounded-xl focus:border-[#8B2FE0] focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-[11px] font-bold text-[#F2EDE4]/80 uppercase tracking-wider">
                    Contanos sobre tu proyecto
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="¿Qué tenés en mente?"
                    className="w-full p-3 border border-white/20 bg-black/60 text-white rounded-xl focus:border-[#8B2FE0] focus:outline-none text-xs resize-none font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-[#8B2FE0] hover:bg-[#C084FC] text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ENVIAR MENSAJE →'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
