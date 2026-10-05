import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WordForm } from '@/components/number-representations/WordForm'

describe('WordForm', () => {
  it.each([
    [0, 'zero'],
    [5, 'five'],
    [19, 'nineteen'],
    [42, 'forty-two'],
    [100, 'one hundred'],
    [1234, 'one thousand two hundred thirty-four'],
    [1000000, 'one million'],
    [1000000000, 'one billion'],
  ])('renders %i as "%s"', (number, words) => {
    render(<WordForm number={number} />)
    expect(screen.getByText(words)).toBeInTheDocument()
  })

  it('renders negative numbers', () => {
    render(<WordForm number={-7} />)
    expect(screen.getByText('negative seven')).toBeInTheDocument()
  })
})
