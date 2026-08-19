# Plan + PRD — Invitación de cita (Vue 3 SPA)

## Contexto

El repo `date-invite-page` está vacío (solo `.editorconfig`, `CLAUDE.md` en blanco y skills en `.agents/`). El objetivo es una **single page application** (sin router) que sirva como invitación a una cita para la novia del usuario: estética romántica-editorial copiada de `resources/main-page-reference.png` (save-the-date oxblood + sobre crema), con un giro cómico: el botón "Declino" abre un modal cuyo botón de confirmación **es inalcanzable** — huye del cursor/dedo, se encoge y se desvanece, y a los 5 intentos se rinde.

Este documento es a la vez **plan de trabajo** y **PRD**. La primera tarea de implementación es copiarlo a `docs/PRD.md` en el repo para que los agentes de implementación/validación trabajen contra él.

Decisiones ya cerradas con el usuario:
- Vite + Vue 3 + TypeScript (Composition API, `<script setup>`).
- CSS puro con design tokens en variables CSS + `<style scoped>`.
- Vitest + Vue Test Utils (unit/component) y Playwright (E2E).
- "Acepto" lleva a pantalla final con celebración + detalles de la cita.
- Todo el copy y los datos viven en un único archivo de contenido con placeholders.
- Escape móvil: salto en `pointerdown` (antes del click) **combinado** con encogimiento/desvanecimiento progresivo.
- A los ~5 intentos el botón se rinde y el modal se cierra solo.

---

## 1. Dirección de diseño (extraída de la referencia)

### 1.1 Paleta (tokens de color)

| Token | Valor | Uso |
|---|---|---|
| `--c-oxblood-900` | `#2E070B` | Sombras, viñeta, borde del sello |
| `--c-oxblood-700` | `#4B0E14` | Fondo principal de la página |
| `--c-crimson-500` | `#7A0D19` | Sello de flor, texto sobre crema, acentos |
| `--c-cream-100` | `#F5EFE6` | Texto sobre oxblood |
| `--c-cream-200` | `#EFE9DC` | Papel del sobre / carta |
| `--c-cream-300` | `#DED5C4` | Bordes de papel, pliegues del sobre |
| `--c-sage-400` | `#9FAE72` | Follaje decorativo (amaranto), único verde |

Gradiente de fondo: radial suave `--c-oxblood-700` → `--c-oxblood-900` en los bordes (viñeta, como la referencia).

### 1.2 Tipografía

Tres roles, cargados desde Google Fonts (`fonts.googleapis.com` + `fonts.gstatic.com`), con fallbacks reales:

- **Display script** — `Pinyon Script` → nombres, "Sí, acepto", frases románticas. Usar con restricción: máximo 3 apariciones.
- **Serif de cuerpo** — `Cormorant Garamond` (400/500, italic disponible) → texto de la carta.
- **Utility caps** — `Marcellus` → eyebrows, labels, botones, fecha/lugar. Siempre `text-transform: uppercase` + `letter-spacing: 0.18em`.

Escala fluida con `clamp()`: `--fs-eyebrow: clamp(.68rem,.6rem+.4vw,.8rem)` … `--fs-display: clamp(2.6rem,1.8rem+5vw,4.5rem)`.

### 1.3 Layout (mobile-first, una columna)

```
┌──────────────────────────┐  oxblood + viñeta
│      EYEBROW CAPS        │  "TENGO UNA PREGUNTA"
│    Nombre en script      │  display script
│    subtítulo italic      │
│                          │
│   ╭──────────────────╮   │  <- SIGNATURE: sobre crema
│   │   solapa 3D      │   │     tap/enter para abrir
│   │  ╭────────────╮  │   │     carta sale deslizando
│   │  │  carta     │  │   │     2 fotos polaroid inclinadas
│   │  ╰────────────╯  │   │     fecha en texto plano
│   ╰──────────────────╯   │
│                          │
│   [ SÍ, ACEPTO ]         │  botón crema sólido
│   [ prefiero declinar ]  │  botón fantasma (borde crema)
└──────────────────────────┘
```

Contenedor `max-width: 30rem` en móvil, `38rem` en desktop; nunca layout de dos columnas — la referencia es vertical y el formato vertical es el que se ve en el teléfono.

### 1.4 Elemento signature

**El sobre que se abre de verdad.** Composición CSS 3D (sin librerías): cara trasera, carta que sube con `translateY`, bolsillo frontal con `clip-path` triangular, y solapa que rota `rotateX(-180deg)` con `transform-origin: top`, cambiando `z-index` al pasar el 50% de la animación. Es el único momento maximalista de la página; el resto se mantiene quieto y disciplinado.

