
// src/services/events.service.ts

import api from "./api";

// ============================================================
// CONFIGURATION
// ============================================================

const EVENTS_ENDPOINT = "/api/events";
const TRACEABILITY_ENDPOINT = "/api/traceability";

// ============================================================
// TYPES
// ============================================================

export type EventType =
  | "sample_received"
  | "sample_identified"
  | "temperature_recorded"
  | "sample_processed"
  | "sample_transferred"
  | "sample_stored"
  | "sample_analyzed"
  | "result_generated"
  | "sample_completed"
  | "sample_rejected"
  | "sample_updated"
  | "sample_deleted"
  | "equipment_assigned"
  | "maintenance_performed"
  | "calibration_performed"
  | "risk_detected"
  | "anomaly_detected"
  | "alert_generated"
  | "other";

export type EventSeverity =
  | "info"
  | "low"
  | "medium"
  | "high"
  | "critical";

export type EventStatus =
  | "completed"
  | "pending"
  | "failed"
  | "cancelled"
  | "in_progress";

export interface EventData {
  id: number;
  sample_id: number;

  event_type: EventType | string;
  title: string;
  description?: string | null;

  status?: EventStatus | string | null;
  severity?: EventSeverity | string | null;

  temperature?: number | null;
  duration_minutes?: number | null;

  location?: string | null;
  laboratory_area?: string | null;

  performed_by?: string | null;

  equipment_id?: number | null;
  equipment_name?: string | null;

  event_metadata?: Record<string, unknown> | null;

  occurred_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface EventCreatePayload {
  sample_id: number;
  event_type: EventType | string;
  title: string;
  description?: string | null;

  status?: EventStatus | string;
  severity?: EventSeverity | string;

  temperature?: number | null;
  duration_minutes?: number | null;

  location?: string | null;
  laboratory_area?: string | null;

  performed_by?: string | null;

  equipment_id?: number | null;

  event_metadata?: Record<string, unknown> | null;

  occurred_at?: string;
}

export type EventUpdatePayload = Partial<
  Omit<EventCreatePayload, "sample_id">
>;

export interface EventFilters {
  search?: string;
  sample_id?: number;
  event_type?: string;
  status?: string;
  severity?: string;
  laboratory_area?: string;
  equipment_id?: number;
  performed_by?: string;
  start_date?: string;
  end_date?: string;
}

export interface EventQueryParams {
  page?: number;
  page_size?: number;
  limit?: number;
  skip?: number;

  sample_id?: number;
  event_type?: string;
  status?: string;
  severity?: string;

  laboratory_area?: string;
  equipment_id?: number;
  performed_by?: string;

