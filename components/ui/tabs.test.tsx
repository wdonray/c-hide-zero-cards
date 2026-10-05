import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

function TestTabs() {
  return (
    <Tabs defaultValue="one">
      <TabsList aria-label="Forms">
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
      </TabsList>
      <TabsContent value="one">First panel</TabsContent>
      <TabsContent value="two">Second panel</TabsContent>
    </Tabs>
  )
}

describe('Tabs primitives', () => {
  it('renders the tab list with slots and switches panels', () => {
    const { container } = render(<TestTabs />)
    expect(container.querySelector('[data-slot="tabs"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="tabs-list"]')).toBeInTheDocument()

    expect(screen.getByText('First panel')).toBeInTheDocument()
    const two = screen.getByRole('tab', { name: 'Two' })
    // Radix activates tabs on mousedown; a bare click event is not enough.
    fireEvent.mouseDown(two)
    fireEvent.click(two)
    expect(screen.getByText('Second panel')).toBeInTheDocument()
    expect(two).toHaveAttribute('aria-selected', 'true')
  })

  it('marks the active trigger', () => {
    const { container } = render(<TestTabs />)
    const triggers = container.querySelectorAll('[data-slot="tabs-trigger"]')
    expect(triggers).toHaveLength(2)
    expect(triggers[0]).toHaveAttribute('data-state', 'active')
  })

  it('merges custom classNames', () => {
    const { container } = render(
      <Tabs defaultValue="one" className="tabs-extra">
        <TabsList className="list-extra">
          <TabsTrigger value="one" className="trigger-extra">
            One
          </TabsTrigger>
        </TabsList>
        <TabsContent value="one" className="content-extra">
          Panel
        </TabsContent>
      </Tabs>
    )
    expect(container.querySelector('[data-slot="tabs"]')).toHaveClass('tabs-extra')
    expect(container.querySelector('[data-slot="tabs-list"]')).toHaveClass('list-extra')
    expect(container.querySelector('[data-slot="tabs-trigger"]')).toHaveClass('trigger-extra')
    expect(container.querySelector('[data-slot="tabs-content"]')).toHaveClass('content-extra')
  })
})
