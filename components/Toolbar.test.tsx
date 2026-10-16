import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Toolbar } from './Toolbar'

vi.mock('@/lib/useIsMobile', () => ({
  useIsMobile: vi.fn(),
}))

vi.mock('@/lib/useHeaderContext', () => ({
  useHeaderContext: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

// NumberInput is an unrelated child of the toolbar; mocking it keeps this
// file's coverage scoped to the toolbar (NumberInput has no unit tests and
// was never imported by the unit suite before).
vi.mock('@/components/NumberInput', () => ({
  NumberInput: () => <input data-testid="number-input" aria-label="Type a number" />,
}))

import { useIsMobile } from '@/lib/useIsMobile'
import { useHeaderContext } from '@/lib/useHeaderContext'
import { usePathname } from 'next/navigation'

const mockUseIsMobile = vi.mocked(useIsMobile)
const mockUseHeaderContext = vi.mocked(useHeaderContext)
const mockUsePathname = vi.mocked(usePathname)

function mockContext(overrides: Record<string, unknown> = {}) {
  mockUseHeaderContext.mockReturnValue({
    handleRandomNumber: vi.fn(),
    isDiceRolling: false,
    handleRandomizeCardPosition: vi.fn(),
    handleResetCardPosition: vi.fn(),
    inputNumber: 1234,
    setInputNumber: vi.fn(),
    showZeroCards: true,
    toggleZeroCards: vi.fn(),
    setShowNumberFormsDialog: vi.fn(),
    cardsMoved: false,
    focusNumberInput: vi.fn(),
    numberInputRef: { current: null },
    // Consumed by the RandomNumberPopover rendered inside the toolbar.
    showRandomRange: false,
    setShowRandomRange: vi.fn(),
    randomNumberRange: [1, 100],
    handleRandomNumberRange: vi.fn(),
    handleResetRandomNumberRange: vi.fn(),
    randomNumberType: 'random',
    setRandomNumberType: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useHeaderContext>)
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUseIsMobile.mockReturnValue(false)
  mockUsePathname.mockReturnValue('/')
  mockContext()
})

describe('Toolbar', () => {
  it('renders nothing on mobile', () => {
    mockUseIsMobile.mockReturnValue(true)
    const { container } = render(<Toolbar />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing on the version route', () => {
    mockUsePathname.mockReturnValue('/version')
    const { container } = render(<Toolbar />)
    expect(container).toBeEmptyDOMElement()
  })

  it('toggles the zero-cards button on click', () => {
    const toggleZeroCards = vi.fn()
    mockContext({ toggleZeroCards })
    render(<Toolbar />)
    // The visible label is the (legacy) state label, not the title.
    fireEvent.click(screen.getByRole('button', { name: 'Show zeros' }))
    expect(toggleZeroCards).toHaveBeenCalledTimes(1)
  })

  it('reflects the hidden state in the toggle title', () => {
    mockContext({ showZeroCards: false })
    render(<Toolbar />)
    const button = screen.getByRole('button', { name: 'Hide zeros' })
    expect(button).toBeEnabled()
    expect(button).toHaveAttribute('title', 'Show zero cards')
  })

  it('keeps the toggle enabled at fan home', () => {
    render(<Toolbar />)
    const button = screen.getByRole('button', { name: 'Show zeros' })
    expect(button).toBeEnabled()
    expect(button).toHaveAttribute('title', 'Hide zero cards')
  })

  it('disables actions that need a number when the input is empty', () => {
    mockContext({ inputNumber: null })
    render(<Toolbar />)
    expect(screen.getByRole('button', { name: 'Show zeros' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Mix' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled()
    // Roll always works.
    expect(screen.getByRole('button', { name: 'Roll' })).toBeEnabled()
  })

  // Owner decision 2026-10-16 (issue #141): the hide-zeros toggle is a
  // fan-home-only control. Scattered cards always reveal zeros (displacing
  // reveals), so the toggle would be a visual no-op there and is disabled
  // with an explanatory title. The preference itself is untouched and
  // auto-restores on Reset.
  it('disables the hide-zeros toggle while cards are scattered', () => {
    const toggleZeroCards = vi.fn()
    mockContext({ cardsMoved: true, toggleZeroCards })
    render(<Toolbar />)

    const button = screen.getByRole('button', { name: 'Show zeros' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('title', 'Return cards to the fan to hide zeros')
    // Clicking a disabled button must not toggle.
    fireEvent.click(button)
    expect(toggleZeroCards).not.toHaveBeenCalled()
  })

  it('keeps the action title when scattered but no number is set', () => {
    mockContext({ cardsMoved: true, inputNumber: null })
    render(<Toolbar />)
    const button = screen.getByRole('button', { name: 'Show zeros' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('title', 'Hide zero cards')
  })

  it('disables Roll and animates the dice while a roll is in flight', () => {
    mockContext({ isDiceRolling: true })
    render(<Toolbar />)
    const rollButton = screen.getByRole('button', { name: 'Roll' })
    expect(rollButton).toBeDisabled()
    expect(rollButton.querySelector('svg')).toHaveClass('animate-dice-roll')
  })

  it('clears the input and refocuses it from the Clear button', () => {
    const setInputNumber = vi.fn()
    const focusNumberInput = vi.fn()
    mockContext({ setInputNumber, focusNumberInput })
    render(<Toolbar />)
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(setInputNumber).toHaveBeenCalledWith(null)
    expect(focusNumberInput).toHaveBeenCalledTimes(1)
  })

  it('opens the number forms dialog from the Ways to write it button', () => {
    const setShowNumberFormsDialog = vi.fn()
    mockContext({ setShowNumberFormsDialog })
    render(<Toolbar />)
    fireEvent.click(screen.getByRole('button', { name: 'Ways to write it' }))
    expect(setShowNumberFormsDialog).toHaveBeenCalledWith(true)
  })
})
