
/**
 * LabGuardian AI
 * Global Constants
 *
 * Constantes centralizadas de la aplicación.
 */

/* =========================================================
   APPLICATION
========================================================= */

export const APP_CONFIG = {
  name: "LabGuardian AI",
  fullName: "Laboratory Guardian AI",
  description:
    "Plataforma inteligente de monitoreo, trazabilidad y análisis de riesgos de muestras clínicas.",
  version: "1.0.0",
  author: "LabGuardian AI",
  language: "es-MX",
  locale: "es-MX",
  timezone: "America/Mexico_City",
  defaultTheme: "light" as const,
} as const;

/* =========================================================
   ENVIRONMENT
========================================================= */

const ENV_API_URL = import.meta.env.VITE_API_URL;

export const ENV_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  apiUrl: (
    ENV_API_URL || "http://127.0.0.1:8000/api/v1"
  ).replace(/\/+$/, ""),
  enableMockData:
    import.meta.env.VITE_ENABLE_MOCK_DATA === "true",
} as const;

/* =========================================================
   API
========================================================= */

export const API_CONFIG = {
  baseUrl: ENV_CONFIG.apiUrl,
  timeout: 15000,
  contentType: "application/json",
  headers: {
    Accept: "application/json",
  },
  endpoints: {
    health: "/health",
    auth: "/auth",
    users: "/users",
    dashboard: "/dashboard",
    samples: "/samples",
    equipment: "/equipment",
    alerts: "/alerts",
    risks: "/risks",
    events: "/events",
    traceability: "/traceability",
    qr: "/qr",
    laboratories: "/laboratories",
  },
} as const;

/* =========================================================
   ROUTES
========================================================= */

export const ROUTES = {
  root: "/",
  dashboard: "/dashboard",
  samples: "/samples",
  sampleDetails: "/samples/:id",
  equipment: "/equipment",
  qrScanner: "/qr-scanner",
  riskAnalysis: "/risk-analysis",
  traceability: "/traceability",
  alerts: "/alerts",
  settings: "/settings",
  profile: "/profile",
  notFound: "*",
} as const;

/* =========================================================
   LOCAL STORAGE
========================================================= */

export const STORAGE_KEYS = {
  accessToken: "labguardian_access_token",
  refreshToken: "labguardian_refresh_token",
  user: "labguardian_user",
  theme: "labguardian_theme",
  language: "labguardian_language",
  sidebarCollapsed: "labguardian_sidebar_collapsed",
  dashboardPreferences: "labguardian_dashboard_preferences",
  sampleFilters: "labguardian_sample_filters",
  equipmentFilters: "labguardian_equipment_filters",
} as const;

/* =========================================================
   PAGINATION
========================================================= */

export const PAGINATION = {
  defaultPage: 1,
  defaultPageSize: 10,
  dashboardPageSize: 5,
  maxPageSize: 100,
  pageSizeOptions: [5, 10, 20, 50, 100],
} as const;

/* =========================================================
   DATE AND TIME
========================================================= */

export const DATE_CONFIG = {
  locale: "es-MX",
  timezone: "America/Mexico_City",
  dateFormat: "dd/MM/yyyy",
  dateTimeFormat: "dd/MM/yyyy HH:mm",
  timeFormat: "HH:mm",
  apiDateFormat: "yyyy-MM-dd",
} as const;

/* =========================================================
   SAMPLE STATUS
========================================================= */

export const SAMPLE_STATUS = {
  PENDING: "pending",
  RECEIVED: "received",
  PROCESSING: "processing",
  IN_ANALYSIS: "in_analysis",
  COMPLETED: "completed",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
} as const;

export const SAMPLE_STATUS_LABELS = {
  pending: "Pendiente",
  received: "Recibida",
  processing: "En procesamiento",
  in_analysis: "En análisis",
  completed: "Completada",
  rejected: "Rechazada",
  cancelled: "Cancelada",
} as const;

/* =========================================================
   SAMPLE TYPES
========================================================= */

export const SAMPLE_TYPES = {
  BLOOD: "blood",
  URINE: "urine",
  STOOL: "stool",
  SALIVA: "saliva",
  SERUM: "serum",
  PLASMA: "plasma",
  TISSUE: "tissue",
  SWAB: "swab",
  OTHER: "other",
} as const;

export const SAMPLE_TYPE_LABELS = {
  blood: "Sangre",
  urine: "Orina",
  stool: "Heces",
  saliva: "Saliva",
  serum: "Suero",
  plasma: "Plasma",
  tissue: "Tejido",
  swab: "Hisopado",
  other: "Otro",
} as const;

/* =========================================================
   PRIORITIES
========================================================= */

