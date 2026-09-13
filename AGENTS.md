# Kapivara — contexto de trabajo para agentes

Última actualización: 2026-09-13.

Este archivo registra el estado actual del rediseño para que otro agente pueda continuar sin reconstruir el contexto desde cero. Las modificaciones descritas todavía pueden estar sin commit; no las reviertas ni limpies el working tree.

## Qué es el proyecto

Kapivara es un cliente REST de escritorio local-first construido con Wails v2, Go y SQLite. El frontend usa React 19, TypeScript, Vite 7, Tailwind CSS 4, Zustand y Lucide.

La intención visual vigente es profesional, sobria y técnica, sin perder la identidad cálida de la capibara. La aplicación debe sentirse como una herramienta de trabajo, no como una página de marketing ni una interfaz de juguete. Consulta también `PRODUCT.md` para el contexto permanente del producto.

## Solicitudes del usuario ya implementadas

1. Se rediseñó por completo la página de inicio usando las imágenes de `frontend/src/assets/images/`.
2. Se eliminó el sistema de pestañas superiores. `frontend/src/components/common/TabsHeader.tsx` fue eliminado deliberadamente.
3. Se creó un shell global compuesto por:
   - Barra superior persistente.
   - Selector de proyecto con acceso a crear un proyecto.
   - Selector de ambientes globales y del proyecto.
   - Búsqueda alineada a la derecha.
   - Configuración general.
   - Sidebar global con Requests, Variables, History y Settings. La opción Variables abre la página integrada de ambientes y variables.
4. Se añadió una vista real de historial de solicitudes de la sesión.
5. El editor de ambientes puede abrir directamente la vista de ambientes o la de variables resueltas.
6. Se eliminó el selector de ambiente duplicado que estaba dentro del sidebar de requests.
7. Se hizo un pase de Impeccable `quieter + polish`:
   - IBM Plex Sans e IBM Plex Mono.
   - Menos sombras, movimiento, colores pastel y radios grandes.
   - Jerarquía tipográfica más contenida.
   - Superficies neutrales y controles más profesionales.
8. Se creó una barra de sistema personalizada:
   - Wails usa `Frameless: true` en `main.go`.
   - La barra superior es arrastrable mediante `--wails-draggable: drag`.
   - Minimizar, maximizar/restaurar y cerrar aparecen a la derecha de Settings.
   - La altura actual de la barra es 58 px.
   - Los controles de ventana ocupan toda la altura de la barra.
9. Se separó la configuración general de la configuración de proyecto:
   - El modal general de la app (tema, idioma, fuente) se abre desde la tuerca en `TopBar`.
   - El botón Settings en `AppSidebar` navega a una vista completa `ProjectSettingsPage` con nombre, descripción, color de acento, métricas, atajos a ambientes y zona de peligro (eliminar proyecto).
   - El botón Settings en `AppSidebar` se desactiva cuando no hay un proyecto seleccionado (`disabled={!hasProject}`).
10. La barra lateral izquierda (`AppSidebar`) ahora solo se muestra cuando hay un proyecto activo (`activeProject !== null`). En ausencia de un proyecto, la portada (`HomePage`) ocupa el ancho completo, logrando una interfaz limpia y sin opciones desactivadas.
11. Se unificaron **Environments** y **Variables** en una sola sección en `AppSidebar` y se reemplazó el modal emergente por una página integrada completa `EnvironmentsPage`:
    - Se eliminó el botón duplicado "Variables" de `AppSidebar`.
    - La vista integrada permite alternar fluidamente entre el editor de ambientes (de Proyecto y Globales) y la vista de variables activas resueltas.
    - Se eliminó el uso de modales flotantes para la gestión de variables y ambientes.
12. Se estandarizó por completo la estructura y apariencia de todas las pantallas del proyecto (`Settings`, `History` y `Environments`):
    - Se creó el componente unificado `ProjectPageHeader` con botón "← Back to Requests", icono badge, título `text-2xl`, subtítulo del proyecto y espacio para acciones contextuales.
    - Ancho idéntico de contenedor para todas las pantallas (`max-w-[1120px] px-6 py-7 lg:px-10 lg:py-8`), eliminando saltos visuales al navegar en el sidebar.
    - Sistema uniforme de tarjetas (`rounded-xl border border-[#ded7ce] bg-[#fffdf9] dark:bg-[#18191e]`).
