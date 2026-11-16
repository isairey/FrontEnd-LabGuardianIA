import {
  CheckCircle2,
  AlertTriangle,
  Wrench,
  XCircle,
  Clock3,
  HelpCircle,
  PauseCircle,
} from "lucide-react";

import Badge from "../common/Badge";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type EquipmentStatus =
  | "operational"
  | "available"
  | "active"
  | "maintenance"
  | "under_maintenance"
  | "out_of_service"
  | "inactive"
  | "offline"
  | "calibration"
  | "calibrating"
  | "pending"
  | "disabled"
  | "unknown"
  | string;

export type EquipmentStatusBadgeSize = "sm" | "md" | "lg";

interface EquipmentStatusBadgeProps {
  status: EquipmentStatus;
  size?: EquipmentStatusBadgeSize;
  showIcon?: boolean;
  showDot?: boolean;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*                                  CONFIG                                    */
/* -------------------------------------------------------------------------- */

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant:
      | "default"
      | "primary"
      | "success"
      | "warning"
      | "danger"
      | "info"
      | "neutral"
      | "purple";
    icon: typeof CheckCircle2;
  }
> = {
  operational: {
    label: "Operativo",
    variant: "success",
    icon: CheckCircle2,
  },
  available: {
    label: "Disponible",
    variant: "success",
    icon: CheckCircle2,
  },
  active: {
    label: "Activo",
    variant: "success",
    icon: CheckCircle2,
  },
  maintenance: {
    label: "En mantenimiento",
    variant: "warning",
    icon: Wrench,
  },
  under_maintenance: {
    label: "En mantenimiento",
    variant: "warning",
    icon: Wrench,
  },
  out_of_service: {
    label: "Fuera de servicio",
    variant: "danger",
    icon: XCircle,
  },
  inactive: {
    label: "Inactivo",
    variant: "neutral",
    icon: PauseCircle,
  },
  offline: {
    label: "Desconectado",
    variant: "danger",
    icon: XCircle,
  },
  calibration: {
    label: "En calibración",
    variant: "info",
    icon: Clock3,
  },
  calibrating: {
    label: "En calibración",
    variant: "info",
    icon: Clock3,
  },
  pending: {
    label: "Pendiente",
    variant: "warning",
    icon: Clock3,
  },
  disabled: {
    label: "Deshabilitado",
    variant: "neutral",
    icon: PauseCircle,
  },
  unknown: {
    label: "Desconocido",
    variant: "neutral",
    icon: HelpCircle,
  },
};

/* -------------------------------------------------------------------------- */
/*                            EQUIPMENT STATUS BADGE                          */
/* -------------------------------------------------------------------------- */

export default function EquipmentStatusBadge({
  status,
  size = "md",
  showIcon = true,
  showDot = false,
  className = "",
}: EquipmentStatusBadgeProps) {
  const normalizedStatus = String(status ?? "unknown")
    .trim()
    .toLowerCase()
    .replaceAll(" ", "_")
    .replaceAll("-", "_");

  const config = STATUS_CONFIG[normalizedStatus] ?? {
    label: String(status || "Desconocido"),
    variant: "neutral" as const,
    icon: HelpCircle,
  };

  const StatusIcon = config.icon;

  return (
    <Badge
      variant={config.variant}
      size={size}
      dot={showDot}
      icon={showIcon ? <StatusIcon size={13} /> : undefined}
      className={`equipment-status-badge ${className}`.trim()}
    >
      {config.label}
    </Badge>
  );
}