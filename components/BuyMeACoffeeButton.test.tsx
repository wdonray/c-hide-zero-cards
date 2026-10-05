import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BuyMeACoffeeButton } from './BuyMeACoffeeButton'

describe('BuyMeACoffeeButton', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('opens the Buy Me a Coffee page in a new tab on click', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<BuyMeACoffeeButton />)
    fireEvent.click(screen.getByTitle('Donate to show your support'))
    expect(openSpy).toHaveBeenCalledWith('https://buymeacoffee.com/donrayxwils', '_blank', 'noopener,noreferrer')
  })
})
