import type { PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { HeaderProvider } from '@/lib/useHeaderContext'
import { useDraggable } from '@/lib/useDraggable'

function renderDraggable(initialX = 10, initialY = 20) {
  // Mirrors production: HomePageClient always passes both triggers (0 initially).
  // (Omitting randomizeTrigger would hit the hook's `undefined !== 0` path and
  // randomize on mount; the app never does this.)
  const hook = renderHook(() => useDraggable({ initialX, initialY, resetTrigger: 0, randomizeTrigger: 0 }), {
    wrapper: HeaderProvider,
  })
  // In production DraggableCard attaches dragRef to the card div, which the
  // hook needs for setPointerCapture. Stub the element surface here.
  hook.result.current.dragRef.current = {
    setPointerCapture: () => {},
    releasePointerCapture: () => {},
    hasPointerCapture: () => false,
  } as unknown as HTMLDivElement
  return hook
}

function pointerEvent(
  clientX: number,
  clientY: number,
  overrides?: { pointerId?: number; isPrimary?: boolean }
): ReactPointerEvent {
  return {
    clientX,
    clientY,
    preventDefault: () => {},
    pointerId: overrides?.pointerId ?? 1,
    // Production pointers are always primary unless a second finger is down;
    // the hook ignores non-primary pointers so they can't hijack a drag.
    isPrimary: overrides?.isPrimary ?? true,
  } as ReactPointerEvent
}

describe('useDraggable', () => {
  it('starts at the initial position and not dragging', () => {
    const { result } = renderDraggable()
    expect(result.current.position).toEqual({ x: 10, y: 20 })
    expect(result.current.isDragging).toBe(false)
  })

  it('moves the card with the pointer while dragging', () => {
    const { result } = renderDraggable()
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent(100, 120))
    })
    expect(result.current.isDragging).toBe(true)
    act(() => {
      result.current.handlers.onPointerMove(pointerEvent(150, 170))
    })
    // drag offset was (100 - 10, 120 - 20) = (90, 100)
    expect(result.current.position).toEqual({ x: 60, y: 70 })
    act(() => {
      result.current.handlers.onPointerUp(pointerEvent(150, 170))
    })
    expect(result.current.isDragging).toBe(false)
  })

  it('ignores pointer moves when not dragging', () => {
    const { result } = renderDraggable()
    act(() => {
      result.current.handlers.onPointerMove(pointerEvent(999, 999))
    })
    expect(result.current.position).toEqual({ x: 10, y: 20 })
  })

  it('moves the card with arrow keys', () => {
    const { result } = renderDraggable()
    act(() => {
      result.current.handlers.onKeyDown({ key: 'ArrowRight', preventDefault: () => {} } as ReactKeyboardEvent)
    })
    expect(result.current.position).toEqual({ x: 20, y: 20 })
    act(() => {
      result.current.handlers.onKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as ReactKeyboardEvent)
    })
    expect(result.current.position).toEqual({ x: 20, y: 30 })
  })

  it('ignores non-arrow keys', () => {
    const { result } = renderDraggable()
    act(() => {
      result.current.handlers.onKeyDown({ key: 'Enter', preventDefault: () => {} } as ReactKeyboardEvent)
    })
    expect(result.current.position).toEqual({ x: 10, y: 20 })
  })

  it('resets to the initial position when resetTrigger changes', () => {
    const { result, rerender } = renderHook(
      ({ resetTrigger }) => useDraggable({ initialX: 10, initialY: 20, resetTrigger, randomizeTrigger: 0 }),
      { wrapper: HeaderProvider, initialProps: { resetTrigger: 0 } }
    )
    result.current.dragRef.current = {
      setPointerCapture: () => {},
      releasePointerCapture: () => {},
      hasPointerCapture: () => false,
    } as unknown as HTMLDivElement
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent(100, 120))
    })
    act(() => {
      result.current.handlers.onPointerMove(pointerEvent(150, 170))
    })
    expect(result.current.position).toEqual({ x: 60, y: 70 })
    rerender({ resetTrigger: 1 })
    expect(result.current.position).toEqual({ x: 10, y: 20 })
  })

  it('exposes onPointerCancel instead of onPointerLeave', () => {
    const { result } = renderDraggable()
    expect('onPointerCancel' in result.current.handlers).toBe(true)
    expect('onPointerLeave' in result.current.handlers).toBe(false)
  })

  it('ignores a non-primary pointerdown so a second finger cannot hijack the drag', () => {
    const { result } = renderDraggable()
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent(100, 120, { pointerId: 1, isPrimary: true }))
    })
    expect(result.current.isDragging).toBe(true)
    act(() => {
      result.current.handlers.onPointerMove(pointerEvent(150, 170, { pointerId: 1, isPrimary: true }))
    })
    // drag offset was (100 - 10, 120 - 20) = (90, 100)
    expect(result.current.position).toEqual({ x: 60, y: 70 })

    // Second finger touches down elsewhere: must not reset the grab offset.
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent(300, 300, { pointerId: 2, isPrimary: false }))
    })
    expect(result.current.isDragging).toBe(true)
    // Second finger moves widely: the card must not follow it.
    act(() => {
      result.current.handlers.onPointerMove(pointerEvent(500, 500, { pointerId: 2, isPrimary: false }))
    })
    expect(result.current.position).toEqual({ x: 60, y: 70 })

    // The primary finger still drives the drag.
    act(() => {
      result.current.handlers.onPointerMove(pointerEvent(190, 170, { pointerId: 1, isPrimary: true }))
    })
    expect(result.current.position).toEqual({ x: 100, y: 70 })

    // Lifting the second finger does not end the drag.
    act(() => {
      result.current.handlers.onPointerUp(pointerEvent(500, 500, { pointerId: 2, isPrimary: false }))
    })
    expect(result.current.isDragging).toBe(true)

    // Lifting the primary finger ends it.
    act(() => {
      result.current.handlers.onPointerUp(pointerEvent(190, 170, { pointerId: 1, isPrimary: true }))
    })
    expect(result.current.isDragging).toBe(false)
  })

  it('ends the drag on pointercancel without getting stuck', () => {
    const { result } = renderDraggable()
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent(100, 120))
    })
    act(() => {
      result.current.handlers.onPointerMove(pointerEvent(150, 170))
    })
    expect(result.current.position).toEqual({ x: 60, y: 70 })

    // iOS Safari fires pointercancel when it takes over the gesture.
    act(() => {
      result.current.handlers.onPointerCancel(pointerEvent(150, 170))
    })
    expect(result.current.isDragging).toBe(false)
    // The card stays where the cancel happened; it does not jump.
    expect(result.current.position).toEqual({ x: 60, y: 70 })

    // A fresh drag afterwards works normally (no stuck state).
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent(200, 200, { pointerId: 3 }))
    })
    expect(result.current.isDragging).toBe(true)
    act(() => {
      result.current.handlers.onPointerMove(pointerEvent(230, 240, { pointerId: 3 }))
    })
    // drag offset was (200 - 60, 200 - 70) = (140, 130)
    expect(result.current.position).toEqual({ x: 90, y: 110 })
  })

  it('ignores pointerup from a pointer that is not driving the drag', () => {
    const { result } = renderDraggable()
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent(100, 120, { pointerId: 1 }))
    })
    expect(result.current.isDragging).toBe(true)
    act(() => {
      result.current.handlers.onPointerUp(pointerEvent(0, 0, { pointerId: 9 }))
    })
    expect(result.current.isDragging).toBe(true)
  })
})
