# Kapivara - System Design Document (SDD)

Welcome to the Software Design Document for **Kapivara**, a lightweight, high-performance API client built using Tauri v2, Rust, React, and TypeScript. Kapivara acts as a faster, more secure, and extremely modern alternative to traditional API clients like Postman or Insomnia.

This document serves as the entry point (`sdd/readme.md`) for understanding the application's overall architecture, technical layout, and core capabilities.

---

## 🚀 Architectural Vision & Philosophy

Kapivara is designed from the ground up around three core tenets:
1. **Performance**: Minimal startup delay and low system resource footprint, realized by pairing a native Rust backend with a compiled React + TypeScript frontend.
2. **Security**: Data is stored completely locally on the user's machine within an embedded SQLite database. No mandatory cloud accounts or unexpected sync protocols.
3. **Developer-centric UX**: A seamless, modern desktop experience featuring fluid drag-and-drop mechanics, nested folders, granular environment handling, and premium aesthetics.

---

## 🛠️ Technology Stack

Kapivara uses a modern, hybrid desktop stack combining native system performance with web runtime flexibility:

| Component | Technology | Role / Purpose |
| :--- | :--- | :--- |
| **Backend Core** | **Rust v2** | Native core, shell management, filesystem and low-level HTTP requests. |
| **App Shell** | **Tauri v2** | Multi-platform application shell, inter-process communication (IPC) channel, system menus. |
| **HTTP Client** | **Reqwest (Rust)** | Industrial-grade HTTP library executing actual network requests with custom multipart processing. |
| **Local Database** | **SQLite** | Embedded database engine managed via the `@tauri-apps/plugin-sql` driver. |
| **Frontend Core** | **React v19 & TypeScript** | Highly-reactive user interface, strictly typed state and layout. |
| **State Management**| **Zustand v5** | Lightweight client-side store maintaining frontend states and synchronization. |
| **Styling** | **TailwindCSS v4** | Modern utility-first CSS layout engine with built-in theme support. |
| **Build Tool** | **Vite v7** | Ultra-fast frontend compilation and Hot Module Replacement (HMR) during development. |

---

## 📁 System Design Files Index

Detailed, specialized documentation is divided across the following functional areas within the `sdd` directory:

1. 📂 **[Database Schema Design](file:///g:/Develop/Kapivara/sdd/database_schema.md)**
   * Complete SQLite table schemas, field mappings, constraints, cascade behaviors, and default values.
2. 🦀 **[Backend Architecture & Native Integration](file:///g:/Develop/Kapivara/sdd/backend_architecture.md)**
   * Detailed breakdown of the Tauri-Rust container, custom command handlers, multipart file parser, and reqwest pipeline.
3. ⚛️ **[Frontend Architecture & State Engine](file:///g:/Develop/Kapivara/sdd/frontend_architecture.md)**
   * React structure, Zustand state stores, Controller-Service-View lifecycle pattern, and layout organization.
4. 🧠 **[Business Logic & Core Workflows](file:///g:/Develop/Kapivara/sdd/business_logic.md)**
   * Template interpolation engine, authorization schemas, request preparation workflows, and response persistence.
5. 🎨 **[UX Design, Aesthetics & Themes](file:///g:/Develop/Kapivara/sdd/ux_design.md)**
   * UI components, the `VarBadge` real-time environment variable indicator system, splashscreen lifecycles, and Tailwind integration.

---

## 🔄 High-Level Process Flow

Below is a conceptual visual representing the workflow of preparing, executing, and logging an HTTP request in Kapivara:

```mermaid
graph TD
    A[User clicks 'Send Request' in React View] --> B[RequestController triggers getResolvedVariables]
    B --> C[EnvironmentController merges Active Global + Project env variables]
    C --> D[RequestController replaces double-curly braces {{var}} in URL, Headers, and Body]
    D --> E[IPC Bridge: invoke 'make_http_request']
    E --> F[Tauri-Rust backend receives command & starts timer]
    F --> G[Rust reads local files for form-data if required]
    G --> H[Reqwest executes HTTP request over internet]
    H --> I[Rust catches response, captures time_ms, status, headers, and body]
    I --> J[IPC Return: resolves promise back to React controller]
    J --> K[RequestController writes response metadata to SQLite DB]
    K --> L[Zustand Stores update: console list gets a new log entry, Workspace view refreshes]
```
