import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

export const dynamic = 'force-dynamic'

function generateAuth() {
  const apiKey = process.env.DREAMSCAPE_API_KEY!
  const requestId = createHash('md5')
    .update(`${Math.random()}${Date.now()}`)
    .digest('hex')
  const signature = createHash('md5')
    .update(`${requestId}${apiKey}`)
    .digest('hex')
  return { requestId, signature }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const domain = searchParams.get('domain')
  const tld = searchParams.get('tld') || '.com.au'

  if (!domain) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
  }

  const { requestId, signature } = generateAuth()
  const cleanTld = tld.startsWith('.') ? tld.slice(1) : tld
  const fullDomain = `${domain}.${cleanTld}`

  try {
    const url = `${process.env.DREAMSCAPE_API_URL}/domains/availability?domain_names[]=${encodeURIComponent(fullDomain)}`
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Api-Request-Id': requestId,
        'Api-Signature': signature,
      },
    })

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