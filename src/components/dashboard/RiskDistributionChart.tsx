import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import {
  ShieldCheck,
  AlertTriangle,
  Activity,
  AlertCircle,
} from "lucide-react";

import Card from "../common/Card";
import Badge from "../common/Badge";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";
import LoadingSpinner from "../common/LoadingSpinner";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type RiskLevel = "normal" | "low" | "medium" | "high" | "critical";

export interface RiskDistributionData {
  level: RiskLevel | string;
  label?: string;
  count: number;
  percentage?: number;
}

interface RiskDistributionChartProps {
  data: RiskDistributionData[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onLevelClick?: (level: RiskLevel | string) => void;
  title?: string;
  description?: string;
  showLegend?: boolean;
  showPercentages?: boolean;
  showTotal?: boolean;
  height?: number;
}

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

const RISK_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    background: string;
    description: string;
  }
> = {
  normal: {
    label: "Normal",
    color: "#64748b",
    background: "#f1f5f9",
    description: "Muestras sin riesgo detectado",
  },
  low: {
    label: "Bajo",
    color: "#16a34a",
    background: "#dcfce7",
    description: "Riesgo bajo",
  },
  medium: {
    label: "Medio",
    color: "#d97706",
    background: "#fef3c7",
    description: "Requieren seguimiento",
  },
  high: {
    label: "Alto",
    color: "#ea580c",
    background: "#ffedd5",
    description: "Requieren atención prioritaria",
  },
  critical: {
    label: "Crítico",
    color: "#dc2626",
    background: "#fee2e2",
    description: "Requieren atención inmediata",
  },
};

