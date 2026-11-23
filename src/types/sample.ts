
/**
 * LabGuardian AI
 * Sample Types
 *
 * Tipos e interfaces para la gestión integral de muestras
 * dentro del laboratorio clínico.
 */

/* =========================================================
   UNION TYPES
========================================================= */

export type SampleStatus =
  | "pending"
  | "received"
  | "processing"
  | "in_analysis"
  | "completed"
  | "rejected"
  | "cancelled";

export type SampleType =
  | "blood"
  | "urine"
  | "stool"
  | "saliva"
  | "serum"
  | "plasma"
  | "tissue"
  | "swab"
  | "other";

export type SamplePriority =
  | "low"
  | "normal"
  | "high"
  | "urgent"
  | "critical";

export type SampleRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

export type SampleCondition =
  | "optimal"
  | "acceptable"
  | "compromised"
  | "damaged"
  | "unknown";

export type SampleStorageCondition =
  | "room_temperature"
  | "refrigerated"
  | "frozen"
  | "ultra_frozen"
  | "other";

export type SampleContainerType =
  | "tube"
  | "container"
  | "slide"
  | "swab"
  | "vial"
  | "bag"
  | "other";

export type SampleRejectionReason =
  | "insufficient_volume"
  | "contamination"
  | "incorrect_label"
  | "damaged_container"
  | "incorrect_temperature"
  | "expired"
  | "hemolyzed"
  | "clotted"
  | "other";

/* =========================================================
   SAMPLE PATIENT
========================================================= */

export interface SamplePatient {
  id?: string | number;
  patient_code?: string;
  full_name?: string;
  age?: number;
  sex?: string;
  date_of_birth?: string;
}

/* =========================================================
   SAMPLE LABORATORY
========================================================= */

export interface SampleLaboratory {
  id?: string | number;
  name?: string;
  code?: string;
  location?: string;
}

/* =========================================================
   SAMPLE RESPONSIBLE
========================================================= */

export interface SampleResponsible {
  id?: string | number;
  name: string;
  email?: string;
  role?: string;
}

/* =========================================================
   SAMPLE TEMPERATURE
========================================================= */

export interface SampleTemperature {
  value: number;
  unit: "°C" | "°F";
  measured_at: string;
  sensor_id?: string;
  is_within_range?: boolean;
  minimum_allowed?: number;
  maximum_allowed?: number;
}

/* =========================================================
   SAMPLE RISK
========================================================= */

export interface SampleRiskFactor {
  id?: string | number;
  name: string;
  description?: string;
  weight?: number;
  score?: number;
  category?: string;
}

export interface SampleRisk {
  level: SampleRiskLevel;
  score?: number;
  factors?: SampleRiskFactor[];
  recommendations?: string[];
  analyzed_at?: string;
  explanation?: string;
}

/* =========================================================
   SAMPLE ATTACHMENTS
========================================================= */

export interface SampleAttachment {
  id: string | number;
  name: string;
  filename?: string;
  url?: string;
  mime_type?: string;
  size?: number;
  uploaded_at?: string;
  uploaded_by?: string;
}

/* =========================================================
   MAIN SAMPLE INTERFACE
========================================================= */

export interface SampleData {
  id: string | number;

  code: string;
  name?: string;

  type: SampleType;
  status: SampleStatus;
  priority: SamplePriority;

  patient_id?: string | number;
  patient?: SamplePatient;

  laboratory_id?: string | number;
  laboratory?: SampleLaboratory;

  responsible_id?: string | number;
  responsible?: SampleResponsible;

  description?: string;
  observations?: string;

  collection_date?: string;
  reception_date?: string;
  processing_date?: string;
  analysis_date?: string;
  completion_date?: string;

  expiration_date?: string;

  volume?: number;
  volume_unit?: string;

  container_type?: SampleContainerType;
  container_code?: string;

  condition?: SampleCondition;
  storage_condition?: SampleStorageCondition;

  temperature?: number;
  temperature_unit?: "°C" | "°F";
  temperature_history?: SampleTemperature[];

  risk_level?: SampleRiskLevel;
  risk_score?: number;
  risk?: SampleRisk;

  rejection_reason?: SampleRejectionReason;
  rejection_notes?: string;

  equipment_id?: string | number;

  qr_code?: string;
  qr_code_url?: string;

  attachments?: SampleAttachment[];

  metadata?: Record<string, unknown>;

