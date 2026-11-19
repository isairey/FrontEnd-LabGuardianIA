
import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import PageContainer from "../components/layout/PageContainer";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import EmptyState from "../components/common/EmptyState";

import { useDashboard } from "../hooks/useDashboard";

type RiskLevel = "normal" | "low" | "medium" | "high" | "critical";

interface RiskItem {
  id: number;
  code: string;
  sample_type: string;
  laboratory_area: string;
  risk_level: RiskLevel;
  risk_score: number;
  reason: string;
  created_at: string;
  anomaly_detected: boolean;
}

const riskConfig: Record<
  RiskLevel,
  {
    label: string;
    variant: "success" | "info" | "warning" | "danger" | "neutral";
    description: string;
  }
> = {
  normal: {
    label: "Normal",
    variant: "success",
    description: "Sin indicadores relevantes de riesgo.",
  },
  low: {
    label: "Bajo",
    variant: "info",
    description: "Riesgo reducido. Mantener seguimiento habitual.",
  },
  medium: {
    label: "Medio",
    variant: "warning",
    description: "Requiere supervisión y revisión preventiva.",
  },
  high: {
    label: "Alto",
    variant: "danger",
    description: "Necesita revisión prioritaria.",
  },
  critical: {
    label: "Crítico",
    variant: "danger",
    description: "Requiere atención inmediata del personal responsable.",
  },
};

const normalizeRiskLevel = (value?: string | null): RiskLevel => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (["critical", "critico", "crítico"].includes(normalized)) {
    return "critical";
  }

  if (["high", "alto", "alta"].includes(normalized)) {
    return "high";
  }

  if (["medium", "medio", "moderado"].includes(normalized)) {
    return "medium";
  }

  if (["low", "bajo", "baja"].includes(normalized)) {
    return "low";
  }

  return "normal";
};