13. Se rediseñó la sección completa de peticiones (`Workspace`, `Sidebar`, `RequestPanel`, `ResponsePanel`):
    - Se transformó el sidebar de colecciones en una tarjeta unificada con título "Collections", botón `+` para crear petición o carpeta (se eliminó el botón de menú `⋮` redundante), buscador con atajo `⌘ F` / `Ctrl F`, filas de petición con badges de método en texto plano en negrita (`GET` verde, `POST` naranja, `PUT` azul, `DEL` rojo), selección activa suave (`bg-[#eaf3fe]`) con menú contextual `···`, y botón fijado `+ New request` al fondo.
    - Se mantuvo intacta la funcionalidad completa de arrastrar y soltar (`useSidebarDnd`).
    - En el panel de solicitud se añadió la barra de pestaña activa, miga de pan (`📁 Colección / Petición`), selector de método en píldora compacta, input de URL con variables destacadas en azul, botón primario azul "Send" con icono de avión de papel, sub-pestañas con badges de conteo (`Params (2)`, `Headers (1)`), y tablas con diseño técnico limpio.
    - En el panel de respuesta se añadió la barra con badge de estado `● 200 OK`, métricas de tiempo y tamaño formateado (`143 ms • 2.8 KB`), y un visor JSON con gutter de números de línea (`1, 2, 3...`) y resaltado de sintaxis de alta fidelidad.
14. Se mejoró el flujo de creación de requests y manejo inicial de environments:
    - Se eliminó el modal `CreateRequestModal`. La creación de requests es inmediata (estilo pestaña nueva en navegador/IDE).
    - Cada request nueva comienza con `GET {{baseUrl}}/` y el cursor se posiciona automáticamente después de la barra `/`.
    - Nombres automáticos basados en método + ruta (`extractPathFromUrl` y `getRequestDisplayName`), priorizando nombres personalizados asignados por el usuario.
    - Estado de borrador/unsaved con indicador `●` y guardado directo a su colección con `Ctrl+S` / `Cmd+S`.
    - Al crear un proyecto se crea automáticamente el environment `Local` con la variable `baseUrl` (opcional en el modal con placeholder `http://localhost:3000`) y queda seleccionado como activo.
    - Validación no destructiva cuando `baseUrl` está vacía o indefinida con aviso claro y botón `[ Set baseUrl ]` con editor inline.
15. Se corrigió el apilamiento visual (z-index) entre los menús desplegables de la barra superior y los redimensionadores del espacio de trabajo:
    - Se redujo el `z-index` de `.cushioned-resizer-ns` y `.cushioned-resizer-ew` a 10 (con amortiguamiento `::before` en 20).
    - Se aisló el cuerpo de la aplicación en `MainLayout` con `relative z-0`.
    - `TopBar` se elevó a `relative z-50` y sus menús desplegables a `z-[60]`, garantizando que floten de forma limpia por encima de cualquier componente del área de trabajo.
    - Los modales globales se fijaron en `z-[100]`.
16. Se unificó la cabecera de la petición en una sola ruta limpia y editable:
    - Se eliminó la información triplicada (pestaña falsa, miga de pan redundante y subtítulo duplicado).
    - Muestra exclusivamente la ruta: `Nombre del proyecto / folder si hay / nombre de la request`.
    - El nombre de la request es editable directamente inline haciendo clic o presionando Enter, con selección automática de texto.
17. Se reubicó el botón de guardar (`Save`):
    - Se movió desde la barra de URL a la esquina superior derecha de la cabecera de la petición, rellenando el espacio vacío.
    - Esto libera ancho horizontal para que la barra de URL y el botón Send se expandan cómodamente.
    - El botón `Save` incluye feedback visual cuando hay cambios sin guardar (`is_dirty`) con borde/fondo acentuado y el punto ámbar `●`.
