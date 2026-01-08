import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { HomePage } from "./pages/HomePage/HomePage";

function App() {
  useEffect(() => {
    setTimeout(() => {
      invoke("close_splashscreen");
    }, 1000);
  }, []);

  return (
    <main className="bg-[#e4e8f1b7] w-full h-screen">
      <HomePage />
    </main>
  );
}

export default App;
