/**
 * LabGuardian AI
 * Equipment Types
 *
 * Definiciones TypeScript para la gestión de equipos,
 * mantenimiento, calibración e inventario de laboratorio.
 */

// ======================================================
// ENUMS / UNION TYPES
// ======================================================

export type EquipmentStatus =
  | "operational"
  | "maintenance"
  | "inactive"
  | "out_of_service";

export type EquipmentType =
  | "analyzer"
  | "centrifuge"
  | "microscope"
  | "refrigerator"
  | "freezer"
  | "incubator"
  | "autoclave"
  | "balance"
  | "spectrophotometer"
  | "other";

export type EquipmentCondition =
  | "excellent"
  | "good"
  | "fair"
  | "poor"
  | "critical";

export type EquipmentPriority =
  | "low"
  | "normal"
  | "high"
  | "urgent";

export type MaintenanceType =
  | "preventive"
  | "corrective"
  | "predictive"
  | "emergency";

export type MaintenanceStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "overdue";

export type CalibrationStatus =
  | "valid"
  | "pending"
  | "expired"
  | "failed";

export type EquipmentEventType =
  | "created"
  | "updated"
  | "status_changed"
  | "maintenance"
  | "calibration"
  | "inspection"
  | "incident"
  | "other";

// ======================================================
// EQUIPMENT
// ======================================================

export interface EquipmentData {
  id: number;
  code: string;
  name: string;

  type: EquipmentType | string;
  brand?: string;
  model?: string;
  serial_number?: string;

  status: EquipmentStatus;
  condition?: EquipmentCondition;

  description?: string;
  location?: string;
  laboratory_id?: number;
  laboratory_name?: string;

  manufacturer?: string;
  supplier?: string;

  purchase_date?: string;
  installation_date?: string;
  warranty_expiration?: string;

  last_maintenance?: string;
  next_maintenance?: string;

  last_calibration?: string;
  next_calibration?: string;
  calibration_interval_days?: number;

  maintenance_interval_days?: number;

  temperature_min?: number;
  temperature_max?: number;
  current_temperature?: number;

  responsible_id?: number;
  responsible_name?: string;

  priority?: EquipmentPriority;
  observations?: string;

  created_at?: string;
  updated_at?: string;
}

export interface EquipmentCreatePayload {
  code: string;
  name: string;

  type: EquipmentType | string;
  brand?: string;
  model?: string;
  serial_number?: string;

  status?: EquipmentStatus;
  condition?: EquipmentCondition;

  description?: string;
  location?: string;
  laboratory_id?: number;

  manufacturer?: string;
  supplier?: string;

  purchase_date?: string;
  installation_date?: string;
  warranty_expiration?: string;

  calibration_interval_days?: number;
  maintenance_interval_days?: number;

  temperature_min?: number;
  temperature_max?: number;

  responsible_id?: number;
  priority?: EquipmentPriority;
  observations?: string;
}

export interface EquipmentUpdatePayload {
  name?: string;
  type?: EquipmentType | string;

  brand?: string;
  model?: string;
  serial_number?: string;

  status?: EquipmentStatus;
  condition?: EquipmentCondition;

  description?: string;
  location?: string;
  laboratory_id?: number;

  manufacturer?: string;
  supplier?: string;

  purchase_date?: string;
  installation_date?: string;
  warranty_expiration?: string;

  calibration_interval_days?: number;
  maintenance_interval_days?: number;

  temperature_min?: number;
  temperature_max?: number;

  responsible_id?: number;
  priority?: EquipmentPriority;
  observations?: string;
}

export interface EquipmentStatusPayload {
  status: EquipmentStatus;
  observations?: string;
  reason?: string;
}

// ======================================================
// EQUIPMENT FILTERS
// ======================================================

export interface EquipmentFilters {
  search?: string;
  status?: EquipmentStatus | EquipmentStatus[];
  type?: EquipmentType | string;
  condition?: EquipmentCondition;
  priority?: EquipmentPriority;
  laboratory_id?: number;
  responsible_id?: number;
  location?: string;

  calibration_status?: CalibrationStatus;
  maintenance_status?: MaintenanceStatus;

  start_date?: string;
  end_date?: string;
}

export interface EquipmentPagination {
  page?: number;
  page_size?: number;
}

export interface EquipmentQueryParams extends EquipmentFilters {
  page?: number;
  page_size?: number;
  sort_by?: "name" | "code" | "created_at" | "status";
  sort_order?: "asc" | "desc";
}

// ======================================================
// MAINTENANCE
// ======================================================

export interface MaintenanceData {
  id: number;
  equipment_id: number;

  title: string;
  description?: string;

  type: MaintenanceType;
  status: MaintenanceStatus;
  priority?: EquipmentPriority;

