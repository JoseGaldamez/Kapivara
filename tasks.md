# Migración Kapivara: Tauri → Wails

> Proyecto original en `rust-old/` · Proyecto nuevo en raíz (`./`)
> Frontend: `frontend/src/` · Backend Go: `./` (main.go, app.go)

---

## Fase 1 — Configuración inicial del proyecto
- [x] Instalar Wails CLI v2
- [x] Mover proyecto Tauri a `rust-old/`
- [x] Inicializar proyecto Wails con template `react-ts`
- [x] Configurar icono de la app (`build/appicon.png` 1024×1024 + `.icns`)
- [x] Copiar assets del frontend (logos, logotipos dark/light)
- [x] Configurar `index.html` (título, Google Fonts: Geist, Geist Mono, Outfit)
- [x] Configurar ventana (1280×720, min 960×640) en `main.go`
- [x] Verificar `wails dev` y `wails build` funcionan

---

## Fase 2 — Backend Go: Base de datos SQLite
> Antes de migrar el frontend, necesitamos el backend que lo soporte.

- [x] Agregar dependencia `modernc.org/sqlite` (o `mattn/go-sqlite3`) en Go
- [x] Crear módulo `database/` en Go con conexión SQLite
  - [x] Inicialización de la DB (`kapivara.db`)
  - [x] Sistema de migraciones (leer archivos SQL secuencialmente)
- [x] Copiar los 7 archivos de migración SQL desde `rust-old/src-tauri/migrations/`
  - [x] `1_init.sql` — tabla projects
  - [x] `2_core_tables.sql` — requests, collections, headers, params, body, auth
  - [x] `3_settings_table.sql` — settings
  - [x] `4_add_description_to_params.sql`
  - [x] `5_add_response_to_requests.sql`
  - [x] `6_global_environments_and_active_selection.sql`
  - [x] `7_saved_responses.sql`
- [x] Exponer funciones de DB al frontend vía Wails bindings:
  - [x] `DBSelect(query, args)` — queries de lectura
  - [x] `DBExecute(query, args)` — queries de escritura


---

## Fase 3 — Backend Go: HTTP Client
> Reescribir `make_http_request` de Rust a Go.

- [x] Crear struct `HttpResponse` (status, statusText, headers, body, timeMs)
- [x] Crear struct `FormDataItem` (key, value, type, isActive)
- [x] Implementar función `MakeHttpRequest(method, url, headers, body, bodyType)`
  - [x] Soporte para métodos HTTP (GET, POST, PUT, PATCH, DELETE, etc.)
  - [x] Manejo de headers personalizados
  - [x] Body tipo `raw` (JSON, text, XML, etc.)
  - [x] Body tipo `form-data` (multipart con soporte de archivos)
    - [x] Lectura de archivos del filesystem
    - [x] Detección de MIME type por extensión
  - [x] Body tipo `x-www-form-urlencoded`
  - [x] Medición de tiempo de respuesta (`time_ms`)
- [x] Exponer `MakeHttpRequest` como binding de Wails


---

## Fase 4 — Backend Go: Diálogos nativos
> Reemplazar los plugins de Tauri para diálogos del sistema.

- [x] Implementar `OpenFileDialog()` usando Wails runtime
  - [x] Equivalente a `@tauri-apps/plugin-dialog` → `open()`
- [x] Exponer como binding de Wails


---

## Fase 5 — Configuración del frontend (Vite + dependencias)
> Preparar el entorno del frontend antes de copiar código.

- [x] Actualizar `frontend/vite.config.ts`:
  - [x] Agregar alias `@` → `./src` (path resolution)
  - [x] Agregar plugin TailwindCSS v4
  - [x] Remover configuración específica de Tauri (puerto 1420, TAURI_DEV_HOST)
- [x] Actualizar `frontend/tsconfig.json`:
  - [x] Agregar path alias `@/*` → `./src/*`
  - [x] Configurar target y opciones de compilación del proyecto original
- [x] Instalar dependencias npm del proyecto original:
  - [x] `react`, `react-dom` (ya incluidos, verificar versión ^19)
  - [x] `zustand` — state management
  - [x] `lucide-react` — iconos
  - [x] `@dnd-kit/core`, `@dnd-kit/modifiers`, `@dnd-kit/utilities` — drag & drop
  - [x] `react-toastify` — notificaciones toast
  - [x] `@tailwindcss/vite`, `tailwindcss` v4 — styling
  - [x] `autoprefixer`, `postcss`
- [x] Copiar `tailwind.config.js` desde `rust-old/`
- [x] Remover dependencias de Tauri (`@tauri-apps/*`)


---

