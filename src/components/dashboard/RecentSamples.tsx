import { useMemo } from "react";
import {
  FlaskConical,
  ArrowRight,
  CalendarDays,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import Card from "../common/Card";
import Badge from "../common/Badge";
import Button from "../common/Button";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";
import LoadingSpinner from "../common/LoadingSpinner";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type SampleStatus =
  | "received"
  | "identified"
  | "processing"
  | "in_analysis"
  | "completed"
  | "rejected"
  | "stored"
  | string;

export type SampleRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "normal"
  | string;

export interface RecentSampleData {
  id: number;
  code: string;
  sample_type: string;
  laboratory_area: string | null;
  priority?: string | null;
  status: SampleStatus;
  created_at: string;
  risk_score?: number | null;
  risk_level?: SampleRiskLevel | null;
  anomaly_detected?: boolean;
}

interface RecentSamplesProps {
  samples: RecentSampleData[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSampleClick?: (sample: RecentSampleData) => void;
  onViewAll?: () => void;
  maxItems?: number;
  title?: string;
  description?: string;
}

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "primary" | "success" | "warning" | "danger" | "info" | "neutral" }
> = {
  received: { label: "Recibida", variant: "info" },
  identified: { label: "Identificada", variant: "primary" },
  processing: { label: "En procesamiento", variant: "warning" },
  in_analysis: { label: "En análisis", variant: "warning" },
  completed: { label: "Completada", variant: "success" },
  rejected: { label: "Rechazada", variant: "danger" },
  stored: { label: "Almacenada", variant: "neutral" },
};

const riskConfig: Record<
  string,
  { label: string; variant: "success" | "warning" | "danger" | "neutral" }
> = {
  low: { label: "Riesgo bajo", variant: "success" },
  normal: { label: "Normal", variant: "success" },
  medium: { label: "Riesgo medio", variant: "warning" },
  high: { label: "Riesgo alto", variant: "danger" },
  critical: { label: "Crítico", variant: "danger" },
};

function formatDate(value: string): string {
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

function getStatus(status: string) {
  const normalized = status?.toLowerCase().trim();

  return (
    statusConfig[normalized] ?? {
      label: normalized
        ? normalized.replaceAll("_", " ").replace(/^\w/, (letter) => letter.toUpperCase())
        : "Sin estado",
      variant: "default" as const,
    }
  );
}

function getRisk(level?: string | null) {
  const normalized = level?.toLowerCase().trim();

  return (
    riskConfig[normalized ?? ""] ?? {
      label: "Sin evaluar",
      variant: "neutral" as const,
    }
  );
}

/* -------------------------------------------------------------------------- */
/*                              RECENT SAMPLES                                */
/* -------------------------------------------------------------------------- */

export default function RecentSamples({
  samples,
  loading = false,
  error = null,
  onRetry,
  onSampleClick,
  onViewAll,
  maxItems = 5,
  title = "Muestras recientes",
  description = "Últimas muestras registradas en el laboratorio",
}: RecentSamplesProps) {
  const recentSamples = useMemo(() => {
    return [...samples]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )
      .slice(0, maxItems);
  }, [samples, maxItems]);

  const totalSamples = samples.length;

  const highRiskCount = recentSamples.filter((sample) => {
    const risk = sample.risk_level?.toLowerCase();

    return risk === "high" || risk === "critical";
  }).length;

  const processingCount = recentSamples.filter((sample) => {
    const status = sample.status?.toLowerCase();

    return status === "processing" || status === "in_analysis";
  }).length;

  return (
    <Card
      title={title}
      description={description}
      className="recent-samples-card"
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
        <div className="recent-samples__state">
          <LoadingSpinner
            size="md"
            text="Cargando muestras..."
            centered
          />
        </div>
      ) : error ? (
        <div className="recent-samples__state">
          <ErrorMessage
            title="No se pudieron cargar las muestras"
            message={error}
            onRetry={onRetry}
            retryLabel="Reintentar"
          />
        </div>
      ) : recentSamples.length === 0 ? (
        <div className="recent-samples__state">
          <EmptyState
            icon={FlaskConical}
            title="No hay muestras registradas"
            description="Cuando se registren muestras en el laboratorio, aparecerán aquí."
            variant="info"
            size="md"
          />
        </div>
      ) : (
        <div className="recent-samples">
          <div className="recent-samples__summary">
            <div className="recent-samples__summary-item">
              <span className="recent-samples__summary-icon">
                <FlaskConical size={17} />
              </span>

              <div>
                <span className="recent-samples__summary-label">
                  Muestras recientes
                </span>
                <strong>{recentSamples.length}</strong>
              </div>
            </div>

            <div className="recent-samples__summary-item">
              <span className="recent-samples__summary-icon recent-samples__summary-icon--warning">
                <Clock3 size={17} />
              </span>

              <div>
                <span className="recent-samples__summary-label">
                  En proceso
                </span>
                <strong>{processingCount}</strong>
              </div>
            </div>

            <div className="recent-samples__summary-item">
              <span className="recent-samples__summary-icon recent-samples__summary-icon--danger">
                <AlertTriangle size={17} />
              </span>

              <div>
                <span className="recent-samples__summary-label">
                  Riesgo elevado
                </span>
                <strong>{highRiskCount}</strong>
              </div>
            </div>
          </div>

          <div className="recent-samples__list">
            {recentSamples.map((sample) => {
              const status = getStatus(sample.status);
              const risk = getRisk(sample.risk_level);

              return (
                <article
                  key={sample.id}
                  className={`recent-samples__item ${
                    onSampleClick ? "recent-samples__item--clickable" : ""
                  }`}
                  onClick={() => onSampleClick?.(sample)}
                  onKeyDown={(event) => {
                    if (
                      onSampleClick &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      onSampleClick(sample);
                    }
                  }}
                  role={onSampleClick ? "button" : undefined}
                  tabIndex={onSampleClick ? 0 : undefined}
                >
                  <div className="recent-samples__icon">
                    <FlaskConical size={19} />
                  </div>

                  <div className="recent-samples__content">
                    <div className="recent-samples__heading">
                      <div className="recent-samples__identity">
                        <strong className="recent-samples__code">
                          {sample.code}
                        </strong>

                        <span className="recent-samples__type">
                          {sample.sample_type || "Tipo no especificado"}
                        </span>
                      </div>

                      <Badge variant={status.variant} size="sm">
                        {status.label}
                      </Badge>
                    </div>

                    <div className="recent-samples__metadata">
                      <span className="recent-samples__meta">
                        <MapPin size={13} />
                        {sample.laboratory_area || "Área sin clasificar"}
                      </span>

                      <span className="recent-samples__meta">
                        <CalendarDays size={13} />
                        {formatDate(sample.created_at)}
                      </span>
                    </div>

                    <div className="recent-samples__footer">
                      <Badge variant={risk.variant} size="sm" dot>
                        {risk.label}
                      </Badge>

                      {typeof sample.risk_score === "number" && (
                        <span className="recent-samples__risk-score">
                          Riesgo: {sample.risk_score.toFixed(1)}%
                        </span>
                      )}

                      {sample.anomaly_detected && (
                        <span className="recent-samples__anomaly">
                          <AlertTriangle size={13} />
                          Anomalía detectada
                        </span>
                      )}

                      {sample.status?.toLowerCase() === "completed" && (
                        <span className="recent-samples__completed">
                          <CheckCircle2 size={13} />
                          Finalizada
                        </span>
                      )}
                    </div>
                  </div>

                  {onSampleClick && (
                    <div className="recent-samples__arrow">
                      <ArrowRight size={17} />
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {onViewAll && (
            <div className="recent-samples__footer-action">
              <Button
                variant="outline"
                size="md"
                fullWidth
                rightIcon={<ArrowRight size={16} />}
                onClick={onViewAll}
              >
                Ver todas las muestras
              </Button>
            </div>
          )}

          <span className="recent-samples__total">
            Mostrando {recentSamples.length} de {totalSamples} muestras
          </span>
        </div>
      )}
    </Card>
  );
}