  scheduled_date: string;
  started_at?: string;
  completed_at?: string;

  technician_id?: number;
  technician_name?: string;

  provider?: string;
  cost?: number;

  findings?: string;
  actions_performed?: string;
  observations?: string;

  next_maintenance_date?: string;

  created_at?: string;
  updated_at?: string;
}

export interface MaintenanceCreatePayload {
  equipment_id: number;

  title: string;
  description?: string;

  type: MaintenanceType;
  priority?: EquipmentPriority;

  scheduled_date: string;

  technician_id?: number;
  provider?: string;

  cost?: number;
  observations?: string;
}

export interface MaintenanceUpdatePayload {
  title?: string;
  description?: string;

  type?: MaintenanceType;
  status?: MaintenanceStatus;
  priority?: EquipmentPriority;

  scheduled_date?: string;
  technician_id?: number;
  provider?: string;

  cost?: number;
  findings?: string;
  actions_performed?: string;
  observations?: string;
  next_maintenance_date?: string;
}

export interface MaintenanceCompletePayload {
  completed_at?: string;
  findings: string;
  actions_performed: string;
  cost?: number;
  next_maintenance_date?: string;
  observations?: string;
}

// ======================================================
// CALIBRATION
// ======================================================

export interface CalibrationData {
  id: number;
  equipment_id: number;

  calibration_date: string;
  next_calibration_date?: string;

  status: CalibrationStatus;

  certificate_number?: string;
  certificate_url?: string;

  performed_by?: string;
  provider?: string;

  reference_value?: number;
  measured_value?: number;
  tolerance?: number;
  deviation?: number;

  result?: string;
  observations?: string;

  created_at?: string;
  updated_at?: string;
}

export interface CalibrationCreatePayload {
  equipment_id: number;

  calibration_date: string;
  next_calibration_date?: string;

  certificate_number?: string;
  certificate_url?: string;

  performed_by?: string;
  provider?: string;

  reference_value?: number;
  measured_value?: number;
  tolerance?: number;

  result?: string;
  observations?: string;
}

export interface CalibrationUpdatePayload {
  calibration_date?: string;
  next_calibration_date?: string;

  status?: CalibrationStatus;

  certificate_number?: string;
  certificate_url?: string;

  performed_by?: string;
  provider?: string;

  reference_value?: number;
  measured_value?: number;
  tolerance?: number;
  deviation?: number;

  result?: string;
  observations?: string;
}

// ======================================================
// EQUIPMENT EVENTS
// ======================================================

export interface EquipmentEvent {
  id: number;
  equipment_id: number;

  type: EquipmentEventType;
  title: string;
  description?: string;

  previous_status?: EquipmentStatus;
  new_status?: EquipmentStatus;

  user_id?: number;
  user_name?: string;

  created_at: string;

  metadata?: Record<string, unknown>;
}

// ======================================================
// STATISTICS
// ======================================================

export interface EquipmentSummary {
  total: number;

  operational: number;
  maintenance: number;
  inactive: number;
  out_of_service: number;

  calibration_valid: number;
  calibration_pending: number;
  calibration_expired: number;

  maintenance_scheduled: number;
  maintenance_overdue: number;

  updated_at?: string;
}

export interface EquipmentDistribution {
  status: EquipmentStatus;
  count: number;
  percentage: number;
}

export interface EquipmentTypeDistribution {
  type: EquipmentType | string;
  count: number;
  percentage: number;
}

// ======================================================
// API RESPONSES
// ======================================================

