import { Star, Lightbulb } from '@phosphor-icons/react'

export function FirstTimeToast() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-2">
        <Star size={20} weight="fill" className="text-amber-500" />
        <span className="font-bold text-md">Great job! You made your first number!</span>
      </div>
      <p className="text-sm opacity-90">
        Try dragging the cards around! Each card shows a different place in your number.
      </p>
      <div className="flex items-center gap-2 mt-2">
        <Lightbulb size={16} className="text-amber-500" />
        <span className="text-xs bg-amber-500/8 px-2 py-1 rounded-full border border-amber-500/20">
          Tip: Drag cards to see how numbers change!
        </span>
      </div>
    </div>
  )
}
