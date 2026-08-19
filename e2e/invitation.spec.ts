import { expect, test, type Page } from '@playwright/test'

/**
 * Los textos exactos reflejan src/content/invitation.ts — si cambia el
 * copy ahí, actualiza estas cadenas también.
 */
const OPEN_ENVELOPE_LABEL = 'Abre el sobre'
const ACCEPT_LABEL = 'Sí, va'
const DECLINE_LABEL = 'Paso, gracias'
const DECLINE_TITLE = '¿En serio quieres decir que no?'
const CONFIRM_LABEL = 'Sí, en serio'
const ESCAPE_HATCH_LABEL = 'Mejor sí voy'
const SURRENDER_LABEL = 'Ya, va, digo que sí.'
const ACCEPTED_TITLE = '¡Sabía que dirías que sí!'

async function openEnvelope(page: Page) {
  await page.getByRole('button', { name: OPEN_ENVELOPE_LABEL }).click()
  // La carta tarda ~950ms en terminar de salir del sobre (ver
  // useInvitationFlow.ts); esperar al botón de RSVP en vez de un timeout
  // fijo mantiene el test robusto bajo reduced-motion (donde es instantáneo).
  await expect(page.getByRole('button', { name: ACCEPT_LABEL })).toBeVisible()
}

test.describe('invitación — flujo principal', () => {
  test('abrir el sobre, leer la carta y aceptar muestra la pantalla final con los detalles de la cita', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page.getByRole('button', { name: OPEN_ENVELOPE_LABEL })).toBeVisible()
    await openEnvelope(page)

    await expect(page.getByText('Hola')).toBeVisible()

    await page.getByRole('button', { name: ACCEPT_LABEL }).click()

    await expect(page.getByRole('heading', { name: ACCEPTED_TITLE })).toBeVisible()
    await expect(page.getByText('Fecha', { exact: true })).toBeVisible()
    await expect(page.getByText('Hora', { exact: true })).toBeVisible()
    await expect(page.getByText('Lugar', { exact: true })).toBeVisible()
  })

  test('el escape hatch del modal de declinar lleva a la pantalla de aceptación', async ({ page }) => {
    await page.goto('/')
    await openEnvelope(page)

    await page.getByRole('button', { name: DECLINE_LABEL }).click()
    await expect(page.getByRole('heading', { name: DECLINE_TITLE })).toBeVisible()

    await page.getByRole('button', { name: ESCAPE_HATCH_LABEL }).click()
    await expect(page.getByRole('heading', { name: DECLINE_TITLE })).toBeHidden()

    await page.getByRole('button', { name: ACCEPT_LABEL }).click()
    await expect(page.getByRole('heading', { name: ACCEPTED_TITLE })).toBeVisible()
  })
})

test.describe('botón evasivo — desktop (mouse)', () => {
  test('el botón se aparta antes de que el mouse lo alcance', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Solo aplica a punteros de mouse')

    await page.goto('/')
    await openEnvelope(page)
    await page.getByRole('button', { name: DECLINE_LABEL }).click()

    // data-testid en vez de rol+nombre: el botón nunca deja de ser evasivo
    // (ver docs/PRD.md §2.2), así que su etiqueta puede pasar de "Segura" a
    // la de rendición en cualquier momento — el testid es estable.
    const confirmButton = page.getByTestId('evasive-button')
    await expect(confirmButton).toBeVisible()

    const before = await confirmButton.boundingBox()
    expect(before).not.toBeNull()

    // Mover el mouse hacia el centro del botón dispara la huida por
    // pointermove antes de que un click pudiera aterrizar ahí.
    await page.mouse.move(before!.x + before!.width / 2, before!.y + before!.height / 2, { steps: 12 })

    await expect(async () => {
      const after = await confirmButton.boundingBox()
      expect(after).not.toBeNull()
      const moved = Math.hypot(after!.x - before!.x, after!.y - before!.y)
      expect(moved).toBeGreaterThan(10)
    }).toPass()

    // Ningún click llega a confirmar nada: el modal sigue abierto.
    await expect(page.getByRole('heading', { name: DECLINE_TITLE })).toBeVisible()
  })
})

test.describe('botón evasivo — móvil (touch)', () => {
  test('los toques sobre el botón nunca lo activan y eventualmente se rinde', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Solo aplica a dispositivos táctiles')

    await page.goto('/')
    await openEnvelope(page)
    await page.getByRole('button', { name: DECLINE_LABEL }).click()

    // data-testid en vez de rol+nombre: la etiqueta cambia a la de rendición
    // en cuanto se cruza el umbral, que puede ocurrir en cualquier toque.
    const confirmButton = page.getByTestId('evasive-button')
    await expect(confirmButton).toBeVisible()

    // tap() en vez de click(): dispara pointerdown/touchstart real (lo que
    // useEvasiveTarget intercepta antes de que exista un click), apuntando
    // al centro del elemento re-resuelto en cada llamada. El botón nunca
    // deja de evadir (ver docs/PRD.md §2.2), así que basta con un puñado de
    // toques para ver la rendición — no hace falta acertar un número exacto.
    for (let attempt = 0; attempt < 8; attempt++) {
      await confirmButton.tap()
    }

    // Nunca se registró una confirmación real: el modal de declinar sigue
    // presente, con el botón ya rendido — y se queda así, no se cierra solo.
    await expect(confirmButton).toHaveText(SURRENDER_LABEL)
    await expect(page.getByRole('heading', { name: DECLINE_TITLE })).toBeVisible()

    // Cerrar el modal (escape hatch) reinicia intentos y rendición: al
    // reabrirlo el botón vuelve a mostrar la etiqueta de confirmación.
    await page.getByRole('button', { name: ESCAPE_HATCH_LABEL }).click()
    await expect(page.getByRole('heading', { name: DECLINE_TITLE })).toBeHidden()

    await page.getByRole('button', { name: DECLINE_LABEL }).click()
    await expect(page.getByRole('heading', { name: DECLINE_TITLE })).toBeVisible()
    await expect(confirmButton).toHaveText(CONFIRM_LABEL)
  })
})