const RISK_ORDER = ["critical", "high", "medium", "low", "normal"];

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function getRiskConfig(level: string) {
  return (
    RISK_CONFIG[level.toLowerCase()] ?? {
      label: level || "Sin clasificar",
      color: "#94a3b8",
      background: "#f1f5f9",
      description: "Nivel de riesgo no clasificado",
    }
  );
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/* -------------------------------------------------------------------------- */
/*                                  TOOLTIP                                   */
/* -------------------------------------------------------------------------- */

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: RiskDistributionData & {
      color: string;
      calculatedPercentage: number;
    };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;
  const config = getRiskConfig(item.level);

  return (
    <div className="risk-distribution__tooltip">
      <div className="risk-distribution__tooltip-heading">
        <span
          className="risk-distribution__tooltip-dot"
          style={{ backgroundColor: item.color }}
        />
        <strong>{config.label}</strong>
      </div>

      <div className="risk-distribution__tooltip-value">
        {item.count} <span>muestras</span>
      </div>

      <div className="risk-distribution__tooltip-percentage">
        {formatPercentage(item.calculatedPercentage)} del total
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            RISK DISTRIBUTION CHART                         */
/* -------------------------------------------------------------------------- */

export default function RiskDistributionChart({
  data,
  loading = false,
  error = null,
  onRetry,
  onLevelClick,
  title = "Distribución de riesgos",
  description = "Clasificación de muestras por nivel de riesgo",
  showLegend = true,
  showPercentages = true,
  showTotal = true,
  height = 250,
}: RiskDistributionChartProps) {
  const chartData = useMemo(() => {
    return [...data]
      .filter((item) => item.count > 0)
      .sort((a, b) => {
        const aIndex = RISK_ORDER.indexOf(a.level.toLowerCase());
        const bIndex = RISK_ORDER.indexOf(b.level.toLowerCase());

        return (
          (aIndex === -1 ? RISK_ORDER.length : aIndex) -
          (bIndex === -1 ? RISK_ORDER.length : bIndex)
        );
      })
      .map((item) => ({
        ...item,
        color: getRiskConfig(item.level).color,
      }));
  }, [data]);

  const totalSamples = useMemo(
    () => chartData.reduce((total, item) => total + item.count, 0),
    [chartData]
  );

  const normalizedData = useMemo(() => {
    return chartData.map((item) => ({
      ...item,
      calculatedPercentage:
        totalSamples > 0 ? (item.count / totalSamples) * 100 : 0,
    }));
  }, [chartData, totalSamples]);

  const highRiskCount = useMemo(
    () =>
      normalizedData
        .filter((item) =>
          ["high", "critical"].includes(item.level.toLowerCase())
        )
        .reduce((total, item) => total + item.count, 0),
    [normalizedData]
  );

  const highRiskPercentage =
    totalSamples > 0 ? (highRiskCount / totalSamples) * 100 : 0;

  const criticalCount = normalizedData
    .filter((item) => item.level.toLowerCase() === "critical")
    .reduce((total, item) => total + item.count, 0);

  return (
    <Card
      title={title}
      description={description}
      className="risk-distribution-card"
    >
      {loading ? (
        <div className="risk-distribution__state">
          <LoadingSpinner
            size="md"
            text="Analizando distribución de riesgos..."
            centered
          />
        </div>
      ) : error ? (
        <div className="risk-distribution__state">
          <ErrorMessage
            title="No se pudo cargar la distribución"
            message={error}
            onRetry={onRetry}
            retryLabel="Reintentar"
          />
        </div>
      ) : normalizedData.length === 0 ? (
        <div className="risk-distribution__state">
          <EmptyState
            icon={Activity}
            title="Sin datos de riesgo"
            description="Cuando existan muestras evaluadas, su distribución aparecerá aquí."
            variant="info"
            size="md"
          />
        </div>
      ) : (
        <div className="risk-distribution">
          <div className="risk-distribution__chart-wrapper">
            <ResponsiveContainer width="100%" height={height}>
              <PieChart>
                <Pie
                  data={normalizedData}
                  dataKey="count"
                  nameKey="level"
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="88%"
                  paddingAngle={3}
                  stroke="none"
                  cornerRadius={5}
                  isAnimationActive
                >
                  {normalizedData.map((item) => (
                    <Cell
                      key={item.level}
                      fill={item.color}
                      style={{ cursor: onLevelClick ? "pointer" : "default" }}
                      onClick={() => onLevelClick?.(item.level)}
                    />
                  ))}
                </Pie>

                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {showTotal && (
              <div className="risk-distribution__center">
                <span className="risk-distribution__center-label">
                  Total de
                </span>
                <strong>{totalSamples}</strong>
                <span className="risk-distribution__center-caption">
                  muestras
                </span>
              </div>
            )}
          </div>

          {showLegend && (
            <div className="risk-distribution__legend">
              {normalizedData.map((item) => {
                const config = getRiskConfig(item.level);

                return (
                  <button
                    type="button"
                    key={item.level}
                    className="risk-distribution__legend-item"
                    onClick={() => onLevelClick?.(item.level)}
                    disabled={!onLevelClick}
                  >
                    <span
                      className="risk-distribution__legend-dot"
                      style={{ backgroundColor: item.color }}
                    />

                    <span className="risk-distribution__legend-label">
                      {item.label || config.label}
                    </span>

                    <strong className="risk-distribution__legend-count">
                      {item.count}
                    </strong>

                    {showPercentages && (
                      <span className="risk-distribution__legend-percentage">
                        {formatPercentage(item.calculatedPercentage)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="risk-distribution__insights">
            <div className="risk-distribution__insight">
              <span className="risk-distribution__insight-icon risk-distribution__insight-icon--warning">
                <AlertTriangle size={16} />
              </span>

              <div>
                <span className="risk-distribution__insight-label">
                  Riesgo alto y crítico
                </span>
                <strong>{highRiskCount} muestras</strong>
              </div>

              <Badge
                variant={highRiskCount > 0 ? "warning" : "success"}
                size="sm"
              >
                {formatPercentage(highRiskPercentage)}
              </Badge>
            </div>

            <div className="risk-distribution__insight">
              <span className="risk-distribution__insight-icon risk-distribution__insight-icon--danger">
                <AlertCircle size={16} />
              </span>

              <div>
                <span className="risk-distribution__insight-label">
                  Riesgo crítico
                </span>
                <strong>{criticalCount} muestras</strong>
              </div>

              <Badge
                variant={criticalCount > 0 ? "danger" : "success"}
                size="sm"
              >
                {formatPercentage(
                  totalSamples > 0
                    ? (criticalCount / totalSamples) * 100
                    : 0
                )}
              </Badge>
            </div>

            <div className="risk-distribution__insight">
              <span className="risk-distribution__insight-icon risk-distribution__insight-icon--success">
                <ShieldCheck size={16} />
              </span>

              <div>
                <span className="risk-distribution__insight-label">
                  Muestras sin riesgo alto
                </span>
                <strong>{totalSamples - highRiskCount} muestras</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}