export interface EquipmentListResponse {
  items: EquipmentData[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface EquipmentApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface EquipmentActionResponse {
  success: boolean;
  message: string;
  equipment?: EquipmentData;
}

export interface MaintenanceListResponse {
  items: MaintenanceData[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CalibrationListResponse {
  items: CalibrationData[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ======================================================
// COMPONENT PROPS
// ======================================================

export interface EquipmentCardProps {
  equipment: EquipmentData;
  onClick?: (equipment: EquipmentData) => void;
  onEdit?: (equipment: EquipmentData) => void;
  onDelete?: (equipment: EquipmentData) => void;
  compact?: boolean;
}

export interface EquipmentTableProps {
  equipment: EquipmentData[];
  loading?: boolean;
  onEdit?: (equipment: EquipmentData) => void;
  onDelete?: (equipment: EquipmentData) => void;
  onSelect?: (equipment: EquipmentData) => void;
}

export interface EquipmentStatusBadgeProps {
  status: EquipmentStatus;
  showLabel?: boolean;
}

export interface EquipmentFormProps {
  initialData?: EquipmentData;
  loading?: boolean;
  onSubmit: (
    payload: EquipmentCreatePayload | EquipmentUpdatePayload
  ) => void | Promise<void>;
  onCancel?: () => void;
}

export interface MaintenanceCardProps {
  maintenance: MaintenanceData;
  onClick?: (maintenance: MaintenanceData) => void;
}

export interface CalibrationCardProps {
  calibration: CalibrationData;
  onClick?: (calibration: CalibrationData) => void;
}

// ======================================================
// LABELS
// ======================================================

export const EQUIPMENT_STATUS_LABELS: Record<
  EquipmentStatus,
  string
> = {
  operational: "Operativo",
  maintenance: "En mantenimiento",
  inactive: "Inactivo",
  out_of_service: "Fuera de servicio",
};

export const EQUIPMENT_TYPE_LABELS: Record<
  EquipmentType,
  string
> = {
  analyzer: "Analizador",
  centrifuge: "Centrífuga",
  microscope: "Microscopio",
  refrigerator: "Refrigerador",
  freezer: "Congelador",
  incubator: "Incubadora",
  autoclave: "Autoclave",
  balance: "Balanza",
  spectrophotometer: "Espectrofotómetro",
  other: "Otro",
};

export const EQUIPMENT_CONDITION_LABELS: Record<
  EquipmentCondition,
  string
> = {
  excellent: "Excelente",
  good: "Bueno",
  fair: "Regular",
  poor: "Deficiente",
  critical: "Crítico",
};

export const MAINTENANCE_TYPE_LABELS: Record<
  MaintenanceType,
  string
> = {
  preventive: "Preventivo",
  corrective: "Correctivo",
  predictive: "Predictivo",
  emergency: "Emergencia",
};

export const MAINTENANCE_STATUS_LABELS: Record<
  MaintenanceStatus,
  string
> = {
  scheduled: "Programado",
  in_progress: "En progreso",
  completed: "Completado",
  cancelled: "Cancelado",
  overdue: "Atrasado",
};

export const CALIBRATION_STATUS_LABELS: Record<
  CalibrationStatus,
  string
> = {
  valid: "Vigente",
  pending: "Pendiente",
  expired: "Vencida",
  failed: "Fallida",
};

// ======================================================
// DEFAULT VALUES
// ======================================================

export const DEFAULT_EQUIPMENT_SUMMARY: EquipmentSummary = {
  total: 0,

  operational: 0,
  maintenance: 0,
  inactive: 0,
  out_of_service: 0,

  calibration_valid: 0,
  calibration_pending: 0,
  calibration_expired: 0,

  maintenance_scheduled: 0,
  maintenance_overdue: 0,
};

// ======================================================
// TYPE GUARDS
// ======================================================

export function isEquipmentStatus(
  value: unknown
): value is EquipmentStatus {
  return (
    value === "operational" ||
    value === "maintenance" ||
    value === "inactive" ||
    value === "out_of_service"
  );
}

export function isMaintenanceStatus(
  value: unknown
): value is MaintenanceStatus {
  return (
    value === "scheduled" ||
    value === "in_progress" ||
    value === "completed" ||
    value === "cancelled" ||
    value === "overdue"
  );
}

export function isCalibrationStatus(
  value: unknown
): value is CalibrationStatus {
  return (
    value === "valid" ||
    value === "pending" ||
    value === "expired" ||
    value === "failed"
  );
}

// ======================================================
// UTILITIES
// ======================================================

export function isEquipmentOperational(
  equipment: EquipmentData
): boolean {
  return equipment.status === "operational";
}

export function isEquipmentInMaintenance(
  equipment: EquipmentData
): boolean {
  return equipment.status === "maintenance";
}

export function isEquipmentOutOfService(
  equipment: EquipmentData
): boolean {
  return equipment.status === "out_of_service";
}

export function isWarrantyValid(
  equipment: EquipmentData,
  referenceDate = new Date()
): boolean {
  if (!equipment.warranty_expiration) {
    return false;
  }

  const expiration = new Date(equipment.warranty_expiration);

  return (
    !Number.isNaN(expiration.getTime()) &&
    expiration.getTime() >= referenceDate.getTime()
  );
}

export function isCalibrationOverdue(
  equipment: EquipmentData,
  referenceDate = new Date()
): boolean {
  if (!equipment.next_calibration) {
    return false;
  }

  const dueDate = new Date(equipment.next_calibration);

  return (
    !Number.isNaN(dueDate.getTime()) &&
    dueDate.getTime() < referenceDate.getTime()
  );
}

export function isMaintenanceOverdue(
  equipment: EquipmentData,
  referenceDate = new Date()
): boolean {
  if (!equipment.next_maintenance) {
    return false;
  }

  const dueDate = new Date(equipment.next_maintenance);

  return (
    !Number.isNaN(dueDate.getTime()) &&
    dueDate.getTime() < referenceDate.getTime()
  );
}