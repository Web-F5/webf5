import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function isAdmin(): Promise<boolean> {
  const jar = await cookies()
  return jar.get('admin_session')?.value === process.env.ADMIN_SECRET
}

// ── Helpers ────────────────────────────────────────────────────────────────

function extractEmails(html: string): string[] {
  const found = new Set<string>()
  // mailto: links
  const mailto = html.matchAll(/mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g)
  for (const m of mailto) found.add(m[1].toLowerCase())
  // Plain text emails (only if not common noreply/info patterns we want to skip)
  const plain = html.matchAll(/\b([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})\b/g)
  for (const m of plain) {
    const email = m[1].toLowerCase()
    if (!email.includes('sentry') && !email.includes('example') && !email.includes('schema') &&
        !email.includes('wixpress') && !email.includes('w3.org') && !email.includes('jquery') &&
        !email.includes('.png') && !email.includes('.jpg') && !email.includes('.svg')) {
      found.add(email)
    }
  }
  // Prefer non-generic emails; deprioritise info@, hello@, admin@
  const generic = ['info@', 'hello@', 'admin@', 'contact@', 'support@', 'enquiries@', 'mail@', 'noreply@', 'no-reply@']
  const sorted = [...found].sort((a, b) => {
    const aGen = generic.some(g => a.startsWith(g)) ? 1 : 0
    const bGen = generic.some(g => b.startsWith(g)) ? 1 : 0
    return aGen - bGen
  })
  return sorted.slice(0, 5)
}

function extractSocials(html: string, baseOrigin: string): { linkedin?: string; facebook?: string } {
  const links = html.matchAll(/href=["']([^"']+)["']/gi)
  let linkedin: string | undefined
  let facebook: string | undefined
  for (const m of links) {
    const href = m[1]
    if (!linkedin && /linkedin\.com\/(in|company)\/[^"'?#\s]+/i.test(href)) {
      linkedin = href.startsWith('http') ? href : `https://linkedin.com${href}`
    }
    if (!facebook && /facebook\.com\/(?!sharer|share|dialog)[^"'?#\s]+/i.test(href)) {
      // Skip share buttons
      if (!href.includes('facebook.com/sharer') && !href.includes('facebook.com/dialog')) {
        facebook = href.startsWith('http') ? href : `https://facebook.com${href}`
      }
    }
  }
  return { linkedin, facebook }
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' },
    })
    if (!res.ok) return null
    return await res.text()
  } catch { return null }
}

// ── GET — search Google Places ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const query = req.nextUrl.searchParams.get('q')
  if (!query?.trim()) return NextResponse.json({ results: [] })

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Places API not configured.' }, { status: 503 })

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&region=au&key=${apiKey}`
  const res  = await fetch(url, { next: { revalidate: 0 } })
  const data = await res.json()

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    return NextResponse.json({ error: `Places API: ${data.status}` }, { status: 400 })
  }

  const results = (data.results ?? []).slice(0, 6).map((p: {
    place_id: string; name: string; formatted_address: string; types?: string[]
  }) => ({
    placeId: p.place_id,
    name:    p.name,
    address: p.formatted_address,
    types:   p.types ?? [],
  }))

  return NextResponse.json({ results })
}

// ── POST — get Place Details + scrape website ──────────────────────────────

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { placeId } = await req.json()
  if (!placeId) return NextResponse.json({ error: 'placeId required' }, { status: 400 })

  const apiKey = process.env.GOOGLE_PLACES_API_KEY!
  const fields = 'name,website,formatted_phone_number,formatted_address,types,business_status'
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`
  const detailsRes = await fetch(detailsUrl, { next: { revalidate: 0 } })
  const details    = await detailsRes.json()
  const place      = details.result ?? {}

  const website: string | undefined = place.website
  let emails: string[]     = []
  let linkedin: string | undefined
  let facebook: string | undefined
  let scrapedTitle: string | undefined

  // Scrape website if available
  if (website) {
    let origin: string
    try { origin = new URL(website).origin } catch { origin = website }

    // Fetch homepage + common contact/about pages in parallel
    const [home, contact, about] = await Promise.all([
      fetchPage(origin),
      fetchPage(`${origin}/contact`),
      fetchPage(`${origin}/about`),
    ])

    const combined = [home, contact, about].filter(Boolean).join('\n')

    emails = extractEmails(combined)
    const socials = extractSocials(combined, origin)
    linkedin = socials.linkedin
    facebook = socials.facebook

    // Try to get page title
    if (home) {
      scrapedTitle = home.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim()
    }
  }

  return NextResponse.json({
    name:    place.name ?? '',
    website: website ?? '',
    phone:   place.formatted_phone_number ?? '',
    address: place.formatted_address ?? '',
    types:   place.types ?? [],
    emails,
    linkedin,
    facebook,
    scrapedTitle,
  })
}
