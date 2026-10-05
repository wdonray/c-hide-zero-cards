import { Input } from '@/components/ui/input'
import { MAX_NUMBER } from '@/lib/constants'
import { useMemo, useState, forwardRef, useImperativeHandle, useRef } from 'react'

interface NumberInputProps {
  value: number | null
  onChange: (value: number | null) => void
}

export interface NumberInputRef {
  focus: () => void
}

export const NumberInput = forwardRef<NumberInputRef, NumberInputProps>(({ value, onChange }, ref) => {
  const [isTouched, setIsTouched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // One-way latch: stop the attention pulse once a number has been entered.
  // Adjusted during render (React's endorsed pattern for prop-derived state)
  // instead of an effect: no cascading render, identical behavior.
  if (value && !isTouched) {
    setIsTouched(true)
  }

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus()
    },
  }))

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputValue = e.target.value
    const cleanValue = inputValue.replace(/[^\d]/g, '')

    if (!cleanValue) {
      onChange(null)
    } else {
      const numValue = Number(cleanValue)
      if (!isNaN(numValue) && numValue >= 1 && numValue <= MAX_NUMBER) {
        onChange(numValue)
      }
    }
  }

  const formattedNumber = useMemo(() => {
    if (!value) return ''
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }, [value])

  return (
    <Input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      enterKeyHint="done"
      value={formattedNumber}
      placeholder="Type a number here!"
      onChange={handleInputChange}
      className={`!text-4xl !font-semibold !h-16 !px-6 max-md:!text-2xl max-md:!px-4 ${!isTouched ? 'animate-pulse' : ''}`}
    />
  )
})

NumberInput.displayName = 'NumberInput'
