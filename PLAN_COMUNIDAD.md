# Plan de arquitectura — Sistema de comentarios / comunidad

Sistema de comentarios por capítulo y por obra para usuarios registrados, con
moderación desde el panel de administración.

**Decisiones tomadas:** sin realtime (se puede añadir después) · respuestas de
un nivel · publicación instantánea con moderación posterior · lectura pública,
escritura solo con sesión iniciada.

---

## 1. Condicionantes descubiertos en el código actual

Dos hallazgos de la investigación previa que determinan el diseño.

### 1.1 Los capítulos no existen como filas en la base de datos

El lector no usa la tabla `chapters`. Los capítulos se parsean en runtime desde
`projects.markdown_content` con `parseStoryChapters()`
(`src/features/document-reader/components/MarkdownEngine/MarkdownParser.ts`), y
la identidad de cada capítulo es su **posición**: `activeChapterIndex + 1`.

Es la misma convención que ya usan `chapter_bookmarks` y `reading_progress`, así
que los comentarios la siguen por consistencia.

> **Riesgo conocido:** el CMS de estructura (`ProjectForm.tsx`, modo
> "4. CMS ESTRUCTURA") permite reordenar capítulos por drag & drop. Al hacerlo,
> los comentarios quedan asociados a la *posición*, no al capítulo — un
> comentario del capítulo 3 pasaría a verse en el que ocupe esa posición
> después del reordenamiento.
>
> Este defecto **ya existe hoy** con los bookmarks de capítulo, pero con
> comentarios es mucho más visible.
>
> Mitigación incluida en el plan: guardar `chapter_title` como snapshot en cada
> comentario, para poder detectar y reparar desajustes. La solución de fondo
> (dar IDs estables a los capítulos dentro del markdown) queda fuera de alcance
> por ser demasiado invasiva.

### 1.2 La RLS de `profiles` impide ver el perfil de otros usuarios

```sql
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
```

Con esta política, un JOIN de comentarios → perfiles devuelve vacío para
cualquier usuario que no seas vos: **no se podrían mostrar el nombre ni el
avatar de los demás comentaristas.**

**Solución propuesta:** abrir el SELECT de `profiles` a lectura pública. Es el
patrón estándar de Supabase (`profiles` está separada de `auth.users`
justamente para exponer datos públicos).

- *Contrapartida:* expone la columna `role`, revelando qué cuentas son admin.
  No otorga ningún permiso adicional — la protección real sigue estando en la
  RLS de cada tabla y en el middleware — pero es información visible.
- *Alternativa si preferís no exponerlo:* denormalizar `author_name` y
  `author_avatar_url` dentro de `comments` al momento de insertar. Evita el
  problema de RLS por completo, pero los datos quedan congelados: si el usuario
  cambia su nombre o foto, los comentarios viejos siguen mostrando los antiguos.

### 1.3 Nota aparte sobre la seguridad existente

Las tablas `projects`, `chapters` y `content_assets` tienen RLS totalmente
permisiva (`FOR DELETE TO public USING (true)`), o sea que cualquiera con la
anon key —que es pública por diseño— podría borrar obras.

Está **fuera del alcance de este plan**, pero conviene tenerlo presente. Los
comentarios se diseñan con RLS correcta desde el inicio para no ampliar el
problema.

---

## 2. Modelo de datos

Una sola tabla cubre los dos casos de uso mediante `chapter_number` nullable.

```sql
CREATE TABLE comments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     uuid NOT NULL REFERENCES projects(id)   ON DELETE CASCADE,
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id      uuid          REFERENCES comments(id)   ON DELETE CASCADE,

  -- NULL  = comentario general de la obra (PDF, video, galería, ficha técnica)
  -- 1..n  = comentario de un capítulo concreto
  chapter_number int,
  chapter_title  text,   -- snapshot para trazabilidad ante reordenamientos

  body           text NOT NULL
                 CHECK (char_length(btrim(body)) BETWEEN 1 AND 2000),

  -- Borrado suave: ver justificación abajo
  is_deleted        boolean NOT NULL DEFAULT false,
  deleted_by_admin  boolean NOT NULL DEFAULT false,

  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
```

