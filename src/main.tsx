
/**
 * LabGuardian AI
 *
 * Application Entry Point
 *
 * Inicializa React y monta la aplicación
 * en el elemento raíz del documento HTML.
 */

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

// Global styles
import "./assets/styles/variables.css";
import "./assets/styles/animations.css";
import "./assets/styles/globals.css";

// ============================================================
// ROOT ELEMENT
// ============================================================

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "No se encontró el elemento #root en index.html",
  );
}

// ============================================================
// APPLICATION RENDER
// ============================================================

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);