
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

// ============================================================
// TYPES
// ============================================================

export type AlertSeverity = "low" | "medium" | "high" | "critical";

export type AlertStatus =
  | "active"
  | "acknowledged"
  | "resolved"
  | "dismissed";

export interface AlertData {
  id: number;
  sample_id?: number | null;
  sample_code?: string | null;
  event_id?: number | null;
  alert_type: string;
  severity: AlertSeverity | string;
  status: AlertStatus | string;
  title: string;
  message?: string | null;
  risk_score?: number | null;
  source?: string | null;
  resolved_by?: string | null;
  resolution_notes?: string | null;
  created_at: string;
  updated_at?: string | null;
  resolved_at?: string | null;
  acknowledged_at?: string | null;
  acknowledged_by?: string | null;
}

export interface AlertFilters {
  search: string;
  severity: string;
  status: string;
  alert_type: string;
  sample_code: string;
  date_from: string;
  date_to: string;
}

export interface AlertPagination {
  page: number;
  page_size: number;
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
}

export interface ResolveAlertPayload {
  resolution_notes: string;
  resolved_by?: string;
}

export interface AcknowledgeAlertPayload {
  acknowledged_by?: string;
}

export interface UseAlertsOptions {
  autoFetch?: boolean;
  pageSize?: number;
  initialFilters?: Partial<AlertFilters>;
}

export interface UseAlertsReturn {
  alerts: AlertData[];
  allAlerts: AlertData[];
  filteredAlerts: AlertData[];
  activeAlerts: AlertData[];
  summary: AlertSummary;
  filters: AlertFilters;
  pagination: AlertPagination;
  total: number;
  totalPages: number;
  loading: boolean;
  syncing: boolean;
  error: string | null;

  fetchAlerts: () => Promise<void>;
  refreshAlerts: () => Promise<void>;
  syncAlerts: () => Promise<void>;

  acknowledgeAlert: (
    id: number,
    payload?: AcknowledgeAlertPayload,
  ) => Promise<boolean>;

  resolveAlert: (
    id: number,
    payload: ResolveAlertPayload,
  ) => Promise<boolean>;

  updateFilters: (filters: Partial<AlertFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  getAlertById: (id: number) => AlertData | undefined;

  markAsAcknowledged: (id: number) => Promise<boolean>;
  markAsResolved: (
    id: number,
    notes: string,
  ) => Promise<boolean>;
}

// ============================================================
// CONFIGURATION
// ============================================================

// Si tu proyecto ya tiene un cliente Axios centralizado,
// sustituye esta instancia por la importación correspondiente.

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1"
).replace(/\/$/, "");

const ALERTS_ENDPOINT = `${API_BASE_URL}/api/alerts`;

const api = axios.create({
  baseURL: ALERTS_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

// ============================================================
// DEFAULTS
// ============================================================

const DEFAULT_FILTERS: AlertFilters = {
  search: "",
  severity: "",
  status: "",
  alert_type: "",
  sample_code: "",
  date_from: "",
  date_to: "",
};

const normalize = (value?: string | null): string =>
  (value ?? "").trim().toLowerCase();

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item: { msg?: string }) => item.msg ?? "Error de validación")
        .join(", ");
    }

    return (
      error.response?.data?.message ||
      error.message ||
      "Error al comunicarse con el servidor."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado.";
};

const normalizeAlertList = (response: unknown): AlertData[] => {
  if (Array.isArray(response)) {
    return response as AlertData[];
  }

  if (
    response &&
    typeof response === "object" &&
    "items" in response &&
    Array.isArray((response as AlertListResponse).items)
  ) {
    return (response as AlertListResponse).items;
  }

  if (
    response &&
    typeof response === "object" &&
    "alerts" in response &&
    Array.isArray((response as { alerts: AlertData[] }).alerts)
  ) {
    return (response as { alerts: AlertData[] }).alerts;
  }

  return [];
};

// ============================================================
// HOOK
// ============================================================

