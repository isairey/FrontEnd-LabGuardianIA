
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Activity,
  type LucideIcon,
} from "lucide-react";

export type SampleRiskLevel =
  | "normal"
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

export type SampleRiskBadgeSize = "sm" | "md" | "lg";

interface SampleRiskBadgeProps {
  level?: string | null;
  score?: number | null;
  size?: SampleRiskBadgeSize;
  showIcon?: boolean;
  showScore?: boolean;
  showLabel?: boolean;
  showDot?: boolean;
  className?: string;
  title?: string;
}

interface RiskConfig {
  label: string;
  description: string;
  className: string;
  icon: LucideIcon;
}

const RISK_CONFIG: Record<SampleRiskLevel, RiskConfig> = {
  normal: {
    label: "Normal",
    description: "Sin riesgo significativo detectado",
    className: "sample-risk-badge--normal",
    icon: ShieldCheck,
  },
  low: {
    label: "Bajo",
    description: "Riesgo bajo",
    className: "sample-risk-badge--low",
    icon: ShieldCheck,
  },
  medium: {
    label: "Medio",
    description: "Riesgo moderado",
    className: "sample-risk-badge--medium",
    icon: AlertTriangle,
  },
  high: {
    label: "Alto",
    description: "Riesgo elevado",
    className: "sample-risk-badge--high",
    icon: ShieldAlert,
  },
  critical: {
    label: "Crítico",
    description: "Riesgo crítico que requiere atención",
    className: "sample-risk-badge--critical",
    icon: AlertCircle,
  },
  unknown: {
    label: "Sin evaluar",
    description: "El nivel de riesgo aún no está disponible",
    className: "sample-risk-badge--unknown",
    icon: Activity,
  },
};

function normalizeRiskLevel(level?: string | null): SampleRiskLevel {
  if (!level) return "unknown";

  const normalized = level
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");

  const aliases: Record<string, SampleRiskLevel> = {
    normal: "normal",
    none: "normal",
    sin_riesgo: "normal",
    low: "low",
    bajo: "low",
    riesgo_bajo: "low",
    medium: "medium",
    moderate: "medium",
    medio: "medium",
    moderado: "medium",
    riesgo_medio: "medium",
    high: "high",
    alto: "high",
    riesgo_alto: "high",
    critical: "critical",
    critico: "critical",
    critico_alto: "critical",
    riesgo_critico: "critical",
    unknown: "unknown",
    pending: "unknown",
    pendiente: "unknown",
    unclassified: "unknown",
    sin_clasificar: "unknown",
  };

  return aliases[normalized] ?? "unknown";
}

export default function SampleRiskBadge({
  level,
  score,
  size = "md",
  showIcon = true,
  showScore = false,
  showLabel = true,
  showDot = false,
  className = "",
  title,
}: SampleRiskBadgeProps) {
  const normalizedLevel = normalizeRiskLevel(level);
  const config = RISK_CONFIG[normalizedLevel];
  const Icon = config.icon;

  const validScore =
    typeof score === "number" && Number.isFinite(score)
      ? Math.min(100, Math.max(0, score))
      : null;

  const formattedScore =
    validScore !== null ? Math.round(validScore) : null;

  const accessibleLabel = [
    config.label,
    formattedScore !== null ? `Puntuación de riesgo ${formattedScore}` : "",
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <span
      className={[
        "sample-risk-badge",
        config.className,
        `sample-risk-badge--${size}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      title={title ?? config.description}
      role="status"
      aria-label={accessibleLabel}
    >
      {showDot && (
        <span
          className="sample-risk-badge__dot"
          aria-hidden="true"
        />
      )}

      {showIcon && (
        <Icon
          className="sample-risk-badge__icon"
          size={size === "sm" ? 12 : size === "lg" ? 16 : 14}
          aria-hidden="true"
        />
      )}

      {showLabel && (
        <span className="sample-risk-badge__label">
          {config.label}
        </span>
      )}

      {showScore && formattedScore !== null && (
        <span className="sample-risk-badge__score">
          {formattedScore}/100
        </span>
      )}
    </span>
  );
}
