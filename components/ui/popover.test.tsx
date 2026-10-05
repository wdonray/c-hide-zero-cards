import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from './popover'

describe('Popover primitives', () => {
  it('opens the content from the trigger', () => {
    const { container } = render(
      <Popover>
        <PopoverAnchor>
          <span>anchor</span>
        </PopoverAnchor>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent className="extra">Popover body</PopoverContent>
      </Popover>
    )
    expect(container.querySelector('[data-slot="popover-anchor"]')).toBeInTheDocument()
    expect(screen.queryByText('Popover body')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    const content = screen.getByText('Popover body')
    expect(content).toBeInTheDocument()
    expect(content.closest('[data-slot="popover-content"]')).toHaveClass('extra')
  })

  it('respects a non-default align', () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent align="end">Body</PopoverContent>
      </Popover>
    )
    expect(screen.getByText('Body').closest('[data-slot="popover-content"]')).toHaveAttribute('data-align', 'end')
  })
})
