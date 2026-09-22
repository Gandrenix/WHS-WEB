// Genera los sprites de nubes del sitio (src/shared/assets/clouds/*.webp).
//
// Por qué sprites y no CSS/SVG/three.js: una nube prerenderizada que solo se mueve con
// `transform` corre en el compositor (sin repintar ni recalcular filtros), mientras que
// un filtro feTurbulence bajo un elemento animado se recalcula entero en cada fotograma
// y Vanta/three.js suma ~120 KB gzip + WebGL. Aquí las nubes no son un asset genérico:
// se calculan (ruido fractal + iluminación) con la paleta de la marca.
//
// Iluminación: la luz viene de ABAJO (el amanecer del footer está en el horizonte), así
// que el vientre de cada nube brilla y la cima queda en sombra. Para cada píxel se mide
// cuánta nube hay entre él y la luz (profundidad óptica) y eso decide su brillo.
//
// Uso:  node scripts/generate-clouds.mjs   (determinista: misma salida cada vez)

import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/shared/assets/clouds');
mkdirSync(OUT, { recursive: true });

// ---------- utilidades ----------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smoothstep = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(ix, iy, seed) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function vnoise(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy, seed), b = hash(ix + 1, iy, seed), c = hash(ix, iy + 1, seed), d = hash(ix + 1, iy + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, seed, oct = 6) {
  let amp = 0.5, f = 1, s = 0, norm = 0;
  for (let i = 0; i < oct; i++) { s += amp * vnoise(x * f, y * f, seed + i * 31); norm += amp; f *= 2.05; amp *= 0.5; }
  return s / norm;
}

// ---------- paletas ----------
const PALETTES = {
  // sobre el cielo claro del horizonte: blanco cálido arriba de la luz, sombras lavanda
  day: { lit: hex('#FFFDFB'), shade: hex('#B3A6CB'), rim: hex('#FFFFFF'), alpha: 1 },
  // sobre el cielo oscuro: el vientre recibe la luz del amanecer (lila pálido), la cima es violeta profundo
  dusk: { lit: hex('#EBD9F7'), shade: hex('#3E3360'), rim: hex('#FFF4FA'), alpha: 0.9 },
};

// ---------- formas ----------
/**
 * Campo tipo metaball por SUMA: cada círculo aporta una caída cuadrática y todos se
 * suman, así los círculos vecinos se funden en una sola masa conectada. (Con producto
 * o con exponentes altos salían bolas separadas, como burbujas.)
 */
function blobField(blobs) {
  return (x, y) => {
    let sum = 0;
    for (const [cx, cy, r] of blobs) {
      const d = Math.min(1, Math.hypot(x - cx, y - cy) / r);
      sum += (1 - d) * (1 - d);
    }
    return sum;
  };
}

