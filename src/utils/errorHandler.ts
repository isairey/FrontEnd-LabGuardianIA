
/**
 * LabGuardian AI
 * Error Handler
 *
 * Manejo centralizado de errores de la aplicación.
 */

import axios, {
  AxiosError,
  isAxiosError,
} from "axios";

import {
  HTTP_STATUS,
  ERROR_MESSAGES,
} from "./constants";

/* =========================================================
   TYPES
========================================================= */

export type AppErrorType =
  | "network"
  | "authentication"
  | "authorization"
  | "validation"
  | "not_found"
  | "conflict"
  | "server"
  | "timeout"
  | "cancelled"
  | "unknown";

export interface ApiValidationDetail {
  loc?: Array<string | number>;
  msg?: string;
  type?: string;
  field?: string;
  message?: string;
}

export interface AppError {
  name: string;
  message: string;
  type: AppErrorType;
  status?: number;
  code?: string;
  details?: unknown;
  validationErrors?: ApiValidationDetail[];
  originalError?: unknown;
  timestamp: string;
}

export interface ErrorHandlerOptions {
  fallbackMessage?: string;
  includeOriginalError?: boolean;
  logError?: boolean;
}

export interface ErrorNotification {
  title: string;
  message: string;
  type: "error" | "warning" | "info";
  duration?: number;
}

/* =========================================================
   CUSTOM ERROR CLASS
========================================================= */

export class AppException extends Error {
  public readonly type: AppErrorType;
  public readonly status?: number;
  public readonly code?: string;
  public readonly details?: unknown;
  public readonly validationErrors?: ApiValidationDetail[];

  constructor(
    message: string,
    options: {
      type?: AppErrorType;
      status?: number;
      code?: string;
      details?: unknown;
      validationErrors?: ApiValidationDetail[];
    } = {}
  ) {
    super(message);

    this.name = "AppException";
    this.type = options.type ?? "unknown";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.validationErrors = options.validationErrors;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/* =========================================================
   HELPERS
========================================================= */

function getErrorMessage(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (
    value &&
    typeof value === "object" &&
    "message" in value &&
    typeof value.message === "string" &&
    value.message.trim()
  ) {
    return value.message.trim();
  }

  return undefined;
}

function getValidationErrors(
  data: unknown
): ApiValidationDetail[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  const record = data as Record<string, unknown>;

  const detail = record.detail ?? record.errors;

  if (Array.isArray(detail)) {
    return detail.map((item): ApiValidationDetail => {
      if (typeof item === "string") {
        return { message: item };
      }

      if (item && typeof item === "object") {
        const error = item as Record<string, unknown>;

        return {
          loc: Array.isArray(error.loc)
            ? error.loc.filter(
                (part): part is string | number =>
                  typeof part === "string" ||
                  typeof part === "number"
              )
            : undefined,
          msg: getErrorMessage(error.msg),
          type: getErrorMessage(error.type),
          field: getErrorMessage(error.field),
          message:
            getErrorMessage(error.message) ??
            getErrorMessage(error.msg),
        };
      }

      return { message: String(item) };
    });
  }

  if (detail && typeof detail === "object") {
    return Object.entries(
      detail as Record<string, unknown>
    ).map(([field, message]) => ({
      field,
      message: getErrorMessage(message) ?? String(message),
    }));
  }

  return [];
}

function getFastApiMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const record = data as Record<string, unknown>;

  return (
    getErrorMessage(record.message) ??
    getErrorMessage(record.detail) ??
    getErrorMessage(record.error)
  );
}

function getStatusMessage(status?: number): string {
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return "La solicitud contiene datos incorrectos.";

    case HTTP_STATUS.UNAUTHORIZED:
      return ERROR_MESSAGES.unauthorized;

    case HTTP_STATUS.FORBIDDEN:
      return ERROR_MESSAGES.forbidden;

    case HTTP_STATUS.NOT_FOUND:
      return ERROR_MESSAGES.notFound;

    case HTTP_STATUS.CONFLICT:
      return "El registro ya existe o presenta un conflicto.";

    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return ERROR_MESSAGES.validation;

    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return "Ocurrió un error interno en el servidor.";

    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      return "El servicio no está disponible temporalmente.";

    default:
      if (status && status >= 500) {
        return ERROR_MESSAGES.generic;
      }

      return ERROR_MESSAGES.loading;
  }
}

/* =========================================================
   ERROR CLASSIFICATION
========================================================= */

