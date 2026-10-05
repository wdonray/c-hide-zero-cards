import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ToolbarFeaturesSection } from './ToolbarFeaturesSection'

describe('ToolbarFeaturesSection', () => {
  it('renders the toolbar feature guide', () => {
    render(<ToolbarFeaturesSection />)
    expect(screen.getByText('Toolbar Features Guide')).toBeInTheDocument()
    expect(screen.getByText('Roll Button & Random Range')).toBeInTheDocument()
  })
})
