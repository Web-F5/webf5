import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function isAdmin(): Promise<boolean> {
  const jar = await cookies()
  return jar.get('admin_session')?.value === process.env.ADMIN_SECRET
}

// ── Email / social extraction ──────────────────────────────────────────────

// Decode Cloudflare email obfuscation (data-cfemail attribute)
function decodeCloudflareEmail(encoded: string): string | null {
  try {
    const r = parseInt(encoded.slice(0, 2), 16)
    let email = ''
    for (let n = 2; n < encoded.length; n += 2) {
      email += String.fromCharCode(parseInt(encoded.slice(n, n + 2), 16) ^ r)
    }
    return email.includes('@') ? email : null
  } catch { return null }
}

function extractEmails(html: string): string[] {
  const found = new Set<string>()

  // Cloudflare-obfuscated emails (data-cfemail="...")
  const cfEmails = html.matchAll(/data-cfemail=["']([0-9a-f]+)["']/gi)
  for (const m of cfEmails) {
    const decoded = decodeCloudflareEmail(m[1])
    if (decoded) found.add(decoded.toLowerCase())
  }

  // mailto: links
  const mailto = html.matchAll(/mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g)
  for (const m of mailto) found.add(m[1].toLowerCase())

  // Plain text emails
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
  return [...found]
    .sort((a, b) => {
      const aG = generic.some(g => a.startsWith(g)) ? 1 : 0
      const bG = generic.some(g => b.startsWith(g)) ? 1 : 0
      return aG - bG
    })
    .slice(0, 5)
}

function extractSocials(html: string): { linkedin?: string; facebook?: string } {
  const links = html.matchAll(/href=["']([^"']+)["']/gi)
  let linkedin: string | undefined
  let facebook: string | undefined
  for (const m of links) {
    const href = m[1]
    if (!linkedin && /linkedin\.com\/(in|company)\/[^"'?#\s]+/i.test(href))
      linkedin = href.startsWith('http') ? href : `https://linkedin.com${href}`
    if (!facebook && /facebook\.com\/(?!sharer|share|dialog)[^"'?#\s]+/i.test(href) &&
        !href.includes('facebook.com/sharer') && !href.includes('facebook.com/dialog'))
      facebook = href.startsWith('http') ? href : `https://facebook.com${href}`
  }
  return { linkedin, facebook }
}

// ── Contact name extraction ────────────────────────────────────────────────

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

function extractBusinessDescription(pages: (string | null)[]): string {
  const candidates: string[] = []

  for (const html of pages) {
    if (!html) continue

    // Meta description
    const meta = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{30,300})["']/i)?.[1]?.trim()
      ?? html.match(/<meta[^>]+content=["']([^"']{30,300})["'][^>]+name=["']description["']/i)?.[1]?.trim()
    if (meta) candidates.push(meta)

    // JSON-LD description
    const jsonLdBlocks = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
    for (const block of jsonLdBlocks) {
      try {
        const parsed = JSON.parse(block[1])
        const items = Array.isArray(parsed) ? parsed : [parsed]
        for (const item of items) {
          if (item.description && typeof item.description === 'string' && item.description.length > 30)
            candidates.push(item.description.trim())
        }
      } catch { /* skip */ }
    }

    // First meaningful <p> tag (30–400 chars, no HTML inside)
    for (const m of html.matchAll(/<p[^>]*>([^<]{30,400})<\/p>/gi)) {
      const text = m[1].trim()
      if (text.length >= 30) { candidates.push(text); break }
    }

    if (candidates.length >= 2) break
  }

  // Deduplicate and return best 1–2
  const seen = new Set<string>()
  const out: string[] = []
  for (const c of candidates) {
    const key = c.slice(0, 60).toLowerCase()
    if (!seen.has(key)) { seen.add(key); out.push(c) }
    if (out.length === 2) break
  }
  return out.join('\n\n')
}

function extractContactNames(pages: (string | null)[]): string[] {
  const names = new Set<string>()
  for (const html of pages) {
    if (!html) continue
    const jsonLdBlocks = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
    for (const block of jsonLdBlocks) {
      try {
        const parsed = JSON.parse(block[1])
        const items = Array.isArray(parsed) ? parsed : [parsed]
        for (const item of items) {
          if (item['@type'] === 'Person' && item.name) names.add(item.name.trim())
          for (const key of ['employee', 'founder', 'author', 'contactPoint', 'member']) {
            const val = item[key]
            if (!val) continue
            for (const v of Array.isArray(val) ? val : [val])
              if (v?.name && (v['@type'] === 'Person' || !v['@type'])) names.add(v.name.trim())
          }
        }
      } catch { /* malformed JSON-LD */ }
    }
    const author = html.match(/<meta[^>]+name=["']author["'][^>]+content=["']([^"']{2,60})["']/i)?.[1]?.trim()
    if (author && !/\d{4}/.test(author)) names.add(author)
    for (const m of html.matchAll(/class=["'][^"']*fn[^"']*["'][^>]*>([^<]{2,50})</gi)) {
      const c = m[1].trim(); if (looksLikeName(c)) names.add(c)
    }
    for (const m of html.matchAll(/(?:Meet|Contact|Hi,?\s+I(?:'|&rsquo;|&#39;)?m|I(?:'|&rsquo;)?m)\s+([A-Z][a-z]{1,20}(?:\s+[A-Z][a-z]{1,20})?)/g)) {
      const c = m[1].trim(); if (looksLikeName(c)) names.add(c)
    }
    for (const m of html.matchAll(/<h[234][^>]*>([^<]{3,50})<\/h[234]>/gi)) {
      const text = m[1].replace(/<[^>]+>/g, '').trim()
      if (looksLikeName(text)) names.add(text)
    }
  }
  return [...names].slice(0, 5)
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

// Fetch just enough place details to check for website presence (New API)
async function fetchPlaceWebsite(placeId: string, apiKey: string): Promise<string | null> {
  try {
    const res  = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: { 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': 'websiteUri' },
      next: { revalidate: 0 },
    })
    const data = await res.json()
    return data.websiteUri ?? null
  } catch { return null }
}

// ── GET — search Google Places with filters ────────────────────────────────

export async function GET(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const query      = req.nextUrl.searchParams.get('q')
  const websiteFilter = req.nextUrl.searchParams.get('website') // 'any' | 'with' | 'without'
  const minReviews = parseInt(req.nextUrl.searchParams.get('minReviews') ?? '0', 10)
  const maxReviews = parseInt(req.nextUrl.searchParams.get('maxReviews') ?? '999999', 10)

  if (!query?.trim()) return NextResponse.json({ results: [] })

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Places API not configured.' }, { status: 503 })

  // Accept a pagetoken for manual "Next 20" pagination driven by the client
  const pagetoken = req.nextUrl.searchParams.get('pagetoken')

  // ── Places API (New) — Text Search ────────────────────────────────────────
  // Uses POST /v1/places:searchText which returns up to 20 results per page
  // and handles location as bias (not a hard filter), matching Maps behaviour.
  type NewPlace = {
    id: string
    displayName?: { text: string }
    formattedAddress?: string
    rating?: number
    userRatingCount?: number
    types?: string[]
    primaryType?: string
  }

  const searchPayload: Record<string, unknown> = {
    textQuery:      query,
    maxResultCount: 20,
    languageCode:   'en',
    regionCode:     'AU',
  }
  if (pagetoken) searchPayload.pageToken = pagetoken

  const searchRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type':    'application/json',
      'X-Goog-Api-Key':  apiKey,
      'X-Goog-FieldMask': [
        'places.id', 'places.displayName', 'places.formattedAddress',
        'places.rating', 'places.userRatingCount', 'places.types',
        'places.primaryType', 'nextPageToken',
      ].join(','),
    },
    body: JSON.stringify(searchPayload),
    next: { revalidate: 0 },
  })

  const searchData = await searchRes.json()
  if (searchData.error) {
    return NextResponse.json({ error: `Places API: ${searchData.error.message}` }, { status: 400 })
  }

  const raw: NewPlace[] = searchData.places ?? []
  const nextPageToken: string | null = searchData.nextPageToken ?? null

  // Review count filter
  const reviewFiltered = raw.filter(p => {
    const cnt = p.userRatingCount ?? 0
    return cnt >= minReviews && cnt <= maxReviews
  })

  // Website filter (extra Details call per candidate)
  let results: { placeId: string; name: string; address: string; types: string[]; rating: number | null; reviewCount: number; hasWebsite: boolean }[]

  if (websiteFilter === 'with' || websiteFilter === 'without') {
    const websiteChecks = await Promise.all(reviewFiltered.map(p => fetchPlaceWebsite(p.id, apiKey)))
    results = reviewFiltered
      .map((p, i) => ({
        placeId:     p.id,
        name:        p.displayName?.text ?? '',
        address:     p.formattedAddress ?? '',
        types:       p.types ?? [],
        rating:      p.rating ?? null,
        reviewCount: p.userRatingCount ?? 0,
        hasWebsite:  !!websiteChecks[i],
      }))
      .filter(p => websiteFilter === 'with' ? p.hasWebsite : !p.hasWebsite)
  } else {
    results = reviewFiltered.map(p => ({
      placeId:     p.id,
      name:        p.displayName?.text ?? '',
      address:     p.formattedAddress ?? '',
      types:       p.types ?? [],
      rating:      p.rating ?? null,
      reviewCount: p.userRatingCount ?? 0,
      hasWebsite:  true,
    }))
  }

  return NextResponse.json({
    results,
    nextPageToken,
    batchTotal:  raw.length,
    batchPassed: results.length,
  })
}

// ── POST — get Place Details + scrape website ──────────────────────────────

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { placeId } = await req.json()
  if (!placeId) return NextResponse.json({ error: 'placeId required' }, { status: 400 })

  const apiKey     = process.env.GOOGLE_PLACES_API_KEY!

  // Places API (New) — Place Details
  const detailsRes = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key':   apiKey,
      'X-Goog-FieldMask': [
        'displayName', 'websiteUri', 'internationalPhoneNumber',
        'formattedAddress', 'types', 'businessStatus',
        'googleMapsUri', 'rating', 'userRatingCount',
      ].join(','),
    },
    next: { revalidate: 0 },
  })
  const place = await detailsRes.json()

  const website: string | undefined = place.websiteUri
  const gbpUrl: string = place.googleMapsUri ?? `https://www.google.com/maps/place/?q=place_id:${placeId}`

  let emails: string[]       = []
  let linkedin: string | undefined
  let facebook: string | undefined
  let scrapedTitle: string | undefined
  let contactNames: string[] = []
  let description:  string   = ''

  if (website) {
    let origin: string
    try { origin = new URL(website).origin } catch { origin = website }

    // Fetch the exact GBP URL (may be a store/location subpage) + common pages
    const specificPage = website !== origin ? fetchPage(website) : Promise.resolve(null)
    const [home, contact, about, team, specific] = await Promise.all([
      fetchPage(origin),
      fetchPage(`${origin}/contact`),
      fetchPage(`${origin}/about`),
      fetchPage(`${origin}/team`),
      specificPage,
    ])

    const pages    = [specific, home, contact, about, team]
    const combined = pages.filter(Boolean).join('\n')

    emails       = extractEmails(combined)
    const socials = extractSocials(combined)
    linkedin     = socials.linkedin
    facebook     = socials.facebook
    contactNames = extractContactNames(pages)
    description  = extractBusinessDescription(pages)
    if (home) scrapedTitle = home.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim()
  }

  return NextResponse.json({
    placeId,
    gbpUrl,
    name:        place.displayName?.text ?? '',
    website:     website ?? '',
    phone:       place.internationalPhoneNumber ?? '',
    address:     place.formattedAddress ?? '',
    types:       place.types ?? [],
    rating:      place.rating ?? null,
    reviewCount: place.userRatingCount ?? 0,
    emails,
    linkedin,
    facebook,
    scrapedTitle,
    contactNames,
    description,
  })
}