const formatDate = (value?: string) => {
  if (!value) return "Fecha no disponible";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getRiskScore = (value: unknown): number => {
  const score = Number(value);

  if (!Number.isFinite(score)) return 0;

  return Math.min(100, Math.max(0, score));
};

export default function RiskAnalysis() {
  const {
    data,
    loading,
    errors,
    refresh,
  } = useDashboard({
    autoFetch: true,
    recentSamplesLimit: 100,
    recentAlertsLimit: 10,
  });

  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | "all">("all");
  const [showOnlyAnomalies, setShowOnlyAnomalies] = useState(false);

  const summary = data?.summary;

  const samples = useMemo<RiskItem[]>(() => {
    return (data?.recentSamples || []).map((sample) => ({
      id: sample.id,
      code: sample.code || `MUE-${sample.id}`,
      sample_type: sample.sample_type || "No especificado",
      laboratory_area: sample.laboratory_area || "Sin área asignada",
      risk_level: normalizeRiskLevel(sample.risk_level),
      risk_score: getRiskScore(sample.risk_score),
      reason:
        sample.anomaly_detected
          ? "Se detectó una anomalía durante el análisis."
          : "Evaluación basada en los indicadores registrados.",
      created_at: sample.created_at,
      anomaly_detected: Boolean(sample.anomaly_detected),
    }));
  }, [data?.recentSamples]);

  const filteredSamples = useMemo(() => {
    return samples.filter((sample) => {
      const matchesRisk =
        selectedRisk === "all" || sample.risk_level === selectedRisk;

      const matchesAnomaly =
        !showOnlyAnomalies || sample.anomaly_detected;

      return matchesRisk && matchesAnomaly;
    });
  }, [samples, selectedRisk, showOnlyAnomalies]);

  const riskCounts = useMemo(() => {
    const counts: Record<RiskLevel, number> = {
      normal: 0,
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    samples.forEach((sample) => {
      counts[sample.risk_level] += 1;
    });

    return counts;
  }, [samples]);

  const totalSamples =
    Number(summary?.total_samples) || samples.length;

  const criticalSamples = riskCounts.critical;
  const highRiskSamples = riskCounts.high + riskCounts.critical;
  const anomalySamples = samples.filter(
    (sample) => sample.anomaly_detected,
  ).length;

  const averageRisk = useMemo(() => {
    if (!samples.length) return 0;

    const total = samples.reduce(
      (accumulator, sample) => accumulator + sample.risk_score,
      0,
    );

    return Math.round(total / samples.length);
  }, [samples]);

  const riskDistribution = [
    {
      level: "critical" as const,
      label: "Crítico",
      count: riskCounts.critical,
      color: "#dc2626",
    },
    {
      level: "high" as const,
      label: "Alto",
      count: riskCounts.high,
      color: "#f97316",
    },
    {
      level: "medium" as const,
      label: "Medio",
      count: riskCounts.medium,
      color: "#eab308",
    },
    {
      level: "low" as const,
      label: "Bajo",
      count: riskCounts.low,
      color: "#0ea5e9",
    },
    {
      level: "normal" as const,
      label: "Normal",
      count: riskCounts.normal,
      color: "#16a34a",
    },
  ];

  const distributionTotal = riskDistribution.reduce(
    (total, item) => total + item.count,
    0,
  );

  const getPercentage = (count: number) => {
    if (!distributionTotal) return 0;

    return Math.round((count / distributionTotal) * 100);
  };

  const handleRefresh = () => {
    void refresh();
  };

  const hasError = Object.values(errors || {}).some(Boolean);

  if (loading.summary && !data?.summary) {
    return (
      <PageContainer
        title="Análisis de riesgos"
        description="Evaluación y monitoreo de riesgos de las muestras."
      >
        <LoadingSpinner
          size="lg"
          text="Cargando análisis de riesgos..."
          centered
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Análisis de riesgos"
      description="Identifica, evalúa y monitorea los riesgos asociados a las muestras del laboratorio."
      eyebrow="INTELIGENCIA Y SEGURIDAD"
      actions={
        <Button
          variant="outline"
          leftIcon={<RefreshCw size={16} />}
          onClick={handleRefresh}
          loading={loading.summary}
        >
          Actualizar análisis
        </Button>
      }
    >
      <div className="risk-analysis-page">
        {hasError && (
          <ErrorMessage
            title="No se pudo completar la actualización"
            message="Algunos indicadores podrían estar desactualizados. Comprueba la conexión con el servidor."
            onRetry={handleRefresh}
          />
        )}

        {/* Indicadores principales */}
        <section className="risk-analysis-page__stats">
          <Card className="risk-analysis-page__stat-card">
            <div className="risk-analysis-page__stat">
              <div className="risk-analysis-page__stat-icon risk-analysis-page__stat-icon--blue">
                <ClipboardList size={21} />
              </div>

              <div>
                <span className="risk-analysis-page__stat-label">
                  Muestras analizadas
                </span>
                <strong>{totalSamples}</strong>
                <small>Registros disponibles</small>
              </div>
            </div>
          </Card>

          <Card className="risk-analysis-page__stat-card">
            <div className="risk-analysis-page__stat">
              <div className="risk-analysis-page__stat-icon risk-analysis-page__stat-icon--red">
                <ShieldAlert size={21} />
              </div>

              <div>
                <span className="risk-analysis-page__stat-label">
                  Riesgo elevado
                </span>
                <strong>{highRiskSamples}</strong>
                <small>Alto y crítico</small>
              </div>
            </div>
          </Card>

          <Card className="risk-analysis-page__stat-card">
            <div className="risk-analysis-page__stat">
              <div className="risk-analysis-page__stat-icon risk-analysis-page__stat-icon--orange">
                <AlertTriangle size={21} />
              </div>

              <div>
                <span className="risk-analysis-page__stat-label">
                  Anomalías detectadas
                </span>
                <strong>{anomalySamples}</strong>
                <small>En las muestras recientes</small>
              </div>
            </div>
          </Card>

          <Card className="risk-analysis-page__stat-card">
            <div className="risk-analysis-page__stat">
              <div className="risk-analysis-page__stat-icon risk-analysis-page__stat-icon--green">
                <Activity size={21} />
              </div>

              <div>
                <span className="risk-analysis-page__stat-label">
                  Riesgo promedio
                </span>
                <strong>{averageRisk}%</strong>
                <small>Sobre las muestras cargadas</small>
              </div>
            </div>
          </Card>
        </section>

        {/* Distribución de riesgos */}
        <section className="risk-analysis-page__overview">
          <Card
            title="Distribución de riesgos"
            description="Clasificación de las muestras según su nivel de riesgo."
            headerIcon={<Activity size={19} />}
          >
            {loading.risks && !data?.risks ? (
              <LoadingSpinner text="Calculando distribución..." centered />
            ) : (
              <div className="risk-analysis-page__distribution">
                <div className="risk-analysis-page__distribution-bar">
                  {riskDistribution.map((item) => (
                    <button
                      key={item.level}
                      type="button"
                      title={`${item.label}: ${item.count}`}
                      className="risk-analysis-page__distribution-segment"
                      style={{
                        width: `${getPercentage(item.count)}%`,
                        backgroundColor: item.color,
                      }}
                      onClick={() => setSelectedRisk(item.level)}
                    />
                  ))}
                </div>

                <div className="risk-analysis-page__distribution-list">
                  {riskDistribution.map((item) => (
                    <button
                      type="button"
                      key={item.level}
                      className={`risk-analysis-page__distribution-item ${
                        selectedRisk === item.level
                          ? "is-selected"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedRisk(
                          selectedRisk === item.level ? "all" : item.level,
                        )
                      }
                    >
                      <span
                        className="risk-analysis-page__legend-dot"
                        style={{ backgroundColor: item.color }}
                      />

                      <span>{item.label}</span>

                      <strong>{item.count}</strong>

                      <small>{getPercentage(item.count)}%</small>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card
            title="Estado general"
            description="Resumen de la evaluación disponible."
            headerIcon={<BrainCircuit size={19} />}
          >
            <div className="risk-analysis-page__health">
              <div className="risk-analysis-page__health-icon">
                {highRiskSamples > 0 ? (
                  <AlertCircle size={27} />
                ) : (
                  <ShieldCheck size={27} />
                )}
              </div>

              <div>
                <Badge
                  variant={highRiskSamples > 0 ? "warning" : "success"}
                  dot
                >
                  {highRiskSamples > 0
                    ? "Requiere seguimiento"
                    : "Sin riesgos elevados"}
                </Badge>

                <h3>
                  {highRiskSamples > 0
                    ? "Se identificaron muestras prioritarias"
                    : "Panorama de riesgo controlado"}
                </h3>

                <p>
                  {highRiskSamples > 0
                    ? "Revisa las muestras con clasificación alta o crítica y verifica las condiciones de procesamiento."
                    : "No se identificaron muestras recientes con riesgo alto o crítico en los registros cargados."}
                </p>
              </div>
            </div>

            <div className="risk-analysis-page__health-footer">
              <span>Riesgo promedio calculado</span>
              <strong>{averageRisk}%</strong>
            </div>
          </Card>
        </section>

        {/* Alertas de atención */}
        <Card
          title="Indicadores de atención"
          description="Elementos que requieren supervisión del personal del laboratorio."
          headerIcon={<AlertTriangle size={19} />}
        >
          <div className="risk-analysis-page__attention">
            <div className="risk-analysis-page__attention-item">
              <div className="risk-analysis-page__attention-icon risk-analysis-page__attention-icon--red">
                <ShieldAlert size={19} />
              </div>

              <div>
                <strong>Muestras críticas</strong>
                <span>Requieren revisión inmediata.</span>
              </div>

              <Badge variant="danger">{criticalSamples}</Badge>
            </div>

            <div className="risk-analysis-page__attention-item">
              <div className="risk-analysis-page__attention-icon risk-analysis-page__attention-icon--orange">
                <TrendingUp size={19} />
              </div>

              <div>
                <strong>Muestras de riesgo alto</strong>
                <span>Necesitan seguimiento prioritario.</span>
              </div>

              <Badge variant="warning">{riskCounts.high}</Badge>
            </div>

            <div className="risk-analysis-page__attention-item">
              <div className="risk-analysis-page__attention-icon risk-analysis-page__attention-icon--blue">
                <BrainCircuit size={19} />
              </div>

              <div>
                <strong>Anomalías registradas</strong>
                <span>Eventos detectados en las muestras recientes.</span>
              </div>

              <Badge variant="info">{anomalySamples}</Badge>
            </div>
          </div>
        </Card>

        {/* Tabla de muestras */}
        <Card
          title="Evaluación de muestras"
          description="Consulta las muestras y sus niveles de riesgo registrados."
          headerIcon={<ClipboardList size={19} />}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOnlyAnomalies((current) => !current)}
            >
              {showOnlyAnomalies ? "Ver todas" : "Solo anomalías"}
            </Button>
          }
        >
          <div className="risk-analysis-page__filters">
            <div className="risk-analysis-page__filter-group">
              <span>Filtrar por nivel:</span>

              <button
                type="button"
                className={selectedRisk === "all" ? "is-active" : ""}
                onClick={() => setSelectedRisk("all")}
              >
                Todos
              </button>

              {riskDistribution.map((item) => (
                <button
                  type="button"
                  key={item.level}
                  className={
                    selectedRisk === item.level ? "is-active" : ""
                  }
                  onClick={() => setSelectedRisk(item.level)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {loading.recentSamples ? (
            <LoadingSpinner text="Cargando muestras..." centered />
          ) : filteredSamples.length === 0 ? (
            <EmptyState
              title="No hay muestras para mostrar"
              description="No se encontraron muestras con los filtros seleccionados."
              icon={ClipboardList}
              size="md"
              action={{
                label: "Limpiar filtros",
                onClick: () => {
                  setSelectedRisk("all");
                  setShowOnlyAnomalies(false);
                },
              }}
            />
          ) : (
            <div className="risk-analysis-page__table-wrapper">
              <table className="risk-analysis-page__table">
                <thead>
                  <tr>
                    <th>Muestra</th>
                    <th>Tipo</th>
                    <th>Área</th>
                    <th>Nivel de riesgo</th>
                    <th>Puntuación</th>
                    <th>Anomalía</th>
                    <th>Fecha</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {filteredSamples.map((sample) => {
                    const config = riskConfig[sample.risk_level];

                    return (
                      <tr key={sample.id}>
                        <td>
                          <strong>{sample.code}</strong>
                        </td>

                        <td>{sample.sample_type}</td>

                        <td>{sample.laboratory_area}</td>

                        <td>
                          <Badge variant={config.variant} dot>
                            {config.label}
                          </Badge>
                        </td>

                        <td>
                          <div className="risk-analysis-page__score">
                            <strong>{sample.risk_score}%</strong>
                            <div>
                              <span
                                style={{
                                  width: `${sample.risk_score}%`,
                                }}
                                className={`risk-analysis-page__score-fill risk-analysis-page__score-fill--${sample.risk_level}`}
                              />
                            </div>
                          </div>
                        </td>

                        <td>
                          {sample.anomaly_detected ? (
                            <Badge variant="warning">Detectada</Badge>
                          ) : (
                            <Badge variant="success">No detectada</Badge>
                          )}
                        </td>

                        <td>{formatDate(sample.created_at)}</td>

                        <td>
                          <button
                            type="button"
                            className="risk-analysis-page__view-button"
                            title={`Consultar muestra ${sample.code}`}
                            onClick={() =>
                              window.location.assign(
                                `/samples/${sample.id}`,
                              )
                            }
                          >
                            <ChevronRight size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="risk-analysis-page__table-footer">
            <span>
              Mostrando {filteredSamples.length} de {samples.length} muestras
            </span>

            <span>
              {showOnlyAnomalies
                ? "Filtro de anomalías activo"
                : "Datos de muestras recientes"}
            </span>
          </div>
        </Card>

        {/* Recomendaciones */}
        <Card
          title="Recomendaciones de supervisión"
          description="Acciones sugeridas a partir de los indicadores registrados."
          headerIcon={<CheckCircle2 size={19} />}
        >
          <div className="risk-analysis-page__recommendations">
            <div>
              <div className="risk-analysis-page__recommendation-icon">
                <ArrowUpRight size={18} />
              </div>

              <section>
                <strong>Priorizar muestras críticas</strong>
                <p>
                  Revisa las muestras con puntuaciones de riesgo más elevadas
                  y documenta las acciones correctivas correspondientes.
                </p>
              </section>
            </div>

            <div>
              <div className="risk-analysis-page__recommendation-icon">
                <Activity size={18} />
              </div>

              <section>
                <strong>Supervisar condiciones de procesamiento</strong>
                <p>
                  Verifica los registros de temperatura, almacenamiento,
                  duración y trazabilidad de las muestras.
                </p>
              </section>
            </div>

            <div>
              <div className="risk-analysis-page__recommendation-icon">
                <ArrowDownRight size={18} />
              </div>

              <section>
                <strong>Dar seguimiento a las anomalías</strong>
                <p>
                  Comprueba los eventos detectados y registra su resolución
                  para mantener la trazabilidad.
                </p>
              </section>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
