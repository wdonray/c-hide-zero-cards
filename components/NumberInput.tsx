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
      id="number-input"
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      enterKeyHint="done"
      value={formattedNumber}
      placeholder="Type a number"
      onChange={handleInputChange}
      aria-label="Type a number"
      className={`!h-[56px] !w-[230px] !rounded-full !border-2 !border-[#2B2118] !bg-white !px-6 !text-center !text-[26px] !font-bold !text-[#2B2118] placeholder:!text-[18px] placeholder:!font-medium placeholder:!text-[#8A7B6B] focus:!border-[#E76F51] ${!isTouched ? 'animate-pulse' : ''}`}
      style={{
        fontFamily: 'var(--font-baloo), system-ui, sans-serif',
        boxShadow: 'inset 0 2px 6px rgba(43, 33, 24, 0.06)',
      }}
    />
  )
})

NumberInput.displayName = 'NumberInput'
