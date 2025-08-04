import { useDraggable } from '@/lib/useDraggable'
import { CARD_COLORS, CARD_X_OFFSET, CARD_Y_OFFSET } from '@/lib/constants'
import { useCallback, useMemo } from 'react'

interface DraggableCardProps {
  firstDigit: number
  placeValue: number
  index: number
  totalCards: number
  resetTrigger?: number
  randomizeTrigger?: number
  fakeNumbers: string | null
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
  const useDraggableProps = useMemo(
    () => ({
      initialX: index * CARD_X_OFFSET,
      initialY: index * CARD_Y_OFFSET,
      resetTrigger,
      randomizeTrigger,
    }),
    [index, resetTrigger, randomizeTrigger]
  )

  const cardColor = useCallback((placeValue: number) => CARD_COLORS[placeValue], [])
  const { position, dragRef, handlers } = useDraggable(useDraggableProps)

  return (
    <div
      ref={dragRef}
      className={`flex items-center justify-center gap-0 px-1 md:px-2 py-4 md:py-10 text-lg md:text-6xl font-bold cursor-move select-none tracking-[10px] md:tracking-[20px] tabular-nums text-white ${cardColor(placeValue)}`}
      style={{
        position: 'absolute',
        transform: `translate(${position.x}px, ${position.y}px)`,
        userSelect: 'none',
        touchAction: 'none',
        zIndex: totalCards + index,
      }}
      {...handlers}
    >
      {fakeNumbers !== null ? <div>{fakeNumbers}</div> : <div>{(firstDigit * placeValue).toLocaleString()}</div>}
    </div>
  )
}