18. Se corrigió la selección de texto indeseada al redimensionar paneles (`RequestPanel`, `Sidebar`):
    - Se interceptó el evento `mousedown` con `e.preventDefault()` y `window.getSelection()?.removeAllRanges()`.
    - Se aplica `document.body.style.userSelect = 'none'` y el cursor adecuado (`row-resize` o `col-resize`) durante el arrastre, restaurándolo en `mouseup`.
    - Se aplicó `user-select: none;` a los elementos y pseudoelementos `.cushioned-resizer-ns` y `.cushioned-resizer-ew` en `App.css`.
19. Se corrigió el salto brusco ("sube de golpe") al redimensionar el panel de respuesta:
    - La fórmula anterior usaba `window.innerHeight - e.clientY`, asumiendo erróneamente que el panel estaba anclado al fondo absoluto de la ventana (ignorando la consola y los paddings), lo que provocaba un salto instantáneo de ~50-80 px en el primer pixel de movimiento del cursor.
    - Se reemplazó por un modelo de arrastre basado en delta (`dragStartRef.current = { startY, startHeight }`), calculando `newHeight = startHeight + (startY - e.clientY)`.
    - Garantiza salto inicial de 0 px y que el manejador permanezca 100% fijo bajo el cursor durante todo el arrastre.
20. Se eliminó la sección de consola inferior (`RequestConsole`):
    - Se removió la barra de consola que se ubicaba al fondo de la pantalla de peticiones en `Workspace.tsx`.
    - El panel de la petición y de la respuesta ocupan ahora la altura vertical completa de manera más despejada.
21. Se agregó un fondo y contenedor de editor al visor de respuesta (`JsonViewer`):
    - El visor JSON ahora se enmarca dentro de un canvas de código con fondo contrastado (`bg-[#f6f2ec]` en claro, `dark:bg-[#121316]` en oscuro), bordes redondeados (`rounded-xl border border-[#ded7ce] dark:border-white/8`), y sombra sutil.
    - Se delimitó la columna de números de línea (gutter) con un separador vertical (`border-r border-[#ded7ce]/40 dark:border-white/5`) y fondo tenue, dando una apariencia de editor técnico profesional.
22. Feedback visual al escribir JSON inválido en el cuerpo de la petición (`JsonEditor`):
    - Se actualizó el editor JSON del body para que, al detectar sintaxis inválida, el fondo del editor adquiera un tono rojizo sutil (`bg-red-50 dark:bg-red-950/30`) acompañando al borde rojo (`border-red-500`), haciendo evidente el error de sintaxis sin perder legibilidad del código.
    - Se reemplazó el estado local imperativo por derivación reactiva react (`useMemo`) en `JsonType.tsx`, validando el JSON inmediatamente incluso al cargar la petición o cambiar de pestaña.
23. Rediseño integral del sistema de notificaciones/toasts (`AppToastContainer`):
    - Se reemplazaron los toasts genéricos y llamativos de `react-toastify` por un diseño sobrio, compacto y nativo para herramientas de escritorio.
    - Se eliminó la barra de progreso multicolor (`hideProgressBar: true`) y las animaciones rebotantes, usando ahora una transición lateral suave y veloz (`Slide`).
    - Se crearon iconos personalizados con `lucide-react` en badges sutiles (`Check`, `AlertCircle`, `AlertTriangle`, `Info`, `Loader2`) y un botón de cierre `X` discreto.
    - Las tarjetas de notificación adoptan la paleta de Kapivara: fondos `#fffdf9` en claro y `#18191e` en oscuro, tipografía IBM Plex Sans de 13px, bordes de 1px con sutil acento de color por tipo (éxito, error, advertencia, info), altura contenida (~42px) y desenfoque de fondo (`backdrop-filter: blur(12px)`).
    - Cierre rápido optimizado: `autoClose={1600}` y `pauseOnHover={false}`. La barra de progreso se mantiene en el DOM con `opacity: 0` y `height: 0` en lugar de `display: none`, garantizando que el evento CSS `animationend` del temporizador se dispare siempre para descartar el toast oportunamente.
