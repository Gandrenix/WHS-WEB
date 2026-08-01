# Wiener Hound Studios (WHS) - Upgrade Roadmap & System Architecture

Este documento detalla la arquitectura de software implementada en el proyecto `whs-frontend`, la cual ha sido actualizada exitosamente desde un sitio estático legacy a una **Arquitectura por Vertical Slices** con Next.js 16, React 19, Supabase SSR y Tailwind CSS 4.

---

## 1. Estado del Proyecto (COMPLETADO)

### Migración Finalizada
- **Stack Moderno:** Next.js `16.2.4` (App Router), React `19.2.4`, Supabase `@supabase/ssr`, Tailwind CSS `v4`, GSAP `@gsap/react`, Zod.
- **Estructura Vertical Slice:** Modularización por dominios (`features/`, `entities/`, `shared/`, `app/`).
- **Panel Administrativo Dinámico:** Dashboard gestor de proyectos (`/admin/dashboard`) con Server Actions autenticadas.
- **Aislamiento Arquitectónico:** Verificación estricta mediante `eslint-plugin-boundaries` v7.

---

## 2. Resumen de la Arquitectura Implementada

### A. Capa de Enrutamiento (`src/app/`)
- Contiene exclusivamente layouts, rutas, metadatos y orquestación de entrypoints hacia `features/`.
- Cero lógica de negocio o consultas directas a la base de datos.

### B. Slices Verticales (`src/features/`)
- **`navbar`**: Shell Server Component con islas de cliente para el reproductor de audio easter egg y el menú móvil interactivo.
- **`landing`**: Secciones visuales de la página de inicio con animaciones `useGSAP()` adaptativas.
- **`categories`**: Vista pública filtrada por categorías que consume componentes de entidad `entities/project`.
- **`admin-dashboard`**: Módulo administrativo con formulario de publicación (`useActionState`), lista optimizada de proyectos e invalidación de caché vía `revalidatePath`.
- **`auth`**: Módulo de autenticación con Server Actions de login/cierre de sesión.

### C. Capa de Entidades Compartidas (`src/entities/`)
- **`project`**: Definición de tipos de dominio (`Project`), repositorios de solo lectura `server-only` (`getRecentProjects`, `getAllProjects`) y tarjetas UI reutilizables (`ProjectCard`).

### D. Capa de Infraestructura (`src/shared/`)
- Componentes UI fundamentales (`Button`, `Container`, `Section`).
- Clientes de Supabase para cliente, servidor y middleware con `@supabase/ssr`.
- Validación centralizada de entorno (`env.ts`) y configuración estática (`site.ts`).