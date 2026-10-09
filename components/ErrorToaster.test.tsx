import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'

// Fresh module state per test (the toast store is module-level).
let ErrorToaster: (typeof import('./ErrorToaster'))['ErrorToaster']
let toastError: (typeof import('@/lib/error-toast'))['toastError']

beforeEach(async () => {
  vi.resetModules()
  vi.useFakeTimers()
  ;({ ErrorToaster } = await import('./ErrorToaster'))
  ;({ toastError } = await import('@/lib/error-toast'))
}, 60000)

afterEach(() => {
  vi.useRealTimers()
})

function showToast(message = 'Something went wrong. Please try again.') {
  act(() => {
    toastError(message)
  })
  return screen.getByRole('alert')
}

describe('ErrorToaster', () => {
  it('renders nothing when there are no toasts', () => {
    const { container } = render(<ErrorToaster />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a toast with the message, icon, and dismiss button', () => {
    render(<ErrorToaster />)
    const toast = showToast('Boom.')
    expect(toast).toHaveTextContent('Boom.')
    expect(toast).toHaveAttribute('aria-atomic', 'true')
    expect(screen.getByRole('button', { name: 'Dismiss notification' })).toBeInTheDocument()
  })

  it('auto-dismisses after 8 seconds', () => {
    render(<ErrorToaster />)
    showToast()
    act(() => {
      vi.advanceTimersByTime(7999)
    })
    expect(screen.getByRole('alert')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('pauses the timer while hovered and resumes on leave', () => {
    render(<ErrorToaster />)
    const toast = showToast()
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    fireEvent.mouseEnter(toast)
    act(() => {
      vi.advanceTimersByTime(8000)
    })
    expect(screen.getByRole('alert')).toBeInTheDocument()
    fireEvent.mouseLeave(toast)
    act(() => {
      vi.advanceTimersByTime(5999)
    })
    expect(screen.getByRole('alert')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('pauses the timer while focused and resumes on blur', () => {
    render(<ErrorToaster />)
    const toast = showToast()
    fireEvent.focus(toast)
    act(() => {
      vi.advanceTimersByTime(8000)
    })
    expect(screen.getByRole('alert')).toBeInTheDocument()
    fireEvent.blur(toast)
    act(() => {
      vi.advanceTimersByTime(8000)
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('dismisses immediately when the close button is clicked', () => {
    render(<ErrorToaster />)
    showToast()
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('dismisses on Escape but not on other keys', () => {
    render(<ErrorToaster />)
    const toast = showToast()
    fireEvent.keyDown(toast, { key: 'Enter' })
    expect(screen.getByRole('alert')).toBeInTheDocument()
    fireEvent.keyDown(toast, { key: 'Escape' })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('caps visible toasts at 3, newest on top', () => {
    render(<ErrorToaster />)
    act(() => {
      toastError('one')
      toastError('two')
      toastError('three')
      toastError('four')
    })
    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(3)
    expect(alerts[0]).toHaveTextContent('two')
    expect(alerts[2]).toHaveTextContent('four')
  })
})
