// app/api/domains/check/route.ts
// Refactored to use shared generateDreamscapeAuth from lib/dreamscape-auth.ts

import { NextRequest, NextResponse } from 'next/server'
import { generateDreamscapeAuth, DREAMSCAPE_BASE } from '@/lib/dreamscape-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const domain = searchParams.get('domain')
  const tld    = searchParams.get('tld') || '.com.au'

  if (!domain) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
  }

  const { headers } = generateDreamscapeAuth()
  const cleanTld    = tld.startsWith('.') ? tld.slice(1) : tld
  const fullDomain  = `${domain}.${cleanTld}`

  try {
    const url = `${DREAMSCAPE_BASE}/domains/availability?domain_names[]=${encodeURIComponent(fullDomain)}`

    const res  = await fetch(url, { method: 'GET', headers })
    const text = await res.text()

    console.log('Status:', res.status, 'Domain:', fullDomain)
    console.log('Response:', text.substring(0, 300))

    const data = JSON.parse(text)
    return NextResponse.json(data)

  } catch (err) {
    console.error('Domain check error:', err)
    return NextResponse.json(
      { error: 'Failed to check domain availability' },
      { status: 500 }
    )
  }
}