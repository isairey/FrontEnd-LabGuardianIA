
// src/services/equipment.service.ts

import api from "./api";

// ============================================================
// CONFIGURATION
// ============================================================

const EQUIPMENT_ENDPOINT = "/api/equipment";

// ============================================================
// TYPES
// ============================================================

export type EquipmentStatus =
  | "operational"
  | "available"
  | "active"
  | "maintenance"
  | "under_maintenance"
  | "out_of_service"
  | "inactive"
  | "offline"
  | "calibration"
  | "calibrating"
  | "pending"
  | "disabled"
  | "unknown";

export type EquipmentType =
  | "centrifuge"
  | "microscope"
  | "refrigerator"
  | "freezer"
  | "incubator"
  | "analyzer"
  | "spectrophotometer"
  | "autoclave"
  | "balance"
  | "other";

export interface EquipmentData {
  id: number;
  code: string;
  name: string;

  equipment_type?: string | null;
  brand?: string | null;
  model?: string | null;
  serial_number?: string | null;

  laboratory_area?: string | null;
  location?: string | null;

  status: EquipmentStatus | string;

  description?: string | null;
  specifications?: Record<string, unknown> | null;

  last_calibration?: string | null;
  next_calibration?: string | null;

  last_maintenance?: string | null;
  next_maintenance?: string | null;

  acquisition_date?: string | null;
  warranty_expiration?: string | null;

  responsible_person?: string | null;
  notes?: string | null;

  created_at?: string;
  updated_at?: string;
}

export interface EquipmentCreatePayload {
  code: string;
  name: string;
  equipment_type?: string | null;
  brand?: string | null;
  model?: string | null;
  serial_number?: string | null;
  laboratory_area?: string | null;
  location?: string | null;
  status?: EquipmentStatus | string;
  description?: string | null;
  specifications?: Record<string, unknown> | null;
  acquisition_date?: string | null;
  warranty_expiration?: string | null;
  responsible_person?: string | null;
  notes?: string | null;
}

export type EquipmentUpdatePayload = Partial<EquipmentCreatePayload>;

export interface EquipmentFilters {
  search?: string;
  status?: string;
  equipment_type?: string;
  laboratory_area?: string;
  brand?: string;
  calibration_status?: string;
}

