import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { CARD_RANDOM_X_OFFSET, CARD_RANDOM_Y_OFFSET, CARD_KEYBOARD_MOVE_STEP } from './constants'
import { useHeaderContext } from './useHeaderContext'

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

export function useDraggable({
  initialX,
  initialY,
  resetTrigger,
  randomizeTrigger,
}: UseDraggableOptions): UseDraggableReturn {
  const { setCardsMoved } = useHeaderContext()

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

  useEffect(() => {
    if (resetTrigger !== undefined) {
      setPosition({ x: initialX, y: initialY })
      setCardsMoved(false)
    }
  }, [resetTrigger, initialX, initialY, setCardsMoved])

  useEffect(() => {
    if (randomizeTrigger !== 0) {
      setPosition({
        x: initialX + Math.floor((Math.random() - 0.5) * CARD_RANDOM_X_OFFSET),
        y: initialY + Math.floor((Math.random() - 0.5) * CARD_RANDOM_Y_OFFSET),
      })
    }
  }, [randomizeTrigger, initialX, initialY])

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
