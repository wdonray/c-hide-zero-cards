import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MobileActionBar } from './MobileActionBar'

vi.mock('@/lib/useIsMobile', () => ({
  useIsMobile: vi.fn(),
}))

vi.mock('@/lib/useHeaderContext', () => ({
  useHeaderContext: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
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
    toggleZeroCards: vi.fn(),
    showZeroCards: true,
    handleRandomizeCardPosition: vi.fn(),
    handleResetCardPosition: vi.fn(),
    cardsMoved: false,
    inputNumber: 1234,
    setInputNumber: vi.fn(),
    focusNumberInput: vi.fn(),
    setShowNumberFormsDialog: vi.fn(),
    // Consumed by the triggers reused inside the More sheet.
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
  mockUseIsMobile.mockReturnValue(true)
  mockUsePathname.mockReturnValue('/')
  mockContext()
})

describe('MobileActionBar', () => {
  it('renders nothing when not on mobile', () => {
    mockUseIsMobile.mockReturnValue(false)
    const { container } = render(<MobileActionBar />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing on the version route', () => {
    mockUsePathname.mockReturnValue('/version')
    const { container } = render(<MobileActionBar />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders seven labeled actions on mobile', () => {
    render(<MobileActionBar />)
    const nav = screen.getByRole('navigation', { name: 'Quick actions' })
    expect(nav).toBeInTheDocument()
    for (const label of ['Roll', 'Zero', 'Mix', 'Reset', 'Clear', 'Forms', 'More']) {
      expect(within(nav).getByText(label, { exact: true })).toBeInTheDocument()
    }
  })

  it('labels every action accessibly (icon-only has no hover on touch)', () => {
    render(<MobileActionBar />)
    expect(screen.getByRole('button', { name: 'Roll a random number' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide zero cards' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Randomize card position' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset cards to original position' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear input number and reset cards' })).toBeInTheDocument()
  })

  it('toggles the zero-cards label with visibility state', () => {
    mockContext({ showZeroCards: false })
    render(<MobileActionBar />)
    expect(screen.getByRole('button', { name: 'Show zero cards' })).toBeInTheDocument()
  })

  it('disables actions that need a number when the input is empty', () => {
    mockContext({ inputNumber: null })
    render(<MobileActionBar />)
    expect(screen.getByRole('button', { name: 'Hide zero cards' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Randomize card position' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Reset cards to original position' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Clear input number and reset cards' })).toBeDisabled()
    // Roll always works.
    expect(screen.getByRole('button', { name: 'Roll a random number' })).toBeEnabled()
  })

  it('opens the More sheet with secondary actions and the version link', () => {
    render(<MobileActionBar />)
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }))

    const sheet = screen.getByRole('dialog', { name: 'More actions' })
    expect(sheet).toBeInTheDocument()
    const inSheet = within(sheet)
    expect(inSheet.getByText('Random number range')).toBeInTheDocument()
    expect(inSheet.getByText("Teacher's guide")).toBeInTheDocument()
    expect(inSheet.getByText('Theme')).toBeInTheDocument()
    expect(inSheet.getByText('App version')).toBeInTheDocument()
    expect(inSheet.getByTitle('App version and release history')).toHaveAttribute('href', '/version')
  })

  it('invokes the context actions from the bar buttons', () => {
    const handleRandomNumber = vi.fn()
    const toggleZeroCards = vi.fn()
    const setShowNumberFormsDialog = vi.fn()
    mockContext({ handleRandomNumber, toggleZeroCards, setShowNumberFormsDialog })

    render(<MobileActionBar />)
    fireEvent.click(screen.getByRole('button', { name: 'Roll a random number' }))
    expect(handleRandomNumber).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Hide zero cards' }))
    expect(toggleZeroCards).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: /Number Forms/ }))
    expect(setShowNumberFormsDialog).toHaveBeenCalledWith(true)
  })

  it('clears the input and refocuses it from the Clear button', () => {
    const setInputNumber = vi.fn()
    const focusNumberInput = vi.fn()
    mockContext({ setInputNumber, focusNumberInput })

    render(<MobileActionBar />)
    fireEvent.click(screen.getByRole('button', { name: 'Clear input number and reset cards' }))
    expect(setInputNumber).toHaveBeenCalledWith(null)
    expect(focusNumberInput).toHaveBeenCalledTimes(1)
  })

  it('disables Roll and animates the dice while a roll is in flight', () => {
    mockContext({ isDiceRolling: true })

    render(<MobileActionBar />)
    const rollButton = screen.getByRole('button', { name: 'Roll a random number' })
    expect(rollButton).toBeDisabled()
    expect(rollButton.querySelector('svg')).toHaveClass('animate-dice-roll')
  })
})
