
import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  CalendarDays,
  Clock,
  Filter,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import SampleEventCard, {
  type SampleEventData,
} from "./SampleEventCard";

export type TimelineSortOrder = "newest" | "oldest";

export interface TraceabilityTimelineProps {
  events: SampleEventData[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onRefresh?: () => void;
  onEventClick?: (event: SampleEventData) => void;
  onViewAll?: () => void;
  title?: string;
  description?: string;
  sampleCode?: string;
  compact?: boolean;
  showFilters?: boolean;
  showSearch?: boolean;
  showSummary?: boolean;
  showRefresh?: boolean;
  showEventIndex?: boolean;
  initialSortOrder?: TimelineSortOrder;
  maxEvents?: number;
  className?: string;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  reception: "Recepción",
  received: "Recepción",
  identification: "Identificación",
  temperature: "Temperatura",
  processing: "Procesamiento",
  analysis: "Análisis",
  result: "Resultados",
  completed: "Finalización",
  storage: "Almacenamiento",
  transport: "Transporte",
  maintenance: "Mantenimiento",
  observation: "Observaciones",
};

const normalize = (value?: string | null): string =>
  (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const getEventTypeLabel = (type: string): string => {
  const normalized = normalize(type);

  return EVENT_TYPE_LABELS[normalized] ?? type;
};

const getTimestamp = (date?: string | null): number => {
  if (!date) return 0;

  const timestamp = new Date(date).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const formatLastUpdate = (events: SampleEventData[]): string => {
  if (events.length === 0) return "Sin actividad";

  const latest = Math.max(
    ...events.map((event) => getTimestamp(event.occurred_at)),
  );

  if (!latest) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(latest));
};

export default function TraceabilityTimeline({
  events,
  loading = false,
  error = null,
  onRetry,
  onRefresh,
  onEventClick,
  onViewAll,
  title = "Historial de trazabilidad",
  description = "Seguimiento cronológico de las actividades de la muestra.",
  sampleCode,
  compact = false,
  showFilters = true,
  showSearch = true,
  showSummary = true,
  showRefresh = true,
  showEventIndex = true,
  initialSortOrder = "newest",
  maxEvents,
  className = "",
}: TraceabilityTimelineProps) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [sortOrder, setSortOrder] =
    useState<TimelineSortOrder>(initialSortOrder);
  const [showAll, setShowAll] = useState(false);

  const safeEvents = Array.isArray(events) ? events : [];

  const eventTypes = useMemo(() => {
    const types = new Map<string, string>();

    safeEvents.forEach((event) => {
      const normalized = normalize(event.event_type);

      if (normalized && !types.has(normalized)) {
        types.set(
          normalized,
          getEventTypeLabel(event.event_type),
        );
      }
    });

    return Array.from(types.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [safeEvents]);

  const filteredEvents = useMemo(() => {
    const normalizedSearch = normalize(search);

    const filtered = safeEvents.filter((event) => {
      const matchesType =
        selectedType === "all" ||
        normalize(event.event_type) === selectedType;

      const searchableContent = [
        event.title,
        event.description,
        event.event_type,
        event.status,
        event.performed_by,
        event.location,
        event.equipment_name,
        event.equipment_id?.toString(),
      ]
        .filter(Boolean)
        .join(" ");

      const matchesSearch =
        !normalizedSearch ||
        normalize(searchableContent).includes(normalizedSearch);

      return matchesType && matchesSearch;
    });

    return filtered.sort((a, b) => {
      const difference =
        getTimestamp(a.occurred_at) - getTimestamp(b.occurred_at);

      return sortOrder === "newest" ? -difference : difference;
    });
  }, [safeEvents, search, selectedType, sortOrder]);

  const visibleEvents = useMemo(() => {
    if (showAll || !maxEvents) {
      return filteredEvents;
    }

    return filteredEvents.slice(0, maxEvents);
  }, [filteredEvents, maxEvents, showAll]);

  const completedCount = safeEvents.filter((event) => {
    const status = normalize(event.status);

    return status === "completed" || status === "success";
  }).length;

  const pendingCount = safeEvents.filter((event) => {
    const status = normalize(event.status);

    return (
      status === "pending" ||
      status === "in_progress" ||
      status === "processing"
    );
  }).length;

  const warningCount = safeEvents.filter((event) => {
    const status = normalize(event.status);

    return (
      status === "warning" ||
      status === "failed" ||
      status === "error"
    );
  }).length;

  const handleRefresh = () => {
    onRefresh?.();
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedType("all");
    setShowAll(false);
  };

  const hasActiveFilters =
    search.trim().length > 0 || selectedType !== "all";

  return (
    <section
      className={[
        "traceability-timeline",
        compact ? "traceability-timeline--compact" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Header */}

      <div className="traceability-timeline__header">
        <div className="traceability-timeline__heading">
          <div className="traceability-timeline__heading-icon">
            <Activity size={19} />
          </div>

          <div>
            <h2 className="traceability-timeline__title">
              {title}
            </h2>

            <p className="traceability-timeline__description">
              {description}
            </p>

            {sampleCode && (
              <span className="traceability-timeline__sample-code">
                Muestra: {sampleCode}
              </span>
            )}
          </div>
        </div>

        {showRefresh && onRefresh && (
          <button
            type="button"
            className="traceability-timeline__refresh"
            onClick={handleRefresh}
            disabled={loading}
            aria-label="Actualizar historial"
            title="Actualizar historial"
          >
            <RefreshCw
              size={16}
              className={loading ? "is-spinning" : ""}
            />
            <span>Actualizar</span>
          </button>
        )}
      </div>

      {/* Summary */}

      {showSummary && (
        <div className="traceability-timeline__summary">
          <div className="traceability-timeline__summary-item">
            <div className="traceability-timeline__summary-icon traceability-timeline__summary-icon--blue">
              <CalendarDays size={17} />
            </div>

            <div>
              <strong>{safeEvents.length}</strong>
              <span>Eventos registrados</span>
            </div>
          </div>

          <div className="traceability-timeline__summary-item">
            <div className="traceability-timeline__summary-icon traceability-timeline__summary-icon--green">
              <Activity size={17} />
            </div>

            <div>
              <strong>{completedCount}</strong>
              <span>Completados</span>
            </div>
          </div>

          <div className="traceability-timeline__summary-item">
            <div className="traceability-timeline__summary-icon traceability-timeline__summary-icon--orange">
              <Clock size={17} />
            </div>

            <div>
              <strong>{pendingCount}</strong>
              <span>Pendientes</span>
            </div>
          </div>

          <div className="traceability-timeline__summary-item">
            <div className="traceability-timeline__summary-icon traceability-timeline__summary-icon--red">
              <AlertCircle size={17} />
            </div>

            <div>
              <strong>{warningCount}</strong>
              <span>Con incidencias</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}

      {showFilters && (
        <div className="traceability-timeline__toolbar">
          {showSearch && (
            <div className="traceability-timeline__search">
              <Search size={16} />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar eventos, responsables, ubicaciones..."
                aria-label="Buscar eventos"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Limpiar búsqueda"
                >
                  ×
                </button>
              )}
            </div>
          )}

          <div className="traceability-timeline__filters">
            <div className="traceability-timeline__filter-control">
              <Filter size={15} />

              <select
                value={selectedType}
                onChange={(event) => {
                  setSelectedType(event.target.value);
                  setShowAll(false);
                }}
                aria-label="Filtrar por tipo de evento"
              >
                <option value="all">Todos los eventos</option>

                {eventTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="traceability-timeline__filter-control">
              <SlidersHorizontal size={15} />

              <select
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(event.target.value as TimelineSortOrder)
                }
                aria-label="Ordenar eventos"
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguos</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="traceability-timeline__clear-filters"
              onClick={handleResetFilters}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Last update */}

      {!loading && !error && safeEvents.length > 0 && (
        <div className="traceability-timeline__last-update">
          Última actividad: {formatLastUpdate(safeEvents)}
        </div>
      )}

      {/* Loading */}

      {loading && (
        <div
          className="traceability-timeline__state"
          role="status"
          aria-live="polite"
        >
          <div className="traceability-timeline__loader" />
          <strong>Consultando trazabilidad...</strong>
          <span>Estamos recuperando los eventos de la muestra.</span>
        </div>
      )}

      {/* Error */}

      {!loading && error && (
        <div
          className="traceability-timeline__error"
          role="alert"
        >
          <div className="traceability-timeline__error-icon">
            <AlertCircle size={22} />
          </div>

          <div className="traceability-timeline__error-content">
            <strong>No se pudo cargar la trazabilidad</strong>
            <p>{error}</p>

            {onRetry && (
              <button type="button" onClick={onRetry}>
                <RefreshCw size={14} />
                Intentar nuevamente
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}

      {!loading && !error && safeEvents.length === 0 && (
        <div className="traceability-timeline__empty">
          <div className="traceability-timeline__empty-icon">
            <Activity size={28} />
          </div>

          <h3>Sin eventos registrados</h3>

          <p>
            Todavía no existen movimientos o actividades registrados
            para esta muestra.
          </p>
        </div>
      )}

      {/* No filter results */}

      {!loading &&
        !error &&
        safeEvents.length > 0 &&
        filteredEvents.length === 0 && (
          <div className="traceability-timeline__empty">
            <div className="traceability-timeline__empty-icon">
              <Search size={25} />
            </div>

            <h3>No se encontraron resultados</h3>

            <p>
              No hay eventos que coincidan con los filtros seleccionados.
            </p>

            <button
              type="button"
              className="traceability-timeline__clear-filters"
              onClick={handleResetFilters}
            >
              Limpiar filtros
            </button>
          </div>
        )}

      {/* Timeline */}

      {!loading && !error && visibleEvents.length > 0 && (
        <div className="traceability-timeline__content">
          <div className="traceability-timeline__events">
            {visibleEvents.map((event, index) => (
              <SampleEventCard
                key={event.id}
                event={event}
                index={showEventIndex ? index : undefined}
                isLast={index === visibleEvents.length - 1}
                showConnector
                compact={compact}
                onClick={onEventClick}
              />
            ))}
          </div>

          {maxEvents &&
            filteredEvents.length > maxEvents &&
            !showAll && (
              <button
                type="button"
                className="traceability-timeline__show-more"
                onClick={() => setShowAll(true)}
              >
                Mostrar todos los eventos
                <span>
                  ({filteredEvents.length - maxEvents} restantes)
                </span>
              </button>
            )}

          {showAll && maxEvents && filteredEvents.length > maxEvents && (
            <button
              type="button"
              className="traceability-timeline__show-more"
              onClick={() => setShowAll(false)}
            >
              Mostrar menos
            </button>
          )}
        </div>
      )}

      {/* Footer */}

      {!loading &&
        !error &&
        safeEvents.length > 0 &&
        onViewAll && (
          <div className="traceability-timeline__footer">
            <button
              type="button"
              onClick={onViewAll}
            >
              Ver historial completo
            </button>
          </div>
        )}
    </section>
  );
}
