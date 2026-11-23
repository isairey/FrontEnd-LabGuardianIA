
/**
 * LabGuardian AI
 * src/utils/formatRisk.ts
 *
 * Utilidades para normalizar, interpretar y presentar
 * los niveles de riesgo de muestras y análisis clínicos.
 */

import type { SampleRiskLevel } from "../types/sample";

// ============================================================
// TYPES
// ============================================================

export type RiskLevel = SampleRiskLevel;

export type RiskColor = {
  text: string;
  background: string;
  border: string;
  indicator: string;
};

export type RiskPresentation = {
  label: string;
  description: string;
  level: RiskLevel;
  color: RiskColor;
  priority: number;
  requiresAttention: boolean;
};

export type RiskScoreResult = {
  score: number;
  level: RiskLevel;
  label: string;
  requiresAttention: boolean;
};

export type RiskFactorInput = {
  name: string;
  score?: number;
  weight?: number;
};

export type RiskThresholds = {
  low: number;
  medium: number;
  high: number;
  critical: number;
};

// ============================================================
// CONSTANTS
// ============================================================

export const DEFAULT_RISK_THRESHOLDS: RiskThresholds = {
  low: 25,
  medium: 50,
  high: 75,
  critical: 90,
};

/**
 * Estos colores son clases Tailwind.
 * Si tu proyecto utiliza otras clases de diseño,
 * puedes ajustarlas desde aquí.
 */
export const RISK_COLORS: Record<RiskLevel, RiskColor> = {
  low: {
    text: "text-emerald-700",
    background: "bg-emerald-50",
    border: "border-emerald-200",
    indicator: "bg-emerald-500",
  },
  medium: {
    text: "text-amber-700",
    background: "bg-amber-50",
    border: "border-amber-200",
    indicator: "bg-amber-500",
  },
  high: {
    text: "text-orange-700",
    background: "bg-orange-50",
    border: "border-orange-200",
    indicator: "bg-orange-500",
  },
  critical: {
    text: "text-red-700",
    background: "bg-red-50",
    border: "border-red-200",
    indicator: "bg-red-500",
  },
  unknown: {
    text: "text-slate-600",
    background: "bg-slate-50",
    border: "border-slate-200",
    indicator: "bg-slate-400",
  },
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Bajo",
  medium: "Moderado",
  high: "Alto",
  critical: "Crítico",
  unknown: "Sin evaluar",
};

export const RISK_DESCRIPTIONS: Record<RiskLevel, string> = {
  low: "La muestra presenta condiciones de riesgo bajas.",
  medium: "Se recomienda mantener seguimiento preventivo.",
  high: "La muestra requiere revisión prioritaria.",
  critical: "La muestra requiere atención inmediata.",
  unknown: "No existe información suficiente para determinar el riesgo.",
};

export const RISK_PRIORITY: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
  unknown: 0,
};

// ============================================================
// NORMALIZATION
// ============================================================

/**
 * Normaliza valores de riesgo provenientes del backend.
 */
export function normalizeRiskLevel(value: unknown): RiskLevel {
  if (typeof value !== "string") {
    return "unknown";
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]+/g, "");

  switch (normalized) {
    case "low":
    case "bajo":
    case "leve":
      return "low";

    case "medium":
    case "moderate":
    case "moderado":
    case "medio":
      return "medium";

    case "high":
    case "alto":
    case "elevado":
      return "high";

    case "critical":
    case "critico":
    case "severe":
    case "severo":
      return "critical";

    case "unknown":
    case "none":
    case "na":
    case "notavailable":
    case "sinriesgo":
    case "sinevaluar":
    case "pendiente":
      return "unknown";

    default:
      return "unknown";
  }
}

/**
 * Comprueba si un valor representa un nivel de riesgo válido.
 */
export function isRiskLevel(value: unknown): value is RiskLevel {
  return (
    typeof value === "string" &&
    ["low", "medium", "high", "critical", "unknown"].includes(value)
  );
}

// ============================================================
// SCORE
// ============================================================

/**
 * Convierte una puntuación numérica a un rango de 0 a 100.
 */