  created_at: string;
  updated_at?: string;
}

/* =========================================================
   CREATE / UPDATE PAYLOADS
========================================================= */

export interface SampleCreatePayload {
  code?: string;
  name?: string;

  type: SampleType;
  priority?: SamplePriority;

  patient_id?: string | number;
  laboratory_id?: string | number;
  responsible_id?: string | number;

  description?: string;
  observations?: string;

  collection_date?: string;
  reception_date?: string;
  expiration_date?: string;

  volume?: number;
  volume_unit?: string;

  container_type?: SampleContainerType;
  container_code?: string;

  condition?: SampleCondition;
  storage_condition?: SampleStorageCondition;

  temperature?: number;
  temperature_unit?: "°C" | "°F";

  equipment_id?: string | number;

  metadata?: Record<string, unknown>;
}

export interface SampleUpdatePayload {
  name?: string;
  type?: SampleType;
  priority?: SamplePriority;

  patient_id?: string | number;
  laboratory_id?: string | number;
  responsible_id?: string | number;

  description?: string;
  observations?: string;

  collection_date?: string;
  reception_date?: string;
  expiration_date?: string;

  volume?: number;
  volume_unit?: string;

  container_type?: SampleContainerType;
  container_code?: string;

  condition?: SampleCondition;
  storage_condition?: SampleStorageCondition;

  temperature?: number;
  temperature_unit?: "°C" | "°F";

  equipment_id?: string | number;

  metadata?: Record<string, unknown>;
}

export interface SampleStatusPayload {
  status: SampleStatus;
  notes?: string;
  reason?: string;
}

export interface SampleRejectionPayload {
  reason: SampleRejectionReason;
  notes?: string;
}

/* =========================================================
   FILTERS
========================================================= */

export interface SampleFilters {
  search?: string;

  code?: string;
  type?: SampleType | SampleType[];
  status?: SampleStatus | SampleStatus[];
  priority?: SamplePriority | SamplePriority[];

  risk_level?: SampleRiskLevel | SampleRiskLevel[];
  condition?: SampleCondition;

  patient_id?: string | number;
  laboratory_id?: string | number;
  responsible_id?: string | number;
  equipment_id?: string | number;

  collection_date_from?: string;
  collection_date_to?: string;

  created_from?: string;
  created_to?: string;

  is_expired?: boolean;
  requires_attention?: boolean;
}

export interface SamplePagination {
  page?: number;
  page_size?: number;
  limit?: number;
  offset?: number;
}

export interface SampleSort {
  sort_by?:
    | "code"
    | "type"
    | "status"
    | "priority"
    | "collection_date"
    | "created_at"
    | "updated_at"
    | "risk_score";

  sort_order?: "asc" | "desc";
}

export type SampleQueryParams =
  SampleFilters &
  SamplePagination &
  SampleSort;

/* =========================================================
   API RESPONSES
========================================================= */

export interface SampleListResponse {
  items: SampleData[];
  total: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
  has_next?: boolean;
  has_previous?: boolean;
}

export interface SampleApiResponse<T = SampleData> {
  success?: boolean;
  message?: string;
  data: T;
}

export interface SampleActionResponse {
  success: boolean;
  message?: string;
  sample?: SampleData;
}

export interface SampleDeleteResponse {
  success: boolean;
  message?: string;
  deleted_id?: string | number;
}

export interface SampleExportResponse {
  filename: string;
  url?: string;
  content_type?: string;
  total_records?: number;
}

/* =========================================================
   SUMMARY
========================================================= */

export interface SampleSummary {
  total: number;

  pending: number;
  received: number;
  processing: number;
  in_analysis: number;
  completed: number;
  rejected: number;
  cancelled: number;

  low_risk: number;
  medium_risk: number;
  high_risk: number;
  critical_risk: number;

  expired: number;
  requiring_attention: number;
}

export interface SampleStatusDistribution {
  status: SampleStatus;
  count: number;
  percentage?: number;
}

export interface SampleTypeDistribution {
  type: SampleType;
  count: number;
  percentage?: number;
}

export interface SampleRiskDistribution {
  level: SampleRiskLevel;
  count: number;
  percentage?: number;
}

export interface SampleTrendPoint {
  date: string;
  total: number;
  received?: number;
  completed?: number;
  rejected?: number;
}

/* =========================================================
   EXPORT OPTIONS
========================================================= */

