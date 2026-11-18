
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  ShieldAlert,
  Eye,
  Check,
  X,
  Activity,
} from "lucide-react";

import PageContainer from "../../components/layout/PageContainer";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import SearchInput from "../../components/common/SearchInput";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";
import Modal from "../../components/common/Modal";

import { useAlerts } from "../../hooks/useAlerts";

import type { AlertData } from "../../hooks/useAlerts";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

type AlertStatusFilter =
  | "all"
  | "active"
  | "acknowledged"
  | "resolved";

type AlertSeverityFilter =
  | "all"
  | "critical"
  | "high"
  | "medium"
  | "low";

interface AlertFilters {
  status: AlertStatusFilter;
  severity: AlertSeverityFilter;
}

interface AlertActionState {
  type: "acknowledge" | "resolve";
  alert: AlertData;
}

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function normalize(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatDate(value?: string | null): string {
  if (!value) return "Fecha no disponible";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getSeverity(alert: AlertData): string {
  return normalize(alert.severity);
}

function getStatus(alert: AlertData): string {
  return normalize(alert.status);
}

function getSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    critical: "Crítica",
    high: "Alta",
    medium: "Media",
    low: "Baja",
    warning: "Advertencia",
  };

  return labels[severity] ?? "Sin clasificar";
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: "Activa",
    acknowledged: "Reconocida",
    resolved: "Resuelta",
  };

  return labels[status] ?? "Desconocido";
}

function getSeverityVariant(
  severity: string
): "danger" | "warning" | "info" | "neutral" {
  switch (severity) {
    case "critical":
    case "high":
      return "danger";
    case "medium":
    case "warning":
      return "warning";
    case "low":
      return "info";
    default:
      return "neutral";
  }
}

function getStatusVariant(
  status: string
): "danger" | "warning" | "success" | "neutral" {
  switch (status) {
    case "active":
      return "danger";
    case "acknowledged":
      return "warning";
    case "resolved":
      return "success";
    default:
      return "neutral";
  }
}

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

