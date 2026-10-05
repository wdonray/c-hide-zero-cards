import { describe, expect, it, vi, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { useIsMobile } from './useIsMobile'

function mockMatchMedia(matches: boolean) {
  let listener: (() => void) | null = null
  const mq = {
    matches,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: (_: string, cb: () => void) => {
      listener = cb
    },
    removeEventListener: () => {
      listener = null
    },
    dispatchEvent: () => false,
  }
  Object.defineProperty(window, 'matchMedia', { writable: true, configurable: true, value: () => mq })
  return {
    setMatches(next: boolean) {
      mq.matches = next
      act(() => listener?.())
    },
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useIsMobile', () => {
  it('returns false when the media query does not match (desktop)', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('returns true when the viewport is below the mobile breakpoint', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('reacts to viewport changes', () => {
    const controls = mockMatchMedia(false)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    controls.setMatches(true)
    expect(result.current).toBe(true)
  })

  it('treats a missing matchMedia as non-mobile (SSR-safe)', () => {
    const original = window.matchMedia
    // @ts-expect-error - simulating a server-ish environment without matchMedia
    delete window.matchMedia
    try {
      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(false)
    } finally {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: original,
      })
    }
  })

  it('renders non-mobile on the server via getServerSnapshot', () => {
    const original = window.matchMedia
    // @ts-expect-error - simulating a server-ish environment without matchMedia
    delete window.matchMedia
    try {
      function Probe() {
        const isMobile = useIsMobile()
        return <span>{isMobile ? 'mobile' : 'desktop'}</span>
      }
      const html = renderToString(<Probe />)
      expect(html).toContain('desktop')
    } finally {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: original,
      })
    }
  })
})
