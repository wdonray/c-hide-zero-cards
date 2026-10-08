import { NextResponse } from 'next/server'
import { VERSION } from '@/lib/version'

export const dynamic = 'force-dynamic'

/**
 * GET /api/version
 *
 * Returns the version of the currently deployed build. The route is never
 * statically cached (force-dynamic) and answers are not stored (no-store),
 * so the client's update poll always sees the freshest deploy.
 */
export async function GET() {
  return NextResponse.json({ version: VERSION }, { headers: { 'Cache-Control': 'no-store' } })
}
