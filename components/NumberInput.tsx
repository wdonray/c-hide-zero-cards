import { Input } from '@/components/ui/input'
import { MAX_NUMBER } from '@/lib/constants'
import { useEffect, useMemo, useState } from 'react'

interface NumberInputProps {
  value: number | null
  onChange: (value: number | null) => void
}

export function NumberInput({ value, onChange }: NumberInputProps) {
  const [isTouched, setIsTouched] = useState(false)
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

  useEffect(() => {
    if (value) {
      setIsTouched(true)
    }
  }, [value])

  return (
    <Input
      type="text"
      inputMode="numeric"
      value={formattedNumber}
      placeholder="Type a number here!"
      onChange={handleInputChange}
      className={`!text-4xl !font-semibold !h-16 !px-6 ${!isTouched ? 'animate-pulse' : ''}`}
    />
  )
}
