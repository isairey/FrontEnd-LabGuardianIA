
import { useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
} from "lucide-react";

export type SampleRiskLevel =
  | "normal"
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "";

export interface SampleFiltersState {
  search: string;
  status: string;
  risk_level: SampleRiskLevel;
  priority: string;
  laboratory_area: string;
}

export interface SampleFilterOption {
  label: string;
  value: string;
}

interface SampleFiltersProps {
  filters: SampleFiltersState;
  onFiltersChange: (filters: SampleFiltersState) => void;
  onReset?: () => void;

  areas?: string[];
  statusOptions?: SampleFilterOption[];
  priorityOptions?: SampleFilterOption[];

  resultCount?: number;
  loading?: boolean;
  showResultCount?: boolean;
  showSearch?: boolean;
  showStatus?: boolean;
  showRiskLevel?: boolean;
  showPriority?: boolean;
  showArea?: boolean;

  title?: string;
  className?: string;
}

const DEFAULT_STATUS_OPTIONS: SampleFilterOption[] = [
  { label: "Pendiente", value: "pending" },
  { label: "Recibida", value: "received" },
  { label: "En procesamiento", value: "processing" },
  { label: "Completada", value: "completed" },
  { label: "Rechazada", value: "rejected" },
];

const DEFAULT_PRIORITY_OPTIONS: SampleFilterOption[] = [
  { label: "Baja", value: "low" },
  { label: "Normal", value: "normal" },
  { label: "Alta", value: "high" },
  { label: "Urgente", value: "urgent" },
];

const RISK_OPTIONS: SampleFilterOption[] = [
  { label: "Normal", value: "normal" },
  { label: "Riesgo bajo", value: "low" },
  { label: "Riesgo medio", value: "medium" },
  { label: "Riesgo alto", value: "high" },
  { label: "Crítico", value: "critical" },
];

const INITIAL_FILTERS: SampleFiltersState = {
  search: "",
  status: "",
  risk_level: "",
  priority: "",
  laboratory_area: "",
};

export default function SampleFilters({
  filters,
  onFiltersChange,
  onReset,
  areas = [],
  statusOptions = DEFAULT_STATUS_OPTIONS,
  priorityOptions = DEFAULT_PRIORITY_OPTIONS,
  resultCount,
  loading = false,
  showResultCount = true,
  showSearch = true,
  showStatus = true,
  showRiskLevel = true,
  showPriority = true,
  showArea = true,
  title = "Filtros de muestras",
  className = "",
}: SampleFiltersProps) {
  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(
      ([key, value]) => key !== "search" && value !== "",
    ).length;
  }, [filters]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((value) => value !== "");
  }, [filters]);

  const updateFilter = <K extends keyof SampleFiltersState>(
    key: K,
    value: SampleFiltersState[K],
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const resetFilters = () => {
    onFiltersChange({ ...INITIAL_FILTERS });
    onReset?.();
  };

  return (
    <section
      className={`sample-filters ${className}`.trim()}
      aria-label={title}
    >
      <div className="sample-filters__header">
        <div className="sample-filters__heading">
          <div className="sample-filters__icon">
            <SlidersHorizontal size={18} />
          </div>

          <div>
            <h3 className="sample-filters__title">{title}</h3>
            <p className="sample-filters__description">
              Refina los resultados de las muestras
            </p>
          </div>

          {activeFiltersCount > 0 && (
            <span className="sample-filters__count">
              {activeFiltersCount} activos
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="sample-filters__reset"
            onClick={resetFilters}
            disabled={loading}
          >
            <RotateCcw size={15} />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="sample-filters__fields">
        {showSearch && (
          <div className="sample-filters__field sample-filters__field--search">
            <label htmlFor="sample-filter-search">
              Buscar muestra
            </label>

            <div className="sample-filters__search-wrapper">
              <Search
                size={17}
                className="sample-filters__search-icon"
              />

              <input
                id="sample-filter-search"
                type="search"
                placeholder="Código o tipo de muestra..."
                value={filters.search}
                onChange={(event) =>
                  updateFilter("search", event.target.value)
                }
                disabled={loading}
              />

              {filters.search && (
                <button
                  type="button"
                  className="sample-filters__clear-search"
                  aria-label="Limpiar búsqueda"
                  onClick={() => updateFilter("search", "")}
                  disabled={loading}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        )}

        {showStatus && (
          <div className="sample-filters__field">
            <label htmlFor="sample-filter-status">
              Estado
            </label>

            <select
              id="sample-filter-status"
              value={filters.status}
              onChange={(event) =>
                updateFilter("status", event.target.value)
              }
              disabled={loading}
            >
              <option value="">Todos los estados</option>

              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {showRiskLevel && (
          <div className="sample-filters__field">
            <label htmlFor="sample-filter-risk">
              Nivel de riesgo
            </label>

            <select
              id="sample-filter-risk"
              value={filters.risk_level}
              onChange={(event) =>
                updateFilter(
                  "risk_level",
                  event.target.value as SampleRiskLevel,
                )
              }
              disabled={loading}
            >
              <option value="">Todos los niveles</option>

              {RISK_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {showPriority && (
          <div className="sample-filters__field">
            <label htmlFor="sample-filter-priority">
              Prioridad
            </label>

            <select
              id="sample-filter-priority"
              value={filters.priority}
              onChange={(event) =>
                updateFilter("priority", event.target.value)
              }
              disabled={loading}
            >
              <option value="">Todas las prioridades</option>

              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {showArea && (
          <div className="sample-filters__field">
            <label htmlFor="sample-filter-area">
              Área del laboratorio
            </label>

            <select
              id="sample-filter-area"
              value={filters.laboratory_area}
              onChange={(event) =>
                updateFilter("laboratory_area", event.target.value)
              }
              disabled={loading}
            >
              <option value="">Todas las áreas</option>

              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {showResultCount && resultCount !== undefined && (
        <div className="sample-filters__footer">
          <span>
            {loading
              ? "Actualizando resultados..."
              : `${resultCount} ${
                  resultCount === 1 ? "muestra encontrada" : "muestras encontradas"
                }`}
          </span>
        </div>
      )}
    </section>
  );
}
