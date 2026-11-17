
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Search,
} from "lucide-react";

import Card from "../common/Card";
import Button from "../common/Button";
import SearchInput from "../common/SearchInput";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";
import LoadingSpinner from "../common/LoadingSpinner";
import SampleRiskBadge from "./SampleRiskBadge";
import SampleStatusBadge from "./SampleStatusBadge";

export interface SampleTableData {
  id: number;
  code: string;
  sample_type: string;
  laboratory_area: string | null;
  priority?: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
  risk_score?: number | null;
  risk_level?: string | null;
  anomaly_detected?: boolean;
  storage_location?: string | null;
  temperature?: number | null;
  duration?: number | null;
}

type SortField =
  | "code"
  | "sample_type"
  | "laboratory_area"
  | "status"
  | "created_at"
  | "risk_score";

type SortDirection = "asc" | "desc";

interface SampleTableProps {
  samples: SampleTableData[];
  loading?: boolean;
  error?: string | null;

  onRetry?: () => void;
  onView?: (sample: SampleTableData) => void;
  onEdit?: (sample: SampleTableData) => void;
  onDelete?: (sample: SampleTableData) => void;
  onRefresh?: () => void;

  title?: string;
  description?: string;
  pageSize?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
  showActions?: boolean;
  showRiskScore?: boolean;
  showAnomaly?: boolean;
  emptyMessage?: string;
  toolbarActions?: ReactNode;
  className?: string;
}

const formatDate = (value?: string | null): string => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const normalize = (value?: string | null): string =>
  (value ?? "").trim().toLowerCase();

const getPriorityLabel = (priority?: string | null): string => {
  const labels: Record<string, string> = {
    low: "Baja",
    normal: "Normal",
    high: "Alta",
    urgent: "Urgente",
    baja: "Baja",
    media: "Media",
    alta: "Alta",
    urgente: "Urgente",
  };

  return priority ? labels[normalize(priority)] ?? priority : "—";
};

const getPriorityClass = (priority?: string | null): string => {
  const value = normalize(priority);

  if (["urgent", "urgente"].includes(value)) {
    return "sample-table__priority--urgent";
  }

  if (["high", "alta"].includes(value)) {
    return "sample-table__priority--high";
  }

  if (["low", "baja"].includes(value)) {
    return "sample-table__priority--low";
  }

  return "sample-table__priority--normal";
};

