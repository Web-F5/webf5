import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat')
  const lng = req.nextUrl.searchParams.get('lng')
  const km  = req.nextUrl.searchParams.get('km')

  if (!lat || !lng || !km) return NextResponse.json([])

  const radiusM = Math.min(parseFloat(km) * 1000, 300_000) // cap at 300 km

  const query = `[out:json][timeout:20];(node["place"~"^(city|town|village|suburb|hamlet)$"]["name"](around:${radiusM},${lat},${lng}););out body;`

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'text/plain' },
    })
    if (!res.ok) return NextResponse.json([])
    const data = await res.json()

    const towns: string[] = Array.from(
      new Set<string>(
        (data.elements as Array<{ tags?: { name?: string } }>)
          .map(e => e.tags?.name ?? '')
          .filter(Boolean)
      )
    ).sort()

    return NextResponse.json(towns)
  } catch {
    return NextResponse.json([])
  }
}
