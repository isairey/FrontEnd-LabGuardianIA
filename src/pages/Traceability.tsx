
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Activity,
  ArrowDownUp,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileSearch,
  FlaskConical,
  History,
  RefreshCw,
  Search,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import axios from "axios";

import PageContainer from "../components/layout/PageContainer";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import SearchInput from "../components/common/SearchInput";
import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingSpinner from "../components/common/LoadingSpinner";
import TraceabilityTimeline from "../components/traceability/TraceabilityTimeline";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1"
).replace(/\/$/, "");

const TRACEABILITY_ENDPOINT = `${API_BASE_URL}/api/traceability`;
const SAMPLES_ENDPOINT = `${API_BASE_URL}/api/samples`;

type TraceabilityStatus =
  | "completed"
  | "processing"
  | "pending"
  | "unknown";

interface TraceabilitySample {
  id: number;
  code: string;
  sample_type: string;
  laboratory_area: string | null;
  status: string;
  priority?: string | null;
  created_at: string;
  updated_at?: string;
  risk_level?: string | null;
  risk_score?: number | null;
  anomaly_detected?: boolean;
}

interface TraceabilityEvent {
  id: number;
  sample_id: number;
  event_type: string;
  title: string;
  description?: string | null;
  status?: string | null;
  severity?: string | null;
  temperature?: number | null;
  duration_minutes?: number | null;
  location?: string | null;
  performed_by?: string | null;
  equipment_id?: number | null;
  equipment_name?: string | null;
  event_metadata?: Record<string, unknown> | null;
  occurred_at: string;
  created_at?: string;
}

interface TraceabilitySummary {
  total_events: number;
  completed_samples: number;
  processing_samples: number;
  pending_samples: number;
}

interface ApiError {
  message: string;
}

function extractArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];

  if (!payload || typeof payload !== "object") return [];

  const data = payload as Record<string, unknown>;

  for (const key of ["items", "results", "events", "samples", "data"]) {
    if (Array.isArray(data[key])) {
      return data[key] as T[];
    }
  }

  return [];
}

function getStatus(status: string): TraceabilityStatus {
  const normalized = status.toLowerCase();

  if (["completed", "complete", "finalizado", "completado"].includes(normalized)) {
    return "completed";
  }

  if (["processing", "in_progress", "procesando", "en_proceso"].includes(normalized)) {
    return "processing";
  }

  if (["pending", "received", "pending_review", "pendiente", "recibido"].includes(normalized)) {
    return "pending";
  }

  return "unknown";
}

function formatDate(value?: string): string {
  if (!value) return "Sin fecha";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "No fue posible conectar con el servidor."
    );
  }

  if (error instanceof Error) return error.message;

  return "Ocurrió un error inesperado.";
}

