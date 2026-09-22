'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Database, Sparkles, ScanSearch, Cpu, ShieldCheck, FileBarChart, ChevronRight } from 'lucide-react';
import type { SpecimenCard } from '@/entities/specimen-card';
import { SectionStrataBackdrop } from '@/shared/ui/SectionStrataBackdrop';

/** Esquinas cortadas en diagonal — ficha de laboratorio, no tarjeta redondeada genérica. */
const TICKET_CLIP = 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))';

export interface StrataOneSectionProps {
  /** Fichas editables desde /admin/dashboard/especimenes (ver app/page.tsx). */
  specimenCards: SpecimenCard[];
}

export function StrataOneSection({ specimenCards }: StrataOneSectionProps) {
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(3);

  const workflowSteps = [
    { step: '01', title: 'Adquisición de Datos', desc: 'Entrada de datos crudos', Icon: Database },
    { step: '02', title: 'Limpieza & Normalización', desc: 'Preprocesamiento de señal', Icon: Sparkles },
    { step: '03', title: 'Extracción de Características', desc: 'Selección de características', Icon: ScanSearch },
    { step: '04', title: 'Modelos & Inferencia', desc: 'Inferencia algorítmica', Icon: Cpu },
    { step: '05', title: 'Validación Clínica', desc: 'Control de reglas clínicas', Icon: ShieldCheck },
    { step: '06', title: 'Reporte & Visualización', desc: 'Generación de informes', Icon: FileBarChart },
  ];

  return (
    <section
      id="strata-1"
      className="py-24 bg-[#1D1A28] text-[#F2EDE4] relative font-sans"
    >
      <SectionStrataBackdrop from="#1D1A28" to="#161320" interactive />
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-3 font-mono text-sm">
            <span className="px-2.5 py-0.5 bg-[#8B2FE0] text-white font-bold rounded text-xs">
              02
            </span>
            <span className="text-[#7ED957] font-bold tracking-wider uppercase text-xs">
              STRATA I &bull; -120 m
            </span>
          </div>
          <h2 className="font-mono text-4xl md:text-6xl font-black uppercase text-[#F2EDE4] mb-4 tracking-tight">
            HealthTech &amp; Bioinformática
          </h2>
          <p className="font-mono text-sm md:text-base text-[#F2EDE4]/75 max-w-3xl leading-relaxed">
            Desarrollo de herramientas clínicas y algorítmicas avanzadas para el procesamiento de datos biomédicos. <br />
            <span className="text-[#7ED957] font-bold">{"// precisión. datos. evidencia."}</span>
          </p>
        </div>

        {/* Specimen Fichas Grid — fichas de requisición de laboratorio, no cards genéricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 mb-16">
          {specimenCards.map((card, idx) => (
            <div
              key={card.id}
              className="fade-up relative bg-[#F2EDE4] border-2 border-[#3A3532]/30 hover:border-[#8B2FE0] flex flex-col justify-between transition-colors"
              style={{ clipPath: TICKET_CLIP, filter: 'drop-shadow(4px 5px 0px rgba(139,47,224,0.45))' }}
            >
              <div className="p-5 pb-4">
                <div className="flex justify-between items-center font-mono text-[10px] text-[#3A3532]/70 mb-3">
                  <span className="font-bold tracking-widest">
                    ESPÉCIMEN N.&#176;{String(idx + 1).padStart(2, '0')} &mdash; {card.cat}
                  </span>
                  {card.image_url ? (
                    <div className="relative w-9 h-9 overflow-hidden border border-[#3A3532]/20 shrink-0">
                      <Image src={card.image_url} alt={card.title} fill className="object-cover" />
                    </div>
                  ) : (
                    <span className="text-2xl">{card.icon}</span>
                  )}
                </div>
                <h3 className="font-mono text-xl font-extrabold text-[#0D0A08] mb-3">{card.title}</h3>
                <p className="font-sans text-xs text-[#3A3532] leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Línea de perforación — separa el encabezado del talón de datos, como un ticket real */}
              <div
                className="mx-5 h-0 border-t-2 border-dashed border-[#3A3532]/30"
                aria-hidden="true"
              />

              {/* Talón de datos */}
              <div className="font-mono text-xs space-y-2 p-5 pt-4">
                <div className="flex justify-between">
                  <span className="text-[#3A3532]/70">INPUT:</span>
                  <span className="font-bold text-[#0D0A08]">{card.input_label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3A3532]/70">OUTPUT:</span>
                  <span className="font-bold text-[#0D0A08]">{card.output_label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3A3532]/70">LANG:</span>
                  <span className="font-bold text-[#0D0A08]">{card.lang_label}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[#3A3532]/70">STATUS:</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#7ED957]/30 text-[#2b6b15] border border-[#7ED957]/60">
                    {card.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Exocortex AI Workflow Diagram */}
        <div className="fade-up relative bg-[#0D0A08] text-[#F2EDE4] p-6 md:p-10 border-2 border-[#7ED957]/40">
          <div className="flex flex-wrap justify-between items-center mb-8 gap-4 border-b border-white/15 pb-5">
            <div>
              <h3 className="font-mono text-base md:text-lg text-white font-bold">
                Pipeline de Procesamiento de Datos Clínico-Genéticos
              </h3>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-[#7ED957] font-bold bg-[#7ED957]/10 px-3 py-1.5 rounded-full border border-[#7ED957]/30">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7ED957] animate-ping"></span>
              <span>FLUJO ACTIVO EN PRODUCCIÓN</span>
            </div>
          </div>

          {/* Workflow Steps Horizontal Pipeline */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 lg:gap-0 lg:flex lg:items-stretch">
            {workflowSteps.map((item, idx) => {
              const isActive = activeWorkflowStep === idx;
              const { Icon } = item;
              return (
                <div key={item.step} className="contents lg:flex lg:items-center lg:flex-1">
                  <button
                    onClick={() => setActiveWorkflowStep(idx)}
                    className={`relative flex-1 p-4 border transition-all text-left font-mono cursor-pointer ${
                      isActive
                        ? 'bg-[#7ED957]/20 border-[#7ED957] text-[#7ED957] shadow-[0_0_20px_rgba(126,217,87,0.25)] scale-102'
                        : 'bg-white/5 border-white/10 text-white/70 hover:border-white/40 hover:text-white'
                    }`}
                  >
                    <Icon size={16} className="mb-2" strokeWidth={2.25} />
                    <div className="text-xs opacity-70 font-bold mb-1">NODO {item.step}</div>
                    {/* break-words: "Características" (15 letras) es más ancha que la
                        columna en móvil (grid-cols-2) y sin esto se salía de la tarjeta
                        en vez de partirse — las demás palabras del set son más cortas y
                        nunca lo necesitaron, por eso no se notó antes. */}
                    <div className="text-xs font-extrabold leading-snug mb-1 break-words">{item.title}</div>
                    <div className="text-[10px] opacity-60 break-words">{item.desc}</div>
                  </button>
                  {idx < workflowSteps.length - 1 && (
                    <ChevronRight
                      size={16}
                      className="hidden lg:block shrink-0 mx-1 text-white/25"
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
