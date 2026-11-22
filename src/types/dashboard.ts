/**
 * LabGuardian AI
 * Dashboard Types
 *
 * Tipos e interfaces para el panel principal,
 * indicadores, estadísticas y visualizaciones.
 */

// ======================================================
// ENUMS / UNION TYPES
// ======================================================

export type DashboardPeriod =
  | "today"
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "all";

export type DashboardTrend =
  | "up"
  | "down"
  | "stable";

export type DashboardMetricStatus =
  | "normal"
  | "warning"
  | "critical";

// ======================================================
// SUMMARY
// ======================================================

export interface DashboardSummary {
  total_samples: number;
  pending_samples: number;
  processing_samples: number;
  completed_samples: number;
  rejected_samples: number;

  low_risk_samples: number;
  medium_risk_samples: number;
  high_risk_samples: number;
  critical_risk_samples: number;

  active_alerts: number;
  acknowledged_alerts: number;
  resolved_alerts: number;

  total_equipment: number;
  operational_equipment: number;
  maintenance_equipment: number;
  inactive_equipment: number;

  average_risk: number;
  updated_at?: string;
}

// ======================================================
// STATISTICS
// ======================================================

export interface DashboardStatistic {
  id: string;
  title: string;
  value: number;
  previous_value?: number;
  change_percentage?: number;
  trend?: DashboardTrend;
  status?: DashboardMetricStatus;
  description?: string;
  unit?: string;
}

export interface DashboardStatistics {
  total_samples: DashboardStatistic;
  active_alerts: DashboardStatistic;
  high_risk_samples: DashboardStatistic;
  operational_equipment: DashboardStatistic;
}

// ======================================================
// RISK ANALYSIS
// ======================================================

export interface DashboardRiskData {
  level: "low" | "medium" | "high" | "critical";
  label?: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface DashboardRiskOverview {
  total: number;
  low: number;
  medium: number;
  high: number;
  critical: number;
  average_score: number;
  distribution: DashboardRiskData[];
}

export interface DashboardRiskTrend {
  date: string;
  low: number;
  medium: number;
  high: number;
  critical: number;
  total: number;
}

// ======================================================
// AREA STATISTICS
// ======================================================

export interface DashboardAreaData {
  id?: number | string;
  name: string;
  total_samples: number;
  pending_samples: number;
  processing_samples: number;
  completed_samples: number;
  rejected_samples: number;
  average_risk?: number;
  active_alerts?: number;
}

// ======================================================
// ALERTS
// ======================================================

export interface DashboardRecentAlert {
  id: number;
  title: string;
  message: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  status: "active" | "acknowledged" | "resolved" | "dismissed";
  category?: string;
  sample_id?: number;
  sample_code?: string;
  equipment_id?: number;
  equipment_name?: string;
  created_at: string;
}

// ======================================================
// SAMPLES
// ======================================================

export interface DashboardRecentSample {
  id: number;
  code: string;
  name?: string;
  type: string;
  status:
    | "pending"
    | "received"
    | "processing"
    | "completed"
    | "rejected";
  risk_level?: "low" | "medium" | "high" | "critical";
  risk_score?: number;
  patient_name?: string;
  collection_date?: string;
  created_at?: string;
}

// ======================================================
// EQUIPMENT
// ======================================================

export interface DashboardEquipmentData {
  id: number;
  name: string;
  code?: string;
  type?: string;
  status:
    | "operational"
    | "maintenance"
    | "inactive"
    | "out_of_service";
  next_maintenance?: string;
  last_calibration?: string;
  calibration_due?: boolean;
}

// ======================================================
// ACTIVITY
// ======================================================

export type DashboardActivityType =
  | "sample_created"
  | "sample_updated"
  | "sample_completed"
  | "sample_rejected"
  | "alert_created"
  | "alert_resolved"
  | "equipment_updated"
  | "risk_detected"
  | "other";

export interface DashboardActivity {
  id: number | string;
  type: DashboardActivityType;
  title: string;
  description?: string;
  entity_type?: string;
  entity_id?: number;
  entity_name?: string;
  user_name?: string;
  created_at: string;
}

// ======================================================
// CHARTS
// ======================================================

export interface DashboardChartData {
  label: string;
  value: number;
}

export interface DashboardTimeSeriesData {
  date: string;
  samples?: number;
  alerts?: number;
  risks?: number;
  completed?: number;
  pending?: number;
}

export interface DashboardChartSeries {
  name: string;
  data: number[];
}

export interface DashboardChart {
  title: string;
  labels: string[];
  series: DashboardChartSeries[];
}

// ======================================================
// FILTERS
// ======================================================

export interface DashboardFilters {
  period?: DashboardPeriod;
  start_date?: string;
  end_date?: string;
  laboratory_id?: number;
  area_id?: number;
}

// ======================================================
// QUERY OPTIONS
// ======================================================

export interface DashboardQueryOptions {
  autoFetch?: boolean;
  period?: DashboardPeriod;
  recentAlertsLimit?: number;
  recentSamplesLimit?: number;
  recentActivityLimit?: number;
  filters?: DashboardFilters;
}

// ======================================================
// COMPLETE DASHBOARD
// ======================================================

export interface DashboardData {
  summary: DashboardSummary;
  risks: DashboardRiskData[];
  areas: DashboardAreaData[];
  recent_alerts: DashboardRecentAlert[];
  recent_samples: DashboardRecentSample[];
  equipment?: DashboardEquipmentData[];
  activities?: DashboardActivity[];
  risk_trends?: DashboardRiskTrend[];
  sample_trends?: DashboardTimeSeriesData[];
  updated_at?: string;
}

// ======================================================
// API RESPONSES
// ======================================================

export interface DashboardApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface DashboardSummaryResponse
  extends DashboardApiResponse<DashboardSummary> {}

export interface DashboardRisksResponse
  extends DashboardApiResponse<DashboardRiskData[]> {}

export interface DashboardAreasResponse
  extends DashboardApiResponse<DashboardAreaData[]> {}

export interface DashboardAlertsResponse
  extends DashboardApiResponse<DashboardRecentAlert[]> {}

export interface DashboardSamplesResponse
  extends DashboardApiResponse<DashboardRecentSample[]> {}

// ======================================================
// DASHBOARD STATE
// ======================================================

export interface DashboardErrors {
  summary?: string;
  risks?: string;
  areas?: string;
  alerts?: string;
  samples?: string;
  equipment?: string;
  activities?: string;
}

export interface DashboardLoadingState {
  summary: boolean;
  risks: boolean;
  areas: boolean;
  alerts: boolean;
  samples: boolean;
  equipment: boolean;
  activities: boolean;
}

export interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  refreshing: boolean;
  errors: DashboardErrors;
  lastUpdated?: string;
}

