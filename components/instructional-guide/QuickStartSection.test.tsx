import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QuickStartSection } from './QuickStartSection'

describe('QuickStartSection', () => {
  it('renders the quick-start steps and color guide', () => {
    render(<QuickStartSection />)
    expect(screen.getByText('Quick Start (2 minutes)')).toBeInTheDocument()
    expect(screen.getByText('What is Hide Zero Cards?')).toBeInTheDocument()
    expect(screen.getByText('Understanding Card Colors')).toBeInTheDocument()
    expect(screen.getByText('Enter a number')).toBeInTheDocument()
    expect(screen.getByText('Watch cards appear')).toBeInTheDocument()
    expect(screen.getByText('Drag cards')).toBeInTheDocument()
    for (const period of ['Ones Period', 'Thousands Period', 'Millions Period', 'Billions Period']) {
      expect(screen.getByText(period)).toBeInTheDocument()
    }
  })
})
