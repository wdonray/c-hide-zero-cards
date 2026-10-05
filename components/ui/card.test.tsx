import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'

describe('Card primitives', () => {
  it('renders Card with its slot and merged className', () => {
    render(<Card className="extra">body</Card>)
    const card = screen.getByText('body')
    expect(card).toHaveAttribute('data-slot', 'card')
    expect(card).toHaveClass('extra')
  })

  it('renders CardHeader', () => {
    render(<CardHeader>header</CardHeader>)
    expect(screen.getByText('header')).toHaveAttribute('data-slot', 'card-header')
  })

  it('renders CardTitle', () => {
    render(<CardTitle>My title</CardTitle>)
    expect(screen.getByText('My title')).toHaveAttribute('data-slot', 'card-title')
  })

  it('renders CardDescription', () => {
    render(<CardDescription>Some description</CardDescription>)
    expect(screen.getByText('Some description')).toHaveAttribute('data-slot', 'card-description')
  })

  it('renders CardAction', () => {
    render(<CardAction>action</CardAction>)
    expect(screen.getByText('action')).toHaveAttribute('data-slot', 'card-action')
  })

  it('renders CardContent', () => {
    render(<CardContent>content</CardContent>)
    expect(screen.getByText('content')).toHaveAttribute('data-slot', 'card-content')
  })

  it('renders CardFooter', () => {
    render(<CardFooter>footer</CardFooter>)
    expect(screen.getByText('footer')).toHaveAttribute('data-slot', 'card-footer')
  })

  it('composes a full card', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>T</CardTitle>
          <CardDescription>D</CardDescription>
          <CardAction>A</CardAction>
        </CardHeader>
        <CardContent>C</CardContent>
        <CardFooter>F</CardFooter>
      </Card>
    )
    for (const text of ['T', 'D', 'A', 'C', 'F']) {
      expect(screen.getByText(text)).toBeInTheDocument()
    }
  })
})