export default function SampleTable({
  samples,
  loading = false,
  error = null,
  onRetry,
  onView,
  onEdit,
  onDelete,
  onRefresh,
  title = "Muestras registradas",
  description = "Consulta y administra las muestras del laboratorio.",
  pageSize = 10,
  showSearch = true,
  showFilters = true,
  showPagination = true,
  showActions = true,
  showRiskScore = true,
  showAnomaly = true,
  emptyMessage = "No se encontraron muestras.",
  toolbarActions,
  className = "",
}: SampleTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const areas = useMemo(
    () =>
      Array.from(
        new Set(
          samples
            .map((sample) => sample.laboratory_area)
            .filter((area): area is string => Boolean(area)),
        ),
      ).sort((a, b) => a.localeCompare(b, "es")),
    [samples],
  );

  const filteredSamples = useMemo(() => {
    const filtered = samples.filter((sample) => {
      const searchValue = normalize(search);

      const matchesSearch =
        !searchValue ||
        [
          sample.code,
          sample.sample_type,
          sample.laboratory_area,
          sample.storage_location,
        ].some((value) => normalize(value).includes(searchValue));

      const matchesStatus =
        !statusFilter ||
        normalize(sample.status) === normalize(statusFilter);

      const matchesRisk =
        !riskFilter ||
        normalize(sample.risk_level) === normalize(riskFilter);

      const matchesArea =
        !areaFilter ||
        normalize(sample.laboratory_area) === normalize(areaFilter);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRisk &&
        matchesArea
      );
    });

    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortField === "risk_score") {
        comparison =
          (a.risk_score ?? -1) - (b.risk_score ?? -1);
      } else if (sortField === "created_at") {
        comparison =
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime();
      } else {
        comparison = String(a[sortField] ?? "").localeCompare(
          String(b[sortField] ?? ""),
          "es",
          { numeric: true, sensitivity: "base" },
        );
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    samples,
    search,
    statusFilter,
    riskFilter,
    areaFilter,
    sortField,
    sortDirection,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSamples.length / Math.max(1, pageSize)),
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedSamples = useMemo(() => {
    if (!showPagination) return filteredSamples;

    const start = (safePage - 1) * Math.max(1, pageSize);

    return filteredSamples.slice(start, start + Math.max(1, pageSize));
  }, [filteredSamples, safePage, pageSize, showPagination]);

  const hasActiveFilters =
    Boolean(search || statusFilter || riskFilter || areaFilter);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setRiskFilter("");
    setAreaFilter("");
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((previous) =>
        previous === "asc" ? "desc" : "asc",
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }

    setCurrentPage(1);
  };

  const renderSortButton = (field: SortField, label: string) => (
    <button
      type="button"
      className="sample-table__sort-button"
      onClick={() => handleSort(field)}
      aria-label={`Ordenar por ${label}`}
    >
      {label}
      <ArrowUpDown
        size={13}
        className={
          sortField === field
            ? "sample-table__sort-icon--active"
            : ""
        }
      />
    </button>
  );

  const firstItem =
    filteredSamples.length === 0
      ? 0
      : (safePage - 1) * Math.max(1, pageSize) + 1;

  const lastItem = showPagination
    ? Math.min(safePage * Math.max(1, pageSize), filteredSamples.length)
    : filteredSamples.length;

  return (
    <Card
      title={title}
      description={description}
      className={`sample-table-card ${className}`.trim()}
      actions={
        <div className="sample-table__header-actions">
          {toolbarActions}

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={14} />}
              onClick={onRefresh}
              disabled={loading}
            >
              Actualizar
            </Button>
          )}
        </div>
      }
    >
      <div className="sample-table">
        {(showSearch || showFilters) && (
          <div className="sample-table__toolbar">
            {showSearch && (
              <div className="sample-table__search">
                <SearchInput
                  value={search}
                  onChange={(value) => {
                    setSearch(value);
                    setCurrentPage(1);
                  }}
                  placeholder="Buscar por código, tipo o ubicación..."
                  size="md"
                />
              </div>
            )}

            {showFilters && (
              <div className="sample-table__filters">
                <select
                  aria-label="Filtrar por estado"
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="received">Recibida</option>
                  <option value="processing">En procesamiento</option>
                  <option value="completed">Completada</option>
                  <option value="rejected">Rechazada</option>
                </select>

                <select
                  aria-label="Filtrar por riesgo"
                  value={riskFilter}
                  onChange={(event) => {
                    setRiskFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Todos los riesgos</option>
                  <option value="normal">Normal</option>
                  <option value="low">Bajo</option>
                  <option value="medium">Medio</option>
                  <option value="high">Alto</option>
                  <option value="critical">Crítico</option>
                </select>

                <select
                  aria-label="Filtrar por área"
                  value={areaFilter}
                  onChange={(event) => {
                    setAreaFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Todas las áreas</option>

                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>

                {hasActiveFilters && (
                  <button
                    type="button"
                    className="sample-table__clear-filters"
                    onClick={resetFilters}
                  >
                    Limpiar
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {error ? (
          <div className="sample-table__feedback">
            <ErrorMessage
              title="No se pudieron cargar las muestras"
              message={error}
              onRetry={onRetry}
            />
          </div>
        ) : loading ? (
          <div className="sample-table__loading">
            <LoadingSpinner
              size="lg"
              text="Cargando muestras..."
              centered
            />
          </div>
        ) : paginatedSamples.length === 0 ? (
          <div className="sample-table__empty">
            <EmptyState
              title={
                hasActiveFilters
                  ? "Sin resultados"
                  : "No hay muestras registradas"
              }
              description={
                hasActiveFilters
                  ? "Prueba modificando los filtros de búsqueda."
                  : emptyMessage
              }
              icon={FlaskConical}
              action={
                hasActiveFilters
                  ? {
                      label: "Limpiar filtros",
                      onClick: resetFilters,
                    }
                  : undefined
              }
            />
          </div>
        ) : (
          <div className="sample-table__scroll">
            <table className="sample-table__table">
              <thead>
                <tr>
                  <th>{renderSortButton("code", "Muestra")}</th>
                  <th>{renderSortButton("sample_type", "Tipo")}</th>
                  <th>{renderSortButton("laboratory_area", "Área")}</th>
                  <th>{renderSortButton("status", "Estado")}</th>

                  {showRiskScore && (
                    <th>{renderSortButton("risk_score", "Riesgo")}</th>
                  )}

                  <th>{renderSortButton("created_at", "Fecha de registro")}</th>

                  {showAnomaly && <th>Anomalías</th>}

                  {showActions && <th className="sample-table__actions-heading">Acciones</th>}
                </tr>
              </thead>

              <tbody>
                {paginatedSamples.map((sample) => (
                  <tr key={sample.id}>
                    <td>
                      <div className="sample-table__sample">
                        <div className="sample-table__sample-icon">
                          <FlaskConical size={16} />
                        </div>

                        <div className="sample-table__sample-info">
                          <button
                            type="button"
                            className="sample-table__code"
                            onClick={() => onView?.(sample)}
                            disabled={!onView}
                          >
                            {sample.code}
                          </button>

                          <span>#{sample.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="sample-table__type">
                        {sample.sample_type || "—"}
                      </span>

                      {sample.priority && (
                        <span
                          className={`sample-table__priority ${getPriorityClass(
                            sample.priority,
                          )}`}
                        >
                          {getPriorityLabel(sample.priority)}
                        </span>
                      )}
                    </td>

                    <td>
                      <span className="sample-table__area">
                        {sample.laboratory_area || "Sin clasificar"}
                      </span>
                    </td>

                    <td>
                      <SampleStatusBadge
                        status={sample.status}
                        size="sm"
                      />
                    </td>

                    {showRiskScore && (
                      <td>
                        <div className="sample-table__risk">
                          <SampleRiskBadge
                            level={sample.risk_level}
                            score={sample.risk_score}
                            size="sm"
                            showScore
                          />
                        </div>
                      </td>
                    )}

                    <td>
                      <span className="sample-table__date">
                        {formatDate(sample.created_at)}
                      </span>
                    </td>

                    {showAnomaly && (
                      <td>
                        {sample.anomaly_detected ? (
                          <span className="sample-table__anomaly sample-table__anomaly--detected">
                            <span />
                            Detectada
                          </span>
                        ) : (
                          <span className="sample-table__anomaly sample-table__anomaly--clear">
                            Sin anomalías
                          </span>
                        )}
                      </td>
                    )}

                    {showActions && (
                      <td>
                        <div className="sample-table__row-actions">
                          {onView && (
                            <button
                              type="button"
                              className="sample-table__action"
                              title="Ver muestra"
                              aria-label={`Ver muestra ${sample.code}`}
                              onClick={() => onView(sample)}
                            >
                              <Eye size={16} />
                            </button>
                          )}

                          {onEdit && (
                            <button
                              type="button"
                              className="sample-table__action"
                              title="Editar muestra"
                              aria-label={`Editar muestra ${sample.code}`}
                              onClick={() => onEdit(sample)}
                            >
                              <Pencil size={15} />
                            </button>
                          )}

                          {onDelete && (
                            <button
                              type="button"
                              className="sample-table__action sample-table__action--delete"
                              title="Eliminar muestra"
                              aria-label={`Eliminar muestra ${sample.code}`}
                              onClick={() => onDelete(sample)}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && filteredSamples.length > 0 && (
          <div className="sample-table__footer">
            <span className="sample-table__results">
              Mostrando <strong>{firstItem}-{lastItem}</strong> de{" "}
              <strong>{filteredSamples.length}</strong> muestras
            </span>

            {showPagination && totalPages > 1 && (
              <div className="sample-table__pagination">
                <button
                  type="button"
                  className="sample-table__page-button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={safePage <= 1}
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={17} />
                </button>

                <span>
                  Página <strong>{safePage}</strong> de{" "}
                  <strong>{totalPages}</strong>
                </span>

                <button
                  type="button"
                  className="sample-table__page-button"
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages, page + 1),
                    )
                  }
                  disabled={safePage >= totalPages}
                  aria-label="Página siguiente"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
