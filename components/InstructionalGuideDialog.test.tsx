import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InstructionalGuideDialog } from './InstructionalGuideDialog'

vi.mock('@/lib/useIsMobile', () => ({
  useIsMobile: vi.fn(),
}))

import { useIsMobile } from '@/lib/useIsMobile'

const mockUseIsMobile = vi.mocked(useIsMobile)

function openDialog() {
  render(<InstructionalGuideDialog />)
  fireEvent.click(screen.getByTitle('Instructional Teachers Guide for Hide Zero Cards'))
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('InstructionalGuideDialog', () => {
  it('renders stacked headed sections with no tab row on mobile', () => {
    mockUseIsMobile.mockReturnValue(true)
    openDialog()

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    for (const label of ['Quick Start', 'Toolbar Features', 'Activities', 'Assessment']) {
      expect(screen.getByRole('heading', { name: label })).toBeInTheDocument()
    }
  })

  it('renders the tabbed layout on desktop', () => {
    mockUseIsMobile.mockReturnValue(false)
    openDialog()

    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Quick Start' })).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Quick Start' })).toHaveAttribute('aria-selected', 'true')
  })
})
