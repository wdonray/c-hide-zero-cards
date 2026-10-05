import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExpandedForm } from '@/components/number-representations/ExpandedForm'

describe('ExpandedForm', () => {
  it('expands each non-zero digit by place value', () => {
    render(<ExpandedForm number={1234} />)
    expect(screen.getByText('1,000 + 200 + 30 + 4')).toBeInTheDocument()
  })

  it('skips zero digits', () => {
    render(<ExpandedForm number={1005} />)
    expect(screen.getByText('1,000 + 5')).toBeInTheDocument()
  })
})
