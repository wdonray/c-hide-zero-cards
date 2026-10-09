import { beforeEach, describe, expect, it, vi } from 'vitest'

// Fresh module state per test (the toast store is module-level).
let errorToast: typeof import('./error-toast')

beforeEach(async () => {
  vi.resetModules()
  errorToast = await import('./error-toast')
})

describe('getErrorMessage', () => {
  it('maps fetch network failures (TypeError) to the connectivity message', () => {
    expect(errorToast.getErrorMessage(new TypeError('Failed to fetch'))).toBe(
      "Couldn't reach the server. Check your connection and try again."
    )
  })

  it('maps Response objects by status code', () => {
    expect(errorToast.getErrorMessage(new Response(null, { status: 400 }))).toBe("That didn't work. Please try again.")
    expect(errorToast.getErrorMessage(new Response(null, { status: 401 }))).toBe(
      'Your session expired. Please sign in again.'
    )
    expect(errorToast.getErrorMessage(new Response(null, { status: 403 }))).toBe(
      "You don't have permission to do that."
    )
    expect(errorToast.getErrorMessage(new Response(null, { status: 404 }))).toBe(
      "That wasn't found. It may have been moved or deleted."
    )
    expect(errorToast.getErrorMessage(new Response(null, { status: 409 }))).toBe('That already exists.')
    expect(errorToast.getErrorMessage(new Response(null, { status: 429 }))).toBe(
      'Too many requests. Please wait a moment and try again.'
    )
  })

  it('maps 5xx statuses to the server-error message', () => {
    for (const status of [500, 502, 503, 599]) {
      expect(errorToast.getErrorMessage(new Response(null, { status }))).toBe(
        "Something went wrong on our end. We're looking into it."
      )
    }
  })

  it('maps unlisted statuses to the generic fallback', () => {
    for (const status of [200, 301, 418]) {
      expect(errorToast.getErrorMessage(new Response(null, { status }))).toBe('Something went wrong. Please try again.')
    }
  })

  it('reads status from Response-like objects', () => {
    expect(errorToast.getErrorMessage({ status: 404 })).toBe("That wasn't found. It may have been moved or deleted.")
  })

  it('falls back when a Response-like object has a non-numeric status', () => {
    expect(errorToast.getErrorMessage({ status: '404' })).toBe('Something went wrong. Please try again.')
  })

  it('falls back for objects without a status', () => {
    expect(errorToast.getErrorMessage({ message: 'boom' })).toBe('Something went wrong. Please try again.')
  })

  it('falls back for null, undefined, strings, and plain Errors', () => {
    for (const value of [null, undefined, 'boom', 42, new Error('boom')]) {
      expect(errorToast.getErrorMessage(value)).toBe('Something went wrong. Please try again.')
    }
  })
})

describe('toast store', () => {
  it('notifies subscribers when a toast is added', () => {
    const seen: string[][] = []
    const unsubscribe = errorToast.subscribeToasts((toasts) => {
      seen.push(toasts.map((t) => t.message))
    })
    errorToast.toastError('hello')
    expect(seen.at(-1)).toEqual(['hello'])
    unsubscribe()
  })

  it('evicts the oldest toast beyond the cap of 3', () => {
    const seen: string[][] = []
    errorToast.subscribeToasts((toasts) => {
      seen.push(toasts.map((t) => t.message))
    })
    errorToast.toastError('one')
    errorToast.toastError('two')
    errorToast.toastError('three')
    errorToast.toastError('four')
    expect(seen.at(-1)).toEqual(['two', 'three', 'four'])
  })

  it('dismisses a toast by id and notifies', () => {
    const snapshots: { id: number; message: string }[][] = []
    errorToast.subscribeToasts((toasts) => {
      snapshots.push(toasts)
    })
    errorToast.toastError('gone')
    const id = snapshots.at(-1)![0].id
    const before = snapshots.length
    errorToast.dismissToast(id)
    expect(snapshots.at(-1)).toEqual([])
    expect(snapshots.length).toBeGreaterThan(before)
  })

  it('does not notify when dismissing an unknown id', () => {
    const calls: string[][] = []
    errorToast.subscribeToasts((toasts) => {
      calls.push(toasts.map((t) => t.message))
    })
    const before = calls.length
    errorToast.dismissToast(999999)
    expect(calls.length).toBe(before)
  })

  it('stops notifying after unsubscribe', () => {
    const calls: string[][] = []
    const unsubscribe = errorToast.subscribeToasts((toasts) => {
      calls.push(toasts.map((t) => t.message))
    })
    const before = calls.length
    unsubscribe()
    errorToast.toastError('silent')
    expect(calls.length).toBe(before)
  })
})
