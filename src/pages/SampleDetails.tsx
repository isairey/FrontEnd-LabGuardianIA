
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  FlaskConical,
  MapPin,
  Package,
  RefreshCw,
  ShieldAlert,
  Thermometer,
  User,
  Warehouse,
  AlertTriangle,
  ClipboardList,
  FileText,
  Hash,
} from "lucide-react";

import PageContainer from "../components/layout/PageContainer";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import EmptyState from "../components/common/EmptyState";
import SampleRiskBadge from "../components/samples/SampleRiskBadge";
import SampleStatusBadge from "../components/samples/SampleStatusBadge";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1"
).replace(/\/$/, "");

const SAMPLES_ENDPOINT = `${API_BASE_URL}/api/samples`;

interface SampleEvent {
  id: number;
  event_type?: string;
  title?: string;
  description?: string;
  status?: string;
  severity?: string;
  temperature?: number | null;
  duration_minutes?: number | null;
  location?: string | null;
  performed_by?: string | null;
  equipment_name?: string | null;
  occurred_at?: string;
  created_at?: string;
}

interface SampleDetailsData {
  id: number;
  code: string;
  sample_type: string;
  laboratory_area?: string | null;
  priority?: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
  received_at?: string | null;
  processed_at?: string | null;
  completed_at?: string | null;
  risk_score?: number | null;
  risk_level?: string | null;
  risk_explanation?: string | null;
  anomaly_detected?: boolean;
  temperature?: number | null;
  duration?: number | null;
  storage_location?: string | null;
  notes?: string | null;
  registered_by?: string | null;
  responsible_person?: string | null;
  events?: SampleEvent[];
}

const formatDate = (value?: string | null) => {
  if (!value) return "No registrado";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Fecha no válida";

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
};

const formatValue = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") {
    return "No registrado";
  }

  return String(value);
};

const normalizeEvents = (value: unknown): SampleEvent[] => {
  if (Array.isArray(value)) return value as SampleEvent[];

  if (value && typeof value === "object") {
    const response = value as Record<string, unknown>;

    if (Array.isArray(response.items)) {
      return response.items as SampleEvent[];
    }

    if (Array.isArray(response.events)) {
      return response.events as SampleEvent[];
    }

    if (Array.isArray(response.data)) {
      return response.data as SampleEvent[];
    }
  }

  return [];
};