// ======================================================
// COMPONENT PROPS
// ======================================================

export interface DashboardProps {
  period?: DashboardPeriod;
  onPeriodChange?: (period: DashboardPeriod) => void;
  onRefresh?: () => void;
}

export interface DashboardStatCardProps {
  title: string;
  value: number | string;
  description?: string;
  trend?: DashboardTrend;
  changePercentage?: number;
  status?: DashboardMetricStatus;
  icon?: string;
  loading?: boolean;
}

export interface DashboardChartProps {
  title: string;
  data: DashboardChartData[];
  loading?: boolean;
  emptyMessage?: string;
}

export interface DashboardSectionProps {
  title: string;
  description?: string;
  loading?: boolean;
  error?: string;
  children?: React.ReactNode;
}

// ======================================================
// CONSTANTS
// ======================================================

export const DASHBOARD_PERIOD_LABELS: Record<
  DashboardPeriod,
  string
> = {
  today: "Hoy",
  week: "Esta semana",
  month: "Este mes",
  quarter: "Este trimestre",
  year: "Este año",
  all: "Todo el período",
};

export const DASHBOARD_RISK_LABELS: Record<
  DashboardRiskData["level"],
  string
> = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
  critical: "Crítico",
};

// ======================================================
// DEFAULT VALUES
// ======================================================

export const DEFAULT_DASHBOARD_SUMMARY: DashboardSummary = {
  total_samples: 0,
  pending_samples: 0,
  processing_samples: 0,
  completed_samples: 0,
  rejected_samples: 0,

  low_risk_samples: 0,
  medium_risk_samples: 0,
  high_risk_samples: 0,
  critical_risk_samples: 0,

  active_alerts: 0,
  acknowledged_alerts: 0,
  resolved_alerts: 0,

  total_equipment: 0,
  operational_equipment: 0,
  maintenance_equipment: 0,
  inactive_equipment: 0,

  average_risk: 0,
};

export const DEFAULT_DASHBOARD_DATA: DashboardData = {
  summary: DEFAULT_DASHBOARD_SUMMARY,
  risks: [],
  areas: [],
  recent_alerts: [],
  recent_samples: [],
  equipment: [],
  activities: [],
  risk_trends: [],
  sample_trends: [],
};

// ======================================================
// UTILITIES
// ======================================================

export function getDashboardRiskLabel(
  level: DashboardRiskData["level"]
): string {
  return DASHBOARD_RISK_LABELS[level];
}

export function calculateDashboardPercentage(
  value: number,
  total: number
): number {
  if (total <= 0) {
    return 0;
  }

  return Number(((value / total) * 100).toFixed(2));
}

export function getDashboardTrend(
  current: number,
  previous: number
): DashboardTrend {
  if (current > previous) {
    return "up";
  }

  if (current < previous) {
    return "down";
  }

  return "stable";
}