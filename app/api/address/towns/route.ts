import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Admin-level place types we don't want cluttering the service-area list
const ADMIN_PLACES = new Set([
  'country', 'state', 'state_district', 'region',
  'county', 'district', 'island', 'archipelago',
])

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat')
  const lng = req.nextUrl.searchParams.get('lng')
  const km  = req.nextUrl.searchParams.get('km')

  if (!lat || !lng || !km) return NextResponse.json([])

  const radiusM = Math.min(parseFloat(km) * 1000, 300_000) // hard cap at 300 km

  // Query all named place nodes — broad net, filter admin areas server-side.
  // Australian OSM data uses city/town/village/suburb/locality/hamlet/neighbourhood.
  // Using `out tags` (no geometry) keeps the response small.
  const query = `[out:json][timeout:25];node["place"]["name"](around:${radiusM},${lat},${lng});out tags;`

  // Try primary, then a public mirror
  const ENDPOINTS = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ]

  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: query,
        headers: { 'Content-Type': 'text/plain' },
        signal: AbortSignal.timeout(28_000),
      })

      if (!res.ok) continue

      const json = await res.json()
      const elements = json?.elements as Array<{ tags?: { name?: string; place?: string } }> | undefined
      if (!elements?.length) continue

      const towns: string[] = Array.from(
        new Set<string>(
          elements
            .filter(e => e.tags?.name && !ADMIN_PLACES.has(e.tags.place ?? ''))
            .map(e => e.tags!.name!)
        )
      ).sort()

      return NextResponse.json(towns)
    } catch {
      // Try next endpoint
    }
  }

  return NextResponse.json([])
}
