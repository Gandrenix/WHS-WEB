'use client';

import { useState } from 'react';

export function StrataOneSection() {
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(3);

  const specimenCards = [
    {
      cat: 'CAT. SC-001',
      title: 'SomaCore',
      desc: 'Motor de somatotipado clínico-genético. Pipeline de análisis fenotípico y biomarcadores.',
      input: 'GENOTIPO.RAW',
      output: 'SOMATOTIPO.JSON',
      lang: 'PYTHON / R',
      status: 'ACTIVO',
      icon: '🧬',
    },
    {
      cat: 'CAT. YM-002',
      title: 'YOLO MicroMap',
      desc: 'Detección automática de colonias bacterianas en placas de Petri mediante visión por computador.',
      input: 'PETRISET-v2',
      output: 'COLONIA_COUNT',
      lang: 'YOLOv8 / OPENCV',
      status: 'ACTIVO',
      icon: '🧫',
    },
    {
      cat: 'CAT. WC-003',
      title: 'WienerCalc',
      desc: 'Resurrección y refactorización optimizada de motor de cálculo de alta precisión.',
      input: 'LEGACY_C98',
      output: 'REFACTORED',
      lang: 'C / SDL2',
      status: 'ACTIVO',
      icon: '💻',
    },
    {
      cat: 'CAT. KR-004',
      title: 'Kreo Framework',
      desc: 'Marco de cumplimiento regulatorio y orquestación de equipos de investigación clínica.',
      input: 'RES_8430/93',
      output: 'COMPLIANCE',
      lang: 'NEXT.JS / PRISMA',
      status: 'ACTIVO',
      icon: '📋',
    },
  ];

  const workflowSteps = [
    { step: '01', title: 'Adquisición de Datos', desc: 'Entrada de datos crudos' },
    { step: '02', title: 'Limpieza & Normalización', desc: 'Preprocesamiento de señal' },
    { step: '03', title: 'Extracción de Características', desc: 'Selección de características' },
    { step: '04', title: 'Modelos & Inferencia', desc: 'Inferencia algorítmica' },
    { step: '05', title: 'Validación Clínica', desc: 'Control de reglas clínicas' },
    { step: '06', title: 'Reporte & Visualización', desc: 'Generación de informes' },
  ];

  return (
    <section
      id="strata-1"
      className="py-24 bg-[#F2EDE4] text-[#0D0A08] border-b border-[#3A3532]/15 relative font-sans"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-3 font-mono text-sm">
            <span className="px-2.5 py-0.5 bg-[#8B2FE0] text-white font-bold rounded text-xs">
              02
            </span>
            <span className="text-[#2b6b15] font-bold tracking-wider uppercase text-xs">
              STRATA I &bull; -120 m
            </span>
          </div>
          <h2 className="font-mono text-4xl md:text-6xl font-black uppercase text-[#0D0A08] mb-4 tracking-tight">
            HealthTech &amp; Bioinformática
          </h2>
          <p className="font-mono text-sm md:text-base text-[#3A3532] max-w-3xl leading-relaxed">
            Desarrollo de herramientas clínicas y algorítmicas avanzadas para el procesamiento de datos biomédicos. <br />
            <span className="text-[#2b6b15] font-bold">{"// precisión. datos. evidencia."}</span>
          </p>
        </div>

        {/* Specimen Fichas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {specimenCards.map((card) => (
            <div
              key={card.cat}
              className="lab-card p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-[#3A3532]/20 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
            >
              <div>
                <div className="flex justify-between items-center font-mono text-xs text-[#3A3532]/70 mb-3">
                  <span className="font-bold">{card.cat}</span>
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <h3 className="font-mono text-xl font-extrabold text-[#0D0A08] mb-3">{card.title}</h3>
                <p className="font-sans text-xs text-[#3A3532] leading-relaxed mb-6">
                  {card.desc}
                </p>
              </div>

              {/* Data attributes grid */}
              <div className="font-mono text-xs space-y-2 pt-4 border-t border-[#3A3532]/15">
                <div className="flex justify-between">
                  <span className="text-[#3A3532]/70">INPUT:</span>
                  <span className="font-bold text-[#0D0A08]">{card.input}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3A3532]/70">LANG:</span>
                  <span className="font-bold text-[#0D0A08]">{card.lang}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[#3A3532]/70">STATUS:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#7ED957]/30 text-[#2b6b15] border border-[#7ED957]/60">
                    {card.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Exocortex AI Workflow Diagram */}
        <div className="bg-[#0D0A08] text-[#F2EDE4] rounded-2xl p-6 md:p-10 border border-white/10 shadow-2xl">
          <div className="flex flex-wrap justify-between items-center mb-8 gap-4 border-b border-white/15 pb-5">
            <div>
              <span className="font-mono text-xs text-[#7ED957] font-bold tracking-widest block uppercase mb-1">
                EXOCORTEX AI WORKFLOW v2.1
              </span>
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
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {workflowSteps.map((item, idx) => {
              const isActive = activeWorkflowStep === idx;
              return (
                <button
                  key={item.step}
                  onClick={() => setActiveWorkflowStep(idx)}
                  className={`p-4 rounded-xl border transition-all text-left font-mono cursor-pointer ${
                    isActive
                      ? 'bg-[#7ED957]/20 border-[#7ED957] text-[#7ED957] shadow-[0_0_20px_rgba(126,217,87,0.25)] scale-102'
                      : 'bg-white/5 border-white/10 text-white/70 hover:border-white/40 hover:text-white'
                  }`}
                >
                  <div className="text-xs opacity-70 font-bold mb-1">NODO {item.step}</div>
                  <div className="text-xs font-extrabold leading-snug mb-1">{item.title}</div>
                  <div className="text-[10px] opacity-60">{item.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
