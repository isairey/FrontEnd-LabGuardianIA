
// src/services/qr.service.ts

import api from "./api";

// ============================================================
// CONFIGURATION
// ============================================================

const QR_ENDPOINT = "/api/qr";

// ============================================================
// TYPES
// ============================================================

export type QrEntityType = "sample" | "equipment";

export type QrFormat = "png" | "svg" | "data_url";

export interface QrGeneratePayload {
  entity_type: QrEntityType;
  entity_id: number;
  format?: QrFormat;
  size?: number;
  error_correction?: "L" | "M" | "Q" | "H";
}

export interface QrGenerateResponse {
  success: boolean;
  entity_type: QrEntityType;
  entity_id: number;
  code?: string;
  qr_code?: string;
  image?: string;
  image_url?: string;
  format?: QrFormat;
  created_at?: string;
}

export interface QrDecodeResponse {
  success: boolean;
  valid: boolean;
  raw_value: string;
  entity_type?: QrEntityType;
  entity_id?: number;
  code?: string;
  message?: string;
}

export interface QrValidateResponse {
  valid: boolean;
  entity_type?: QrEntityType;
  entity_id?: number;
  code?: string;
  message?: string;
}

export interface QrLookupResponse {
  success: boolean;
  entity_type: QrEntityType;
  entity_id: number;
  code: string;
  entity?: Record<string, unknown>;
}

export interface QrHistoryItem {
  id: number;
  entity_type: QrEntityType;
  entity_id: number;
  code: string;
  created_at: string;
  created_by?: string | null;
}

export interface QrScanPayload {
  raw_value: string;
  scanned_at?: string;
  device?: string;
}

export interface QrScanResponse {
  success: boolean;
  valid: boolean;
  message?: string;
  entity_type?: QrEntityType;
  entity_id?: number;
  code?: string;
}

export interface QrOptions {
  size?: number;
  format?: QrFormat;
  error_correction?: "L" | "M" | "Q" | "H";
}

// ============================================================
// HELPERS
// ============================================================

const isRecord = (
  value: unknown
): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const normalizeBase64 = (value: string): string => {
  if (value.startsWith("data:image/")) {
    return value;
  }

  return `data:image/png;base64,${value}`;
};

const extractArray = <T>(response: unknown): T[] => {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (!isRecord(response)) {
    return [];
  }

  const candidates = [
    response.items,
    response.results,
    response.history,
    response.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as T[];
    }
  }

  return [];
};

// ============================================================
// QR SERVICE
// ============================================================