**Por qué borrado suave y no `DELETE` físico:** si el admin borra un comentario
padre con un DELETE real, el `ON DELETE CASCADE` de `parent_id` arrastra todas
sus respuestas y desaparece la conversación entera. Con `is_deleted` se muestra
"[comentario eliminado]" y las respuestas sobreviven.

`deleted_by_admin` distingue "el autor se arrepintió" de "esto fue moderado",
útil para la vista de comunidad del panel.

**Restricción de integridad** — una respuesta debe vivir en el mismo hilo que su
padre, y solo se permite un nivel de anidamiento. Ambas cosas se validan en el
Server Action (Postgres no puede expresarlas de forma simple en un `CHECK`).

**Índices:**

```sql
CREATE INDEX idx_comments_thread  ON comments(project_id, chapter_number, created_at DESC);
CREATE INDEX idx_comments_parent  ON comments(parent_id);
CREATE INDEX idx_comments_user    ON comments(user_id);
```

---

## 3. Seguridad (RLS)

Helper reutilizable, `SECURITY DEFINER` para evitar recursión de RLS:

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public
AS $$ SELECT EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
); $$;
```

| Operación | Quién | Política |
|---|---|---|
| SELECT | cualquiera | `USING (true)` |
| INSERT | con sesión | `WITH CHECK (auth.uid() = user_id)` — impide falsificar autoría |
| UPDATE | autor | `USING (auth.uid() = user_id)` |
| UPDATE (moderar) | admin | `USING (public.is_admin())` |
| DELETE | autor o admin | `USING (auth.uid() = user_id OR public.is_admin())` |

El `WITH CHECK (auth.uid() = user_id)` del INSERT es la pieza crítica: sin él,
un usuario podría publicar comentarios haciéndose pasar por otro, incluso
saltándose el Server Action y pegándole directo a la API de Supabase.

---

## 4. Estructura de archivos

Respeta el `eslint-plugin-boundaries` del proyecto (`app → features → entities →
shared`; las features no pueden importarse entre sí).

```
src/entities/comment/
  types.ts                        Comment, CommentWithAuthor, CommentThread
  data/comments.repository.ts     lecturas (server-only)
  server.ts                       barrel server-only
  index.ts                        barrel de tipos (cliente)

src/features/comments/
  components/CommentsSection.tsx  orquestador (client)
  components/CommentList.tsx      lista + paginado
  components/CommentItem.tsx      comentario + respuestas + acciones
  components/CommentForm.tsx      publicar / responder / editar
  actions/comments.actions.ts     fetch, create, update, delete propio
  schemas/comment.schema.ts       validación Zod
  index.ts

src/features/admin-dashboard/
  components/CommunityModeration.tsx
  components/AdminSidebar.tsx     ← extraído (ver §6)
  actions/moderation.actions.ts

src/app/admin/dashboard/comunidad/page.tsx
```

La moderación vive **dentro de `admin-dashboard`**, no como feature aparte: es
el mismo dominio, comparte sidebar y layout.

---

## 5. Composición — la parte delicada

Los comentarios por capítulo dependen del capítulo activo, que es **estado
cliente** dentro de `MarkdownReader` (`activeChapterIndex`).

Por eso **no sirve** pasarlos como `ReactNode` ya renderizado —el patrón que
usamos para `favoriteButton` y `contactButton`—: ese nodo se construye en el
servidor y no puede saber qué capítulo está mirando el usuario.

La solución es pasar la **referencia al componente**, que es exactamente el
patrón que el proyecto ya usa para `ChapterBookmarkButton`:

```
app/categorias/[id]/page.tsx            ← única capa que puede importar features
  │  import { CommentsSection } from '@/features/comments'
  │
  └─ DocumentReaderContainer
        CommentsSection?: ComponentType<CommentsSectionShape>
        │
        ├─ MarkdownReader   → <CommentsSection projectId chapterNumber={idx+1} />
        │                      se re-renderiza solo al cambiar de capítulo
        │
        └─ PdfReader / VideoPlayer / GalleryViewer / ficha técnica
                            → <CommentsSection projectId chapterNumber={null} />
