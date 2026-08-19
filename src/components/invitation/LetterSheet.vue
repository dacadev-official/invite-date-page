<script setup lang="ts">
import type { LetterContent, PhotoRef } from '@/types/invitation'

defineProps<{
  letter: LetterContent
  photos: [PhotoRef, PhotoRef, PhotoRef]
  dateDay: string
}>()
</script>

<template>
  <article class="letter">
    <div class="letter__photos-left">
      <figure class="letter__photo letter__photo--one">
        <img :src="photos[0].src" :alt="photos[0].alt" loading="lazy" />
      </figure>
      <figure class="letter__photo letter__photo--two">
        <img :src="photos[1].src" :alt="photos[1].alt" loading="lazy" />
      </figure>
    </div>

    <figure class="letter__photo letter__photo--three">
      <img :src="photos[2].src" :alt="photos[2].alt" loading="lazy" />
    </figure>

    <div class="letter__text">
      <p class="letter__greeting">{{ letter.greeting }}</p>
      <p v-for="(paragraph, index) in letter.body" :key="index" class="letter__paragraph">
        {{ paragraph }}
      </p>
      <p class="letter__signature">{{ letter.signature }}</p>
      <p class="letter__date">{{ dateDay }}</p>
    </div>
  </article>
</template>

<style scoped>
.letter {
  position: relative;
  background: var(--color-surface);
  color: var(--color-text-on-light);
  border-radius: var(--radius-sm);
  padding: var(--space-4) var(--space-3) var(--space-5);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.letter__photos-left {
  display: flex;
  justify-content: flex-start;
  gap: var(--space-2);
  margin-top: calc(-1 * var(--space-5));
  margin-left: calc(-1 * var(--space-4));
  margin-bottom: calc(-1 * var(--space-2));
  padding-top: var(--space-1);
  position: absolute;
  z-index: 1;
  transform: rotate(-13deg) translate(-55px,-59px);
}

.letter__photo {
  margin: 0;
  background: var(--c-cream-100);
  padding: var(--space-1) var(--space-1) var(--space-3);
  box-shadow: var(--shadow-lift);
  width: 44%;
  max-width: 8.5rem;
}

.letter__photo img {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
}

.letter__photo--one {
  transform: rotate(-6deg);
}

.letter__photo--two {
  transform: rotate(5deg);
  margin-top: var(--space-4);
  margin-left: calc(-1 * var(--space-3));
}

.letter__photo--three {
  position: absolute;
  top: 50%;
  right: calc(-1 * var(--space-4));
  width: 40%;
  max-width: 7rem;
  transform: translateY(-50%) rotate(7deg);
  z-index: 1;
}

.letter__text {
  font-family: var(--font-body);
  text-align: center;
}

.letter__greeting {
  font-size: var(--fs-body);
  font-style: italic;
  margin: 0 0 var(--space-2);
}

.letter__paragraph {
  margin: 0 0 var(--space-2);
  font-size: var(--fs-caption);
  color: color-mix(in srgb, var(--color-text-on-light) 85%, transparent);
}

.letter__signature {
  margin: var(--space-2) 0 0;
  font-family: var(--font-display);
  font-size: var(--fs-subtitle);
  color: var(--color-accent);
}

.letter__date {
  margin: var(--space-3) 0 0;
  font-family: var(--font-utility);
  font-size: var(--fs-caption);
  letter-spacing: var(--ls-utility);
  color: color-mix(in srgb, var(--color-text-on-light) 70%, transparent);
}
</style>
