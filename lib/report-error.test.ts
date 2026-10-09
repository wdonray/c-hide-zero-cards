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

  it('reports non-abort DOMExceptions', () => {
    const notFound = new DOMException('Not found', 'NotFoundError')
    reportError(notFound, { location: 'Test.here' })

    expect(mocks.captureException).toHaveBeenCalledWith(notFound)
  })
})
