
import { useEffect, useState } from "react";
import {
  Save,
  X,
  FlaskConical,
  ClipboardList,
  Thermometer,
  MapPin,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export interface SampleFormData {
  code: string;
  sample_type: string;
  laboratory_area: string;
  priority: string;
  status: string;
  temperature: string;
  storage_location: string;
  duration: string;
  notes: string;
}

interface SampleFormProps {
  initialData?: Partial<SampleFormData>;
  isEditing?: boolean;
  loading?: boolean;
  onSubmit: (data: SampleFormData) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  className?: string;
}

interface FormErrors {
  code?: string;
  sample_type?: string;
  laboratory_area?: string;
  priority?: string;
  temperature?: string;
  storage_location?: string;
  duration?: string;
}

const DEFAULT_FORM: SampleFormData = {
  code: "",
  sample_type: "",
  laboratory_area: "",
  priority: "normal",
  status: "received",
  temperature: "",
  storage_location: "",
  duration: "",
  notes: "",
};

const SAMPLE_TYPES = [
  "Sangre",
  "Suero",
  "Plasma",
  "Orina",
  "Heces",
  "Tejido",
  "Hisopo",
  "Saliva",
  "Otro",
];

const LABORATORY_AREAS = [
  "Hematología",
  "Bioquímica",
  "Microbiología",
  "Inmunología",
  "Uroanálisis",
  "Parasitología",
  "Biología molecular",
  "Recepción",
  "Sin clasificar",
];

const PRIORITIES = [
  { label: "Baja", value: "low" },
  { label: "Normal", value: "normal" },
  { label: "Alta", value: "high" },
  { label: "Urgente", value: "urgent" },
];

const STATUSES = [
  { label: "Recibida", value: "received" },
  { label: "Pendiente", value: "pending" },
  { label: "En procesamiento", value: "processing" },
  { label: "Completada", value: "completed" },
  { label: "Rechazada", value: "rejected" },
];

export default function SampleForm({
  initialData,
  isEditing = false,
  loading = false,
  onSubmit,
  onCancel,
  submitLabel,
  className = "",
}: SampleFormProps) {
  const [form, setForm] = useState<SampleFormData>({
    ...DEFAULT_FORM,
    ...initialData,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setForm({
      ...DEFAULT_FORM,
      ...initialData,
    });
    setErrors({});
    setSubmitError("");
  }, [initialData]);

  const updateField = <K extends keyof SampleFormData>(
    field: K,
    value: SampleFormData[K],
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));

    setSubmitError("");
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!form.code.trim()) {
      nextErrors.code = "El código de la muestra es obligatorio.";
    } else if (form.code.trim().length < 3) {
      nextErrors.code = "El código debe contener al menos 3 caracteres.";
    }

    if (!form.sample_type) {
      nextErrors.sample_type = "Selecciona el tipo de muestra.";
    }

    if (!form.laboratory_area) {
      nextErrors.laboratory_area = "Selecciona el área del laboratorio.";
    }

    if (!form.priority) {
      nextErrors.priority = "Selecciona una prioridad.";
    }

    if (form.temperature.trim()) {
      const temperature = Number(form.temperature);

      if (!Number.isFinite(temperature)) {
        nextErrors.temperature = "Introduce una temperatura válida.";
      }
    }

    if (form.duration.trim()) {
      const duration = Number(form.duration);

      if (!Number.isInteger(duration) || duration < 0) {
        nextErrors.duration = "La duración debe ser un entero mayor o igual a cero.";
      }
    }

    if (form.storage_location.length > 150) {
      nextErrors.storage_location = "La ubicación no puede superar 150 caracteres.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading || !validate()) {
      return;
    }

    setSubmitError("");

    const payload: SampleFormData = {
      ...form,
      code: form.code.trim(),
      temperature: form.temperature.trim(),
      storage_location: form.storage_location.trim(),
      duration: form.duration.trim(),
      notes: form.notes.trim(),
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible guardar la muestra.";

      setSubmitError(message);
    }
  };

  const cancelLabel = "Cancelar";
  const saveLabel =
    submitLabel ?? (isEditing ? "Guardar cambios" : "Registrar muestra");

  return (
    <form
      className={`sample-form ${className}`.trim()}
      onSubmit={handleSubmit}
      noValidate
    >
      {/* Información general */}
      <section className="sample-form__section">
        <div className="sample-form__section-header">
          <div className="sample-form__section-icon sample-form__section-icon--blue">
            <FlaskConical size={18} />
          </div>

          <div>
            <h3>Información de la muestra</h3>
            <p>Datos principales para identificar la muestra.</p>
          </div>
        </div>

        <div className="sample-form__grid">
          <div className="sample-form__field">
            <label htmlFor="sample-code">
              Código de muestra <span>*</span>
            </label>

            <input
              id="sample-code"
              type="text"
              placeholder="Ej. LG-2026-0001"
              value={form.code}
              onChange={(event) => updateField("code", event.target.value)}
              disabled={loading}
              maxLength={50}
              aria-invalid={Boolean(errors.code)}
            />

            {errors.code && (
              <span className="sample-form__error">{errors.code}</span>
            )}
          </div>

          <div className="sample-form__field">
            <label htmlFor="sample-type">
              Tipo de muestra <span>*</span>
            </label>

            <select
              id="sample-type"
              value={form.sample_type}
              onChange={(event) =>
                updateField("sample_type", event.target.value)
              }
              disabled={loading}
              aria-invalid={Boolean(errors.sample_type)}
            >
              <option value="">Seleccionar tipo</option>

              {SAMPLE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {errors.sample_type && (
              <span className="sample-form__error">
                {errors.sample_type}
              </span>
            )}
          </div>

          <div className="sample-form__field">
            <label htmlFor="sample-area">
              Área del laboratorio <span>*</span>
            </label>

            <select
              id="sample-area"
              value={form.laboratory_area}
              onChange={(event) =>
                updateField("laboratory_area", event.target.value)
              }
              disabled={loading}
              aria-invalid={Boolean(errors.laboratory_area)}
            >
              <option value="">Seleccionar área</option>

              {LABORATORY_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>

            {errors.laboratory_area && (
              <span className="sample-form__error">
                {errors.laboratory_area}
              </span>
            )}
          </div>

          <div className="sample-form__field">
            <label htmlFor="sample-status">Estado inicial</label>

            <select
              id="sample-status"
              value={form.status}
              onChange={(event) => updateField("status", event.target.value)}
              disabled={loading}
            >
              {STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Clasificación */}
      <section className="sample-form__section">
        <div className="sample-form__section-header">
          <div className="sample-form__section-icon sample-form__section-icon--orange">
            <ClipboardList size={18} />
          </div>

          <div>
            <h3>Clasificación y prioridad</h3>
            <p>Define la prioridad operativa de procesamiento.</p>
          </div>
        </div>

        <div className="sample-form__grid sample-form__grid--two">
          <div className="sample-form__field">
            <label htmlFor="sample-priority">
              Prioridad <span>*</span>
            </label>

            <select
              id="sample-priority"
              value={form.priority}
              onChange={(event) =>
                updateField("priority", event.target.value)
              }
              disabled={loading}
              aria-invalid={Boolean(errors.priority)}
            >
              {PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>

            {errors.priority && (
              <span className="sample-form__error">{errors.priority}</span>
            )}
          </div>
        </div>

        <div className="sample-form__notice">
          <AlertTriangle size={16} />
          <p>
            El nivel de riesgo y las anomalías deben calcularse mediante el
            análisis del sistema, no establecerse manualmente en este formulario.
          </p>
        </div>
      </section>

      {/* Condiciones de almacenamiento */}
      <section className="sample-form__section">
        <div className="sample-form__section-header">
          <div className="sample-form__section-icon sample-form__section-icon--teal">
            <Thermometer size={18} />
          </div>

          <div>
            <h3>Condiciones de almacenamiento</h3>
            <p>Registra las condiciones iniciales de conservación.</p>
          </div>
        </div>

        <div className="sample-form__grid sample-form__grid--two">
          <div className="sample-form__field">
            <label htmlFor="sample-temperature">
              Temperatura (°C)
            </label>

            <input
              id="sample-temperature"
              type="number"
              step="any"
              placeholder="Ej. 4"
              value={form.temperature}
              onChange={(event) =>
                updateField("temperature", event.target.value)
              }
              disabled={loading}
              aria-invalid={Boolean(errors.temperature)}
            />

            <span className="sample-form__hint">
              Temperatura registrada al recibir la muestra.
            </span>

            {errors.temperature && (
              <span className="sample-form__error">
                {errors.temperature}
              </span>
            )}
          </div>

          <div className="sample-form__field">
            <label htmlFor="sample-duration">
              Duración (minutos)
            </label>

            <input
              id="sample-duration"
              type="number"
              min="0"
              step="1"
              placeholder="Ej. 30"
              value={form.duration}
              onChange={(event) =>
                updateField("duration", event.target.value)
              }
              disabled={loading}
              aria-invalid={Boolean(errors.duration)}
            />

            <span className="sample-form__hint">
              Tiempo transcurrido o registrado para la muestra.
            </span>

            {errors.duration && (
              <span className="sample-form__error">{errors.duration}</span>
            )}
          </div>
        </div>

        <div className="sample-form__field sample-form__field--full">
          <label htmlFor="sample-location">
            <MapPin size={14} />
            Ubicación de almacenamiento
          </label>

          <input
            id="sample-location"
            type="text"
            placeholder="Ej. Refrigerador A - Estante 02"
            value={form.storage_location}
            onChange={(event) =>
              updateField("storage_location", event.target.value)
            }
            disabled={loading}
            maxLength={150}
            aria-invalid={Boolean(errors.storage_location)}
          />

          {errors.storage_location && (
            <span className="sample-form__error">
              {errors.storage_location}
            </span>
          )}
        </div>
      </section>

      {/* Observaciones */}
      <section className="sample-form__section">
        <div className="sample-form__section-header">
          <div className="sample-form__section-icon sample-form__section-icon--gray">
            <ClipboardList size={18} />
          </div>

          <div>
            <h3>Observaciones</h3>
            <p>Información adicional sobre la recepción de la muestra.</p>
          </div>
        </div>

        <div className="sample-form__field sample-form__field--full">
          <label htmlFor="sample-notes">Notas adicionales</label>

          <textarea
            id="sample-notes"
            rows={4}
            placeholder="Escribe observaciones relevantes..."
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            disabled={loading}
            maxLength={2000}
          />

          <div className="sample-form__textarea-footer">
            <span>Información opcional</span>
            <span>{form.notes.length}/2000</span>
          </div>
        </div>
      </section>

      {submitError && (
        <div className="sample-form__submit-error" role="alert">
          <AlertTriangle size={17} />
          <span>{submitError}</span>
        </div>
      )}

      {/* Acciones */}
      <div className="sample-form__actions">
        {onCancel && (
          <button
            type="button"
            className="sample-form__button sample-form__button--secondary"
            onClick={onCancel}
            disabled={loading}
          >
            <X size={16} />
            {cancelLabel}
          </button>
        )}

        <button
          type="submit"
          className="sample-form__button sample-form__button--primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={17} className="sample-form__spinner" />
              Guardando...
            </>
          ) : (
            <>
              <Save size={17} />
              {saveLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
