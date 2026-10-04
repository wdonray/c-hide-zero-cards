import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StandardForm } from '@/components/number-representations/StandardForm'

describe('StandardForm', () => {
  it('renders the number with digit grouping', () => {
    render(<StandardForm number={1234567} />)
    expect(screen.getByText('1,234,567')).toBeInTheDocument()
  })
})
