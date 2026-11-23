
/**
 * LabGuardian AI
 * Sample Event Types
 *
 * Tipos para representar los eventos asociados al ciclo de vida
 * de una muestra dentro del laboratorio.
 */

/* =========================================================
   ENUMS / UNION TYPES
========================================================= */

export type SampleEventType =
  | "registration"
  | "identification"
  | "reception"
  | "temperature"
  | "processing"
  | "analysis"
  | "quality_control"
  | "result"
  | "validation"
  | "rejection"
  | "transfer"
  | "storage"
  | "delivery"
  | "incident"
  | "alert"
  | "other";

export type SampleEventSeverity =
  | "info"
  | "low"
  | "medium"
  | "high"
  | "critical";

export type SampleEventStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled";

export type SampleEventSource =
  | "manual"
  | "system"
  | "sensor"
  | "integration"
  | "ai";

export type SampleEventActorType =
  | "user"
  | "system"
  | "device"
  | "ai";

export type SampleEventEntityType =
  | "sample"
  | "equipment"
  | "user"
  | "laboratory"
  | "process"
  | "other";

/* =========================================================
   EVENT METADATA
========================================================= */

export interface SampleEventMetadata {
  [key: string]: unknown;
}

export interface SampleEventMeasurement {
  name: string;
  value: number | string;
  unit?: string;
  expected_min?: number;
  expected_max?: number;
  is_within_range?: boolean;
}

export interface SampleEventLocation {
  name?: string;
  area?: string;
  laboratory?: string;
  room?: string;
  position?: string;
}

/* =========================================================
   EVENT ACTOR
========================================================= */

export interface SampleEventActor {
  id?: string;
  name: string;
  type: SampleEventActorType;
  email?: string;
  role?: string;
}

/* =========================================================
   MAIN EVENT
========================================================= */

export interface SampleEventData {
  id: string | number;

  sample_id: string | number;
  sample_code?: string;

  type: SampleEventType;
  title: string;
  description?: string;

  severity: SampleEventSeverity;
  status: SampleEventStatus;

  source: SampleEventSource;

  actor?: SampleEventActor;
  performed_by?: string;
  performed_by_id?: string | number;

  location?: SampleEventLocation | string;

  entity_type?: SampleEventEntityType;
  entity_id?: string | number;

  measurements?: SampleEventMeasurement[];

  previous_value?: unknown;
  current_value?: unknown;

  metadata?: SampleEventMetadata;

  notes?: string;

  occurred_at: string;
  created_at?: string;
  updated_at?: string;

  completed_at?: string;
}

/* =========================================================
   CREATE / UPDATE PAYLOADS
========================================================= */

export interface SampleEventCreatePayload {
  sample_id: string | number;
  type: SampleEventType;
  title: string;
  description?: string;

  severity?: SampleEventSeverity;
  status?: SampleEventStatus;

  source?: SampleEventSource;

  actor?: SampleEventActor;

  performed_by?: string;
  performed_by_id?: string | number;

  location?: SampleEventLocation | string;

  entity_type?: SampleEventEntityType;
  entity_id?: string | number;

  measurements?: SampleEventMeasurement[];

  previous_value?: unknown;
  current_value?: unknown;

  metadata?: SampleEventMetadata;
  notes?: string;

  occurred_at?: string;
}

export interface SampleEventUpdatePayload {
  title?: string;
  description?: string;

  severity?: SampleEventSeverity;
  status?: SampleEventStatus;

  location?: SampleEventLocation | string;

  measurements?: SampleEventMeasurement[];
  metadata?: SampleEventMetadata;

  notes?: string;
  completed_at?: string;
}

export interface SampleEventStatusPayload {
  status: SampleEventStatus;
  notes?: string;
}

/* =========================================================
   FILTERS AND QUERY PARAMETERS
========================================================= */

export interface SampleEventFilters {
  sample_id?: string | number;
  sample_code?: string;

  type?: SampleEventType | SampleEventType[];
  severity?: SampleEventSeverity | SampleEventSeverity[];
  status?: SampleEventStatus | SampleEventStatus[];

  source?: SampleEventSource;
  actor_id?: string | number;

  entity_type?: SampleEventEntityType;

  search?: string;

  start_date?: string;
  end_date?: string;
}

