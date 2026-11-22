/**
 * LabGuardian AI
 * Risk Service
 *
 * Centraliza las operaciones relacionadas con el análisis de riesgos,
 * evaluación de muestras y estadísticas de riesgo.
 */

import api from "./api";

// ======================================================
// ENDPOINTS
// ======================================================

const RISK_ENDPOINT = "/api/risks";
const SAMPLE_ENDPOINT = "/api/samples";

// ======================================================
// TYPES
// ======================================================

export type RiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type RiskStatus =
  | "pending"
  | "analyzed"
  | "mitigated"
  | "rejected";

export type RiskCategory =
  | "sample_degradation"
  | "temperature"
  | "contamination"
  | "equipment"
  | "processing"
  | "traceability"
  | "other";

export interface RiskFactor {
  name: string;
  description?: string;
  value?: string | number | boolean | null;
  weight?: number;
  contribution?: number;
}

export interface RiskRecommendation {
  id?: number | string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  completed?: boolean;
}

export interface RiskData {
  id: number;
  sample_id?: number;
  sample_code?: string;
  title?: string;
  description?: string;
  category?: RiskCategory | string;
  level: RiskLevel;
  score: number;
  status?: RiskStatus;
  factors?: RiskFactor[];
  recommendations?: RiskRecommendation[];
  detected_at?: string;
  updated_at?: string;
  analyzed_at?: string;
}

export interface RiskAnalysisPayload {
  sample_id: number;
  force_analysis?: boolean;
  include_recommendations?: boolean;
}

export interface RiskAnalysisResult {
  sample_id: number;
  risk_level: RiskLevel;
  risk_score: number;
  factors: RiskFactor[];
  recommendations: RiskRecommendation[];
  summary?: string;
  analyzed_at?: string;
}

export interface RiskFilters {
  search?: string;
  level?: RiskLevel | RiskLevel[];
  category?: RiskCategory | string;
  status?: RiskStatus;
  sample_id?: number;
  start_date?: string;
  end_date?: string;
  min_score?: number;
  max_score?: number;
}

export interface RiskPagination {
  page?: number;
  page_size?: number;
}

