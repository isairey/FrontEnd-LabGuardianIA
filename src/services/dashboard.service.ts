
// src/services/dashboard.service.ts

import api from "./api";

// ============================================================
// CONFIGURATION
// ============================================================

const DASHBOARD_ENDPOINT = "/api/dashboard";

// ============================================================
// TYPES
// ============================================================

export interface DashboardSummary {
  total_samples: number;
  normal_samples: number;
  low_risk_samples: number;
  medium_risk_samples: number;
  high_risk_samples: number;
  critical_risk_samples: number;

  active_alerts: number;
  average_risk: number;

  completed_samples?: number;
  processing_samples?: number;
  pending_samples?: number;
  rejected_samples?: number;

  total_equipment?: number;
  operational_equipment?: number;
  equipment_in_maintenance?: number;

  updated_at?: string;
}

export interface DashboardRiskData {
  level: string;
  label?: string;
  count: number;
  percentage?: number;
}

export interface DashboardAreaData {
  area: string;
  total_samples: number;
  high_risk_samples?: number;
  average_risk?: number;
}

export interface DashboardRecentAlert {
  id: number;
  title: string;
  description?: string | null;
  message?: string | null;
  severity: string;
  status: string;
  alert_type?: string | null;
  sample_id?: number | null;
  sample_code?: string | null;
  laboratory_area?: string | null;
  created_at: string;
}

export interface DashboardRecentSample {
  id: number;
  code: string;
  sample_type: string;
  laboratory_area: string | null;
  priority?: string | null;
  status: string;
  created_at: string;
  risk_score?: number | null;
  risk_level?: string | null;
  anomaly_detected?: boolean;
}

export interface DashboardData {
  summary: DashboardSummary;
  risks: DashboardRiskData[];
  areas: DashboardAreaData[];
  recentAlerts: DashboardRecentAlert[];
  recentSamples: DashboardRecentSample[];
}

export interface DashboardQueryOptions {
  limit?: number;
  days?: number;
}

export interface DashboardApiResponse<T> {
  data?: T;
  items?: T[];
  results?: T[];
  total?: number;
}

// ============================================================
// DEFAULT VALUES
// ============================================================

const EMPTY_SUMMARY: DashboardSummary = {
  total_samples: 0,
  normal_samples: 0,
  low_risk_samples: 0,
  medium_risk_samples: 0,
  high_risk_samples: 0,
  critical_risk_samples: 0,
  active_alerts: 0,
  average_risk: 0,
};

const EMPTY_DASHBOARD: DashboardData = {
  summary: EMPTY_SUMMARY,
  risks: [],
  areas: [],
  recentAlerts: [],
  recentSamples: [],
};

// ============================================================
// RESPONSE HELPERS
// ============================================================

const extractArray = <T>(response: unknown): T[] => {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const data = response as Record<string, unknown>;

  const possibleArrays = [
    data.items,
    data.results,
    data.alerts,
    data.samples,
    data.areas,
    data.risks,
    data.data,
  ];

  for (const value of possibleArrays) {
    if (Array.isArray(value)) {
      return value as T[];
    }
  }

  return [];
};

const extractObject = <T>(
  response: unknown,
  fallback: T
): T => {
  if (!response || typeof response !== "object" || Array.isArray(response)) {
    return fallback;
  }

  const data = response as Record<string, unknown>;

  if (data.data && typeof data.data === "object" && !Array.isArray(data.data)) {
    return data.data as T;
  }

  return response as T;
};

const normalizeSummary = (response: unknown): DashboardSummary => {
  const raw = extractObject<Record<string, unknown>>(
    response,
    EMPTY_SUMMARY as unknown as Record<string, unknown>
  );

  const numberValue = (...values: unknown[]): number => {
    const value = values.find((item) => item !== undefined && item !== null);
    const parsed = Number(value ?? 0);

    return Number.isFinite(parsed) ? parsed : 0;
  };

  return {
    total_samples: numberValue(raw.total_samples, raw.total),
    normal_samples: numberValue(raw.normal_samples, raw.normal),
    low_risk_samples: numberValue(raw.low_risk_samples, raw.low_risk),
    medium_risk_samples: numberValue(raw.medium_risk_samples, raw.medium_risk),
    high_risk_samples: numberValue(raw.high_risk_samples, raw.high_risk),
    critical_risk_samples: numberValue(
      raw.critical_risk_samples,
      raw.critical_risk
    ),

    active_alerts: numberValue(raw.active_alerts, raw.total_active_alerts),
    average_risk: numberValue(raw.average_risk, raw.avg_risk),

    completed_samples: numberValue(raw.completed_samples, raw.completed),
    processing_samples: numberValue(raw.processing_samples, raw.processing),
    pending_samples: numberValue(raw.pending_samples, raw.pending),
    rejected_samples: numberValue(raw.rejected_samples, raw.rejected),

    total_equipment:
      raw.total_equipment !== undefined
        ? numberValue(raw.total_equipment)
        : undefined,

    operational_equipment:
      raw.operational_equipment !== undefined
        ? numberValue(raw.operational_equipment)
        : undefined,

    equipment_in_maintenance:
      raw.equipment_in_maintenance !== undefined
        ? numberValue(raw.equipment_in_maintenance)
        : undefined,

    updated_at:
      typeof raw.updated_at === "string" ? raw.updated_at : undefined,
  };
};

