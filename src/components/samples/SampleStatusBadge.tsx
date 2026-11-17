
import {
  Clock3,
  FlaskConical,
  LoaderCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PackageCheck,
  Activity,
  type LucideIcon,
} from "lucide-react";

export type SampleStatus =
  | "pending"
  | "received"
  | "processing"
  | "completed"
  | "rejected"
  | "cancelled"
  | "in_transit"
  | "stored"
  | "unknown";

export type SampleStatusBadgeSize = "sm" | "md" | "lg";

interface SampleStatusBadgeProps {
  status?: string | null;
  size?: SampleStatusBadgeSize;
  showIcon?: boolean;
  showDot?: boolean;
  showLabel?: boolean;
  className?: string;
  title?: string;
}

interface StatusConfig {
  label: string;
  description: string;
  className: string;
  icon: LucideIcon;
  animated?: boolean;
}

const STATUS_CONFIG: Record<SampleStatus, StatusConfig> = {
  pending: {
    label: "Pendiente",
    description: "La muestra está pendiente de procesamiento",
    className: "sample-status-badge--pending",
    icon: Clock3,
  },
  received: {
    label: "Recibida",
    description: "La muestra ha sido recibida en el laboratorio",
    className: "sample-status-badge--received",
    icon: PackageCheck,
  },
  processing: {
    label: "En procesamiento",
    description: "La muestra se encuentra en procesamiento",
    className: "sample-status-badge--processing",
    icon: LoaderCircle,
    animated: true,
  },
  completed: {
    label: "Completada",
    description: "El procesamiento de la muestra ha finalizado",
    className: "sample-status-badge--completed",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rechazada",
    description: "La muestra ha sido rechazada",
    className: "sample-status-badge--rejected",
    icon: XCircle,
  },
  cancelled: {
    label: "Cancelada",
    description: "El proceso de la muestra ha sido cancelado",
    className: "sample-status-badge--cancelled",
    icon: AlertCircle,
  },
  in_transit: {
    label: "En tránsito",
    description: "La muestra se encuentra en traslado",
    className: "sample-status-badge--transit",
    icon: Activity,
  },
  stored: {
    label: "Almacenada",
    description: "La muestra se encuentra almacenada",
    className: "sample-status-badge--stored",
    icon: FlaskConical,
  },
  unknown: {
    label: "Sin estado",
    description: "No se dispone de información sobre el estado",
    className: "sample-status-badge--unknown",
    icon: AlertCircle,
  },
};

function normalizeStatus(status?: string | null): SampleStatus {
  if (!status) return "unknown";

  const normalized = status
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");

  const aliases: Record<string, SampleStatus> = {
    pending: "pending",
    pendiente: "pending",
    waiting: "pending",
    awaiting: "pending",

    received: "received",
    recibida: "received",
    recibido: "received",

    processing: "processing",
    en_proceso: "processing",
    en_procesamiento: "processing",
    procesando: "processing",
    in_progress: "processing",

    completed: "completed",
    complete: "completed",
    completada: "completed",
    completado: "completed",
    finished: "completed",
    finalizada: "completed",
    finalizado: "completed",

    rejected: "rejected",
    rechazada: "rejected",
    rechazado: "rejected",

    cancelled: "cancelled",
    canceled: "cancelled",
    cancelada: "cancelled",
    cancelado: "cancelled",

    in_transit: "in_transit",
    transit: "in_transit",
    en_transito: "in_transit",
    trasladando: "in_transit",

    stored: "stored",
    almacenada: "stored",
    almacenado: "stored",
    storage: "stored",

    unknown: "unknown",
    desconocido: "unknown",
    sin_estado: "unknown",
    unclassified: "unknown",
  };

  return aliases[normalized] ?? "unknown";
}

export default function SampleStatusBadge({
  status,
  size = "md",
  showIcon = true,
  showDot = false,
  showLabel = true,
  className = "",
  title,
}: SampleStatusBadgeProps) {
  const normalizedStatus = normalizeStatus(status);
  const config = STATUS_CONFIG[normalizedStatus];
  const Icon = config.icon;

  return (
    <span
      className={[
        "sample-status-badge",
        config.className,
        `sample-status-badge--${size}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      title={title ?? config.description}
      role="status"
      aria-label={config.label}
    >
      {showDot && (
        <span
          className="sample-status-badge__dot"
          aria-hidden="true"
        />
      )}

      {showIcon && (
        <Icon
          className={[
            "sample-status-badge__icon",
            config.animated ? "sample-status-badge__icon--animated" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          size={size === "sm" ? 12 : size === "lg" ? 16 : 14}
          aria-hidden="true"
        />
      )}

      {showLabel && (
        <span className="sample-status-badge__label">
          {config.label}
        </span>
      )}
    </span>
  );
}
