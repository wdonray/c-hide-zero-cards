import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UnitForm } from '@/components/number-representations/UnitForm'

describe('UnitForm', () => {
  it('lists each non-zero digit with its unit name', () => {
    render(<UnitForm number={21} />)
    expect(screen.getByText('2 tens , 1 one')).toBeInTheDocument()
  })

  it('singularizes unit names for a digit of one', () => {
    render(<UnitForm number={1000} />)
    expect(screen.getByText('1 thousand')).toBeInTheDocument()
  })

  it('keeps plural unit names for digits other than one', () => {
    render(<UnitForm number={1234} />)
    expect(screen.getByText('1 thousand , 2 hundreds , 3 tens , 4 ones')).toBeInTheDocument()
  })

  it('skips zero digits', () => {
    render(<UnitForm number={101} />)
    expect(screen.getByText('1 hundred , 1 one')).toBeInTheDocument()
  })
})