export const PRIORITY = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
  CRITICAL: "critical",
} as const;

export const PRIORITY_LABELS = {
  low: "Baja",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
  critical: "Crítica",
} as const;

/* =========================================================
   RISK LEVELS
========================================================= */

export const RISK_LEVEL = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
  UNKNOWN: "unknown",
} as const;

export const RISK_LEVEL_LABELS = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
  critical: "Crítico",
  unknown: "Sin evaluar",
} as const;

export const RISK_SCORE = {
  minimum: 0,
  maximum: 100,
  low: 25,
  medium: 50,
  high: 75,
  critical: 90,
} as const;

/* =========================================================
   ALERTS
========================================================= */

export const ALERT_SEVERITY = {
  INFO: "info",
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export const ALERT_STATUS = {
  ACTIVE: "active",
  ACKNOWLEDGED: "acknowledged",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
} as const;

export const ALERT_SEVERITY_LABELS = {
  info: "Informativa",
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica",
} as const;

/* =========================================================
   EQUIPMENT
========================================================= */

export const EQUIPMENT_STATUS = {
  OPERATIONAL: "operational",
  MAINTENANCE: "maintenance",
  INACTIVE: "inactive",
  OUT_OF_SERVICE: "out_of_service",
} as const;

export const EQUIPMENT_STATUS_LABELS = {
  operational: "Operativo",
  maintenance: "En mantenimiento",
  inactive: "Inactivo",
  out_of_service: "Fuera de servicio",
} as const;

/* =========================================================
   TRACEABILITY EVENTS
========================================================= */

export const SAMPLE_EVENT_TYPES = {
  REGISTRATION: "registration",
  IDENTIFICATION: "identification",
  RECEPTION: "reception",
  TEMPERATURE: "temperature",
  PROCESSING: "processing",
  ANALYSIS: "analysis",
  QUALITY_CONTROL: "quality_control",
  RESULT: "result",
  VALIDATION: "validation",
  REJECTION: "rejection",
  TRANSFER: "transfer",
  STORAGE: "storage",
  DELIVERY: "delivery",
  INCIDENT: "incident",
  ALERT: "alert",
  OTHER: "other",
} as const;

export const SAMPLE_EVENT_TYPE_LABELS = {
  registration: "Registro",
  identification: "Identificación",
  reception: "Recepción",
  temperature: "Temperatura",
  processing: "Procesamiento",
  analysis: "Análisis",
  quality_control: "Control de calidad",
  result: "Resultado",
  validation: "Validación",
  rejection: "Rechazo",
  transfer: "Transferencia",
  storage: "Almacenamiento",
  delivery: "Entrega",
  incident: "Incidente",
  alert: "Alerta",
  other: "Otro",
} as const;

/* =========================================================
   TEMPERATURE
========================================================= */

export const TEMPERATURE_CONFIG = {
  unit: "°C",
  defaultMinimum: 2,
  defaultMaximum: 8,
  refreshInterval: 30000,
} as const;

/* =========================================================
   QR
========================================================= */

export const QR_CONFIG = {
  defaultFormat: "png" as const,
  defaultSize: 256,
  errorCorrectionLevel: "H" as const,
  scannerFramesPerSecond: 10,
  scannerQrboxSize: 250,
} as const;

/* =========================================================
   UI
========================================================= */

export const UI_CONFIG = {
  sidebarWidth: 260,
  sidebarCollapsedWidth: 76,
  headerHeight: 72,
  mobileBreakpoint: 768,
  tabletBreakpoint: 1024,
  toastDuration: 4000,
  tooltipDelay: 500,
  animationDuration: 200,
} as const;

/* =========================================================
   CHARTS
========================================================= */

export const CHART_CONFIG = {
  defaultHeight: 300,
  defaultAnimationDuration: 500,
  riskColors: {
    low: "#16A34A",
    medium: "#EAB308",
    high: "#F97316",
    critical: "#DC2626",
    unknown: "#94A3B8",
  },
  sampleStatusColors: {
    pending: "#94A3B8",
    received: "#0EA5E9",
    processing: "#6366F1",
    in_analysis: "#8B5CF6",
    completed: "#16A34A",
    rejected: "#DC2626",
    cancelled: "#64748B",
  },
} as const;

/* =========================================================
   FILE UPLOAD
========================================================= */

export const FILE_CONFIG = {
  maxSizeMB: 10,
  maxSizeBytes: 10 * 1024 * 1024,
  allowedImageTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
  ],
  allowedDocumentTypes: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
} as const;

/* =========================================================
   VALIDATION
========================================================= */

