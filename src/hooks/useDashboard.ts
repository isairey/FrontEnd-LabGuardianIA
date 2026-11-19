
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import type { AlertDetailData } from "../components/alerts/AlertDetails";
import type { RecentSampleData } from "../components/dashboard/RecentSamples";
import type { LaboratoryAreaData } from "../components/dashboard/LaboratoryAreasChart";
import type { RiskDistributionData } from "../components/dashboard/RiskDistributionChart";

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
}

export interface DashboardRiskData {
  level: string;
  count: number;
  percentage?: number;
}

export interface DashboardRecentAlert extends AlertDetailData {
  id: number;
}

export interface DashboardRecentSample extends RecentSampleData {
  id: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  risks: RiskDistributionData[];
  areas: LaboratoryAreaData[];
  recentAlerts: AlertDetailData[];
  recentSamples: RecentSampleData[];
}

export interface DashboardLoadingState {
  summary: boolean;
  risks: boolean;
  areas: boolean;
  recentAlerts: boolean;
  recentSamples: boolean;
}

export interface DashboardErrors {
  summary: string | null;
  risks: string | null;
  areas: string | null;
  recentAlerts: string | null;
  recentSamples: string | null;
}

export interface UseDashboardOptions {
  autoFetch?: boolean;
  recentSamplesLimit?: number;
  recentAlertsLimit?: number;
}

export interface UseDashboardReturn {
  data: DashboardData;
  summary: DashboardSummary;
  risks: RiskDistributionData[];
  areas: LaboratoryAreaData[];
  recentAlerts: AlertDetailData[];
  recentSamples: RecentSampleData[];

  loading: boolean;
  loadingState: DashboardLoadingState;
  errors: DashboardErrors;
  error: string | null;

  fetchDashboard: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  fetchRisks: () => Promise<void>;
  fetchAreas: () => Promise<void>;
  fetchRecentAlerts: () => Promise<void>;
  fetchRecentSamples: () => Promise<void>;
}

// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1"
).replace(/\/$/, "");

const DASHBOARD_ENDPOINT = `${API_BASE_URL}/api/dashboard`;

const api = axios.create({
  baseURL: DASHBOARD_ENDPOINT,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

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
  completed_samples: 0,
  processing_samples: 0,
  pending_samples: 0,
  rejected_samples: 0,
};

const EMPTY_LOADING: DashboardLoadingState = {
  summary: false,
  risks: false,
  areas: false,
  recentAlerts: false,
  recentSamples: false,
};

const EMPTY_ERRORS: DashboardErrors = {
  summary: null,
  risks: null,
  areas: null,
  recentAlerts: null,
  recentSamples: null,
};

const EMPTY_DATA: DashboardData = {
  summary: EMPTY_SUMMARY,
  risks: [],
  areas: [],
  recentAlerts: [],
  recentSamples: [],
};

// ============================================================
// HELPERS
// ============================================================

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    return (
      error.response?.data?.message ||
      error.message ||
      "No se pudo conectar con el servidor."
    );
  }

  return error instanceof Error
    ? error.message
    : "Ocurrió un error inesperado.";
};

const extractArray = <T,>(response: unknown): T[] => {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const data = response as Record<string, unknown>;

  if (Array.isArray(data.items)) {
    return data.items as T[];
  }

  if (Array.isArray(data.results)) {
    return data.results as T[];
  }

  if (Array.isArray(data.data)) {
    return data.data as T[];
  }

  if (Array.isArray(data.alerts)) {
    return data.alerts as T[];
  }

  if (Array.isArray(data.samples)) {
    return data.samples as T[];
  }

  if (Array.isArray(data.areas)) {
    return data.areas as T[];
  }

  return [];
};

