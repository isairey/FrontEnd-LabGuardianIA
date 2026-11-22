/**
 * LabGuardian AI
 * API Types
 *
 * Tipos compartidos para las respuestas HTTP,
 * errores, paginación y configuración de peticiones.
 */

// ======================================================
// HTTP
// ======================================================

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";

export type ApiContentType =
  | "application/json"
  | "multipart/form-data"
  | "application/x-www-form-urlencoded";

// ======================================================
// API RESPONSE
// ======================================================

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface ApiErrorResponse {
  success?: false;
  message?: string;
  detail?: string | Record<string, unknown>[];
  error?: string;
  code?: string;
  status_code?: number;
  timestamp?: string;
}

export interface ApiMessageResponse {
  success: boolean;
  message: string;
}

// ======================================================
// PAGINATION
// ======================================================

export interface PaginationParams {
  page?: number;
  page_size?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next?: boolean;
  has_previous?: boolean;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ======================================================
// FILTERS
// ======================================================

export interface DateRangeFilter {
  start_date?: string;
  end_date?: string;
}

export interface SearchFilter {
  search?: string;
  query?: string;
}

export interface SortParams {
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// ======================================================
// REQUEST CONFIGURATION
// ======================================================

export interface ApiRequestConfig {
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  responseType?: "json" | "blob" | "arraybuffer" | "text";
  signal?: AbortSignal;
}

export interface ApiUploadProgress {
  loaded: number;
  total?: number;
  percentage?: number;
}

export interface ApiUploadConfig extends ApiRequestConfig {
  onProgress?: (progress: ApiUploadProgress) => void;
}

// ======================================================
// API ERROR
// ======================================================

export interface ApiValidationError {
  loc?: (string | number)[];
  msg: string;
  type?: string;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    status = 0,
    code?: string,
    details?: unknown
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// ======================================================
// API STATUS
// ======================================================

export interface ApiHealthResponse {
  status: "healthy" | "unhealthy";
  service?: string;
  version?: string;
  timestamp?: string;
}

export interface ApiStatus {
  online: boolean;
  loading: boolean;
  lastChecked?: string;
  error?: string;
}

// ======================================================
// GENERIC SERVICE TYPES
// ======================================================

export interface ApiServiceResult<T> {
  data: T | null;
  success: boolean;
  message?: string;
  error?: string;
}

export interface ApiBatchResponse<T> {
  successful: T[];
  failed: Array<{
    id?: number | string;
    error: string;
  }>;
  total: number;
}

// ======================================================
// ENVIRONMENT
// ======================================================

export interface ApiEnvironment {
  VITE_API_URL?: string;
  VITE_API_TIMEOUT?: string;
}