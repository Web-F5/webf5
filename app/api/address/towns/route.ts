import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const ADMIN_PLACES = new Set([
  'country', 'state', 'state_district', 'region',
  'county', 'district', 'island', 'archipelago',
])

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat')
  const lng  = req.nextUrl.searchParams.get('lng')
  const km   = req.nextUrl.searchParams.get('km')

  if (!lat || !lng || !km) return NextResponse.json({ towns: [], debug: 'missing params' })

  const radiusM = Math.min(parseFloat(km) * 1000, 300_000)

  // Broad query — all named place nodes. Filter admin levels server-side.
  const query = `[out:json][timeout:25];node["place"]["name"](around:${radiusM},${lat},${lng});out tags;`

  const errors: string[] = []

  for (const endpoint of ENDPOINTS) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 26_000)

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: query,
        headers: { 'Content-Type': 'text/plain' },
        signal: controller.signal,
        cache: 'no-store',
      })

      clearTimeout(timer)

      if (!res.ok) {
        errors.push(`${endpoint}: HTTP ${res.status}`)
        continue
      }

      const json = await res.json()
      const elements = json?.elements as Array<{ tags?: { name?: string; place?: string } }> | undefined

      if (!elements) {
        errors.push(`${endpoint}: no elements field in response`)
        continue
      }

      const towns: string[] = Array.from(
        new Set<string>(
          elements
            .filter(e => e.tags?.name && !ADMIN_PLACES.has(e.tags.place ?? ''))
            .map(e => e.tags!.name!)
        )
      ).sort()

      // Return towns + debug info so we can see what's happening
      return NextResponse.json({ towns, debug: { endpoint, total: elements.length, filtered: towns.length } })
    } catch (err) {
      clearTimeout(timer)
      errors.push(`${endpoint}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return NextResponse.json({ towns: [], debug: { errors } })
}
