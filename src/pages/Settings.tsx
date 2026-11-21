
import { useState } from "react";
import {
  Bell,
  Building2,
  Check,
  ChevronRight,
  Database,
  FlaskConical,
  Globe,
  Lock,
  Monitor,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  SlidersHorizontal,
  User,
} from "lucide-react";

import PageContainer from "../components/layout/PageContainer";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";

type SettingsTab =
  | "general"
  | "laboratory"
  | "notifications"
  | "appearance"
  | "security"
  | "system";

interface GeneralSettings {
  laboratoryName: string;
  institution: string;
  administrator: string;
  email: string;
  language: string;
  timezone: string;
  dateFormat: string;
}

interface NotificationSettings {
  criticalAlerts: boolean;
  highRiskAlerts: boolean;
  sampleUpdates: boolean;
  equipmentAlerts: boolean;
  maintenanceReminders: boolean;
  dailySummary: boolean;
}

interface LaboratorySettings {
  temperatureUnit: string;
  defaultRiskThreshold: number;
  criticalRiskThreshold: number;
  sampleCodePrefix: string;
  automaticRiskAnalysis: boolean;
  automaticTraceability: boolean;
}

interface AppearanceSettings {
  compactMode: boolean;
  showAnimations: boolean;
  showDashboardTips: boolean;
  itemsPerPage: string;
}

const initialGeneralSettings: GeneralSettings = {
  laboratoryName: "Laboratorio Central",
  institution: "Institución de investigación",
  administrator: "Administrador del sistema",
  email: "admin@labguardian.local",
  language: "es",
  timezone: "America/Mexico_City",
  dateFormat: "DD/MM/YYYY",
};

const initialNotificationSettings: NotificationSettings = {
  criticalAlerts: true,
  highRiskAlerts: true,
  sampleUpdates: true,
  equipmentAlerts: true,
  maintenanceReminders: true,
  dailySummary: false,
};

const initialLaboratorySettings: LaboratorySettings = {
  temperatureUnit: "celsius",
  defaultRiskThreshold: 40,
  criticalRiskThreshold: 80,
  sampleCodePrefix: "LAB",
  automaticRiskAnalysis: true,
  automaticTraceability: true,
};

const initialAppearanceSettings: AppearanceSettings = {
  compactMode: false,
  showAnimations: true,
  showDashboardTips: true,
  itemsPerPage: "10",
};

const navigationItems: {
  id: SettingsTab;
  label: string;
  description: string;
  icon: typeof SettingsIcon;
}[] = [
  {
    id: "general",
    label: "General",
    description: "Información y preferencias generales",
    icon: SettingsIcon,
  },
  {
    id: "laboratory",
    label: "Laboratorio",
    description: "Parámetros de operación",
    icon: FlaskConical,
  },
  {
    id: "notifications",
    label: "Notificaciones",
    description: "Alertas y avisos del sistema",
    icon: Bell,
  },
  {
    id: "appearance",
    label: "Apariencia",
    description: "Personalización de la interfaz",
    icon: Monitor,
  },
  {
    id: "security",
    label: "Seguridad",
    description: "Acceso y protección",
    icon: ShieldCheck,
  },
  {
    id: "system",
    label: "Sistema",
    description: "Información técnica",
    icon: Database,
  },
];

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section className="settings-page__section">
      <div className="settings-page__section-heading">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      <div className="settings-page__section-content">{children}</div>
    </section>
  );
}

