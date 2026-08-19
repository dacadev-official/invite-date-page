<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { useEvasiveTarget } from '@/composables/useEvasiveTarget'

const props = defineProps<{
  /** Ancla dentro del modal donde el botón se posa al abrir (solo posición inicial). */
  getHome: () => HTMLElement | null
  confirmLabel: string
  surrenderLabel: string
  hint: string
  /** true mientras el botón es visible (el modal está abierto). */
  visible: boolean
}>()

const emit = defineEmits<{
  surrender: []
}>()

const hintId = useId()
const buttonRef = ref<HTMLElement | null>(null)
const visible = computed(() => props.visible)
const { surrendered, style } = useEvasiveTarget(props.getHome, buttonRef, { visible })

// Solo notifica la PRIMERA vez que cruza el umbral: el mensaje de rendición
// no debe repetirse, pero el botón sigue huyendo/encogiendo para siempre.
watch(surrendered, (value) => {
  if (value) emit('surrender')
})
</script>

<template>
  <button
    ref="buttonRef"
    type="button"
    class="evasive-button"
    :class="{ 'evasive-button--surrendered': surrendered }"
    :style="style"
    :aria-describedby="hintId"
    data-testid="evasive-button"
  >
    {{ surrendered ? surrenderLabel : confirmLabel }}
  </button>
  <span :id="hintId" class="sr-only">{{ hint }}</span>
</template>

<style scoped>
/* fixed respecto al viewport: el botón huye por TODA la pantalla, no dentro
   de una caja. Vive en el subtree del <dialog> (top layer), así que pinta por
   encima del backdrop aunque salga de los límites del panel del modal. */
.evasive-button {
  position: fixed;
  left: 0;
  top: 0;
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-accent);
  background: var(--color-accent);
  color: var(--color-text-on-dark);
  font-family: var(--font-utility);
  font-size: var(--fs-caption);
  letter-spacing: var(--ls-utility);
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  will-change: transform, opacity;
  /* Saltos largos (viewport entero) piden más tiempo de vuelo que el token
     base para que el movimiento se lea como huida y no como teletransporte. */
  transition:
    transform calc(var(--duration-base) * 1.5) var(--ease-standard),
    opacity calc(var(--duration-base) * 1.5) var(--ease-standard);
}

.evasive-button--surrendered {
  background: var(--color-surface-edge);
  border-color: var(--color-surface-edge);
  color: var(--color-text-on-light);
}
</style>
