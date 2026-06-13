# Kapivara

![Kapivara Logo](frontend/src/assets/logo-kapivara.png)

**A modern, high-performance desktop application built for efficiency.**

[![Download Now](https://img.shields.io/badge/Download_Now-www.kapivara.dev-2ea44f?style=for-the-badge)](https://www.kapivara.dev/)

[Explore the docs](#getting-started) · [Report Bug](https://github.com/JoseGaldamez/Kapivara/issues) · [Request Feature](https://github.com/JoseGaldamez/Kapivara/issues)

---

## 🚀 About The Project (Tauri → Wails Migration)

Kapivara is a powerful desktop application designed to provide a seamless user experience. Originally built with **Tauri** (Rust), the application has been migrated to **Wails** (Go) to improve backend modularity, development velocity, and system resource management.

While many desktop applications are bloated and slow, Kapivara focuses on speed, security, and a minimal footprint, combining the lightweight execution of Go on the backend with a premium, responsive React-TS webview on the frontend.

## 🛠️ Built With

This project is built using a modern technology stack to ensure performance and maintainability:

- [![Wails](https://img.shields.io/badge/Wails-0099FF?style=for-the-badge&logo=go&logoColor=white)](https://wails.io/)
- [![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://go.dev/)
- [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
- [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
- [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
- [![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)](https://github.com/pmndrs/zustand)
- [![Vite](https://img.shields.io/badge/Vite-000000?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)

## 📦 Version and Status

**Current Version:** `0.2.0` (Wails Migration Beta)

> [!NOTE]  
> Kapivara is currently in active development. Features may change as we iterate towards the v1.0 release.

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- **Go** (version 1.23+ or 1.25 recommended)
- **Node.js** (Latest LTS recommended)
- **Wails CLI** (Install via `go install github.com/wailsapp/wails/v2/cmd/wails@latest`)

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/JoseGaldamez/Kapivara.git
    ```
2.  Install NPM packages
    ```sh
    cd frontend && npm install && cd ..
    ```
3.  Run the development server
    ```sh
    wails dev
    ```
4.  Build a redistributable, production mode package
    ```sh
    wails build
    ```

## 🤝 Contributing

Consulte el archivo [CONTRIBUTING.md](./CONTRIBUTING.md) para obtener más información sobre cómo contribuir.

## 📝 License

Distributed under a **Source Available License**.

- **Free to read, modify, and contribute.**
- **Commercial use is restricted to the copyright holder.**

See [LICENSE](./LICENSE) for more information.

## 👤 Contact

**Jose Galdamez** - [GitHub Profile](https://github.com/JoseGaldamez)

**Email:** [contacto@josegaldamez.dev](mailto:contacto@josegaldamez.dev)

**Website:** [josegaldamez.dev](https://josegaldamez.dev)

**LinkedIn:** [LinkedIn Profile](https://www.linkedin.com/in/josegaldamezdev)

**X:** [X Profile](https://x.com/josegaldamezdev)

Project Link: [https://github.com/JoseGaldamez/Kapivara](https://github.com/JoseGaldamez/Kapivara)
