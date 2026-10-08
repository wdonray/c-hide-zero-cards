import { describe, expect, it } from 'vitest'
import { GET } from './route'
import { VERSION } from '@/lib/version'

describe('GET /api/version', () => {
  it('returns the deployed version as a string with no-store caching', async () => {
    const res = await GET()
    expect(res.headers.get('Cache-Control')).toBe('no-store')
    const body = (await res.json()) as { version: unknown }
    expect(body).toEqual({ version: VERSION })
    expect(typeof body.version).toBe('string')
  })
})
