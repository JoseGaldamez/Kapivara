import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { MainLayout } from "./layouts/MainLayout";
import { settingsController } from "./controllers/settings.controller";
import { projectController } from "./controllers/project.controller";
import { useTheme } from "./hooks/useTheme";


import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { useSettingsStore } from "./stores/settings.store";

function App() {
  useTheme();
  const theme = useSettingsStore(state => state.settings.theme);
  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');

      const handleChange = (e: MediaQueryListEvent) => {
        setEffectiveTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setEffectiveTheme(theme as "light" | "dark");
    }
  }, [theme]);

  useEffect(() => {
    const initApp = async () => {
      // 1. Load settings and projects in parallel
      await Promise.all([
        settingsController.loadSettings(),
        projectController.loadProjects(),
      ]);

      // 2. Close splashscreen
      setTimeout(() => {
        invoke("close_splashscreen");
      }, 50);
    };

    initApp();
  }, []);

  return (
    <>
      <MainLayout />
      <ToastContainer position="bottom-right" theme={effectiveTheme} />
    </>
  );
}

export default App;
