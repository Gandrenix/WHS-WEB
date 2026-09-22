// Saca los fotogramas ASCII del componente (donde viajaban dentro del bundle JS: ~18 MB
// que bajaban con la página) a un archivo estático `public/ascii/mrna-frames.txt` que
// se descarga solo cuando la animación entra en pantalla, y que el CDN sirve comprimido.
// Ya recorta el tercio inferior (el componente siempre lo ocultaba) y los espacios finales.
//
// Uso: node scripts/extract-ascii-frames.mjs <ruta-al-componente-viejo.tsx>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const src = readFileSync(process.argv[2], 'utf8').replace(/\r\n/g, '\n');
const start = src.indexOf('const FRAMES = [');
const end = src.indexOf('\n];', start);
const frames = new Function(`return ${src.slice(start + 'const FRAMES = '.length, end + 2)}`)();

const out = frames.map((f) => {
  const lines = f.split('\n');
  const keep = lines.slice(0, Math.floor(lines.length * 0.67));
  return keep.map((l) => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');
});

mkdirSync('public/ascii', { recursive: true });
const body = out.join('\f');
writeFileSync('public/ascii/mrna-frames.txt', body);
console.log(`frames=${out.length} raw=${(body.length / 1024).toFixed(0)}KB gzip=${(gzipSync(body).length / 1024).toFixed(0)}KB`);
