import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'
import { withPuckCSS } from '@delmaredigital/payload-puck/next'

import redirects from './redirects'

const NEXT_PUBLIC_SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const nextConfig: NextConfig = {
  // Required for @opentelemetry/instrumentation-pg to patch pg. Without this,
  // webpack bundles pg into the server chunk → no runtime require('pg') →
  // require-in-the-middle never fires → db.client.operation.duration metrics
  // never emit. Also requires `pg` as a DIRECT dep in package.json (pnpm's
  // isolated layout — transitive-only pg has no top-level /node_modules/pg
  // symlink, so webpack can't externalize it and bundles it anyway).
  serverExternalPackages: ['pg'],
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

export default withPuckCSS({
  cssInput: 'src/app/(frontend)/globals.css',
})(withPayload(nextConfig, { devBundleServerPackages: false }))
