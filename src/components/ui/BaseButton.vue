<script setup lang="ts">
withDefaults(
  defineProps<{
    /**
     * 'ghost' = borde claro sobre fondo oscuro (oxblood, ej. la página).
     * 'ghost-on-light' = mismo estilo pero para fondos claros (ej. dentro
     * de un modal con --color-surface de fondo).
     */
    variant?: 'solid' | 'ghost' | 'ghost-on-light'
    type?: 'button' | 'submit'
  }>(),
  {
    variant: 'solid',
    type: 'button',
  },
)
</script>

<template>
  <button :type="type" class="base-button" :class="`base-button--${variant}`">
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-sm);
  font-family: var(--font-utility);
  font-size: var(--fs-caption);
  letter-spacing: var(--ls-utility);
  text-transform: uppercase;
  cursor: pointer;
  transition:
    transform var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard);
}

.base-button:active {
  transform: scale(0.98);
}

.base-button--solid {
  background: var(--color-surface);
  color: var(--color-text-on-light);
  border: 1px solid var(--color-surface);
  box-shadow: var(--shadow-lift);
}

.base-button--solid:hover {
  background: var(--c-cream-100);
}

.base-button--ghost {
  background: transparent;
  color: var(--color-text-on-dark);
  border: 1px solid color-mix(in srgb, var(--color-text-on-dark) 55%, transparent);
}

.base-button--ghost:hover {
  border-color: var(--color-text-on-dark);
  background: color-mix(in srgb, var(--color-text-on-dark) 8%, transparent);
}

.base-button--ghost-on-light {
  background: transparent;
  color: var(--color-text-on-light);
  border: 1px solid color-mix(in srgb, var(--color-text-on-light) 45%, transparent);
}

.base-button--ghost-on-light:hover {
  border-color: var(--color-text-on-light);
  background: color-mix(in srgb, var(--color-text-on-light) 6%, transparent);
}
</style>
