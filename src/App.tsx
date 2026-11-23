
/**
 * LabGuardian AI
 *
 * Main Application Component
 *
 * Aplicación principal para la gestión,
 * monitoreo y trazabilidad de muestras
 * de laboratorio mediante inteligencia artificial.
 */

import { RouterProvider } from "react-router-dom";

import router from "./router";

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