const normalizeRisks = (response: unknown): DashboardRiskData[] => {
  const risks = extractArray<Record<string, unknown>>(response);

  return risks.map((item) => ({
    level: String(item.level ?? item.risk_level ?? item.name ?? "unknown"),
    label:
      typeof item.label === "string"
        ? item.label
        : typeof item.name === "string"
          ? item.name
          : undefined,
    count: Number(item.count ?? item.total ?? 0),
    percentage:
      item.percentage !== undefined
        ? Number(item.percentage)
        : undefined,
  }));
};

const normalizeAreas = (response: unknown): DashboardAreaData[] => {
  const areas = extractArray<Record<string, unknown>>(response);

  return areas.map((item) => ({
    area: String(
      item.area ?? item.laboratory_area ?? item.name ?? "Sin área"
    ),
    total_samples: Number(
      item.total_samples ?? item.count ?? item.total ?? 0
    ),
    high_risk_samples:
      item.high_risk_samples !== undefined
        ? Number(item.high_risk_samples)
        : undefined,
    average_risk:
      item.average_risk !== undefined
        ? Number(item.average_risk)
        : undefined,
  }));
};

// ============================================================
// DASHBOARD SERVICE
// ============================================================

export const dashboardService = {
  /**
   * Obtener estadísticas generales del dashboard.
   */
  async getSummary(): Promise<DashboardSummary> {
    const response = await api.get(
      `${DASHBOARD_ENDPOINT}/summary`
    );

    return normalizeSummary(response.data);
  },

  /**
   * Obtener distribución de riesgos.
   */
  async getRisks(): Promise<DashboardRiskData[]> {
    const response = await api.get(
      `${DASHBOARD_ENDPOINT}/risks`
    );

    return normalizeRisks(response.data);
  },

  /**
   * Obtener estadísticas por área del laboratorio.
   */
  async getAreas(): Promise<DashboardAreaData[]> {
    const response = await api.get(
      `${DASHBOARD_ENDPOINT}/areas`
    );

    return normalizeAreas(response.data);
  },

  /**
   * Obtener alertas recientes.
   */
  async getRecentAlerts(
    limit = 5
  ): Promise<DashboardRecentAlert[]> {
    const response = await api.get(
      `${DASHBOARD_ENDPOINT}/recent-alerts`,
      {
        params: { limit },
      }
    );

    return extractArray<DashboardRecentAlert>(response.data);
  },

  /**
   * Obtener muestras recientes.
   */
  async getRecentSamples(
    limit = 5
  ): Promise<DashboardRecentSample[]> {
    const response = await api.get("/api/samples/", {
      params: { limit },
    });

    return extractArray<DashboardRecentSample>(response.data);
  },

  /**
   * Obtener todos los datos del dashboard.
   *
   * Las consultas se ejecutan en paralelo.
   */
  async getDashboard(
    options: DashboardQueryOptions = {}
  ): Promise<DashboardData> {
    const {
      limit = 5,
    } = options;

    const [
      summary,
      risks,
      areas,
      recentAlerts,
      recentSamples,
    ] = await Promise.all([
      this.getSummary(),
      this.getRisks(),
      this.getAreas(),
      this.getRecentAlerts(limit),
      this.getRecentSamples(limit),
    ]);

    return {
      summary,
      risks,
      areas,
      recentAlerts,
      recentSamples,
    };
  },

  /**
   * Obtener un dashboard sin detener las demás consultas
   * si una sección individual falla.
   */
  async getDashboardSafe(
    options: DashboardQueryOptions = {}
  ): Promise<{
    data: DashboardData;
    errors: Partial<Record<keyof DashboardData, string>>;
  }> {
    const limit = options.limit ?? 5;

    const results = await Promise.allSettled([
      this.getSummary(),
      this.getRisks(),
      this.getAreas(),
      this.getRecentAlerts(limit),
      this.getRecentSamples(limit),
    ]);

    const keys = [
      "summary",
      "risks",
      "areas",
      "recentAlerts",
      "recentSamples",
    ] as const;

    const data: DashboardData = {
      ...EMPTY_DASHBOARD,
    };

    const errors: Partial<Record<keyof DashboardData, string>> = {};

    results.forEach((result, index) => {
      const key = keys[index];

      if (result.status === "fulfilled") {
        Object.assign(data, { [key]: result.value });
      } else {
        const reason = result.reason;

        errors[key] =
          reason instanceof Error
            ? reason.message
            : "No se pudo cargar esta sección.";
      }
    });

    return { data, errors };
  },

  /**
   * Consultar una sección específica del dashboard.
   */
  async refreshSection<K extends keyof DashboardData>(
    section: K,
    limit = 5
  ): Promise<DashboardData[K]> {
    switch (section) {
      case "summary":
        return this.getSummary() as Promise<DashboardData[K]>;

      case "risks":
        return this.getRisks() as Promise<DashboardData[K]>;

      case "areas":
        return this.getAreas() as Promise<DashboardData[K]>;

      case "recentAlerts":
        return this.getRecentAlerts(limit) as Promise<DashboardData[K]>;

      case "recentSamples":
        return this.getRecentSamples(limit) as Promise<DashboardData[K]>;

      default:
        throw new Error("Sección del dashboard no válida.");
    }
  },
};

export { EMPTY_DASHBOARD, EMPTY_SUMMARY };

export default dashboardService;