El segundo momento de personalidad — el botón que huye — se mantiene visualmente sobrio a propósito (mismo estilo que los demás botones) para que el chiste sea el comportamiento, no la decoración.

### 1.5 Movimiento

- Entrada: eyebrow → título → sobre, en cascada de 120ms (`opacity` + `translateY(12px)`).
- Sobre: apertura 900ms `cubic-bezier(.22,1,.36,1)`.
- Carta: sale 600ms con 200ms de retraso.
- Aceptar: ráfaga de corazones (12–16 SVG, `transform` + `opacity`, sin canvas).
- `prefers-reduced-motion: reduce` → todas las transiciones a 1ms, sin corazones, el botón evasivo teletransporta sin transición.

---

## 2. Arquitectura

```
src/
  main.ts
  App.vue                          # orquesta la máquina de estados, nada de lógica de UI
  assets/styles/
    tokens.css                     # SOLO custom properties (colores, tipo, spacing, radios, sombras, duraciones)
    base.css                       # reset, html/body, focus-visible, reduced-motion global
    fonts.css                      # @import Google Fonts + font stacks
  types/
    invitation.ts                  # InvitationContent, DateDetails, PhotoRef
  content/
    invitation.ts                  # ÚNICA fuente de copy y datos (placeholders)
  composables/
    useInvitationFlow.ts           # máquina de estados de la página
    useEvasiveTarget.ts            # binding DOM/eventos del botón evasivo
    usePrefersReducedMotion.ts     # matchMedia reactivo
  utils/
    escape.ts                      # pickEscapePosition() — función PURA, testeable
  components/
    invitation/
      InvitationHero.vue           # eyebrow + nombre + subtítulo
      EnvelopeCard.vue             # sobre 3D, emite 'open'
      LetterSheet.vue              # carta: texto + 2 fotos polaroid + fecha (texto plano)
      RsvpActions.vue              # emite 'accept' | 'decline'
      DeclineModal.vue             # diálogo con el EvasiveButton
      AcceptedScene.vue            # celebración + detalles de la cita
    ui/
      BaseButton.vue               # variantes: solid | ghost
      BaseModal.vue                # <dialog> nativo, focus trap, Escape cierra
      EvasiveButton.vue            # presentación; consume useEvasiveTarget
      HeartsBurst.vue              # ráfaga decorativa, aria-hidden
tests/
  unit/                            # Vitest
  e2e/                             # Playwright
docs/
  PRD.md                           # copia de este documento
```

Reglas de organización (buenas prácticas Vue que los agentes deben respetar):
- `<script setup lang="ts">` en todos los componentes; `defineProps`/`defineEmits` **tipados con genéricos**, nunca objetos en runtime.
- Componentes de presentación sin estado global: reciben props, emiten eventos. Toda la lógica de estado vive en composables.
- Sin Pinia — el estado cabe en un composable; añadirlo sería sobre-ingeniería para una SPA de una pantalla.
- Nombres de componente multi-palabra, PascalCase en archivos y templates.
- CSS: `<style scoped>` por componente, consumiendo **siempre** `var(--token)`. Ningún hex literal fuera de `tokens.css`.
- Cero acceso a `document`/`window` fuera de composables y de `onMounted`.

### 2.1 Máquina de estados (`useInvitationFlow`)

```ts
type FlowState = 'sealed' | 'opening' | 'open' | 'declining' | 'accepted'
```

| De | Evento | A |
|---|---|---|
| `sealed` | `openEnvelope()` | `opening` → (timeout animación) → `open` |
| `open` | `decline()` | `declining` |
| `declining` | `dismissDecline()` (rendición, Escape, "mejor sí acepto") | `open` |
| `open` \| `declining` | `accept()` | `accepted` |

`accepted` es terminal. No hay `reset` en producción (se puede exponer para tests).

### 2.2 Lógica del botón evasivo

**`utils/escape.ts` — puro y determinista** (esto es lo que se testea en unit):

```ts
export interface EscapeInput {
  field: { width: number; height: number }   // área permitida (el VIEWPORT completo)
  button: { width: number; height: number }
  pointer: { x: number; y: number } | null   // centro de amenaza
  current: { x: number; y: number }
  padding: number                            // margen al borde, default 12
  candidates?: number                        // muestras, default 24
  random?: () => number                      // inyectable para tests
}
export function pickEscapePosition(input: EscapeInput): { x: number; y: number }
export function shouldFlee(pointer, rect, radius): boolean       // radio ~56px alrededor del BOTÓN
export function decayStyle(attempts: number): { scale: number; opacity: number }
```

