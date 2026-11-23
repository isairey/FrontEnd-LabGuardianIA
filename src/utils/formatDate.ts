
/**
 * LabGuardian AI
 * Date Formatter
 *
 * Utilidades centralizadas para trabajar con fechas y horas.
 */

/* =========================================================
   TYPES
========================================================= */

export type DateInput = string | number | Date | null | undefined;

export type DateFormatStyle =
  | "short"
  | "medium"
  | "long"
  | "full";

export type TimeFormatStyle =
  | "short"
  | "medium"
  | "long";

export interface FormatDateOptions {
  locale?: string;
  timezone?: string;
  style?: DateFormatStyle;
  includeTime?: boolean;
  hour12?: boolean;
}

export interface FormatTimeOptions {
  locale?: string;
  timezone?: string;
  style?: TimeFormatStyle;
  hour12?: boolean;
}

export interface DateDifference {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
}

export interface RelativeTimeOptions {
  locale?: string;
  numeric?: "always" | "auto";
  style?: "long" | "short" | "narrow";
}

/* =========================================================
   DEFAULT CONFIGURATION
========================================================= */

export const DEFAULT_DATE_CONFIG = {
  locale: "es-MX",
  timezone: "America/Mexico_City",
  dateStyle: "medium" as DateFormatStyle,
  timeStyle: "short" as TimeFormatStyle,
  hour12: false,
} as const;

/* =========================================================
   DATE VALIDATION
========================================================= */

/**
 * Convierte una entrada en una fecha válida.
 */
export function toDate(
  value: DateInput
): Date | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date = value instanceof Date
    ? new Date(value.getTime())
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/**
 * Comprueba si una entrada representa una fecha válida.
 */
export function isValidDate(value: DateInput): boolean {
  return toDate(value) !== null;
}

/**
 * Obtiene el timestamp de una fecha.
 */
export function getTimestamp(value: DateInput): number | null {
  const date = toDate(value);

  return date ? date.getTime() : null;
}

/* =========================================================
   DATE FORMAT
========================================================= */

/**
 * Formatea una fecha.
 *
 * Ejemplo:
 * 22 nov 2026
 */
export function formatDate(
  value: DateInput,
  options: FormatDateOptions = {}
): string {
  const date = toDate(value);

  if (!date) return "Fecha no disponible";

  const {
    locale = DEFAULT_DATE_CONFIG.locale,
    timezone = DEFAULT_DATE_CONFIG.timezone,
    style = DEFAULT_DATE_CONFIG.dateStyle,
    includeTime = false,
    hour12 = DEFAULT_DATE_CONFIG.hour12,
  } = options;

  const dateOptions: Intl.DateTimeFormatOptions = {
    dateStyle: style,
    timeZone: timezone,
  };

  if (includeTime) {
    dateOptions.timeStyle = "short";
    dateOptions.hour12 = hour12;
  }

  return new Intl.DateTimeFormat(
    locale,
    dateOptions
  ).format(date);
}

/**
 * Formato de fecha corta.
 *
 * Ejemplo:
 * 22/11/2026
 */
export function formatShortDate(
  value: DateInput,
  locale = DEFAULT_DATE_CONFIG.locale,
  timezone = DEFAULT_DATE_CONFIG.timezone
): string {
  const date = toDate(value);

  if (!date) return "Fecha no disponible";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: timezone,
  }).format(date);
}

/**
 * Formato de fecha larga.
 *
 * Ejemplo:
 * 22 de noviembre de 2026
 */
export function formatLongDate(
  value: DateInput,
  locale = DEFAULT_DATE_CONFIG.locale,
  timezone = DEFAULT_DATE_CONFIG.timezone
): string {
  const date = toDate(value);

  if (!date) return "Fecha no disponible";

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: timezone,
  }).format(date);
}

/**
 * Formato de fecha completa.
 *
 * Ejemplo:
 * domingo, 22 de noviembre de 2026
 */