export interface EquipmentPagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface EquipmentListResponse {
  items: EquipmentData[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface EquipmentSummary {
  total: number;
  operational: number;
  available: number;
  maintenance: number;
  out_of_service: number;
  calibration: number;
  inactive: number;
}

export interface EquipmentCalibrationPayload {
  calibration_date: string;
  next_calibration?: string;
  performed_by?: string;
  certificate_number?: string;
  notes?: string;
}

export interface EquipmentMaintenancePayload {
  maintenance_date: string;
  next_maintenance?: string;
  maintenance_type?: string;
  performed_by?: string;
  description?: string;
  notes?: string;
}

export interface EquipmentActionResponse {
  message?: string;
  success?: boolean;
  equipment?: EquipmentData;
}

// ============================================================
// DEFAULT VALUES
// ============================================================

const EMPTY_SUMMARY: EquipmentSummary = {
  total: 0,
  operational: 0,
  available: 0,
  maintenance: 0,
  out_of_service: 0,
  calibration: 0,
  inactive: 0,
};

// ============================================================
// RESPONSE HELPERS
// ============================================================

const extractEquipment = (response: unknown): EquipmentData[] => {
  if (Array.isArray(response)) {
    return response as EquipmentData[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const data = response as Record<string, unknown>;

  const possibleArrays = [
    data.items,
    data.results,
    data.equipment,
    data.data,
  ];

  for (const value of possibleArrays) {
    if (Array.isArray(value)) {
      return value as EquipmentData[];
    }
  }

  return [];
};

const normalizeSummary = (equipment: EquipmentData[]): EquipmentSummary => {
  return equipment.reduce<EquipmentSummary>(
    (summary, item) => {
      summary.total += 1;

      const status = String(item.status).toLowerCase();

      if (status === "operational" || status === "active") {
        summary.operational += 1;
      } else if (status === "available") {
        summary.available += 1;
      } else if (
        status === "maintenance" ||
        status === "under_maintenance"
      ) {
        summary.maintenance += 1;
      } else if (status === "out_of_service" || status === "offline") {
        summary.out_of_service += 1;
      } else if (
        status === "calibration" ||
        status === "calibrating"
      ) {
        summary.calibration += 1;
      } else {
        summary.inactive += 1;
      }

      return summary;
    },
    { ...EMPTY_SUMMARY }
  );
};

// ============================================================
// EQUIPMENT SERVICE
// ============================================================

export const equipmentService = {
  /**
   * Obtener todos los equipos.
   */
  async getAll(): Promise<EquipmentData[]> {
    const response = await api.get(EQUIPMENT_ENDPOINT);
    return extractEquipment(response.data);
  },

  /**
   * Obtener equipos con paginación.
   */
  async getPaginated(
    page = 1,
    pageSize = 10
  ): Promise<EquipmentListResponse> {
    const response = await api.get(EQUIPMENT_ENDPOINT, {
      params: {
        page,
        page_size: pageSize,
      },
    });

    const data = response.data as Record<string, unknown>;
    const items = extractEquipment(data);

    const total = Number(data.total ?? items.length);
    const currentPage = Number(data.page ?? page);
    const currentPageSize = Number(data.page_size ?? pageSize);

    return {
      items,
      total,
      page: currentPage,
      page_size: currentPageSize,
      total_pages: Number(
        data.total_pages ??
          Math.ceil(total / Math.max(1, currentPageSize))
      ),
    };
  },

  /**
   * Obtener un equipo por ID.
   */
  async getById(id: number | string): Promise<EquipmentData> {
    const response = await api.get(`${EQUIPMENT_ENDPOINT}/${id}`);
    return response.data;
  },

  /**
   * Registrar un equipo.
   */
  async create(
    payload: EquipmentCreatePayload
  ): Promise<EquipmentData> {
    const response = await api.post(EQUIPMENT_ENDPOINT, payload);
    return response.data;
  },

  /**
   * Actualizar un equipo.
   */
  async update(
    id: number | string,
    payload: EquipmentUpdatePayload
  ): Promise<EquipmentData> {
    const response = await api.put(
      `${EQUIPMENT_ENDPOINT}/${id}`,
      payload
    );

    return response.data;
  },

  /**
   * Actualizar parcialmente un equipo.
   */
  async patch(
    id: number | string,
    payload: EquipmentUpdatePayload
  ): Promise<EquipmentData> {
    const response = await api.patch(
      `${EQUIPMENT_ENDPOINT}/${id}`,
      payload
    );

    return response.data;
  },

  /**
   * Eliminar un equipo.
   */
  async delete(id: number | string): Promise<void> {
    await api.delete(`${EQUIPMENT_ENDPOINT}/${id}`);
  },

  /**
   * Cambiar el estado de un equipo.
   */
  async updateStatus(
    id: number | string,
    status: EquipmentStatus
  ): Promise<EquipmentData> {
    const response = await api.patch(
      `${EQUIPMENT_ENDPOINT}/${id}/status`,
      { status }
    );

    return response.data;
  },

  /**
   * Registrar una calibración.
   */
  async registerCalibration(
    id: number | string,
    payload: EquipmentCalibrationPayload
  ): Promise<EquipmentActionResponse> {
    const response = await api.post(
      `${EQUIPMENT_ENDPOINT}/${id}/calibrations`,
      payload
    );

    return response.data;
  },

  /**
   * Obtener el historial de calibraciones.
   */
  async getCalibrations(id: number | string): Promise<unknown[]> {
    const response = await api.get(
      `${EQUIPMENT_ENDPOINT}/${id}/calibrations`
    );

    return Array.isArray(response.data)
      ? response.data
      : [];
  },

  /**
   * Registrar mantenimiento.
   */
  async registerMaintenance(
    id: number | string,
    payload: EquipmentMaintenancePayload
  ): Promise<EquipmentActionResponse> {
    const response = await api.post(
      `${EQUIPMENT_ENDPOINT}/${id}/maintenances`,
      payload
    );

    return response.data;
  },

  /**
   * Obtener historial de mantenimiento.
   */
  async getMaintenances(id: number | string): Promise<unknown[]> {
    const response = await api.get(
      `${EQUIPMENT_ENDPOINT}/${id}/maintenances`
    );

    return Array.isArray(response.data)
      ? response.data
      : [];
  },

  /**
   * Obtener equipos que necesitan calibración.
   */
  async getPendingCalibration(): Promise<EquipmentData[]> {
    const response = await api.get(
      `${EQUIPMENT_ENDPOINT}/pending-calibration`
    );

    return extractEquipment(response.data);
  },

  /**
   * Obtener equipos que necesitan mantenimiento.
   */
  async getPendingMaintenance(): Promise<EquipmentData[]> {
    const response = await api.get(
      `${EQUIPMENT_ENDPOINT}/pending-maintenance`
    );

    return extractEquipment(response.data);
  },

  /**
   * Calcular estadísticas de los equipos.
   */
  calculateSummary(equipment: EquipmentData[]): EquipmentSummary {
    return normalizeSummary(equipment);
  },

  /**
   * Filtrar equipos localmente.
   */
  filter(
    equipment: EquipmentData[],
    filters: EquipmentFilters
  ): EquipmentData[] {
    const search = filters.search?.trim().toLowerCase();

    return equipment.filter((item) => {
      if (search) {
        const searchableText = [
          item.code,
          item.name,
          item.brand,
          item.model,
          item.serial_number,
          item.laboratory_area,
          item.location,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(search)) {
          return false;
        }
      }

      if (
        filters.status &&
        item.status.toLowerCase() !== filters.status.toLowerCase()
      ) {
        return false;
      }

      if (
        filters.equipment_type &&
        item.equipment_type?.toLowerCase() !==
          filters.equipment_type.toLowerCase()
      ) {
        return false;
      }

      if (
        filters.laboratory_area &&
        item.laboratory_area !== filters.laboratory_area
      ) {
        return false;
      }

      if (
        filters.brand &&
        item.brand?.toLowerCase() !== filters.brand.toLowerCase()
      ) {
        return false;
      }

      if (filters.calibration_status) {
        const nextDate = item.next_calibration
          ? new Date(item.next_calibration)
          : null;

        const now = new Date();

        if (filters.calibration_status === "pending") {
          if (!nextDate || nextDate >= now) return false;
        }

        if (filters.calibration_status === "upcoming") {
          if (!nextDate) return false;

          const daysUntil =
            (nextDate.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24);

          if (daysUntil < 0 || daysUntil > 30) return false;
        }

        if (filters.calibration_status === "valid") {
          if (!nextDate || nextDate < now) return false;
        }
      }

      return true;
    });
  },

  /**
   * Comprobar si la calibración está vencida.
   */
  isCalibrationOverdue(equipment: EquipmentData): boolean {
    if (!equipment.next_calibration) return false;

    return new Date(equipment.next_calibration) < new Date();
  },

  /**
   * Comprobar si el mantenimiento está vencido.
   */
  isMaintenanceOverdue(equipment: EquipmentData): boolean {
    if (!equipment.next_maintenance) return false;

    return new Date(equipment.next_maintenance) < new Date();
  },

  /**
   * Comprobar si la garantía está vigente.
   */
  isWarrantyValid(equipment: EquipmentData): boolean {
    if (!equipment.warranty_expiration) return false;

    return new Date(equipment.warranty_expiration) >= new Date();
  },
};

export { EMPTY_SUMMARY };

export default equipmentService;
