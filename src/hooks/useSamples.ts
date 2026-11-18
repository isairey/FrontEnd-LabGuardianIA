
import { useCallback, useEffect, useMemo, useState } from "react";
import axios, { AxiosError } from "axios";
import useDebounce from "./useDebounce";

import type { SampleTableData } from "../components/samples/SampleTable";
import type { SampleFormData } from "../components/samples/SampleForm";
import type { SampleFiltersState } from "../components/samples/SampleFilters";

// --------------------------------------------------
// API CONFIGURATION
// --------------------------------------------------

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1"
).replace(/\/$/, "");

const SAMPLES_ENDPOINT = `${API_BASE_URL}/api/samples`;

const api = axios.create({
  baseURL: SAMPLES_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

// --------------------------------------------------
// TYPES
// --------------------------------------------------

export interface SampleData extends SampleTableData {
  temperature?: number | null;
  duration?: number | null;
  storage_location?: string | null;
  notes?: string | null;
  risk_explanation?: string | null;
}

export interface SampleCreatePayload {
  code: string;
  sample_type: string;
  laboratory_area: string;
  priority: string;
  status: string;
  temperature: number | null;
  storage_location: string | null;
  duration: number | null;
  notes: string | null;
}

export interface SampleUpdatePayload extends Partial<SampleCreatePayload> {}

export interface SamplePagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SampleSummary {
  total: number;
  pending: number;
  received: number;
  processing: number;
  completed: number;
  rejected: number;
  highRisk: number;
  criticalRisk: number;
}

export interface UseSamplesOptions {
  autoFetch?: boolean;
  initialPage?: number;
  pageSize?: number;
  debounceDelay?: number;
}

export interface UseSamplesReturn {
  samples: SampleData[];
  filteredSamples: SampleData[];
  paginatedSamples: SampleData[];
  selectedSample: SampleData | null;

  loading: boolean;
  submitting: boolean;
  deleting: boolean;
  error: string | null;

  filters: SampleFiltersState;
  pagination: SamplePagination;
  summary: SampleSummary;

  fetchSamples: () => Promise<void>;
  fetchSampleById: (id: number) => Promise<SampleData | null>;
  createSample: (data: SampleFormData) => Promise<SampleData>;
  updateSample: (
    id: number,
    data: SampleFormData | SampleUpdatePayload
  ) => Promise<SampleData>;
  deleteSample: (id: number) => Promise<void>;

  setFilters: (filters: SampleFiltersState) => void;
  updateFilters: (filters: Partial<SampleFiltersState>) => void;
  resetFilters: () => void;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  selectSample: (sample: SampleData | null) => void;
  refresh: () => Promise<void>;
  clearError: () => void;
}

// --------------------------------------------------
// DEFAULT VALUES
// --------------------------------------------------

const DEFAULT_FILTERS: SampleFiltersState = {
  search: "",
  status: "",
  risk_level: "",
  priority: "",
  laboratory_area: "",
};

const DEFAULT_SUMMARY: SampleSummary = {
  total: 0,
  pending: 0,
  received: 0,
  processing: 0,
  completed: 0,
  rejected: 0,
  highRisk: 0,
  criticalRisk: 0,
};

const DEFAULT_PAGE_SIZE = 10;

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      detail?: string | { msg?: string }[];
      message?: string;
    }>;

    const detail = axiosError.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail) && detail.length > 0) {
      return detail
        .map((item) => item.msg || "Error de validación")
        .join(", ");
    }

    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }

    if (axiosError.code === "ECONNABORTED") {
      return "La solicitud tardó demasiado tiempo.";
    }

    if (!axiosError.response) {
      return "No se pudo conectar con el servidor.";
    }

    return `Error del servidor (${axiosError.response.status}).`;
  }

  return error instanceof Error
    ? error.message
    : "Ha ocurrido un error inesperado.";
}

