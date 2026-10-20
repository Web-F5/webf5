import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function isAdmin(): Promise<boolean> {
  const jar = await cookies()
  return jar.get('admin_session')?.value === process.env.ADMIN_SECRET
}

// ── Helpers ────────────────────────────────────────────────────────────────

function extractEmails(html: string): string[] {
  const found = new Set<string>()
  const mailto = html.matchAll(/mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g)
  for (const m of mailto) found.add(m[1].toLowerCase())
  const plain = html.matchAll(/\b([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})\b/g)
  for (const m of plain) {
    const email = m[1].toLowerCase()
    if (!email.includes('sentry') && !email.includes('example') && !email.includes('schema') &&
        !email.includes('wixpress') && !email.includes('w3.org') && !email.includes('jquery') &&
        !email.includes('.png') && !email.includes('.jpg') && !email.includes('.svg')) {
      found.add(email)
    }
  }
  const generic = ['info@', 'hello@', 'admin@', 'contact@', 'support@', 'enquiries@', 'mail@', 'noreply@', 'no-reply@']
  const sorted = [...found].sort((a, b) => {
    const aGen = generic.some(g => a.startsWith(g)) ? 1 : 0
    const bGen = generic.some(g => b.startsWith(g)) ? 1 : 0
    return aGen - bGen
  })
  return sorted.slice(0, 5)
}

function extractSocials(html: string): { linkedin?: string; facebook?: string } {
  const links = html.matchAll(/href=["']([^"']+)["']/gi)
  let linkedin: string | undefined
  let facebook: string | undefined
  for (const m of links) {
    const href = m[1]
    if (!linkedin && /linkedin\.com\/(in|company)\/[^"'?#\s]+/i.test(href)) {
      linkedin = href.startsWith('http') ? href : `https://linkedin.com${href}`
    }
    if (!facebook && /facebook\.com\/(?!sharer|share|dialog)[^"'?#\s]+/i.test(href)) {
      if (!href.includes('facebook.com/sharer') && !href.includes('facebook.com/dialog')) {
        facebook = href.startsWith('http') ? href : `https://facebook.com${href}`
      }
    }
  }
  return { linkedin, facebook }
}

// ── Contact name extraction ────────────────────────────────────────────────

function extractContactNames(pages: (string | null)[]): string[] {
  const names = new Set<string>()

  for (const html of pages) {
    if (!html) continue

    // 1. JSON-LD Person schema
    const jsonLdBlocks = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
    for (const block of jsonLdBlocks) {
      try {
        const parsed = JSON.parse(block[1])
        const items = Array.isArray(parsed) ? parsed : [parsed]
        for (const item of items) {
          // Top-level Person
          if (item['@type'] === 'Person' && item.name) names.add(item.name.trim())
          // Nested: contactPoint, employee, founder, author
          for (const key of ['employee', 'founder', 'author', 'contactPoint', 'member']) {
            const val = item[key]
            if (!val) continue
            const arr = Array.isArray(val) ? val : [val]
            for (const v of arr) {
              if (v?.name && (v['@type'] === 'Person' || !v['@type'])) names.add(v.name.trim())
            }
          }
        }
      } catch { /* malformed JSON-LD */ }
    }

    // 2. meta author tag
    const author = html.match(/<meta[^>]+name=["']author["'][^>]+content=["']([^"']{2,60})["']/i)?.[1]?.trim()
    if (author && !/\d{4}/.test(author)) names.add(author)

    // 3. vCard / hCard microformat
    const vcard = html.matchAll(/class=["'][^"']*fn[^"']*["'][^>]*>([^<]{2,50})</gi)
    for (const m of vcard) {
      const candidate = m[1].trim()
      if (looksLikeName(candidate)) names.add(candidate)
    }

    // 4. "Meet [Name]" / "Contact [Name]" / "Hi, I'm [Name]" patterns in text
    const meetPatterns = html.matchAll(/(?:Meet|Contact|Hi,?\s+I(?:'|&rsquo;|&#39;)?m|I(?:'|&rsquo;)?m)\s+([A-Z][a-z]{1,20}(?:\s+[A-Z][a-z]{1,20})?)/g)
    for (const m of meetPatterns) {
      const candidate = m[1].trim()
      if (looksLikeName(candidate)) names.add(candidate)
    }

    // 5. About/team page: h2–h4 that look like a person's name (2 words, title case)
    const headings = html.matchAll(/<h[234][^>]*>([^<]{3,50})<\/h[234]>/gi)
    for (const m of headings) {
      const text = m[1].replace(/<[^>]+>/g, '').trim()
      if (looksLikeName(text)) names.add(text)
    }
  }

  return [...names].slice(0, 5)
}

// Rough heuristic: 2–4 words, each capitalised, no digits, no common non-name words
const NON_NAMES = new Set(['About Us', 'Contact Us', 'Our Team', 'Meet The', 'Meet Our', 'Our Staff',
  'Home', 'Services', 'Portfolio', 'Gallery', 'Privacy', 'Terms', 'Get In', 'Find Us'])

function looksLikeName(s: string): boolean {
  if (!s || s.length < 3 || s.length > 50) return false
  if (/\d/.test(s)) return false
  if (NON_NAMES.has(s)) return false
  const words = s.trim().split(/\s+/)
  if (words.length < 2 || words.length > 4) return false
  return words.every(w => /^[A-Z][a-zA-Z'\-]{1,}$/.test(w))
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
  const fields = 'name,website,formatted_phone_number,formatted_address,types,business_status,url'
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`
  const detailsRes = await fetch(detailsUrl, { next: { revalidate: 0 } })
  const details    = await detailsRes.json()
  const place      = details.result ?? {}

  const website: string | undefined  = place.website
  // place.url is the Google Maps URL for this business
  const gbpUrl: string = place.url ?? `https://www.google.com/maps/place/?q=place_id:${placeId}`

  let emails: string[]        = []
  let linkedin: string | undefined
  let facebook: string | undefined
  let scrapedTitle: string | undefined
  let contactNames: string[]  = []

  if (website) {
    let origin: string
    try { origin = new URL(website).origin } catch { origin = website }

    const [home, contact, about, team] = await Promise.all([
      fetchPage(origin),
      fetchPage(`${origin}/contact`),
      fetchPage(`${origin}/about`),
      fetchPage(`${origin}/team`),
    ])

    const pages   = [home, contact, about, team]
    const combined = pages.filter(Boolean).join('\n')

    emails       = extractEmails(combined)
    const socials = extractSocials(combined)
    linkedin     = socials.linkedin
    facebook     = socials.facebook
    contactNames = extractContactNames(pages)

    if (home) {
      scrapedTitle = home.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim()
    }
  }

  return NextResponse.json({
    placeId,
    gbpUrl,
    name:    place.name ?? '',
    website: website ?? '',
    phone:   place.formatted_phone_number ?? '',
    address: place.formatted_address ?? '',
    types:   place.types ?? [],
    emails,
    linkedin,
    facebook,
    scrapedTitle,
    contactNames,
  })
}
