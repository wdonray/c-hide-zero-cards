import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  withScope: vi.fn(),
  captureException: vi.fn(),
  setTag: vi.fn(),
  setExtras: vi.fn(),
}))

vi.mock('@sentry/nextjs', () => ({
  withScope: mocks.withScope,
  captureException: mocks.captureException,
}))

import { reportError } from './report-error'

beforeEach(() => {
  vi.clearAllMocks()
  mocks.withScope.mockImplementation((cb: (scope: unknown) => void) =>
    cb({ setTag: mocks.setTag, setExtras: mocks.setExtras })
  )
})

describe('reportError', () => {
  it('reports an Error with location tag and extras', () => {
    const error = new Error('boom')
    reportError(error, { location: 'Test.here', extra: { status: 500 } })

    expect(mocks.withScope).toHaveBeenCalledTimes(1)
    expect(mocks.setTag).toHaveBeenCalledWith('location', 'Test.here')
    expect(mocks.setExtras).toHaveBeenCalledWith({ status: 500 })
    expect(mocks.captureException).toHaveBeenCalledWith(error)
  })

  it('works with no options', () => {
    const error = new Error('boom')
    reportError(error)

    expect(mocks.setTag).not.toHaveBeenCalled()
    expect(mocks.setExtras).not.toHaveBeenCalled()
    expect(mocks.captureException).toHaveBeenCalledWith(error)
  })

  it('normalizes a non-Error value into an Error', () => {
    reportError('something broke')

    expect(mocks.captureException).toHaveBeenCalledTimes(1)
    const reported = mocks.captureException.mock.calls[0][0]
    expect(reported).toBeInstanceOf(Error)
    expect(reported.message).toBe('something broke')
  })

  it('ignores AbortError DOMExceptions', () => {
    const abortError = new DOMException('The operation was aborted.', 'AbortError')
    reportError(abortError, { location: 'Test.here' })

    expect(mocks.withScope).not.toHaveBeenCalled()
    expect(mocks.captureException).not.toHaveBeenCalled()
  })

  it('ignores network failures (TypeError: Failed to fetch)', () => {
    reportError(new TypeError('Failed to fetch'), { location: 'Test.here' })

    expect(mocks.withScope).not.toHaveBeenCalled()
    expect(mocks.captureException).not.toHaveBeenCalled()
  })

  it('ignores network failures with the host Sentry appends to the message', () => {
    // Sentry's fetch instrumentation (enhanceFetchErrorMessages, on by
    // default) rewrites a fetch TypeError before re-throwing it, appending
    // the request host: "Failed to fetch (hidezerocards.org)". The filter
    // must still recognize it as a network failure (Sentry issue
    // HIDE-ZERO-CARDS-7, GitHub #165).
    reportError(new TypeError('Failed to fetch (hidezerocards.org)'), { location: 'Test.here' })

    expect(mocks.withScope).not.toHaveBeenCalled()
    expect(mocks.captureException).not.toHaveBeenCalled()
  })

  it('ignores Safari network failures (TypeError: Load failed)', () => {
    reportError(new TypeError('Load failed'), { location: 'Test.here' })

    expect(mocks.withScope).not.toHaveBeenCalled()
    expect(mocks.captureException).not.toHaveBeenCalled()
  })

  it('ignores Safari network failures with the host Sentry appends', () => {
    reportError(new TypeError('Load failed (hidezerocards.org)'), { location: 'Test.here' })

    expect(mocks.withScope).not.toHaveBeenCalled()
    expect(mocks.captureException).not.toHaveBeenCalled()
  })

  it('ignores Firefox network failures, with or without the appended host', () => {
    reportError(new TypeError('NetworkError when attempting to fetch resource.'), {
      location: 'Test.here',
    })
    reportError(new TypeError('NetworkError when attempting to fetch resource. (api.github.com)'), {
      location: 'Test.here',
    })

    expect(mocks.withScope).not.toHaveBeenCalled()
    expect(mocks.captureException).not.toHaveBeenCalled()
  })

  it('reports other TypeErrors', () => {
    const error = new TypeError('cannot read property of undefined')
    reportError(error, { location: 'Test.here' })

    expect(mocks.captureException).toHaveBeenCalledWith(error)
  })

  it('reports non-abort DOMExceptions', () => {
    const notFound = new DOMException('Not found', 'NotFoundError')
    reportError(notFound, { location: 'Test.here' })

    expect(mocks.captureException).toHaveBeenCalledWith(notFound)
  })
})