function extractSamples(response: unknown): SampleData[] {
  if (Array.isArray(response)) {
    return response as SampleData[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const data = response as Record<string, unknown>;

  const possibleArrays = [
    data.items,
    data.results,
    data.samples,
    data.data,
  ];

  const result = possibleArrays.find(Array.isArray);

  return (result as SampleData[] | undefined) ?? [];
}

function extractSample(response: unknown): SampleData {
  if (!response || typeof response !== "object") {
    throw new Error("El servidor devolvió una muestra inválida.");
  }

  const data = response as Record<string, unknown>;

  const sample = data.sample ?? data.data ?? response;

  if (!sample || typeof sample !== "object") {
    throw new Error("No se pudo obtener la información de la muestra.");
  }

  return sample as SampleData;
}

function normalizeFormData(
  data: SampleFormData
): SampleCreatePayload {
  const temperature = data.temperature.trim();
  const duration = data.duration.trim();

  return {
    code: data.code.trim(),
    sample_type: data.sample_type.trim(),
    laboratory_area: data.laboratory_area.trim(),
    priority: data.priority,
    status: data.status,
    temperature: temperature === "" ? null : Number(temperature),
    storage_location: data.storage_location.trim() || null,
    duration: duration === "" ? null : Number(duration),
    notes: data.notes.trim() || null,
  };
}

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function createSummary(samples: SampleData[]): SampleSummary {
  return samples.reduce(
    (summary, sample) => {
      const status = normalizeText(sample.status);
      const risk = normalizeText(sample.risk_level);

      summary.total += 1;

      if (status === "pending" || status === "pendiente") {
        summary.pending += 1;
      } else if (status === "received" || status === "recibida") {
        summary.received += 1;
      } else if (status === "processing" || status === "procesando") {
        summary.processing += 1;
      } else if (status === "completed" || status === "completada") {
        summary.completed += 1;
      } else if (status === "rejected" || status === "rechazada") {
        summary.rejected += 1;
      }

      if (risk === "high" || risk === "alto") {
        summary.highRisk += 1;
      }

      if (risk === "critical" || risk === "critico") {
        summary.criticalRisk += 1;
      }

      return summary;
    },
    { ...DEFAULT_SUMMARY }
  );
}

// --------------------------------------------------
// HOOK
// --------------------------------------------------

export function useSamples(
  options: UseSamplesOptions = {}
): UseSamplesReturn {
  const {
    autoFetch = true,
    initialPage = 1,
    pageSize: initialPageSize = DEFAULT_PAGE_SIZE,
    debounceDelay = 400,
  } = options;

  // Data
  const [samples, setSamples] = useState<SampleData[]>([]);
  const [selectedSample, setSelectedSample] =
    useState<SampleData | null>(null);

  // Request states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] =
    useState<SampleFiltersState>({ ...DEFAULT_FILTERS });

  const debouncedSearch = useDebounce(
    filters.search,
    debounceDelay
  );

  // Pagination
  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  // ------------------------------------------------
  // FETCH ALL SAMPLES
  // ------------------------------------------------

  const fetchSamples = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/");
      const data = extractSamples(response.data);

      setSamples(data);
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ------------------------------------------------
  // FETCH SAMPLE BY ID
  // ------------------------------------------------

  const fetchSampleById = useCallback(
    async (id: number): Promise<SampleData | null> => {
      if (!Number.isInteger(id) || id <= 0) {
        throw new Error("El identificador de la muestra no es válido.");
      }

      setError(null);

      try {
        const response = await api.get(`/${id}`);
        const sample = extractSample(response.data);

        setSelectedSample(sample);

        setSamples((current) =>
          current.map((item) =>
            item.id === sample.id ? sample : item
          )
        );

        return sample;
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      }
    },
    []
  );

  // ------------------------------------------------
  // CREATE SAMPLE
  // ------------------------------------------------

  const createSample = useCallback(
    async (data: SampleFormData): Promise<SampleData> => {
      setSubmitting(true);
      setError(null);

      try {
        const payload = normalizeFormData(data);
        const response = await api.post("/", payload);
        const createdSample = extractSample(response.data);

        setSamples((current) => [
          createdSample,
          ...current.filter(
            (sample) => sample.id !== createdSample.id
          ),
        ]);

        setSelectedSample(createdSample);
        setPageState(1);

        return createdSample;
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  // ------------------------------------------------
  // UPDATE SAMPLE
  // ------------------------------------------------

  const updateSample = useCallback(
    async (
      id: number,
      data: SampleFormData | SampleUpdatePayload
    ): Promise<SampleData> => {
      if (!Number.isInteger(id) || id <= 0) {
        throw new Error("El identificador de la muestra no es válido.");
      }

      setSubmitting(true);
      setError(null);

      try {
        const payload =
          "code" in data &&
          "sample_type" in data &&
          "temperature" in data &&
          typeof data.temperature === "string"
            ? normalizeFormData(data as SampleFormData)
            : data;

        const response = await api.put(`/${id}`, payload);
        const updatedSample = extractSample(response.data);

        setSamples((current) =>
          current.map((sample) =>
            sample.id === id ? updatedSample : sample
          )
        );

        setSelectedSample((current) =>
          current?.id === id ? updatedSample : current
        );

        return updatedSample;
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  // ------------------------------------------------
  // DELETE SAMPLE
  // ------------------------------------------------

  const deleteSample = useCallback(
    async (id: number): Promise<void> => {
      if (!Number.isInteger(id) || id <= 0) {
        throw new Error("El identificador de la muestra no es válido.");
      }

      setDeleting(true);
      setError(null);

      try {
        await api.delete(`/${id}`);

        setSamples((current) =>
          current.filter((sample) => sample.id !== id)
        );

        setSelectedSample((current) =>
          current?.id === id ? null : current
        );
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      } finally {
        setDeleting(false);
      }
    },
    []
  );

  // ------------------------------------------------
  // FILTERS
  // ------------------------------------------------

  const updateFilters = useCallback(
    (newFilters: Partial<SampleFiltersState>) => {
      setFilters((current) => ({
        ...current,
        ...newFilters,
      }));

      setPageState(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
    setPageState(1);
  }, []);

  // ------------------------------------------------
  // FILTERED DATA
  // ------------------------------------------------

  const filteredSamples = useMemo(() => {
    const search = normalizeText(debouncedSearch);

    return samples.filter((sample) => {
      const matchesSearch =
        !search ||
        [
          sample.code,
          sample.sample_type,
          sample.laboratory_area,
          sample.storage_location,
          sample.status,
          sample.priority,
        ].some((value) => normalizeText(value).includes(search));

      const matchesStatus =
        !filters.status ||
        normalizeText(sample.status) === normalizeText(filters.status);

      const matchesRisk =
        !filters.risk_level ||
        normalizeText(sample.risk_level) ===
          normalizeText(filters.risk_level);

      const matchesPriority =
        !filters.priority ||
        normalizeText(sample.priority) ===
          normalizeText(filters.priority);

      const matchesArea =
        !filters.laboratory_area ||
        normalizeText(sample.laboratory_area) ===
          normalizeText(filters.laboratory_area);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRisk &&
        matchesPriority &&
        matchesArea
      );
    });
  }, [samples, debouncedSearch, filters]);

  // ------------------------------------------------
  // PAGINATION
  // ------------------------------------------------

  const pagination = useMemo<SamplePagination>(() => {
    const total = filteredSamples.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      page: Math.min(page, totalPages),
      pageSize,
      total,
      totalPages,
    };
  }, [filteredSamples.length, page, pageSize]);

  const paginatedSamples = useMemo(() => {
    const safePage = Math.min(page, pagination.totalPages);
    const start = (safePage - 1) * pageSize;

    return filteredSamples.slice(start, start + pageSize);
  }, [filteredSamples, page, pageSize, pagination.totalPages]);

  // Keep current page within valid bounds.
  useEffect(() => {
    if (page > pagination.totalPages) {
      setPageState(pagination.totalPages);
    }
  }, [page, pagination.totalPages]);

  const setPage = useCallback(
    (nextPage: number) => {
      setPageState(
        Math.max(1, Math.min(nextPage, pagination.totalPages))
      );
    },
    [pagination.totalPages]
  );

  const setPageSize = useCallback((nextPageSize: number) => {
    if (!Number.isInteger(nextPageSize) || nextPageSize < 1) {
      return;
    }

    setPageSizeState(nextPageSize);
    setPageState(1);
  }, []);

  // ------------------------------------------------
  // SUMMARY
  // ------------------------------------------------

  const summary = useMemo(
    () => createSummary(samples),
    [samples]
  );

  // ------------------------------------------------
  // UTILITIES
  // ------------------------------------------------

  const selectSample = useCallback(
    (sample: SampleData | null) => {
      setSelectedSample(sample);
    },
    []
  );

  const refresh = useCallback(async () => {
    await fetchSamples();
  }, [fetchSamples]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ------------------------------------------------
  // INITIAL FETCH
  // ------------------------------------------------

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    void fetchSamples().catch(() => {
      // The hook already stores the error in its state.
    });
  }, [autoFetch, fetchSamples]);

  // ------------------------------------------------
  // RETURN
  // ------------------------------------------------

  return {
    samples,
    filteredSamples,
    paginatedSamples,
    selectedSample,

    loading,
    submitting,
    deleting,
    error,

    filters,
    pagination,
    summary,

    fetchSamples,
    fetchSampleById,
    createSample,
    updateSample,
    deleteSample,

    setFilters,
    updateFilters,
    resetFilters,

    setPage,
    setPageSize,

    selectSample,
    refresh,
    clearError,
  };
}

export default useSamples;
