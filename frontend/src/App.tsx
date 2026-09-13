import { useEffect } from "react";
import "./App.css";
import { MainLayout } from "./layouts/MainLayout";
import { settingsController } from "./controllers/settings.controller";
import { projectController } from "./controllers/project.controller";
import { useTheme } from "./hooks/useTheme";

import { AppToastContainer } from "./components/common/AppToastContainer";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const effectiveTheme = useTheme();

  useEffect(() => {
    const initApp = async () => {
      try {
        // Load settings and projects in parallel
        await Promise.all([
          settingsController.loadSettings(),
          projectController.loadProjects(),
        ]);
      } catch (error) {
        console.error('Initialization failed:', error);
      }
    };

    initApp();
  }, []);

  return (
    <>
      <MainLayout />
      <AppToastContainer theme={effectiveTheme} />
    </>
  );
}

export default App;
