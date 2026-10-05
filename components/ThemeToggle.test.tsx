import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from './ThemeToggle'

vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}))

import { useTheme } from 'next-themes'

const mockUseTheme = vi.mocked(useTheme)

beforeEach(() => {
  vi.clearAllMocks()
  mockUseTheme.mockReturnValue({ setTheme: vi.fn() } as unknown as ReturnType<typeof useTheme>)
})

describe('ThemeToggle', () => {
  function openMenu() {
    // Radix menu triggers open on pointerdown, not click.
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Toggle theme' }))
  }

  it('opens the theme menu from the trigger', () => {
    render(<ThemeToggle />)
    openMenu()
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it.each([
    ['Light', 'light'],
    ['Dark', 'dark'],
    ['System', 'system'],
  ])('sets the %s theme when chosen', (label, theme) => {
    const setTheme = vi.fn()
    mockUseTheme.mockReturnValue({ setTheme } as unknown as ReturnType<typeof useTheme>)
    render(<ThemeToggle />)
    openMenu()
    fireEvent.click(screen.getByText(label))
    expect(setTheme).toHaveBeenCalledWith(theme)
  })
})