export default function Traceability() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [samples, setSamples] = useState<TraceabilitySample[]>([]);
  const [events, setEvents] = useState<TraceabilityEvent[]>([]);
  const [summary, setSummary] = useState<TraceabilitySummary>({
    total_events: 0,
    completed_samples: 0,
    processing_samples: 0,
    pending_samples: 0,
  });

  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSampleId, setSelectedSampleId] = useState<number | null>(
    Number(searchParams.get("sample")) || null
  );

  const selectedSample = useMemo(
    () => samples.find((sample) => sample.id === selectedSampleId) || null,
    [samples, selectedSampleId]
  );

  const fetchSamples = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(SAMPLES_ENDPOINT, {
        params: { limit: 500 },
      });

      const result = extractArray<TraceabilitySample>(response.data);

      setSamples(result);

      const completed = result.filter(
        (sample) => getStatus(sample.status) === "completed"
      ).length;

      const processing = result.filter(
        (sample) => getStatus(sample.status) === "processing"
      ).length;

      const pending = result.filter(
        (sample) => getStatus(sample.status) === "pending"
      ).length;

      setSummary((previous) => ({
        ...previous,
        completed_samples: completed,
        processing_samples: processing,
        pending_samples: pending,
      }));

      if (
        selectedSampleId &&
        !result.some((sample) => sample.id === selectedSampleId)
      ) {
        setSelectedSampleId(null);
      }
    } catch (requestError) {
      setError({ message: getErrorMessage(requestError) });
    } finally {
      setLoading(false);
    }
  }, [selectedSampleId]);

  const fetchEvents = useCallback(async () => {
    try {
      setEventsLoading(true);
      setEventsError(null);

      const response = await axios.get(TRACEABILITY_ENDPOINT, {
        params: selectedSampleId
          ? { sample_id: selectedSampleId, limit: 500 }
          : { limit: 500 },
      });

      const result = extractArray<TraceabilityEvent>(response.data);

      setEvents(result);

      const apiSummary = (
        response.data as Record<string, unknown>
      )?.summary as Partial<TraceabilitySummary> | undefined;

      if (apiSummary) {
        setSummary((previous) => ({
          ...previous,
          total_events: apiSummary.total_events ?? result.length,
        }));
      } else {
        setSummary((previous) => ({
          ...previous,
          total_events: result.length,
        }));
      }
    } catch (requestError) {
      setEvents([]);
      setEventsError(getErrorMessage(requestError));
    } finally {
      setEventsLoading(false);
    }
  }, [selectedSampleId]);

  useEffect(() => {
    void fetchSamples();
  }, [fetchSamples]);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (selectedSampleId) {
      setSearchParams({ sample: String(selectedSampleId) });
    } else {
      setSearchParams({});
    }
  }, [selectedSampleId, setSearchParams]);

  const filteredSamples = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return samples.filter((sample) => {
      const matchesSearch =
        !normalizedSearch ||
        sample.code.toLowerCase().includes(normalizedSearch) ||
        sample.sample_type.toLowerCase().includes(normalizedSearch) ||
        (sample.laboratory_area || "").toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        getStatus(sample.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [samples, search, statusFilter]);

  const filteredEvents = useMemo(() => {
    if (!selectedSampleId) return events;

    return events.filter(
      (event) => event.sample_id === selectedSampleId
    );
  }, [events, selectedSampleId]);

  const handleSelectSample = (sample: TraceabilitySample) => {
    setSelectedSampleId(sample.id);
  };

  const handleClearSelection = () => {
    setSelectedSampleId(null);
  };

  const handleRefresh = async () => {
    await fetchSamples();
    await fetchEvents();
  };

  const handleExport = () => {
    if (filteredEvents.length === 0) return;

    const headers = [
      "ID",
      "ID de muestra",
      "Tipo de evento",
      "Título",
      "Descripción",
      "Estado",
      "Severidad",
      "Temperatura",
      "Ubicación",
      "Responsable",
      "Fecha del evento",
    ];

    const rows = filteredEvents.map((event) => [
      event.id,
      event.sample_id,
      event.event_type,
      event.title,
      event.description || "",
      event.status || "",
      event.severity || "",
      event.temperature ?? "",
      event.location || "",
      event.performed_by || "",
      event.occurred_at,
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = selectedSample
      ? `trazabilidad-${selectedSample.code}.csv`
      : "trazabilidad-labguardian.csv";

    link.click();
    URL.revokeObjectURL(url);
  };

  const totalSamples = samples.length;

  return (
    <PageContainer
      title="Trazabilidad"
      description="Seguimiento integral del ciclo de vida de las muestras del laboratorio."
      eyebrow="CONTROL Y SEGUIMIENTO"
      actions={
        <div className="traceability-page__header-actions">
          <Button
            variant="outline"
            leftIcon={<Download size={16} />}
            onClick={handleExport}
            disabled={filteredEvents.length === 0}
          >
            Exportar historial
          </Button>

          <Button
            variant="primary"
            leftIcon={<RefreshCw size={16} />}
            onClick={handleRefresh}
            loading={loading || eventsLoading}
          >
            Actualizar
          </Button>
        </div>
      }
    >
      <div className="traceability-page">
        <div className="traceability-page__stats">
          <Card className="traceability-page__stat-card">
            <div className="traceability-page__stat-icon traceability-page__stat-icon--blue">
              <Workflow size={20} />
            </div>
            <div>
              <span>Total de muestras</span>
              <strong>{loading ? "—" : totalSamples}</strong>
              <small>Registradas en el sistema</small>
            </div>
          </Card>

          <Card className="traceability-page__stat-card">
            <div className="traceability-page__stat-icon traceability-page__stat-icon--green">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <span>Completadas</span>
              <strong>{loading ? "—" : summary.completed_samples}</strong>
              <small>Procesamiento finalizado</small>
            </div>
          </Card>

          <Card className="traceability-page__stat-card">
            <div className="traceability-page__stat-icon traceability-page__stat-icon--orange">
              <Activity size={20} />
            </div>
            <div>
              <span>En procesamiento</span>
              <strong>{loading ? "—" : summary.processing_samples}</strong>
              <small>En etapas de laboratorio</small>
            </div>
          </Card>

          <Card className="traceability-page__stat-card">
            <div className="traceability-page__stat-icon traceability-page__stat-icon--purple">
              <History size={20} />
            </div>
            <div>
              <span>Eventos registrados</span>
              <strong>{eventsLoading ? "—" : summary.total_events}</strong>
              <small>Registros de trazabilidad</small>
            </div>
          </Card>
        </div>

        {error && (
          <ErrorMessage
            title="No se pudieron cargar las muestras"
            message={error.message}
            onRetry={fetchSamples}
          />
        )}

        <div className="traceability-page__workspace">
          <Card
            className="traceability-page__samples-card"
            title="Muestras registradas"
            description="Selecciona una muestra para consultar su historial."
            headerIcon={<FlaskConical size={18} />}
            actions={
              <Badge variant="info">
                {filteredSamples.length} registros
              </Badge>
            }
          >
            <div className="traceability-page__filters">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Buscar muestra..."
                size="md"
              />

              <select
                className="traceability-page__status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="completed">Completadas</option>
                <option value="processing">En procesamiento</option>
                <option value="pending">Pendientes</option>
              </select>
            </div>

            <div className="traceability-page__sample-list">
              {loading ? (
                <LoadingSpinner
                  centered
                  text="Cargando muestras..."
                  size="md"
                />
              ) : filteredSamples.length === 0 ? (
                <EmptyState
                  title="No hay muestras disponibles"
                  description="No se encontraron muestras con los criterios seleccionados."
                  icon={FileSearch}
                  size="sm"
                />
              ) : (
                filteredSamples.map((sample) => {
                  const selected = selectedSampleId === sample.id;
                  const status = getStatus(sample.status);

                  return (
                    <button
                      key={sample.id}
                      type="button"
                      className={`traceability-page__sample-item ${
                        selected
                          ? "traceability-page__sample-item--selected"
                          : ""
                      }`}
                      onClick={() => handleSelectSample(sample)}
                    >
                      <div className="traceability-page__sample-icon">
                        <FlaskConical size={18} />
                      </div>

                      <div className="traceability-page__sample-info">
                        <strong>{sample.code}</strong>
                        <span>{sample.sample_type}</span>
                        <small>
                          {sample.laboratory_area || "Área no especificada"}
                        </small>
                      </div>

                      <div className="traceability-page__sample-meta">
                        <Badge
                          variant={
                            status === "completed"
                              ? "success"
                              : status === "processing"
                                ? "warning"
                                : status === "pending"
                                  ? "info"
                                  : "neutral"
                          }
                          size="sm"
                        >
                          {status === "completed"
                            ? "Completada"
                            : status === "processing"
                              ? "En proceso"
                              : status === "pending"
                                ? "Pendiente"
                                : sample.status}
                        </Badge>

                        <ChevronRightIcon selected={selected} />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>

          <div className="traceability-page__history">
            <Card
              title="Historial de trazabilidad"
              description={
                selectedSample
                  ? `Seguimiento de ${selectedSample.code}`
                  : "Historial general de eventos registrados."
              }
              headerIcon={<History size={18} />}
              actions={
                selectedSample ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearSelection}
                  >
                    Ver todas
                  </Button>
                ) : (
                  <Badge variant="success" dot>
                    Historial general
                  </Badge>
                )
              }
            >
              {selectedSample && (
                <div className="traceability-page__selected-sample">
                  <div className="traceability-page__selected-icon">
                    <FlaskConical size={21} />
                  </div>

                  <div className="traceability-page__selected-info">
                    <strong>{selectedSample.code}</strong>
                    <span>{selectedSample.sample_type}</span>
                    <small>
                      {selectedSample.laboratory_area ||
                        "Área no especificada"}
                    </small>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Eye size={15} />}
                    onClick={() =>
                      navigate(`/samples/${selectedSample.id}`)
                    }
                  >
                    Ver muestra
                  </Button>
                </div>
              )}

              {eventsError ? (
                <ErrorMessage
                  title="No se pudo cargar el historial"
                  message={eventsError}
                  onRetry={fetchEvents}
                />
              ) : (
                <TraceabilityTimeline
                  events={filteredEvents}
                  loading={eventsLoading}
                  onRetry={fetchEvents}
                  onRefresh={fetchEvents}
                  sampleCode={selectedSample?.code}
                  showSummary
                  showSearch
                  showFilters
                  showRefresh
                  showEventIndex
                  initialSortOrder="asc"
                  maxEvents={100}
                />
              )}

              {!eventsLoading &&
                !eventsError &&
                filteredEvents.length === 0 && (
                  <div className="traceability-page__empty-history">
                    <EmptyState
                      title="Sin eventos registrados"
                      description={
                        selectedSample
                          ? "Esta muestra todavía no cuenta con eventos de trazabilidad."
                          : "Aún no existen eventos registrados en el sistema."
                      }
                      icon={History}
                      size="md"
                    />
                  </div>
                )}
            </Card>
          </div>
        </div>

        <div className="traceability-page__footer">
          <div>
            <ShieldCheck size={17} />
            <span>
              Los registros de trazabilidad permiten consultar el historial
              de las muestras.
            </span>
          </div>

          <span>
            <CalendarDays size={14} />
            {formatDate(new Date().toISOString())}
          </span>
        </div>
      </div>
    </PageContainer>
  );
}

function ChevronRightIcon({ selected }: { selected: boolean }) {
  return (
    <span
      className={`traceability-page__chevron ${
        selected ? "traceability-page__chevron--selected" : ""
      }`}
    >
      <ArrowDownUp size={15} />
    </span>
  );
}