```

Contrato del componente:

```ts
export interface CommentsSectionShape {
  projectId: string;
  chapterNumber: number | null;   // null = comentarios generales de la obra
  chapterTitle?: string | null;   // snapshot al publicar
}
```

### Flujo de datos

Como el capítulo cambia en cliente, los comentarios se cargan bajo demanda:

1. `CommentsSection` monta o cambia `chapterNumber` → llama al Server Action
   `fetchCommentsAction(projectId, chapterNumber, offset)`.
2. Publicar → `createCommentAction` → inserción optimista en la lista local.
3. Paginado "cargar más" de 20 en 20, ordenado por `created_at DESC`.
4. Las respuestas de cada comentario vienen en la misma consulta y se agrupan en
   memoria por `parent_id` (un solo nivel, así que no hace falta recursión).

Sin realtime: los comentarios de otros aparecen al recargar o cambiar de
capítulo. Si más adelante querés realtime, se añade una suscripción dentro de
`CommentsSection` sin tocar nada más.

---

## 6. Panel de administración — sección COMUNIDAD

Nueva ruta `/admin/dashboard/comunidad`, protegida por el middleware existente
(que ya redirige a `/biblioteca` si `role !== 'admin'`).

Funcionalidad:

- Listado de todos los comentarios, más recientes primero.
- Filtros por obra y por estado (activos / eliminados).
- Buscador por texto o autor.
- Contexto de cada comentario: obra, capítulo, autor, fecha.
- Eliminar (borrado suave con `deleted_by_admin = true`) **con modal de
  confirmación**, siguiendo el mismo patrón que ya implementamos para borrar
  obras.
- Restaurar un comentario eliminado por error.

### Refactor necesario: extraer el sidebar

El sidebar del admin está **duplicado** en `dashboard/page.tsx` y
`dashboard/nuevo/page.tsx`. Ya nos costó trabajo durante los ajustes del logo:
cada cambio hubo que aplicarlo dos veces.

Agregar una tercera página lo triplicaría. Antes de crear `comunidad/page.tsx`
conviene extraerlo a `AdminSidebar.tsx` con props para la ruta activa y los
contadores. Es un cambio acotado y elimina deuda ya existente.

---

## 7. Anti-abuso

Sin dependencias nuevas:

- Solo usuarios con sesión pueden publicar (RLS + verificación en el action).
- Longitud máxima 2000 caracteres, validada por Zod **y** por `CHECK` en la base
  (defensa en profundidad: el `CHECK` protege aunque alguien saltee el action).
- Límite de frecuencia: mínimo 15 segundos entre comentarios del mismo usuario,
  verificado por consulta al `created_at` del último.
- El `body` se renderiza como **texto plano**, nunca como HTML ni markdown, para
  eliminar cualquier riesgo de inyección. Si más adelante querés formato, se
  añade un sanitizador explícito.

---

## 8. Fases de implementación

| Fase | Entregable | Verificación |
|---|---|---|
| 1 | `supabase_comments_schema.sql` + tipos en `database.types.ts` | correr el SQL en Supabase |
| 2 | Entity `comment` + repositorio | `tsc --noEmit` |
| 3 | Feature `comments` en modo **solo lectura** | se ven comentarios insertados a mano |
| 4 | Escritura: publicar, responder, editar y borrar lo propio | probar con dos cuentas distintas |
| 5 | `AdminSidebar` extraído + sección COMUNIDAD | moderar desde el panel |
| 6 | *(opcional)* realtime, reacciones, notificaciones | — |

Cada fase cierra con `npx tsc --noEmit` y `npx eslint` (que incluye el chequeo
de boundaries).

**Prueba clave de la fase 4:** hay que verificarla con **dos cuentas
diferentes**, no solo con la propia. Casi todos los errores de RLS —incluido el
problema de `profiles` de §1.2— solo aparecen cuando un usuario intenta ver o
tocar datos de otro.
