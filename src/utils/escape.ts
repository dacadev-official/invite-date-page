/**
 * Lógica pura del botón evasivo (el chiste de "Segura"). Sin DOM: todo el
 * pegamento con eventos vive en composables/useEvasiveTarget.ts. Esto permite
 * probar la mecánica de fuga sin montar componentes.
 */

export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Rect extends Point, Size {}

export interface EscapeInput {
  /** Área disponible para reposicionar el botón (normalmente el modal). */
  field: Size
  button: Size
  /** Centro de la amenaza (cursor/dedo); null si se dispara por foco de teclado. */
  pointer: Point | null
  current: Point
  /** Margen mínimo al borde del campo. */
  padding?: number
  /** Nº de posiciones candidatas a evaluar. */
  candidates?: number
  /** Generador aleatorio inyectable (0..1), para tests deterministas. */
  random?: () => number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Elige la próxima esquina superior-izquierda del botón dentro de `field`,
 * maximizando la distancia al puntero y favoreciendo un desplazamiento real
 * respecto a `current` (para que el salto se note incluso sin puntero).
 * Siempre devuelve un punto dentro del campo, incluso si el campo es más
 * pequeño que el botón (en ese caso colapsa al único punto válido).
 */
export function pickEscapePosition(input: EscapeInput): Point {
  const { field, button, pointer, current } = input
  const padding = input.padding ?? 12
  const candidateCount = input.candidates ?? 24
  const random = input.random ?? Math.random

  const maxX = Math.max(padding, field.width - button.width - padding)
  const minX = Math.min(padding, maxX)
  const maxY = Math.max(padding, field.height - button.height - padding)
  const minY = Math.min(padding, maxY)

  const rangeX = maxX - minX
  const rangeY = maxY - minY

  let best: Point | null = null
  let bestScore = -Infinity

  for (let i = 0; i < candidateCount; i++) {
    const candidate: Point = {
      x: clamp(minX + random() * rangeX, minX, maxX),
      y: clamp(minY + random() * rangeY, minY, maxY),
    }

    const candidateCenter: Point = {
      x: candidate.x + button.width / 2,
      y: candidate.y + button.height / 2,
    }

    const pointerDistance = pointer ? Math.hypot(candidateCenter.x - pointer.x, candidateCenter.y - pointer.y) : 0
    const movedDistance = Math.hypot(candidate.x - current.x, candidate.y - current.y)

    // La distancia al puntero manda; el desplazamiento respecto a la
    // posición actual solo desempata para garantizar que el botón se mueva
    // de verdad cuando no hay puntero (foco de teclado).
    const score = pointerDistance * 4 + movedDistance

    if (score > bestScore) {
      bestScore = score
      best = candidate
    }
  }

  return best ?? { x: clamp(current.x, minX, maxX), y: clamp(current.y, minY, maxY) }
}

/**
 * True si el puntero está a `radius` px o menos del borde más cercano de
 * `rect` (0 si está dentro). Umbral de activación de la huida en desktop.
 */
export function shouldFlee(pointer: Point, rect: Rect, radius: number): boolean {
  const nearestX = clamp(pointer.x, rect.x, rect.x + rect.width)
  const nearestY = clamp(pointer.y, rect.y, rect.y + rect.height)
  const distance = Math.hypot(pointer.x - nearestX, pointer.y - nearestY)
  return distance <= radius
}

export interface DecayRates {
  scale: number
  opacity: number
}

/** Tasas por defecto (desktop): la broma dura ~80 intentos antes de rendirse. */
export const DESKTOP_DECAY_RATES: DecayRates = { scale: 0.985, opacity: 0.992 }

/**
 * Encogimiento y desvanecimiento progresivo del botón según nº de intentos.
 * Monotónico y sin piso real: con suficientes intentos se acerca a 0 (el
 * botón debe poder volverse "lo bastante chico como para no verse"). El
 * piso mínimo es solo para evitar escala/opacidad negativas o NaN.
 */
export function decayStyle(
  attempts: number,
  rates: DecayRates = DESKTOP_DECAY_RATES,
): { scale: number; opacity: number } {
  const scale = Math.max(0.04, Math.pow(rates.scale, attempts))
  const opacity = Math.max(0.03, Math.pow(rates.opacity, attempts))
  return { scale, opacity }
}