export function formatFullDate(
  value: DateInput,
  locale = DEFAULT_DATE_CONFIG.locale,
  timezone = DEFAULT_DATE_CONFIG.timezone
): string {
  const date = toDate(value);

  if (!date) return "Fecha no disponible";

  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: timezone,
  }).format(date);
}

/* =========================================================
   TIME FORMAT
========================================================= */

/**
 * Formatea una hora.
 *
 * Ejemplo:
 * 14:35
 */
export function formatTime(
  value: DateInput,
  options: FormatTimeOptions = {}
): string {
  const date = toDate(value);

  if (!date) return "Hora no disponible";

  const {
    locale = DEFAULT_DATE_CONFIG.locale,
    timezone = DEFAULT_DATE_CONFIG.timezone,
    style = DEFAULT_DATE_CONFIG.timeStyle,
    hour12 = DEFAULT_DATE_CONFIG.hour12,
  } = options;

  return new Intl.DateTimeFormat(locale, {
    timeStyle: style,
    timeZone: timezone,
    hour12,
  }).format(date);
}

/**
 * Formatea fecha y hora.
 *
 * Ejemplo:
 * 22 nov 2026, 14:35
 */
export function formatDateTime(
  value: DateInput,
  locale = DEFAULT_DATE_CONFIG.locale,
  timezone = DEFAULT_DATE_CONFIG.timezone
): string {
  const date = toDate(value);

  if (!date) return "Fecha y hora no disponibles";

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
    hour12: false,
  }).format(date);
}

/**
 * Formatea una fecha para mostrar únicamente el día y mes.
 *
 * Ejemplo:
 * 22 nov
 */
export function formatDayMonth(
  value: DateInput,
  locale = DEFAULT_DATE_CONFIG.locale,
  timezone = DEFAULT_DATE_CONFIG.timezone
): string {
  const date = toDate(value);

  if (!date) return "Fecha no disponible";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    timeZone: timezone,
  }).format(date);
}

/* =========================================================
   RELATIVE DATE
========================================================= */

/**
 * Formatea una fecha en relación con el momento actual.
 *
 * Ejemplos:
 * hoy
 * ayer
 * mañana
 */
export function formatRelativeDate(
  value: DateInput,
  locale = DEFAULT_DATE_CONFIG.locale,
  timezone = DEFAULT_DATE_CONFIG.timezone
): string {
  const date = toDate(value);

  if (!date) return "Fecha no disponible";

  const now = new Date();

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const dateParts = dateFormatter.formatToParts(date);
  const nowParts = dateFormatter.formatToParts(now);

  const getPart = (
    parts: Intl.DateTimeFormatPart[],
    type: Intl.DateTimeFormatPartTypes
  ) => parts.find((part) => part.type === type)?.value;

  const targetYear = Number(getPart(dateParts, "year"));
  const targetMonth = Number(getPart(dateParts, "month"));
  const targetDay = Number(getPart(dateParts, "day"));

  const currentYear = Number(getPart(nowParts, "year"));
  const currentMonth = Number(getPart(nowParts, "month"));
  const currentDay = Number(getPart(nowParts, "day"));

  const targetUtc = Date.UTC(
    targetYear,
    targetMonth - 1,
    targetDay
  );

  const currentUtc = Date.UTC(
    currentYear,
    currentMonth - 1,
    currentDay
  );

  const difference = Math.round(
    (targetUtc - currentUtc) / 86400000
  );

  if (difference === 0) return "Hoy";
  if (difference === -1) return "Ayer";
  if (difference === 1) return "Mañana";

  return formatDate(value, {
    locale,
    timezone,
    style: "medium",
  });
}

/**
 * Formatea el tiempo transcurrido desde una fecha.
 *
 * Ejemplos:
 * hace 5 minutos
 * hace 2 horas
 * hace 3 días
 */
