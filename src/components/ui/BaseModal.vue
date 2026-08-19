<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  labelledBy: string
}>()

const emit = defineEmits<{
  close: []
}>()

const dialogRef = ref<HTMLDialogElement | null>(null)

watch(
  () => props.open,
  (isOpen) => {
    const dialog = dialogRef.value
    if (!dialog) return
    if (isOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  },
)

// <dialog> emite 'close' tanto por Escape nativo como por dialog.close():
// siempre lo propagamos para que el composable de estado se mantenga en sync.
function onNativeClose() {
  emit('close')
}
</script>

<template>
  <dialog ref="dialogRef" class="base-modal" :aria-labelledby="labelledBy" @close="onNativeClose">
    <div class="base-modal__panel">
      <slot />
    </div>
  </dialog>
</template>

<style scoped>
.base-modal {
  position: fixed;
  inset: 0;
  margin: auto;
  width: min(90vw, 26rem);
  max-height: 85vh;
  max-height: 85dvh;
  overflow-y: auto;
  padding: 0;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  overscroll-behavior: contain;
}

.base-modal::backdrop {
  background: color-mix(in srgb, var(--c-oxblood-900) 72%, transparent);
}

.base-modal__panel {
  position: relative;
  overflow: hidden;
  padding: var(--space-6) var(--space-5);
  background: var(--color-surface);
  color: var(--color-text-on-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  min-height: 12rem;
}
</style>
