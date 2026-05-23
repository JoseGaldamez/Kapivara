# UX Design, Aesthetics, Themes & Elegant Style System

Kapivara is designed to feel highly premium, fluid, and responsive, presenting an aesthetic inspired by advanced developer tools. By combining dynamic spring animations, custom styling widgets, tactile grid panels, and high-precision typography, the application ensures a satisfying and professional user experience.

This document describes the design system, custom interactive indicators, layout rules, and visual components of Kapivara.

---

## 🎨 Visual Palette & Aesthetics (Apple Muted Scale)

Kapivara moves away from generic, plain desktop colors, leveraging an elegant, low-saturation neutral grid paired with high-precision micro-color highlights.

### 🌓 Theme Colors & Backdrop

* **Light Mode (Apple Standard Light)**: Leverages clean, soft, light-gray backdrops (`#F5F5F7`) matched with crisp white floating rounded panels, avoiding harsh contrasts.
* **Dark Mode (Midnight Slate)**: Features slate colors (`#0D0D11` to `#16161E`) providing an immersive environment that matches native IDE themes.
* **Borders & Separation**: Keep dividing lines thin and translucent (`border-slate-200/50` in light mode, `border-slate-800/40` in dark mode) to emphasize structural depth without visual noise.

### 🏷️ HTTP Method Pastel Palette

Instead of heavy, solid primary colors, Kapivara uses low-saturation backgrounds with high-contrast text for HTTP method representation:

| Method | Visual Style (Light) | Visual Style (Dark) | Description |
| :--- | :--- | :--- | :--- |
| **GET** | Soft Emerald Teal (`bg-emerald-50 text-emerald-700`) | Muted Teal (`bg-emerald-950/30 text-emerald-400`) | Query operations |
| **POST** | Warm Chamois Amber (`bg-amber-50 text-amber-700`) | Muted Gold (`bg-amber-950/30 text-amber-400`) | Entity creations |
| **PUT** | Soft Denim Blue (`bg-indigo-50 text-indigo-700`) | Muted Cobalt (`bg-indigo-950/30 text-indigo-400`) | Complete replacements |
| **DELETE** | Dusty Crimson Rose (`bg-rose-55 text-rose-750`) | Muted Rose (`bg-rose-950/30 text-rose-400`) | Destructive actions |
| **PATCH** | Quiet Lavender (`bg-purple-50 text-purple-700`) | Muted Amethyst (`bg-purple-950/30 text-purple-400`) | Partial mutations |

---

## ✍️ Monospace & UI Typography Pairing

Developer utilities require crisp monospace pairings to maintain layout alignment and premium visual reading flows.

* **Display & General UI**: Uses modern circular geometric typography such as **Geist Sans** or **Outfit** to present clear navigation settings, headers, and buttons.
* **Code & Monospace Trees**: Employs high-readability monospace families like **Geist Mono** or **JetBrains Mono** for URL templates, parameter cards, HTTP headers, JSON trees, and database structures.

---

## 🏷️ The `VarBadge` Inline Indicator System

One of Kapivara's unique UX features is the **`VarBadge`** inline template indicator (`src/components/common/VarBadge.tsx`). 

When developers edit URLs, headers, or query parameters and input variable placeholders like `{{ base_url }}`, Kapivara analyzes the string in real-time. It renders an interactive, glassmorphic, color-coded badge depending on whether the variable is resolved:

```
[ {{ base_url }} ]
        │
        ├─► [ exists = true ]  ──► Glass Violet Badge ──► Hover: Tooltip with live value (Portal)
        │                                             ──► Click: Opens environment editor
        │
        └─► [ exists = false ] ──► Glass Red Badge    ──► Hover: "Variable not found"
                                                      ──► Click: Quick action to create or fix
```

### Key UI details of the `VarBadge`:
1. **Violet Badge (Variable Exists)**: Styled using a light violet translucent background (`bg-violet-50/80` | `dark:bg-violet-950/30`), violet borders, and violet monospace text. Hovering displays a floating tooltip rendering the live resolved value. Clicking opens the active environment modal to edit it.
2. **Red Badge (Variable Missing)**: Styled using a light red translucent background (`bg-rose-50/80` | `dark:bg-rose-950/30`), red borders, and red text. Hovering informs the user the variable is undefined, and clicking prompts them to add it.
3. **Tooltip Portal**: Renders tooltips using a React Portal (`createPortal` directly into `document.body`) with `fixed` positions. This prevents tooltips from getting clipped by containers with `overflow-hidden` or scrolling views.

---

## 🎛️ Workspace Layout & Tactile Panels

The Workspace page (`Workspace.tsx`) uses a highly functional card-based three-panel design that feels physical and clean:

### 1. Floating Card Containers
Instead of merging panels directly with solid black lines, panels float as rounded card shapes (`rounded-2xl shadow-sm bg-white dark:bg-[#16161E] border border-slate-200/50 dark:border-slate-800/40`) separated by elegant air spacing, making the layout feel organic and spacious.

### 2. Segmented Capsule Controls
Instead of traditional high-contrast bordered tabs, tab selectors (e.g. Query Params, Headers, Body, response previews) utilize a capsule-style track (`bg-slate-100 dark:bg-slate-900/60` with a white/dark-slate floating rounded slide indicator) that transitions smoothly via CSS properties.

### 3. Draggable Split Resizers
Resizing handles avoid heavy blocks. Resizers keep physical dividing lines extremely thin (`w-[1px]` or `h-[1px]` in `bg-slate-150` / `dark:bg-slate-800/80`) but cushion them with larger invisible interactive hit areas (`h-2` / `w-2`) overlaid with central tactical grip dots, ensuring resizing is simple and seamless.

### 4. Custom Apple-Style Scrollbars
Native heavy scrollbars are hidden. Scrolling containers use a modern, thin WebKit utility scrollbar:
* **Track**: Transparent.
* **Thumb**: Micro-slate rounded capsule (`w-1.5`) that remains semi-transparent and darkens slightly on hover.

---

## ⚡ Fluid Motion & Springs

Kapivara uses natural animations that respond to interactions with mechanical fluidity:
* **Accordion Folder Springs**: Expanding folder structures in the sidebar transition smoothly using CSS grid height interpolation:
  ```css
  .sidebar-folder-content {
    transition: grid-template-rows 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  ```
* **Send Request Pulse**: Hovering and clicking **Send** triggers a physical breathing glassmorphic outer-glow pulse during processing (`isLoading`), giving a highly responsive feel.

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
