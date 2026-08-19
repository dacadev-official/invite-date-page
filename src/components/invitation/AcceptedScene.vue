<script setup lang="ts">
import HeartsBurst from '@/components/ui/HeartsBurst.vue'
import type { AcceptedContent, DateDetails } from '@/types/invitation'

defineProps<{
  content: AcceptedContent
  date: DateDetails
}>()
</script>

<template>
  <section class="accepted-scene">
    <HeartsBurst />
    <p class="accepted-scene__eyebrow">Confirmado</p>
    <h2 class="accepted-scene__title">{{ content.title }}</h2>
    <p class="accepted-scene__note">{{ content.note }}</p>

    <dl class="accepted-scene__details">
      <div class="accepted-scene__detail">
        <dt>Fecha</dt>
        <dd>{{ date.day }}</dd>
      </div>
      <div class="accepted-scene__detail">
        <dt>Hora</dt>
        <dd>{{ date.time }}</dd>
      </div>
      <div class="accepted-scene__detail">
        <dt>Lugar</dt>
        <dd>{{ date.place }}, {{ date.city }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.accepted-scene {
  position: relative;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-7) var(--space-4);
}

.accepted-scene__eyebrow {
  margin: 0;
  font-family: var(--font-utility);
  font-size: var(--fs-eyebrow);
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
  color: var(--color-text-muted-on-dark);
}

.accepted-scene__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: var(--fs-display);
  line-height: var(--lh-tight);
}

.accepted-scene__note {
  margin: 0 0 var(--space-4);
  font-family: var(--font-body);
  font-style: italic;
  font-size: var(--fs-subtitle);
  color: var(--color-text-muted-on-dark);
}

.accepted-scene__details {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
  max-width: 20rem;
  padding: var(--space-5);
  background: color-mix(in srgb, var(--color-text-on-dark) 6%, transparent);
  border: var(--border-hairline);
  border-radius: var(--radius-sm);
}

.accepted-scene__detail {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  font-family: var(--font-utility);
}

.accepted-scene__detail dt {
  font-size: var(--fs-caption);
  letter-spacing: var(--ls-utility);
  text-transform: uppercase;
  color: var(--color-text-muted-on-dark);
}

.accepted-scene__detail dd {
  margin: 0;
  font-size: var(--fs-caption);
  text-align: right;
}
</style>