function classifyHttpError(status?: number): AppErrorType {
  if (!status) return "network";

  if (status === HTTP_STATUS.UNAUTHORIZED) {
    return "authentication";
  }

  if (status === HTTP_STATUS.FORBIDDEN) {
    return "authorization";
  }

  if (status === HTTP_STATUS.NOT_FOUND) {
    return "not_found";
  }

  if (status === HTTP_STATUS.CONFLICT) {
    return "conflict";
  }

  if (status === HTTP_STATUS.BAD_REQUEST ||
      status === HTTP_STATUS.UNPROCESSABLE_ENTITY) {
    return "validation";
  }

  if (status >= 500) {
    return "server";
  }

  return "unknown";
}

/* =========================================================
   NORMALIZE ERROR
========================================================= */

export function normalizeError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): AppError {
  const {
    fallbackMessage = ERROR_MESSAGES.generic,
    includeOriginalError = false,
    logError = false,
  } = options;

  const timestamp = new Date().toISOString();

  let normalized: AppError;

  if (error instanceof AppException) {
    normalized = {
      name: error.name,
      message: error.message,
      type: error.type,
      status: error.status,
      code: error.code,
      details: error.details,
      validationErrors: error.validationErrors,
      timestamp,
    };
  } else if (isAxiosError(error)) {
    normalized = normalizeAxiosError(
      error,
      fallbackMessage,
      timestamp
    );
  } else if (error instanceof Error) {
    normalized = {
      name: error.name,
      message: error.message || fallbackMessage,
      type: "unknown",
      timestamp,
    };
  } else {
    normalized = {
      name: "UnknownError",
      message:
        getErrorMessage(error) ?? fallbackMessage,
      type: "unknown",
      timestamp,
    };
  }

  if (includeOriginalError) {
    normalized.originalError = error;
  }

  if (logError) {
    logAppError(normalized);
  }

  return normalized;
}

/* =========================================================
   AXIOS ERROR NORMALIZATION
========================================================= */

function normalizeAxiosError(
  error: AxiosError,
  fallbackMessage: string,
  timestamp: string
): AppError {
  const status = error.response?.status;
  const responseData = error.response?.data;

  const validationErrors = getValidationErrors(responseData);

  let type = classifyHttpError(status);
  let message = getFastApiMessage(responseData);

  if (
    error.code === "ECONNABORTED" ||
    error.code === "ETIMEDOUT"
  ) {
    type = "timeout";
    message = "La solicitud tardó demasiado tiempo.";
  } else if (error.code === "ERR_CANCELED") {
    type = "cancelled";
    message = "La solicitud fue cancelada.";
  } else if (!error.response) {
    type = "network";
    message = ERROR_MESSAGES.network;
  } else if (!message && status) {
    message = getStatusMessage(status);
  }

  return {
    name: "AxiosError",
    message: message ?? fallbackMessage,
    type,
    status,
    code: error.code,
    details: responseData,
    validationErrors:
      validationErrors.length > 0
        ? validationErrors
        : undefined,
    timestamp,
  };
}

/* =========================================================
   ERROR MESSAGE
========================================================= */

export function getErrorMessageFrom(
  error: unknown,
  fallback = ERROR_MESSAGES.generic
): string {
  return normalizeError(error, {
    fallbackMessage: fallback,
  }).message;
}

/* =========================================================
   VALIDATION ERRORS
========================================================= */

export function getFieldErrors(
  error: unknown
): Record<string, string> {
  const normalized = normalizeError(error);

  const result: Record<string, string> = {};

  normalized.validationErrors?.forEach((item) => {
    const field =
      item.field ??
      item.loc?.filter(
        (part): part is string => typeof part === "string"
      ).at(-1);

    const message = item.message ?? item.msg;

    if (field && message) {
      result[field] = message;
    }
  });

  return result;
}

export function hasValidationErrors(
  error: unknown
): boolean {
  return getFieldErrors(error) !==
    Object.create(null) &&
    Object.keys(getFieldErrors(error)).length > 0;
}

/* =========================================================
   ERROR TYPE CHECKS
========================================================= */

export function isNetworkError(error: unknown): boolean {
  return normalizeError(error).type === "network";
}

export function isAuthenticationError(
  error: unknown
): boolean {
  return normalizeError(error).type === "authentication";
}

export function isAuthorizationError(
  error: unknown
): boolean {
  return normalizeError(error).type === "authorization";
}

export function isValidationError(
  error: unknown
): boolean {
  return normalizeError(error).type === "validation";
}

