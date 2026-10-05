import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Label } from './label'

describe('Label', () => {
  it('renders with its slot and merges className', () => {
    render(
      <Label htmlFor="name" className="extra">
        Name
      </Label>
    )
    const label = screen.getByText('Name')
    expect(label).toHaveAttribute('data-slot', 'label')
    expect(label).toHaveClass('extra')
    expect(label).toHaveAttribute('for', 'name')
  })
})