24. Rediseño del modal de configuración general (`Settings.tsx`):
    - Se reemplazó el modal antiguo de una sola columna y 95% de tamaño por una ventana de diálogo de escritorio profesional de **2 paneles** (`max-w-[980px]`, `h-[715px]`, barra lateral `w-56`).
    - Panel izquierdo: navegación de categorías con diseño sobrio y técnico (`Account`, `General`, `Theme`, `Data`, `Shortcuts`, `About`).
    - Panel derecho: vistas dedicadas para cada categoría:
      - **Account:** Perfil de usuario local, estado de privacidad y arquitectura local-first (100% offline).
      - **General:** Validación SSL, timeout de peticiones con presets rápidos (10s, 30s, 60s), seguimiento de redirecciones HTTP 3xx, idioma y telemetría anónima.
      - **Theme:** Selector de 3 temas (Light, Dark, System) con tarjetas visuales, control deslizante de tamaño de fuente con previsualizador JSON en vivo y ajuste de línea (*word wrap*).
      - **Data:** Métricas de SQLite 3 (modo WAL), limpieza de registros de sesión en memoria y restauración de valores de fábrica.
      - **Shortcuts:** Guía de atajos de teclado con etiquetas `<kbd>` para envío, guardado, búsqueda, edición inline y navegación.
      - **About:** Tarjeta visual de Kapivara con el logo de la barra superior, versión, autoría (José Galdámez), enlaces a GitHub/web y licencia MIT.
    - Soporte de cierre con tecla `Escape`, clic fuera del modal y botón `X`.
25. Inyección automática de cabecera `Content-Type` según el tipo de cuerpo:
    - Se corrigió el error `415 Unsupported Media Type` en peticiones con cuerpo `json` o `x-www-form-urlencoded`.
    - En `request.controller.ts` y en `httpclient/client.go` se comprueba de forma insensible a mayúsculas/minúsculas si el usuario ya definió una cabecera `Content-Type`.
    - Si no existe cabecera manual, para `body_type === 'json'` se inyecta automáticamente `Content-Type: application/json` y para `x-www-form-urlencoded` se inyecta `application/x-www-form-urlencoded`, igualando el comportamiento de Postman.
26. Persistencia de la pestaña activa al navegar entre peticiones:
    - Anteriormente `activeTab` en `RequestPanel.tsx` era un estado local inicializado fijamente en `useState("Body")`. Al cambiar de petición, `Workspace.tsx` desmontaba y montaba de nuevo el componente (`key={activeRequest.id}`), forzando siempre la pestaña `Body` y perdiendo la pestaña donde el usuario estaba editando (ej. `Headers` o `Params`).
    - Se agregó `activeTabByRequest: Record<string, string>`, `lastActiveTab: string` y la acción `setActiveTabForRequest(requestId, tab)` en `useRequestStore`.
    - Al cambiar de pestaña, la preferencia se almacena por petición y se actualiza `lastActiveTab`.
    - Al volver a una petición previamente abierta, recupera de inmediato la pestaña donde se dejó (`activeTabByRequest[request.id]`); si la petición es nueva, hereda el contexto de trabajo actual (`lastActiveTab`), eliminando la molesta redirección forzada a `Body`.
27. Persistencia y serialización de autorización (Bearer Token, Basic, API Key):
    - Se corrigió el problema por el cual el Bearer Token no se guardaba en SQLite al cerrar y abrir la aplicación.
    - Causa: `authObj.auth_data` se enviaba como objeto de JavaScript a `DBExecute` en Wails. El driver SQLite de Go rechazaba argumentos de tipo `map[string]interface{}` arrojando un error en la base de datos que impedía persistir los cambios. Además, `JSON.parse(request.auth)` en `RequestPanel.tsx` fallaba si `request.auth` ya era un objeto, regresando a `{ auth_type: 'none' }`.
    - Solución:
      1. En `request.service.ts`: se serializa `authObj.auth_data` a string JSON antes de ejecutar la sentencia SQL `UPDATE`/`INSERT request_auth`. En `getRequests` se extrae el JSON usando `json(ra.auth_data)`.
      2. En `database.go`: se añadió el normalizador `cleanArgs` que convierte mapas y slices de Go a JSON automáticamente antes de enviarlos a SQLite, protegiendo todas las consultas contra parámetros no escalares.
      3. En `RequestPanel.tsx`: se protegió la inicialización del estado `auth` para aceptar tanto strings JSON como objetos ya parseados sin lanzar excepciones de sintaxis.
      4. En `request.controller.ts`: `executeRequest` ahora persiste `auth`, `headers` y `params` junto a la respuesta de la petición.
