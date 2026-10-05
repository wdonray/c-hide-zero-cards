import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { CARD_KEYBOARD_MOVE_STEP } from './constants'
import { measureScatterArea } from './scatterArea'
import { useHeaderContext, type ScatterArea } from './useHeaderContext'
import { useIsMobile } from './useIsMobile'

interface UseDraggableOptions {
  initialX: number
  initialY: number
  /**
   * Stable per-card discriminator for the Mix scatter PRNG. This deliberately
   * keeps the original fan formula (index * xOffset): the scatter pattern
   * must stay identical when the fan layout changes, so Mix behavior never
   * reshuffles under a layout fix.
   */
  scatterSeed: number
  resetTrigger?: number
  randomizeTrigger?: number
  /**
   * Scatter region (viewport coordinates) measured when Mix was pressed.
   * The scatter keeps every card fully inside it. A live measurement is
   * preferred when the chrome is laid out; this is the fallback for
   * environments without layout (unit tests, SSR).
   */
  scatterArea?: ScatterArea | null
  /**
   * The card element, supplied by the component via callback ref into state
   * (reading it here keeps render-phase measurement lint-clean: refs must
   * not be read during render). Used to measure the card at scatter time.
   */
  cardEl?: HTMLDivElement | null
  /**
   * The card's content-driven natural width, measured by the parent from
   * the text itself. Mix scatter clamps with this, not the live rect:
   * at fan home the card renders at its narrower assigned fan width, but
   * scattered cards show their full text at natural width, and the clamp
   * must keep the full card inside the scatter area.
   */
  naturalCardWidth?: number
}

interface UseDraggableReturn {
  position: { x: number; y: number }
  isDragging: boolean
  dragRef: React.RefObject<HTMLDivElement | null>
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void
    onPointerMove: (e: React.PointerEvent) => void
    onPointerUp: (e: React.PointerEvent) => void
    onPointerCancel: (e: React.PointerEvent) => void
    onKeyDown: (e: React.KeyboardEvent) => void
  }
}

// Deterministic PRNG (mulberry32). Pure, so it may run during render without
// tripping the purity rule. Seeded per Mix click and per card, it produces a
// fresh unpredictable-looking scatter each time with the same distribution as
// the Math.random() version it replaces.
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Resolve the rect Mix scatters within. Prefers a live measurement of the
 * visible strip between the header/toolbar and the footer/action bar
 * (fresh even if the layout changed since Mix was pressed, e.g. a
 * breakpoint flip re-scatter); falls back to the area measured at Mix time,
 * which is also what unit tests inject. Null when there is no usable area
 * (SSR, or Mix pressed with no chrome laid out).
 */
function resolveScatterArea(measuredAtMix: ScatterArea | null | undefined): ScatterArea | null {
  return measureScatterArea() ?? measuredAtMix ?? null
}

