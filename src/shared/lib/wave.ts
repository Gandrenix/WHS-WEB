/**
 * Curva suave (tangentes horizontales) que cruza un lienzo de lado a lado. Es la base
 * de todas las isolíneas ESTRATO: fondos de sección, transición del footer, categorías.
 */
export function wavePath(baseY: number, amp: number, phase: number, width = 1440, steps = 6): string {
  const dx = width / steps;
  const pts = Array.from({ length: steps + 1 }, (_, i) => [i * dx, +(baseY + amp * Math.sin(i * 1.15 + phase)).toFixed(1)]);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    d += ` C${px + dx / 2},${py} ${x - dx / 2},${y} ${x},${y}`;
  }
  return d;
}