const SHAPES = {
  bank(W, H, r) {
    const baseY = H * 0.84;
    const blobs = [];
    const n = 20;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const env = Math.sin(Math.PI * (0.05 + 0.9 * t)) ** 0.75;
      const rad = H * (0.2 + 0.2 * env * (0.55 + 0.7 * r()));
      blobs.push([W * (0.06 + 0.88 * t) + (r() - 0.5) * W * 0.02, baseY - rad * 0.62 - env * H * 0.12 * r(), rad]);
    }
    for (let i = 0; i < 12; i++) {
      const t = 0.1 + 0.8 * r();
      const env = Math.sin(Math.PI * t) ** 0.75;
      blobs.push([W * t, baseY - H * (0.32 + 0.2 * env) - r() * H * 0.05, H * (0.1 + 0.08 * r())]);
    }
    return { field: blobField(blobs), threshold: 0.3, baseY, baseWobble: H * 0.012, aniso: [1, 1], warp: 1 };
  },
  cumulus(W, H, r) {
    const baseY = H * 0.88;
    const blobs = [];
    const rows = [[7, 0.2, 0.86], [6, 0.19, 0.68], [5, 0.17, 0.52], [4, 0.15, 0.38], [3, 0.12, 0.24]];
    rows.forEach(([count, rad, spread], row) => {
      for (let i = 0; i < count; i++) {
        const t = count === 1 ? 0.5 : i / (count - 1);
        blobs.push([W * (0.5 + (t - 0.5) * spread) + (r() - 0.5) * W * 0.03, baseY - H * (0.12 + row * 0.15), H * rad * (0.85 + 0.3 * r())]);
      }
    });
    blobs.push([W * 0.5, H * 0.2, H * 0.1]);
    return { field: blobField(blobs), threshold: 0.3, baseY, baseWobble: H * 0.012, aniso: [1, 1], warp: 1 };
  },
  puff(W, H, r) {
    const baseY = H * 0.86;
    const blobs = [];
    const spec = [[0.22, 0.66, 0.22], [0.4, 0.46, 0.27], [0.6, 0.5, 0.25], [0.78, 0.66, 0.2], [0.5, 0.7, 0.24]];
    for (const [x, y, rad] of spec) blobs.push([W * x + (r() - 0.5) * W * 0.02, H * y, H * rad]);
    return { field: blobField(blobs), threshold: 0.3, baseY, baseWobble: H * 0.012, aniso: [1, 1], warp: 1 };
  },
  wisp(W, H) {
    // estratos alargados y translúcidos: elipses planas + ruido estirado en horizontal
    const streaks = [[0.5, 0.5, 0.48, 0.2], [0.3, 0.34, 0.3, 0.13], [0.72, 0.64, 0.3, 0.12]];
    const field = (x, y) => {
      let sum = 0;
      for (const [cx, cy, rx, ry] of streaks) {
        const d = Math.min(1, Math.hypot((x - cx * W) / (rx * W), (y - cy * H) / (ry * H)));
        sum += (1 - d) * (1 - d);
      }
      return sum;
    };
    return { field, threshold: 0.12, baseY: H * 4, baseWobble: 0, aniso: [0.2, 1.7], warp: 0.5 };
  },
};

function boxBlur(src, W, H, radius) {
  const tmp = new Float32Array(W * H), dst = new Float32Array(W * H);
  const win = radius * 2 + 1;
  for (let y = 0; y < H; y++) {
    let acc = 0;
    for (let x = -radius; x <= radius; x++) acc += src[y * W + clamp(x, 0, W - 1)];
    for (let x = 0; x < W; x++) {
      tmp[y * W + x] = acc / win;
      acc += src[y * W + clamp(x + radius + 1, 0, W - 1)] - src[y * W + clamp(x - radius, 0, W - 1)];
    }
  }
  for (let x = 0; x < W; x++) {
    let acc = 0;
    for (let y = -radius; y <= radius; y++) acc += tmp[clamp(y, 0, H - 1) * W + x];
    for (let y = 0; y < H; y++) {
      dst[y * W + x] = acc / win;
      acc += tmp[clamp(y + radius + 1, 0, H - 1) * W + x] - tmp[clamp(y - radius, 0, H - 1) * W + x];
    }
  }
  return dst;
}

