import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Switch } from './switch'

describe('Switch', () => {
  it('renders an unchecked switch with its slots', () => {
    const { container } = render(<Switch aria-label="Zero focus" />)
    const root = screen.getByRole('switch', { name: 'Zero focus' })
    expect(root).toHaveAttribute('data-slot', 'switch')
    expect(root).toHaveAttribute('data-state', 'unchecked')
    expect(container.querySelector('[data-slot="switch-thumb"]')).toBeInTheDocument()
  })

  it('toggles state and notifies onCheckedChange', () => {
    const onCheckedChange = vi.fn()
    render(<Switch aria-label="Zero focus" onCheckedChange={onCheckedChange} />)
    const root = screen.getByRole('switch', { name: 'Zero focus' })
    fireEvent.click(root)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(root).toHaveAttribute('data-state', 'checked')
  })

  it('merges a custom className', () => {
    render(<Switch aria-label="Zero focus" className="extra" />)
    expect(screen.getByRole('switch', { name: 'Zero focus' })).toHaveClass('extra')
  })
})
