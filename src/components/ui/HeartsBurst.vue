<script setup lang="ts">
interface HeartSpec {
  left: number
  delay: number
  duration: number
  drift: number
  scale: number
}

const HEART_COUNT = 14

// Generado una vez al montar: puramente decorativo, no necesita ser reactivo.
const hearts: HeartSpec[] = Array.from({ length: HEART_COUNT }, () => ({
  left: Math.random() * 100,
  delay: Math.random() * 0.4,
  duration: 1.6 + Math.random() * 0.9,
  drift: (Math.random() - 0.5) * 40,
  scale: 0.6 + Math.random() * 0.7,
}))
</script>

<template>
  <div class="hearts-burst" aria-hidden="true">
    <span
      v-for="(heart, index) in hearts"
      :key="index"
      class="hearts-burst__heart"
      :style="{
        left: `${heart.left}%`,
        animationDelay: `${heart.delay}s`,
        animationDuration: `${heart.duration}s`,
        '--drift': `${heart.drift}px`,
        '--scale': heart.scale,
      }"
    >
      ❤
    </span>
  </div>
</template>

<style scoped>
.hearts-burst {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.hearts-burst__heart {
  position: absolute;
  bottom: -1rem;
  color: var(--color-accent);
  font-size: calc(1.25rem * var(--scale, 1));
  opacity: 0;
  animation-name: hearts-burst-rise;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
}

@keyframes hearts-burst-rise {
  0% {
    transform: translate(0, 0) scale(var(--scale, 1));
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  100% {
    transform: translate(var(--drift, 0), -22rem) scale(var(--scale, 1));
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hearts-burst {
    display: none;
  }
}
</style>
