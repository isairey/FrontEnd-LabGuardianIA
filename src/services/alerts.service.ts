
// src/services/alerts.service.ts

import axios, { AxiosError } from "axios";

/**
 * LabGuardian AI
 * Alerts Service
 *
 * Centraliza las operaciones HTTP relacionadas con las alertas
 * del sistema de monitoreo del laboratorio.
 */

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1"
).replace(/\/$/, "");

const ALERTS_ENDPOINT = `${API_BASE_URL}/api/alerts`;

// ============================================================
// TYPES
// ============================================================

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

export interface AlertData {
  id: number;
  title: string;
  description?: string | null;
  message?: string | null;

  severity: AlertSeverity | string;
  status: AlertStatus | string;

  alert_type?: string | null;
  category?: string | null;

  sample_id?: number | null;
  sample_code?: string | null;

  equipment_id?: number | null;
  equipment_name?: string | null;

  laboratory_area?: string | null;

  risk_score?: number | null;

  created_at: string;
  updated_at?: string | null;
  acknowledged_at?: string | null;
  resolved_at?: string | null;

  acknowledged_by?: string | null;
  resolved_by?: string | null;

  metadata?: Record<string, unknown> | null;
}

export interface AlertFilters {
  search?: string;
  severity?: string;
  status?: string;
  alert_type?: string;
  laboratory_area?: string;
  sample_id?: number;
  equipment_id?: number;
  start_date?: string;
  end_date?: string;
}

export interface AlertPagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface AlertListResponse {
  items: AlertData[];
  total: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
}

export interface AlertSummary {
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export interface AlertSyncResponse {
  message?: string;
  synchronized?: number;
  created?: number;
  updated?: number;
  total?: number;
  alerts?: AlertData[];
}

export interface AlertActionResponse {
  message?: string;
  alert?: AlertData;
  success?: boolean;
}

export interface AlertQueryParams {
  page?: number;
  page_size?: number;
  limit?: number;
  skip?: number;
  search?: string;
  severity?: string;
  status?: string;
  alert_type?: string;
  laboratory_area?: string;
  sample_id?: number;
  equipment_id?: number;
  start_date?: string;
  end_date?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

// ============================================================
// ERROR HANDLING
// ============================================================

const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      detail?: string | { msg?: string }[];
      message?: string;
    }>;

    const responseData = axiosError.response?.data;

    let message = "Ocurrió un error al comunicarse con el servidor.";

    if (typeof responseData?.detail === "string") {
      message = responseData.detail;
    } else if (Array.isArray(responseData?.detail)) {
      message = responseData.detail
        .map((item) => item.msg)
        .filter(Boolean)
        .join(", ");
    } else if (responseData?.message) {
      message = responseData.message;
    } else if (axiosError.message) {
      message = axiosError.message;
    }

    return {
      message,
      status: axiosError.response?.status,
      details: responseData,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: "Error inesperado al procesar la solicitud.",
  };
};

// ============================================================
// RESPONSE NORMALIZATION
// ============================================================