- `pickEscapePosition`: genera N candidatos dentro de `field` menos `padding`, descarta los que quedan a menos de `minDistance` del puntero, y elige el que maximiza la distancia al puntero **penalizando** quedarse en el mismo cuadrante que `current`. Siempre devuelve una posición dentro del campo (clamp) aunque no haya candidato ideal.
- `decayStyle(n)`: `scale = max(0.04, 0.985 ** n)`, `opacity = max(0.03, 0.992 ** n)`. Decae **muy despacio** a propósito (a los 20 intentos sigue casi entero, mitad de tamaño hacia los ~50) y sin piso real: con persistencia suficiente (~200+) el botón se vuelve imperceptible, nunca se congela ni se reinicia.

**`composables/useEvasiveTarget.ts` — el pegamento DOM:**

El botón es `position: fixed` y huye por **todo el viewport** (vive en el subtree del `<dialog>`, así que pinta sobre el backdrop). Al abrir el modal se posa sobre un ancla (`getHome`) dentro del panel, con aspecto de botón de confirmación normal; la primera aproximación del puntero lo lanza a la pantalla completa.

| Entrada | Comportamiento |
|---|---|
| `pointermove` (mouse, en `window`) a ≤56px del botón | reposiciona + `attempts++` |
| `pointerdown` / `touchstart` | `preventDefault()` **antes** de que se genere el click, reposiciona, `attempts++` |
| `focus` (teclado) | reposiciona, `attempts++` (nunca se bloquea el foco: el modal sigue navegable) |
| `scale <= 0.3` o `opacity <= 0.3` (ver `decayStyle`) | estado `surrendered`: cambia el label y emite `surrender` UNA vez — pero **sigue huyendo y encogiendo para siempre** |

El cambio de texto (label del botón, nota de rendición) **no** dispara a un número fijo de intentos: espera a que el encogimiento progresivo (`decayStyle`) vuelva al botón visiblemente pequeño (`scale` cae más rápido que `opacity`, así que en la práctica es el que dispara el umbral). Con la tasa actual (0.985) eso ronda los ~80 intentos. El componente padre (`DeclineModal`) escucha `surrender` y muestra la línea de rendición. El modal **no** se cierra solo. El estado (intentos, rendición) persiste **mientras el modal esté abierto** — sobrevive a intentos repetidos de pulsar el botón — pero se reinicia por completo al cerrar el modal (Escape o "mejor sí acepto"; el click en el backdrop **no** cierra el modal): `DeclineModal` fuerza el remount de `EvasiveButton` vía `:key`, así que la próxima apertura siempre arranca en `attempts = 0`, sin rendición previa.

**Garantía dura:** `EvasiveButton` **no** tiene handler de `click` que confirme nada. Aunque un click llegara, no existe transición "declinar de verdad". Es una broma, no un flujo real.

**Accesibilidad:** el `<dialog>` mantiene focus trap, `Escape` cierra, y el botón "Mejor sí acepto" es alcanzable siempre por teclado y por tap. `EvasiveButton` lleva `aria-describedby` con una nota (`.sr-only`) que explica que es una broma, para que un lector de pantalla no deje al usuario atrapado.

### 2.3 Contenido (`src/content/invitation.ts`)

Un solo objeto tipado con placeholders que el usuario edita luego:

```ts
export const invitation: InvitationContent = {
  eyebrow: 'TENGO ALGO QUE PREGUNTARTE',
  recipientName: '{NOMBRE}',
  subtitle: 'una invitación formal, con un solo desenlace posible',
  letter: { greeting, body: string[], signature },
  photos: [
    { src: 'https://placehold.co/600x760/EFE9DC/4B0E14?text=Nosotros+1', alt: '…' },
    { src: 'https://placehold.co/600x760/EFE9DC/4B0E14?text=Nosotros+2', alt: '…' },
  ],
  date: { day: '{DD.MM.AAAA}', time: '{HH:MM}', place: '{LUGAR}', city: '{CIUDAD}' },
  actions: { accept: 'Sí, acepto', decline: 'Prefiero declinar' },
  declineModal: {
    title: '¿Segura que quieres declinar…',
    body: '…y perderte esta cita increíble?',
    confirmLabel: 'Segura',
    escapeHatch: 'Mejor sí acepto',
    surrenderLabel: 'Ok, ya. Di que sí.',
    surrenderNote: 'El botón se rindió. Tú también deberías.',
  },
  accepted: { title: '¡Sabía que dirías que sí!', note: '…' },
}
```

