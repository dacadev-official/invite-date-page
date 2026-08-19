<script setup lang="ts">
import { computed } from 'vue'
import LetterSheet from './LetterSheet.vue'
import type { LetterContent, PhotoRef } from '@/types/invitation'

const props = defineProps<{
  state: 'sealed' | 'opening' | 'open'
  letter: LetterContent
  photos: [PhotoRef, PhotoRef]
  dateDay: string
  openLabel: string
  openedLabel: string
}>()

const emit = defineEmits<{
  open: []
}>()

const isInteractive = computed(() => props.state === 'sealed')
const hasOpened = computed(() => props.state !== 'sealed')
const ariaLabel = computed(() => (isInteractive.value ? props.openLabel : props.openedLabel))

function handleActivate() {
  if (isInteractive.value) emit('open')
}
</script>

<template>
  <button
    type="button"
    class="envelope"
    :class="`envelope--${state}`"
    :aria-label="ariaLabel"
    :aria-disabled="!isInteractive"
    @click="handleActivate"
  >
    <div class="envelope__shell-track">
      <div class="envelope__shell">
        <span class="envelope__back" aria-hidden="true" />
        <span class="envelope__pocket" aria-hidden="true" />
        <span class="envelope__flap" aria-hidden="true">
          <span class="envelope__seal" />
        </span>
      </div>
    </div>

    <div class="envelope__letter">
      <LetterSheet v-if="hasOpened" :letter="letter" :photos="photos" :date-day="dateDay" />
    </div>
  </button>
</template>

<style scoped>
/* Coreografía de apertura (ver PRD §1.4). La carta real es una sola pieza de
   principio a fin: empieza plegada dentro del sobre (escalada, visible solo
   por la boca en V), sube saliendo por la boca —por delante de la solapa ya
   abierta, por detrás del bolsillo— y baja hacia el lector creciendo a tamaño
   completo mientras el sobre se pliega y se desvanece bajo ella.

   Todo cuelga de --duration-envelope / --duration-letter para que
   prefers-reduced-motion (1ms) colapse la secuencia entera. Duración total:
   --duration-envelope + --duration-letter (900 + 600 = 1500ms), igual que
   OPENING_ANIMATION_MS en useInvitationFlow.ts. */
.envelope {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  text-align: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.envelope[aria-disabled='true'] {
  cursor: default;
}

/* Truco grid-template-rows 1fr→0fr: colapsa el alto reservado del sobre sin
   medirlo con JS, a la vez que la carta desciende a ocupar su sitio. */
.envelope__shell-track {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows var(--duration-letter) var(--ease-envelope) var(--duration-envelope);
}

.envelope--opening .envelope__shell-track,
.envelope--open .envelope__shell-track {
  grid-template-rows: 0fr;
}

/* Sin perspective, overflow ni transición de opacity aquí: el shell NO debe
   crear stacking context mientras la carta sale (el intercalado por z-index
   depende de ello; incluso una transición de opacity en fase de delay ya crea
   contexto). El fundido va pieza a pieza (back/pocket/flap) — cada una
   conserva su z-index en el contexto raíz. La perspectiva 3D vive en el
   transform de la solapa. */
.envelope__shell {
  position: relative;
  min-height: 0;
  width: 100%;
  aspect-ratio: var(--envelope-aspect);
}

/* Interior del sobre: se ve por la boca cuando la solapa se levanta. */
.envelope__back {
  position: absolute;
  inset: 0;
  z-index: var(--z-envelope-back);
  border-radius: var(--radius-sm);
  background: var(--color-surface-edge);
  box-shadow: var(--shadow-card);
  transition: opacity var(--duration-letter) var(--ease-standard) var(--duration-envelope);
}

/* Bolsillo frontal: cubre todo salvo la boca en V; la carta pasa por detrás. */
.envelope__pocket {
  position: absolute;
  inset: 0;
  z-index: var(--z-envelope-pocket);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  clip-path: polygon(0% 0%, 50% 48%, 100% 0%, 100% 100%, 0% 100%);
  transition: opacity var(--duration-letter) var(--ease-standard) var(--duration-envelope);
}

.envelope__flap {
  position: absolute;
  inset: 0;
  z-index: var(--z-flap-closed);
  clip-path: polygon(0% 0%, 100% 0%, 50% 62%);
  background: var(--color-surface-edge);
  transform-origin: top center;
  transform: perspective(1400px) rotateX(0deg);
  transition:
    transform var(--duration-envelope) var(--ease-envelope),
    opacity var(--duration-letter) var(--ease-standard) var(--duration-envelope),
    z-index 0s calc(var(--duration-envelope) / 2);
}

.envelope--opening .envelope__flap,
.envelope--open .envelope__flap {
  z-index: var(--z-flap-open);
  transform: perspective(1400px) rotateX(-180deg);
}

.envelope--opening .envelope__back,
.envelope--open .envelope__back,
.envelope--opening .envelope__pocket,
.envelope--open .envelope__pocket,
.envelope--opening .envelope__flap,
.envelope--open .envelope__flap {
  opacity: 0;
}

.envelope__seal {
  position: absolute;
  left: 50%;
  top: 46%;
  transform: translate(-50%, -50%);
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999% 40% 999% 40%;
  background: var(--color-accent);
  box-shadow: var(--shadow-lift);
  transition: opacity var(--duration-fast) var(--ease-standard);
}

.envelope--opening .envelope__seal,
.envelope--open .envelope__seal {
  opacity: 0;
}

/* Durante la apertura la carta se ancla en absolute al borde superior del
   sobre; su posición final de keyframe (translateY(0) scale(1) con el shell
   ya colapsado a 0) coincide exactamente con su posición estática en flujo,
   así que el cambio a 'open' no produce ningún salto visual. */
.envelope--opening .envelope__letter {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-letter);
  transform-origin: top center;
  animation: letter-pullout calc(var(--duration-envelope) + var(--duration-letter)) both;
}

@keyframes letter-pullout {
  /* Plegada dentro del sobre, asomando apenas por la boca en V. */
  0% {
    z-index: var(--z-letter);
    transform: translateY(1%) scale(0.45);
    animation-timing-function: var(--ease-standard);
  }
  /* Espera a que la solapa pase el punto medio antes de salir. */
  26% {
    z-index: var(--z-letter);
    transform: translateY(0) scale(0.45);
    animation-timing-function: var(--ease-envelope);
  }
  /* Fuera del sobre, en el punto más alto — ya no se solapa con el bolsillo,
     así que el salto al frente (z) es invisible. */
  60% {
    z-index: var(--z-letter);
    transform: translateY(-62%) scale(0.5);
    animation-timing-function: var(--ease-envelope);
  }
  61%,
  100% {
    z-index: var(--z-letter-front);
  }
  /* Desciende hacia el lector creciendo a tamaño de lectura, mientras el
     sobre se pliega y desvanece debajo. */
  100% {
    transform: translateY(0) scale(1);
  }
}
</style>
