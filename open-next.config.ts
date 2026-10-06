// Config del adaptador OpenNext para Cloudflare Workers — convierte el build de Next.js
// (.next) en un Worker (.open-next/worker.js + assets). Se usa con `opennextjs-cloudflare
// build` (ver scripts "cf:build"/"cf:deploy" en package.json); no lo toca `next dev`/`next
// build` normales, así que no afecta el despliegue en Netlify que ya existe.
import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig();