Copy en español, registro conversacional, sin emojis en el texto (los corazones son SVG decorativos). Los botones nombran la acción exacta que ejecutan.

---

## 3. Plan de trabajo por fases (para delegar)

Cada fase es entregable independiente y verificable.

**Fase 0 — Scaffold**
`npm create vue@latest` con TypeScript + Vitest + Playwright + ESLint + Prettier, sin Router ni Pinia. Copiar este documento a `docs/PRD.md`. Rellenar `CLAUDE.md` con las reglas de la sección 2. Verificar: `npm run dev`, `npm run build`, `npm run type-check` limpios.

**Fase 1 — Sistema de diseño**
`tokens.css`, `base.css`, `fonts.css` + `BaseButton.vue` y `BaseModal.vue`. Verificar: página en blanco con el fondo oxblood correcto y un botón de cada variante, screenshot en 390×844.

**Fase 2 — Contenido y tipos**
`types/invitation.ts` + `content/invitation.ts`. Verificar: `type-check` limpio, un test que valida que ningún campo de texto está vacío.

**Fase 3 — Hero + sobre (signature)**
`InvitationHero.vue`, `EnvelopeCard.vue`, `LetterSheet.vue`, `usePrefersReducedMotion.ts`. Verificar: tap abre el sobre, la carta sale, las dos fotos placeholder cargan, con reduced-motion no hay animación.

**Fase 4 — Flujo RSVP**
`useInvitationFlow.ts`, `RsvpActions.vue`, wiring en `App.vue`. Verificar: los dos botones aparecen tras abrir el sobre y las transiciones de estado son las de la tabla 2.1.

**Fase 5 — Botón evasivo (núcleo del chiste)**
`utils/escape.ts` primero **en TDD** (tests antes que implementación), luego `useEvasiveTarget.ts`, `EvasiveButton.vue`, `DeclineModal.vue`. Verificar: unit tests verdes + prueba manual en móvil real/emulado.

**Fase 6 — Pantalla de aceptación**
`AcceptedScene.vue` + `HeartsBurst.vue` con fecha/hora/lugar del contenido. Verificar: screenshot móvil y desktop.

**Fase 7 — Tests E2E y QA**
Suite Playwright + pasada de accesibilidad y de rendimiento. Verificar: sección 4 completa.

---

## 4. Verificación

**Unit (Vitest) — obligatorio:**
- `pickEscapePosition`: siempre dentro del campo; se aleja del puntero; con RNG inyectado es determinista; sobrevive a un campo más pequeño que el botón.
- `shouldFlee` en el borde exacto del radio.
- `decayStyle`: monotónica, decae despacio (visible tras 20 intentos) y solo tiene un piso anti-NaN (0.04 / 0.03).
- `useInvitationFlow`: cada transición de la tabla; `accepted` no vuelve atrás.

**Component (Vue Test Utils):**
- `EnvelopeCard` emite `open` con click y con `Enter`.
- `EvasiveButton` **no** emite `click` tras `pointerdown` y llama a `preventDefault`.
- Al cruzar el umbral de desvanecimiento (`scale`/`opacity` <= 0.3) emite `surrender` (una sola vez) y sigue siendo evasivo.
- `DeclineModal` cierra con `Escape` y con "Mejor sí acepto"; click en el backdrop no cierra.

**E2E (Playwright) — dos proyectos: `iPhone 13` y `Desktop Chrome`:**
1. Flujo feliz: abrir sobre → leer carta → "Sí, acepto" → pantalla final muestra fecha/hora/lugar.
2. Flujo cómico móvil: "Prefiero declinar" → taps repetidos sobre "Segura" → nunca se registra activación → aparece la rendición → el modal sigue abierto.
3. Flujo cómico desktop: `mouse.move` hacia el botón → su `boundingBox()` cambia antes del click.
4. Salida por "Mejor sí acepto" desde el modal → pantalla final.
5. Proyecto extra con `reducedMotion: 'reduce'`: el flujo completo funciona sin animaciones.

**Manual / visual:**
- `npm run dev` y revisión en 390×844, 430×932 y 1440×900.
- Comparar contra `resources/main-page-reference.png`: fondo, tipografía, sobre.
- Navegación completa solo con teclado, con foco visible en todo momento.
- `npm run build && npm run preview` sin errores de consola.

---

## 5. Fuera de alcance

Router, backend, envío de notificaciones, i18n, persistencia, imágenes reales (llegan editando `content/invitation.ts`), y despliegue (el build es estático en `dist/`, listo para Vercel/Netlify/GitHub Pages cuando el usuario lo pida).
