import { useState, useRef, useCallback, useEffect } from 'react'

interface DraggableCardProps {
  firstDigit: number
  placeValue: number
  index: number
  totalCards: number
  resetTrigger?: number
  randomizeTrigger?: number
  fakeNumbers: string | null
}

const xOffset = 38
const yOffset = 0

const getCardColor = (placeValue: number) => {
  const colors: Record<number, string> = {
    1: 'bg-red-400',
    10: 'bg-red-500',
    100: 'bg-orange-500',
    1000: 'bg-orange-400',
    10000: 'bg-yellow-400',
    100000: 'bg-yellow-500',
    1000000: 'bg-green-500',
    10000000: 'bg-green-400',
    100000000: 'bg-blue-400',
    1000000000: 'bg-blue-500',
  }

  return colors[placeValue]
}

export function DraggableCard({
  firstDigit,
  placeValue,
  index,
  totalCards,
  resetTrigger,
  randomizeTrigger,
  fakeNumbers,
}: DraggableCardProps) {
  const [position, setPosition] = useState({ x: index * xOffset, y: index * yOffset })
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
    },
    [isDragging]
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
      setPosition({ x: index * xOffset, y: index * yOffset })
    }
  }, [resetTrigger, index])

  useEffect(() => {
    if (randomizeTrigger !== 0) {
      setPosition({ x: Math.floor(Math.random() * 100), y: Math.floor(Math.random() * 100) })
    }
  }, [randomizeTrigger, index])

  return (
    <div
      ref={dragRef}
      className={`flex items-center justify-center gap-0 px-5 py-10 text-6xl font-bold border border-border cursor-move select-none tracking-[22px] tabular-nums text-white ${getCardColor(placeValue)}`}
      style={{
        position: 'absolute',
        transform: `translate(${position.x}px, ${position.y}px)`,
        userSelect: 'none',
        touchAction: 'none',
        zIndex: totalCards + index,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerUp}
    >
      {fakeNumbers !== null ? <div>{fakeNumbers}</div> : <div>{(firstDigit * placeValue).toLocaleString()}</div>}
    </div>
  )
}
