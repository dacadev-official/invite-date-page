const MOBILE_MAX_WIDTH_PX = 767

/**
 * true si el viewport era de ancho móvil cuando este módulo se evaluó por
 * primera vez (arranque de la página). Se calcula UNA sola vez y queda fijo
 * — no reacciona a resize ni a rotación — a propósito: el chiste del botón
 * evasivo debe tener una sola "personalidad" (desktop o móvil) por carga de
 * página, nunca cambiar a mitad de partida.
 */
const isMobileDevice =
  typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`).matches : false

export function useIsMobileDevice(): boolean {
  return isMobileDevice
}
