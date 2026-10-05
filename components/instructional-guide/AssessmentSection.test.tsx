import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AssessmentSection } from './AssessmentSection'

describe('AssessmentSection', () => {
  it('renders the assessment checks', () => {
    render(<AssessmentSection />)
    expect(screen.getByText('Assessment & Learning Checks')).toBeInTheDocument()
    expect(screen.getByText('Place Value Understanding:')).toBeInTheDocument()
  })
})
