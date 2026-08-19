import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Refleja `prefers-reduced-motion` de forma reactiva. Los tokens CSS ya
 * colapsan las duraciones a 1ms bajo ese media query; este composable existe
 * para la lógica JS que no puede depender solo de CSS (p. ej. saltarse
 * temporizadores de animación antes de cambiar de estado).
 */
export function usePrefersReducedMotion() {
  const query = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null

  const prefersReducedMotion = ref(query?.matches ?? false)

  function handleChange(event: MediaQueryListEvent) {
    prefersReducedMotion.value = event.matches
  }

  onMounted(() => {
    query?.addEventListener('change', handleChange)
  })

  onUnmounted(() => {
    query?.removeEventListener('change', handleChange)
  })

  return { prefersReducedMotion }
}
