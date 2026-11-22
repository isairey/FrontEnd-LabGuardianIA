/**
 * LabGuardian AI
 * Alert Types
 *
 * Definiciones TypeScript para el sistema de alertas,
 * notificaciones, prioridades y seguimiento de incidencias.
 */

// ======================================================
// ENUMS / UNION TYPES
// ======================================================

export type AlertSeverity =
  | "info"
  | "low"
  | "medium"
  | "high"
  | "critical";

export type AlertStatus =
  | "active"
  | "acknowledged"
  | "resolved"
  | "dismissed";

export type AlertCategory =
  | "sample"
  | "equipment"
  | "temperature"
  | "contamination"
  | "traceability"
  | "processing"
  | "system"
  | "security"
  | "other";

export type AlertEntityType =
  | "sample"
  | "equipment"
  | "user"
  | "system"
  | "other";

export type AlertPriority =
  | "low"
  | "normal"
  | "high"
  | "urgent";

// ======================================================
// CORE INTERFACES
// ======================================================

export interface AlertData {
  id: number;
  title: string;
  message: string;
  description?: string;

  severity: AlertSeverity;
  status: AlertStatus;
  category: AlertCategory;

  priority?: AlertPriority;

  entity_type?: AlertEntityType;
  entity_id?: number;
  entity_name?: string;

  sample_id?: number;
  sample_code?: string;

  equipment_id?: number;
  equipment_name?: string;

  assigned_to?: number;
  assigned_user_name?: string;

  created_at: string;
  updated_at?: string;
  acknowledged_at?: string;
  resolved_at?: string;

  acknowledged_by?: number;
  resolved_by?: number;

  resolution_notes?: string;

  metadata?: Record<string, unknown>;
}

export interface AlertCreatePayload {
  title: string;
  message: string;
  description?: string;

  severity: AlertSeverity;
  category: AlertCategory;

  priority?: AlertPriority;

  entity_type?: AlertEntityType;
  entity_id?: number;

  sample_id?: number;
  equipment_id?: number;

  assigned_to?: number;

  metadata?: Record<string, unknown>;
}

export interface AlertUpdatePayload {
  title?: string;
  message?: string;
  description?: string;

  severity?: AlertSeverity;
  category?: AlertCategory;
  priority?: AlertPriority;

  assigned_to?: number;

  metadata?: Record<string, unknown>;
}

export interface AlertStatusPayload {
  status: AlertStatus;
  resolution_notes?: string;
}

// ======================================================
// FILTERS AND PAGINATION
// ======================================================

export interface AlertFilters {
  search?: string;

  severity?: AlertSeverity | AlertSeverity[];
  status?: AlertStatus | AlertStatus[];
  category?: AlertCategory;

  priority?: AlertPriority;

  entity_type?: AlertEntityType;
  entity_id?: number;

  sample_id?: number;
  equipment_id?: number;

  assigned_to?: number;

  start_date?: string;
  end_date?: string;
}

export interface AlertPagination {
  page?: number;
  page_size?: number;
}

export interface AlertQueryParams extends AlertFilters {
  page?: number;
  page_size?: number;

  sort_by?: "created_at" | "severity" | "updated_at";
  sort_order?: "asc" | "desc";
}

// ======================================================
// API RESPONSES
// ======================================================

export interface AlertListResponse {
  items: AlertData[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AlertApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface AlertActionResponse {
  success: boolean;
  message: string;
  alert?: AlertData;
}

export interface AlertSyncResponse {
  success: boolean;
  message: string;
  created: number;
  updated: number;
  total: number;
  alerts?: AlertData[];
}

// ======================================================
// STATISTICS
// ======================================================

export interface AlertSummary {
  total: number;

  active: number;
  acknowledged: number;
  resolved: number;
  dismissed: number;

  info: number;
  low: number;
  medium: number;
  high: number;
  critical: number;

  updated_at?: string;
}

export interface AlertDistribution {
  severity: AlertSeverity;
  count: number;
  percentage: number;
}

export interface AlertTrendPoint {
  date: string;
  total: number;
  info: number;
  low: number;
  medium: number;
  high: number;
  critical: number;
}

// ======================================================
// NOTIFICATIONS
// ======================================================

export interface AlertNotification {
  id: number;
  alert_id: number;

  title: string;
  message: string;

  read: boolean;
  read_at?: string;

  created_at: string;
}

export interface AlertNotificationPayload {
  alert_id: number;
  title: string;
  message: string;
}

// ======================================================
// COMPONENT PROPS
// ======================================================

export interface AlertCardProps {
  alert: AlertData;
  onAcknowledge?: (alert: AlertData) => void;
  onResolve?: (alert: AlertData) => void;
  onClick?: (alert: AlertData) => void;
  compact?: boolean;
}

export interface AlertBadgeProps {
  severity: AlertSeverity;
  showLabel?: boolean;
}

export interface AlertListProps {
  alerts: AlertData[];
  loading?: boolean;
  emptyMessage?: string;

  onAcknowledge?: (alert: AlertData) => void;
  onResolve?: (alert: AlertData) => void;
  onSelect?: (alert: AlertData) => void;
}

// ======================================================
// CONSTANTS
// ======================================================

export const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
  info: "Información",
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
  critical: "Crítico",
};

export const ALERT_STATUS_LABELS: Record<AlertStatus, string> = {
  active: "Activa",
  acknowledged: "Reconocida",
  resolved: "Resuelta",
  dismissed: "Descartada",
};

export const ALERT_CATEGORY_LABELS: Record<AlertCategory, string> = {
  sample: "Muestras",
  equipment: "Equipos",
  temperature: "Temperatura",
  contamination: "Contaminación",
  traceability: "Trazabilidad",
  processing: "Procesamiento",
  system: "Sistema",
  security: "Seguridad",
  other: "Otros",
};

export const ALERT_PRIORITY_LABELS: Record<AlertPriority, string> = {
  low: "Baja",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
};

// ======================================================
// TYPE GUARDS
// ======================================================

export function isAlertSeverity(
  value: unknown
): value is AlertSeverity {
  return (
    value === "info" ||
    value === "low" ||
    value === "medium" ||
    value === "high" ||
    value === "critical"
  );
}

export function isAlertStatus(
  value: unknown
): value is AlertStatus {
  return (
    value === "active" ||
    value === "acknowledged" ||
    value === "resolved" ||
    value === "dismissed"
  );
}

export function isAlertCategory(
  value: unknown
): value is AlertCategory {
  return (
    value === "sample" ||
    value === "equipment" ||
    value === "temperature" ||
    value === "contamination" ||
    value === "traceability" ||
    value === "processing" ||
    value === "system" ||
    value === "security" ||
    value === "other"
  );
}

// ======================================================
// UTILITIES
// ======================================================

export function isActiveAlert(alert: AlertData): boolean {
  return alert.status === "active";
}

export function isCriticalAlert(alert: AlertData): boolean {
  return alert.severity === "critical";
}

export function isResolvedAlert(alert: AlertData): boolean {
  return alert.status === "resolved";
}

export function getAlertSeverityWeight(
  severity: AlertSeverity
): number {
  const weights: Record<AlertSeverity, number> = {
    info: 1,
    low: 2,
    medium: 3,
    high: 4,
    critical: 5,
  };

  return weights[severity];
}