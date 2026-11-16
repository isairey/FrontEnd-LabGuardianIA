import type { ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  TrendingUp,
} from "lucide-react";

import Card from "../common/Card";
import Badge from "../common/Badge";
import LoadingSpinner from "../common/LoadingSpinner";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type StatCardVariant =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "purple";

export type StatTrendDirection = "up" | "down" | "neutral";

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  variant?: StatCardVariant;
  trend?: {
    value: number;
    direction: StatTrendDirection;
    label?: string;
    invertColors?: boolean;
  };
  loading?: boolean;
  footer?: ReactNode;
  className?: string;
  onClick?: () => void;
  formatValue?: (value: string | number) => string;
}

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function getTrendLabel(
  direction: StatTrendDirection,
  value: number,
  label?: string
): string {
  if (label) return label;

  const prefix = direction === "up" ? "+" : direction === "down" ? "-" : "";

  return `${prefix}${Math.abs(value)}%`;
}

function getTrendVariant(
  direction: StatTrendDirection,
  invertColors: boolean
): "success" | "danger" | "neutral" {
  if (direction === "neutral") return "neutral";

  const positive = direction === "up";

  if (invertColors) {
    return positive ? "danger" : "success";
  }

  return positive ? "success" : "danger";
}

/* -------------------------------------------------------------------------- */
/*                                  STAT CARD                                 */
/* -------------------------------------------------------------------------- */

export default function StatCard({
  title,
  value,
  description,
  icon,
  variant = "primary",
  trend,
  loading = false,
  footer,
  className = "",
  onClick,
  formatValue,
}: StatCardProps) {
  const displayValue = formatValue ? formatValue(value) : value;

  const trendVariant = trend
    ? getTrendVariant(trend.direction, trend.invertColors ?? false)
    : "neutral";

  const TrendIcon =
    trend?.direction === "up"
      ? ArrowUpRight
      : trend?.direction === "down"
        ? ArrowDownRight
        : Minus;

  return (
    <Card
      className={[
        "stat-card",
        `stat-card--${variant}`,
        onClick ? "stat-card--clickable" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className="stat-card__content"
        onClick={onClick}
        onKeyDown={(event) => {
          if (
            onClick &&
            (event.key === "Enter" || event.key === " ")
          ) {
            event.preventDefault();
            onClick();
          }
        }}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <div className="stat-card__header">
          <div className="stat-card__heading">
            <span className="stat-card__title">{title}</span>

            {description && (
              <span className="stat-card__description">
                {description}
              </span>
            )}
          </div>

          {icon && (
            <div className="stat-card__icon">
              {icon}
            </div>
          )}
        </div>

        <div className="stat-card__main">
          {loading ? (
            <div className="stat-card__loading">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <>
              <strong className="stat-card__value">
                {displayValue}
              </strong>

              {trend && (
                <Badge
                  variant={trendVariant}
                  size="sm"
                  icon={<TrendIcon size={13} />}
                >
                  {getTrendLabel(
                    trend.direction,
                    trend.value,
                    trend.label
                  )}
                </Badge>
              )}
            </>
          )}
        </div>

        {footer && !loading && (
          <div className="stat-card__footer">
            {footer}
          </div>
        )}
      </div>
    </Card>
  );
}