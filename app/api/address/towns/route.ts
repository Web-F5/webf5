import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Included: named settlements a business would actually service
// Excluded: suburb/neighbourhood (urban sub-areas of existing cities)
const INCLUDE_TYPES = new Set([
  'city', 'town', 'village', 'hamlet', 'locality',
])

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/cgi/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R    = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a    = Math.sin(dLat / 2) ** 2 +
               Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
               Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat')
  const lng  = req.nextUrl.searchParams.get('lng')
  const km   = req.nextUrl.searchParams.get('km')

  if (!lat || !lng || !km) return NextResponse.json([])

  const radiusM  = Math.min(parseFloat(km) * 1000, 300_000)
  const originLat = parseFloat(lat)
  const originLng = parseFloat(lng)

  // Use 'out body' (not 'out tags') so we get lat/lon for distance sorting
  const query = `[out:json][timeout:25];node["place"]["name"](around:${radiusM},${lat},${lng});out body;`

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

      if (!res.ok) continue

      const body = await res.text()
      let json: { elements?: Array<{ lat?: number; lon?: number; tags?: { name?: string; place?: string } }> }
      try { json = JSON.parse(body) } catch { continue }

      const elements = json?.elements
      if (!elements?.length) continue

      const towns = elements
        .filter(e => e.tags?.name && INCLUDE_TYPES.has(e.tags.place ?? '') && e.lat != null && e.lon != null)
        .map(e => ({
          name: e.tags!.name!,
          dist: haversineKm(originLat, originLng, e.lat!, e.lon!),
        }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 30)
        .map(t => t.name)

      return NextResponse.json(towns)
    } catch {
      clearTimeout(timer)
    }
  }

  return NextResponse.json([])
}