28. Importación de requests desde texto cURL:
    - El menú `+` de Collections incluye `New Request`, `Import cURL` y `New Folder`.
    - `New Request` e `Import cURL` forman el grupo de acciones de petición; un separador visual mantiene `New Folder` como acción estructural independiente.
    - `Import cURL` abre un diálogo para pegar el comando y crea inmediatamente una request persistida y editable dentro del proyecto activo.
    - El parser local reconoce método explícito o inferido, URL, query params, headers, cookies, Bearer/Basic auth y cuerpos JSON, raw, multipart form-data o `application/x-www-form-urlencoded`.
    - Acepta comandos multilínea de Bash, PowerShell y CMD, además de URLs convertidas accidentalmente en enlaces Markdown.
    - El texto nunca se ejecuta como comando del sistema ni se envía a servicios externos; secretos y credenciales permanecen locales.
    - Las opciones exclusivas de transporte de cURL que no tienen equivalente en el modelo de Kapivara se ignoran con una advertencia no bloqueante.
29. Cierre inmediato del selector superior de ambientes:
    - Al seleccionar o desactivar un ambiente de proyecto o global, el desplegable se cierra inmediatamente.
    - La persistencia del cambio continúa de forma asíncrona mediante `environmentController.setActiveEnvironment`; no es necesario hacer clic fuera del menú.

## Arquitectura actual del frontend

`MainLayout` es el shell único de la aplicación:

```text
MainLayout
├── TopBar
│   ├── Marca
│   ├── Selector de proyecto
│   ├── Selector de ambiente
│   ├── Búsqueda
│   ├── Settings (Modal general)
│   └── WindowControls
└── Body
    ├── HomePage (sin proyecto activo, ancho completo sin AppSidebar)
    └── Con proyecto activo:
        ├── AppSidebar (Requests, Variables, History, Settings)
        └── Contenido
            ├── Workspace (Requests)
            ├── EnvironmentsPage (Variables)
            ├── HistoryPage (History)
            └── ProjectSettingsPage (Settings)
```

El sidebar redimensionable dentro de `Workspace` sigue siendo el árbol secundario de colecciones y requests. No debe confundirse ni reemplazarse con `AppSidebar`, que es la navegación global.

## Estado y comportamiento importantes

- `useProjectStore` ya no mantiene pestañas. Usa `activeProjectId: string | null`.
- `activeProjectId === null` representa la portada/lista de proyectos.
- Crear un proyecto desde cualquier entrada lo selecciona automáticamente.
- Eliminar el proyecto activo limpia `activeProjectId`.
- Los ambientes globales y del proyecto pueden permanecer activos simultáneamente. Las variables del proyecto tienen prioridad sobre las globales.
- El selector superior refleja el ambiente del proyecto y muestra el global como contexto secundario cuando ambos están activos.
- El selector superior de ambientes se cierra en cuanto se elige o desactiva una opción, aunque la persistencia finalice de forma asíncrona.
- `HistoryPage` usa `useConsoleStore`; conserva como máximo 200 entradas y solo representa la sesión actual. No es historial persistente.
- La búsqueda superior filtra proyectos en Home y entradas cuando está abierta la vista History. El árbol de requests conserva su buscador local.

## Archivos principales del rediseño

