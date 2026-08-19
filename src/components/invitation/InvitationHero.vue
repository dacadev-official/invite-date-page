<script setup lang="ts">
defineProps<{
  eyebrow: string
  recipientName: string
  subtitle: string
}>()
</script>

<template>
  <header class="hero">
    <p class="hero__eyebrow">{{ eyebrow }}</p>
    <h1 class="hero__name">{{ recipientName }}</h1>
    <p class="hero__subtitle">{{ subtitle }}</p>
  </header>
</template>

<style scoped>
.hero {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.hero__eyebrow {
  margin: 0;
  font-family: var(--font-utility);
  font-size: var(--fs-eyebrow);
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
  color: var(--color-text-muted-on-dark);
}

.hero__name {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: var(--fs-display);
  line-height: var(--lh-tight);
  color: var(--color-text-on-dark);
}

.hero__subtitle {
  margin: 0;
  font-family: var(--font-body);
  font-style: italic;
  font-size: var(--fs-subtitle);
  color: var(--color-text-muted-on-dark);
}
</style>
