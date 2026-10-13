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
  function clickToggle() {
    fireEvent.click(screen.getByRole('button', { name: 'Toggle theme' }))
  }

  it('renders a single toggle button with no menu', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: 'Toggle theme' })).toBeInTheDocument()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('switches to light when the theme is dark', () => {
    const setTheme = vi.fn()
    mockUseTheme.mockReturnValue({ theme: 'dark', setTheme } as unknown as ReturnType<typeof useTheme>)
    render(<ThemeToggle />)
    clickToggle()
    expect(setTheme).toHaveBeenCalledWith('light')
  })

  it('switches to light when the system theme resolves to dark', () => {
    const setTheme = vi.fn()
    mockUseTheme.mockReturnValue({
      theme: 'system',
      resolvedTheme: 'dark',
      setTheme,
    } as unknown as ReturnType<typeof useTheme>)
    render(<ThemeToggle />)
    clickToggle()
    expect(setTheme).toHaveBeenCalledWith('light')
  })

  it('switches to dark when the system theme resolves to light', () => {
    const setTheme = vi.fn()
    mockUseTheme.mockReturnValue({
      theme: 'system',
      resolvedTheme: 'light',
      setTheme,
    } as unknown as ReturnType<typeof useTheme>)
    render(<ThemeToggle />)
    clickToggle()
    expect(setTheme).toHaveBeenCalledWith('dark')
  })

  it('switches to dark when the theme is light', () => {
    const setTheme = vi.fn()
    mockUseTheme.mockReturnValue({ theme: 'light', setTheme } as unknown as ReturnType<typeof useTheme>)
    render(<ThemeToggle />)
    clickToggle()
    expect(setTheme).toHaveBeenCalledWith('dark')
  })
})
