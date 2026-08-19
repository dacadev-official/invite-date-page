<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps<{
  acceptLabel: string
  declineLabel: string
}>()

const emit = defineEmits<{
  accept: []
  decline: []
}>()
</script>

<template>
  <div class="rsvp-actions">
    <BaseButton variant="solid" @click="emit('accept')">{{ acceptLabel }}</BaseButton>
    <BaseButton variant="ghost" @click="emit('decline')">{{ declineLabel }}</BaseButton>
  </div>
</template>

<style scoped>
.rsvp-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>
