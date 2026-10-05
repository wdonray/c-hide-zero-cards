import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ZeroStateIndicator } from './ZeroStateIndicator'

vi.mock('@/lib/useHeaderContext', () => ({
  useHeaderContext: vi.fn(),
}))

import { useHeaderContext } from '@/lib/useHeaderContext'

const mockUseHeaderContext = vi.mocked(useHeaderContext)

describe('ZeroStateIndicator', () => {
  it('reads "Zeros shown" when zero cards are visible', () => {
    mockUseHeaderContext.mockReturnValue({ showZeroCards: true } as ReturnType<typeof useHeaderContext>)
    render(<ZeroStateIndicator />)
    expect(screen.getByRole('status')).toHaveTextContent('Zeros shown')
  })

  it('reads "Zeros hidden" when zero cards are hidden', () => {
    mockUseHeaderContext.mockReturnValue({ showZeroCards: false } as ReturnType<typeof useHeaderContext>)
    render(<ZeroStateIndicator />)
    expect(screen.getByRole('status')).toHaveTextContent('Zeros hidden')
  })
})
