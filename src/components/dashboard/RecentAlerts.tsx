import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  FlaskConical,
  ShieldAlert,
} from "lucide-react";

import Card from "../common/Card";
import Badge from "../common/Badge";
import Button from "../common/Button";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";
import LoadingSpinner from "../common/LoadingSpinner";

import AlertStatusBadge from "../alerts/AlertStatusBadge";
import type { AlertDetailData } from "../alerts/AlertDetail";

interface RecentAlertsProps {
  alerts: AlertDetailData[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onAlertClick?: (alert: AlertDetailData) => void;
  onViewAll?: () => void;
  maxItems?: number;
  title?: string;
  description?: string;
}

const severityConfig: Record<
  string,
  { label: string; variant: "danger" | "warning" | "info" | "neutral" }
> = {
  critical: { label: "Crítica", variant: "danger" },
  high: { label: "Alta", variant: "danger" },
  medium: { label: "Media", variant: "warning" },
  low: { label: "Baja", variant: "info" },
};

function formatAlertDate(dateValue: string): string {
  const date = new Date(dateValue);

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

function getSeverity(severity: string) {
  return (
    severityConfig[severity.toLowerCase()] ?? {
      label: severity || "Sin nivel",
      variant: "neutral" as const,
    }
  );
}

export default function RecentAlerts({
  alerts,
  loading = false,
  error = null,
  onRetry,
  onAlertClick,
  onViewAll,
  maxItems = 5,
  title = "Alertas recientes",
  description = "Últimos eventos que requieren atención en el laboratorio",
}: RecentAlertsProps) {
  const recentAlerts = useMemo(() => {
    return [...alerts]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime(),
      )
      .slice(0, Math.max(1, maxItems));
  }, [alerts, maxItems]);

  const criticalCount = recentAlerts.filter(
    (alert) => alert.severity.toLowerCase() === "critical",
  ).length;

  const activeCount = recentAlerts.filter(
    (alert) => alert.status.toLowerCase() === "active",
  ).length;

  return (
    <Card
      title={title}
      description={description}
      headerIcon={<ShieldAlert size={19} />}
      padding="md"
      className="recent-alerts-card"
      actions={
        onViewAll ? (
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight size={15} />}
            onClick={onViewAll}
          >
            Ver todas
          </Button>
        ) : undefined
      }
    >
      {loading ? (
        <div className="recent-alerts__state">
          <LoadingSpinner
            size="lg"
            text="Cargando alertas recientes..."
          />
        </div>
      ) : error ? (
        <ErrorMessage
          title="No se pudieron cargar las alertas"
          description={error}
          onRetry={onRetry}
          size="sm"
        />
      ) : recentAlerts.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No hay alertas recientes"
          description="No se encontraron alertas registradas en el laboratorio."
          size="sm"
        />
      ) : (
        <>
          <div className="recent-alerts__summary">
            <div className="recent-alerts__summary-item">
              <span className="recent-alerts__summary-label">
                Alertas mostradas
              </span>
              <strong>{recentAlerts.length}</strong>
            </div>

            <div className="recent-alerts__summary-item">
              <span className="recent-alerts__summary-label">
                Activas
              </span>
              <strong className="recent-alerts__active-count">
                {activeCount}
              </strong>
            </div>

            <div className="recent-alerts__summary-item">
              <span className="recent-alerts__summary-label">
                Críticas
              </span>
              <strong className="recent-alerts__critical-count">
                {criticalCount}
              </strong>
            </div>
          </div>

          <div className="recent-alerts__list">
            {recentAlerts.map((alert) => {
              const severity = getSeverity(alert.severity);

              return (
                <article
                  key={alert.id}
                  className={[
                    "recent-alerts__item",
                    `recent-alerts__item--${alert.severity.toLowerCase()}`,
                  ].join(" ")}
                >
                  <div className="recent-alerts__item-indicator">
                    <AlertTriangle size={17} />
                  </div>

                  <div className="recent-alerts__item-content">
                    <div className="recent-alerts__item-heading">
                      <h4 className="recent-alerts__item-title">
                        {alert.title}
                      </h4>

                      <Badge
                        variant={severity.variant}
                        size="sm"
                      >
                        {severity.label}
                      </Badge>
                    </div>

                    <p className="recent-alerts__item-message">
                      {alert.message}
                    </p>

                    <div className="recent-alerts__item-meta">
                      {alert.sample_code && (
                        <span>
                          <FlaskConical size={13} />
                          {alert.sample_code}
                        </span>
                      )}

                      <span>
                        <Clock3 size={13} />
                        {formatAlertDate(alert.created_at)}
                      </span>

                      <AlertStatusBadge
                        status={alert.status}
                        size="sm"
                      />
                    </div>

                    {onAlertClick && (
                      <button
                        type="button"
                        className="recent-alerts__detail-button"
                        onClick={() => onAlertClick(alert)}
                      >
                        Ver detalles
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="recent-alerts__footer">
            <span>
              Mostrando las {recentAlerts.length} alertas más recientes
            </span>

            {onViewAll && (
              <button
                type="button"
                className="recent-alerts__footer-link"
                onClick={onViewAll}
              >
                Consultar historial
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </>
      )}
    </Card>
  );
}