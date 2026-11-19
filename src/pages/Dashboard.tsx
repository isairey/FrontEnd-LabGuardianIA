
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Beaker,
  Bell,
  CheckCircle2,
  Clock,
  FlaskConical,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

import PageContainer from "../components/layout/PageContainer";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import ErrorMessage from "../components/common/ErrorMessage";

import StatCard from "../components/dashboard/StatCard";
import RiskDistributionChart from "../components/dashboard/RiskDistributionChart";
import LaboratoryAreasChart from "../components/dashboard/LaboratoryAreasChart";
import RecentAlerts from "../components/dashboard/RecentAlerts";
import RecentSamples from "../components/dashboard/RecentSamples";

import { useDashboard } from "../hooks/useDashboard";

export default function Dashboard() {
  const navigate = useNavigate();

  const {
    data,
    loading,
    errors,
    error,
    refresh,
    fetchSummary,
    fetchRisks,
    fetchAreas,
    fetchRecentAlerts,
    fetchRecentSamples,
  } = useDashboard({
    autoFetch: true,
    recentAlertsLimit: 5,
    recentSamplesLimit: 5,
  });

  const summary = data.summary;

  // -----------------------------------------------
  // INDICADORES
  // -----------------------------------------------

  const totalSamples = summary.total_samples ?? 0;
  const activeAlerts = summary.active_alerts ?? 0;
  const averageRisk = summary.average_risk ?? 0;

  const highRiskSamples =
    (summary.high_risk_samples ?? 0) +
    (summary.critical_risk_samples ?? 0);

  const completedSamples = summary.completed_samples ?? 0;
  const processingSamples = summary.processing_samples ?? 0;
  const pendingSamples = summary.pending_samples ?? 0;

  const riskPercentage = useMemo(() => {
    if (totalSamples <= 0) return 0;

    return Math.round(
      (highRiskSamples / totalSamples) * 100
    );
  }, [highRiskSamples, totalSamples]);

  const isInitialLoading =
    loading.summary &&
    loading.risks &&
    loading.areas &&
    loading.recentAlerts &&
    loading.recentSamples;

  // -----------------------------------------------
  // ACTUALIZACIÓN
  // -----------------------------------------------

  const handleRefresh = async () => {
    try {
      await refresh();
    } catch {
      // El hook conserva los errores de cada sección.
    }
  };

  // -----------------------------------------------
  // RENDER
  // -----------------------------------------------

  return (
    <PageContainer
      title="Dashboard"
      description="Monitoreo inteligente de muestras, riesgos y actividad del laboratorio."
      eyebrow="CENTRO DE CONTROL"
      actions={
        <div className="dashboard-page__header-actions">
          <Badge variant="success" dot>
            Sistema operativo
          </Badge>

          <Button
            variant="outline"
            leftIcon={<RefreshCw size={16} />}
            onClick={() => void handleRefresh()}
            loading={isInitialLoading}
          >
            Actualizar
          </Button>
        </div>
      }
    >
      <div className="dashboard-page">

        {/* ERROR GENERAL */}

        {error && !isInitialLoading && (
          <ErrorMessage
            title="Error al actualizar el dashboard"
            message={error}
            onRetry={() => void handleRefresh()}
          />
        )}

        {/* INDICADORES PRINCIPALES */}

        <section className="dashboard-page__stats">
          <StatCard
            title="Total de muestras"
            value={totalSamples}
            description="Muestras registradas"
            icon={<Beaker size={21} />}
            variant="primary"
            loading={loading.summary}
            onClick={() => navigate("/samples")}
          />

          <StatCard
            title="Alertas activas"
            value={activeAlerts}
            description="Requieren atención"
            icon={<AlertTriangle size={21} />}
            variant="danger"
            loading={loading.summary}
            onClick={() => navigate("/alerts")}
          />

          <StatCard
            title="Riesgo promedio"
            value={`${averageRisk.toFixed(1)}%`}
            description="Índice general del laboratorio"
            icon={<Activity size={21} />}
            variant="warning"
            loading={loading.summary}
          />

          <StatCard
            title="Muestras de alto riesgo"
            value={highRiskSamples}
            description={`${riskPercentage}% del total registrado`}
            icon={<ShieldAlert size={21} />}
            variant="purple"
            loading={loading.summary}
            onClick={() => navigate("/risk-analysis")}
          />
        </section>

        {/* ESTADO OPERATIVO */}

        <section className="dashboard-page__operational">
          <div className="dashboard-page__section-heading">
            <div>
              <h2>Estado operativo</h2>
              <p>Resumen del procesamiento de muestras.</p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight size={15} />}
              onClick={() => navigate("/samples")}
            >
              Ver muestras
            </Button>
          </div>

          <div className="dashboard-page__operational-grid">
            <div className="dashboard-page__operational-item">
              <div className="dashboard-page__operational-icon dashboard-page__operational-icon--blue">
                <Clock size={19} />
              </div>

              <div>
                <span>Pendientes</span>
                <strong>
                  {loading.summary ? "—" : pendingSamples}
                </strong>
              </div>
            </div>

            <div className="dashboard-page__operational-item">
              <div className="dashboard-page__operational-icon dashboard-page__operational-icon--orange">
                <Activity size={19} />
              </div>

              <div>
                <span>En procesamiento</span>
                <strong>
                  {loading.summary ? "—" : processingSamples}
                </strong>
              </div>
            </div>

            <div className="dashboard-page__operational-item">
              <div className="dashboard-page__operational-icon dashboard-page__operational-icon--green">
                <CheckCircle2 size={19} />
              </div>

              <div>
                <span>Completadas</span>
                <strong>
                  {loading.summary ? "—" : completedSamples}
                </strong>
              </div>
            </div>

            <div className="dashboard-page__operational-item">
              <div className="dashboard-page__operational-icon dashboard-page__operational-icon--purple">
                <TrendingUp size={19} />
              </div>

              <div>
                <span>Alto riesgo</span>
                <strong>
                  {loading.summary ? "—" : highRiskSamples}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* GRÁFICAS */}

        <section className="dashboard-page__charts">
          <div className="dashboard-page__chart-main">
            <RiskDistributionChart
              data={data.risks}
              loading={loading.risks}
              error={errors.risks}
              onRetry={() => void fetchRisks()}
              title="Distribución de riesgos"
              description="Clasificación de muestras según su nivel de riesgo."
              showLegend
              showPercentages
              showTotal
              height={290}
              onLevelClick={(level) =>
                navigate(
                  `/samples?risk_level=${encodeURIComponent(level)}`
                )
              }
            />
          </div>

          <div className="dashboard-page__chart-secondary">
            <LaboratoryAreasChart
              data={data.areas}
              loading={loading.areas}
              error={errors.areas}
              onRetry={() => void fetchAreas()}
              title="Actividad por área"
              description="Distribución de muestras entre las áreas del laboratorio."
              maxItems={6}
              onAreaClick={(area) =>
                navigate(
                  `/samples?laboratory_area=${encodeURIComponent(area)}`
                )
              }
            />
          </div>
        </section>

        {/* ACTIVIDAD RECIENTE */}

        <section className="dashboard-page__activity">
          <div className="dashboard-page__activity-heading">
            <div>
              <h2>Actividad reciente</h2>
              <p>
                Últimos eventos y registros del laboratorio.
              </p>
            </div>

            <Badge variant="info">
              Datos del laboratorio
            </Badge>
          </div>

          <div className="dashboard-page__activity-grid">
            <div className="dashboard-page__activity-card">
              <RecentAlerts
                alerts={data.recentAlerts}
                loading={loading.recentAlerts}
                error={errors.recentAlerts}
                onRetry={() => void fetchRecentAlerts()}
                onViewAll={() => navigate("/alerts")}
                onAlertClick={(alert) =>
                  navigate("/alerts", {
                    state: {
                      selectedAlertId: alert.id,
                    },
                  })
                }
                maxItems={5}
                title="Alertas recientes"
                description="Eventos que requieren seguimiento."
              />
            </div>

            <div className="dashboard-page__activity-card">
              <RecentSamples
                samples={data.recentSamples}
                loading={loading.recentSamples}
                error={errors.recentSamples}
                onRetry={() => void fetchRecentSamples()}
                onViewAll={() => navigate("/samples")}
                onSampleClick={(sample) =>
                  navigate(`/samples/${sample.id}`)
                }
                maxItems={5}
                title="Muestras recientes"
                description="Últimas muestras registradas."
              />
            </div>
          </div>
        </section>

        {/* ACCESOS RÁPIDOS */}

        <section className="dashboard-page__quick-access">
          <div className="dashboard-page__section-heading">
            <div>
              <h2>Accesos rápidos</h2>
              <p>Accede directamente a los módulos principales.</p>
            </div>
          </div>

          <div className="dashboard-page__quick-grid">
            <button
              type="button"
              className="dashboard-page__quick-card"
              onClick={() => navigate("/samples")}
            >
              <div className="dashboard-page__quick-icon dashboard-page__quick-icon--blue">
                <Beaker size={21} />
              </div>

              <div>
                <strong>Gestión de muestras</strong>
                <span>Consultar y administrar muestras.</span>
              </div>

              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              className="dashboard-page__quick-card"
              onClick={() => navigate("/alerts")}
            >
              <div className="dashboard-page__quick-icon dashboard-page__quick-icon--red">
                <Bell size={21} />
              </div>

              <div>
                <strong>Centro de alertas</strong>
                <span>Supervisar eventos y notificaciones.</span>
              </div>

              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              className="dashboard-page__quick-card"
              onClick={() => navigate("/traceability")}
            >
              <div className="dashboard-page__quick-icon dashboard-page__quick-icon--green">
                <Activity size={21} />
              </div>

              <div>
                <strong>Trazabilidad</strong>
                <span>Consultar el historial de muestras.</span>
              </div>

              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              className="dashboard-page__quick-card"
              onClick={() => navigate("/equipment")}
            >
              <div className="dashboard-page__quick-icon dashboard-page__quick-icon--purple">
                <FlaskConical size={21} />
              </div>

              <div>
                <strong>Equipamiento</strong>
                <span>Supervisar equipos y calibraciones.</span>
              </div>

              <ArrowRight size={17} />
            </button>
          </div>
        </section>

      </div>
    </PageContainer>
  );
}
