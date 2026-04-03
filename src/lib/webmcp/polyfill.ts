'use client'

import { initializeWebMCPPolyfill } from '@mcp-b/webmcp-polyfill'

let initialized = false

export function ensureWebMCP() {
  if (!initialized && typeof window !== 'undefined') {
    initializeWebMCPPolyfill()
    initialized = true
  }
}
