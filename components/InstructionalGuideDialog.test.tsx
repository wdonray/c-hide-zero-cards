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
  it('renders stacked labeled sections with no doubled headings on mobile', () => {
    mockUseIsMobile.mockReturnValue(true)
    openDialog()

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    for (const label of ['Quick Start', 'Toolbar Features', 'Activities', 'Assessment']) {
      // No redundant outer heading: each section component renders its own
      // descriptive h3 ("Quick Start (2 minutes)", ...).
      expect(screen.queryByRole('heading', { name: label })).not.toBeInTheDocument()
      // ...but the section stays labeled in the accessibility tree.
      expect(screen.getByRole('region', { name: label })).toBeInTheDocument()
    }
    expect(screen.getByRole('heading', { name: 'Quick Start (2 minutes)' })).toBeInTheDocument()
  })

  it('renders the tabbed layout on desktop', () => {
    mockUseIsMobile.mockReturnValue(false)
    openDialog()

    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Quick Start' })).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Quick Start' })).toHaveAttribute('aria-selected', 'true')
  })
})
