import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import PrivacyPolicyPage, { metadata } from './page'

describe('PrivacyPolicyPage', () => {
  afterEach(() => {
    document.documentElement.classList.remove('overflow-hidden')
  })

  it('renders the main heading and effective date', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument()
    expect(screen.getByText(/Effective date:/)).toBeInTheDocument()
  })

  it('covers all required sections', () => {
    render(<PrivacyPolicyPage />)
    for (const name of [
      'What we collect',
      'What we do not collect',
      'Why we collect it',
      'How long we keep it',
      'Third parties',
      'Your rights',
      "Children's privacy",
      'Changes to this policy',
    ]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    }
  })

  it('discloses the analytics hashing practice', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByText(/salted SHA-256 hash/i)).toBeInTheDocument()
    expect(screen.getByText(/raw IP address is never stored/i)).toBeInTheDocument()
  })

  it('links to the public analytics page', () => {
    render(<PrivacyPolicyPage />)
    const link = screen.getByRole('link', { name: /analytics page/i })
    expect(link).toHaveAttribute('href', '/analytics')
  })

  it('provides a contact email link', () => {
    render(<PrivacyPolicyPage />)
    const links = screen.getAllByRole('link', { name: 'donrayxwilliams@gmail.com' })
    expect(links.length).toBeGreaterThan(0)
    expect(links[0]).toHaveAttribute('href', 'mailto:donrayxwilliams@gmail.com')
  })

  it('has correct metadata', async () => {
    const meta = await metadata
    expect(meta.title).toContain('Privacy Policy')
    expect(meta.alternates?.canonical).toBe('/privacy')
  })

  it('removes and restores the scroll lock via EnablePageScroll', () => {
    document.documentElement.classList.add('overflow-hidden')
    const { unmount } = render(<PrivacyPolicyPage />)
    expect(document.documentElement.classList.contains('overflow-hidden')).toBe(false)
    unmount()
    expect(document.documentElement.classList.contains('overflow-hidden')).toBe(true)
    cleanup()
  })
})
