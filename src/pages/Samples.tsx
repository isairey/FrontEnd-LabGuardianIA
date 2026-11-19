
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ClipboardList,
  Download,
  FlaskConical,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

import PageContainer from "../components/layout/PageContainer";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import EmptyState from "../components/common/EmptyState";

import SampleTable from "../components/samples/SampleTable";
import SampleFilters, {
  type SampleFiltersState,
} from "../components/samples/SampleFilters";

import { useSamples } from "../hooks/useSamples";

export default function Samples() {
  const navigate = useNavigate();

  const {
    samples,
    loading,
    error,
    refresh,
    deleteSample,
  } = useSamples({
    autoFetch: true,
    pageSize: 10,
  });

  const [filters, setFilters] = useState<SampleFiltersState>({
    search: "",
    status: "",
    risk_level: "",
    priority: "",
    laboratory_area: "",
  });

  const [showFilters, setShowFilters] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredSamples = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();

    return (samples || []).filter((sample) => {
      const matchesSearch =
        !searchTerm ||
        sample.code?.toLowerCase().includes(searchTerm) ||
        sample.sample_type?.toLowerCase().includes(searchTerm) ||
        sample.laboratory_area?.toLowerCase().includes(searchTerm);

      const matchesStatus =
        !filters.status || sample.status === filters.status;

      const matchesRisk =
        !filters.risk_level ||
        String(sample.risk_level || "").toLowerCase() ===
          filters.risk_level.toLowerCase();

      const matchesPriority =
        !filters.priority || sample.priority === filters.priority;

      const matchesArea =
        !filters.laboratory_area ||
        sample.laboratory_area === filters.laboratory_area;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRisk &&
        matchesPriority &&
        matchesArea
      );
    });
  }, [samples, filters]);

  const areas = useMemo(() => {
    const uniqueAreas = new Set(
      (samples || [])
        .map((sample) => sample.laboratory_area)
        .filter((area): area is string => Boolean(area)),
    );

    return Array.from(uniqueAreas)
      .sort()
      .map((area) => ({
        label: area,
        value: area,
      }));
  }, [samples]);

  const statistics = useMemo(() => {
    const total = samples?.length || 0;

    const pending = samples.filter((sample) =>
      ["pending", "received", "in_transit"].includes(
        String(sample.status).toLowerCase(),
      ),
    ).length;

    const processing = samples.filter(
      (sample) => String(sample.status).toLowerCase() === "processing",
    ).length;

    const completed = samples.filter(
      (sample) => String(sample.status).toLowerCase() === "completed",
    ).length;

    const highRisk = samples.filter((sample) =>
      ["high", "critical", "alto", "critico", "crítico"].includes(
        String(sample.risk_level || "").toLowerCase(),
      ),
    ).length;

    const anomalies = samples.filter(
      (sample) => Boolean(sample.anomaly_detected),
    ).length;

    return {
      total,
      pending,
      processing,
      completed,
      highRisk,
      anomalies,
    };
  }, [samples]);

  const hasActiveFilters = Object.values(filters).some(
    (value) => Boolean(value),
  );

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "",
      risk_level: "",
      priority: "",
      laboratory_area: "",
    });
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar esta muestra? Esta acción no se puede deshacer.",
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      await deleteSample(id);
    } catch (deleteError) {
      console.error("Error al eliminar la muestra:", deleteError);
      window.alert("No fue posible eliminar la muestra.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = () => {
    if (!filteredSamples.length) {
      window.alert("No hay muestras disponibles para exportar.");
      return;
    }

    const headers = [
      "ID",
      "Código",
      "Tipo",
      "Área",
      "Prioridad",
      "Estado",
      "Nivel de riesgo",
      "Puntuación de riesgo",
      "Anomalía",
      "Fecha de registro",
    ];

    const rows = filteredSamples.map((sample) => [
      sample.id,
      sample.code,
      sample.sample_type,
      sample.laboratory_area || "",
      sample.priority || "",
      sample.status,
      sample.risk_level || "",
      sample.risk_score ?? "",
      sample.anomaly_detected ? "Sí" : "No",
      sample.created_at,
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const escaped = String(value ?? "").replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `labguardian-muestras-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <PageContainer
      title="Muestras"
      description="Administra, consulta y supervisa las muestras registradas en el laboratorio."
      eyebrow="GESTIÓN DEL LABORATORIO"
      actions={
        <div className="samples-page__header-actions">
          <Button
            variant="outline"
            leftIcon={<Download size={16} />}
            onClick={handleExport}
          >
            Exportar
          </Button>

          <Button
            variant="outline"
            leftIcon={<RefreshCw size={16} />}
            onClick={() => void refresh()}
            loading={loading}
          >
            Actualizar
          </Button>

          <Button
            variant="primary"
            leftIcon={<Plus size={17} />}
            onClick={() => navigate("/samples/new")}
          >
            Nueva muestra
          </Button>
        </div>
      }
    >
      <div className="samples-page">
        {/* Indicadores */}
        <section className="samples-page__stats">
          <Card className="samples-page__stat-card">
            <div className="samples-page__stat">
              <div className="samples-page__stat-icon samples-page__stat-icon--blue">
                <FlaskConical size={21} />
              </div>

              <div>
                <span>Total de muestras</span>
                <strong>{statistics.total}</strong>
                <small>Registros disponibles</small>
              </div>
            </div>
          </Card>

          <Card className="samples-page__stat-card">
            <div className="samples-page__stat">
              <div className="samples-page__stat-icon samples-page__stat-icon--orange">
                <ClipboardList size={21} />
              </div>

              <div>
                <span>Pendientes</span>
                <strong>{statistics.pending}</strong>
                <small>Por recibir o procesar</small>
              </div>
            </div>
          </Card>

          <Card className="samples-page__stat-card">
            <div className="samples-page__stat">
              <div className="samples-page__stat-icon samples-page__stat-icon--purple">
                <Activity size={21} />
              </div>

              <div>
                <span>En procesamiento</span>
                <strong>{statistics.processing}</strong>
                <small>Actualmente en proceso</small>
              </div>
            </div>
          </Card>

          <Card className="samples-page__stat-card">
            <div className="samples-page__stat">
              <div className="samples-page__stat-icon samples-page__stat-icon--green">
                <TrendingUp size={21} />
              </div>

              <div>
                <span>Completadas</span>
                <strong>{statistics.completed}</strong>
                <small>Procesos finalizados</small>
              </div>
            </div>
          </Card>
        </section>

        {/* Resumen de riesgo */}
        <section className="samples-page__risk-summary">
          <div className="samples-page__risk-summary-main">
            <div className="samples-page__risk-summary-icon">
              <ShieldAlert size={21} />
            </div>

            <div>
              <strong>Supervisión de riesgos</strong>
              <p>
                Indicadores de riesgo elevado y anomalías en las muestras
                registradas.
              </p>
            </div>
          </div>

          <div className="samples-page__risk-summary-indicators">
            <div>
              <Badge variant="danger" dot>
                Riesgo elevado
              </Badge>
              <strong>{statistics.highRisk}</strong>
            </div>

            <div>
              <Badge variant="warning" dot>
                Anomalías
              </Badge>
              <strong>{statistics.anomalies}</strong>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/risk-analysis")}
            >
              Ver análisis
            </Button>
          </div>
        </section>

        {/* Filtros */}
        <Card
          title="Buscar y filtrar muestras"
          description="Localiza registros por código, estado, riesgo, prioridad o área."
          headerIcon={<Search size={19} />}
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters((current) => !current)}
            >
              {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            </Button>
          }
        >
          {showFilters && (
            <SampleFilters
              filters={filters}
              onFiltersChange={setFilters}
              onReset={handleResetFilters}
              areas={areas}
              resultCount={filteredSamples.length}
              loading={loading}
              showResultCount
            />
          )}

          {hasActiveFilters && (
            <div className="samples-page__active-filters">
              <span>
                Filtros activos:{" "}
                {
                  Object.values(filters).filter(Boolean).length
                }
              </span>

              <button type="button" onClick={handleResetFilters}>
                Limpiar todos
              </button>
            </div>
          )}
        </Card>

        {/* Tabla principal */}
        <Card
          title="Listado de muestras"
          description="Consulta los registros y accede a sus detalles, edición y acciones disponibles."
          headerIcon={<FlaskConical size={19} />}
          actions={
            <Badge variant="info">
              {filteredSamples.length} registros
            </Badge>
          }
        >
          {error ? (
            <ErrorMessage
              title="Error al cargar las muestras"
              message={
                typeof error === "string"
                  ? error
                  : "No fue posible obtener los registros del laboratorio."
              }
              onRetry={() => void refresh()}
            />
          ) : loading && samples.length === 0 ? (
            <LoadingSpinner
              text="Cargando muestras del laboratorio..."
              centered
            />
          ) : samples.length === 0 ? (
            <EmptyState
              title="Todavía no hay muestras"
              description="Registra la primera muestra para comenzar a gestionar su procesamiento y trazabilidad."
              icon={FlaskConical}
              size="lg"
              action={{
                label: "Registrar muestra",
                onClick: () => navigate("/samples/new"),
              }}
            />
          ) : filteredSamples.length === 0 ? (
            <EmptyState
              title="No se encontraron resultados"
              description="No hay muestras que coincidan con los filtros seleccionados."
              icon={Search}
              size="md"
              action={{
                label: "Limpiar filtros",
                onClick: handleResetFilters,
              }}
            />
          ) : (
            <SampleTable
              samples={filteredSamples}
              loading={loading}
              error={null}
              onRetry={() => void refresh()}
              onRefresh={() => void refresh()}
              onView={(sample) => navigate(`/samples/${sample.id}`)}
              onEdit={(sample) => navigate(`/samples/${sample.id}/edit`)}
              onDelete={(sample) => void handleDelete(sample.id)}
              pageSize={10}
              showSearch={false}
              showFilters={false}
              showPagination
              showActions
              showRiskScore
              showAnomaly
              title=""
              description=""
              emptyMessage="No hay muestras disponibles."
            />
          )}
        </Card>

        {/* Información complementaria */}
        <div className="samples-page__footer-info">
          <div>
            <div className="samples-page__footer-icon">
              <AlertTriangle size={17} />
            </div>

            <div>
              <strong>Control de calidad y trazabilidad</strong>
              <p>
                Mantén actualizada la información de cada muestra y registra
                los eventos relevantes durante su ciclo de vida.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/traceability")}
          >
            Consultar trazabilidad
          </Button>
        </div>

        {deletingId !== null && (
          <div className="samples-page__deleting-indicator">
            <LoadingSpinner size="sm" />
            <span>Eliminando muestra #{deletingId}...</span>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
