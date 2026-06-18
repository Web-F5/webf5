import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const ADMIN_PLACES = new Set([
  'country', 'state', 'state_district', 'region',
  'county', 'district', 'island', 'archipelago',
])

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/cgi/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat')
  const lng  = req.nextUrl.searchParams.get('lng')
  const km   = req.nextUrl.searchParams.get('km')

  if (!lat || !lng || !km) {
    return NextResponse.json({ towns: [], debug: 'missing params' })
  }

  const radiusM = Math.min(parseFloat(km) * 1000, 300_000)
  const query   = `[out:json][timeout:25];node["place"]["name"](around:${radiusM},${lat},${lng});out tags;`

  const attempts: string[] = []

  for (const endpoint of ENDPOINTS) {
    const controller = new AbortController()
    const timer      = setTimeout(() => controller.abort(), 26_000)

    try {
      const res = await fetch(endpoint, {
        method:  'POST',
        body:    query,
        headers: { 'Content-Type': 'text/plain' },
        signal:  controller.signal,
        cache:   'no-store',
      })
      clearTimeout(timer)

      const body = await res.text()

      if (!res.ok) {
        attempts.push(`${endpoint} → HTTP ${res.status}: ${body.slice(0, 120)}`)
        continue
      }

      let json: { elements?: Array<{ tags?: { name?: string; place?: string } }> }
      try {
        json = JSON.parse(body)
      } catch {
        attempts.push(`${endpoint} → JSON parse failed. Body: ${body.slice(0, 120)}`)
        continue
      }

      const elements = json?.elements
      if (!elements?.length) {
        attempts.push(`${endpoint} → OK but 0 elements returned`)
        continue
      }

      const towns: string[] = Array.from(
        new Set<string>(
          elements
            .filter(e => e.tags?.name && !ADMIN_PLACES.has(e.tags.place ?? ''))
            .map(e => e.tags!.name!)
        )
      ).sort()

      return NextResponse.json({
        towns,
        debug: { endpoint, rawCount: elements.length, filteredCount: towns.length },
      })
    } catch (err) {
      clearTimeout(timer)
      attempts.push(`${endpoint} → fetch threw: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return NextResponse.json({ towns: [], debug: { failed: true, attempts } })
}