// ---------- render ----------
function render({ name, shape, palette, W, H, seed, quality = 82 }) {
  const r = rng(seed);
  const { field, threshold, baseY, baseWobble, aniso, warp } = SHAPES[shape](W, H, r);
  const pal = PALETTES[palette];

  // 1) densidad: forma con el dominio DISTORSIONADO (contorno irregular) + ruido fractal
  //    cuya amplitud es mayor en el borde (m bajo) → bordes en coliflor, núcleo sólido.
  const dens = new Float32Array(W * H);
  const s1 = 130, s2 = 62;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const wx = x + (fbm((x / s1) * aniso[0], (y / s1) * aniso[1], seed + 1, 4) - 0.5) * 46 * warp;
      const wy = y + (fbm((x / s1) * aniso[0], (y / s1) * aniso[1], seed + 2, 4) - 0.5) * 46 * warp;
      const m = field(wx, wy);
      if (m < 0.02) continue;
      const n = fbm((x / s2) * aniso[0], (y / s2) * aniso[1], seed + 3, 6);
      const edge = 1 - clamp(m / 1.4);
      const d = m * 0.9 + (n - 0.5) * (0.35 + 0.7 * edge) - threshold + 0.5;
      const cut = 1 - smoothstep(baseY - 6, baseY + 6, y + (fbm(x / 34, 0, seed + 5, 3) - 0.5) * baseWobble * 2);
      dens[y * W + x] = d * cut + (1 - cut) * -1;
    }
  }

  // 2) alfa: umbral estrecho (contorno definido) y un desenfoque mínimo (sin dientes)
  const hard = new Float32Array(W * H);
  for (let i = 0; i < hard.length; i++) hard[i] = smoothstep(0.3, 0.72, dens[i]);
  const alpha = boxBlur(hard, W, H, 2);

  // Que ninguna nube toque el borde del sprite: si la forma llega al límite de la imagen,
  // el navegador la corta en seco (se ve como un recorte recto). Se desvanece hacia los
  // bordes laterales y el superior; el inferior solo en las nubes sin base plana (wisp).
  const fadeX = W * 0.14, fadeTop = H * 0.12, fadeBottom = baseY > H ? H * 0.16 : 0;
  for (let y = 0; y < H; y++) {
    const fy = smoothstep(0, fadeTop, y) * (fadeBottom ? smoothstep(0, fadeBottom, H - 1 - y) : 1);
    for (let x = 0; x < W; x++) {
      alpha[y * W + x] *= smoothstep(0, fadeX, x) * smoothstep(0, fadeX, W - 1 - x) * fy;
    }
  }

  // 3) volumen: espesor suavizado, y luz desde abajo (algo desde la izquierda)
  const thick = boxBlur(alpha, W, H, Math.max(3, Math.round(H * 0.045)));
  const steps = 14, stepPx = H / 30, lx = -0.3;
  const out = Buffer.alloc(W * H * 4);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const a = alpha[i];
      if (a <= 0.004) continue;
      // cuánta nube hay entre este punto y la luz
      let depth = 0;
      for (let k = 1; k <= steps; k++) {
        const sx = Math.round(x + lx * stepPx * k), sy = Math.round(y + stepPx * k);
        if (sx < 0 || sx >= W || sy < 0 || sy >= H) break;
        depth += thick[sy * W + sx];
      }
      const transmit = Math.exp(-(depth / steps) * 1.15);
      // relieve fino: las caras que miran hacia abajo (densidad que decrece hacia abajo) reciben luz
      const gy = dens[(y + 1) * W + x] - dens[(y - 1) * W + x];
      const gx = dens[y * W + x + 1] - dens[y * W + x - 1];
      const relief = clamp(-(gy * 1.0 + gx * 0.25) * 1.4);
      const lit = clamp(transmit * 0.95 + relief * 0.45 + 0.12) ** 0.9;
      let col = mix(pal.shade, pal.lit, lit);
      col = mix(col, pal.rim, smoothstep(0.7, 0.15, a) * 0.5); // borde plateado
      const o = i * 4;
      out[o] = col[0]; out[o + 1] = col[1]; out[o + 2] = col[2];
      out[o + 3] = Math.round(clamp(a * pal.alpha) * 255);
    }
  }
  return { name, W, H, buf: out, quality };
}

const JOBS = [
  { name: 'bank-day', shape: 'bank', palette: 'day', W: 1600, H: 440, seed: 11 },
  { name: 'bank-dusk', shape: 'bank', palette: 'dusk', W: 1600, H: 440, seed: 23 },
  { name: 'cumulus-day', shape: 'cumulus', palette: 'day', W: 1000, H: 560, seed: 37 },
  { name: 'cumulus-dusk', shape: 'cumulus', palette: 'dusk', W: 1000, H: 560, seed: 41 },
  { name: 'puff-day', shape: 'puff', palette: 'day', W: 640, H: 340, seed: 53 },
  { name: 'puff-dusk', shape: 'puff', palette: 'dusk', W: 640, H: 340, seed: 59 },
  { name: 'wisp-day', shape: 'wisp', palette: 'day', W: 1600, H: 220, seed: 67 },
  { name: 'wisp-dusk', shape: 'wisp', palette: 'dusk', W: 1600, H: 220, seed: 71 },
];

let total = 0;
for (const job of JOBS) {
  const t0 = Date.now();
  const { name, W, H, buf, quality } = render(job);
  const file = path.join(OUT, `${name}.webp`);
  const info = await sharp(buf, { raw: { width: W, height: H, channels: 4 } })
    .webp({ quality, alphaQuality: 88, effort: 6, smartSubsample: true })
    .toFile(file);
  total += info.size;
  console.log(`${name.padEnd(14)} ${W}x${H}  ${(info.size / 1024).toFixed(1).padStart(6)} KB  (${Date.now() - t0} ms)`);
}
console.log(`TOTAL ${(total / 1024).toFixed(1)} KB`);
