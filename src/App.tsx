import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { MainLayout } from "./layouts/MainLayout";


function App() {
  useEffect(() => {
    setTimeout(() => {
      invoke("close_splashscreen");
    }, 1000);
  }, []);

  return (
    <MainLayout />
  );
}

export default App;
