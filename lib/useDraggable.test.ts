import type { PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { HeaderProvider } from '@/lib/useHeaderContext'
import type { ScatterArea } from '@/lib/useHeaderContext'
import { CARD_WORKSPACE_SELECTOR } from '@/lib/constants'
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

  it('does not re-seat when resetTrigger is undefined and only the initial position changes', () => {
    const { result, rerender } = renderHook(
      ({ initialX }) => useDraggable({ initialX, initialY: 20, resetTrigger: undefined, randomizeTrigger: 0 }),
      { wrapper: HeaderProvider, initialProps: { initialX: 10 } }
    )
    rerender({ initialX: 50 })
    // The reset branch is skipped for an undefined trigger: position keeps
    // its state value rather than jumping to the new initial.
    expect(result.current.position).toEqual({ x: 10, y: 20 })
  })

  it('moves the card with ArrowLeft and ArrowUp', () => {
    const { result } = renderDraggable()
    act(() => {
      result.current.handlers.onKeyDown({ key: 'ArrowLeft', preventDefault: () => {} } as ReactKeyboardEvent)
    })
    expect(result.current.position).toEqual({ x: 0, y: 20 })
    act(() => {
      result.current.handlers.onKeyDown({ key: 'ArrowUp', preventDefault: () => {} } as ReactKeyboardEvent)
    })
    expect(result.current.position).toEqual({ x: 0, y: 10 })
  })

  it('follows document-level pointer moves and stops on document pointer up', () => {
    const { result } = renderDraggable()
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent(100, 120))
    })
    // The hook listens on document while dragging so fast drags keep tracking.
    act(() => {
      document.dispatchEvent(
        new PointerEvent('pointermove', { bubbles: true, clientX: 200, clientY: 220, pointerId: 1 })
      )
    })
    // drag offset was (100 - 10, 120 - 20) = (90, 100)
    expect(result.current.position).toEqual({ x: 110, y: 120 })
    act(() => {
      document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }))
    })
    expect(result.current.isDragging).toBe(false)
    // After pointer up the global listeners are removed: further moves are ignored.
    act(() => {
      document.dispatchEvent(
        new PointerEvent('pointermove', { bubbles: true, clientX: 999, clientY: 999, pointerId: 1 })
      )
    })
    expect(result.current.position).toEqual({ x: 110, y: 120 })
  })

  it('scatters deterministically within the measured workspace when randomizeTrigger changes', () => {
    const scatterArea: ScatterArea = { x: 0, y: 0, width: 800, height: 600 }
    const { result, rerender } = renderHook(
      ({ randomizeTrigger }) =>
        useDraggable({ initialX: 10, initialY: 20, resetTrigger: 0, randomizeTrigger, scatterArea }),
      { wrapper: HeaderProvider, initialProps: { randomizeTrigger: 0 } }
    )
    rerender({ randomizeTrigger: 1 })
    const scattered = result.current.position
    // Actually scattered (not the initial fan position)...
    expect(scattered).not.toEqual({ x: 10, y: 20 })
    // ...and inside the workspace: with no mounted element the card size is
    // unknown (0) and the static spot is assumed centered, so the offset
    // stays within half the workspace in each axis.
    expect(Math.abs(scattered.x)).toBeLessThanOrEqual(400)
    expect(Math.abs(scattered.y)).toBeLessThanOrEqual(300)
    // ...and deterministic for the same trigger: a second hook with the same
    // inputs lands in the identical spot.
    const { result: other, rerender: rerenderOther } = renderHook(
      ({ randomizeTrigger }) =>
        useDraggable({ initialX: 10, initialY: 20, resetTrigger: 0, randomizeTrigger, scatterArea }),
      { wrapper: HeaderProvider, initialProps: { randomizeTrigger: 0 } }
    )
    rerenderOther({ randomizeTrigger: 1 })
    expect(other.current.position).toEqual(scattered)
  })

  it('scales the scatter to the container instead of using fixed offsets', () => {
    // A phone-sized workspace and a desktop-sized one: the scatter bounds
    // track the passed area, not a fixed pixel constant.
    const phone: ScatterArea = { x: 0, y: 0, width: 375, height: 500 }
    const desktop: ScatterArea = { x: 0, y: 0, width: 1280, height: 800 }
    const renderAt = (scatterArea: ScatterArea) => {
      const { result, rerender } = renderHook(
        ({ randomizeTrigger }) =>
          useDraggable({ initialX: 10, initialY: 20, resetTrigger: 0, randomizeTrigger, scatterArea }),
        { wrapper: HeaderProvider, initialProps: { randomizeTrigger: 0 } }
      )
      rerender({ randomizeTrigger: 1 })
      return result.current.position
    }
    const onPhone = renderAt(phone)
    expect(Math.abs(onPhone.x)).toBeLessThanOrEqual(187.5)
    expect(Math.abs(onPhone.y)).toBeLessThanOrEqual(250)
    const onDesktop = renderAt(desktop)
    expect(Math.abs(onDesktop.x)).toBeLessThanOrEqual(640)
    expect(Math.abs(onDesktop.y)).toBeLessThanOrEqual(400)
  })

  it('leaves cards in place when Mix fires with no measurable workspace', () => {
    // No scatterArea and no mounted element (SSR / workspace not yet laid
    // out): the cards stay put instead of scattering into the void.
    const { result, rerender } = renderHook(
      ({ randomizeTrigger }) => useDraggable({ initialX: 10, initialY: 20, resetTrigger: 0, randomizeTrigger }),
      { wrapper: HeaderProvider, initialProps: { randomizeTrigger: 0 } }
    )
    rerender({ randomizeTrigger: 1 })
    expect(result.current.position).toEqual({ x: 10, y: 20 })
  })

  it('prefers a live workspace measurement over the Mix-time area', () => {
    const scatterArea: ScatterArea = { x: 0, y: 0, width: 9999, height: 9999 }
    let seenSelector: string | null = null
    // Mounted card inside a 300x400 workspace at (100, 200); the card's own
    // rect is 50x60 at (150, 250) with the pre-scatter offset (10, 20).
    const cardEl = {
      closest: (selector: string) => {
        seenSelector = selector
        return { getBoundingClientRect: () => ({ x: 100, y: 200, width: 300, height: 400 }) }
      },
      getBoundingClientRect: () => ({ left: 150, top: 250, width: 50, height: 60 }),
    } as unknown as HTMLDivElement
    const { result, rerender } = renderHook(
      ({ randomizeTrigger, cardEl }: { randomizeTrigger: number; cardEl?: HTMLDivElement | null }) =>
        useDraggable({ initialX: 10, initialY: 20, resetTrigger: 0, randomizeTrigger, scatterArea, cardEl }),
      { wrapper: HeaderProvider, initialProps: { randomizeTrigger: 0, cardEl: null as HTMLDivElement | null } }
    )
    rerender({ randomizeTrigger: 1, cardEl })
    expect(seenSelector).toBe(CARD_WORKSPACE_SELECTOR)
    // Static spot relative to the workspace: (150 - 10 - 100, 250 - 20 - 200)
    // = (40, 30); card lands fully inside [0, 250] x [0, 340].
    expect(result.current.position.x).toBeGreaterThanOrEqual(-40)
    expect(result.current.position.x).toBeLessThanOrEqual(210)
    expect(result.current.position.y).toBeGreaterThanOrEqual(-30)
    expect(result.current.position.y).toBeLessThanOrEqual(310)
  })

  it('falls back to the Mix-time area when the live measurement is empty', () => {
    const scatterArea: ScatterArea = { x: 0, y: 0, width: 800, height: 600 }
    // closest() finds an element but it has no usable rect: the Mix-time
    // area wins, and the card rect still sizes the clamp.
    const cardEl = {
      closest: () => ({ getBoundingClientRect: () => ({ x: 0, y: 0, width: 0, height: 0 }) }),
      getBoundingClientRect: () => ({ left: 400, top: 300, width: 50, height: 60 }),
    } as unknown as HTMLDivElement
    const { result, rerender } = renderHook(
      ({ randomizeTrigger, cardEl }: { randomizeTrigger: number; cardEl?: HTMLDivElement | null }) =>
        useDraggable({ initialX: 10, initialY: 20, resetTrigger: 0, randomizeTrigger, scatterArea, cardEl }),
      { wrapper: HeaderProvider, initialProps: { randomizeTrigger: 0, cardEl: null as HTMLDivElement | null } }
    )
    rerender({ randomizeTrigger: 1, cardEl })
    // Static spot: (400 - 10 - 0, 300 - 20 - 0) = (390, 280); bounds from
    // the 800x600 prop area with a 50x60 card: [0, 750] x [0, 540].
    expect(result.current.position.x).toBeGreaterThanOrEqual(-390)
    expect(result.current.position.x).toBeLessThanOrEqual(360)
    expect(result.current.position.y).toBeGreaterThanOrEqual(-280)
    expect(result.current.position.y).toBeLessThanOrEqual(260)
  })

  it('clamps the target to the origin when the card is larger than the workspace', () => {
    const scatterArea: ScatterArea = { x: 0, y: 0, width: 30, height: 30 }
    // 100x100 card in a 30x30 workspace, no workspace ancestor found.
    const cardEl = {
      closest: () => null,
      getBoundingClientRect: () => ({ left: 50, top: 60, width: 100, height: 100 }),
    } as unknown as HTMLDivElement
    const { result, rerender } = renderHook(
      ({ randomizeTrigger, cardEl }: { randomizeTrigger: number; cardEl?: HTMLDivElement | null }) =>
        useDraggable({ initialX: 10, initialY: 20, resetTrigger: 0, randomizeTrigger, scatterArea, cardEl }),
      { wrapper: HeaderProvider, initialProps: { randomizeTrigger: 0, cardEl: null as HTMLDivElement | null } }
    )
    rerender({ randomizeTrigger: 1, cardEl })
    // max(0, 30 - 100) = 0, so the target is (0, 0); the offset backs out
    // the static spot (50 - 10 - 0, 60 - 20 - 0) = (40, 40) exactly.
    expect(result.current.position).toEqual({ x: -40, y: -40 })
  })

  it('drags without pointer capture when no element is attached', () => {
    // renderHook never attaches dragRef to a DOM node, so dragRef.current is
    // null: the pointer-capture guards are skipped but dragging still works.
    const { result } = renderHook(
      () => useDraggable({ initialX: 10, initialY: 20, resetTrigger: 0, randomizeTrigger: 0 }),
      { wrapper: HeaderProvider }
    )
    expect(result.current.dragRef.current).toBeNull()
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent(100, 120))
    })
    expect(result.current.isDragging).toBe(true)
    act(() => {
      result.current.handlers.onPointerMove(pointerEvent(150, 170))
    })
    // No drag offset was captured, so the card follows the raw pointer.
    expect(result.current.position).toEqual({ x: 150, y: 170 })
    act(() => {
      result.current.handlers.onPointerUp(pointerEvent(150, 170))
    })
    expect(result.current.isDragging).toBe(false)
  })

  it('treats an undefined randomizeTrigger as a zero-seeded scatter', () => {
    const scatterArea: ScatterArea = { x: 0, y: 0, width: 800, height: 600 }
    const { result, rerender } = renderHook(
      ({ randomizeTrigger }: { randomizeTrigger?: number }) =>
        useDraggable({ initialX: 10, initialY: 20, resetTrigger: 0, randomizeTrigger, scatterArea }),
      { wrapper: HeaderProvider, initialProps: { randomizeTrigger: 1 as number | undefined } }
    )
    const before = result.current.position
    // undefined !== 0, so it scatters; the ?? 0 seeds the PRNG deterministically.
    rerender({ randomizeTrigger: undefined })
    expect(result.current.position).not.toEqual(before)
    const { result: other, rerender: rerenderOther } = renderHook(
      ({ randomizeTrigger }: { randomizeTrigger?: number }) =>
        useDraggable({ initialX: 10, initialY: 20, resetTrigger: 0, randomizeTrigger, scatterArea }),
      { wrapper: HeaderProvider, initialProps: { randomizeTrigger: 1 as number | undefined } }
    )
    rerenderOther({ randomizeTrigger: undefined })
    expect(other.current.position).toEqual(result.current.position)
  })

  it('ends the drag cleanly when releasePointerCapture throws on a dead pointer', () => {
    // iOS Safari throws NotFoundError if capture was already released
    // implicitly; the hook must swallow it and still end the drag.
    const { result } = renderDraggable()
    result.current.dragRef.current = {
      setPointerCapture: () => {},
      releasePointerCapture: () => {
        throw new DOMException('pointer capture released', 'NotFoundError')
      },
      hasPointerCapture: () => true,
    } as unknown as HTMLDivElement
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent(100, 120))
    })
    expect(result.current.isDragging).toBe(true)
    act(() => {
      result.current.handlers.onPointerUp(pointerEvent(100, 120))
    })
    expect(result.current.isDragging).toBe(false)
  })

  it('ends the drag on a document-level pointercancel from the active pointer', () => {
    const { result } = renderDraggable()
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent(100, 120))
    })
    expect(result.current.isDragging).toBe(true)
    act(() => {
      document.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId: 1 }))
    })
    expect(result.current.isDragging).toBe(false)
  })

  it('ignores pointercancel from a pointer that is not driving the drag', () => {
    const { result } = renderDraggable()
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent(100, 120, { pointerId: 1 }))
    })
    expect(result.current.isDragging).toBe(true)
    // React-level cancel from another pointer: ignored.
    act(() => {
      result.current.handlers.onPointerCancel(pointerEvent(0, 0, { pointerId: 9 }))
    })
    expect(result.current.isDragging).toBe(true)
    // Document-level move/up/cancel from another pointer: all ignored, the
    // drag keeps tracking the original finger.
    act(() => {
      document.dispatchEvent(
        new PointerEvent('pointermove', { bubbles: true, clientX: 999, clientY: 999, pointerId: 9 })
      )
    })
    expect(result.current.position).toEqual({ x: 10, y: 20 })
    act(() => {
      document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 9 }))
    })
    expect(result.current.isDragging).toBe(true)
    act(() => {
      document.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId: 9 }))
    })
    expect(result.current.isDragging).toBe(true)
  })
})