export type SampleExportFormat = "csv" | "xlsx" | "pdf" | "json";

export interface SampleExportOptions {
  format: SampleExportFormat;
  filters?: SampleFilters;
  include_patient?: boolean;
  include_risk?: boolean;
  include_temperature?: boolean;
  include_events?: boolean;
  start_date?: string;
  end_date?: string;
}

/* =========================================================
   COMPONENT PROPS
========================================================= */

export interface SampleCardProps {
  sample: SampleData;
  compact?: boolean;
  showRisk?: boolean;
  onClick?: (sample: SampleData) => void;
}

export interface SampleTableProps {
  samples: SampleData[];
  loading?: boolean;
  selectedIds?: Array<string | number>;
  onSelect?: (ids: Array<string | number>) => void;
  onView?: (sample: SampleData) => void;
  onEdit?: (sample: SampleData) => void;
  onDelete?: (sample: SampleData) => void;
}

export interface SampleFormProps {
  initialData?: Partial<SampleData>;
  loading?: boolean;
  onSubmit: (
    payload: SampleCreatePayload | SampleUpdatePayload
  ) => void | Promise<void>;
  onCancel?: () => void;
}

export interface SampleBadgeProps {
  status?: SampleStatus;
  priority?: SamplePriority;
  riskLevel?: SampleRiskLevel;
}

export interface SampleFiltersProps {
  filters: SampleFilters;
  onChange: (filters: SampleFilters) => void;
  onReset?: () => void;
}

/* =========================================================
   LABELS
========================================================= */

export const SAMPLE_STATUS_LABELS: Record<SampleStatus, string> = {
  pending: "Pendiente",
  received: "Recibida",
  processing: "En procesamiento",
  in_analysis: "En análisis",
  completed: "Completada",
  rejected: "Rechazada",
  cancelled: "Cancelada",
};

export const SAMPLE_TYPE_LABELS: Record<SampleType, string> = {
  blood: "Sangre",
  urine: "Orina",
  stool: "Heces",
  saliva: "Saliva",
  serum: "Suero",
  plasma: "Plasma",
  tissue: "Tejido",
  swab: "Hisopado",
  other: "Otro",
};

export const SAMPLE_PRIORITY_LABELS: Record<SamplePriority, string> = {
  low: "Baja",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
  critical: "Crítica",
};

export const SAMPLE_RISK_LABELS: Record<SampleRiskLevel, string> = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
  critical: "Crítico",
  unknown: "Sin evaluar",
};

export const SAMPLE_CONDITION_LABELS: Record<SampleCondition, string> = {
  optimal: "Óptima",
  acceptable: "Aceptable",
  compromised: "Comprometida",
  damaged: "Dañada",
  unknown: "Desconocida",
};

export const SAMPLE_STORAGE_LABELS: Record<
  SampleStorageCondition,
  string
> = {
  room_temperature: "Temperatura ambiente",
  refrigerated: "Refrigerada",
  frozen: "Congelada",
  ultra_frozen: "Ultracongelada",
  other: "Otra",
};

export const SAMPLE_REJECTION_REASON_LABELS: Record<
  SampleRejectionReason,
  string
> = {
  insufficient_volume: "Volumen insuficiente",
  contamination: "Contaminación",
  incorrect_label: "Etiquetado incorrecto",
  damaged_container: "Recipiente dañado",
  incorrect_temperature: "Temperatura incorrecta",
  expired: "Muestra caducada",
  hemolyzed: "Muestra hemolizada",
  clotted: "Muestra coagulada",
  other: "Otro motivo",
};

/* =========================================================
   DEFAULT VALUES
========================================================= */

export const DEFAULT_SAMPLE_SUMMARY: SampleSummary = {
  total: 0,

  pending: 0,
  received: 0,
  processing: 0,
  in_analysis: 0,
  completed: 0,
  rejected: 0,
  cancelled: 0,

  low_risk: 0,
  medium_risk: 0,
  high_risk: 0,
  critical_risk: 0,

  expired: 0,
  requiring_attention: 0,
};

/* =========================================================
   TYPE GUARDS
========================================================= */

export function isSampleStatus(
  value: unknown
): value is SampleStatus {
  return (
    typeof value === "string" &&
    value in SAMPLE_STATUS_LABELS
  );
}