export function formatTimeAgo(
  value: DateInput,
  options: RelativeTimeOptions = {}
): string {
  const date = toDate(value);

  if (!date) return "Fecha no disponible";

  const {
    locale = DEFAULT_DATE_CONFIG.locale,
    numeric = "auto",
    style = "long",
  } = options;

  const seconds = Math.round(
    (date.getTime() - Date.now()) / 1000
  );

  const absoluteSeconds = Math.abs(seconds);

  let unit: Intl.RelativeTimeFormatUnit;
  let amount: number;

  if (absoluteSeconds < 60) {
    unit = "second";
    amount = seconds;
  } else if (absoluteSeconds < 3600) {
    unit = "minute";
    amount = Math.round(seconds / 60);
  } else if (absoluteSeconds < 86400) {
    unit = "hour";
    amount = Math.round(seconds / 3600);
  } else if (absoluteSeconds < 2592000) {
    unit = "day";
    amount = Math.round(seconds / 86400);
  } else if (absoluteSeconds < 31536000) {
    unit = "month";
    amount = Math.round(seconds / 2592000);
  } else {
    unit = "year";
    amount = Math.round(seconds / 31536000);
  }

  return new Intl.RelativeTimeFormat(locale, {
    numeric,
    style,
  }).format(amount, unit);
}

/* =========================================================
   DATE DIFFERENCE
========================================================= */

/**
 * Calcula la diferencia entre dos fechas.
 */
