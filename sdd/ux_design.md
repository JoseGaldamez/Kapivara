# UX Design, Aesthetics & Themes

Kapivara is designed to feel highly premium, fluid, and responsive, presenting an aesthetic inspired by advanced developer tools. By combining dynamic animations, custom styling widgets, and high-performance layouts, the application ensures a satisfying user experience.

This document describes the design system, custom interactive indicators, layout rules, and visual components of Kapivara.

---

## 🎨 Visual Palette & Aesthetics

Kapivara moves away from generic, plain desktop colors, using a carefully selected palette of deep neutral grays, slate elements, and warm accent tones:

* **Light Mode**: Leverages clean, soft, light-blue/gray backdrops (`#e4e8f1b7`) matched with crisp white panels, avoiding harsh contrasts.
* **Dark Mode**: Features slate colors (`rgb(17, 24, 39)` to `rgb(31, 41, 55)`) providing an immersive environment that matches native IDE themes.
* **Typography**: Uses modern sans-serif typography with monospace families for code components, parameter trees, and database fields to ensure readability.
* **Transitions**: Micro-interactions are animated with CSS transitions (e.g. `transition-colors`, `transition-all`) to provide smooth feedback when toggling tabs, expanding folders, or resizing panels.

---

## 🏷️ The `VarBadge` Inline Indicator System

One of Kapivara's unique UX features is the **`VarBadge`** inline template indicator (`src/components/common/VarBadge.tsx`). 

When developers edit URLs, headers, or query parameters and input variable placeholders like `{{ base_url }}`, Kapivara analyzes the string in real-time. It renders an interactive, color-coded badge depending on whether the variable is resolved:

```
[ {{ base_url }} ]
        │
        ├─► [ exists = true ]  ──► Violet Badge  ──► Hover: Shows tooltip with resolved value
        │                                        ──► Click: Opens environment variable editor
        │
        └─► [ exists = false ] ──► Red Badge     ──► Hover: "Variable not found"
                                                 ──► Click: Quick action to create or fix
```

### Key UI details of the `VarBadge`:
1. **Violet Badge (Variable Exists)**: Styled using a light violet background (`bg-violet-50` / `dark:bg-violet-900/25`), violet borders, and violet monospace text. Hovering displays a floating tooltip rendering the live resolved value. Clicking opens the active environment modal to edit it.
2. **Red Badge (Variable Missing)**: Styled using a light red background (`bg-red-50` / `dark:bg-red-900/25`), red borders, and red text. Hovering informs the user the variable is undefined, and clicking prompts them to add it.
3. **Tooltip Portal**: Renders tooltips using a React Portal (`createPortal` directly into `document.body`) with `fixed` positions. This prevents tooltips from getting clipped by containers with `overflow-hidden` or scrolling views.

---

## 🎛️ Workspace Layout & Panels

The Workspace page (`Workspace.tsx`) uses a classic, highly productive three-panel design:

1. **Sidebar Panel**:
   * Displays the project name, active project environment selector, and hierarchical list of collections and requests.
   * Leverages nested layout trees with accordion controls.
   * Features hover menus allowing rapid addition, renaming, or deletion of requests/folders.
2. **Request Detail Panel (`RequestPanel.tsx`)**:
   * Divided into Tab groups: **Query Params**, **Headers**, **Body**, **Authorization**, and **Settings**.
   * Integrates code editors (like Monaco or custom textarea bindings) with word-wrap and font-size adjustments.
   * Real-time saving: Whenever query parameters or headers are edited, changes save to the database seamlessly without requiring a manual save button.
3. **Response Visualizer & Console (`RequestConsole.tsx`)**:
   * A slide-up console at the bottom displays real-time execution statistics (status, size, duration).
   * Features a built-in JSON Viewer (`JsonViewer.tsx`) that prettifies, indents, and color-codes JSON response payloads.
   * Automatically parses content-types to determine whether to render standard text, pretty JSON trees, or raw web pages.

---

## 🚀 Splashscreen Boot Lifecycle

To avoid displaying white flickering panels while the backend initializes database migrations and sets up connection locks, Kapivara implements a multi-window boot sequence:

```
[ App Launch ]
      │
      ├─► Opens native, compact "splashscreen" window (displays Capybara logo + progress)
      ├─► Backend initializes SQLite migrations & database handles in background
      │
      └─► Frontend triggers "close_splashscreen" Tauri Command
                │
                ├─► Native command displays & focuses the "main" window
                └─► Closes the "splashscreen" window
```

This ensures the user gets a responsive, modern desktop app experience starting from the launch animation.
