import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MobileRandomRange } from './MobileRandomRange'
import { RANDOM_NUMBER_TYPE } from '@/lib/constants'

vi.mock('@/lib/useHeaderContext', () => ({
  useHeaderContext: vi.fn(),
}))

import { useHeaderContext } from '@/lib/useHeaderContext'

const mockUseHeaderContext = vi.mocked(useHeaderContext)

function mockContext(overrides: Record<string, unknown> = {}) {
  mockUseHeaderContext.mockReturnValue({
    showRandomRange: false,
    setShowRandomRange: vi.fn(),
    randomNumberRange: [1, 1000000],
    handleRandomNumberRange: vi.fn(),
    handleResetRandomNumberRange: vi.fn(),
    setRandomNumberType: vi.fn(),
    randomNumberType: RANDOM_NUMBER_TYPE.BASIC,
    ...overrides,
  } as unknown as ReturnType<typeof useHeaderContext>)
}

beforeEach(() => {
  vi.clearAllMocks()
  mockContext()
})

describe('MobileRandomRange', () => {
  it('renders collapsed with the toggle marked unexpanded', () => {
    render(<MobileRandomRange />)
    const toggle = screen.getByTitle('Set random number range')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByTitle('Set random number range to 100')).not.toBeInTheDocument()
  })

  it('expands the inline option list when the toggle is clicked', () => {
    const setShowRandomRange = vi.fn()
    mockContext({ setShowRandomRange })
    render(<MobileRandomRange />)
    fireEvent.click(screen.getByTitle('Set random number range'))
    expect(setShowRandomRange).toHaveBeenCalledWith(true)
  })

  it('shows all eight range options as large rows when expanded', () => {
    mockContext({ showRandomRange: true })
    render(<MobileRandomRange />)
    const options = screen.getAllByRole('button', { name: /^Up to / })
    expect(options).toHaveLength(8)
    for (const option of options) {
      expect(option).toHaveClass('min-h-12')
    }
    expect(screen.getByTitle('Set random number range')).toHaveAttribute('aria-expanded', 'true')
    // The default 1,000,000 preset is marked selected.
    expect(screen.getByRole('button', { name: 'Up to 1,000,000' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Up to 100' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('collapses the list when the toggle is clicked while expanded', () => {
    const setShowRandomRange = vi.fn()
    mockContext({ showRandomRange: true, setShowRandomRange })
    render(<MobileRandomRange />)
    fireEvent.click(screen.getByTitle('Set random number range'))
    expect(setShowRandomRange).toHaveBeenCalledWith(false)
  })

  it('applies a preset range and collapses when an option is clicked', () => {
    const handleRandomNumberRange = vi.fn()
    const setShowRandomRange = vi.fn()
    mockContext({ showRandomRange: true, handleRandomNumberRange, setShowRandomRange })
    render(<MobileRandomRange />)
    fireEvent.click(screen.getByRole('button', { name: 'Up to 100' }))
    expect(handleRandomNumberRange).toHaveBeenCalledWith([1, 100])
    expect(setShowRandomRange).toHaveBeenCalledWith(false)
  })

  it('toggles zero-focus mode via the switch', () => {
    const setRandomNumberType = vi.fn()
    mockContext({ showRandomRange: true, setRandomNumberType })
    render(<MobileRandomRange />)
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveAttribute('data-state', 'unchecked')
    fireEvent.click(toggle)
    expect(setRandomNumberType).toHaveBeenCalledWith(RANDOM_NUMBER_TYPE.ZERO_FOCUS)
  })

  it('toggles back to basic mode when the switch is checked', () => {
    const setRandomNumberType = vi.fn()
    mockContext({ showRandomRange: true, setRandomNumberType, randomNumberType: RANDOM_NUMBER_TYPE.ZERO_FOCUS })
    render(<MobileRandomRange />)
    fireEvent.click(screen.getByRole('switch'))
    expect(setRandomNumberType).toHaveBeenCalledWith(RANDOM_NUMBER_TYPE.BASIC)
  })

  it('resets the range via the reset button', () => {
    const handleResetRandomNumberRange = vi.fn()
    mockContext({ showRandomRange: true, handleResetRandomNumberRange })
    render(<MobileRandomRange />)
    fireEvent.click(screen.getByTitle('Reset random number range'))
    expect(handleResetRandomNumberRange).toHaveBeenCalledTimes(1)
  })
})
