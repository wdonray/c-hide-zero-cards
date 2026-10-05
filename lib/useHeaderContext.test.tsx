import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { useEffect } from 'react'
import { act, render, renderHook, screen } from '@testing-library/react'
import { HeaderProvider, useHeaderContext } from './useHeaderContext'
import { DEFAULT_MAX_RANDOM_NUMBER, LOCAL_STORAGE_KEYS, RANDOM_NUMBER_TYPE } from './constants'

type Ctx = ReturnType<typeof useHeaderContext>

function setup() {
  let captured!: Ctx
  function Probe() {
    const ctx = useHeaderContext()
    // Capture in an effect: assigning an outer variable during render is a
    // react-hooks lint violation.
    useEffect(() => {
      captured = ctx
    }, [ctx])
    return null
  }
  render(
    <HeaderProvider>
      <Probe />
    </HeaderProvider>
  )
  // Re-read the latest context after every act() via this getter.
  return {
    get ctx() {
      return captured
    },
  }
}

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('useHeaderContext', () => {
  it('throws when used outside the provider', () => {
    expect(() => renderHook(() => useHeaderContext())).toThrow('useHeaderContext must be used within a HeaderProvider')
  })

  it('starts with the default state', () => {
    const { ctx } = setup()
    expect(ctx.isHeaderCollapsed).toBe(false)
    expect(ctx.inputNumber).toBeNull()
    expect(ctx.randomNumberRange).toEqual([1, DEFAULT_MAX_RANDOM_NUMBER])
    expect(ctx.randomNumberType).toBe(RANDOM_NUMBER_TYPE.BASIC)
    expect(ctx.showRandomRange).toBe(false)
    expect(ctx.isDiceRolling).toBe(false)
    expect(ctx.showZeroCards).toBe(true)
    expect(ctx.showNumberFormsDialog).toBe(false)
    expect(ctx.cardsMoved).toBe(false)
    expect(ctx.resetTrigger).toBe(0)
    expect(ctx.randomizeTrigger).toBe(0)
  })

  it('restores a collapsed header from localStorage', () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.IS_HEADER_COLLAPSED, 'true')
    expect(setup().ctx.isHeaderCollapsed).toBe(true)
  })

  it('toggles the header and persists the choice', () => {
    const t = setup()
    act(() => t.ctx.toggleHeader())
    expect(t.ctx.isHeaderCollapsed).toBe(true)
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.IS_HEADER_COLLAPSED)).toBe('true')
    act(() => t.ctx.toggleHeader())
    expect(t.ctx.isHeaderCollapsed).toBe(false)
  })

  it('sets the input number and resets triggers when cleared to null', () => {
    const t = setup()
    act(() => t.ctx.handleRandomizeCardPosition())
    act(() => t.ctx.setInputNumber(1234))
    expect(t.ctx.inputNumber).toBe(1234)
    expect(t.ctx.randomizeTrigger).toBe(1)

    act(() => t.ctx.setInputNumber(null))
    expect(t.ctx.inputNumber).toBeNull()
    expect(t.ctx.resetTrigger).toBe(0)
    expect(t.ctx.randomizeTrigger).toBe(0)
    expect(t.ctx.cardsMoved).toBe(false)
  })

  it('rolls a basic random number within the range after a short delay', () => {
    const t = setup()
    act(() => t.ctx.handleRandomNumberRange([10, 20]))
    act(() => t.ctx.handleRandomNumber())
    expect(t.ctx.isDiceRolling).toBe(true)
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(t.ctx.isDiceRolling).toBe(false)
    expect(t.ctx.inputNumber).not.toBeNull()
    expect(t.ctx.inputNumber!).toBeGreaterThanOrEqual(10)
    expect(t.ctx.inputNumber!).toBeLessThanOrEqual(20)
  })

  it('rolls a zero-focus number containing a zero', () => {
    const t = setup()
    act(() => t.ctx.setRandomNumberType(RANDOM_NUMBER_TYPE.ZERO_FOCUS))
    act(() => t.ctx.handleRandomNumber())
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(t.ctx.inputNumber).not.toBeNull()
    expect(t.ctx.inputNumber!.toString()).toContain('0')
  })

  it('updates and resets the random number range', () => {
    const t = setup()
    act(() => t.ctx.handleRandomNumberRange([1, 1000]))
    expect(t.ctx.randomNumberRange).toEqual([1, 1000])
    act(() => t.ctx.handleResetRandomNumberRange())
    expect(t.ctx.randomNumberRange).toEqual([1, DEFAULT_MAX_RANDOM_NUMBER])
  })

  it('resets card position via the reset trigger', () => {
    const t = setup()
    act(() => t.ctx.handleRandomizeCardPosition())
    expect(t.ctx.cardsMoved).toBe(true)
    act(() => t.ctx.handleResetCardPosition())
    expect(t.ctx.resetTrigger).toBe(1)
    expect(t.ctx.randomizeTrigger).toBe(0)
    expect(t.ctx.cardsMoved).toBe(false)
  })

  it('measures the scatter region from the chrome when Mix is pressed', () => {
    const t = setup()
    expect(t.ctx.scatterArea).toBeNull()
    // Full visible strip: header (56px) + toolbar (48px) on top, footer
    // (56px at y=700) at the bottom, full jsdom viewport width (1024).
    const domRect = (x: number, y: number, width: number, height: number) => ({
      x,
      y,
      width,
      height,
      top: y,
      left: x,
      right: x + width,
      bottom: y + height,
      toJSON: () => {},
    })
    vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
      switch (id) {
        case 'app-header':
          return { getBoundingClientRect: () => domRect(0, 0, 1024, 56) } as unknown as HTMLElement
        case 'app-toolbar':
          return { getBoundingClientRect: () => domRect(0, 56, 1024, 48) } as unknown as HTMLElement
        case 'app-footer':
          return { getBoundingClientRect: () => domRect(0, 700, 1024, 56) } as unknown as HTMLElement
        default:
          return null
      }
    })
    act(() => t.ctx.handleRandomizeCardPosition())
    expect(t.ctx.scatterArea).toEqual({ x: 0, y: 104, width: 1024, height: 596 })
    expect(t.ctx.randomizeTrigger).toBe(1)
  })

  it('clears the scatter area when no chrome is measurable', () => {
    const t = setup()
    // No header/toolbar/footer/action bar in the document: scatterArea stays
    // null and Mix still bumps the trigger; cards simply do not move.
    act(() => t.ctx.handleRandomizeCardPosition())
    expect(t.ctx.scatterArea).toBeNull()
    expect(t.ctx.randomizeTrigger).toBe(1)
  })

  it('toggles zero-card visibility', () => {
    const t = setup()
    act(() => t.ctx.toggleZeroCards())
    expect(t.ctx.showZeroCards).toBe(false)
    act(() => t.ctx.toggleZeroCards())
    expect(t.ctx.showZeroCards).toBe(true)
  })

  it('toggles the random-range popover, number-forms dialog, and moved flag', () => {
    const t = setup()
    act(() => t.ctx.setShowRandomRange(true))
    act(() => t.ctx.setShowNumberFormsDialog(true))
    act(() => t.ctx.setCardsMoved(true))
    expect(t.ctx.showRandomRange).toBe(true)
    expect(t.ctx.showNumberFormsDialog).toBe(true)
    expect(t.ctx.cardsMoved).toBe(true)
  })

  it('exposes direct trigger setters', () => {
    const t = setup()
    act(() => t.ctx.setResetTrigger(7))
    act(() => t.ctx.setRandomizeTrigger(3))
    expect(t.ctx.resetTrigger).toBe(7)
    expect(t.ctx.randomizeTrigger).toBe(3)
  })

  it('focuses the number input through the ref when present', () => {
    const focus = vi.fn()
    const t = setup()
    act(() => {
      t.ctx.numberInputRef.current = { focus } as unknown as NonNullable<typeof t.ctx.numberInputRef.current>
    })
    act(() => t.ctx.focusNumberInput())
    expect(focus).toHaveBeenCalledTimes(1)
  })

  it('focusNumberInput is a no-op when the ref is empty', () => {
    const t = setup()
    expect(() => act(() => t.ctx.focusNumberInput())).not.toThrow()
  })

  it('renders children inside the provider', () => {
    render(
      <HeaderProvider>
        <p>child content</p>
      </HeaderProvider>
    )
    expect(screen.getByText('child content')).toBeInTheDocument()
  })
})