- `frontend/src/layouts/MainLayout.tsx`: composición y estado del shell.
- `frontend/src/components/common/TopBar.tsx`: barra superior y menús de contexto.
- `frontend/src/components/common/AppSidebar.tsx`: navegación global.
- `frontend/src/components/common/WindowControls.tsx`: controles nativos de ventana Wails.
- `frontend/src/pages/HomePage/HomePage.tsx`: envoltorio de la portada.
- `frontend/src/components/home/ContainerListProjects.tsx`: hero, proyectos y estado vacío.
- `frontend/src/pages/Environments/EnvironmentsPage.tsx`: gestión integrada de ambientes y variables.
- `frontend/src/pages/ProjectSettings/ProjectSettingsPage.tsx`: configuración a nivel de proyecto.
- `frontend/src/pages/History/HistoryPage.tsx`: historial de la sesión.
- `frontend/src/stores/project.store.ts`: proyecto activo sin modelo de pestañas.
- `frontend/src/controllers/project.controller.ts`: selección y regreso a Home.
- `frontend/src/pages/Settings/Settings.tsx`: nuevo modal de configuración general en 2 paneles.
- `frontend/src/components/common/AppToastContainer.tsx`: sistema sobrio y compacto de notificaciones toast.
- `frontend/src/stores/request.store.ts`: persistencia de pestaña activa por petición (`activeTabByRequest`) y contexto global (`lastActiveTab`).
- `frontend/src/services/request.service.ts`: persistencia y serialización de auth, query JSON en `getRequests`.
- `frontend/src/controllers/request.controller.ts`: inyección automática de Content-Type y guardado completo en `executeRequest`.
- `frontend/src/utils/curl-parser.ts`: parser local de comandos cURL; separa URL, params, headers, auth y body sin ejecutar el comando ni enviar secretos fuera del dispositivo.
- `frontend/src/components/modals/ImportCurlModal.tsx`: diálogo de importación accesible desde el menú `+` de Collections.
- `database/database.go`: normalizador `cleanArgs` para parámetros de consulta SQLite (Go maps/slices -> JSON).
- `httpclient/client.go`: inyección fallback de Content-Type por defecto (`application/json`, `application/x-www-form-urlencoded`).
- `frontend/src/App.css`: sistema visual y estilos de la ventana frameless.
- `main.go`: configuración Wails, incluyendo `Frameless: true`.

## Detalles de la ventana personalizada

- Las funciones provienen de `frontend/wailsjs/runtime/runtime`:
  - `WindowMinimise`
  - `WindowToggleMaximise`
  - `WindowIsMaximised`
  - `Quit`
- `WindowControls` comprueba la existencia del runtime antes de llamar a Wails, para que el frontend también pueda renderizar en Vite Preview.
- El estado maximizado se sincroniza al montar y en eventos `resize`.
- Los elementos interactivos de `TopBar` usan `--wails-draggable: no-drag`.
- Los cambios a `Frameless` requieren reiniciar completamente la aplicación Wails; hot reload no aplica esa opción nativa.

## Incidente corregido que no debe reintroducirse

El primer `TopBar` provocó un ciclo infinito de React porque un selector de Zustand devolvía un arreglo literal nuevo (`[]`) en cada snapshot. Esto activaba `ErrorBoundary` con la pantalla “Something went wrong”.

Mantén valores de fallback no primitivos estables y declarados a nivel de módulo, como `EMPTY_ENVIRONMENTS`. No devuelvas `[]` u `{}` nuevos desde selectores Zustand.

## Validación realizada

Los últimos cambios pasaron:

```powershell
cd frontend
& .\node_modules\.bin\tsc.cmd -p .\tsconfig.json
node --experimental-strip-types --test tests/curl-parser.test.ts
& .\node_modules\.bin\vite.cmd build

cd ..
go test ./...
```

`go test ./...` necesita acceso a la caché de compilación de Go fuera del workspace en este entorno.

La interfaz también fue montada una vez mediante Vite Preview después de corregir el ciclo de Zustand. Las llamadas al backend Wails no funcionan en un navegador normal, lo cual es esperado; los controles de ventana deben probarse dentro de la aplicación Wails.

## Working tree y archivos del usuario

- Hay cambios sin commit correspondientes a este rediseño. Presérvalos.
- `frontend/src/assets/images/` contiene recursos suministrados por el usuario y debe conservarse.
- El directorio raíz `styles/` ya estaba sin seguimiento y pertenece al usuario. No eliminarlo ni modificarlo salvo petición explícita.
- Evita comandos destructivos o limpiezas globales del repositorio.

## Próximos pasos recomendados

- Continuar iterando con capturas reales de la aplicación Wails, no asumir que Vite Preview reproduce el chrome nativo.
- Mantener la barra superior en 58 px salvo nueva indicación del usuario.
- Si se amplía History, añadir `projectId` a `ConsoleEntry` y persistencia antes de presentarlo como historial por proyecto.
- Si se cambia la búsqueda superior, definir primero su alcance por sección para evitar comportamientos inesperados.
- Antes de entregar cambios de frontend, ejecutar TypeScript, build de Vite y una comprobación de runtime proporcional al riesgo.
