// app/api/hosting/pricing/route.ts
// Temporarily verbose logging to identify correct Dreamscape endpoint paths

import { NextResponse } from 'next/server'
import { generateDreamscapeAuth, DREAMSCAPE_BASE } from '@/lib/dreamscape-auth'

export const dynamic = 'force-dynamic'

async function dsGet(path: string) {
  const { headers } = generateDreamscapeAuth()
  const url = `${DREAMSCAPE_BASE}${path}`
  console.log(`[DS] GET ${url}`)

  const res = await fetch(url, { headers })
  const text = await res.text()

  console.log(`[DS] ${url} → ${res.status}`)
  console.log(`[DS] body: ${text.substring(0, 500)}`)

  if (!res.ok) return { _error: res.status, _url: url, _body: text.substring(0, 200) }

  try {
    return JSON.parse(text)
  } catch {
    return { _parseError: true, _body: text.substring(0, 200) }
  }
}

export async function GET() {
  try {
    // Try several plausible endpoint paths in parallel so we
    // can see from the logs which ones return 200 vs 404
    const [
      linuxHosting,
      products,
      productsList,
      tlds,
      domainsTlds,
    ] = await Promise.all([
      dsGet('/products/linux_hosting'),
      dsGet('/products'),
      dsGet('/products/list'),
      dsGet('/tlds'),
      dsGet('/domains/tlds'),
    ])

    return NextResponse.json({
      debug: true,
      linuxHosting,
      products,
      productsList,
      tlds,
      domainsTlds,
    })

  } catch (err) {
    console.error('[DS] Route error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}