export interface SampleEventPagination {
  page?: number;
  page_size?: number;
  limit?: number;
  offset?: number;
}

export interface SampleEventSort {
  sort_by?: "occurred_at" | "created_at" | "severity" | "type";
  sort_order?: "asc" | "desc";
}

export type SampleEventQueryParams =
  SampleEventFilters &
  SampleEventPagination &
  SampleEventSort;

/* =========================================================
   API RESPONSES
========================================================= */

export interface SampleEventListResponse {
  items: SampleEventData[];
  total: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
  has_next?: boolean;
  has_previous?: boolean;
}

export interface SampleEventApiResponse<T = SampleEventData> {
  success?: boolean;
  message?: string;
  data: T;
}

export interface SampleEventActionResponse {
  success: boolean;
  message?: string;
  event?: SampleEventData;
}

export interface SampleEventHistoryResponse {
  sample_id: string | number;
  sample_code?: string;
  events: SampleEventData[];
  total_events: number;
  first_event?: string;
  last_event?: string;
}

/* =========================================================
   SUMMARY AND STATISTICS
========================================================= */

export interface SampleEventSummary {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  failed: number;
  cancelled: number;

  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export interface SampleEventTypeDistribution {
  type: SampleEventType;
  count: number;
  percentage?: number;
}

export interface SampleEventSeverityDistribution {
  severity: SampleEventSeverity;
  count: number;
  percentage?: number;
}

export interface SampleEventTimelinePoint {
  date: string;
  count: number;
  completed?: number;
  failed?: number;
}

/* =========================================================
   COMPONENT PROPS
========================================================= */

export interface SampleEventCardProps {
  event: SampleEventData;
  compact?: boolean;
  showActor?: boolean;
  showDescription?: boolean;
  showTimestamp?: boolean;
  onClick?: (event: SampleEventData) => void;
}

export interface SampleEventListProps {
  events: SampleEventData[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onEventClick?: (event: SampleEventData) => void;
}

export interface SampleEventTimelineProps {
  events: SampleEventData[];
  loading?: boolean;
  showDates?: boolean;
  showActor?: boolean;
  emptyMessage?: string;
}

export interface SampleEventBadgeProps {
  type?: SampleEventType;
  severity?: SampleEventSeverity;
  status?: SampleEventStatus;
}

/* =========================================================
   LABELS
========================================================= */

export const SAMPLE_EVENT_TYPE_LABELS: Record<SampleEventType, string> = {
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
};

export const SAMPLE_EVENT_SEVERITY_LABELS: Record<
  SampleEventSeverity,
  string
> = {
  info: "Informativo",
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
  critical: "Crítico",
};

export const SAMPLE_EVENT_STATUS_LABELS: Record<
  SampleEventStatus,
  string
> = {
  pending: "Pendiente",
  in_progress: "En progreso",
  completed: "Completado",
  failed: "Fallido",
  cancelled: "Cancelado",
};

export const SAMPLE_EVENT_SOURCE_LABELS: Record<
  SampleEventSource,
  string
> = {
  manual: "Registro manual",
  system: "Sistema",
  sensor: "Sensor",
  integration: "Integración",
  ai: "Inteligencia artificial",
};

/* =========================================================
   DEFAULT VALUES
========================================================= */

export const DEFAULT_SAMPLE_EVENT_SUMMARY: SampleEventSummary = {
  total: 0,
  pending: 0,
  in_progress: 0,
  completed: 0,
  failed: 0,
  cancelled: 0,

  critical: 0,
  high: 0,
  medium: 0,
  low: 0,
  info: 0,
};

/* =========================================================
   TYPE GUARDS
========================================================= */

export function isSampleEventType(
  value: unknown
): value is SampleEventType {
  return (
    typeof value === "string" &&
    value in SAMPLE_EVENT_TYPE_LABELS
  );
}

export function isSampleEventSeverity(
  value: unknown
): value is SampleEventSeverity {
  return (
    typeof value === "string" &&
    value in SAMPLE_EVENT_SEVERITY_LABELS
  );
}

export function isSampleEventStatus(
  value: unknown
): value is SampleEventStatus {
  return (
    typeof value === "string" &&
    value in SAMPLE_EVENT_STATUS_LABELS
  );
}

export function isSampleEventSource(
  value: unknown
): value is SampleEventSource {
  return (
    typeof value === "string" &&
    value in SAMPLE_EVENT_SOURCE_LABELS
  );
}

/* =========================================================
   NORMALIZATION HELPERS
========================================================= */

export function normalizeSampleEventType(
  value: unknown
): SampleEventType {
  if (isSampleEventType(value)) return value;

  const normalized = String(value ?? "").toLowerCase();

  const aliases: Record<string, SampleEventType> = {
    registro: "registration",
    identificacion: "identification",
    identificación: "identification",
    recepcion: "reception",
    recepción: "reception",
    temperatura: "temperature",
    procesamiento: "processing",
    analisis: "analysis",
    análisis: "analysis",
    resultado: "result",
    validacion: "validation",
    validación: "validation",
    rechazo: "rejection",
    transferencia: "transfer",
    almacenamiento: "storage",
    entrega: "delivery",
    incidente: "incident",
    alerta: "alert",
  };

  return aliases[normalized] ?? "other";
}

export function normalizeSampleEventSeverity(
  value: unknown
): SampleEventSeverity {
  if (isSampleEventSeverity(value)) return value;

  const normalized = String(value ?? "").toLowerCase();

  const aliases: Record<string, SampleEventSeverity> = {
    informativo: "info",
    informacion: "info",
    información: "info",
    bajo: "low",
    media: "medium",
    medio: "medium",
    alto: "high",
    critica: "critical",
    crítica: "critical",
    critico: "critical",
    crítico: "critical",
  };

  return aliases[normalized] ?? "info";
}

export function normalizeSampleEventStatus(
  value: unknown
): SampleEventStatus {
  if (isSampleEventStatus(value)) return value;

  const normalized = String(value ?? "").toLowerCase();

  const aliases: Record<string, SampleEventStatus> = {
    pendiente: "pending",
    "en progreso": "in_progress",
    procesando: "in_progress",
    completado: "completed",
    completada: "completed",
    fallido: "failed",
    fallida: "failed",
    cancelado: "cancelled",
    cancelada: "cancelled",
  };

  return aliases[normalized] ?? "pending";
}

/* =========================================================
   UTILITY FUNCTIONS
========================================================= */

export function getSampleEventTypeLabel(
  type: SampleEventType
): string {
  return SAMPLE_EVENT_TYPE_LABELS[type];
}

export function getSampleEventSeverityLabel(
  severity: SampleEventSeverity
): string {
  return SAMPLE_EVENT_SEVERITY_LABELS[severity];
}

export function getSampleEventStatusLabel(
  status: SampleEventStatus
): string {
  return SAMPLE_EVENT_STATUS_LABELS[status];
}

export function isSampleEventCritical(
  event: SampleEventData
): boolean {
  return event.severity === "critical";
}

export function isSampleEventCompleted(
  event: SampleEventData
): boolean {
  return event.status === "completed";
}

export function isSampleEventFailed(
  event: SampleEventData
): boolean {
  return event.status === "failed";
}

export function sortSampleEventsByDate(
  events: SampleEventData[],
  order: "asc" | "desc" = "asc"
): SampleEventData[] {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.occurred_at).getTime();
    const dateB = new Date(b.occurred_at).getTime();

    return order === "asc"
      ? dateA - dateB
      : dateB - dateA;
  });
}

export function groupSampleEventsByDate(
  events: SampleEventData[]
): Record<string, SampleEventData[]> {
  return events.reduce<Record<string, SampleEventData[]>>(
    (groups, event) => {
      const date = new Date(event.occurred_at);

      if (Number.isNaN(date.getTime())) {
        return groups;
      }

      const key = date.toISOString().split("T")[0];

      if (!key) return groups;

      groups[key] ??= [];
      groups[key].push(event);

      return groups;
    },
    {}
  );
}

export function calculateSampleEventSummary(
  events: SampleEventData[]
): SampleEventSummary {
  return events.reduce<SampleEventSummary>(
    (summary, event) => {
      summary.total += 1;
      summary[event.status] += 1;
      summary[event.severity] += 1;

      return summary;
    },
    { ...DEFAULT_SAMPLE_EVENT_SUMMARY }
  );
}

export function formatSampleEventDate(
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