interface SettingRowProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function SettingRow({ title, description, children }: SettingRowProps) {
  return (
    <div className="settings-page__row">
      <div className="settings-page__row-info">
        <span>{title}</span>
        {description && <small>{description}</small>}
      </div>
      <div className="settings-page__row-control">{children}</div>
    </div>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}

function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`settings-page__toggle ${
        checked ? "settings-page__toggle--active" : ""
      }`}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const [general, setGeneral] = useState(initialGeneralSettings);
  const [notifications, setNotifications] = useState(
    initialNotificationSettings
  );
  const [laboratory, setLaboratory] = useState(initialLaboratorySettings);
  const [appearance, setAppearance] = useState(initialAppearanceSettings);

  const [saved, setSaved] = useState(false);

  const updateGeneral = <K extends keyof GeneralSettings>(
    key: K,
    value: GeneralSettings[K]
  ) => {
    setGeneral((previous) => ({ ...previous, [key]: value }));
    setSaved(false);
  };

  const updateNotifications = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    setNotifications((previous) => ({ ...previous, [key]: value }));
    setSaved(false);
  };

  const updateLaboratory = <K extends keyof LaboratorySettings>(
    key: K,
    value: LaboratorySettings[K]
  ) => {
    setLaboratory((previous) => ({ ...previous, [key]: value }));
    setSaved(false);
  };

  const updateAppearance = <K extends keyof AppearanceSettings>(
    key: K,
    value: AppearanceSettings[K]
  ) => {
    setAppearance((previous) => ({ ...previous, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // La persistencia se conectará posteriormente con el backend.
    const settings = {
      general,
      notifications,
      laboratory,
      appearance,
    };

    localStorage.setItem("labguardian-settings", JSON.stringify(settings));
    setSaved(true);
  };

  const handleReset = () => {
    setGeneral(initialGeneralSettings);
    setNotifications(initialNotificationSettings);
    setLaboratory(initialLaboratorySettings);
    setAppearance(initialAppearanceSettings);
    setSaved(false);
  };

  const activeItem = navigationItems.find((item) => item.id === activeTab);

  return (
    <PageContainer
      title="Configuración"
      description="Administra las preferencias y parámetros de LabGuardian AI."
      eyebrow="SISTEMA"
      actions={
        <div className="settings-page__header-actions">
          <Button variant="outline" onClick={handleReset}>
            Restaurar valores
          </Button>
          <Button
            variant="primary"
            leftIcon={<Save size={16} />}
            onClick={handleSave}
          >
            Guardar cambios
          </Button>
        </div>
      }
    >
      <div className="settings-page">
        {saved && (
          <div className="settings-page__success">
            <Check size={17} />
            <span>Los cambios se guardaron en este navegador.</span>
          </div>
        )}

        <div className="settings-page__layout">
          <aside className="settings-page__sidebar">
            <div className="settings-page__sidebar-heading">
              <SlidersHorizontal size={17} />
              <span>Preferencias</span>
            </div>

            <nav className="settings-page__navigation">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`settings-page__nav-item ${
                      isActive ? "settings-page__nav-item--active" : ""
                    }`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <span className="settings-page__nav-icon">
                      <Icon size={18} />
                    </span>
                    <span className="settings-page__nav-text">
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </span>
                    <ChevronRight size={16} />
                  </button>
                );
              })}
            </nav>

            <div className="settings-page__sidebar-footer">
              <div className="settings-page__sidebar-footer-icon">
                <ShieldCheck size={18} />
              </div>
              <div>
                <strong>LabGuardian AI</strong>
                <span>Panel de administración</span>
              </div>
            </div>
          </aside>

          <main className="settings-page__content">
            <div className="settings-page__content-heading">
              <div className="settings-page__content-icon">
                {activeItem && <activeItem.icon size={21} />}
              </div>
              <div>
                <h2>{activeItem?.label}</h2>
                <p>{activeItem?.description}</p>
              </div>
            </div>

            {activeTab === "general" && (
              <>
                <SettingsSection
                  title="Información del laboratorio"
                  description="Datos generales de identificación de la institución."
                >
                  <SettingRow
                    title="Nombre del laboratorio"
                    description="Nombre que identifica al laboratorio."
                  >
                    <input
                      value={general.laboratoryName}
                      onChange={(event) =>
                        updateGeneral("laboratoryName", event.target.value)
                      }
                    />
                  </SettingRow>

                  <SettingRow
                    title="Institución"
                    description="Organización a la que pertenece."
                  >
                    <input
                      value={general.institution}
                      onChange={(event) =>
                        updateGeneral("institution", event.target.value)
                      }
                    />
                  </SettingRow>

                  <SettingRow
                    title="Administrador"
                    description="Responsable de la plataforma."
                  >
                    <input
                      value={general.administrator}
                      onChange={(event) =>
                        updateGeneral("administrator", event.target.value)
                      }
                    />
                  </SettingRow>

                  <SettingRow
                    title="Correo electrónico"
                    description="Correo de contacto administrativo."
                  >
                    <input
                      type="email"
                      value={general.email}
                      onChange={(event) =>
                        updateGeneral("email", event.target.value)
                      }
                    />
                  </SettingRow>
                </SettingsSection>

                <SettingsSection
                  title="Preferencias regionales"
                  description="Configura el idioma, la zona horaria y las fechas."
                >
                  <SettingRow title="Idioma">
                    <select
                      value={general.language}
                      onChange={(event) =>
                        updateGeneral("language", event.target.value)
                      }
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </SettingRow>

                  <SettingRow title="Zona horaria">
                    <select
                      value={general.timezone}
                      onChange={(event) =>
                        updateGeneral("timezone", event.target.value)
                      }
                    >
                      <option value="America/Mexico_City">
                        Ciudad de México
                      </option>
                      <option value="America/Cancun">Cancún</option>
                      <option value="America/Tijuana">Tijuana</option>
                      <option value="America/Monterrey">Monterrey</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </SettingRow>

                  <SettingRow title="Formato de fecha">
                    <select
                      value={general.dateFormat}
                      onChange={(event) =>
                        updateGeneral("dateFormat", event.target.value)
                      }
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </SettingRow>
                </SettingsSection>
              </>
            )}

            {activeTab === "laboratory" && (
              <>
                <SettingsSection
                  title="Parámetros de muestras"
                  description="Define los valores predeterminados para el procesamiento."
                >
                  <SettingRow
                    title="Unidad de temperatura"
                    description="Unidad utilizada en los registros de muestras."
                  >
                    <select
                      value={laboratory.temperatureUnit}
                      onChange={(event) =>
                        updateLaboratory("temperatureUnit", event.target.value)
                      }
                    >
                      <option value="celsius">Celsius (°C)</option>
                      <option value="fahrenheit">Fahrenheit (°F)</option>
                    </select>
                  </SettingRow>

                  <SettingRow
                    title="Prefijo de muestras"
                    description="Prefijo para la identificación de nuevas muestras."
                  >
                    <input
                      maxLength={10}
                      value={laboratory.sampleCodePrefix}
                      onChange={(event) =>
                        updateLaboratory(
                          "sampleCodePrefix",
                          event.target.value.toUpperCase()
                        )
                      }
                    />
                  </SettingRow>
                </SettingsSection>

                <SettingsSection
                  title="Umbrales de riesgo"
                  description="Valores de referencia para clasificar el riesgo de las muestras."
                >
                  <SettingRow
                    title="Umbral de riesgo elevado"
                    description="Puntuación a partir de la cual se considera riesgo alto."
                  >
                    <div className="settings-page__range-control">
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={laboratory.defaultRiskThreshold}
                        onChange={(event) =>
                          updateLaboratory(
                            "defaultRiskThreshold",
                            Math.min(99, Math.max(1, Number(event.target.value)))
                          )
                        }
                      />
                      <span>/ 100</span>
                    </div>
                  </SettingRow>

                  <SettingRow
                    title="Umbral de riesgo crítico"
                    description="Puntuación a partir de la cual se considera riesgo crítico."
                  >
                    <div className="settings-page__range-control">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={laboratory.criticalRiskThreshold}
                        onChange={(event) =>
                          updateLaboratory(
                            "criticalRiskThreshold",
                            Math.min(100, Math.max(1, Number(event.target.value)))
                          )
                        }
                      />
                      <span>/ 100</span>
                    </div>
                  </SettingRow>
                </SettingsSection>

                <SettingsSection
                  title="Automatización"
                  description="Controla los procesos automáticos del laboratorio."
                >
                  <SettingRow
                    title="Análisis automático de riesgo"
                    description="Evaluar automáticamente el riesgo de las muestras."
                  >
                    <Toggle
                      label="Análisis automático de riesgo"
                      checked={laboratory.automaticRiskAnalysis}
                      onChange={(value) =>
                        updateLaboratory("automaticRiskAnalysis", value)
                      }
                    />
                  </SettingRow>

                  <SettingRow
                    title="Trazabilidad automática"
                    description="Registrar automáticamente los eventos del ciclo de vida."
                  >
                    <Toggle
                      label="Trazabilidad automática"
                      checked={laboratory.automaticTraceability}
                      onChange={(value) =>
                        updateLaboratory("automaticTraceability", value)
                      }
                    />
                  </SettingRow>
                </SettingsSection>
              </>
            )}

            {activeTab === "notifications" && (
              <SettingsSection
                title="Preferencias de notificación"
                description="Selecciona qué eventos deben generar avisos en la plataforma."
              >
                <SettingRow
                  title="Alertas críticas"
                  description="Notificar cuando se detecte un riesgo crítico."
                >
                  <Toggle
                    label="Alertas críticas"
                    checked={notifications.criticalAlerts}
                    onChange={(value) =>
                      updateNotifications("criticalAlerts", value)
                    }
                  />
                </SettingRow>

                <SettingRow
                  title="Riesgo alto"
                  description="Avisar cuando una muestra presente un riesgo elevado."
                >
                  <Toggle
                    label="Riesgo alto"
                    checked={notifications.highRiskAlerts}
                    onChange={(value) =>
                      updateNotifications("highRiskAlerts", value)
                    }
                  />
                </SettingRow>

                <SettingRow
                  title="Actualizaciones de muestras"
                  description="Notificar cambios importantes en las muestras."
                >
                  <Toggle
                    label="Actualizaciones de muestras"
                    checked={notifications.sampleUpdates}
                    onChange={(value) =>
                      updateNotifications("sampleUpdates", value)
                    }
                  />
                </SettingRow>

                <SettingRow
                  title="Alertas de equipos"
                  description="Notificar fallas o cambios de estado de equipos."
                >
                  <Toggle
                    label="Alertas de equipos"
                    checked={notifications.equipmentAlerts}
                    onChange={(value) =>
                      updateNotifications("equipmentAlerts", value)
                    }
                  />
                </SettingRow>

                <SettingRow
                  title="Recordatorios de mantenimiento"
                  description="Avisar cuando un equipo requiera mantenimiento."
                >
                  <Toggle
                    label="Recordatorios de mantenimiento"
                    checked={notifications.maintenanceReminders}
                    onChange={(value) =>
                      updateNotifications("maintenanceReminders", value)
                    }
                  />
                </SettingRow>

                <SettingRow
                  title="Resumen diario"
                  description="Mostrar un resumen de actividad del laboratorio."
                >
                  <Toggle
                    label="Resumen diario"
                    checked={notifications.dailySummary}
                    onChange={(value) =>
                      updateNotifications("dailySummary", value)
                    }
                  />
                </SettingRow>
              </SettingsSection>
            )}

            {activeTab === "appearance" && (
              <>
                <SettingsSection
                  title="Interfaz"
                  description="Personaliza la experiencia de visualización."
                >
                  <SettingRow
                    title="Modo compacto"
                    description="Reduce espacios para mostrar más información."
                  >
                    <Toggle
                      label="Modo compacto"
                      checked={appearance.compactMode}
                      onChange={(value) =>
                        updateAppearance("compactMode", value)
                      }
                    />
                  </SettingRow>

                  <SettingRow
                    title="Animaciones"
                    description="Activar transiciones y animaciones de interfaz."
                  >
                    <Toggle
                      label="Animaciones"
                      checked={appearance.showAnimations}
                      onChange={(value) =>
                        updateAppearance("showAnimations", value)
                      }
                    />
                  </SettingRow>

                  <SettingRow
                    title="Consejos del panel"
                    description="Mostrar recomendaciones y consejos en el dashboard."
                  >
                    <Toggle
                      label="Consejos del panel"
                      checked={appearance.showDashboardTips}
                      onChange={(value) =>
                        updateAppearance("showDashboardTips", value)
                      }
                    />
                  </SettingRow>
                </SettingsSection>

                <SettingsSection
                  title="Visualización de datos"
                  description="Configura la cantidad de registros por página."
                >
                  <SettingRow title="Registros por página">
                    <select
                      value={appearance.itemsPerPage}
                      onChange={(event) =>
                        updateAppearance("itemsPerPage", event.target.value)
                      }
                    >
                      <option value="5">5 registros</option>
                      <option value="10">10 registros</option>
                      <option value="20">20 registros</option>
                      <option value="50">50 registros</option>
                    </select>
                  </SettingRow>
                </SettingsSection>
              </>
            )}

            {activeTab === "security" && (
              <>
                <SettingsSection
                  title="Seguridad de la cuenta"
                  description="Opciones relacionadas con el acceso a la plataforma."
                >
                  <SettingRow
                    title="Cuenta administrativa"
                    description={general.email}
                  >
                    <Badge variant="success" dot>
                      Cuenta activa
                    </Badge>
                  </SettingRow>

                  <SettingRow
                    title="Autenticación"
                    description="La administración de credenciales debe realizarse desde el módulo de usuarios."
                  >
                    <Badge variant="info">Gestionada por el sistema</Badge>
                  </SettingRow>

                  <SettingRow
                    title="Protección de sesiones"
                    description="El control de sesiones depende de la configuración del backend."
                  >
                    <Badge variant="success">Habilitada</Badge>
                  </SettingRow>
                </SettingsSection>

                <div className="settings-page__security-notice">
                  <Lock size={20} />
                  <div>
                    <strong>Recomendación de seguridad</strong>
                    <p>
                      Utiliza contraseñas seguras y limita los permisos de
                      acceso según las responsabilidades de cada usuario.
                    </p>
                  </div>
                </div>
              </>
            )}

            {activeTab === "system" && (
              <>
                <SettingsSection
                  title="Información del sistema"
                  description="Información general de la plataforma."
                >
                  <SettingRow title="Aplicación">
                    <strong className="settings-page__system-value">
                      LabGuardian AI
                    </strong>
                  </SettingRow>

                  <SettingRow title="Versión">
                    <Badge variant="info">1.0.0</Badge>
                  </SettingRow>

                  <SettingRow title="Frontend">
                    <Badge variant="success">React + TypeScript</Badge>
                  </SettingRow>

                  <SettingRow title="Backend">
                    <Badge variant="success">FastAPI</Badge>
                  </SettingRow>

                  <SettingRow title="Base de datos">
                    <Badge variant="info">PostgreSQL</Badge>
                  </SettingRow>

                  <SettingRow title="Almacenamiento de preferencias">
                    <Badge variant="warning">LocalStorage</Badge>
                  </SettingRow>
                </SettingsSection>

                <div className="settings-page__system-notice">
                  <Database size={20} />
                  <div>
                    <strong>Estado de configuración</strong>
                    <p>
                      Las preferencias de esta página se guardan localmente
                      en el navegador. La sincronización con el servidor
                      todavía debe implementarse.
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="settings-page__bottom-actions">
              <span>Recuerda guardar tus cambios antes de salir.</span>
              <Button
                variant="primary"
                leftIcon={<Save size={16} />}
                onClick={handleSave}
              >
                Guardar configuración
              </Button>
            </div>
          </main>
        </div>
      </div>
    </PageContainer>
  );
}