export const VALIDATION = {
  sampleCode: {
    minLength: 3,
    maxLength: 50,
  },
  description: {
    minLength: 3,
    maxLength: 1000,
  },
  search: {
    minLength: 2,
    debounce: 350,
  },
  password: {
    minLength: 8,
    maxLength: 128,
  },
} as const;

/* =========================================================
   HTTP STATUS
========================================================= */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/* =========================================================
   ERROR MESSAGES
========================================================= */

export const ERROR_MESSAGES = {
  generic: "Ocurrió un error inesperado.",
  network: "No se pudo conectar con el servidor.",
  unauthorized: "Tu sesión ha expirado. Inicia sesión nuevamente.",
  forbidden: "No tienes permisos para realizar esta acción.",
  notFound: "No se encontró el recurso solicitado.",
  validation: "Verifica los datos ingresados.",
  loading: "No se pudo cargar la información.",
  saving: "No se pudieron guardar los cambios.",
  deleting: "No se pudo eliminar el registro.",
  invalidFile: "El archivo seleccionado no es válido.",
  fileTooLarge: "El archivo supera el tamaño máximo permitido.",
} as const;

/* =========================================================
   SUCCESS MESSAGES
========================================================= */

export const SUCCESS_MESSAGES = {
  created: "Registro creado correctamente.",
  updated: "Registro actualizado correctamente.",
  deleted: "Registro eliminado correctamente.",
  saved: "Cambios guardados correctamente.",
  exported: "Archivo exportado correctamente.",
  synchronized: "Información sincronizada correctamente.",
} as const;

/* =========================================================
   CONFIRMATION MESSAGES
========================================================= */

export const CONFIRM_MESSAGES = {
  deleteSample: "¿Estás seguro de eliminar esta muestra?",
  deleteEquipment: "¿Estás seguro de eliminar este equipo?",
  rejectSample: "¿Deseas rechazar esta muestra?",
  cancelOperation: "¿Deseas cancelar esta operación?",
  logout: "¿Estás seguro de cerrar sesión?",
} as const;

/* =========================================================
   EMPTY STATES
========================================================= */

export const EMPTY_MESSAGES = {
  samples: "No hay muestras registradas.",
  equipment: "No hay equipos registrados.",
  alerts: "No hay alertas disponibles.",
  events: "No hay eventos de trazabilidad.",
  search: "No se encontraron resultados.",
  dashboard: "No hay información disponible.",
} as const;

/* =========================================================
   REGULAR EXPRESSIONS
========================================================= */

export const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  sampleCode: /^[A-Za-z0-9_-]+$/,
  numeric: /^\d+$/,
  decimal: /^\d+(\.\d+)?$/,
} as const;

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

export function getRiskLevelFromScore(
  score: number
): keyof typeof RISK_LEVEL_LABELS {
  if (!Number.isFinite(score)) return "unknown";

  if (score >= RISK_SCORE.critical) return "critical";
  if (score >= RISK_SCORE.high) return "high";
  if (score >= RISK_SCORE.medium) return "medium";

  return "low";
}

export function getRiskLabel(
  level: keyof typeof RISK_LEVEL_LABELS
): string {
  return RISK_LEVEL_LABELS[level];
}

export function getSampleStatusLabel(
  status: keyof typeof SAMPLE_STATUS_LABELS
): string {
  return SAMPLE_STATUS_LABELS[status];
}

export function getEquipmentStatusLabel(
  status: keyof typeof EQUIPMENT_STATUS_LABELS
): string {
  return EQUIPMENT_STATUS_LABELS[status];
}

export function getAlertSeverityLabel(
  severity: keyof typeof ALERT_SEVERITY_LABELS
): string {
  return ALERT_SEVERITY_LABELS[severity];
}

export function formatNumber(
  value: number,
  maximumFractionDigits = 2
): string {
  return new Intl.NumberFormat(APP_CONFIG.locale, {
    maximumFractionDigits,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${formatNumber(value, 1)}%`;
}

export function formatDate(
  value: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat(APP_CONFIG.locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(date);
}

export function formatDateTime(value: string | Date): string {
  return formatDate(value, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isValidTemperature(
  temperature: number,
  minimum = TEMPERATURE_CONFIG.defaultMinimum,
  maximum = TEMPERATURE_CONFIG.defaultMaximum
): boolean {
  return (
    Number.isFinite(temperature) &&
    temperature >= minimum &&
    temperature <= maximum
  );
}

export function isAllowedFile(
  file: File,
  allowedTypes: readonly string[] = [
    ...FILE_CONFIG.allowedImageTypes,
    ...FILE_CONFIG.allowedDocumentTypes,
  ]
): boolean {
  return allowedTypes.includes(file.type);
}

export function isFileWithinSizeLimit(file: File): boolean {
  return file.size <= FILE_CONFIG.maxSizeBytes;
}
