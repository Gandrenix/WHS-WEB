<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Wiener Hound Studios (WHS-Frontend) — Arquitectura Vertical Slice + Entities + Shared

Este proyecto utiliza una **Arquitectura Vertical Slice** con una capa de **Entities** (inspirada en Feature-Sliced Design) e infraestructura técnica en **Shared**.

---

## 1. Principios y Reglas de Dependencias

Dirección de dependencias estricta: `app -> features -> entities -> shared`.

1. **`src/app/`**: Enrutamiento puro (App Router), layouts, metadata y composición. Cero lógica de negocio, transformaciones o queries directas a Supabase.
2. **`src/features/`**: Slices verticales independientes de negocio (`navbar`, `landing`, `footer`, `categories`, `admin-dashboard`, `auth`).
   - Cada feature contiene sus componentes UI, hooks, schemas de validación y Server Actions.
   - Jamás hay imports cruzados directos entre dos features. Todo pasa por el `index.ts` público de la feature.
3. **`src/entities/`**: Objetos de dominio compartidos entre dos o más features (ej: `entities/project`).
   - Solo lecturas públicas y tarjetas UI reutilizables.
   - `index.ts` público exporta componentes/tipos seguros para cliente.
   - `server.ts` público exporta repositorios `server-only`.
4. **`src/shared/`**: Infraestructura técnica pura (`ui`, `lib/supabase`, `config`, `hooks`, `types`).
   - Jamás importa de `app`, `features` o `entities`.

---

## 2. Convenciones de Código y Estado

- **Server Components por defecto:** Directiva `'use client'` solo en islas pequeñas que lo requieran, siempre acompañada de comentario explicativo en la primera línea.
- **Server-Only:** Todo módulo con credenciales, cookies o acceso directo de servidor incluye `import 'server-only'`.
- **Formularios React 19:** Uso de la primitiva `useActionState` para conectar formularios cliente con Server Actions.
- **Validación con Zod:** Todas las Server Actions de administración validan las entradas con Zod antes de consultar o escribir en Supabase.
- **Animaciones GSAP:** Uso del hook oficial `useGSAP()` de `@gsap/react` con `scope: containerRef` explícito al contenedor y respetando `prefers-reduced-motion`.
- **Design Tokens Tailwind 4:** Uso de la paleta del tema (`text-primary`, `bg-bg-dark-primary`, `btn-primary`, `btn-secondary`) evitando valores hex sueltos arbitrarios.
