
/// <reference types="vite/client" />

/**
 * LabGuardian AI
 *
 * Vite Environment Type Definitions
 *
 * Tipado de variables de entorno utilizadas
 * por el frontend de la aplicación.
 */

interface ImportMetaEnv {
  /**
   * URL base de la API del backend.
   * Ejemplo: http://127.0.0.1:8000/api/v1
   */
  readonly VITE_API_URL: string;

  /**
   * Nombre de la aplicación.
   */
  readonly VITE_APP_NAME?: string;

  /**
   * Versión de la aplicación.
   */
  readonly VITE_APP_VERSION?: string;

  /**
   * Entorno de ejecución.
   */
  readonly VITE_APP_ENV?: "development" | "production" | "test";

  /**
   * Habilita o deshabilita funcionalidades de depuración.
   */
  readonly VITE_DEBUG?: string;

  /**
   * Habilita el uso de datos de demostración.
   */
  readonly VITE_USE_MOCK_DATA?: string;

  /**
   * Intervalo de actualización automática del dashboard.
   */
  readonly VITE_DASHBOARD_REFRESH_INTERVAL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