export const qrService = {
  /**
   * Generar un código QR para una muestra o equipo.
   */
  async generate(
    payload: QrGeneratePayload
  ): Promise<QrGenerateResponse> {
    const response = await api.post(
      `${QR_ENDPOINT}/generate`,
      payload
    );

    return response.data;
  },

  /**
   * Generar QR para una muestra.
   */
  async generateSample(
    sampleId: number,
    options: QrOptions = {}
  ): Promise<QrGenerateResponse> {
    return this.generate({
      entity_type: "sample",
      entity_id: sampleId,
      ...options,
    });
  },

  /**
   * Generar QR para un equipo.
   */
  async generateEquipment(
    equipmentId: number,
    options: QrOptions = {}
  ): Promise<QrGenerateResponse> {
    return this.generate({
      entity_type: "equipment",
      entity_id: equipmentId,
      ...options,
    });
  },

  /**
   * Obtener el código QR de una entidad.
   */
  async getByEntity(
    entityType: QrEntityType,
    entityId: number
  ): Promise<QrGenerateResponse> {
    const response = await api.get(
      `${QR_ENDPOINT}/${entityType}/${entityId}`
    );

    return response.data;
  },

  /**
   * Obtener QR de una muestra.
   */
  async getSampleQr(sampleId: number): Promise<QrGenerateResponse> {
    return this.getByEntity("sample", sampleId);
  },

  /**
   * Obtener QR de un equipo.
   */
  async getEquipmentQr(
    equipmentId: number
  ): Promise<QrGenerateResponse> {
    return this.getByEntity("equipment", equipmentId);
  },

  /**
   * Descargar código QR como archivo.
   */
  async download(
    entityType: QrEntityType,
    entityId: number,
    format: "png" | "svg" = "png"
  ): Promise<Blob> {
    const response = await api.get(
      `${QR_ENDPOINT}/${entityType}/${entityId}/download`,
      {
        params: { format },
        responseType: "blob",
      }
    );

    return response.data as Blob;
  },

  /**
   * Decodificar un valor QR enviado por el escáner.
   */
  async decode(rawValue: string): Promise<QrDecodeResponse> {
    const response = await api.post(
      `${QR_ENDPOINT}/decode`,
      { raw_value: rawValue }
    );

    return response.data;
  },

  /**
   * Validar un código QR.
   */
  async validate(rawValue: string): Promise<QrValidateResponse> {
    const response = await api.post(
      `${QR_ENDPOINT}/validate`,
      { raw_value: rawValue }
    );

    return response.data;
  },

  /**
   * Registrar un escaneo.
   */
  async registerScan(
    payload: QrScanPayload
  ): Promise<QrScanResponse> {
    const response = await api.post(
      `${QR_ENDPOINT}/scan`,
      payload
    );

    return response.data;
  },

  /**
   * Consultar la información de una entidad a partir de su QR.
   */
  async lookup(rawValue: string): Promise<QrLookupResponse> {
    const response = await api.post(
      `${QR_ENDPOINT}/lookup`,
      { raw_value: rawValue }
    );

    return response.data;
  },

  /**
   * Obtener el historial de códigos QR.
   */
  async getHistory(
    entityType?: QrEntityType,
    entityId?: number
  ): Promise<QrHistoryItem[]> {
    const response = await api.get(`${QR_ENDPOINT}/history`, {
      params: {
        entity_type: entityType,
        entity_id: entityId,
      },
    });

    return extractArray<QrHistoryItem>(response.data);
  },

  /**
   * Eliminar un código QR asociado a una entidad.
   */
  async delete(
    entityType: QrEntityType,
    entityId: number
  ): Promise<void> {
    await api.delete(
      `${QR_ENDPOINT}/${entityType}/${entityId}`
    );
  },

  /**
   * Convertir una respuesta base64 a una URL de imagen.
   */
  toImageDataUrl(value: string): string {
    return normalizeBase64(value);
  },

  /**
   * Descargar una imagen QR generada en el navegador.
   */
  downloadImage(
    imageData: string,
    filename = "labguardian-qr.png"
  ): void {
    const link = document.createElement("a");

    link.href = normalizeBase64(imageData);
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  /**
   * Crear un nombre de archivo para una entidad.
   */
  getFilename(
    entityType: QrEntityType,
    entityId: number
  ): string {
    return `labguardian-${entityType}-${entityId}-qr.png`;
  },

  /**
   * Comprobar si el contenido escaneado parece una URL.
   */
  isUrl(value: string): boolean {
    try {
      const url = new URL(value);

      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  },

  /**
   * Extraer el ID de una ruta de QR de LabGuardian.
   *
   * Ejemplo:
   * https://labguardian.local/samples/25
   */
  extractEntityFromUrl(
    value: string
  ): { entity_type: QrEntityType; entity_id: number } | null {
    try {
      const url = new URL(value);
      const segments = url.pathname.split("/").filter(Boolean);

      if (segments.length < 2) {
        return null;
      }

      const entityType = segments[segments.length - 2];
      const entityId = Number(segments[segments.length - 1]);

      if (
        (entityType !== "samples" && entityType !== "equipment") ||
        !Number.isInteger(entityId) ||
        entityId <= 0
      ) {
        return null;
      }

      return {
        entity_type: entityType === "samples" ? "sample" : "equipment",
        entity_id: entityId,
      };
    } catch {
      return null;
    }
  },

  /**
   * Comprobar si una respuesta contiene una imagen QR.
   */
  hasImage(response: QrGenerateResponse): boolean {
    return Boolean(
      response.image ||
      response.qr_code ||
      response.image_url
    );
  },

  /**
   * Obtener el contenido visual de un QR.
   */
  getImageSource(response: QrGenerateResponse): string | null {
    if (response.image) {
      return normalizeBase64(response.image);
    }

    if (response.qr_code) {
      return normalizeBase64(response.qr_code);
    }

    return response.image_url ?? null;
  },

  /**
   * Convertir un valor QR en un objeto de lectura.
   */
  parseRawValue(rawValue: string): {
    raw_value: string;
    is_url: boolean;
    entity: ReturnType<typeof qrService.extractEntityFromUrl>;
  } {
    return {
      raw_value: rawValue,
      is_url: this.isUrl(rawValue),
      entity: this.extractEntityFromUrl(rawValue),
    };
  },
};

export default qrService;
