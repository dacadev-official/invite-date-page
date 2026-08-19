import { ref } from 'vue'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export type FlowState = 'sealed' | 'opening' | 'open' | 'declining' | 'accepted'

/**
 * Debe cubrir la coreografía completa del sobre (EnvelopeCard.vue encadena
 * solapa → hoja que sube → colapso + carta, todo en múltiplos de
 * --duration-envelope; el último tramo termina en ~1.4 × 900ms + 600ms de
 * fade) para que el estado 'open' no llegue antes de que la carta asiente.
 */
const OPENING_ANIMATION_MS = 1500

/**
 * Máquina de estados de la SPA. Ver docs/PRD.md §2.1 para la tabla de
 * transiciones completa. `accepted` es terminal en producción.
 */
export function useInvitationFlow() {
  const state = ref<FlowState>('sealed')
  const { prefersReducedMotion } = usePrefersReducedMotion()

  function openEnvelope() {
    if (state.value !== 'sealed') return
    state.value = 'opening'
    const delay = prefersReducedMotion.value ? 0 : OPENING_ANIMATION_MS
    window.setTimeout(() => {
      if (state.value === 'opening') state.value = 'open'
    }, delay)
  }

  function decline() {
    if (state.value !== 'open') return
    state.value = 'declining'
  }

  function dismissDecline() {
    if (state.value !== 'declining') return
    state.value = 'open'
  }

  function accept() {
    if (state.value === 'open' || state.value === 'declining') {
      state.value = 'accepted'
    }
  }

  return { state, openEnvelope, decline, dismissDecline, accept }
}
