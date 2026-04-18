// lib/dreamscape-auth.ts
// Shared auth helper for all Dreamscape API routes.
// Extracts the MD5 signature pattern from api/domains/check/route.ts
// so it doesn't need to be duplicated across routes.

import { createHash } from 'crypto'

export function generateDreamscapeAuth() {
  const apiKey = process.env.DREAMSCAPE_API_KEY!
  const requestId = createHash('md5')
    .update(`${Math.random()}${Date.now()}`)
    .digest('hex')
  const signature = createHash('md5')
    .update(`${requestId}${apiKey}`)
    .digest('hex')
  return {
    requestId,
    signature,
    headers: {
      'Accept': 'application/json',
      'Api-Request-Id': requestId,
      'Api-Signature': signature,
    },
  }
}

export const DREAMSCAPE_BASE = process.env.DREAMSCAPE_API_URL ?? 'https://reseller-api.ds.network'