## Fase 6 — Migrar código frontend (sin dependencias de Tauri)
> Copiar primero todo lo que NO depende de Tauri APIs.

- [ ] Copiar `types/` — definiciones TypeScript
  - [ ] `index.ts` (RequestInfo, Collection, SavedResponse, etc.)
  - [ ] `settings.ts` (SettingItem)
- [ ] Copiar `utils/` — utilidades puras
  - [ ] `environment-resolver.ts`
  - [ ] `headers.constants.ts`
  - [ ] `methods.constants.ts`
  - [ ] `information.constant.ts`
- [ ] Copiar `stores/` — Zustand stores (sin dependencias de Tauri)
  - [ ] `console.store.ts`
  - [ ] `environment.store.ts`
  - [ ] `project.store.ts`
  - [ ] `request.store.ts`
  - [ ] `settings.store.ts`
- [ ] Copiar `hooks/`
  - [ ] `useSidebarDnd.ts`
  - [ ] `useSidebarResize.ts`
  - [ ] `useTheme.ts`
- [ ] Copiar `layouts/`
  - [ ] `MainLayout.tsx`
- [ ] Copiar `pages/`
  - [ ] `HomePage/`
  - [ ] `Settings/`
  - [ ] `Workspace/`
- [ ] Copiar `components/`
  - [ ] `common/`
  - [ ] `home/`
  - [ ] `modals/`
  - [ ] `settings/`
  - [ ] `sidebar/`
  - [ ] `workspace/`
- [ ] Copiar estilos
  - [ ] `App.css`

---

## Fase 7 — Adaptar capa IPC (Tauri → Wails)
> Los 4 archivos que importan APIs de Tauri.

- [ ] Reescribir `services/db.service.ts`
  - [ ] Reemplazar `@tauri-apps/plugin-sql` por llamadas a bindings Go de Wails
  - [ ] `Database.load()` → llamada al backend Go para inicializar DB
  - [ ] `db.select()` → `DBSelect()` vía `wailsjs/go/main/App`
  - [ ] `db.execute()` → `DBExecute()` vía `wailsjs/go/main/App`
- [ ] Adaptar `services/request.service.ts`
  - [ ] Sin cambios directos (usa `db.service.ts` internamente)
- [ ] Adaptar `services/projects.service.ts`
  - [ ] Sin cambios directos (usa `db.service.ts` internamente)
- [ ] Adaptar `services/environment.service.ts`
  - [ ] Sin cambios directos (usa `db.service.ts` internamente)
- [ ] Adaptar `services/settings.service.ts`
  - [ ] Sin cambios directos (usa `db.service.ts` internamente)
- [ ] Reescribir `controllers/request.controller.ts`
  - [ ] Reemplazar `invoke('make_http_request', ...)` por `MakeHttpRequest()` de Wails
- [ ] Reescribir `App.tsx`
  - [ ] Reemplazar `invoke("close_splashscreen")` por equivalente de Wails o eliminarlo
- [ ] Reescribir `components/.../FormDataType.tsx`
  - [ ] Reemplazar `open()` de `@tauri-apps/plugin-dialog` por `OpenFileDialog()` de Wails

---

## Fase 8 — Archivos de configuración y proyecto
- [ ] Copiar/adaptar `CONTRIBUTING.md`, `LICENSE`, `README.md` desde `rust-old/`
- [ ] Actualizar `.gitignore` para incluir reglas de Go y Wails
- [ ] Copiar `.github/` (CI/CD workflows) y adaptarlos para Wails
- [ ] Copiar `docs/` y `sdd/` (documentación)
- [ ] Actualizar `wails.json` con metadata del proyecto (versión, identificador)

---

## Fase 9 — Testing y validación
- [ ] Verificar que `wails dev` levanta sin errores
- [ ] Verificar que la base de datos se inicializa correctamente
- [ ] Probar CRUD de proyectos
- [ ] Probar CRUD de requests (crear, editar, eliminar)
- [ ] Probar ejecución de HTTP requests (GET, POST con JSON)
- [ ] Probar form-data con archivos
- [ ] Probar x-www-form-urlencoded
- [ ] Probar environments (variables, resolución de templates)
- [ ] Probar settings (tema, configuraciones)
- [ ] Probar drag & drop en sidebar
- [ ] Probar `wails build` genera `.app` funcional
- [ ] Verificar icono correcto en el dock y en el .app bundle

---

## Fase 10 — Limpieza final
- [ ] Eliminar `rust-old/` una vez verificada la migración completa
- [ ] Eliminar archivos de template de Wails no utilizados
- [ ] Revisar y limpiar dependencias no usadas (`go mod tidy`, `npm prune`)
- [ ] Actualizar versión del proyecto a `0.2.0` (o la que corresponda)
