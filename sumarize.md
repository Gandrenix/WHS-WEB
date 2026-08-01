# Wiener Hound Studios (WHS) - Resumen y Análisis del Proyecto

## 1. Entorno de Desarrollo y Stack Tecnológico
- **Framework:** Next.js `16.2.4` (App Router)
- **Biblioteca UI:** React `19.2.4`
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS `v4` (Design tokens en CSS `@theme`)
- **Base de Datos y Autenticación:** Supabase con `@supabase/ssr`
- **Animaciones:** GSAP con `@gsap/react` (`useGSAP` y `scope`)
- **Validación:** Zod
- **Calidad y Aislamiento:** `eslint-plugin-boundaries` v7

---

## 2. Descripción General del Sistema
El proyecto **whs-frontend** ha sido refactorizado completamente hacia una **Arquitectura Vertical Slice** complementada con una capa de **Entities** para datos de dominio compartidos e infraestructura en **Shared**.

### Características Clave:
- **Portafolio Dinámico:** Los proyectos se consultan en tiempo real desde Supabase mediante Server Components y repositorios de solo lectura (`entities/project`).
- **Panel de Administración Protegido:** Gestor administrativo de contenidos (`/admin/dashboard`) para agregar y administrar proyectos de Manga, Anime y Novelas Visuales con validación Zod y Server Actions.
- **Defensa en Profundidad:** Protección de autenticación en tres niveles: Next.js Middleware, verificación de usuario en Server Actions y RLS en Supabase.
- **Rendimiento y Accesibilidad:** Animaciones GSAP optimizadas con limpieza automática y respeto a `prefers-reduced-motion`, menú hamburguesa accesible por teclado con estado independiente para submenús y renderizado JSX condicional.

---

## 3. Estructura de Directorios y Módulos

### Directorio Raíz (`/whs-frontend`)
- **`package.json`**: Dependencias actualizadas (`@supabase/ssr`, `@gsap/react`, `zod`, `eslint-plugin-boundaries`, `server-only`).
- **`eslint.config.mjs`**: Configuración de reglas de fronteras de código (`boundaries/dependencies`) para aislar capas.
- **`AGENTS.md`**: Directivas de arquitectura y desarrollo para asistentes de IA.
- **`MIGRATION_PROGRESS.md`**: Registro histórico persistente del proceso de migración por fases.

### Código Fuente (`/src`)
#### `app/` (Enrutamiento Puro App Router)
- **`layout.tsx`**: Layout principal que compone `<Navbar />` y `<Footer />` desde `features/`.
- **`page.tsx`**: Server Component que llama a `getRecentProjects(6)` en `entities/project/server` y renderiza `<HomeClient />`.
- **`categorias/`**: `page.tsx` (Server Component), `error.tsx` y `loading.tsx`.
- **`admin/`**: `page.tsx` (Login con `<LoginForm />`), `dashboard/page.tsx`, `error.tsx`, `loading.tsx` y `nuevo/page.tsx`.
- **`auth/signout/`**: Route handler de cierre de sesión.

#### `features/` (Slices Verticales de Negocio)
- **`navbar/`**: Server Shell (`Navbar.tsx`) e islas cliente (`MobileMenuToggle.tsx`, `LogoAudioPlayer.tsx`, `CategoriesDropdown.tsx`).
- **`landing/`**: Componentes de secciones visuales (`Hero`, `ServicesSection`, `VideoSection`, `PortfolioPreview`, `TeamSection`, `ContactSection`), `HomeClient.tsx` y hook de animaciones `useLandingAnimations.ts`.
- **`categories/`**: Componente cliente `CategoriesClient.tsx` que consume `<ProjectCard />` desde `entities/project`.
- **`footer/`**: Componente de pie de página `Footer.tsx`.
- **`admin-dashboard/`**: `ProjectForm.tsx` (`useActionState`), `ProjectList.tsx` (`<Image />`), `project.actions.ts` y `project.schema.ts`.
- **`auth/`**: `LoginForm.tsx` (`useActionState`), `SignOutButton.tsx` y `auth.actions.ts`.

#### `entities/` (Dominio Compartido)
- **`project/`**: `types.ts` (interfaz de dominio), `projects.repository.ts` (`server-only`), `ProjectCard.tsx` (tarjeta UI), `index.ts` (barrel cliente) y `server.ts` (barrel servidor).

#### `shared/` (Infraestructura Técnica Pura)
- **`ui/`**: `Button.tsx`, `Container.tsx`, `Section.tsx`.
- **`lib/supabase/`**: Clientes `@supabase/ssr` (`client.ts`, `server.ts` con `server-only`, `middleware.ts`).
- **`config/`**: `env.ts` (validación de variables), `site.ts` (configuración del sitio).
- **`hooks/`**: `useMediaQuery.ts`.
- **`types/`**: `database.types.ts` (definición TypeScript para Supabase).
