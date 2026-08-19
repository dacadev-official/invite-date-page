# date-invite-page

SPA en Vue 3 (sin router, sin Pinia) para una invitación de cita romántica-cómica.
Especificación completa: [`docs/PRD.md`](docs/PRD.md). Léelo antes de tocar el flujo del sobre
o el botón de declinar — ambos tienen contratos de comportamiento explícitos ahí.

## Stack

- Vite + Vue 3 + TypeScript, `<script setup lang="ts">` en todo.
- CSS puro: custom properties en `src/assets/styles/tokens.css`, nunca hex fuera de ese archivo.
- Vitest + Vue Test Utils (unit/component), Playwright (E2E, proyectos `chromium`, `iPhone 13`, `reduced-motion`).
- Sin Vuex/Pinia: el estado de la SPA cabe en `src/composables/useInvitationFlow.ts`.

## Reglas de arquitectura

- Componentes de presentación puros: reciben props, emiten eventos tipados (`defineEmits<{...}>()`), sin lógica de estado propia.
- Toda lógica no trivial vive en `src/composables/` o `src/utils/`. Las funciones en `src/utils/` deben ser puras y testeables sin DOM.
- Contenido y copy: **solo** en `src/content/invitation.ts`. Ningún componente hardcodea texto visible al usuario.
- Cero acceso a `document`/`window` fuera de composables y de `onMounted`.
- `EvasiveButton.vue` nunca emite un evento de confirmación real — es una broma, no un flujo de decline funcional. No añadir un handler de `click` que dispare nada.

## Comandos

```bash
npm run dev          # servidor local
npm run type-check   # vue-tsc --build
npm run test:unit    # Vitest
npm run test:e2e     # Playwright
npm run lint         # oxlint + eslint
npm run build         # type-check + vite build
```

## Verificación antes de dar por terminada una fase

Ver la sección "4. Verificación" de `docs/PRD.md`. Como mínimo: `type-check`, `test:unit` y una
revisión visual en 390×844 contra `resources/main-page-reference.png`.