export interface RiskListResponse {
  items: RiskData[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface RiskSummary {
  total: number;
  low: number;
  medium: number;
  high: number;
  critical: number;
  pending: number;
  mitigated: number;
  average_score: number;
  critical_percentage: number;
  updated_at?: string;
}

export interface RiskTrendPoint {
  date: string;
  low: number;
  medium: number;
  high: number;
  critical: number;
  total: number;
}

export interface RiskDistribution {
  level: RiskLevel;
  count: number;
  percentage: number;
}

export interface RiskApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

// ======================================================
// HELPERS
// ======================================================

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapResponse<T>(response: unknown): T {
  if (isRecord(response) && "data" in response) {
    return response.data as T;
  }

  return response as T;
}

function normalizeRiskLevel(value: unknown): RiskLevel {
  const normalized = String(value ?? "").toLowerCase();

  switch (normalized) {
    case "low":
    case "bajo":
      return "low";

    case "medium":
    case "moderate":
    case "medio":
      return "medium";

    case "high":
    case "alto":
      return "high";

    case "critical":
    case "critico":
    case "crítico":
      return "critical";

    default:
      return "low";
  }
}

function normalizeRisk(item: unknown): RiskData {
  if (!isRecord(item)) {
    throw new Error("El registro de riesgo recibido no es válido.");
  }

  return {
    id: Number(item.id ?? item.risk_id ?? 0),
    sample_id:
      item.sample_id !== undefined
        ? Number(item.sample_id)
        : undefined,
    sample_code:
      typeof item.sample_code === "string"
        ? item.sample_code
        : undefined,
    title:
      typeof item.title === "string"
        ? item.title
        : undefined,
    description:
      typeof item.description === "string"
        ? item.description
        : undefined,
    category:
      typeof item.category === "string"
        ? item.category
        : undefined,
    level: normalizeRiskLevel(
      item.level ?? item.risk_level ?? item.severity
    ),
    score: Number(item.score ?? item.risk_score ?? 0),
    status:
      typeof item.status === "string"
        ? (item.status as RiskStatus)
        : undefined,
    factors: Array.isArray(item.factors)
      ? (item.factors as RiskFactor[])
      : [],
    recommendations: Array.isArray(item.recommendations)
      ? (item.recommendations as RiskRecommendation[])
      : [],
    detected_at:
      typeof item.detected_at === "string"
        ? item.detected_at
        : undefined,
    updated_at:
      typeof item.updated_at === "string"
        ? item.updated_at
        : undefined,
    analyzed_at:
      typeof item.analyzed_at === "string"
        ? item.analyzed_at
        : undefined,
  };
}

function normalizeArray<T>(
  response: unknown,
  normalizer: (item: unknown) => T
): T[] {
  const data = unwrapResponse<unknown>(response);

  if (Array.isArray(data)) {
    return data.map(normalizer);
  }

  if (isRecord(data)) {
    const items =
      data.items ??
      data.results ??
      data.risks ??
      data.records;

    if (Array.isArray(items)) {
      return items.map(normalizer);
    }
  }

  return [];
}

function normalizeSummary(response: unknown): RiskSummary {
  const data = unwrapResponse<unknown>(response);

  if (!isRecord(data)) {
    throw new Error("No se pudo interpretar el resumen de riesgos.");
  }

  const low = Number(data.low ?? data.low_risk ?? 0);
  const medium = Number(data.medium ?? data.medium_risk ?? 0);
  const high = Number(data.high ?? data.high_risk ?? 0);
  const critical = Number(data.critical ?? data.critical_risk ?? 0);
  const total = Number(data.total ?? data.total_risks ?? low + medium + high + critical);

  return {
    total,
    low,
    medium,
    high,
    critical,
    pending: Number(data.pending ?? 0),
    mitigated: Number(data.mitigated ?? 0),
    average_score: Number(data.average_score ?? data.average_risk ?? 0),
    critical_percentage:
      Number(data.critical_percentage) ||
      (total > 0 ? (critical / total) * 100 : 0),
    updated_at:
      typeof data.updated_at === "string"
        ? data.updated_at
        : undefined,
  };
}

function normalizePagination(
  response: unknown,
  fallbackPage: number,
  fallbackPageSize: number
): RiskListResponse {
  const data = unwrapResponse<unknown>(response);

  if (Array.isArray(data)) {
    return {
      items: data.map(normalizeRisk),
      total: data.length,
      page: fallbackPage,
      page_size: fallbackPageSize,
      total_pages: Math.ceil(data.length / fallbackPageSize),
    };
  }

  if (!isRecord(data)) {
    return {
      items: [],
      total: 0,
      page: fallbackPage,
      page_size: fallbackPageSize,
      total_pages: 0,
    };
  }

  const items = normalizeArray<RiskData>(data, normalizeRisk);
  const total = Number(data.total ?? data.count ?? items.length);
  const page = Number(data.page ?? fallbackPage);
  const pageSize = Number(
    data.page_size ?? data.limit ?? fallbackPageSize
  );

  return {
    items,
    total,
    page,
    page_size: pageSize,
    total_pages: Number(
      data.total_pages ?? Math.ceil(total / Math.max(pageSize, 1))
    ),
  };
}

function buildQueryParams(
  filters?: RiskFilters,
  pagination?: RiskPagination
): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        params[key] = value;
      }
    });
  }

  if (pagination?.page !== undefined) {
    params.page = pagination.page;
  }

  if (pagination?.page_size !== undefined) {
    params.page_size = pagination.page_size;
  }

  return params;
}

// ======================================================
// RISK SERVICE
// ======================================================

