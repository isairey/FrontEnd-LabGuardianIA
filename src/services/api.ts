
// src/services/api.ts

import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

/**
 * LabGuardian AI
 * API Client
 *
 * Cliente HTTP centralizado para comunicarse con el backend FastAPI.
 */

// ============================================================
// CONFIGURATION
// ============================================================

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1"
).replace(/\/+$/, "");

const API_TIMEOUT = 15000;

// ============================================================
// TYPES
// ============================================================

export interface ApiErrorResponse {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

export interface ApiRequestConfig extends AxiosRequestConfig {
  skipErrorHandler?: boolean;
}

// ============================================================
// ERROR HANDLING
// ============================================================

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;

  constructor(error: ApiErrorResponse) {
    super(error.message);

    this.name = "ApiError";
    this.status = error.status;
    this.code = error.code;
    this.details = error.details;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

const normalizeError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      detail?: string | { msg?: string }[];
      message?: string;
      code?: string;
    }>;

    const responseData = axiosError.response?.data;

    let message = "No fue posible completar la solicitud.";

    if (typeof responseData?.detail === "string") {
      message = responseData.detail;
    } else if (Array.isArray(responseData?.detail)) {
      message = responseData.detail
        .map((item) => item.msg)
        .filter(Boolean)
        .join(", ");
    } else if (responseData?.message) {
      message = responseData.message;
    } else if (axiosError.code === "ECONNABORTED") {
      message = "La solicitud tardó demasiado. Intenta nuevamente.";
    } else if (!axiosError.response) {
      message = "No se pudo conectar con el servidor.";
    } else if (axiosError.response.status === 401) {
      message = "Tu sesión ha expirado o no estás autorizado.";
    } else if (axiosError.response.status === 403) {
      message = "No tienes permisos para realizar esta operación.";
    } else if (axiosError.response.status === 404) {
      message = "El recurso solicitado no fue encontrado.";
    } else if (axiosError.response.status >= 500) {
      message = "Ocurrió un error interno en el servidor.";
    }

    return new ApiError({
      message,
      status: axiosError.response?.status,
      code: responseData?.code ?? axiosError.code,
      details: responseData ?? axiosError.message,
    });
  }

  if (error instanceof Error) {
    return new ApiError({
      message: error.message,
    });
  }

  return new ApiError({
    message: "Ocurrió un error inesperado.",
  });
};

// ============================================================
// AXIOS INSTANCE
// ============================================================

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Agregar token de autenticación cuando esté disponible.
    // Mantener la clave sincronizada con el módulo de autenticación.
    const token = localStorage.getItem("labguardian_access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: unknown) => Promise.reject(normalizeError(error))
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    const normalizedError = normalizeError(error);

    // No se realiza una redirección automática en caso de 401.
    // La autenticación podrá gestionar la expiración de sesión
    // cuando se implemente el módulo correspondiente.

    return Promise.reject(normalizedError);
  }
);

// ============================================================
// HTTP METHODS
// ============================================================

export const apiService = {
  /**
   * GET
   */
  async get<T>(
    url: string,
    config?: ApiRequestConfig
  ): Promise<T> {
    const response = await api.get<T>(url, config);
    return response.data;
  },

  /**
   * POST
   */
  async post<T, D = unknown>(
    url: string,
    data?: D,
    config?: ApiRequestConfig
  ): Promise<T> {
    const response = await api.post<T>(url, data, config);
    return response.data;
  },

  /**
   * PUT
   */
  async put<T, D = unknown>(
    url: string,
    data?: D,
    config?: ApiRequestConfig
  ): Promise<T> {
    const response = await api.put<T>(url, data, config);
    return response.data;
  },

  /**
   * PATCH
   */
  async patch<T, D = unknown>(
    url: string,
    data?: D,
    config?: ApiRequestConfig
  ): Promise<T> {
    const response = await api.patch<T>(url, data, config);
    return response.data;
  },

  /**
   * DELETE
   */
  async delete<T = void>(
    url: string,
    config?: ApiRequestConfig
  ): Promise<T> {
    const response = await api.delete<T>(url, config);
    return response.data;
  },

  /**
   * Descargar archivos.
   */
  async download(
    url: string,
    config?: ApiRequestConfig
  ): Promise<Blob> {
    const response = await api.get<Blob>(url, {
      ...config,
      responseType: "blob",
    });

    return response.data;
  },

  /**
   * Subir archivos.
   */
  async upload<T>(
    url: string,
    file: File,
    fieldName = "file",
    config?: ApiRequestConfig
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const response = await api.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        "Content-Type": undefined,
      },
    });

    return response.data;
  },
};

// ============================================================
// UTILITIES
// ============================================================

export const getApiBaseUrl = (): string => API_BASE_URL;

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

export { normalizeError };

export default api;
