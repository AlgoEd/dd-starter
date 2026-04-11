/**
 * Experimental: Next.js 16 `proxy.ts` hook to override the response Vary
 * header on media file routes.
 *
 * `middleware.ts` runs too early — Next.js's App Router appends its own
 * Vary headers (rsc, next-router-state-tree, ...) AFTER middleware runs,
 * which breaks Cloudflare Polish (issue #85852 upstream).
 *
 * `proxy.ts` is documented as running at a different pipeline phase.
 * Unclear (from reading Next docs) if it runs late enough to override
 * those Router Vary headers. This file is a spike to find out — if the
 * deployed response still shows multiple Vary headers on /api/media/file/*,
 * this approach doesn't work either and we should remove the file.
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(_req: NextRequest) {
  const res = NextResponse.next()
  res.headers.set('Vary', 'Accept-Encoding')
  return res
}

export const config = {
  matcher: '/api/media/file/:path*',
}