export function normalizeRiskScore(score: unknown): number {
  if (
    typeof score !== "number" ||
    !Number.isFinite(score)
  ) {
    return 0;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Obtiene el nivel correspondiente a una puntuación.
 *
 * Umbrales predeterminados:
 * 0-24: bajo
 * 25-49: moderado
 * 50-74: alto
 * 75-100: crítico
 *
 * Los umbrales son convenciones de presentación.
 * Deben coincidir con los criterios del modelo de IA
 * y los protocolos de calidad del laboratorio.
 */
export function getRiskLevelFromScore(
  score: number,
  thresholds: RiskThresholds = DEFAULT_RISK_THRESHOLDS,
): RiskLevel {
  const normalizedScore = normalizeRiskScore(score);

  if (normalizedScore >= thresholds.high) {
    return "critical";
  }

  if (normalizedScore >= thresholds.medium) {
    return "high";
  }

  if (normalizedScore >= thresholds.low) {
    return "medium";
  }

  return "low";
}

/**
 * Genera un resultado completo a partir de una puntuación.
 */
export function formatRiskScore(score: number): RiskScoreResult {
  const normalizedScore = normalizeRiskScore(score);
  const level = getRiskLevelFromScore(normalizedScore);

  return {
    score: normalizedScore,
    level,
    label: RISK_LABELS[level],
    requiresAttention: requiresRiskAttention(level),
  };
}

/**
 * Presenta una puntuación como porcentaje.
 */
export function formatRiskPercentage(
  score: number,
  decimals = 0,
): string {
  const normalizedScore = normalizeRiskScore(score);

  return `${normalizedScore.toFixed(
    Math.max(0, Math.min(2, decimals)),
  )}%`;
}

// ============================================================
// PRESENTATION
// ============================================================

/**
 * Obtiene el nombre legible de un nivel de riesgo.
 */
export function getRiskLabel(value: unknown): string {
  return RISK_LABELS[normalizeRiskLevel(value)];
}

/**
 * Obtiene la descripción de un nivel de riesgo.
 */
export function getRiskDescription(value: unknown): string {
  return RISK_DESCRIPTIONS[normalizeRiskLevel(value)];
}

/**
 * Obtiene las clases visuales de un nivel de riesgo.
 */
export function getRiskColor(value: unknown): RiskColor {
  return RISK_COLORS[normalizeRiskLevel(value)];
}

/**
 * Devuelve toda la información visual de un nivel.
 */
export function getRiskPresentation(
  value: unknown,
): RiskPresentation {
  const level = normalizeRiskLevel(value);

  return {
    label: RISK_LABELS[level],
    description: RISK_DESCRIPTIONS[level],
    level,
    color: RISK_COLORS[level],
    priority: RISK_PRIORITY[level],
    requiresAttention: requiresRiskAttention(level),
  };
}

/**
 * Devuelve las clases CSS de texto.
 */
export function getRiskTextClass(value: unknown): string {
  return getRiskColor(value).text;
}

/**
 * Devuelve las clases CSS de fondo.
 */
export function getRiskBackgroundClass(value: unknown): string {
  return getRiskColor(value).background;
}

/**
 * Devuelve las clases CSS de borde.
 */
export function getRiskBorderClass(value: unknown): string {
  return getRiskColor(value).border;
}

/**
 * Devuelve la clase CSS del indicador.
 */
export function getRiskIndicatorClass(value: unknown): string {
  return getRiskColor(value).indicator;
}

// ============================================================
// ATTENTION & PRIORITY
// ============================================================

/**
 * Determina si un nivel requiere atención.
 */
export function requiresRiskAttention(value: unknown): boolean {
  const level = normalizeRiskLevel(value);

  return level === "high" || level === "critical";
}

/**
 * Determina si el riesgo requiere atención inmediata.
 */
export function requiresImmediateRiskAttention(
  value: unknown,
): boolean {
  return normalizeRiskLevel(value) === "critical";
}

/**
 * Compara dos niveles de riesgo.
 *
 * Retorna:
 * -1 si el primero tiene menor prioridad.
 *  0 si tienen la misma prioridad.
 *  1 si el primero tiene mayor prioridad.
 */
export function compareRiskLevels(
  first: unknown,
  second: unknown,
): number {
  const firstPriority = RISK_PRIORITY[normalizeRiskLevel(first)];
  const secondPriority = RISK_PRIORITY[normalizeRiskLevel(second)];

  return Math.sign(firstPriority - secondPriority);
}

/**
 * Ordena niveles de riesgo de mayor a menor prioridad.
 */
export function sortRiskLevels(
  levels: RiskLevel[],
): RiskLevel[] {
  return [...levels].sort(
    (a, b) => RISK_PRIORITY[b] - RISK_PRIORITY[a],
  );
}

// ============================================================
// RISK FACTORS
// ============================================================

/**
 * Calcula una puntuación ponderada de factores de riesgo.
 *
 * Esta función es auxiliar para presentar datos.
 * No sustituye el modelo predictivo ni sus reglas clínicas.
 */
export function calculateWeightedRiskScore(
  factors: RiskFactorInput[],
): number {
  const validFactors = factors.filter(
    (factor) =>
      typeof factor.score === "number" &&
      Number.isFinite(factor.score),
  );

  if (validFactors.length === 0) {
    return 0;
  }

  let weightedTotal = 0;
  let totalWeight = 0;

  for (const factor of validFactors) {
    const score = normalizeRiskScore(factor.score);
    const weight =
      typeof factor.weight === "number" &&
      Number.isFinite(factor.weight) &&
      factor.weight > 0
        ? factor.weight
        : 1;

    weightedTotal += score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) {
    return 0;
  }

  return normalizeRiskScore(weightedTotal / totalWeight);
}

// ============================================================
// RECOMMENDATIONS
// ============================================================

/**
 * Genera recomendaciones generales según el nivel.
 *
 * Son orientativas: las acciones definitivas deben basarse
 * en los protocolos del laboratorio y la evaluación profesional.
 */
export function getRiskRecommendations(
  value: unknown,
): string[] {
  const level = normalizeRiskLevel(value);

  switch (level) {
    case "low":
      return [
        "Mantener las condiciones actuales de almacenamiento.",
        "Continuar con el procedimiento establecido.",
        "Registrar los controles de rutina.",
      ];

    case "medium":
      return [
        "Revisar las condiciones de conservación.",
        "Verificar los registros de trazabilidad.",
        "Mantener seguimiento durante el procesamiento.",
      ];

    case "high":
      return [
        "Priorizar la revisión de la muestra.",
        "Verificar posibles desviaciones del procedimiento.",
        "Documentar los hallazgos y las acciones realizadas.",
        "Solicitar evaluación del responsable del laboratorio.",
      ];

    case "critical":
      return [
        "Notificar inmediatamente al responsable del laboratorio.",
        "Revisar la integridad y las condiciones de la muestra.",
        "Documentar la incidencia y las medidas adoptadas.",
        "Seguir el protocolo de calidad correspondiente antes de continuar.",
      ];

    case "unknown":
    default:
      return [
        "Completar la información necesaria para evaluar el riesgo.",
        "Verificar los datos de identificación y trazabilidad.",
        "No interpretar la ausencia de evaluación como ausencia de riesgo.",
      ];
  }
}

// ============================================================
// UTILITIES
// ============================================================

/**
 * Devuelve un texto descriptivo para una puntuación.
 */
export function getRiskScoreDescription(score: number): string {
  const result = formatRiskScore(score);

  return `${result.label} (${formatRiskPercentage(result.score)})`;
}

/**
 * Devuelve un indicador textual de prioridad.
 */
export function getRiskPriorityLabel(value: unknown): string {
  const level = normalizeRiskLevel(value);

  switch (level) {
    case "critical":
      return "Prioridad inmediata";

    case "high":
      return "Prioridad alta";

    case "medium":
      return "Seguimiento preventivo";

    case "low":
      return "Prioridad normal";

    case "unknown":
    default:
      return "Pendiente de evaluación";
  }
}

/**
 * Obtiene una clase de ancho para una barra de progreso.
 */
export function getRiskProgressWidth(score: number): string {
  return `${normalizeRiskScore(score)}%`;
}

/**
 * Determina si una puntuación es válida.
 */
export function isValidRiskScore(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100
  );
}

/**
 * Obtiene el nivel más alto dentro de una colección.
 */
export function getHighestRisk(
  levels: Array<unknown>,
): RiskLevel {
  if (levels.length === 0) {
    return "unknown";
  }

  return sortRiskLevels(
    levels.map(normalizeRiskLevel),
  )[0] ?? "unknown";
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

const formatRisk = {
  normalizeRiskLevel,
  isRiskLevel,
  normalizeRiskScore,
  getRiskLevelFromScore,
  formatRiskScore,
  formatRiskPercentage,
  getRiskLabel,
  getRiskDescription,
  getRiskColor,
  getRiskPresentation,
  getRiskTextClass,
  getRiskBackgroundClass,
  getRiskBorderClass,
  getRiskIndicatorClass,
  requiresRiskAttention,
  requiresImmediateRiskAttention,
  compareRiskLevels,
  sortRiskLevels,
  calculateWeightedRiskScore,
  getRiskRecommendations,
  getRiskScoreDescription,
  getRiskPriorityLabel,
  getRiskProgressWidth,
  isValidRiskScore,
  getHighestRisk,
};

export default formatRisk;
