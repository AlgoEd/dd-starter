import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'
import { withPuckCSS } from '@delmaredigital/payload-puck/next'

import redirects from './redirects'

const NEXT_PUBLIC_SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const nextConfig: NextConfig = {
  // Keep `pg` as a runtime Node require instead of bundling it into the
  // webpack server output. Required for @opentelemetry/instrumentation-pg
  // to patch the driver — require-hooks only fire on Node's require(),
  // not on webpack's __webpack_require__. Without this, db.client.operation.duration
  // metrics never emit (pg is present in node_modules but never loaded
  // through the instrumented path). See otel-bootstrap.mjs header for
  // the broader OTel-on-Next.js setup.
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
