import { computed, nextTick, onMounted, onUnmounted, ref, watch, type CSSProperties, type Ref } from 'vue'
import { decayStyle, pickEscapePosition, shouldFlee, type Point } from '@/utils/escape'

export interface UseEvasiveTargetOptions {
  /**
   * Umbral de scale/opacity (ver `decayStyle`) por debajo del cual el botón
   * se considera "desaparecido de la pantalla" y dispara `surrendered`. No
   * hace falta que llegue a 0: 0.3 ya se lee como "se hizo chiquito".
   */
  vanishThreshold?: number
  /** Radio en px alrededor del botón que dispara la huida al acercarse el mouse. */
  fleeRadius?: number
  /**
   * true mientras el botón es visible para el usuario (p. ej. el modal está
   * abierto). Al pasar a true se recoloca sobre el ancla (que pudo estar a
   * 0×0 mientras estaba oculto) — `attempts`/`surrendered` viven y mueren con
   * la instancia del componente: el padre (`DeclineModal`) la remonta al
   * cerrar el modal para que la próxima apertura arranque desde cero.
   */
  visible?: Ref<boolean>
}

/**
 * Pegamento DOM del botón "Segura": el botón vive en `position: fixed` y huye
 * por TODO el viewport cada vez que el puntero se acerca, se intenta pulsar,
 * o recibe foco por teclado. Nunca dispara un evento de activación real — ver
 * docs/PRD.md §2.2.
 *
 * `getHome` devuelve el elemento ancla dentro del modal donde el botón se
 * posa inicialmente (para que al abrir parezca un botón de confirmación
 * normal). Es una función (no un Ref) a propósito: un Ref pasado como prop
 * se auto-desenvuelve en el template del padre, así que la única forma
 * limpia de cruzar el límite del componente es con un getter.
 *
 * El botón nunca deja de ser evasivo: solo cambia su etiqueta (vía
 * `surrendered`) una vez que el encogimiento lo vuelve visiblemente pequeño
 * — sigue huyendo y encogiendo para siempre.
 */
export function useEvasiveTarget(
  getHome: () => HTMLElement | null,
  buttonRef: Ref<HTMLElement | null>,
  options: UseEvasiveTargetOptions = {},
) {
  const vanishThreshold = options.vanishThreshold ?? 0.3
  const fleeRadius = options.fleeRadius ?? 56

  const attempts = ref(0)
  const position = ref<Point>({ x: 12, y: 12 })

  function viewportSize() {
    return { width: window.innerWidth, height: window.innerHeight }
  }

  function currentButtonRect() {
    const button = buttonRef.value
    if (!button) return null
    const box = button.getBoundingClientRect()
    return { x: box.left, y: box.top, width: box.width, height: box.height }
  }

  function evade(pointer: Point | null) {
    const rect = currentButtonRect()
    if (!rect) return

    position.value = pickEscapePosition({
      field: viewportSize(),
      button: { width: rect.width, height: rect.height },
      pointer,
      current: position.value,
    })

    attempts.value += 1
  }

  function placeInitialPosition() {
    const rect = currentButtonRect()
    if (!rect) return
    const home = getHome()
    if (home) {
      // Centrado sobre el ancla del modal: al abrir se ve como un botón de
      // confirmación normal — la huida por el viewport empieza al acercarse.
      const homeBox = home.getBoundingClientRect()
      position.value = {
        x: homeBox.left + (homeBox.width - rect.width) / 2,
        y: homeBox.top + (homeBox.height - rect.height) / 2,
      }
      return
    }
    position.value = pickEscapePosition({
      field: viewportSize(),
      button: { width: rect.width, height: rect.height },
      pointer: null,
      current: { x: 0, y: 0 },
    })
  }

  function handlePointerMove(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return
    const rect = currentButtonRect()
    // width 0 = el botón no está renderizado (modal cerrado → dialog
    // display:none): sin esta guarda, el rect 0×0 en (0,0) haría "huir" al
    // botón invisible cada vez que el mouse pase por esa esquina.
    if (!rect || rect.width === 0) return
    const pointer: Point = { x: event.clientX, y: event.clientY }
    if (shouldFlee(pointer, rect, fleeRadius)) {
      evade(pointer)
    }
  }

  // pointerdown cubre mouse/touch/pen: reposicionamos y prevenimos el
  // default ANTES de que el navegador pueda sintetizar un click sobre el
  // botón (por eso nunca hace falta un handler de 'click' que confirme nada).
  function handlePointerDown(event: PointerEvent) {
    event.preventDefault()
    evade(null)
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return
    event.preventDefault()
    evade(null)
  }

  function handleFocus() {
    evade(null)
  }

  onMounted(async () => {
    await nextTick()
    placeInitialPosition()
    // En window, no en un campo acotado: el botón puede estar en cualquier
    // punto del viewport, así que la amenaza se detecta esté donde esté.
    window.addEventListener('pointermove', handlePointerMove)
    buttonRef.value?.addEventListener('pointerdown', handlePointerDown)
    buttonRef.value?.addEventListener('keydown', handleKeydown)
    buttonRef.value?.addEventListener('focus', handleFocus)
  })

  if (options.visible) {
    watch(options.visible, async (isVisible) => {
      if (!isVisible) return
      // El ancla pudo estar oculta (0×0) mientras tanto; recolocar es
      // puramente cosmético y nunca toca attempts/surrendered.
      await nextTick()
      placeInitialPosition()
    })
  }

  onUnmounted(() => {
    window.removeEventListener('pointermove', handlePointerMove)
    buttonRef.value?.removeEventListener('pointerdown', handlePointerDown)
    buttonRef.value?.removeEventListener('keydown', handleKeydown)
    buttonRef.value?.removeEventListener('focus', handleFocus)
  })

  const decay = computed(() => decayStyle(attempts.value))

  // "Desaparecido" = scale u opacity por debajo del umbral: el cambio de
  // texto (label del botón, nota de rendición) espera a que el botón ya no
  // se vea, en vez de dispararse a un número fijo de intentos.
  const surrendered = computed(
    () => decay.value.scale <= vanishThreshold || decay.value.opacity <= vanishThreshold,
  )

  const style = computed<CSSProperties>(() => ({
    transform: `translate3d(${position.value.x}px, ${position.value.y}px, 0) scale(${decay.value.scale})`,
    opacity: String(decay.value.opacity),
  }))

  return { attempts, surrendered, style }
}
