# Tracker de Migración — Arquitectura Vertical Slice (WHS-Frontend)

Este archivo es la fuente de verdad persistente sobre el estado de la refactorización arquitectónica de `whs-frontend`.

---

## Estado General

- **Fase actual:** MIGRACIÓN COMPLETA (Fase -1 a Fase 7)
- **Última actualización:** 2026-08-01
- **Resultado final:** `npm run build` **VERDE**, `npm run lint` **0 ERRORES**.

---

## Registro de Fases

### Fase -1 — Auditoría Inicial (Completada)
- **Fecha:** 2026-08-01
- **Inspección del Proyecto:**
  - Stack verificado: Next.js `16.2.4` (App Router), React `19.2.4`, Supabase JS `2.105.1`, `@supabase/ssr` `0.10.2`, GSAP `3.15.0`, Tailwind CSS `v4`.
  - Rutas existentes: `/`, `/categorias`, `/admin`, `/admin/dashboard`, `/admin/dashboard/nuevo`, `/auth/signout`.
  - Estado base de `npm run build`: **Exitoso (0 errores)**.
  - Estado base de `npm run lint`: **2 errores preexistentes en código legacy** (`Navbar.tsx` y `nuevo/page.tsx`).

---

### Fase 0 — Andamiaje y Configuración (Completada)
- **Archivos creados/modificados:**
  - `eslint.config.mjs`: Instalado y configurado `eslint-plugin-boundaries` v7 con la regla `boundaries/dependencies` y políticas de isolación de capas.
  - `package.json`: Instalados paquetes `server-only`, `@gsap/react`, `zod` y `eslint-plugin-boundaries`.
  - `AGENTS.md`: Actualizado con las directivas de arquitectura Vertical Slice.
  - Estructura de directorios creada en `src/`: `features/`, `entities/`, `shared/`.

---

### Fase 1 — Capa `shared/` (Completada)
- **Archivos creados en `src/shared/`:** `config/env.ts`, `config/site.ts`, `types/database.types.ts`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, `ui/Button.tsx`, `ui/Container.tsx`, `ui/Section.tsx`, `hooks/useMediaQuery.ts`, `index.ts`.
- **Archivos actualizados:** `src/middleware.ts`.
- **Verificación:** `npm run build` en verde, `shared/` 100% libre de errores.

---

### Fase 2 — Capa `entities/project/` (Completada)
- **Archivos creados en `src/entities/project/`:** `types.ts`, `data/projects.repository.ts`, `components/ProjectCard.tsx`, `index.ts`, `server.ts`.
- **Verificación:** `npm run build` en verde, `entities/project/` 100% libre de errores.

---

### Fase 3 — `features/navbar/` (Completada)
- **Archivos creados en `src/features/navbar/`:** `hooks/useLogoAudio.ts`, `hooks/useMobileMenu.ts`, `components/LogoAudioPlayer.tsx`, `components/CategoriesDropdown.tsx`, `components/MobileMenuToggle.tsx`, `components/Navbar.tsx`, `index.ts`.
- **Bugs resueltos:** Bug A (despliegue de menú móvil), Bug B (submenú con estado independiente), React Compiler `set-state-in-effect` corregido.
- **Archivos eliminados:** `src/components/Navbar.tsx`.
- **Verificación:** `npm run build` en verde, `features/navbar/` 100% libre de errores.

---

### Fase 4 — `features/landing/` (Completada)
- **Archivos creados en `src/features/landing/`:** `hooks/useLandingAnimations.ts` (`@gsap/react` `useGSAP()` con scope y prefers-reduced-motion), `components/Hero.tsx` (Bug C resuelto), `ServicesSection.tsx`, `VideoSection.tsx`, `PortfolioPreview.tsx`, `TeamSection.tsx`, `ContactSection.tsx`, `HomeClient.tsx`, `index.ts`.
- **Bugs resueltos:** Bug C (texto responsive en pantallas pequeñas).
- **Archivos eliminados:** `src/app/HomeClient.tsx`.
- **Verificación:** `npm run build` en verde, `features/landing/` 100% libre de errores.

---

### Fase 5 — `features/categories/` (Completada)
- **Archivos creados en `src/features/categories/`:** `components/CategoriasClient.tsx`, `index.ts`.
- **Archivos eliminados:** `src/app/categorias/CategoriasClient.tsx`.
- **Verificación:** `npm run build` en verde, `features/categories/` 100% libre de errores.

---

### Fase 6 — `features/admin-dashboard/` y `features/auth/` (Completada)
- **Archivos creados en `src/features/auth/`:** `actions/auth.actions.ts`, `components/LoginForm.tsx` (`useActionState` React 19), `components/SignOutButton.tsx`, `index.ts`.
- **Archivos creados en `src/features/admin-dashboard/`:** `schemas/project.schema.ts` (Zod), `actions/project.actions.ts` (defensa en profundidad + revalidatePath), `components/ProjectForm.tsx` (`useActionState` React 19), `components/ProjectList.tsx` (`<Image />` optimizado), `index.ts`.
- **Límites de Error y Carga:** Creados `error.tsx` y `loading.tsx` en `app/admin/dashboard/` y `app/categorias/`.
- **Verificación:** `npm run build` en verde.

---

### Fase 7 — Limpieza Final y Consolidación (Completada)
- **Archivos creados en `src/features/footer/`:** `components/Footer.tsx`, `index.ts`.
- **Directorios legacy eliminados:** `src/components/`, `src/lib/`, `src/utils/`.
- **Configuración de Boundaries:** `eslint.config.mjs` actualizado excluyendo reglas de compatibilidad legacy.
- **Documentación:** `AGENTS.md` consolidado reflejando la arquitectura Vertical Slice terminada.
- **Verificación final:**
  - `npm run build`: **0 ERRORES / VERDE**.
  - `npm run lint`: **0 ERRORES / VERDE**.
