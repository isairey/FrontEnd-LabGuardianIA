/**
 * LabGuardian AI
 * Samples Service
 *
 * Servicio centralizado para la gestión de muestras de laboratorio.
 */

import api from "./api";

// ======================================================
// ENDPOINTS
// ======================================================

const SAMPLES_ENDPOINT = "/api/samples";

// ======================================================
// TYPES
// ======================================================

export type SampleStatus =
  | "pending"
  | "received"
  | "processing"
  | "completed"
  | "rejected";

export type SampleType =
  | "blood"
  | "urine"
  | "serum"
  | "plasma"
  | "tissue"
  | "swab"
  | "other";

export type SamplePriority =
  | "low"
  | "normal"
  | "high"
  | "urgent";

export type SampleRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export interface SampleData {
  id: number;
  code: string;
  name?: string;
  type: SampleType | string;
  status: SampleStatus;
  priority?: SamplePriority;
  patient_id?: number;
  patient_name?: string;
  patient_code?: string;
  laboratory_id?: number;
  laboratory_name?: string;
  description?: string;
  observations?: string;
  collection_date?: string;
  received_at?: string;
  processed_at?: string;
  completed_at?: string;
  expiration_date?: string;
  temperature?: number;
  risk_level?: SampleRiskLevel;
  risk_score?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SampleCreatePayload {
  code?: string;
  name?: string;
  type: SampleType | string;
  priority?: SamplePriority;
  patient_id?: number;
  laboratory_id?: number;
  description?: string;
  observations?: string;
  collection_date?: string;
  expiration_date?: string;
  temperature?: number;
}

export interface SampleUpdatePayload {
  name?: string;
  type?: SampleType | string;
  priority?: SamplePriority;
  patient_id?: number;
  laboratory_id?: number;
  description?: string;
  observations?: string;
  collection_date?: string;
  expiration_date?: string;
  temperature?: number;
}

export interface SampleStatusPayload {
  status: SampleStatus;
  observations?: string;
}

export interface SampleFilters {
  search?: string;
  status?: SampleStatus | SampleStatus[];
  type?: SampleType | string;
  priority?: SamplePriority;
  patient_id?: number;
  laboratory_id?: number;
  risk_level?: SampleRiskLevel;
  start_date?: string;
  end_date?: string;
}

export interface SamplePagination {
  page?: number;
  page_size?: number;
}

export interface SampleListResponse {
  items: SampleData[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SampleSummary {
  total: number;
  pending: number;
  received: number;
  processing: number;
  completed: number;
  rejected: number;
  high_risk: number;
  critical_risk: number;
  updated_at?: string;
}

export interface SampleApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface SampleExportOptions {
  format?: "csv" | "xlsx" | "pdf";
  filters?: SampleFilters;
}

// ======================================================
// HELPERS
// ======================================================

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function unwrapResponse<T>(response: unknown): T {
  if (isRecord(response) && "data" in response) {
    return response.data as T;
  }

  return response as T;
}

function normalizeStatus(value: unknown): SampleStatus {
  const status = String(value ?? "").toLowerCase();

  switch (status) {
    case "received":
    case "recibida":
    case "recibido":
      return "received";

    case "processing":
    case "procesando":
    case "en_proceso":
      return "processing";

    case "completed":
    case "completada":
    case "completado":
      return "completed";

    case "rejected":
    case "rechazada":
    case "rechazado":
      return "rejected";

    case "pending":
    case "pendiente":
    default:
      return "pending";
  }
}

function normalizeRiskLevel(value: unknown): SampleRiskLevel | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const level = String(value).toLowerCase();

  switch (level) {
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
      return undefined;
  }
}

function normalizeSample(item: unknown): SampleData {
  if (!isRecord(item)) {
    throw new Error("El registro de muestra recibido no es válido.");
  }

  return {
    id: Number(item.id ?? item.sample_id ?? 0),
    code: String(item.code ?? item.sample_code ?? ""),
    name:
      typeof item.name === "string"
        ? item.name
        : undefined,
    type: String(item.type ?? item.sample_type ?? "other"),
    status: normalizeStatus(item.status),
    priority:
      typeof item.priority === "string"
        ? (item.priority as SamplePriority)
        : undefined,
    patient_id:
      item.patient_id !== undefined && item.patient_id !== null
        ? Number(item.patient_id)
        : undefined,
    patient_name:
      typeof item.patient_name === "string"
        ? item.patient_name
        : undefined,
    patient_code:
      typeof item.patient_code === "string"
        ? item.patient_code
        : undefined,
    laboratory_id:
      item.laboratory_id !== undefined && item.laboratory_id !== null
        ? Number(item.laboratory_id)
        : undefined,
    laboratory_name:
      typeof item.laboratory_name === "string"
        ? item.laboratory_name
        : undefined,
    description:
      typeof item.description === "string"
        ? item.description
        : undefined,
    observations:
      typeof item.observations === "string"
        ? item.observations
        : undefined,
    collection_date:
      typeof item.collection_date === "string"
        ? item.collection_date
        : undefined,
    received_at:
      typeof item.received_at === "string"
        ? item.received_at
        : undefined,
    processed_at:
      typeof item.processed_at === "string"
        ? item.processed_at
        : undefined,
    completed_at:
      typeof item.completed_at === "string"
        ? item.completed_at
        : undefined,
    expiration_date:
      typeof item.expiration_date === "string"
        ? item.expiration_date
        : undefined,
    temperature:
      item.temperature !== undefined && item.temperature !== null
        ? Number(item.temperature)
        : undefined,
    risk_level: normalizeRiskLevel(
      item.risk_level ?? item.riskLevel
    ),
    risk_score:
      item.risk_score !== undefined && item.risk_score !== null
        ? Number(item.risk_score)
        : undefined,
    created_at:
      typeof item.created_at === "string"
        ? item.created_at
        : undefined,
    updated_at:
      typeof item.updated_at === "string"
        ? item.updated_at
        : undefined,
  };
}

function extractArray<T>(
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
      data.samples ??
      data.records;

    if (Array.isArray(items)) {
      return items.map(normalizer);
    }
  }

  return [];
}

function normalizePagination(
  response: unknown,
  fallbackPage: number,
  fallbackPageSize: number
): SampleListResponse {
  const data = unwrapResponse<unknown>(response);

  if (Array.isArray(data)) {
    return {
      items: data.map(normalizeSample),
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

  const items = extractArray(data, normalizeSample);
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
      data.total_pages ??
      Math.ceil(total / Math.max(pageSize, 1))
    ),
  };
}

function buildQueryParams(
  filters?: SampleFilters,
  pagination?: SamplePagination
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
// SAMPLES SERVICE
// ======================================================

export const samplesService = {
  /**
   * Obtiene todas las muestras.
   */
  async getAll(filters?: SampleFilters): Promise<SampleData[]> {
    const response = await api.get(SAMPLES_ENDPOINT, {
      params: buildQueryParams(filters),
    });

    return extractArray(response.data, normalizeSample);
  },

  /**
   * Obtiene muestras paginadas.
   */
  async getPaginated(
    pagination: SamplePagination = {},
    filters?: SampleFilters
  ): Promise<SampleListResponse> {
    const page = pagination.page ?? 1;
    const pageSize = pagination.page_size ?? 10;

    const response = await api.get(SAMPLES_ENDPOINT, {
      params: buildQueryParams(filters, {
        page,
        page_size: pageSize,
      }),
    });

    return normalizePagination(response.data, page, pageSize);
  },

  /**
   * Obtiene una muestra por ID.
   */
  async getById(id: number): Promise<SampleData> {
    const response = await api.get(`${SAMPLES_ENDPOINT}/${id}`);

    return normalizeSample(unwrapResponse(response.data));
  },

  /**
   * Busca una muestra por código.
   */
  async getByCode(code: string): Promise<SampleData | null> {
    const response = await api.get(SAMPLES_ENDPOINT, {
      params: { search: code },
    });

    const samples = extractArray(response.data, normalizeSample);

    return (
      samples.find((sample) => sample.code === code) ?? null
    );
  },

  /**
   * Crea una nueva muestra.
   */
  async create(payload: SampleCreatePayload): Promise<SampleData> {
    const response = await api.post(SAMPLES_ENDPOINT, payload);

    return normalizeSample(unwrapResponse(response.data));
  },

  /**
   * Actualiza una muestra completa.
   */
  async update(
    id: number,
    payload: SampleUpdatePayload
  ): Promise<SampleData> {
    const response = await api.put(
      `${SAMPLES_ENDPOINT}/${id}`,
      payload
    );

    return normalizeSample(unwrapResponse(response.data));
  },

  /**
   * Actualiza parcialmente una muestra.
   */
  async patch(
    id: number,
    payload: Partial<SampleUpdatePayload>
  ): Promise<SampleData> {
    const response = await api.patch(
      `${SAMPLES_ENDPOINT}/${id}`,
      payload
    );

    return normalizeSample(unwrapResponse(response.data));
  },

  /**
   * Actualiza el estado de una muestra.
   */
  async updateStatus(
    id: number,
    payload: SampleStatusPayload
  ): Promise<SampleData> {
    const response = await api.patch(
      `${SAMPLES_ENDPOINT}/${id}/status`,
      payload
    );

    return normalizeSample(unwrapResponse(response.data));
  },

  /**
   * Elimina una muestra.
   */
  async delete(id: number): Promise<void> {
    await api.delete(`${SAMPLES_ENDPOINT}/${id}`);
  },

  /**
   * Obtiene muestras por estado.
   */
  async getByStatus(status: SampleStatus): Promise<SampleData[]> {
    return this.getAll({ status });
  },

  /**
   * Obtiene muestras pendientes.
   */
  async getPending(): Promise<SampleData[]> {
    return this.getByStatus("pending");
  },

  /**
   * Obtiene muestras en procesamiento.
   */
  async getProcessing(): Promise<SampleData[]> {
    return this.getByStatus("processing");
  },

  /**
   * Obtiene muestras completadas.
   */
  async getCompleted(): Promise<SampleData[]> {
    return this.getByStatus("completed");
  },

  /**
   * Obtiene muestras rechazadas.
   */
  async getRejected(): Promise<SampleData[]> {
    return this.getByStatus("rejected");
  },

  /**
   * Obtiene el resumen de muestras.
   */
  async getSummary(): Promise<SampleSummary> {
    const response = await api.get(
      `${SAMPLES_ENDPOINT}/summary`
    );

    const data = unwrapResponse<unknown>(response.data);

    if (!isRecord(data)) {
      throw new Error("No se pudo interpretar el resumen de muestras.");
    }

    return {
      total: Number(data.total ?? data.total_samples ?? 0),
      pending: Number(data.pending ?? data.pending_samples ?? 0),
      received: Number(data.received ?? data.received_samples ?? 0),
      processing: Number(
        data.processing ?? data.processing_samples ?? 0
      ),
      completed: Number(
        data.completed ?? data.completed_samples ?? 0
      ),
      rejected: Number(data.rejected ?? data.rejected_samples ?? 0),
      high_risk: Number(data.high_risk ?? 0),
      critical_risk: Number(data.critical_risk ?? 0),
      updated_at:
        typeof data.updated_at === "string"
          ? data.updated_at
          : undefined,
    };
  },

  /**
   * Filtra muestras localmente.
   */
  filter(
    samples: SampleData[],
    filters: SampleFilters
  ): SampleData[] {
    return samples.filter((sample) => {
      if (filters.search) {
        const search = filters.search.toLowerCase();

        const matches = [
          sample.code,
          sample.name,
          sample.patient_name,
          sample.patient_code,
          sample.description,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(search)
        );

        if (!matches) {
          return false;
        }
      }

      if (filters.status) {
        const statuses = Array.isArray(filters.status)
          ? filters.status
          : [filters.status];

        if (!statuses.includes(sample.status)) {
          return false;
        }
      }

      if (filters.type && sample.type !== filters.type) {
        return false;
      }

      if (
        filters.priority &&
        sample.priority !== filters.priority
      ) {
        return false;
      }

      if (
        filters.patient_id !== undefined &&
        sample.patient_id !== filters.patient_id
      ) {
        return false;
      }

      if (
        filters.laboratory_id !== undefined &&
        sample.laboratory_id !== filters.laboratory_id
      ) {
        return false;
      }

      if (
        filters.risk_level &&
        sample.risk_level !== filters.risk_level
      ) {
        return false;
      }

      if (filters.start_date && sample.collection_date) {
        if (
          new Date(sample.collection_date) <
          new Date(filters.start_date)
        ) {
          return false;
        }
      }

      if (filters.end_date && sample.collection_date) {
        if (
          new Date(sample.collection_date) >
          new Date(filters.end_date)
        ) {
          return false;
        }
      }

      return true;
    });
  },

  /**
   * Calcula estadísticas localmente.
   */
  calculateSummary(samples: SampleData[]): SampleSummary {
    const summary: SampleSummary = {
      total: samples.length,
      pending: 0,
      received: 0,
      processing: 0,
      completed: 0,
      rejected: 0,
      high_risk: 0,
      critical_risk: 0,
    };

    samples.forEach((sample) => {
      summary[sample.status] += 1;

      if (sample.risk_level === "high") {
        summary.high_risk += 1;
      }

      if (sample.risk_level === "critical") {
        summary.critical_risk += 1;
      }
    });

    return summary;
  },

  /**
   * Ordena muestras por fecha de creación.
   */
  sortByDate(
    samples: SampleData[],
    descending = true
  ): SampleData[] {
    return [...samples].sort((a, b) => {
      const dateA = new Date(a.created_at ?? 0).getTime();
      const dateB = new Date(b.created_at ?? 0).getTime();

      return descending ? dateB - dateA : dateA - dateB;
    });
  },

  /**
   * Ordena muestras por código.
   */
  sortByCode(
    samples: SampleData[],
    ascending = true
  ): SampleData[] {
    return [...samples].sort((a, b) =>
      ascending
        ? a.code.localeCompare(b.code)
        : b.code.localeCompare(a.code)
    );
  },

  /**
   * Comprueba si una muestra está vencida.
   */
  isExpired(sample: SampleData): boolean {
    if (!sample.expiration_date) {
      return false;
    }

    const expirationDate = new Date(sample.expiration_date);

    if (Number.isNaN(expirationDate.getTime())) {
      return false;
    }

    return expirationDate.getTime() < Date.now();
  },

  /**
   * Comprueba si una muestra requiere atención por riesgo.
   */
  requiresAttention(sample: SampleData): boolean {
    return (
      sample.risk_level === "high" ||
      sample.risk_level === "critical" ||
      this.isExpired(sample)
    );
  },

  /**
   * Devuelve una etiqueta legible para el estado.
   */
  getStatusLabel(status: SampleStatus): string {
    const labels: Record<SampleStatus, string> = {
      pending: "Pendiente",
      received: "Recibida",
      processing: "En procesamiento",
      completed: "Completada",
      rejected: "Rechazada",
    };

    return labels[status];
  },

  /**
   * Exporta muestras mediante el endpoint de exportación.
   */
  async export(
    options: SampleExportOptions = {}
  ): Promise<Blob> {
    const response = await api.get(
      `${SAMPLES_ENDPOINT}/export`,
      {
        params: {
          format: options.format ?? "csv",
          ...buildQueryParams(options.filters),
        },
        responseType: "blob",
      }
    );

    return response.data as Blob;
  },

  /**
   * Descarga un archivo de muestras.
   */
  async downloadExport(
    options: SampleExportOptions = {}
  ): Promise<void> {
    const blob = await this.export(options);
    const format = options.format ?? "csv";

    const mimeTypes: Record<string, string> = {
      csv: "text/csv",
      xlsx:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      pdf: "application/pdf",
    };

    const file = new Blob([blob], {
      type: mimeTypes[format],
    });

    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `labguardian-muestras.${format}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  },
};

export default samplesService;