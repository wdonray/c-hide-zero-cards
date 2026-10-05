import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu'

function TestMenu({ onSelect }: { onSelect?: () => void }) {
  return (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={onSelect}>Edit</DropdownMenuItem>
            <DropdownMenuItem inset variant="destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={false}>
            Checked item
            <DropdownMenuShortcut>Ctrl+K</DropdownMenuShortcut>
          </DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="a">
            <DropdownMenuRadioItem value="a">Option A</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="b">Option B</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Nested item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>{' '}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
}

describe('DropdownMenu primitives', () => {
  it('renders the full menu structure when open', () => {
    render(<TestMenu />)
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toHaveAttribute('data-slot', 'dropdown-menu-label')
    expect(screen.getByText('Edit')).toHaveAttribute('data-slot', 'dropdown-menu-item')
    expect(screen.getByText('Checked item')).toHaveAttribute('data-slot', 'dropdown-menu-checkbox-item')
    expect(screen.getByText('Option A')).toHaveAttribute('data-slot', 'dropdown-menu-radio-item')
    expect(screen.getByText('Ctrl+K')).toHaveAttribute('data-slot', 'dropdown-menu-shortcut')
    // Menu content renders in a portal (document.body), not the test container.
    expect(document.querySelector('[data-slot="dropdown-menu-separator"]')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="dropdown-menu-group"]')).toBeInTheDocument()
    // The submenu trigger is rendered; its content only mounts once opened.
    // (Radix Sub renders no DOM node of its own, so there is no data-slot to query.)
    expect(screen.getByText('More')).toHaveAttribute('data-slot', 'dropdown-menu-sub-trigger')
  })

  it('marks inset and destructive variants on items', () => {
    render(<TestMenu />)
    const destructive = screen.getByText('Delete')
    expect(destructive).toHaveAttribute('data-inset', 'true')
    expect(destructive).toHaveAttribute('data-variant', 'destructive')
  })

  it('fires onSelect when an item is chosen', () => {
    const onSelect = vi.fn()
    render(<TestMenu onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Edit'))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('opens the submenu from the keyboard', () => {
    render(<TestMenu />)
    const subTrigger = screen.getByText('More')
    expect(subTrigger).toHaveAttribute('data-slot', 'dropdown-menu-sub-trigger')
    // Radix opens submenus with ArrowRight when the sub-trigger is focused.
    subTrigger.focus()
    fireEvent.keyDown(subTrigger, { key: 'ArrowRight' })
    expect(screen.getByText('Nested item')).toHaveAttribute('data-slot', 'dropdown-menu-item')
  })

  it('opens from the trigger when closed by default', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Lonely item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(screen.queryByText('Lonely item')).not.toBeInTheDocument()
    // Radix menu triggers open on pointerdown, not click.
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('Lonely item')).toBeInTheDocument()
  })
})
