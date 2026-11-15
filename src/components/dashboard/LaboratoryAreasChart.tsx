import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FlaskConical } from "lucide-react";

import Card from "../common/Card";
import Badge from "../common/Badge";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";
import LoadingSpinner from "../common/LoadingSpinner";

export interface LaboratoryAreaData {
  area: string;
  total_samples: number;
  high_risk_samples?: number;
  average_risk?: number;
}

interface LaboratoryAreasChartProps {
  data: LaboratoryAreaData[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onAreaClick?: (area: LaboratoryAreaData) => void;
  title?: string;
  description?: string;
  maxItems?: number;
}

const CHART_COLORS = [
  "#2563eb",
  "#0d9488",
  "#6366f1",
  "#0891b2",
  "#8b5cf6",
  "#64748b",
  "#0f766e",
  "#3b82f6",
];

interface TooltipPayload {
  active?: boolean;
  payload?: Array<{
    payload: LaboratoryAreaData;
  }>;
}

function CustomTooltip({ active, payload }: TooltipPayload) {
  if (!active || !payload?.length) return null;

  const area = payload[0].payload;

  return (
    <div className="laboratory-chart-tooltip">
      <p className="laboratory-chart-tooltip__title">{area.area}</p>

      <div className="laboratory-chart-tooltip__row">
        <span>Muestras registradas</span>
        <strong>{area.total_samples}</strong>
      </div>

      {area.high_risk_samples !== undefined && (
        <div className="laboratory-chart-tooltip__row">
          <span>Muestras de alto riesgo</span>
          <strong className="laboratory-chart-tooltip__risk">
            {area.high_risk_samples}
          </strong>
        </div>
      )}

      {area.average_risk !== undefined && (
        <div className="laboratory-chart-tooltip__row">
          <span>Riesgo promedio</span>
          <strong>{area.average_risk.toFixed(1)}%</strong>
        </div>
      )}
    </div>
  );
}

export default function LaboratoryAreasChart({
  data,
  loading = false,
  error = null,
  onRetry,
  onAreaClick,
  title = "Muestras por área",
  description = "Distribución de muestras registradas en las áreas del laboratorio",
  maxItems = 8,
}: LaboratoryAreasChartProps) {
  const chartData = useMemo(() => {
    return [...data]
      .filter(
        (item) =>
          item.area.trim().length > 0 &&
          Number.isFinite(item.total_samples) &&
          item.total_samples >= 0,
      )
      .sort((a, b) => b.total_samples - a.total_samples)
      .slice(0, Math.max(1, maxItems));
  }, [data, maxItems]);

  const totalSamples = chartData.reduce(
    (total, item) => total + item.total_samples,
    0,
  );

  const totalHighRisk = chartData.reduce(
    (total, item) => total + (item.high_risk_samples ?? 0),
    0,
  );

  const handleBarClick = (entry: LaboratoryAreaData) => {
    onAreaClick?.(entry);
  };

  return (
    <Card
      title={title}
      description={description}
      headerIcon={<FlaskConical size={19} />}
      padding="md"
      className="laboratory-areas-card"
      actions={
        <Badge variant="info" size="sm">
          {chartData.length} áreas
        </Badge>
      }
    >
      {loading ? (
        <div className="laboratory-areas-chart__state">
          <LoadingSpinner
            size="lg"
            text="Cargando áreas del laboratorio..."
          />
        </div>
      ) : error ? (
        <ErrorMessage
          title="No se pudieron cargar las áreas"
          description={error}
          onRetry={onRetry}
          size="sm"
        />
      ) : chartData.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="Sin información disponible"
          description="Todavía no hay muestras registradas por área del laboratorio."
          size="sm"
        />
      ) : (
        <>
          <div className="laboratory-areas-chart__summary">
            <div className="laboratory-areas-chart__summary-item">
              <span className="laboratory-areas-chart__summary-label">
                Total de muestras
              </span>
              <strong className="laboratory-areas-chart__summary-value">
                {totalSamples.toLocaleString("es-MX")}
              </strong>
            </div>

            <div className="laboratory-areas-chart__summary-divider" />

            <div className="laboratory-areas-chart__summary-item">
              <span className="laboratory-areas-chart__summary-label">
                Áreas registradas
              </span>
              <strong className="laboratory-areas-chart__summary-value">
                {chartData.length}
              </strong>
            </div>

            {chartData.some(
              (item) => item.high_risk_samples !== undefined,
            ) && (
              <>
                <div className="laboratory-areas-chart__summary-divider" />

                <div className="laboratory-areas-chart__summary-item">
                  <span className="laboratory-areas-chart__summary-label">
                    Muestras de alto riesgo
                  </span>
                  <strong className="laboratory-areas-chart__summary-value laboratory-areas-chart__summary-value--risk">
                    {totalHighRisk}
                  </strong>
                </div>
              </>
            )}
          </div>

          <div className="laboratory-areas-chart__container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{
                  top: 8,
                  right: 20,
                  bottom: 8,
                  left: 8,
                }}
                barCategoryGap="25%"
              >
                <CartesianGrid
                  horizontal={false}
                  stroke="#e9eef5"
                  strokeDasharray="4 4"
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickMargin={10}
                />

                <YAxis
                  type="category"
                  dataKey="area"
                  width={112}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#475569",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#f1f5f9", radius: 6 }}
                />

                <Bar
                  dataKey="total_samples"
                  name="Muestras"
                  barSize={19}
                  radius={[0, 6, 6, 0]}
                  animationDuration={700}
                  onClick={(entry) => handleBarClick(entry)}
                  style={{ cursor: onAreaClick ? "pointer" : "default" }}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`${entry.area}-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="laboratory-areas-chart__footer">
            <span>
              Mostrando las {chartData.length} áreas con mayor cantidad de
              muestras
            </span>

            <span className="laboratory-areas-chart__footer-indicator">
              <span />
              Datos registrados
            </span>
          </div>
        </>
      )}
    </Card>
  );
}