import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from './dialog'

function OpenDialog({
  showCloseButton,
  hideOverlay,
  onOpenChange,
}: {
  showCloseButton?: boolean
  hideOverlay?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <Dialog defaultOpen onOpenChange={onOpenChange}>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent showCloseButton={showCloseButton} hideOverlay={hideOverlay}>
        <DialogHeader>
          <DialogTitle>Dialog title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
        </DialogHeader>
        <p>Dialog body</p>
        <DialogFooter>
          <DialogClose asChild>
            <button type="button">Cancel</button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

describe('Dialog primitives', () => {
  it('renders an open dialog with title, description, overlay, and close button', () => {
    render(<OpenDialog />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Dialog title')).toHaveAttribute('data-slot', 'dialog-title')
    expect(screen.getByText('Dialog description')).toHaveAttribute('data-slot', 'dialog-description')
    // Radix portals render into document.body, outside the test container.
    expect(document.querySelector('[data-slot="dialog-overlay"]')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="dialog-header"]')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="dialog-footer"]')).toBeInTheDocument()
    // Default close button (X icon + sr-only "Close").
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('hides the default close button when showCloseButton is false', () => {
    render(<OpenDialog showCloseButton={false} />)
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    // The custom DialogClose control still renders.
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('hides the overlay when hideOverlay is set', () => {
    render(<OpenDialog hideOverlay />)
    expect(document.querySelector('[data-slot="dialog-overlay"]')).toHaveClass('hidden')
  })

  it('closes via the custom DialogClose control', () => {
    const onOpenChange = vi.fn()
    render(<OpenDialog onOpenChange={onOpenChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('renders an overlay with merged className inside a dialog', () => {
    render(
      <Dialog defaultOpen>
        <DialogOverlay className="extra" />
      </Dialog>
    )
    expect(document.querySelector('[data-slot="dialog-overlay"]')).toHaveClass('extra')
  })
})