export default function SampleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sample, setSample] = useState<SampleDetailsData | null>(null);
  const [events, setEvents] = useState<SampleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSample = useCallback(async () => {
    if (!id || !/^\d+$/.test(id)) {
      setError("El identificador de la muestra no es válido.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${SAMPLES_ENDPOINT}/${encodeURIComponent(id)}`,
      );

      const payload = response.data?.data ?? response.data?.sample ?? response.data;

      if (!payload || typeof payload !== "object") {
        throw new Error("El servidor devolvió información no válida.");
      }

      setSample(payload as SampleDetailsData);

      const embeddedEvents = normalizeEvents(
        (payload as Record<string, unknown>).events,
      );

      setEvents(embeddedEvents);

      // Si el detalle no incluye eventos, se intenta consultar el historial.
      if (embeddedEvents.length === 0) {
        setEventsLoading(true);

        try {
          const eventsResponse = await axios.get(
            `${SAMPLES_ENDPOINT}/${encodeURIComponent(id)}/events`,
          );

          setEvents(normalizeEvents(eventsResponse.data));
        } catch {
          // El historial es complementario: un endpoint inexistente
          // no debe impedir que se consulte el detalle de la muestra.
          setEvents([]);
        } finally {
          setEventsLoading(false);
        }
      }
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        if (requestError.response?.status === 404) {
          setError("No se encontró la muestra solicitada.");
        } else {
          setError(
            requestError.response?.data?.detail ||
              "No fue posible obtener la información de la muestra.",
          );
        }
      } else {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Ocurrió un error inesperado.",
        );
      }

      setSample(null);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadSample();
  }, [loadSample]);

  const riskScore = useMemo(() => {
    const value = Number(sample?.risk_score);

    if (!Number.isFinite(value)) return null;

    return Math.min(100, Math.max(0, value));
  }, [sample?.risk_score]);

  const riskBarColor = useMemo(() => {
    const level = String(sample?.risk_level || "").toLowerCase();

    if (["critical", "critico", "crítico", "high", "alto"].includes(level)) {
      return "high";
    }

    if (["medium", "medio", "moderado"].includes(level)) {
      return "medium";
    }

    if (["low", "bajo"].includes(level)) {
      return "low";
    }

    return "normal";
  }, [sample?.risk_level]);

  const handleEdit = () => {
    if (sample) {
      navigate(`/samples/${sample.id}/edit`);
    }
  };

  if (loading) {
    return (
      <PageContainer
        title="Detalle de muestra"
        description="Consultando información y trazabilidad."
      >
        <LoadingSpinner
          size="lg"
          text="Cargando información de la muestra..."
          centered
        />
      </PageContainer>
    );
  }

  if (error || !sample) {
    return (
      <PageContainer
        title="Detalle de muestra"
        description="No fue posible cargar la información solicitada."
        actions={
          <Button
            variant="outline"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate("/samples")}
          >
            Volver a muestras
          </Button>
        }
      >
        <ErrorMessage
          title="No se pudo cargar la muestra"
          message={error || "La muestra solicitada no está disponible."}
          onRetry={() => void loadSample()}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`Muestra ${sample.code}`}
      description="Información detallada, evaluación de riesgo y trazabilidad."
      eyebrow="GESTIÓN DE MUESTRAS"
      actions={
        <div className="sample-details-page__header-actions">
          <Button
            variant="outline"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate("/samples")}
          >
            Volver
          </Button>

          <Button
            variant="primary"
            leftIcon={<Edit3 size={16} />}
            onClick={handleEdit}
          >
            Editar muestra
          </Button>
        </div>
      }
    >
      <div className="sample-details-page">
        {/* Resumen principal */}
        <section className="sample-details-page__hero">
          <div className="sample-details-page__hero-main">
            <div className="sample-details-page__hero-icon">
              <FlaskConical size={25} />
            </div>

            <div className="sample-details-page__hero-info">
              <div className="sample-details-page__hero-title">
                <h2>{sample.code}</h2>
                <SampleStatusBadge status={sample.status} />
              </div>

              <p>{sample.sample_type || "Tipo de muestra no especificado"}</p>

              <div className="sample-details-page__hero-meta">
                <span>
                  <Hash size={14} />
                  ID: {sample.id}
                </span>

                <span>
                  <MapPin size={14} />
                  {sample.laboratory_area || "Área no asignada"}
                </span>

                <span>
                  <CalendarDays size={14} />
                  Registrada: {formatDate(sample.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="sample-details-page__hero-risk">
            <span>Nivel de riesgo</span>
            <SampleRiskBadge
              level={sample.risk_level || "unknown"}
              score={riskScore ?? undefined}
              showScore={false}
              size="lg"
            />
          </div>
        </section>

        {/* Indicadores */}
        <section className="sample-details-page__metrics">
          <Card className="sample-details-page__metric-card">
            <div className="sample-details-page__metric">
              <div className="sample-details-page__metric-icon sample-details-page__metric-icon--blue">
                <Thermometer size={20} />
              </div>
              <div>
                <span>Temperatura</span>
                <strong>
                  {sample.temperature !== null &&
                  sample.temperature !== undefined
                    ? `${sample.temperature} °C`
                    : "Sin registro"}
                </strong>
              </div>
            </div>
          </Card>

          <Card className="sample-details-page__metric-card">
            <div className="sample-details-page__metric">
              <div className="sample-details-page__metric-icon sample-details-page__metric-icon--purple">
                <Clock3 size={20} />
              </div>
              <div>
                <span>Duración</span>
                <strong>
                  {sample.duration !== null && sample.duration !== undefined
                    ? `${sample.duration} min`
                    : "Sin registro"}
                </strong>
              </div>
            </div>
          </Card>

          <Card className="sample-details-page__metric-card">
            <div className="sample-details-page__metric">
              <div className="sample-details-page__metric-icon sample-details-page__metric-icon--orange">
                <AlertTriangle size={20} />
              </div>
              <div>
                <span>Anomalías</span>
                <strong>
                  {sample.anomaly_detected ? "Detectada" : "No detectada"}
                </strong>
              </div>
            </div>
          </Card>

          <Card className="sample-details-page__metric-card">
            <div className="sample-details-page__metric">
              <div className="sample-details-page__metric-icon sample-details-page__metric-icon--green">
                <Activity size={20} />
              </div>
              <div>
                <span>Puntuación de riesgo</span>
                <strong>
                  {riskScore !== null ? `${riskScore}/100` : "Sin evaluar"}
                </strong>
              </div>
            </div>
          </Card>
        </section>

        <section className="sample-details-page__content-grid">
          {/* Información general */}
          <Card
            title="Información general"
            description="Datos de identificación y clasificación."
            headerIcon={<ClipboardList size={19} />}
          >
            <div className="sample-details-page__details-list">
              <div>
                <span>Código de muestra</span>
                <strong>{sample.code}</strong>
              </div>

              <div>
                <span>Tipo de muestra</span>
                <strong>{formatValue(sample.sample_type)}</strong>
              </div>

              <div>
                <span>Área del laboratorio</span>
                <strong>{formatValue(sample.laboratory_area)}</strong>
              </div>

              <div>
                <span>Prioridad</span>
                <strong>{formatValue(sample.priority)}</strong>
              </div>

              <div>
                <span>Estado</span>
                <SampleStatusBadge status={sample.status} />
              </div>

              <div>
                <span>Responsable</span>
                <strong>
                  {formatValue(
                    sample.responsible_person || sample.registered_by,
                  )}
                </strong>
              </div>
            </div>
          </Card>

          {/* Almacenamiento */}
          <Card
            title="Almacenamiento y conservación"
            description="Condiciones registradas para la conservación de la muestra."
            headerIcon={<Warehouse size={19} />}
          >
            <div className="sample-details-page__details-list">
              <div>
                <span>Ubicación de almacenamiento</span>
                <strong>
                  {formatValue(sample.storage_location)}
                </strong>
              </div>

              <div>
                <span>Temperatura registrada</span>
                <strong>
                  {sample.temperature !== null &&
                  sample.temperature !== undefined
                    ? `${sample.temperature} °C`
                    : "No registrada"}
                </strong>
              </div>

              <div>
                <span>Duración registrada</span>
                <strong>
                  {sample.duration !== null && sample.duration !== undefined
                    ? `${sample.duration} minutos`
                    : "No registrada"}
                </strong>
              </div>

              <div>
                <span>Fecha de recepción</span>
                <strong>{formatDate(sample.received_at)}</strong>
              </div>
            </div>
          </Card>
        </section>

        {/* Evaluación de riesgo */}
        <Card
          title="Evaluación de riesgo"
          description="Indicadores y explicación de la clasificación registrada."
          headerIcon={<ShieldAlert size={19} />}
        >
          <div className="sample-details-page__risk-section">
            <div className="sample-details-page__risk-header">
              <div>
                <span>Puntuación de riesgo</span>
                <strong>
                  {riskScore !== null ? `${riskScore}%` : "Sin evaluar"}
                </strong>
              </div>

              <SampleRiskBadge
                level={sample.risk_level || "unknown"}
                size="lg"
              />
            </div>

            {riskScore !== null && (
              <div className="sample-details-page__risk-track">
                <div
                  className={`sample-details-page__risk-fill sample-details-page__risk-fill--${riskBarColor}`}
                  style={{ width: `${riskScore}%` }}
                />
              </div>
            )}

            <div className="sample-details-page__risk-explanation">
              <div>
                <FileText size={17} />
                <strong>Explicación del análisis</strong>
              </div>

              <p>
                {sample.risk_explanation ||
                  "No hay una explicación de riesgo registrada para esta muestra."}
              </p>
            </div>

            {sample.anomaly_detected && (
              <div className="sample-details-page__anomaly">
                <AlertTriangle size={18} />
                <div>
                  <strong>Anomalía detectada</strong>
                  <p>
                    Esta muestra tiene un indicador de anomalía registrado.
                    Se recomienda revisar sus eventos y condiciones de
                    procesamiento.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Notas */}
        <Card
          title="Observaciones"
          description="Notas adicionales registradas durante el manejo de la muestra."
          headerIcon={<FileText size={19} />}
        >
          {sample.notes ? (
            <p className="sample-details-page__notes">{sample.notes}</p>
          ) : (
            <EmptyState
              title="Sin observaciones"
              description="No se han registrado notas adicionales para esta muestra."
              icon={FileText}
              size="sm"
            />
          )}
        </Card>

        {/* Historial */}
        <Card
          title="Historial de trazabilidad"
          description="Eventos registrados durante el ciclo de vida de la muestra."
          headerIcon={<Activity size={19} />}
          actions={
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={14} />}
              onClick={() => void loadSample()}
              loading={eventsLoading}
            >
              Actualizar
            </Button>
          }
        >
          {eventsLoading ? (
            <LoadingSpinner text="Consultando historial..." centered />
          ) : events.length > 0 ? (
            <div className="sample-details-page__timeline">
              {events.map((event, index) => (
                <div
                  className="sample-details-page__timeline-item"
                  key={event.id ?? `${event.event_type}-${index}`}
                >
                  <div className="sample-details-page__timeline-marker">
                    <CheckCircle2 size={17} />
                  </div>

                  <div className="sample-details-page__timeline-content">
                    <div className="sample-details-page__timeline-heading">
                      <strong>
                        {event.title ||
                          event.event_type ||
                          "Evento de trazabilidad"}
                      </strong>

                      <span>
                        {formatDate(event.occurred_at || event.created_at)}
                      </span>
                    </div>

                    {event.description && <p>{event.description}</p>}

                    <div className="sample-details-page__timeline-meta">
                      {event.location && (
                        <span>
                          <MapPin size={13} />
                          {event.location}
                        </span>
                      )}

                      {event.performed_by && (
                        <span>
                          <User size={13} />
                          {event.performed_by}
                        </span>
                      )}

                      {event.temperature !== null &&
                        event.temperature !== undefined && (
                          <span>
                            <Thermometer size={13} />
                            {event.temperature} °C
                          </span>
                        )}

                      {event.equipment_name && (
                        <span>
                          <Package size={13} />
                          {event.equipment_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sin eventos de trazabilidad"
              description="Todavía no hay eventos registrados o el servicio de historial no está disponible."
              icon={Activity}
              size="md"
            />
          )}
        </Card>

        {/* Fechas */}
        <Card
          title="Registro del sistema"
          description="Fechas de creación y última actualización."
          headerIcon={<CalendarDays size={19} />}
        >
          <div className="sample-details-page__dates">
            <div>
              <span>Fecha de registro</span>
              <strong>{formatDate(sample.created_at)}</strong>
            </div>

            <div>
              <span>Última actualización</span>
              <strong>{formatDate(sample.updated_at)}</strong>
            </div>

            <div>
              <span>Fecha de procesamiento</span>
              <strong>{formatDate(sample.processed_at)}</strong>
            </div>

            <div>
              <span>Fecha de finalización</span>
              <strong>{formatDate(sample.completed_at)}</strong>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
