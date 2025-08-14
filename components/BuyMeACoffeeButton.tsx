'use client'

import { Button } from '@/components/ui/button'
import { Coffee } from '@phosphor-icons/react'

interface BuyMeACoffeeButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function BuyMeACoffeeButton({ variant = 'outline', size = 'sm', className = '' }: BuyMeACoffeeButtonProps) {
  function handleClick() {
    window.open('https://buymeacoffee.com/donrayxwils', '_blank', 'noopener,noreferrer')
  }

  return (
    <Button variant={variant} size={size} onClick={handleClick} className={`gap-2 ${className}`}>
      <Coffee className="h-4 w-4 animate-pulse" />
      <span className="hidden md:inline">Buy me a coffee</span>
      <span className="md:hidden">Coffee</span>
    </Button>
  )
}
