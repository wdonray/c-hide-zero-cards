import type { ErrorEvent } from '@sentry/nextjs'
import { describe, expect, it } from 'vitest'
import { shouldDropSentryEvent } from './sentry-filters'

const NOISE_VALUE =
  'Non-Error promise rejection captured with value: Object Not Found Matching Id:2, MethodName:update, ParamCount:4'

function rejectionEvent(overrides: Record<string, unknown> = {}): ErrorEvent {
  return {
    type: undefined,
    exception: {
      values: [
        {
          type: 'UnhandledRejection',
          value: NOISE_VALUE,
          ...overrides,
        },
      ],
    },
  } as ErrorEvent
}

describe('shouldDropSentryEvent', () => {
  it('drops the extension object-not-found rejection (Sentry issue shape)', () => {
    expect(shouldDropSentryEvent(rejectionEvent())).toBe(true)
  })

  it('drops variants with different Id and ParamCount numbers', () => {
    expect(
      shouldDropSentryEvent(
        rejectionEvent({
          value:
            'Non-Error promise rejection captured with value: Object Not Found Matching Id:17, MethodName:update, ParamCount:9',
        })
      )
    ).toBe(true)
  })

  it('keeps other non-Error rejections so real bugs still report', () => {
    expect(
      shouldDropSentryEvent(rejectionEvent({ value: 'Non-Error promise rejection captured with value: undefined' }))
    ).toBe(false)
  })

  it('keeps the signature when a stack trace is present (real app bug)', () => {
    expect(
      shouldDropSentryEvent(
        rejectionEvent({
          stacktrace: { frames: [{ filename: 'app/page.tsx', lineno: 42 }] },
        })
      )
    ).toBe(false)
  })

  it('drops when the stack trace has no frames', () => {
    expect(shouldDropSentryEvent(rejectionEvent({ stacktrace: { frames: [] } }))).toBe(true)
  })

  it('keeps handled non-rejection exceptions', () => {
    expect(
      shouldDropSentryEvent({
        type: undefined,
        exception: { values: [{ type: 'TypeError', value: 'Cannot read properties of null' }] },
      } as ErrorEvent)
    ).toBe(false)
  })

  it('keeps events with no exception values', () => {
    expect(shouldDropSentryEvent({ type: undefined } as ErrorEvent)).toBe(false)
    expect(shouldDropSentryEvent({ type: undefined, exception: { values: [] } } as ErrorEvent)).toBe(false)
  })

  it('keeps mixed events where only some values are noise', () => {
    expect(
      shouldDropSentryEvent({
        type: undefined,
        exception: {
          values: [
            { type: 'UnhandledRejection', value: NOISE_VALUE },
            { type: 'TypeError', value: 'Cannot read properties of null' },
          ],
        },
      } as ErrorEvent)
    ).toBe(false)
  })
})