export default function AlertsPage() {
  const {
    alerts,
    activeAlerts,
    summary,
    loading,
    error,
    fetchAlerts,
    markAsAcknowledged,
    markAsResolved,
    refresh,
  } = useAlerts({
    autoFetch: true,
  });

  // Search and filters
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState<AlertFilters>({
    status: "all",
    severity: "all",
  });

  // Modals
  const [selectedAlert, setSelectedAlert] =
    useState<AlertData | null>(null);

  const [actionState, setActionState] =
    useState<AlertActionState | null>(null);

  const [resolutionNotes, setResolutionNotes] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // ------------------------------------------------
  // SUMMARY
  // ------------------------------------------------

  const totalAlerts = alerts.length;

  const criticalAlerts = useMemo(
    () =>
      alerts.filter(
        (alert) => getSeverity(alert) === "critical"
      ).length,
    [alerts]
  );

  const highAlerts = useMemo(
    () =>
      alerts.filter(
        (alert) => getSeverity(alert) === "high"
      ).length,
    [alerts]
  );

  const resolvedAlerts = useMemo(
    () =>
      alerts.filter(
        (alert) => getStatus(alert) === "resolved"
      ).length,
    [alerts]
  );

  const activeCount = activeAlerts.length;

  // ------------------------------------------------
  // FILTERED ALERTS
  // ------------------------------------------------

  const filteredAlerts = useMemo(() => {
    const query = normalize(search);

    return alerts.filter((alert) => {
      const matchesSearch =
        !query ||
        [
          alert.title,
          alert.message,
          alert.sample_code,
          alert.alert_type,
          alert.severity,
          alert.status,
          alert.source,
        ].some((value) => normalize(value).includes(query));

      const matchesStatus =
        filters.status === "all" ||
        getStatus(alert) === filters.status;

      const matchesSeverity =
        filters.severity === "all" ||
        getSeverity(alert) === filters.severity;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSeverity
      );
    });
  }, [alerts, search, filters]);

  // ------------------------------------------------
  // ACTIONS
  // ------------------------------------------------

  const handleAcknowledge = async (alert: AlertData) => {
    setActionLoading(true);
    setActionError(null);

    try {
      await markAsAcknowledged(alert.id);
      setActionState(null);
      setSelectedAlert(null);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "No se pudo reconocer la alerta."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!actionState || actionState.type !== "resolve") {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await markAsResolved(
        actionState.alert.id,
        resolutionNotes.trim()
      );

      setActionState(null);
      setSelectedAlert(null);
      setResolutionNotes("");
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "No se pudo resolver la alerta."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openResolveModal = (alert: AlertData) => {
    setActionError(null);
    setResolutionNotes("");

    setActionState({
      type: "resolve",
      alert,
    });
  };

  const openAcknowledgeModal = (alert: AlertData) => {
    setActionError(null);

    setActionState({
      type: "acknowledge",
      alert,
    });
  };

  const resetFilters = () => {
    setSearch("");

    setFilters({
      status: "all",
      severity: "all",
    });
  };

  // ------------------------------------------------
  // RENDER
  // ------------------------------------------------

  return (
    <PageContainer
      title="Centro de alertas"
      description="Supervisa, analiza y gestiona las alertas generadas por el sistema de laboratorio."
      eyebrow="MONITOREO Y SEGURIDAD"
      actions={
        <Button
          variant="outline"
          leftIcon={<RefreshCw size={16} />}
          onClick={() => void refresh()}
          loading={loading}
        >
          Actualizar
        </Button>
      }
    >
      <div className="alerts-page">
        {/* SUMMARY CARDS */}

        <section className="alerts-page__summary">
          <Card className="alerts-page__stat">
            <div className="alerts-page__stat-content">
              <div>
                <span className="alerts-page__stat-label">
                  Total de alertas
                </span>

                <strong className="alerts-page__stat-value">
                  {totalAlerts}
                </strong>

                <span className="alerts-page__stat-description">
                  Registros detectados
                </span>
              </div>

              <div className="alerts-page__stat-icon alerts-page__stat-icon--blue">
                <Bell size={22} />
              </div>
            </div>
          </Card>

          <Card className="alerts-page__stat">
            <div className="alerts-page__stat-content">
              <div>
                <span className="alerts-page__stat-label">
                  Alertas activas
                </span>

                <strong className="alerts-page__stat-value">
                  {activeCount}
                </strong>

                <span className="alerts-page__stat-description">
                  Requieren atención
                </span>
              </div>

              <div className="alerts-page__stat-icon alerts-page__stat-icon--red">
                <AlertTriangle size={22} />
              </div>
            </div>
          </Card>

          <Card className="alerts-page__stat">
            <div className="alerts-page__stat-content">
              <div>
                <span className="alerts-page__stat-label">
                  Alertas críticas
                </span>

                <strong className="alerts-page__stat-value">
                  {criticalAlerts}
                </strong>

                <span className="alerts-page__stat-description">
                  Prioridad máxima
                </span>
              </div>

              <div className="alerts-page__stat-icon alerts-page__stat-icon--orange">
                <ShieldAlert size={22} />
              </div>
            </div>
          </Card>

          <Card className="alerts-page__stat">
            <div className="alerts-page__stat-content">
              <div>
                <span className="alerts-page__stat-label">
                  Resueltas
                </span>

                <strong className="alerts-page__stat-value">
                  {resolvedAlerts}
                </strong>

                <span className="alerts-page__stat-description">
                  Alertas atendidas
                </span>
              </div>

              <div className="alerts-page__stat-icon alerts-page__stat-icon--green">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </Card>
        </section>

        {/* PRIORITY BANNER */}

        {criticalAlerts > 0 && (
          <div className="alerts-page__priority-banner">
            <div className="alerts-page__priority-icon">
              <AlertTriangle size={20} />
            </div>

            <div className="alerts-page__priority-content">
              <strong>
                Atención: existen alertas críticas
              </strong>

              <span>
                Hay {criticalAlerts} alerta(s) crítica(s) que
                requieren revisión prioritaria.
              </span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  severity: "critical",
                }))
              }
            >
              Ver críticas
            </Button>
          </div>
        )}

        {/* FILTERS AND TABLE */}

        <Card
          title="Registro de alertas"
          description="Consulta y administra los eventos que requieren atención."
          headerIcon={<Activity size={19} />}
          actions={
            <Badge variant="info">
              {filteredAlerts.length} resultados
            </Badge>
          }
        >
          <div className="alerts-page__toolbar">
            <div className="alerts-page__search">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Buscar por título, muestra o descripción..."
                size="md"
              />
            </div>

            <div className="alerts-page__filters">
              <select
                value={filters.status}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    status: event.target.value as AlertStatusFilter,
                  }))
                }
                aria-label="Filtrar por estado"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activas</option>
                <option value="acknowledged">Reconocidas</option>
                <option value="resolved">Resueltas</option>
              </select>

              <select
                value={filters.severity}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    severity: event.target.value as AlertSeverityFilter,
                  }))
                }
                aria-label="Filtrar por severidad"
              >
                <option value="all">Todas las severidades</option>
                <option value="critical">Críticas</option>
                <option value="high">Altas</option>
                <option value="medium">Medias</option>
                <option value="low">Bajas</option>
              </select>

              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
              >
                Limpiar
              </Button>
            </div>
          </div>

          {/* LOADING */}

          {loading && alerts.length === 0 ? (
            <div className="alerts-page__loading">
              <LoadingSpinner
                size="lg"
                text="Cargando alertas..."
                centered
              />
            </div>
          ) : error && alerts.length === 0 ? (
            <ErrorMessage
              title="No se pudieron cargar las alertas"
              message={error}
              onRetry={() => void fetchAlerts()}
            />
          ) : filteredAlerts.length === 0 ? (
            <EmptyState
              icon={Bell}
              title={
                alerts.length === 0
                  ? "No hay alertas registradas"
                  : "No se encontraron alertas"
              }
              description={
                alerts.length === 0
                  ? "Cuando el sistema detecte un evento de riesgo, aparecerá aquí."
                  : "Prueba cambiando los filtros o el término de búsqueda."
              }
              action={
                alerts.length > 0
                  ? {
                      label: "Limpiar filtros",
                      onClick: resetFilters,
                    }
                  : undefined
              }
            />
          ) : (
            <div className="alerts-page__table-wrapper">
              <table className="alerts-page__table">
                <thead>
                  <tr>
                    <th>Alerta</th>
                    <th>Muestra</th>
                    <th>Severidad</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Riesgo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAlerts.map((alert) => {
                    const severity = getSeverity(alert);
                    const status = getStatus(alert);

                    return (
                      <tr key={alert.id}>
                        <td>
                          <div className="alerts-page__alert-cell">
                            <strong>{alert.title}</strong>

                            <span>
                              {alert.message}
                            </span>

                            <small>
                              {alert.alert_type || "Alerta del sistema"}
                            </small>
                          </div>
                        </td>

                        <td>
                          <span className="alerts-page__sample-code">
                            {alert.sample_code || "Sin muestra"}
                          </span>
                        </td>

                        <td>
                          <Badge
                            variant={getSeverityVariant(severity)}
                            dot
                          >
                            {getSeverityLabel(severity)}
                          </Badge>
                        </td>

                        <td>
                          <Badge
                            variant={getStatusVariant(status)}
                          >
                            {getStatusLabel(status)}
                          </Badge>
                        </td>

                        <td>
                          <span className="alerts-page__date">
                            <Clock size={14} />
                            {formatDate(alert.created_at)}
                          </span>
                        </td>

                        <td>
                          <strong className="alerts-page__risk">
                            {alert.risk_score != null
                              ? `${Math.round(alert.risk_score)} / 100`
                              : "—"}
                          </strong>
                        </td>

                        <td>
                          <div className="alerts-page__actions">
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Ver detalles"
                              onClick={() => setSelectedAlert(alert)}
                            >
                              <Eye size={16} />
                            </Button>

                            {status === "active" && (
                              <Button
                                size="sm"
                                variant="outline"
                                title="Reconocer alerta"
                                onClick={() =>
                                  openAcknowledgeModal(alert)
                                }
                              >
                                <Check size={16} />
                              </Button>
                            )}

                            {status !== "resolved" && (
                              <Button
                                size="sm"
                                variant="success"
                                title="Resolver alerta"
                                onClick={() =>
                                  openResolveModal(alert)
                                }
                              >
                                <CheckCircle2 size={16} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {loading && alerts.length > 0 && (
            <div className="alerts-page__refresh-indicator">
              <LoadingSpinner size="xs" text="Actualizando alertas..." />
            </div>
          )}
        </Card>

        {/* ALERT DETAILS MODAL */}

        <Modal
          isOpen={Boolean(selectedAlert)}
          onClose={() => setSelectedAlert(null)}
          title="Detalle de alerta"
          description="Información del evento detectado por LabGuardian AI."
          size="lg"
        >
          {selectedAlert && (
            <div className="alerts-page__details">
              <div className="alerts-page__details-heading">
                <div>
                  <Badge
                    variant={getSeverityVariant(
                      getSeverity(selectedAlert)
                    )}
                    dot
                  >
                    {getSeverityLabel(getSeverity(selectedAlert))}
                  </Badge>

                  <h3>{selectedAlert.title}</h3>
                </div>

                <Badge
                  variant={getStatusVariant(
                    getStatus(selectedAlert)
                  )}
                >
                  {getStatusLabel(getStatus(selectedAlert))}
                </Badge>
              </div>

              <div className="alerts-page__details-description">
                <span>Descripción</span>
                <p>{selectedAlert.message || "Sin descripción disponible."}</p>
              </div>

              <div className="alerts-page__details-grid">
                <div>
                  <span>Código de muestra</span>
                  <strong>
                    {selectedAlert.sample_code || "No disponible"}
                  </strong>
                </div>

                <div>
                  <span>Tipo de alerta</span>
                  <strong>
                    {selectedAlert.alert_type || "No disponible"}
                  </strong>
                </div>

                <div>
                  <span>Fecha de creación</span>
                  <strong>
                    {formatDate(selectedAlert.created_at)}
                  </strong>
                </div>

                <div>
                  <span>Origen</span>
                  <strong>
                    {selectedAlert.source || "Sistema"}
                  </strong>
                </div>

                <div>
                  <span>Puntuación de riesgo</span>
                  <strong>
                    {selectedAlert.risk_score != null
                      ? `${selectedAlert.risk_score}/100`
                      : "No disponible"}
                  </strong>
                </div>

                <div>
                  <span>Identificador</span>
                  <strong>#{selectedAlert.id}</strong>
                </div>
              </div>

              {getStatus(selectedAlert) !== "resolved" && (
                <div className="alerts-page__details-actions">
                  {getStatus(selectedAlert) === "active" && (
                    <Button
                      variant="outline"
                      leftIcon={<Check size={16} />}
                      onClick={() =>
                        openAcknowledgeModal(selectedAlert)
                      }
                    >
                      Reconocer
                    </Button>
                  )}

                  <Button
                    variant="success"
                    leftIcon={<CheckCircle2 size={16} />}
                    onClick={() =>
                      openResolveModal(selectedAlert)
                    }
                  >
                    Resolver alerta
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* CONFIRM ACTION MODAL */}

        <Modal
          isOpen={Boolean(actionState)}
          onClose={() => {
            if (!actionLoading) {
              setActionState(null);
              setActionError(null);
            }
          }}
          title={
            actionState?.type === "acknowledge"
              ? "Reconocer alerta"
              : "Resolver alerta"
          }
          description={
            actionState?.type === "acknowledge"
              ? "Confirma que has revisado esta alerta."
              : "Registra la resolución del evento detectado."
          }
          size="md"
          preventClose={actionLoading}
        >
          {actionState && (
            <div className="alerts-page__confirmation">
              <div className="alerts-page__confirmation-alert">
                <AlertTriangle size={20} />

                <div>
                  <strong>{actionState.alert.title}</strong>
                  <span>
                    {actionState.alert.sample_code || "Sin muestra asociada"}
                  </span>
                </div>
              </div>

              {actionState.type === "resolve" && (
                <div className="alerts-page__notes">
                  <label htmlFor="resolution-notes">
                    Notas de resolución
                  </label>

                  <textarea
                    id="resolution-notes"
                    value={resolutionNotes}
                    onChange={(event) =>
                      setResolutionNotes(event.target.value)
                    }
                    placeholder="Describe las acciones realizadas para resolver la alerta..."
                    rows={4}
                  />
                </div>
              )}

              {actionError && (
                <ErrorMessage
                  variant="error"
                  message={actionError}
                />
              )}

              <div className="alerts-page__confirmation-actions">
                <Button
                  variant="outline"
                  onClick={() => setActionState(null)}
                  disabled={actionLoading}
                >
                  Cancelar
                </Button>

                <Button
                  variant={
                    actionState.type === "resolve"
                      ? "success"
                      : "primary"
                  }
                  loading={actionLoading}
                  onClick={() => {
                    if (actionState.type === "resolve") {
                      void handleResolve();
                    } else {
                      void handleAcknowledge(actionState.alert);
                    }
                  }}
                >
                  {actionState.type === "resolve"
                    ? "Confirmar resolución"
                    : "Reconocer alerta"}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PageContainer>
  );
}
