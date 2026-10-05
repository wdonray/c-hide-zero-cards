import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import {
  CARD_RANDOM_X_OFFSET,
  CARD_RANDOM_Y_OFFSET,
  CARD_KEYBOARD_MOVE_STEP,
  MOBILE_CARD_RANDOM_X_OFFSET,
  MOBILE_CARD_RANDOM_Y_OFFSET,
} from './constants'
import { useHeaderContext } from './useHeaderContext'
import { useIsMobile } from './useIsMobile'

interface UseDraggableOptions {
  initialX: number
  initialY: number
  resetTrigger?: number
  randomizeTrigger?: number
}

interface UseDraggableReturn {
  position: { x: number; y: number }
  isDragging: boolean
  dragRef: React.RefObject<HTMLDivElement | null>
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void
    onPointerMove: (e: React.PointerEvent) => void
    onPointerUp: (e: React.PointerEvent) => void
    onPointerLeave: (e: React.PointerEvent) => void
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

export function useDraggable({
  initialX,
  initialY,
  resetTrigger,
  randomizeTrigger,
}: UseDraggableOptions): UseDraggableReturn {
  const { setCardsMoved } = useHeaderContext()
  const isMobile = useIsMobile()

  const [position, setPosition] = useState({ x: initialX, y: initialY })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const dragOffset = useRef({ x: 0, y: 0 })

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      setIsDragging(true)

      if (dragRef.current) {
        dragOffset.current = {
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        }

        dragRef.current.setPointerCapture(e.pointerId)
      }
    },
    [position]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return

      const newX = e.clientX - dragOffset.current.x
      const newY = e.clientY - dragOffset.current.y

      setPosition({ x: newX, y: newY })
      setCardsMoved(true)
    },
    [isDragging, setCardsMoved]
  )

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false)

    if (dragRef.current) {
      dragRef.current.releasePointerCapture(e.pointerId)
    }
  }, [])

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent) => {
      if (isDragging) {
        setIsDragging(false)

        if (dragRef.current) {
          dragRef.current.releasePointerCapture(e.pointerId)
        }
      }
    },
    [isDragging]
  )

  useEffect(() => {
    if (!isDragging) return

    const handleGlobalPointerMove = (e: PointerEvent) => {
      const newX = e.clientX - dragOffset.current.x
      const newY = e.clientY - dragOffset.current.y
      setPosition({ x: newX, y: newY })
    }

    const handleGlobalPointerUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('pointermove', handleGlobalPointerMove)
    document.addEventListener('pointerup', handleGlobalPointerUp)

    return () => {
      document.removeEventListener('pointermove', handleGlobalPointerMove)
      document.removeEventListener('pointerup', handleGlobalPointerUp)
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
      // On narrow viewports the desktop scatter would fling cards off-screen,
      // so Mix uses a tighter scatter that stays inside the workspace.
      // Seeded per click and per card: each Mix re-scatters unpredictably.
      const rand = mulberry32(((randomizeTrigger ?? 0) * 2654435761 + initialX * 40503 + initialY * 65599) >>> 0)
      const xOffset = isMobile ? MOBILE_CARD_RANDOM_X_OFFSET : CARD_RANDOM_X_OFFSET
      const yOffset = isMobile ? MOBILE_CARD_RANDOM_Y_OFFSET : CARD_RANDOM_Y_OFFSET
      setPosition({
        x: initialX + Math.floor((rand() - 0.5) * xOffset),
        y: initialY + Math.floor((rand() - 0.5) * yOffset),
      })
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
      onPointerLeave: handlePointerLeave,
      onKeyDown: handleKeyDown,
    }),
    [handlePointerDown, handlePointerMove, handlePointerUp, handlePointerLeave, handleKeyDown]
  )

  return {
    position,
    isDragging,
    dragRef,
    handlers,
  }
}
