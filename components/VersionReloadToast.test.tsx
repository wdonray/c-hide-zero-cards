import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { VersionReloadToast } from './VersionReloadToast'
import { useNewVersionAvailable } from '@/lib/useNewVersion'

vi.mock('@/lib/useNewVersion', () => ({
  useNewVersionAvailable: vi.fn(),
}))

const mockUseNewVersionAvailable = vi.mocked(useNewVersionAvailable)

afterEach(() => {
  vi.unstubAllGlobals()
  mockUseNewVersionAvailable.mockReset()
})

describe('VersionReloadToast', () => {
  it('renders nothing when no update is available', () => {
    mockUseNewVersionAvailable.mockReturnValue(false)
    const { container } = render(<VersionReloadToast />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the toast with the house copy and both buttons when an update is available', () => {
    mockUseNewVersionAvailable.mockReturnValue(true)
    render(<VersionReloadToast />)
    const toast = screen.getByRole('status')
    expect(toast).toHaveAttribute('aria-live', 'polite')
    expect(toast).toHaveTextContent('A new version is available. Reload to get the latest.')
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })

  it('reloads the page when Reload is clicked', () => {
    mockUseNewVersionAvailable.mockReturnValue(true)
    const reload = vi.fn()
    vi.stubGlobal('location', { reload })
    render(<VersionReloadToast />)
    fireEvent.click(screen.getByRole('button', { name: 'Reload' }))
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('hides the toast for the session when dismissed', () => {
    mockUseNewVersionAvailable.mockReturnValue(true)
    render(<VersionReloadToast />)
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('dismisses on Escape but ignores other keys', () => {
    mockUseNewVersionAvailable.mockReturnValue(true)
    render(<VersionReloadToast />)
    fireEvent.keyDown(document, { key: 'a' })
    expect(screen.getByRole('status')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