  start_date?: string;
  end_date?: string;
}

export interface EventListResponse {
  items: EventData[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface EventSummary {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export interface EventActionResponse {
  message?: string;
  success?: boolean;
  event?: EventData;
}

// ============================================================
// DEFAULT VALUES
// ============================================================

const EMPTY_SUMMARY: EventSummary = {
  total: 0,
  completed: 0,
  pending: 0,
  failed: 0,
  critical: 0,
  high: 0,
  medium: 0,
  low: 0,
  info: 0,
};

// ============================================================
// RESPONSE HELPERS
// ============================================================

const extractEvents = (response: unknown): EventData[] => {
  if (Array.isArray(response)) {
    return response as EventData[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const data = response as Record<string, unknown>;

  const possibleArrays = [
    data.items,
    data.results,
    data.events,
    data.traceability,
    data.data,
  ];

  for (const value of possibleArrays) {
    if (Array.isArray(value)) {
      return value as EventData[];
    }
  }

  return [];
};

const normalizeDate = (date: string): Date | null => {
  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

// ============================================================
// EVENT SERVICE
// ============================================================

export const eventsService = {
  /**
   * Obtener todos los eventos.
   */
  async getAll(
    params: EventQueryParams = {}
  ): Promise<EventData[]> {
    const response = await api.get(EVENTS_ENDPOINT, { params });

    return extractEvents(response.data);
  },

  /**
   * Obtener eventos paginados.
   */
  async getPaginated(
    params: EventQueryParams = {}
  ): Promise<EventListResponse> {
    const response = await api.get(EVENTS_ENDPOINT, { params });

    const data = response.data as Record<string, unknown>;
    const items = extractEvents(data);

    const total = Number(data.total ?? items.length);
    const page = Number(data.page ?? params.page ?? 1);
    const pageSize = Number(
      data.page_size ?? params.page_size ?? items.length
    );

    return {
      items,
      total,
      page,
      page_size: pageSize,
      total_pages: Number(
        data.total_pages ??
          Math.ceil(total / Math.max(1, pageSize))
      ),
    };
  },

  /**
   * Obtener un evento por ID.
   */
  async getById(id: number | string): Promise<EventData> {
    const response = await api.get(`${EVENTS_ENDPOINT}/${id}`);

    return response.data;
  },

  /**
   * Obtener eventos de una muestra.
   */
  async getBySample(
    sampleId: number | string,
    params: Omit<EventQueryParams, "sample_id"> = {}
  ): Promise<EventData[]> {
    const response = await api.get(
      `${TRACEABILITY_ENDPOINT}/${sampleId}`,
      { params }
    );

    return extractEvents(response.data);
  },

  /**
   * Registrar un evento.
   */
  async create(payload: EventCreatePayload): Promise<EventData> {
    const response = await api.post(EVENTS_ENDPOINT, payload);

    return response.data;
  },

  /**
   * Actualizar un evento.
   */
  async update(
    id: number | string,
    payload: EventUpdatePayload
  ): Promise<EventData> {
    const response = await api.put(
      `${EVENTS_ENDPOINT}/${id}`,
      payload
    );

    return response.data;
  },

  /**
   * Actualizar parcialmente un evento.
   */
  async patch(
    id: number | string,
    payload: EventUpdatePayload
  ): Promise<EventData> {
    const response = await api.patch(
      `${EVENTS_ENDPOINT}/${id}`,
      payload
    );

    return response.data;
  },

  /**
   * Eliminar un evento.
   */
  async delete(id: number | string): Promise<void> {
    await api.delete(`${EVENTS_ENDPOINT}/${id}`);
  },

  /**
   * Obtener eventos recientes.
   */
  async getRecent(limit = 10): Promise<EventData[]> {
    const response = await api.get(EVENTS_ENDPOINT, {
      params: { limit },
    });

    return extractEvents(response.data);
  },

  /**
   * Obtener eventos por tipo.
   */
  async getByType(eventType: string): Promise<EventData[]> {
    const response = await api.get(EVENTS_ENDPOINT, {
      params: { event_type: eventType },
    });

    return extractEvents(response.data);
  },

  /**
   * Obtener eventos relacionados con anomalías.
   */
  async getAnomalies(): Promise<EventData[]> {
    const response = await api.get(EVENTS_ENDPOINT, {
      params: { event_type: "anomaly_detected" },
    });

    return extractEvents(response.data);
  },

  /**
   * Obtener eventos relacionados con riesgos.
   */
  async getRiskEvents(): Promise<EventData[]> {
    const response = await api.get(EVENTS_ENDPOINT, {
      params: { event_type: "risk_detected" },
    });

    return extractEvents(response.data);
  },

  /**
   * Filtrar eventos localmente.
   */
  filter(
    events: EventData[],
    filters: EventFilters
  ): EventData[] {
    const search = filters.search?.trim().toLowerCase();

    return events.filter((event) => {
      if (search) {
        const searchableText = [
          event.title,
          event.description,
          event.event_type,
          event.location,
          event.laboratory_area,
          event.performed_by,
          event.equipment_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(search)) {
          return false;
        }
      }

      if (
        filters.sample_id !== undefined &&
        event.sample_id !== filters.sample_id
      ) {
        return false;
      }

      if (
        filters.event_type &&
        event.event_type.toLowerCase() !==
          filters.event_type.toLowerCase()
      ) {
        return false;
      }

      if (
        filters.status &&
        event.status?.toLowerCase() !== filters.status.toLowerCase()
      ) {
        return false;
      }

      if (
        filters.severity &&
        event.severity?.toLowerCase() !== filters.severity.toLowerCase()
      ) {
        return false;
      }

      if (
        filters.laboratory_area &&
        event.laboratory_area !== filters.laboratory_area
      ) {
        return false;
      }

      if (
        filters.equipment_id !== undefined &&
        event.equipment_id !== filters.equipment_id
      ) {
        return false;
      }

      if (
        filters.performed_by &&
        event.performed_by?.toLowerCase() !==
          filters.performed_by.toLowerCase()
      ) {
        return false;
      }

      const occurredAt = normalizeDate(event.occurred_at);

      if (filters.start_date) {
        const startDate = normalizeDate(filters.start_date);

        if (startDate && occurredAt && occurredAt < startDate) {
          return false;
        }
      }

      if (filters.end_date) {
        const endDate = normalizeDate(filters.end_date);

        if (endDate && occurredAt) {
          endDate.setHours(23, 59, 59, 999);

          if (occurredAt > endDate) {
            return false;
          }
        }
      }

      return true;
    });
  },

  /**
   * Calcular estadísticas de eventos.
   */
  calculateSummary(events: EventData[]): EventSummary {
    return events.reduce<EventSummary>(
      (summary, event) => {
        summary.total += 1;

        const status = event.status?.toLowerCase();
        const severity = event.severity?.toLowerCase();

        if (status === "completed") summary.completed += 1;
        if (status === "pending") summary.pending += 1;
        if (status === "failed") summary.failed += 1;

        if (severity === "critical") summary.critical += 1;
        if (severity === "high") summary.high += 1;
        if (severity === "medium") summary.medium += 1;
        if (severity === "low") summary.low += 1;
        if (severity === "info") summary.info += 1;

        return summary;
      },
      { ...EMPTY_SUMMARY }
    );
  },

  /**
   * Ordenar eventos cronológicamente.
   */
  sortByDate(
    events: EventData[],
    order: "asc" | "desc" = "desc"
  ): EventData[] {
    return [...events].sort((a, b) => {
      const dateA = normalizeDate(a.occurred_at)?.getTime() ?? 0;
      const dateB = normalizeDate(b.occurred_at)?.getTime() ?? 0;

      return order === "asc" ? dateA - dateB : dateB - dateA;
    });
  },

  /**
   * Obtener el historial completo de una muestra.
   */
  async getSampleHistory(
    sampleId: number | string
  ): Promise<EventData[]> {
    const events = await this.getBySample(sampleId);

    return this.sortByDate(events, "asc");
  },
};

export { EMPTY_SUMMARY };

export default eventsService;
