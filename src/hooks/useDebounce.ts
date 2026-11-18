
import { useEffect, useState } from "react";

/**
 * useDebounce
 *
 * Retrasa la actualización de un valor hasta que transcurra
 * un periodo de inactividad.
 *
 * @param value Valor que se desea controlar.
 * @param delay Tiempo de espera en milisegundos.
 * @returns Valor actualizado después del periodo de espera.
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, Math.max(0, delay));

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