const extractAlerts = (response: unknown): AlertData[] => {
  if (Array.isArray(response)) {
    return response as AlertData[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const data = response as Record<string, unknown>;

  const possibleArrays = [
    data.items,
    data.results,
    data.alerts,
    data.data,
  ];

  for (const value of possibleArrays) {
    if (Array.isArray(value)) {
      return value as AlertData[];
    }
  }

  return [];
};

const extractSummary = (response: unknown): AlertSummary => {
  const defaults: AlertSummary = {
    total: 0,
    active: 0,
    acknowledged: 0,
    resolved: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  if (!response || typeof response !== "object") {
    return defaults;
  }

  const data = response as Record<string, unknown>;

  const summary =
    data.summary && typeof data.summary === "object"
      ? (data.summary as Record<string, unknown>)
      : data;

  return {
    total: Number(summary.total ?? summary.total_alerts ?? 0),
    active: Number(summary.active ?? summary.active_alerts ?? 0),
    acknowledged: Number(
      summary.acknowledged ?? summary.acknowledged_alerts ?? 0
    ),
    resolved: Number(summary.resolved ?? summary.resolved_alerts ?? 0),
    critical: Number(summary.critical ?? summary.critical_alerts ?? 0),
    high: Number(summary.high ?? summary.high_alerts ?? 0),
    medium: Number(summary.medium ?? summary.medium_alerts ?? 0),
    low: Number(summary.low ?? summary.low_alerts ?? 0),
    info: Number(summary.info ?? summary.info_alerts ?? 0),
  };
};

// ============================================================
// ALERTS SERVICE
// ============================================================

export const alertsService = {
  /**
   * Obtener todas las alertas.
   */
  async getAll(
    params: AlertQueryParams = {}
  ): Promise<AlertData[]> {
    try {
      const response = await axios.get(ALERTS_ENDPOINT, { params });
      return extractAlerts(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Obtener alertas con información de paginación.
   */
  async getPaginated(
    params: AlertQueryParams = {}
  ): Promise<AlertListResponse> {
    try {
      const response = await axios.get(ALERTS_ENDPOINT, { params });
      const data = response.data as Record<string, unknown>;

      const items = extractAlerts(data);

      return {
        items,
        total: Number(data.total ?? items.length),
        page: Number(data.page ?? params.page ?? 1),
        page_size: Number(
          data.page_size ?? params.page_size ?? items.length
        ),
        total_pages: Number(
          data.total_pages ??
            Math.ceil(
              Number(data.total ?? items.length) /
                Math.max(1, Number(data.page_size ?? params.page_size ?? items.length))
            )
        ),
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Obtener una alerta por ID.
   */
  async getById(id: number | string): Promise<AlertData> {
    try {
      const response = await axios.get(`${ALERTS_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Obtener únicamente las alertas activas.
   */
  async getActive(): Promise<AlertData[]> {
    try {
      const response = await axios.get(`${ALERTS_ENDPOINT}/active`);
      return extractAlerts(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Obtener el resumen de alertas.
   */
  async getSummary(): Promise<AlertSummary> {
    try {
      const response = await axios.get(`${ALERTS_ENDPOINT}/summary`);
      return extractSummary(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Sincronizar alertas con los resultados del sistema de análisis.
   */
  async synchronize(): Promise<AlertSyncResponse> {
    try {
      const response = await axios.post(`${ALERTS_ENDPOINT}/sync`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Marcar una alerta como reconocida.
   */
  async acknowledge(
    id: number | string
  ): Promise<AlertActionResponse> {
    try {
      const response = await axios.patch(
        `${ALERTS_ENDPOINT}/${id}/acknowledge`
      );

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Resolver una alerta.
   */
  async resolve(
    id: number | string,
    notes?: string
  ): Promise<AlertActionResponse> {
    try {
      const response = await axios.patch(
        `${ALERTS_ENDPOINT}/${id}/resolve`,
        notes ? { notes } : {}
      );

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Eliminar una alerta.
   */
  async delete(id: number | string): Promise<void> {
    try {
      await axios.delete(`${ALERTS_ENDPOINT}/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Filtrar alertas en el cliente.
   * Útil cuando el backend no implementa todos los filtros.
   */
  filter(
    alerts: AlertData[],
    filters: AlertFilters
  ): AlertData[] {
    const search = filters.search?.trim().toLowerCase();

    return alerts.filter((alert) => {
      if (search) {
        const searchableText = [
          alert.title,
          alert.description,
          alert.message,
          alert.sample_code,
          alert.equipment_name,
          alert.laboratory_area,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(search)) {
          return false;
        }
      }

      if (
        filters.severity &&
        alert.severity.toLowerCase() !== filters.severity.toLowerCase()
      ) {
        return false;
      }

      if (
        filters.status &&
        alert.status.toLowerCase() !== filters.status.toLowerCase()
      ) {
        return false;
      }

      if (
        filters.alert_type &&
        alert.alert_type !== filters.alert_type
      ) {
        return false;
      }

      if (
        filters.laboratory_area &&
        alert.laboratory_area !== filters.laboratory_area
      ) {
        return false;
      }

      if (
        filters.sample_id !== undefined &&
        alert.sample_id !== filters.sample_id
      ) {
        return false;
      }

      if (
        filters.equipment_id !== undefined &&
        alert.equipment_id !== filters.equipment_id
      ) {
        return false;
      }

      if (filters.start_date) {
        if (new Date(alert.created_at) < new Date(filters.start_date)) {
          return false;
        }
      }

      if (filters.end_date) {
        const endDate = new Date(filters.end_date);
        endDate.setHours(23, 59, 59, 999);

        if (new Date(alert.created_at) > endDate) {
          return false;
        }
      }

      return true;
    });
  },

  /**
   * Obtener un resumen calculado a partir de una lista de alertas.
   */
  calculateSummary(alerts: AlertData[]): AlertSummary {
    return alerts.reduce<AlertSummary>(
      (summary, alert) => {
        summary.total += 1;

        const status = alert.status.toLowerCase();
        const severity = alert.severity.toLowerCase();

        if (status === "active") summary.active += 1;
        if (status === "acknowledged") summary.acknowledged += 1;
        if (status === "resolved") summary.resolved += 1;

        if (severity in summary) {
          summary[severity as keyof Pick<
            AlertSummary,
            "critical" | "high" | "medium" | "low" | "info"
          >] += 1;
        }

        return summary;
      },
      {
        total: 0,
        active: 0,
        acknowledged: 0,
        resolved: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
      }
    );
  },

  /**
   * Convertir errores de Axios a un formato uniforme.
   */
  handleError: handleApiError,
};

export default alertsService;
