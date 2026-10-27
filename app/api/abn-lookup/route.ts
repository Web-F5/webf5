import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')?.trim()
  if (!name || name.length < 3) return NextResponse.json({ results: [] })

  const guid = process.env.ABN_LOOKUP_GUID
  if (!guid) return NextResponse.json({ results: [] })

  const url = `https://abr.business.gov.au/json/MatchingNames.aspx?name=${encodeURIComponent(name)}&maxResults=5&guid=${guid}`

  try {
    const res = await fetch(url, { next: { revalidate: 300 } })
    const text = await res.text()
    // Response is JSONP: callback({"Names":[...]})  — strip wrapper
    const json = JSON.parse(text.replace(/^\w+\(/, '').replace(/\);?\s*$/, ''))
    const results = (json.Names ?? []).map((n: { Abn: string; Name: string; State: string }) => ({
      abn: n.Abn,
      name: n.Name,
      state: n.State,
    }))
    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
