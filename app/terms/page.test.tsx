import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TermsOfUsePage, { metadata } from './page'

describe('TermsOfUsePage', () => {
  it('renders the main heading and effective date', () => {
    render(<TermsOfUsePage />)
    expect(screen.getByRole('heading', { name: 'Terms of Use' })).toBeInTheDocument()
    expect(screen.getByText(/Effective date:/)).toBeInTheDocument()
  })

  it('covers all required sections', () => {
    render(<TermsOfUsePage />)
    for (const name of [
      'The service',
      'Acceptable use',
      'Intellectual property',
      'Privacy',
      'Disclaimers',
      'Limitation of liability',
      'Governing law',
      'Changes to these terms',
      'Contact',
    ]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    }
  })

  it('links to the privacy policy', () => {
    render(<TermsOfUsePage />)
    const link = screen.getByRole('link', { name: /Privacy Policy/i })
    expect(link).toHaveAttribute('href', '/privacy')
  })

  it('provides a contact email link', () => {
    render(<TermsOfUsePage />)
    const link = screen.getByRole('link', { name: 'donrayxwilliams@gmail.com' })
    expect(link).toHaveAttribute('href', 'mailto:donrayxwilliams@gmail.com')
  })

  it('has correct metadata', async () => {
    const meta = await metadata
    expect(meta.title).toContain('Terms of Use')
    expect(meta.alternates?.canonical).toBe('/terms')
  })
})