export const riskService = {
  /**
   * Obtiene todos los riesgos registrados.
   */
  async getAll(filters?: RiskFilters): Promise<RiskData[]> {
    const response = await api.get(RISK_ENDPOINT, {
      params: buildQueryParams(filters),
    });

    return normalizeArray(response.data, normalizeRisk);
  },

  /**
   * Obtiene riesgos con paginación.
   */
  async getPaginated(
    pagination: RiskPagination = {},
    filters?: RiskFilters
  ): Promise<RiskListResponse> {
    const page = pagination.page ?? 1;
    const pageSize = pagination.page_size ?? 10;

    const response = await api.get(RISK_ENDPOINT, {
      params: buildQueryParams(filters, {
        page,
        page_size: pageSize,
      }),
    });

    return normalizePagination(response.data, page, pageSize);
  },

  /**
   * Obtiene un riesgo por su identificador.
   */
  async getById(id: number): Promise<RiskData> {
    const response = await api.get(`${RISK_ENDPOINT}/${id}`);

    return normalizeRisk(unwrapResponse(response.data));
  },

  /**
   * Obtiene los riesgos asociados a una muestra.
   */
  async getBySample(sampleId: number): Promise<RiskData[]> {
    const response = await api.get(
      `${SAMPLE_ENDPOINT}/${sampleId}/risks`
    );

    return normalizeArray(response.data, normalizeRisk);
  },

  /**
   * Ejecuta un análisis de riesgo para una muestra.
   */
  async analyze(
    payload: RiskAnalysisPayload
  ): Promise<RiskAnalysisResult> {
    const response = await api.post(
      `${RISK_ENDPOINT}/analyze`,
      payload
    );

    return unwrapResponse<RiskAnalysisResult>(response.data);
  },

  /**
   * Ejecuta el análisis de riesgo de una muestra.
   */
  async analyzeSample(
    sampleId: number,
    options: Omit<RiskAnalysisPayload, "sample_id"> = {}
  ): Promise<RiskAnalysisResult> {
    return this.analyze({
      sample_id: sampleId,
      ...options,
    });
  },

  /**
   * Obtiene el resumen general de riesgos.
   */
  async getSummary(): Promise<RiskSummary> {
    const response = await api.get(`${RISK_ENDPOINT}/summary`);

    return normalizeSummary(response.data);
  },

  /**
   * Obtiene la distribución de riesgos por nivel.
   */
  async getDistribution(): Promise<RiskDistribution[]> {
    const response = await api.get(
      `${RISK_ENDPOINT}/distribution`
    );

    const data = unwrapResponse<unknown>(response.data);

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item) => {
      if (!isRecord(item)) {
        throw new Error("Distribución de riesgos no válida.");
      }

      return {
        level: normalizeRiskLevel(item.level ?? item.risk_level),
        count: Number(item.count ?? 0),
        percentage: Number(item.percentage ?? 0),
      };
    });
  },

  /**
   * Obtiene el historial de tendencias de riesgo.
   */
  async getTrends(
    startDate?: string,
    endDate?: string
  ): Promise<RiskTrendPoint[]> {
    const response = await api.get(`${RISK_ENDPOINT}/trends`, {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });

    const data = unwrapResponse<unknown>(response.data);

    return Array.isArray(data)
      ? (data as RiskTrendPoint[])
      : [];
  },

  /**
   * Obtiene los riesgos críticos.
   */
  async getCritical(): Promise<RiskData[]> {
    return this.getAll({ level: "critical" });
  },

  /**
   * Obtiene los riesgos altos.
   */
  async getHigh(): Promise<RiskData[]> {
    return this.getAll({ level: "high" });
  },

  /**
   * Obtiene los riesgos pendientes.
   */
  async getPending(): Promise<RiskData[]> {
    return this.getAll({ status: "pending" });
  },

  /**
   * Actualiza el estado de un riesgo.
   */
  async updateStatus(
    id: number,
    status: RiskStatus
  ): Promise<RiskData> {
    const response = await api.patch(
      `${RISK_ENDPOINT}/${id}/status`,
      { status }
    );

    return normalizeRisk(unwrapResponse(response.data));
  },

  /**
   * Marca un riesgo como mitigado.
   */
  async mitigate(id: number): Promise<RiskData> {
    return this.updateStatus(id, "mitigated");
  },

  /**
   * Elimina un registro de riesgo.
   */
  async delete(id: number): Promise<void> {
    await api.delete(`${RISK_ENDPOINT}/${id}`);
  },

  /**
   * Filtra riesgos localmente.
   */
  filter(
    risks: RiskData[],
    filters: RiskFilters
  ): RiskData[] {
    return risks.filter((risk) => {
      if (
        filters.search &&
        ![
          risk.title,
          risk.description,
          risk.sample_code,
          String(risk.sample_id ?? ""),
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(filters.search!.toLowerCase())
          )
      ) {
        return false;
      }

      if (filters.level) {
        const levels = Array.isArray(filters.level)
          ? filters.level
          : [filters.level];

        if (!levels.includes(risk.level)) {
          return false;
        }
      }

      if (
        filters.category &&
        risk.category !== filters.category
      ) {
        return false;
      }

      if (filters.status && risk.status !== filters.status) {
        return false;
      }

      if (
        filters.sample_id !== undefined &&
        risk.sample_id !== filters.sample_id
      ) {
        return false;
      }

      if (
        filters.min_score !== undefined &&
        risk.score < filters.min_score
      ) {
        return false;
      }

      if (
        filters.max_score !== undefined &&
        risk.score > filters.max_score
      ) {
        return false;
      }

      if (filters.start_date && risk.detected_at) {
        if (
          new Date(risk.detected_at) <
          new Date(filters.start_date)
        ) {
          return false;
        }
      }

      if (filters.end_date && risk.detected_at) {
        if (
          new Date(risk.detected_at) >
          new Date(filters.end_date)
        ) {
          return false;
        }
      }

      return true;
    });
  },

  /**
   * Calcula estadísticas de riesgos localmente.
   */
  calculateSummary(risks: RiskData[]): RiskSummary {
    const summary: RiskSummary = {
      total: risks.length,
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
      pending: 0,
      mitigated: 0,
      average_score: 0,
      critical_percentage: 0,
    };

    if (risks.length === 0) {
      return summary;
    }

    let totalScore = 0;

    risks.forEach((risk) => {
      summary[risk.level] += 1;
      totalScore += risk.score;

      if (risk.status === "pending") {
        summary.pending += 1;
      }

      if (risk.status === "mitigated") {
        summary.mitigated += 1;
      }
    });

    summary.average_score = Number(
      (totalScore / risks.length).toFixed(2)
    );

    summary.critical_percentage = Number(
      ((summary.critical / risks.length) * 100).toFixed(2)
    );

    return summary;
  },

  /**
   * Ordena riesgos por puntuación.
   */
  sortByScore(
    risks: RiskData[],
    descending = true
  ): RiskData[] {
    return [...risks].sort((a, b) =>
      descending ? b.score - a.score : a.score - b.score
    );
  },

  /**
   * Ordena riesgos por fecha de detección.
   */
  sortByDate(
    risks: RiskData[],
    descending = true
  ): RiskData[] {
    return [...risks].sort((a, b) => {
      const dateA = new Date(a.detected_at ?? 0).getTime();
      const dateB = new Date(b.detected_at ?? 0).getTime();

      return descending ? dateB - dateA : dateA - dateB;
    });
  },

  /**
   * Determina si un riesgo requiere atención inmediata.
   */
  requiresImmediateAttention(risk: RiskData): boolean {
    return (
      risk.level === "critical" ||
      (risk.level === "high" && risk.score >= 80)
    );
  },

  /**
   * Devuelve el nombre legible del nivel de riesgo.
   */
  getLevelLabel(level: RiskLevel): string {
    const labels: Record<RiskLevel, string> = {
      low: "Bajo",
      medium: "Medio",
      high: "Alto",
      critical: "Crítico",
    };

    return labels[level];
  },

  /**
   * Devuelve un porcentaje limitado entre 0 y 100.
   */
  normalizeScore(score: number): number {
    if (!Number.isFinite(score)) {
      return 0;
    }

    return Math.min(100, Math.max(0, score));
  },
};

export default riskService;