import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button, buttonVariants } from './button'

describe('Button', () => {
  it('renders a button with the default variant', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('data-slot', 'button')
  })

  it('merges a custom className', () => {
    render(<Button className="custom-class">Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toHaveClass('custom-class')
  })

  it('applies variant and size classes', () => {
    render(
      <Button variant="destructive" size="lg">
        Delete
      </Button>
    )
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button.className).toContain('bg-destructive')
  })

  it('renders as a child element when asChild is set', () => {
    render(
      <Button asChild>
        <a href="https://example.com/version">Version</a>
      </Button>
    )
    const link = screen.getByRole('link', { name: 'Version' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('data-slot', 'button')
    expect(link.tagName).toBe('A')
  })

  it('forwards extra props to the underlying element', () => {
    render(
      <Button disabled title="tip">
        Click me
      </Button>
    )
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('title', 'tip')
  })
})

describe('buttonVariants', () => {
  it('generates classes for the outline ghost combination', () => {
    const classes = buttonVariants({ variant: 'outline', size: 'sm' })
    expect(classes).toContain('border')
    expect(classes).toContain('h-8')
  })
})