export function useDraggable({
  initialX,
  initialY,
  scatterSeed,
  resetTrigger,
  randomizeTrigger,
  scatterArea,
  cardEl,
  naturalCardWidth,
}: UseDraggableOptions): UseDraggableReturn {
  const { setCardsMoved } = useHeaderContext()
  const isMobile = useIsMobile()

  const [position, setPosition] = useState({ x: initialX, y: initialY })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  // The pointer driving the current drag. Multi-touch: only the primary
  // pointer may start or move a drag; a second finger must never hijack it.
  const activePointerId = useRef<number | null>(null)

  const endDrag = useCallback((pointerId?: number) => {
    setIsDragging(false)
    activePointerId.current = null

    const el = dragRef.current
    if (el && pointerId !== undefined) {
      try {
        // hasPointerCapture guards the implicit release that already
        // happened on pointerup/pointercancel; releasing again must not
        // throw (iOS Safari throws NotFoundError on a dead pointer).
        if (el.hasPointerCapture(pointerId)) {
          el.releasePointerCapture(pointerId)
        }
      } catch {
        // Capture was already released implicitly; nothing left to do.
      }
    }
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Ignore non-primary pointers: a second finger touching the card
      // must not reset the grab offset (which would make the card jump).
      if (!e.isPrimary) return

      e.preventDefault()
      activePointerId.current = e.pointerId
      setIsDragging(true)

      if (dragRef.current) {
        dragOffset.current = {
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        }

        try {
          dragRef.current.setPointerCapture(e.pointerId)
        } catch {
          // If capture fails the drag still tracks via the document-level
          // listeners below.
        }
      }
    },
    [position]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || e.pointerId !== activePointerId.current) return

      const newX = e.clientX - dragOffset.current.x
      const newY = e.clientY - dragOffset.current.y

      setPosition({ x: newX, y: newY })
      setCardsMoved(true)
    },
    [isDragging, setCardsMoved]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerId !== activePointerId.current) return
      endDrag(e.pointerId)
    },
    [endDrag]
  )

  const handlePointerCancel = useCallback(
    (e: React.PointerEvent) => {
      // iOS Safari fires pointercancel when it takes over the gesture
      // (scroll/system gesture). End the drag cleanly instead of leaving
      // isDragging stuck true.
      if (e.pointerId !== activePointerId.current) return
      endDrag(e.pointerId)
    },
    [endDrag]
  )

  // NOTE: there is intentionally no onPointerLeave drag-ender. During
  // pointer capture, boundary events still fire when the physical pointer
  // leaves the card's bounds — and on a real touchscreen the card lags the
  // finger (one React state update per touchmove), so any fast flick ends
  // the drag the instant the finger outruns the card. That is exactly the
  // "starts and stops, does not follow my finger" bug from real iPhones.
  // Drags now end only on pointerup / pointercancel, which is also what
  // makes desktop drags survive the cursor briefly leaving the card.

  useEffect(() => {
    if (!isDragging) return

    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId.current) return

      const newX = e.clientX - dragOffset.current.x
      const newY = e.clientY - dragOffset.current.y
      setPosition({ x: newX, y: newY })
    }

    const handleGlobalPointerUp = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId.current) return
      setIsDragging(false)
      activePointerId.current = null
    }

    const handleGlobalPointerCancel = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId.current) return
      setIsDragging(false)
      activePointerId.current = null
    }

    document.addEventListener('pointermove', handleGlobalPointerMove)
    document.addEventListener('pointerup', handleGlobalPointerUp)
    document.addEventListener('pointercancel', handleGlobalPointerCancel)

    return () => {
      document.removeEventListener('pointermove', handleGlobalPointerMove)
      document.removeEventListener('pointerup', handleGlobalPointerUp)
      document.removeEventListener('pointercancel', handleGlobalPointerCancel)
    }
  }, [isDragging])

  // Sync position when the parent signals a reset or a re-scatter, without
  // effects. The tracked inputs mirror the old effect dep arrays exactly
  // (trigger + initialX/initialY, so a breakpoint flip still re-seats cards
  // in the fan). The triggers only ever change alongside their own cardsMoved
  // update in the provider (handleResetCardPosition / the input-clear path),
  // so the child's setCardsMoved(false) here was redundant. Render-phase
  // adjustment (React's endorsed pattern for prop-derived state) replaces
  // each effect with identical timing and no cascading render.
  const [prevResetDeps, setPrevResetDeps] = useState(() => ({
    trigger: undefined as number | undefined,
    x: initialX,
    y: initialY,
  }))
  if (resetTrigger !== prevResetDeps.trigger || initialX !== prevResetDeps.x || initialY !== prevResetDeps.y) {
    setPrevResetDeps({ trigger: resetTrigger, x: initialX, y: initialY })
    if (resetTrigger !== undefined) {
      setPosition({ x: initialX, y: initialY })
    }
  }

  const [prevRandomizeDeps, setPrevRandomizeDeps] = useState(() => ({
    trigger: 0 as number | undefined,
    x: initialX,
    y: initialY,
    mobile: isMobile,
  }))
  if (
    randomizeTrigger !== prevRandomizeDeps.trigger ||
    initialX !== prevRandomizeDeps.x ||
    initialY !== prevRandomizeDeps.y ||
    isMobile !== prevRandomizeDeps.mobile
  ) {
    setPrevRandomizeDeps({ trigger: randomizeTrigger, x: initialX, y: initialY, mobile: isMobile })
    if (randomizeTrigger !== 0) {
      // Container-relative scatter: each card lands at a random spot fully
      // inside the visible strip between the header/toolbar and the
      // footer/action bar, on any screen size. Seeded per Mix click and per
      // card, so each Mix re-scatters unpredictably.
      const rand = mulberry32(((randomizeTrigger ?? 0) * 2654435761 + scatterSeed * 40503) >>> 0)
      const area = resolveScatterArea(scatterArea)
      if (area) {
        // position is the transform offset from the card's static (centered)
        // spot; derive that spot from the live card rect so the random
        // workspace-origin target converts exactly. Without a mounted
        // element (unit tests) the static spot is assumed centered.
        const cardRect = cardEl?.getBoundingClientRect()
        // Clamp with the natural width: at fan home the live rect is the
        // narrower assigned fan width, but scattered cards render at full
        // natural width and must still land fully inside the area.
        const cardW = naturalCardWidth ?? cardRect?.width ?? 0
        const cardH = cardRect?.height ?? 0
        const maxX = Math.max(0, area.width - cardW)
        const maxY = Math.max(0, area.height - cardH)
        const targetX = Math.floor(rand() * (maxX + 1))
        const targetY = Math.floor(rand() * (maxY + 1))
        const staticX = cardRect ? cardRect.left - position.x - area.x : (area.width - cardW) / 2
        const staticY = cardRect ? cardRect.top - position.y - area.y : (area.height - cardH) / 2
        setPosition({ x: targetX - staticX, y: targetY - staticY })
      }
      // Without a measured area (SSR, or no workspace mounted) the cards
      // stay put; the next Mix measures again.
    }
  }

  // Keyboard alternative to pointer dragging (WCAG 2.1.1): arrow keys nudge
  // the card without changing anything visual. Purely additive.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let dx = 0
      let dy = 0
      switch (e.key) {
        case 'ArrowLeft':
          dx = -CARD_KEYBOARD_MOVE_STEP
          break
        case 'ArrowRight':
          dx = CARD_KEYBOARD_MOVE_STEP
          break
        case 'ArrowUp':
          dy = -CARD_KEYBOARD_MOVE_STEP
          break
        case 'ArrowDown':
          dy = CARD_KEYBOARD_MOVE_STEP
          break
        default:
          return
      }
      e.preventDefault()
      setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
      setCardsMoved(true)
    },
    [setCardsMoved]
  )

  const handlers = useMemo(
    () => ({
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onKeyDown: handleKeyDown,
    }),
    [handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel, handleKeyDown]
  )

  return {
    position,
    isDragging,
    dragRef,
    handlers,
  }
}
