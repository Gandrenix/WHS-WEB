# Wiener Hound Studios (WHS-WEB)

Aplicación web Full-Stack para **Wiener Hound Studios**, construida con Next.js (App Router), React 19, TypeScript, Supabase SSR, Tailwind CSS 4 y GSAP.

---

## 🏗️ Arquitectura del Proyecto

El proyecto se ubica en la raíz del repositorio y sigue una **Arquitectura Vertical Slice** complementada con una capa de **Entities** e infraestructura en **Shared** (inspirada en Feature-Sliced Design).

### Dirección de Dependencias Estricta
`src/app -> src/features -> src/entities -> src/shared`

```
WHS-WEB/
├── app/                                   # Enrutamiento puro App Router (CERO lógica de negocio)
│   ├── layout.tsx                         # Compone <Navbar /> y <Footer /> desde features/
│   ├── globals.css                        # Tokens CSS con bloque @theme de Tailwind CSS 4
│   ├── page.tsx                           # Server Component que llama a entities/project/server
│   ├── categorias/                        # page.tsx, error.tsx, loading.tsx
│   ├── admin/                             # page.tsx (Login con LoginForm)
│   │   └── dashboard/                     # page.tsx, error.tsx, loading.tsx, nuevo/page.tsx
│   └── auth/signout/route.ts              # Route handler para cierre de sesión
│
├── middleware.ts                          # Protección de rutas y refresco de sesión Supabase
│
├── features/                              # Slices verticales autosuficientes
│   ├── navbar/                            # Server Shell + islas cliente (MobileMenuToggle, LogoAudioPlayer)
│   ├── landing/                           # Hero, ServicesSection, VideoSection, PortfolioPreview, TeamSection, ContactSection
│   ├── categories/                        # CategoriesClient
│   ├── footer/                            # Footer
│   ├── admin-dashboard/                   # ProjectForm, ProjectList, project.actions, project.schema
│   └── auth/                              # LoginForm, SignOutButton, auth.actions
│
├── entities/                              # Objetos de dominio compartidos de solo lectura
│   └── project/
│       ├── types.ts                       # Interfaz de dominio Project
│       ├── data/projects.repository.ts    # Repositorio server-only
│       ├── components/ProjectCard.tsx     # Tarjeta UI reutilizable
│       ├── index.ts                       # Barrel cliente
│       └── server.ts                      # Barrel exclusivo de servidor
│
└── shared/                                # Infraestructura técnica pura
    ├── ui/                                # Button, Container, Section
    ├── lib/supabase/                      # client.ts, server.ts (server-only), middleware.ts
    ├── config/                            # env.ts, site.ts
    ├── hooks/                             # useMediaQuery.ts
    └── types/                             # database.types.ts
```

---

## ⚡ Tecnologías y Stack

- **Framework:** Next.js `16.2.4` (App Router Full-Stack)
- **Biblioteca UI:** React `19.2.4`
- **Estilos:** Tailwind CSS `v4` (Design Tokens en `@theme`)
- **Base de Datos y Autenticación:** Supabase (`@supabase/ssr` y `@supabase/supabase-js`)
- **Animaciones:** GSAP (`@gsap/react` con `useGSAP()` y `scope`)
- **Validación de Datos:** Zod
- **Reglas de Aislamiento:** `eslint-plugin-boundaries` v7

---

## 🚀 Inicio Rápido

### 1. Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto con las siguientes credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 2. Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Ejecutar el linter y verificar límites arquitectónicos
npm run lint
```
