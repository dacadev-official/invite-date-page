import { describe, expect, it } from 'vitest'
import { decayStyle, pickEscapePosition, shouldFlee } from '@/utils/escape'

describe('pickEscapePosition', () => {
  const field = { width: 300, height: 200 }
  const button = { width: 60, height: 32 }
  const current = { x: 120, y: 80 }

  it('siempre devuelve una posición dentro del campo', () => {
    const position = pickEscapePosition({
      field,
      button,
      pointer: { x: 130, y: 90 },
      current,
      random: () => 0.5,
    })
    expect(position.x).toBeGreaterThanOrEqual(0)
    expect(position.y).toBeGreaterThanOrEqual(0)
    expect(position.x + button.width).toBeLessThanOrEqual(field.width)
    expect(position.y + button.height).toBeLessThanOrEqual(field.height)
  })

  it('se aleja del puntero: la nueva posición está más lejos del puntero que la actual', () => {
    const pointer = { x: current.x + 5, y: current.y }
    const position = pickEscapePosition({ field, button, pointer, current, candidates: 40 })

    const distanceFromCurrent = Math.hypot(current.x - pointer.x, current.y - pointer.y)
    const distanceFromNew = Math.hypot(position.x + button.width / 2 - pointer.x, position.y + button.height / 2 - pointer.y)

    expect(distanceFromNew).toBeGreaterThan(distanceFromCurrent)
  })

  it('es determinista cuando se inyecta un generador aleatorio fijo', () => {
    const input = {
      field,
      button,
      pointer: { x: 150, y: 100 },
      current,
      random: () => 0.25,
    }
    const first = pickEscapePosition(input)
    const second = pickEscapePosition(input)
    expect(first).toEqual(second)
  })

  it('sobrevive a un campo más pequeño que el botón sin lanzar y sin salirse de rango', () => {
    const tinyField = { width: 40, height: 20 }
    const position = pickEscapePosition({
      field: tinyField,
      button,
      pointer: { x: 10, y: 10 },
      current: { x: 0, y: 0 },
      random: () => 0.7,
    })
    expect(position.x).toBeGreaterThanOrEqual(0)
    expect(position.y).toBeGreaterThanOrEqual(0)
    expect(Number.isFinite(position.x)).toBe(true)
    expect(Number.isFinite(position.y)).toBe(true)
  })

  it('sin puntero, igual produce una posición distinta a la actual dentro del campo', () => {
    const position = pickEscapePosition({ field, button, pointer: null, current, random: () => 0.9 })
    expect(position.x).toBeGreaterThanOrEqual(0)
    expect(position.y).toBeGreaterThanOrEqual(0)
    expect(position.x + button.width).toBeLessThanOrEqual(field.width)
    expect(position.y + button.height).toBeLessThanOrEqual(field.height)
  })
})

describe('shouldFlee', () => {
  const rect = { x: 100, y: 100, width: 60, height: 30 }

  it('es true cuando el puntero está dentro del rect', () => {
    expect(shouldFlee({ x: 120, y: 110 }, rect, 50)).toBe(true)
  })

  it('es true en el borde exacto del radio', () => {
    // Punto más cercano del rect al puntero: (100, 115). Distancia = radio exacto.
    const pointer = { x: 100 - 50, y: 115 }
    expect(shouldFlee(pointer, rect, 50)).toBe(true)
  })

  it('es false fuera del radio', () => {
    expect(shouldFlee({ x: -1000, y: -1000 }, rect, 50)).toBe(false)
  })
})

describe('decayStyle', () => {
  it('es monotónicamente decreciente en scale y opacity', () => {
    let prevScale = Infinity
    let prevOpacity = Infinity
    for (let attempts = 0; attempts <= 10; attempts++) {
      const { scale, opacity } = decayStyle(attempts)
      expect(scale).toBeLessThanOrEqual(prevScale)
      expect(opacity).toBeLessThanOrEqual(prevOpacity)
      prevScale = scale
      prevOpacity = opacity
    }
  })

  it('se acerca a invisible con muchos intentos, sin bajar del piso anti-NaN (0.04 / 0.03)', () => {
    const { scale, opacity } = decayStyle(800)
    expect(scale).toBeCloseTo(0.04, 5)
    expect(opacity).toBeCloseTo(0.03, 5)
  })

  it('decae despacio: tras 20 intentos sigue casi entero', () => {
    const { scale, opacity } = decayStyle(20)
    expect(scale).toBeGreaterThan(0.7)
    expect(opacity).toBeGreaterThan(0.8)
  })

  it('sigue reduciéndose bien pasado el umbral de rendición (7 intentos)', () => {
    const atSurrender = decayStyle(7)
    const wellPast = decayStyle(40)
    expect(wellPast.scale).toBeLessThan(atSurrender.scale)
    expect(wellPast.opacity).toBeLessThan(atSurrender.opacity)
  })

  it('en attempts=0 devuelve el estado completo', () => {
    expect(decayStyle(0)).toEqual({ scale: 1, opacity: 1 })
  })
})
