# Wiener Hound Studios (WHS) - Resumen y Análisis Técnico del Proyecto

## 1. Entorno de Desarrollo y Stack Tecnológico
- **Framework:** Next.js `16.2.4` (App Router, Turbopack, Server Actions con `bodySizeLimit: 50mb`)
- **Biblioteca UI:** React `19.2.4`
- **Lenguaje:** TypeScript (`npx tsc --noEmit` verificado al 100%)
- **Estilos:** Tailwind CSS `v4` (Design tokens en CSS `@theme`, glassmorphism, modo oscuro cyberpunk `#0D0A08` / `#160E0A`)
- **Base de Datos y Autenticación:** Supabase con `@supabase/ssr`, RLS (Row Level Security) y Storage (`whs-media`, `manga-pages`)
- **Animaciones:** GSAP con `@gsap/react` (`useGSAP` y `scope`)
- **Iconografía:** Lucide React
- **Validación:** Zod (`ProjectSchema`)
- **Calidad y Aislamiento:** `eslint-plugin-boundaries` v7

---

## 2. Descripción General del Sistema
El proyecto **WHS-WEB** ha sido estructurado mediante una **Arquitectura Vertical Slice** complementada con una capa de **Entities** para datos de dominio compartidos e infraestructura en **Shared**. Incorpora un motor propio de lectura interactiva Markdown (**Sistema ESTRATO**), un estudio de administración CMS jerárquico de 3 niveles y un motor de **obras multi-formato no excluyentes**.

### Características Clave:

1. **Sistema de Obras Multi-Formato (No Excluyentes):**
   - Una misma obra puede contener simultáneamente: **Manuscrito Markdown (Obsidian)**, **Documento PDF**, **Video (YouTube / TikTok / Google Drive / MP4)**, **Pista de Audio BGM** y **Galería de Ilustraciones**.
   - **MediaBadges (`MediaBadges.tsx`):** Insignias luminosas (`📖 MD`, `📄 PDF`, `🎬 VIDEO`, `🎵 AUDIO`, `🖼️ GALERÍA`) visibles en las tarjetas del catálogo público (`/categorias`) y en el **Panel de Comando Admin** (`ProjectList.tsx`).
   - **Selector Modal (`MediaFormatModal.tsx`):** Al presionar *"Elegir Formato"* o *"Ver Detalles"*, si la obra contiene múltiples formatos adjuntos, se abre un modal interactivo para que el usuario o lector escoja la experiencia deseada.
   - **Visores Integrados (`DocumentReaderContainer.tsx`):** Barra superior de pestañas que permite conmutar en vivo entre los visores `MarkdownReader`, `PdfReader`, `VideoPlayer` y `GalleryViewer`.

2. **Lector de Obras ESTRATO (Custom Markdown Engine):**
   - Parser y serializador bidireccional (`parseMarkdownStory`, `parseStoryChapters`, `serializeStoryChapters`, `parseYamlFrontmatter`, `parseInlineStyles`).
   - Soporte para diálogos con globos de voz `<speech speaker="..." color="...">`, Callouts de lore/nota/alerta `> [!warning]`, capitulares tipográficos (`DropCapTilt`), ramificación interactiva CYOA (`- [ ] [Elección](#id)`), audio BGM en bucle (`bgm: "..."`), luz ambiental `ambient_light` y tipografías dinámicas.

3. **Arquitectura CMS de 3 Niveles Jerárquicos & Auto-Save:**
   - Estructura `Obra ---> Parte / Temporada ---> Capítulo`.
   - Soporte para creación y preservación de temporadas vacías (`emptyActs`).
   - **Auto-Save Instantáneo en Drag & Drop:** Al arrastrar capítulos a otra temporada o reordenar elementos, `triggerAutoSaveStructure` envía `reorderStructureAction` automáticamente a Supabase sin requerir guardado manual.
   - **Cálculo Dinámico de Índices (`getRealChapterIndex`):** Previene desincronizaciones de índice al editar o mover capítulos.
   - **Modo Edición Dedicado (`edit_work`):** La URL `/admin/dashboard/nuevo?project_id=XYZ&mode=edit` carga y pre-llena de inmediato todos los campos existentes (título, categoría, estado, sinopsis, portada, PDF, Markdown, Video, Audio y Galería).

4. **Navegación Dinámica & Ocultamiento Fullscreen:**
   - **Navbar Adaptativo (`Navbar.tsx`):** Adopta una estética cyberpunk oscura (`bg-[#0D0A08]/95 border-white/15 text-[#F2EDE4]`) en `/categorias` y mantiene la estética clara en `/`.
   - **Ocultamiento Fullscreen:** Escucha el evento HTML5 `fullscreenchange` y oculta completamente el Header (`return null`) al ingresar a pantalla completa en PDF, Video o Lector, restaurándolo al presionar `Esc`.