export function isSampleType(
  value: unknown
): value is SampleType {
  return (
    typeof value === "string" &&
    value in SAMPLE_TYPE_LABELS
  );
}

export function isSamplePriority(
  value: unknown
): value is SamplePriority {
  return (
    typeof value === "string" &&
    value in SAMPLE_PRIORITY_LABELS
  );
}

export function isSampleRiskLevel(
  value: unknown
): value is SampleRiskLevel {
  return (
    typeof value === "string" &&
    value in SAMPLE_RISK_LABELS
  );
}

/* =========================================================
   NORMALIZATION
========================================================= */

export function normalizeSampleStatus(
  value: unknown
): SampleStatus {
  if (isSampleStatus(value)) return value;

  const normalized = String(value ?? "").toLowerCase();

  const aliases: Record<string, SampleStatus> = {
    pendiente: "pending",
    recibida: "received",
    recibido: "received",
    procesamiento: "processing",
    procesando: "processing",
    "en análisis": "in_analysis",
    "en analisis": "in_analysis",
    completada: "completed",
    completado: "completed",
    rechazada: "rejected",
    rechazado: "rejected",
    cancelada: "cancelled",
    cancelado: "cancelled",
  };

  return aliases[normalized] ?? "pending";
}

export function normalizeSampleType(
  value: unknown
): SampleType {
  if (isSampleType(value)) return value;

  const normalized = String(value ?? "").toLowerCase();

  const aliases: Record<string, SampleType> = {
    sangre: "blood",
    orina: "urine",
    heces: "stool",
    saliva: "saliva",
    suero: "serum",
    plasma: "plasma",
    tejido: "tissue",
    hisopado: "swab",
    otro: "other",
  };

  return aliases[normalized] ?? "other";
}

export function normalizeSamplePriority(
  value: unknown
): SamplePriority {
  if (isSamplePriority(value)) return value;

  const normalized = String(value ?? "").toLowerCase();

  const aliases: Record<string, SamplePriority> = {
    baja: "low",
    normal: "normal",
    alta: "high",
    urgente: "urgent",
    critica: "critical",
    crítica: "critical",
  };

  return aliases[normalized] ?? "normal";
}

/* =========================================================
   UTILITY FUNCTIONS
========================================================= */

export function getSampleStatusLabel(
  status: SampleStatus
): string {
  return SAMPLE_STATUS_LABELS[status];
}

export function getSampleTypeLabel(
  type: SampleType
): string {
  return SAMPLE_TYPE_LABELS[type];
}

export function getSamplePriorityLabel(
  priority: SamplePriority
): string {
  return SAMPLE_PRIORITY_LABELS[priority];
}

export function getSampleRiskLabel(
  level: SampleRiskLevel
): string {
  return SAMPLE_RISK_LABELS[level];
}

export function isSampleExpired(
  sample: SampleData,
  referenceDate = new Date()
): boolean {
  if (!sample.expiration_date) return false;

  const expiration = new Date(sample.expiration_date);

  if (Number.isNaN(expiration.getTime())) return false;

  return expiration.getTime() < referenceDate.getTime();
}

export function requiresSampleAttention(
  sample: SampleData
): boolean {
  return (
    sample.status === "rejected" ||
    sample.status === "cancelled" ||
    sample.risk_level === "high" ||
    sample.risk_level === "critical" ||
    sample.condition === "compromised" ||
    sample.condition === "damaged"
  );
}

export function sortSamplesByDate(
  samples: SampleData[],
  order: "asc" | "desc" = "desc"
): SampleData[] {
  return [...samples].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();

    return order === "asc"
      ? dateA - dateB
      : dateB - dateA;
  });
}

export function calculateSampleSummary(
  samples: SampleData[]
): SampleSummary {
  const summary = { ...DEFAULT_SAMPLE_SUMMARY };

  for (const sample of samples) {
    summary.total += 1;

    summary[sample.status] += 1;

    if (sample.risk_level === "low") summary.low_risk += 1;
    if (sample.risk_level === "medium") summary.medium_risk += 1;
    if (sample.risk_level === "high") summary.high_risk += 1;
    if (sample.risk_level === "critical") summary.critical_risk += 1;

    if (isSampleExpired(sample)) summary.expired += 1;

    if (requiresSampleAttention(sample)) {
      summary.requiring_attention += 1;
    }
  }

  return summary;
}

export function formatSampleDate(
  date: string,
  locale = "es-MX"
): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}
