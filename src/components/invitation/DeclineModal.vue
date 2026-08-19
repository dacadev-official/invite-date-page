<script setup lang="ts">
import { ref, useId } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import EvasiveButton from '@/components/ui/EvasiveButton.vue'
import type { DeclineModalContent } from '@/types/invitation'

const props = defineProps<{
  open: boolean
  content: DeclineModalContent
}>()

const emit = defineEmits<{
  dismiss: []
}>()

const titleId = useId()
const homeRef = ref<HTMLElement | null>(null)
const surrendered = ref(false)
// Cambiar esta key fuerza el remount de EvasiveButton, lo que reinicia sus
// `attempts`/`surrendered` internos — ver docs/PRD.md §2.2.
const resetKey = ref(0)

function handleSurrender() {
  surrendered.value = true
}

// Único punto de cierre real del modal (Escape, click en el backdrop, o el
// escape hatch en cascada vía BaseModal): reinicia intento y rendición para
// que la próxima apertura arranque desde cero.
function handleClose() {
  surrendered.value = false
  resetKey.value += 1
  emit('dismiss')
}
</script>

<template>
  <BaseModal :open="open" :labelled-by="titleId" @close="handleClose">
    <h2 :id="titleId" class="decline-modal__title">{{ content.title }}</h2>
    <p class="decline-modal__body">{{ content.body }}</p>

    <!-- El botón es position:fixed y huye por todo el viewport; este div solo
         reserva el hueco donde se posa al abrir, como un botón normal. -->
    <div ref="homeRef" class="decline-modal__home">
      <EvasiveButton
        :key="resetKey"
        :get-home="() => homeRef"
        :visible="props.open"
        :confirm-label="content.confirmLabel"
        :surrender-label="content.surrenderLabel"
        :hint="content.evasiveButtonHint"
        @surrender="handleSurrender"
      />
    </div>

    <p v-if="surrendered" class="decline-modal__surrender-note" role="status">
      {{ content.surrenderNote }}
    </p>

    <BaseButton variant="ghost-on-light" @click="handleClose">{{ content.escapeHatch }}</BaseButton>
  </BaseModal>
</template>

<style scoped>
.decline-modal__title {
  margin: 0 0 var(--space-3);
  font-family: var(--font-utility);
  font-size: var(--fs-heading);
  line-height: var(--lh-tight);
}

.decline-modal__body {
  margin: 0 0 var(--space-5);
  font-family: var(--font-body);
  font-size: var(--fs-body);
}

.decline-modal__home {
  height: 3rem;
  margin-bottom: var(--space-5);
}

.decline-modal__surrender-note {
  margin: 0 0 var(--space-4);
  font-family: var(--font-body);
  font-style: italic;
  text-align: center;
  color: var(--color-accent);
}
</style>