export default function useAlerts(
  options: UseAlertsOptions = {},
): UseAlertsReturn {
  const {
    autoFetch = true,
    pageSize: initialPageSize = 10,
    initialFilters,
  } = options;

  const [allAlerts, setAllAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<AlertFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const [pagination, setPagination] = useState<AlertPagination>({
    page: 1,
    page_size: initialPageSize,
  });

  // ==========================================================
  // FETCH ALERTS
  // ==========================================================

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/");

      const data = normalizeAlertList(response.data);

      setAllAlerts(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const refreshAlerts = useCallback(async () => {
    await fetchAlerts();
  }, [fetchAlerts]);

  // ==========================================================
  // SYNCHRONIZE ALERTS
  // ==========================================================

  const syncAlerts = useCallback(async () => {
    try {
      setSyncing(true);
      setError(null);

      await api.post("/sync");

      await fetchAlerts();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSyncing(false);
    }
  }, [fetchAlerts]);

  // ==========================================================
  // ACKNOWLEDGE ALERT
  // ==========================================================

  const acknowledgeAlert = useCallback(
    async (
      id: number,
      payload: AcknowledgeAlertPayload = {},
    ): Promise<boolean> => {
      try {
        setError(null);

        const response = await api.patch(
          `/${id}/acknowledge`,
          payload,
        );

        const updatedAlert = response.data?.alert ?? response.data;

        setAllAlerts((previous) =>
          previous.map((alert) =>
            alert.id === id
              ? {
                  ...alert,
                  ...updatedAlert,
                  status: updatedAlert?.status ?? "acknowledged",
                }
              : alert,
          ),
        );

        return true;
      } catch (err) {
        setError(getErrorMessage(err));
        return false;
      }
    },
    [],
  );

  // ==========================================================
  // RESOLVE ALERT
  // ==========================================================

  const resolveAlert = useCallback(
    async (
      id: number,
      payload: ResolveAlertPayload,
    ): Promise<boolean> => {
      try {
        setError(null);

        const response = await api.patch(
          `/${id}/resolve`,
          payload,
        );

        const updatedAlert = response.data?.alert ?? response.data;

        setAllAlerts((previous) =>
          previous.map((alert) =>
            alert.id === id
              ? {
                  ...alert,
                  ...updatedAlert,
                  status: updatedAlert?.status ?? "resolved",
                }
              : alert,
          ),
        );

        return true;
      } catch (err) {
        setError(getErrorMessage(err));
        return false;
      }
    },
    [],
  );

  // ==========================================================
  // FILTERS
  // ==========================================================

  const updateFilters = useCallback(
    (newFilters: Partial<AlertFilters>) => {
      setFilters((previous) => ({
        ...previous,
        ...newFilters,
      }));

      setPagination((previous) => ({
        ...previous,
        page: 1,
      }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  }, []);

  // ==========================================================
  // FILTERED ALERTS
  // ==========================================================

  const filteredAlerts = useMemo(() => {
    return allAlerts.filter((alert) => {
      const searchTerm = normalize(filters.search);

      const matchesSearch =
        !searchTerm ||
        [
          alert.title,
          alert.message,
          alert.sample_code,
          alert.alert_type,
          alert.source,
        ]
          .filter(Boolean)
          .some((value) => normalize(value).includes(searchTerm));

      const matchesSeverity =
        !filters.severity ||
        normalize(alert.severity) === normalize(filters.severity);

      const matchesStatus =
        !filters.status ||
        normalize(alert.status) === normalize(filters.status);

      const matchesType =
        !filters.alert_type ||
        normalize(alert.alert_type) === normalize(filters.alert_type);

      const matchesSample =
        !filters.sample_code ||
        normalize(alert.sample_code).includes(
          normalize(filters.sample_code),
        );

      const alertDate = alert.created_at
        ? new Date(alert.created_at).getTime()
        : 0;

      const fromDate = filters.date_from
        ? new Date(`${filters.date_from}T00:00:00`).getTime()
        : null;

      const toDate = filters.date_to
        ? new Date(`${filters.date_to}T23:59:59.999`).getTime()
        : null;

      const matchesFrom =
        fromDate === null ||
        (alertDate > 0 && alertDate >= fromDate);

      const matchesTo =
        toDate === null ||
        (alertDate > 0 && alertDate <= toDate);

      return (
        matchesSearch &&
        matchesSeverity &&
        matchesStatus &&
        matchesType &&
        matchesSample &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [allAlerts, filters]);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const total = filteredAlerts.length;

  const totalPages = Math.max(
    1,
    Math.ceil(total / pagination.page_size),
  );

  const safePage = Math.min(pagination.page, totalPages);

  const alerts = useMemo(() => {
    const start = (safePage - 1) * pagination.page_size;

    return filteredAlerts.slice(
      start,
      start + pagination.page_size,
    );
  }, [filteredAlerts, safePage, pagination.page_size]);

  const setPage = useCallback(
    (page: number) => {
      setPagination((previous) => ({
        ...previous,
        page: Math.max(1, Math.min(page, totalPages)),
      }));
    },
    [totalPages],
  );

  const setPageSize = useCallback((pageSize: number) => {
    setPagination({
      page: 1,
      page_size: Math.max(1, pageSize),
    });
  }, []);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary = useMemo<AlertSummary>(() => {
    const result: AlertSummary = {
      total: allAlerts.length,
      active: 0,
      acknowledged: 0,
      resolved: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    allAlerts.forEach((alert) => {
      const status = normalize(alert.status);
      const severity = normalize(alert.severity);

      if (status === "active") result.active++;
      if (status === "acknowledged") result.acknowledged++;
      if (status === "resolved") result.resolved++;

      if (
        severity === "critical" ||
        severity === "critica" ||
        severity === "crítica"
      ) {
        result.critical++;
      } else if (severity === "high" || severity === "alta") {
        result.high++;
      } else if (severity === "medium" || severity === "media") {
        result.medium++;
      } else if (severity === "low" || severity === "baja") {
        result.low++;
      }
    });

    return result;
  }, [allAlerts]);

  // ==========================================================
  // ACTIVE ALERTS
  // ==========================================================

  const activeAlerts = useMemo(
    () =>
      allAlerts.filter((alert) => {
        const status = normalize(alert.status);

        return status === "active" || status === "acknowledged";
      }),
    [allAlerts],
  );

  // ==========================================================
  // GET ALERT BY ID
  // ==========================================================

  const getAlertById = useCallback(
    (id: number) => allAlerts.find((alert) => alert.id === id),
    [allAlerts],
  );

  // ==========================================================
  // SHORTCUT ACTIONS
  // ==========================================================

  const markAsAcknowledged = useCallback(
    async (id: number): Promise<boolean> => {
      return acknowledgeAlert(id);
    },
    [acknowledgeAlert],
  );

  const markAsResolved = useCallback(
    async (id: number, notes: string): Promise<boolean> => {
      return resolveAlert(id, {
        resolution_notes: notes,
      });
    },
    [resolveAlert],
  );

  // ==========================================================
  // AUTO FETCH
  // ==========================================================

  useEffect(() => {
    if (autoFetch) {
      void fetchAlerts();
    }
  }, [autoFetch, fetchAlerts]);

  // ==========================================================
  // RETURN
  // ==========================================================

  return {
    alerts,
    allAlerts,
    filteredAlerts,
    activeAlerts,
    summary,
    filters,
    pagination: {
      ...pagination,
      page: safePage,
    },
    total,
    totalPages,
    loading,
    syncing,
    error,

    fetchAlerts,
    refreshAlerts,
    syncAlerts,

    acknowledgeAlert,
    resolveAlert,

    updateFilters,
    resetFilters,
    setPage,
    setPageSize,
    getAlertById,

    markAsAcknowledged,
    markAsResolved,
  };
}
