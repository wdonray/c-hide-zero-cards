import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RandomNumberPopover } from './RandomNumberPopover'
import { RANDOM_NUMBER_TYPE } from '@/lib/constants'

vi.mock('@/lib/useHeaderContext', () => ({
  useHeaderContext: vi.fn(),
}))

import { useHeaderContext } from '@/lib/useHeaderContext'

const mockUseHeaderContext = vi.mocked(useHeaderContext)

function mockContext(overrides: Record<string, unknown> = {}) {
  mockUseHeaderContext.mockReturnValue({
    showRandomRange: true,
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

describe('RandomNumberPopover', () => {
  it('renders the range presets and marks the active one', () => {
    render(<RandomNumberPopover />)
    expect(screen.getByText('Random Number Range')).toBeInTheDocument()
    // 1,000,000 is the active preset (outline), the rest are ghost buttons.
    expect(screen.getByTitle('Set random number range to 1,000,000')).toBeInTheDocument()
    expect(screen.getByTitle('Set random number range to 100')).toBeInTheDocument()
    expect(screen.getByTitle('Set random number range to 1,000')).toBeInTheDocument()
  })

  it('applies a preset range when clicked', () => {
    const handleRandomNumberRange = vi.fn()
    mockContext({ handleRandomNumberRange })
    render(<RandomNumberPopover />)
    fireEvent.click(screen.getByTitle('Set random number range to 100'))
    expect(handleRandomNumberRange).toHaveBeenCalledWith([1, 100])
  })

  it('toggles zero-focus mode via the switch', () => {
    const setRandomNumberType = vi.fn()
    mockContext({ setRandomNumberType })
    render(<RandomNumberPopover />)
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveAttribute('data-state', 'unchecked')
    fireEvent.click(toggle)
    expect(setRandomNumberType).toHaveBeenCalledWith(RANDOM_NUMBER_TYPE.ZERO_FOCUS)
  })

  it('shows the switch checked in zero-focus mode and toggles back to basic', () => {
    const setRandomNumberType = vi.fn()
    mockContext({ setRandomNumberType, randomNumberType: RANDOM_NUMBER_TYPE.ZERO_FOCUS })
    render(<RandomNumberPopover />)
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveAttribute('data-state', 'checked')
    fireEvent.click(toggle)
    expect(setRandomNumberType).toHaveBeenCalledWith(RANDOM_NUMBER_TYPE.BASIC)
  })

  it('resets the range via the reset button', () => {
    const handleResetRandomNumberRange = vi.fn()
    mockContext({ handleResetRandomNumberRange })
    render(<RandomNumberPopover />)
    fireEvent.click(screen.getByTitle('Reset random number range'))
    expect(handleResetRandomNumberRange).toHaveBeenCalledTimes(1)
  })
})