const normalizeSummary = (
  response: unknown,
): DashboardSummary => {
  if (!response || typeof response !== "object") {
    return { ...EMPTY_SUMMARY };
  }

  const raw = response as Record<string, unknown>;

  const numberValue = (
    ...keys: string[]
  ): number => {
    for (const key of keys) {
      const value = raw[key];

      if (value !== undefined && value !== null) {
        const parsed = Number(value);

        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
    }

    return 0;
  };

  return {
    total_samples: numberValue(
      "total_samples",
      "total",
    ),
    normal_samples: numberValue(
      "normal_samples",
      "normal",
    ),
    low_risk_samples: numberValue(
      "low_risk_samples",
      "low_risk",
      "low",
    ),
    medium_risk_samples: numberValue(
      "medium_risk_samples",
      "medium_risk",
      "medium",
    ),
    high_risk_samples: numberValue(
      "high_risk_samples",
      "high_risk",
      "high",
    ),
    critical_risk_samples: numberValue(
      "critical_risk_samples",
      "critical_risk",
      "critical",
    ),
    active_alerts: numberValue(
      "active_alerts",
      "total_active_alerts",
    ),
    average_risk: numberValue(
      "average_risk",
      "average_risk_score",
    ),
    completed_samples: numberValue(
      "completed_samples",
      "completed",
    ),
    processing_samples: numberValue(
      "processing_samples",
      "processing",
    ),
    pending_samples: numberValue(
      "pending_samples",
      "pending",
    ),
    rejected_samples: numberValue(
      "rejected_samples",
      "rejected",
    ),
  };
};

const normalizeRiskData = (
  response: unknown,
  summary: DashboardSummary,
): RiskDistributionData[] => {
  const rawData = extractArray<Record<string, unknown>>(response);

  if (rawData.length > 0) {
    return rawData.map((item) => ({
      level: String(
        item.level ??
        item.risk_level ??
        item.name ??
        "unknown",
      ),
      label: item.label
        ? String(item.label)
        : undefined,
      count: Number(item.count ?? item.total ?? 0),
      percentage:
        item.percentage !== undefined
          ? Number(item.percentage)
          : undefined,
    }));
  }

  return [
    { level: "normal", label: "Normal", count: summary.normal_samples },
    { level: "low", label: "Bajo", count: summary.low_risk_samples },
    { level: "medium", label: "Medio", count: summary.medium_risk_samples },
    { level: "high", label: "Alto", count: summary.high_risk_samples },
    {
      level: "critical",
      label: "Crítico",
      count: summary.critical_risk_samples,
    },
  ];
};

const normalizeAreas = (response: unknown): LaboratoryAreaData[] => {
  return extractArray<Record<string, unknown>>(response).map((item) => ({
    area: String(
      item.area ??
      item.laboratory_area ??
      item.name ??
      "Sin clasificar",
    ),
    total_samples: Number(
      item.total_samples ??
      item.total ??
      item.count ??
      0,
    ),
    high_risk_samples: Number(
      item.high_risk_samples ??
      item.high_risk ??
      0,
    ),
    average_risk:
      item.average_risk !== undefined
        ? Number(item.average_risk)
        : undefined,
  }));
};

const normalizeRecentSamples = (
  response: unknown,
  limit: number,
): RecentSampleData[] => {
  return extractArray<RecentSampleData>(response)
    .slice(0, limit);
};

const normalizeRecentAlerts = (
  response: unknown,
  limit: number,
): AlertDetailData[] => {
  return extractArray<AlertDetailData>(response)
    .slice(0, limit);
};

// ============================================================
// HOOK
// ============================================================

export default function useDashboard(
  options: UseDashboardOptions = {},
): UseDashboardReturn {
  const {
    autoFetch = true,
    recentSamplesLimit = 5,
    recentAlertsLimit = 5,
  } = options;

  const [data, setData] = useState<DashboardData>(EMPTY_DATA);

  const [loadingState, setLoadingState] =
    useState<DashboardLoadingState>(EMPTY_LOADING);

  const [errors, setErrors] =
    useState<DashboardErrors>(EMPTY_ERRORS);

  // ==========================================================
  // LOADING HELPERS
  // ==========================================================

  const updateLoading = useCallback(
    (key: keyof DashboardLoadingState, value: boolean) => {
      setLoadingState((previous) => ({
        ...previous,
        [key]: value,
      }));
    },
    [],
  );

  const updateError = useCallback(
    (key: keyof DashboardErrors, value: string | null) => {
      setErrors((previous) => ({
        ...previous,
        [key]: value,
      }));
    },
    [],
  );

  // ==========================================================
  // FETCH SUMMARY
  // ==========================================================

  const fetchSummary = useCallback(async () => {
    updateLoading("summary", true);
    updateError("summary", null);

    try {
      const response = await api.get("/summary");

      const summary = normalizeSummary(response.data);

      setData((previous) => ({
        ...previous,
        summary,
        risks: previous.risks.length
          ? previous.risks
          : normalizeRiskData(null, summary),
      }));
    } catch (err) {
      updateError("summary", getErrorMessage(err));
    } finally {
      updateLoading("summary", false);
    }
  }, [updateLoading, updateError]);

  // ==========================================================
  // FETCH RISKS
  // ==========================================================

  const fetchRisks = useCallback(async () => {
    updateLoading("risks", true);
    updateError("risks", null);

    try {
      const response = await api.get("/risks");

      setData((previous) => ({
        ...previous,
        risks: normalizeRiskData(
          response.data,
          previous.summary,
        ),
      }));
    } catch (err) {
      updateError("risks", getErrorMessage(err));
    } finally {
      updateLoading("risks", false);
    }
  }, [updateLoading, updateError]);

  // ==========================================================
  // FETCH AREAS
  // ==========================================================

  const fetchAreas = useCallback(async () => {
    updateLoading("areas", true);
    updateError("areas", null);

    try {
      const response = await api.get("/areas");

      setData((previous) => ({
        ...previous,
        areas: normalizeAreas(response.data),
      }));
    } catch (err) {
      updateError("areas", getErrorMessage(err));
    } finally {
      updateLoading("areas", false);
    }
  }, [updateLoading, updateError]);

  // ==========================================================
  // FETCH RECENT ALERTS
  // ==========================================================

  const fetchRecentAlerts = useCallback(async () => {
    updateLoading("recentAlerts", true);
    updateError("recentAlerts", null);

    try {
      const response = await api.get("/recent-alerts", {
        params: {
          limit: recentAlertsLimit,
        },
      });

      setData((previous) => ({
        ...previous,
        recentAlerts: normalizeRecentAlerts(
          response.data,
          recentAlertsLimit,
        ),
      }));
    } catch (err) {
      updateError("recentAlerts", getErrorMessage(err));
    } finally {
      updateLoading("recentAlerts", false);
    }
  }, [
    recentAlertsLimit,
    updateLoading,
    updateError,
  ]);

  // ==========================================================
  // FETCH RECENT SAMPLES
  // ==========================================================

  const fetchRecentSamples = useCallback(async () => {
    updateLoading("recentSamples", true);
    updateError("recentSamples", null);

    try {
      const response = await api.get("/", {
        params: {
          limit: recentSamplesLimit,
        },
      });

      const rawData = extractArray<RecentSampleData>(
        response.data,
      );

      setData((previous) => ({
        ...previous,
        recentSamples: normalizeRecentSamples(
          rawData,
          recentSamplesLimit,
        ),
      }));
    } catch (err) {
      updateError("recentSamples", getErrorMessage(err));
    } finally {
      updateLoading("recentSamples", false);
    }
  }, [
    recentSamplesLimit,
    updateLoading,
    updateError,
  ]);

  // ==========================================================
  // FETCH COMPLETE DASHBOARD
  // ==========================================================

  const fetchDashboard = useCallback(async () => {
    await Promise.all([
      fetchSummary(),
      fetchRisks(),
      fetchAreas(),
      fetchRecentAlerts(),
      fetchRecentSamples(),
    ]);
  }, [
    fetchSummary,
    fetchRisks,
    fetchAreas,
    fetchRecentAlerts,
    fetchRecentSamples,
  ]);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const refreshDashboard = useCallback(async () => {
    await fetchDashboard();
  }, [fetchDashboard]);

  // ==========================================================
  // DERIVED STATE
  // ==========================================================

  const loading = Object.values(loadingState).some(Boolean);

  const error =
    Object.values(errors).find(
      (message) => message !== null,
    ) ?? null;

  // ==========================================================
  // AUTO FETCH
  // ==========================================================

  useEffect(() => {
    if (autoFetch) {
      void fetchDashboard();
    }
  }, [autoFetch, fetchDashboard]);

  // ==========================================================
  // RETURN
  // ==========================================================

  return {
    data,

    summary: data.summary,
    risks: data.risks,
    areas: data.areas,
    recentAlerts: data.recentAlerts,
    recentSamples: data.recentSamples,

    loading,
    loadingState,
    errors,
    error,

    fetchDashboard,
    refreshDashboard,
    fetchSummary,
    fetchRisks,
    fetchAreas,
    fetchRecentAlerts,
    fetchRecentSamples,
  };
}
