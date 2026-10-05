import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { Separator } from './separator'

describe('Separator', () => {
  it('renders a horizontal decorative separator by default', () => {
    const { container } = render(<Separator />)
    const separator = container.querySelector('[data-slot="separator"]')
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveAttribute('data-orientation', 'horizontal')
    // Decorative separators are hidden from assistive tech (role="none").
    expect(separator).toHaveAttribute('role', 'none')
  })

  it('renders a vertical non-decorative separator', () => {
    const { container } = render(<Separator orientation="vertical" decorative={false} />)
    const separator = container.querySelector('[data-slot="separator"]')
    expect(separator).toHaveAttribute('data-orientation', 'vertical')
    expect(separator).toHaveAttribute('role', 'separator')
  })

  it('merges a custom className', () => {
    const { container } = render(<Separator className="my-4" />)
    expect(container.querySelector('[data-slot="separator"]')).toHaveClass('my-4')
  })
})
