import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'
import { withPuckCSS } from '@delmaredigital/payload-puck/next'

import redirects from './redirects'

const NEXT_PUBLIC_SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL].map((item) => {
        const url = new URL(item)
        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', '') as 'http' | 'https',
        }
      }),
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
}

// @payloadcms/next's withPayload injects a global `Vary: Sec-CH-Prefers-Color-Scheme`
// header on `/:path*` (every route, including /api/media/file/*) for admin dark-mode
// client-hint detection. That Vary blocks Cloudflare Polish from optimizing any image
// (`cf-polished: vary_header_present`) and breaks edge image optimization more broadly.
//
// Fix: filter out Payload's global rule and re-add it scoped to the admin path only.
// The hardcoded admin path below mirrors routes.admin in payload.config.ts — update
// both if the admin path ever changes (same checklist already documented there).
const payloadWrapped = withPayload(nextConfig, { devBundleServerPackages: false })
const payloadOriginalHeaders = payloadWrapped.headers

const finalConfig: NextConfig = {
  ...payloadWrapped,
  headers: async () => {
    const all = payloadOriginalHeaders ? await payloadOriginalHeaders() : []
    const withoutGlobalClientHints = all.filter(
      (rule) =>
        !(
          rule.source === '/:path*' &&
          rule.headers?.some(
            (h) => h.key === 'Vary' && h.value?.includes('Sec-CH-Prefers-Color-Scheme'),
          )
        ),
    )
    return [
      ...withoutGlobalClientHints,
      {
        // These three headers are copied verbatim from
        // node_modules/@payloadcms/next/dist/withPayload/withPayload.js —
        // they power SSR dark-mode detection on the admin. If Payload
        // ever changes its client-hint implementation upstream, mirror
        // the change here too.
        source: '/p-kcCapdQH/:path*',
        headers: [
          { key: 'Accept-CH', value: 'Sec-CH-Prefers-Color-Scheme' },
          { key: 'Vary', value: 'Sec-CH-Prefers-Color-Scheme' },
          { key: 'Critical-CH', value: 'Sec-CH-Prefers-Color-Scheme' },
        ],
      },
    ]
  },
}

export default withPuckCSS({
  cssInput: 'src/app/(frontend)/globals.css',
})(finalConfig)