export function isNotFoundError(error: unknown): boolean {
  return normalizeError(error).type === "not_found";
}

export function isServerError(error: unknown): boolean {
  return normalizeError(error).type === "server";
}

export function isTimeoutError(error: unknown): boolean {
  return normalizeError(error).type === "timeout";
}

export function isCancelledError(error: unknown): boolean {
  return normalizeError(error).type === "cancelled";
}

/* =========================================================
   HTTP STATUS CHECK
========================================================= */

export function isHttpStatus(
  error: unknown,
  status: number
): boolean {
  return normalizeError(error).status === status;
}

/* =========================================================
   ERROR NOTIFICATIONS
========================================================= */

export function createErrorNotification(
  error: unknown
): ErrorNotification {
  const normalized = normalizeError(error);

  const warningTypes: AppErrorType[] = [
    "validation",
    "conflict",
  ];

  return {
    title: warningTypes.includes(normalized.type)
      ? "Revisa la información"
      : "Ha ocurrido un error",
    message: normalized.message,
    type: warningTypes.includes(normalized.type)
      ? "warning"
      : "error",
    duration: 4000,
  };
}

/* =========================================================
   LOGGING
========================================================= */

export function logAppError(error: AppError): void {
  if (import.meta.env.DEV) {
    console.error("[LabGuardian AI]", {
      name: error.name,
      type: error.type,
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details,
      timestamp: error.timestamp,
    });
  }

  // En producción, la integración con un servicio de
  // monitoreo debe realizarse desde este punto.
}

/* =========================================================
   ERROR HANDLER
========================================================= */

export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): AppError {
  const normalized = normalizeError(error, {
    ...options,
    logError: options.logError ?? true,
  });

  return normalized;
}

/* =========================================================
   ASYNC ERROR HANDLER
========================================================= */

export async function handleAsync<T>(
  promise: Promise<T>,
  options: ErrorHandlerOptions = {}
): Promise<[T | null, AppError | null]> {
  try {
    const result = await promise;

    return [result, null];
  } catch (error) {
    return [
      null,
      normalizeError(error, {
        ...options,
        logError: options.logError ?? true,
      }),
    ];
  }
}

/* =========================================================
   RETRY HELPERS
========================================================= */

export function shouldRetryRequest(
  error: unknown
): boolean {
  const normalized = normalizeError(error);

  return (
    normalized.type === "network" ||
    normalized.type === "timeout" ||
    normalized.type === "server"
  );
}

export function isRetryableAxiosError(
  error: unknown
): boolean {
  if (!isAxiosError(error)) return false;

  if (
    error.code === "ERR_CANCELED" ||
    error.code === "ERR_BAD_REQUEST"
  ) {
    return false;
  }

  return shouldRetryRequest(error);
}

/* =========================================================
   ERROR FACTORIES
========================================================= */

export function createValidationError(
  message = ERROR_MESSAGES.validation,
  validationErrors: ApiValidationDetail[] = []
): AppException {
  return new AppException(message, {
    type: "validation",
    status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
    validationErrors,
  });
}

export function createNetworkError(
  message = ERROR_MESSAGES.network
): AppException {
  return new AppException(message, {
    type: "network",
  });
}

export function createNotFoundError(
  message = ERROR_MESSAGES.notFound
): AppException {
  return new AppException(message, {
    type: "not_found",
    status: HTTP_STATUS.NOT_FOUND,
  });
}

export function createAuthorizationError(
  message = ERROR_MESSAGES.forbidden
): AppException {
  return new AppException(message, {
    type: "authorization",
    status: HTTP_STATUS.FORBIDDEN,
  });
}

export function createAuthenticationError(
  message = ERROR_MESSAGES.unauthorized
): AppException {
  return new AppException(message, {
    type: "authentication",
    status: HTTP_STATUS.UNAUTHORIZED,
  });
}

/* =========================================================
   DEFAULT EXPORT
========================================================= */

const errorHandler = {
  normalizeError,
  handleError,
  handleAsync,
  getErrorMessageFrom,
  getFieldErrors,
  hasValidationErrors,
  createErrorNotification,
  shouldRetryRequest,
  isRetryableAxiosError,
  isNetworkError,
  isAuthenticationError,
  isAuthorizationError,
  isValidationError,
  isNotFoundError,
  isServerError,
  isTimeoutError,
  isCancelledError,
  isHttpStatus,
  logAppError,
};

export default errorHandler;