---

## 3. Estructura de Directorios y Módulos

### Directorio Raíz (`/WHS-WEB`)
- **`next.config.ts`**: Configuración con `serverActions.bodySizeLimit: "50mb"` e iFrames remotos.
- **`supabase_definitive_schema.sql`**: Esquema SQL completo con sincronización de columnas (`video_url`, `audio_url`, `gallery_urls`, `project_url`, `file_type`, `document_url`, `markdown_content`), restricciones CHECK, políticas RLS para lectura/escritura pública/admin y permisos de buckets de storage.
- **`package.json`**: Dependencias principales (`@supabase/ssr`, `next`, `react`, `lucide-react`, `zod`).

### Código Fuente (`/src`)
#### `app/` (Enrutamiento Puro App Router)
- **`layout.tsx`**: Layout principal que compone `<Navbar />`.
- **`page.tsx`**: Página de Inicio (Landing Page).
- **`categorias/`**: `page.tsx` (Server Component que obtiene proyectos desde Supabase), `[id]/page.tsx` (Lector de obra por id/demo con `<DocumentReaderContainer />`).
- **`admin/`**: `page.tsx` (Login), `dashboard/page.tsx` (Panel de Comando & Registro con `<ProjectList />`), `dashboard/nuevo/page.tsx` (CMS Studio con `<ProjectForm />`).
- **`not-found.tsx`**: Página 404 personalizada con cubo giratorio interactivo 3D.

#### `features/` (Slices Verticales de Negocio)
- **`navbar/`**: `Navbar.tsx` (Header adaptativo cliente), `LogoAudioPlayer.tsx`, `CategoriesDropdown.tsx`, `MobileMenuToggle.tsx`.
- **`landing/`**: Componentes de secciones visuales (`HeroEstrato.tsx`, `StrataOneSection.tsx`, `StrataTwoSection.tsx`, `BedrockSection.tsx`, `InstinctSection.tsx`).
- **`categories/`**: Componente cliente `CategoriesClient.tsx` que consume `<ProjectCard />` con filtro por categorías.
- **`document-reader/`**:
  - `DocumentReaderContainer.tsx`: Contenedor principal con conmutador de pestañas de formato.
  - `PdfReader.tsx`: Lector de documentos PDF con modo pantalla completa.
  - `VideoPlayer.tsx`: Reproductor adaptativo para YouTube, TikTok, Google Drive y MP4.
  - `GalleryViewer.tsx`: Visor de ilustraciones en alta resolución con carrusel y lightbox.
  - `MarkdownEngine/`: `MarkdownParser.ts` (Motor de parseo/serialización), `MarkdownReader.tsx` (Lector inmersivo), `StoryCallout.tsx`, `StoryDialogue.tsx`, `DropCapTilt.tsx`, `MarkdownEditorWithPreview.tsx` y `MarkdownToolbar.tsx`.
- **`admin-dashboard/`**:
  - `ProjectForm.tsx`: Estudio CMS con modos de Crear Obra, Editar Obra Existente (`edit_work`), Añadir Capítulo y Editar Estructura/Drag & Drop.
  - `ProjectList.tsx`: Lista de tarjetas en el dashboard con Quick Actions (Portada, Leer, Resumen, Editar) e insignias `MediaBadges`.
  - `actions/project.actions.ts`: Server Actions para CRUD de proyectos, temporadas, capítulos y reordenamiento.

#### `entities/` (Dominio Compartido)
- **`project/`**:
  - `types.ts`: Interfaz TypeScript `Project` (incluye `video_url`, `audio_url`, `gallery_urls`).
  - `data/projects.repository.ts`: Repositorio con consultas `select('*')` y normalización de metadatos en segundo plano (`normalizeProjectMedia`).
  - `components/ProjectCard.tsx`: Tarjeta UI de obra con superposición de insignias `MediaBadges` y activador de `MediaFormatModal`.
  - `components/MediaBadges.tsx`: Insignias visuales de formatos activos.
  - `components/MediaFormatModal.tsx`: Modal selector de experiencia de formato.

#### `shared/` (Infraestructura Técnica Pura)
- **`lib/supabase/`**: Clientes `@supabase/ssr` (`client.ts`, `server.ts`, `middleware.ts`).
- **`ui/`**: `StarsBackground.tsx`, `DarkGradientBg.tsx`, `RollingCube404.tsx`.
- **`config/`**: `env.ts` (variables de entorno), `site.ts`.

---

## 4. Repositorio y Ramas de Git
- **URL del Repositorio:** [`https://github.com/Gandrenix/WHS-WEB`](https://github.com/Gandrenix/WHS-WEB)
- **Rama Principal:** `main` (Sincronizada al 100%)
- **Rama de Respaldo:** `backup` (Sincronizada al 100%)
