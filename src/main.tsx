import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ToggleThemeProvider } from "./components/ThemeContext";
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ToggleThemeProvider>
      <App />
    </ToggleThemeProvider>
  </React.StrictMode>,
);
