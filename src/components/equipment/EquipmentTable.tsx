import { useMemo, useState } from "react";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Wrench,
  CalendarDays,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  MonitorCog,
} from "lucide-react";

import Card from "../common/Card";
import Badge from "../common/Badge";
import Button from "../common/Button";
import SearchInput from "../common/SearchInput";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";
import LoadingSpinner from "../common/LoadingSpinner";
import EquipmentStatusBadge from "./EquipmentStatusBadge";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export interface EquipmentData {
  id: number;
  code: string;
  name: string;
  equipment_type?: string | null;
  brand?: string | null;
  model?: string | null;
  laboratory_area?: string | null;
  location?: string | null;
  status: string;
  last_calibration?: string | null;
  next_calibration?: string | null;
  last_maintenance?: string | null;
  next_maintenance?: string | null;
  created_at?: string | null;
}

export type EquipmentStatusFilter =
  | "all"
  | "operational"
  | "maintenance"
  | "out_of_service"
  | "inactive"
  | "offline";

interface EquipmentTableProps {
  equipment: EquipmentData[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onView?: (equipment: EquipmentData) => void;
  onEdit?: (equipment: EquipmentData) => void;
  onDelete?: (equipment: EquipmentData) => void;
  onRefresh?: () => void;
  title?: string;
  description?: string;
  pageSize?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  emptyMessage?: string;
  toolbarActions?: React.ReactNode;
}

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function formatDate(value?: string | null): string {
  if (!value) return "No registrada";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizeStatus(status: string): string {
  return String(status ?? "unknown")
    .trim()
    .toLowerCase()
    .replaceAll(" ", "_")
    .replaceAll("-", "_");
}

function getCalibrationStatus(date?: string | null): {
  label: string;
  variant: "success" | "warning" | "danger" | "neutral";
} {
  if (!date) {
    return {
      label: "Sin programar",
      variant: "neutral",
    };
  }

  const calibrationDate = new Date(date);

  if (Number.isNaN(calibrationDate.getTime())) {
    return {
      label: "Fecha inválida",
      variant: "neutral",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  calibrationDate.setHours(0, 0, 0, 0);

  const difference = Math.ceil(
    (calibrationDate.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (difference < 0) {
    return {
      label: "Vencida",
      variant: "danger",
    };
  }

  if (difference <= 30) {
    return {
      label: "Próxima",
      variant: "warning",
    };
  }

  return {
    label: "Al corriente",
    variant: "success",
  };
}

/* -------------------------------------------------------------------------- */
/*                              EQUIPMENT TABLE                               */
/* -------------------------------------------------------------------------- */

export default function EquipmentTable({
  equipment,
  loading = false,
  error = null,
  onRetry,
  onView,
  onEdit,
  onDelete,
  onRefresh,
  title = "Equipos de laboratorio",
  description = "Inventario y estado operativo de los equipos",
  pageSize = 8,
  showSearch = true,
  showFilters = true,
  emptyMessage = "No hay equipos registrados.",
  toolbarActions,
}: EquipmentTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<EquipmentStatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredEquipment = useMemo(() => {
    const query = search.trim().toLowerCase();

    return equipment.filter((item) => {
      const matchesSearch =
        !query ||
        [
          item.code,
          item.name,
          item.equipment_type,
          item.brand,
          item.model,
          item.laboratory_area,
          item.location,
        ].some((value) => value?.toLowerCase().includes(query));

      const normalizedStatus = normalizeStatus(item.status);

      let matchesStatus = statusFilter === "all";

      if (statusFilter === "operational") {
        matchesStatus = ["operational", "available", "active"].includes(
          normalizedStatus
        );
      } else if (statusFilter === "maintenance") {
        matchesStatus = [
          "maintenance",
          "under_maintenance",
        ].includes(normalizedStatus);
      } else if (statusFilter === "out_of_service") {
        matchesStatus = normalizedStatus === "out_of_service";
      } else if (statusFilter === "inactive") {
        matchesStatus = ["inactive", "disabled"].includes(
          normalizedStatus
        );
      } else if (statusFilter === "offline") {
        matchesStatus = normalizedStatus === "offline";
      }

      return matchesSearch && matchesStatus;
    });
  }, [equipment, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEquipment.length / Math.max(1, pageSize))
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedEquipment = useMemo(() => {
    const start = (safePage - 1) * Math.max(1, pageSize);

    return filteredEquipment.slice(start, start + Math.max(1, pageSize));
  }, [filteredEquipment, safePage, pageSize]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: EquipmentStatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const hasFilters = search.trim() !== "" || statusFilter !== "all";

  return (
    <Card
      title={title}
      description={description}
      className="equipment-table-card"
      actions={
        <div className="equipment-table__header-actions">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={15} />}
              onClick={onRefresh}
            >
              Actualizar
            </Button>
          )}

          {toolbarActions}
        </div>
      }
    >
      <div className="equipment-table">
        {(showSearch || showFilters) && (
          <div className="equipment-table__toolbar">
            {showSearch && (
              <div className="equipment-table__search">
                <SearchInput
                  value={search}
                  onChange={handleSearch}
                  placeholder="Buscar por código, nombre, marca o área..."
                  size="md"
                />
              </div>
            )}

            {showFilters && (
              <div className="equipment-table__filters">
                <SlidersHorizontal size={16} />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    handleStatusChange(
                      event.target.value as EquipmentStatusFilter
                    )
                  }
                  className="equipment-table__status-filter"
                  aria-label="Filtrar equipos por estado"
                >
                  <option value="all">Todos los estados</option>
                  <option value="operational">Operativos</option>
                  <option value="maintenance">En mantenimiento</option>
                  <option value="out_of_service">Fuera de servicio</option>
                  <option value="inactive">Inactivos</option>
                  <option value="offline">Desconectados</option>
                </select>
              </div>
            )}
          </div>
        )}

        <div className="equipment-table__results">
          <span>
            {filteredEquipment.length}{" "}
            {filteredEquipment.length === 1 ? "equipo encontrado" : "equipos encontrados"}
          </span>

          {hasFilters && (
            <button
              type="button"
              className="equipment-table__clear"
              onClick={resetFilters}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {loading ? (
          <div className="equipment-table__state">
            <LoadingSpinner
              size="md"
              text="Cargando equipos..."
              centered
            />
          </div>
        ) : error ? (
          <div className="equipment-table__state">
            <ErrorMessage
              title="No se pudieron cargar los equipos"
              message={error}
              onRetry={onRetry}
              retryLabel="Reintentar"
            />
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="equipment-table__state">
            <EmptyState
              icon={MonitorCog}
              title={hasFilters ? "No se encontraron resultados" : "Sin equipos registrados"}
              description={
                hasFilters
                  ? "Intenta cambiar los términos de búsqueda o los filtros."
                  : emptyMessage
              }
              variant="info"
              size="md"
              action={
                hasFilters
                  ? {
                      label: "Limpiar filtros",
                      onClick: resetFilters,
                    }
                  : undefined
              }
            />
          </div>
        ) : (
          <>
            <div className="equipment-table__scroll">
              <table className="equipment-table__table">
                <thead>
                  <tr>
                    <th>Equipo</th>
                    <th>Área / Ubicación</th>
                    <th>Estado</th>
                    <th>Próxima calibración</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedEquipment.map((item) => {
                    const calibration = getCalibrationStatus(
                      item.next_calibration
                    );

                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="equipment-table__equipment">
                            <div className="equipment-table__equipment-icon">
                              <MonitorCog size={19} />
                            </div>

                            <div className="equipment-table__equipment-info">
                              <strong>{item.name}</strong>
                              <span>{item.code}</span>

                              {(item.brand || item.model) && (
                                <small>
                                  {[item.brand, item.model]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </small>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="equipment-table__location">
                            <span>
                              {item.laboratory_area || "Área sin asignar"}
                            </span>

                            <small>
                              <MapPin size={12} />
                              {item.location || "Ubicación no especificada"}
                            </small>
                          </div>
                        </td>

                        <td>
                          <EquipmentStatusBadge
                            status={item.status}
                            size="sm"
                          />
                        </td>

                        <td>
                          <div className="equipment-table__calibration">
                            <span>
                              <CalendarDays size={14} />
                              {formatDate(item.next_calibration)}
                            </span>

                            <Badge
                              variant={calibration.variant}
                              size="sm"
                            >
                              {calibration.label}
                            </Badge>
                          </div>
                        </td>

                        <td>
                          <div className="equipment-table__actions">
                            {onView && (
                              <button
                                type="button"
                                className="equipment-table__action"
                                title="Ver equipo"
                                aria-label={`Ver ${item.name}`}
                                onClick={() => onView(item)}
                              >
                                <Eye size={16} />
                              </button>
                            )}

                            {onEdit && (
                              <button
                                type="button"
                                className="equipment-table__action"
                                title="Editar equipo"
                                aria-label={`Editar ${item.name}`}
                                onClick={() => onEdit(item)}
                              >
                                <Pencil size={16} />
                              </button>
                            )}

                            {onDelete && (
                              <button
                                type="button"
                                className="equipment-table__action equipment-table__action--danger"
                                title="Eliminar equipo"
                                aria-label={`Eliminar ${item.name}`}
                                onClick={() => onDelete(item)}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="equipment-table__pagination">
              <span className="equipment-table__pagination-info">
                Mostrando{" "}
                {filteredEquipment.length === 0
                  ? 0
                  : (safePage - 1) * pageSize + 1}
                {" - "}
                {Math.min(safePage * pageSize, filteredEquipment.length)} de{" "}
                {filteredEquipment.length}
              </span>

              <div className="equipment-table__pagination-controls">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  Anterior
                </Button>

                <span className="equipment-table__page-number">
                  {safePage} / {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage >= totalPages}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages, page + 1)
                    )
                  }
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}