
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  ClipboardList,
  MapPin,
  Thermometer,
  User,
  Wrench,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export type SampleEventStatus =
  | "completed"
  | "success"
  | "pending"
  | "in_progress"
  | "processing"
  | "warning"
  | "failed"
  | "error"
  | "cancelled"
  | "unknown";

export type SampleEventType =
  | "reception"
  | "identification"
  | "temperature"
  | "processing"
  | "analysis"
  | "result"
  | "storage"
  | "transport"
  | "maintenance"
  | "observation"
  | "other";

export interface SampleEventData {
  id: number;
  sample_id: number;
  event_type: string;
  title: string;
  description?: string | null;
  status?: string | null;
  severity?: string | null;
  temperature?: number | null;
  duration_minutes?: number | null;
  location?: string | null;
  performed_by?: string | null;
  equipment_id?: number | null;
  equipment_name?: string | null;
  event_metadata?: Record<string, unknown> | null;
  occurred_at: string;
  created_at?: string | null;
}

export interface SampleEventCardProps {
  event: SampleEventData;
  index?: number;
  isLast?: boolean;
  showConnector?: boolean;
  showSampleId?: boolean;
  compact?: boolean;
  onClick?: (event: SampleEventData) => void;
  className?: string;
}

interface EventTypeConfig {
  label: string;
  icon: LucideIcon;
  color: string;
}

const EVENT_TYPE_CONFIG: Record<string, EventTypeConfig> = {
  reception: {
    label: "Recepción",
    icon: ClipboardList,
    color: "blue",
  },
  received: {
    label: "Recepción",
    icon: ClipboardList,
    color: "blue",
  },
  identification: {
    label: "Identificación",
    icon: Activity,
    color: "purple",
  },
  temperature: {
    label: "Control de temperatura",
    icon: Thermometer,
    color: "orange",
  },
  processing: {
    label: "Procesamiento",
    icon: Activity,
    color: "cyan",
  },
  analysis: {
    label: "Análisis",
    icon: Activity,
    color: "purple",
  },
  result: {
    label: "Resultado",
    icon: CheckCircle2,
    color: "green",
  },
  completed: {
    label: "Finalización",
    icon: CheckCircle2,
    color: "green",
  },
  storage: {
    label: "Almacenamiento",
    icon: MapPin,
    color: "teal",
  },
  transport: {
    label: "Transporte",
    icon: ArrowRight,
    color: "indigo",
  },
  maintenance: {
    label: "Mantenimiento",
    icon: Wrench,
    color: "orange",
  },
  observation: {
    label: "Observación",
    icon: ClipboardList,
    color: "gray",
  },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: string; icon: LucideIcon }
> = {
  completed: {
    label: "Completado",
    variant: "success",
    icon: CheckCircle2,
  },
  success: {
    label: "Exitoso",
    variant: "success",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pendiente",
    variant: "warning",
    icon: Clock,
  },
  in_progress: {
    label: "En progreso",
    variant: "info",
    icon: Activity,
  },
  processing: {
    label: "En proceso",
    variant: "info",
    icon: Activity,
  },
  warning: {
    label: "Advertencia",
    variant: "warning",
    icon: AlertTriangle,
  },
  failed: {
    label: "Fallido",
    variant: "danger",
    icon: XCircle,
  },
  error: {
    label: "Error",
    variant: "danger",
    icon: XCircle,
  },
  cancelled: {
    label: "Cancelado",
    variant: "neutral",
    icon: XCircle,
  },
};