export function getDateDifference(
  start: DateInput,
  end: DateInput = new Date()
): DateDifference | null {
  const startDate = toDate(start);
  const endDate = toDate(end);

  if (!startDate || !endDate) return null;

  const difference = Math.abs(
    endDate.getTime() - startDate.getTime()
  );

  const totalSeconds = Math.floor(difference / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  let remaining = totalSeconds;

  const days = Math.floor(remaining / 86400);
  remaining %= 86400;

  const hours = Math.floor(remaining / 3600);
  remaining %= 3600;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return {
    years: Math.floor(totalDays / 365),
    months: Math.floor(totalDays / 30),
    days,
    hours,
    minutes,
    seconds,
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
  };
}

/**
 * Devuelve una duración legible.
 *
 * Ejemplos:
 * 2 días, 3 horas
 * 45 minutos
 */
export function formatDuration(
  start: DateInput,
  end: DateInput = new Date()
): string {
  const difference = getDateDifference(start, end);

  if (!difference) return "Duración no disponible";

  const parts: string[] = [];

  if (difference.days > 0) {
    parts.push(`${difference.days} ${difference.days === 1 ? "día" : "días"}`);
  }

  if (difference.hours > 0) {
    parts.push(`${difference.hours} ${difference.hours === 1 ? "hora" : "horas"}`);
  }

  if (difference.minutes > 0) {
    parts.push(`${difference.minutes} ${difference.minutes === 1 ? "minuto" : "minutos"}`);
  }

  if (parts.length === 0) {
    return `${difference.seconds} segundos`;
  }

  return parts.slice(0, 2).join(", ");
}

/* =========================================================
   DATE COMPARISON
========================================================= */

/**
 * Comprueba si una fecha es anterior a otra.
 */
export function isBeforeDate(
  first: DateInput,
  second: DateInput
): boolean {
  const a = toDate(first);
  const b = toDate(second);

  return a !== null && b !== null &&
    a.getTime() < b.getTime();
}

/**
 * Comprueba si una fecha es posterior a otra.
 */
export function isAfterDate(
  first: DateInput,
  second: DateInput
): boolean {
  const a = toDate(first);
  const b = toDate(second);

  return a !== null && b !== null &&
    a.getTime() > b.getTime();
}

/**
 * Comprueba si dos fechas corresponden al mismo día
 * en la zona horaria indicada.
 */
export function isSameDay(
  first: DateInput,
  second: DateInput,
  timezone = DEFAULT_DATE_CONFIG.timezone
): boolean {
  const a = toDate(first);
  const b = toDate(second);

  if (!a || !b) return false;

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(a) === formatter.format(b);
}

/* =========================================================
   DATE OPERATIONS
========================================================= */

/**
 * Agrega días a una fecha.
 */
export function addDays(
  value: DateInput,
  days: number
): Date | null {
  const date = toDate(value);

  if (!date || !Number.isFinite(days)) return null;

  date.setDate(date.getDate() + days);

  return date;
}

/**
 * Resta días a una fecha.
 */
export function subtractDays(
  value: DateInput,
  days: number
): Date | null {
  return addDays(value, -days);
}

/**
 * Obtiene el inicio del día según la hora local del entorno.
 */
export function startOfDay(value: DateInput): Date | null {
  const date = toDate(value);

  if (!date) return null;

  date.setHours(0, 0, 0, 0);

  return date;
}

/**
 * Obtiene el final del día según la hora local del entorno.
 */
export function endOfDay(value: DateInput): Date | null {
  const date = toDate(value);

  if (!date) return null;

  date.setHours(23, 59, 59, 999);

  return date;
}

/**
 * Comprueba si una fecha está dentro de un rango.
 */
export function isDateInRange(
  value: DateInput,
  start: DateInput,
  end: DateInput
): boolean {
  const date = toDate(value);
  const startDate = toDate(start);
  const endDate = toDate(end);

  if (!date || !startDate || !endDate) return false;

  return (
    date.getTime() >= startDate.getTime() &&
    date.getTime() <= endDate.getTime()
  );
}

/* =========================================================
   LABORATORY HELPERS
========================================================= */

/**
 * Comprueba si una muestra está vencida.
 */
export function isExpired(
  expirationDate: DateInput,
  referenceDate: DateInput = new Date()
): boolean {
  return isBeforeDate(expirationDate, referenceDate);
}

/**
 * Devuelve los días restantes hasta el vencimiento.
 *
 * Un resultado negativo indica que ya venció.
 */
export function getDaysUntilExpiration(
  expirationDate: DateInput,
  referenceDate: DateInput = new Date()
): number | null {
  const expiration = toDate(expirationDate);
  const reference = toDate(referenceDate);

  if (!expiration || !reference) return null;

  const expirationDay = Date.UTC(
    expiration.getUTCFullYear(),
    expiration.getUTCMonth(),
    expiration.getUTCDate()
  );

  const referenceDay = Date.UTC(
    reference.getUTCFullYear(),
    reference.getUTCMonth(),
    reference.getUTCDate()
  );

  return Math.ceil(
    (expirationDay - referenceDay) / 86400000
  );
}

/**
 * Comprueba si una fecha de calibración está vencida.
 */
export function isCalibrationOverdue(
  calibrationDate: DateInput,
  referenceDate: DateInput = new Date()
): boolean {
  return isExpired(calibrationDate, referenceDate);
}

/**
 * Formatea el tiempo transcurrido de un proceso.
 */
export function formatProcessDuration(
  startedAt: DateInput,
  completedAt: DateInput = new Date()
): string {
  return formatDuration(startedAt, completedAt);
}

/* =========================================================
   ISO FORMAT
========================================================= */

/**
 * Convierte una fecha válida a ISO 8601.
 */
export function toISOString(value: DateInput): string | null {
  const date = toDate(value);

  return date ? date.toISOString() : null;
}

/**
 * Devuelve la fecha actual en ISO 8601.
 */
export function getCurrentISOString(): string {
  return new Date().toISOString();
}

/* =========================================================
   DEFAULT EXPORT
========================================================= */

const dateFormatter = {
  toDate,
  isValidDate,
  getTimestamp,

  formatDate,
  formatShortDate,
  formatLongDate,
  formatFullDate,
  formatTime,
  formatDateTime,
  formatDayMonth,

  formatRelativeDate,
  formatTimeAgo,

  getDateDifference,
  formatDuration,

  isBeforeDate,
  isAfterDate,
  isSameDay,
  isDateInRange,

  addDays,
  subtractDays,
  startOfDay,
  endOfDay,

  isExpired,
  getDaysUntilExpiration,
  isCalibrationOverdue,
  formatProcessDuration,

  toISOString,
  getCurrentISOString,
};

export default dateFormatter;
