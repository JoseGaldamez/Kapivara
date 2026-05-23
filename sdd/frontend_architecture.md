# Frontend Architecture & State Engine

Kapivara's user interface is a desktop frontend built using **React v19**, **TypeScript**, and **TailwindCSS v4**, compiled via **Vite v7**. The architecture follows a strict, highly organized **Controller-Service-View** pattern which keeps UI concerns separated from the database storage layer and native system command layers.

---

## 🏛️ Directory Layout

The `src` directory maps out as follows:
```
src/
├── components/          # Reusable UI fragments (modals, buttons, badges)
│   ├── common/          # Global common UI elements (VarBadge, Buttons)
│   ├── workspace/       # Sidebar, Request panels, JSON visualizers
│   └── home/            # Project cards, homepage setup
├── controllers/         # State orchestrators coordinating between UI, Zustand, and DB
├── services/            # Low-level communication logic (SQLite statements, IPC calls)
├── stores/              # Zustand stores representing the reactive application states
├── pages/               # High-level route views (HomePage, Workspace, Settings)
├── layouts/             # Main global screen containers (MainLayout)
├── types/               # Strict TypeScript interface and type declarations
└── utils/               # Constants, utility functions, template resolvers
```

---

## 🔄 The Controller-Service-View Cycle

Kapivara does not write database statements or Tauri IPC invocations directly inside React UI components. Instead, it delegates calls down a robust operational hierarchy:

```
┌──────────────────┐       User action       ┌────────────────────────┐
│    React View    │ ──────────────────────> │       Controller       │
│ (Workspace.tsx)  │ <────────────────────── │ (request.controller.ts)│
└──────────────────┘     Reactive update     └────────────────────────┘
          ▲                                               │
          │                                               │ Triggers service
          │ Zustand state change                          ▼
┌──────────────────┐                         ┌────────────────────────┐
│  Zustand Store   │ <────────────────────── │        Service         │
│ (request.store)  │   Mutates local state   │  (request.service.ts)  │
└──────────────────┘                         └────────────────────────┘
                                                          │
                                                          │ SQLite SQL queries /
                                                          │ IPC invoke triggers
                                                          ▼
                                             ┌────────────────────────┐
                                             │      SQLite / Rust     │
                                             └────────────────────────┘
```

1. **View (React)**: Renders the active layout and collects inputs. When a user submits an action (e.g., clicking *Send* or *Create Request*), it invokes the corresponding method on a **Controller**.
2. **Controller (e.g., `requestController`)**: Manages the business sequence. It triggers loading/refresh states, requests changes from a **Service**, and writes the resolved results to a reactive **Zustand Store**.
3. **Service (e.g., `RequestService`)**: Communicates with the database via `DBService.execute`/`DBService.select` or calls Rust commands using the `@tauri-apps/api/core` bridge.
4. **Zustand Store (e.g., `useRequestStore`)**: Reacts to the controller's updates and propagates state mutations instantly to all listening React views.

---

## 🧠 Zustand Reactive State Stores

State management is split into five context-specific Zustand stores to maximize rendering speed and isolate concerns:

### 1. `project.store.ts`
* **Purpose**: Coordinates workspace-level navigation.
* **Key State**:
  * `projects`: Listing of all existing projects.
  * `tabs`: List of open workspace tabs (each tab can be of type `'home'` or `'project'`).
  * `activeTabId`: Currently selected tab ID.
  * `isSettingsOpen`: Tracks the open state of the application's configuration modal.

### 2. `request.store.ts`
* **Purpose**: Coordinates request hierarchy, collection structures, responses, and dirty flags.
* **Key State**:
  * `requestsByProject`: Record of request objects mapped by project ID.
  * `collectionsByProject`: Folders list per project ID.
  * `activeRequestIdByProject`: Currently viewed request per project.
  * `savedResponsesByRequest`: List of historical responses saved for a specific request.

### 3. `environment.store.ts`
* **Purpose**: Manages active selected variables and scoping.
* **Key State**:
  * `projectEnvironmentsByProject`: Environments linked to specific project IDs.
  * `globalEnvironments`: Globally shared environment variables.
  * `activeProjectEnvironmentIdByProject`: Active project environment ID.
  * `activeGlobalEnvironmentId`: Active global environment ID.

### 4. `console.store.ts`
* **Purpose**: Maintains a history log of recent outgoing request cycles, visible in the bottom console panel.
* **Key State**:
  * `logs`: List of log objects (URL, method, status, response size, body, and timestamp).

### 5. `settings.store.ts`
* **Purpose**: Synchronizes application setting parameters (theme, SSL settings, editor size).

---

## 🎛️ Routing & Layout Synchronization

Because Tauri applications usually avoid standard multi-page browser routers (to prevent unnecessary window reload cycles), Kapivara leverages `MainLayout` to orchestrate structural panels:

* **`MainLayout.tsx`**: Renders the `TabsHeader` at the top (similar to a browser tab bar). It determines the active tab:
  * If the active tab is `home`, it displays the `<HomePage />` containing project cards and general workspace utilities.
  * If the active tab is a project, it dynamically loads `<Workspace key={project.uid} project={project} />`.
* **`<Workspace />`**: Divides the screen into a:
  * **Sidebar**: Interactive tree representing nested Collections and Requests, complete with drag-and-drop triggers.
  * **RequestPanel**: Form request details (URL, query headers, request body tabs, authorization details).
  * **RequestConsole**: Slide-up debug logs summarizing execution histories.