const normalize = (value?: string | null): string =>
  (value ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");

const getEventConfig = (type?: string | null): EventTypeConfig => {
  const key = normalize(type);

  return (
    EVENT_TYPE_CONFIG[key] ?? {
      label: type?.trim() || "Evento",
      icon: Activity,
      color: "gray",
    }
  );
};

const getStatusConfig = (status?: string | null) => {
  const key = normalize(status);

  return (
    STATUS_CONFIG[key] ?? {
      label: status?.trim() || "Sin estado",
      variant: "neutral",
      icon: Clock,
    }
  );
};

const formatDate = (value?: string | null): string => {
  if (!value) return "Fecha no disponible";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatTime = (value?: string | null): string => {
  if (!value) return "--:--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const formatDuration = (minutes?: number | null): string | null => {
  if (minutes === null || minutes === undefined || !Number.isFinite(minutes)) {
    return null;
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0
    ? `${hours} h ${remainingMinutes} min`
    : `${hours} h`;
};

const formatTemperature = (temperature?: number | null): string | null => {
  if (
    temperature === null ||
    temperature === undefined ||
    !Number.isFinite(temperature)
  ) {
    return null;
  }

  return `${temperature.toFixed(1)} °C`;
};

export default function SampleEventCard({
  event,
  index,
  isLast = false,
  showConnector = true,
  showSampleId = false,
  compact = false,
  onClick,
  className = "",
}: SampleEventCardProps) {
  const eventConfig = getEventConfig(event.event_type);
  const statusConfig = getStatusConfig(event.status);
  const EventIcon = eventConfig.icon;
  const StatusIcon = statusConfig.icon;

  const duration = formatDuration(event.duration_minutes);
  const temperature = formatTemperature(event.temperature);

  const isClickable = Boolean(onClick);

  const handleClick = () => {
    onClick?.(event);
  };

  const handleKeyDown = (keyboardEvent: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isClickable) return;

    if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
      keyboardEvent.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={[
        "sample-event-card-wrapper",
        compact ? "sample-event-card-wrapper--compact" : "",
        isLast ? "sample-event-card-wrapper--last" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showConnector && (
        <div className="sample-event-card__timeline" aria-hidden="true">
          <div
            className={`sample-event-card__timeline-icon sample-event-card__timeline-icon--${eventConfig.color}`}
          >
            <EventIcon size={17} strokeWidth={2} />
          </div>

          {!isLast && <div className="sample-event-card__connector" />}
        </div>
      )}

      <div
        className={[
          "sample-event-card",
          isClickable ? "sample-event-card--clickable" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={isClickable ? handleClick : undefined}
        onKeyDown={handleKeyDown}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
      >
        <div className="sample-event-card__header">
          <div className="sample-event-card__heading">
            <div
              className={`sample-event-card__icon sample-event-card__icon--${eventConfig.color}`}
            >
              <EventIcon size={18} />
            </div>

            <div className="sample-event-card__title-group">
              <div className="sample-event-card__title-row">
                <h3 className="sample-event-card__title">
                  {event.title || eventConfig.label}
                </h3>

                {typeof index === "number" && (
                  <span className="sample-event-card__index">
                    #{index + 1}
                  </span>
                )}
              </div>

              <span className="sample-event-card__type">
                {eventConfig.label}
              </span>
            </div>
          </div>

          <span
            className={`sample-event-card__status sample-event-card__status--${statusConfig.variant}`}
          >
            <StatusIcon size={13} />
            {statusConfig.label}
          </span>
        </div>

        {event.description && (
          <p className="sample-event-card__description">
            {event.description}
          </p>
        )}

        <div className="sample-event-card__metadata">
          <div className="sample-event-card__metadata-item">
            <CalendarDays size={15} />
            <span>{formatDate(event.occurred_at)}</span>
          </div>

          <div className="sample-event-card__metadata-item">
            <Clock size={15} />
            <span>{formatTime(event.occurred_at)}</span>
          </div>

          {event.performed_by && (
            <div className="sample-event-card__metadata-item">
              <User size={15} />
              <span>{event.performed_by}</span>
            </div>
          )}

          {event.location && (
            <div className="sample-event-card__metadata-item">
              <MapPin size={15} />
              <span>{event.location}</span>
            </div>
          )}

          {event.equipment_name && (
            <div className="sample-event-card__metadata-item">
              <Wrench size={15} />
              <span>{event.equipment_name}</span>
            </div>
          )}

          {event.equipment_id && !event.equipment_name && (
            <div className="sample-event-card__metadata-item">
              <Wrench size={15} />
              <span>Equipo #{event.equipment_id}</span>
            </div>
          )}

          {temperature && (
            <div className="sample-event-card__metadata-item sample-event-card__metadata-item--temperature">
              <Thermometer size={15} />
              <span>{temperature}</span>
            </div>
          )}

          {duration && (
            <div className="sample-event-card__metadata-item">
              <Clock size={15} />
              <span>{duration}</span>
            </div>
          )}
        </div>

        {showSampleId && (
          <div className="sample-event-card__sample-reference">
            Muestra asociada: #{event.sample_id}
          </div>
        )}
      </div>
    </div>
  );
}
