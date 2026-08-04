'use client';

// Reemplaza el antiguo texto fijo "Bucaramanga, Colombia [ UTC-05:00 ]" del
// footer: en vez de mostrar la sede del estudio, muestra la zona horaria del
// VISITANTE, detectada por su navegador vía Intl.DateTimeFormat. Solo puede
// calcularse en el cliente (el server no conoce el huso horario de quien
// visita) -> arranca en null y se resuelve en un useEffect, para no causar
// mismatch de hidratación entre lo que renderiza el server y el browser.
import { useEffect, useState } from 'react';

function computeVisitorLocationLabel(): string {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const city = timeZone.split('/').pop()?.replace(/_/g, ' ') || timeZone;

  const offsetMinutes = -new Date().getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absMinutes = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absMinutes / 60)).padStart(2, '0');
  const minutes = String(absMinutes % 60).padStart(2, '0');

  return `${city} [ UTC${sign}${hours}:${minutes} ]`;
}

export function VisitorLocalTime() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    try {
      setLabel(computeVisitorLocationLabel());
    } catch {
      // Intl.DateTimeFormat no debería fallar en ningún navegador moderno,
      // pero si lo hace, se deja el placeholder en vez de romper el footer.
    }
  }, []);

  return <>{label ?? ' '}</>;
}
