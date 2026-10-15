import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')
  if (!query?.trim()) return NextResponse.json({ results: [] })

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Places API not configured.' }, { status: 503 })

  try {
    // Text Search — biased to Australia, returns up to 5 results
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&region=au&key=${apiKey}`
    const res  = await fetch(url, { next: { revalidate: 0 } })
    const data = await res.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return NextResponse.json({ error: `Places API: ${data.status}` }, { status: 400 })
    }

    const results = (data.results ?? []).slice(0, 5).map((p: { place_id: string; name: string; formatted_address: string }) => ({
      placeId:   p.place_id,
      name:      p.name,
      address:   p.formatted_address,
      reviewUrl: `https://search.google.com/local/writereview?placeid=${p.place_id}`,
    }))

    return NextResponse.json({ results })
  } catch (err) {
    console.error('Places error:', err)
    return NextResponse.json({ error: 'Search failed.' }, { status: 500 })
  }
}
