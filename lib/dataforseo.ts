// DataForSEO API client — ranked keywords + backlinks

const API_BASE = 'https://api.dataforseo.com/v3'

function auth() {
  const login    = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD
  if (!login || !password) throw new Error('DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD not set')
  return 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64')
}

async function post(path: string, body: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method:  'POST',
    headers: { Authorization: auth(), 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
    signal:  AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(`DataForSEO ${path} HTTP ${res.status}`)
  return res.json()
}

// ── Ranked keywords for a domain ──────────────────────────────────────────

export interface RankedKeyword {
  keyword:         string
  position:        number
  searchVolume:    number
  url:             string
}

export interface RankedKeywordsResult {
  keywords:            RankedKeyword[]    // positions 1-20, sorted by volume desc
  almostRanking:       RankedKeyword[]    // positions 4-20 only
  estimatedMonthly:    number             // sum of vol * CTR for positions 1-3
}

// Approximate CTR curve by position (industry average)
const CTR: Record<number, number> = {
  1: 0.28, 2: 0.15, 3: 0.11, 4: 0.08, 5: 0.07,
  6: 0.06, 7: 0.05, 8: 0.04, 9: 0.03, 10: 0.025,
}
function ctr(pos: number) { return CTR[pos] ?? 0.01 }

export async function getRankedKeywords(domain: string): Promise<RankedKeywordsResult> {
  const clean = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '')
  const data  = await post('/dataforseo_labs/google/ranked_keywords/live', [{
    target:             clean,
    location_code:      2036,   // Australia
    language_code:      'en',
    limit:              100,
    order_by:           ['keyword_data.keyword_info.search_volume,desc'],
    filters:            ['ranked_serp_element.serp_item.rank_absolute', '<=', 20],
  }])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = data?.tasks?.[0]?.result?.[0]?.items ?? []

  const keywords: RankedKeyword[] = items.map(item => ({
    keyword:      item.keyword_data?.keyword ?? '',
    position:     item.ranked_serp_element?.serp_item?.rank_absolute ?? 99,
    searchVolume: item.keyword_data?.keyword_info?.search_volume ?? 0,
    url:          item.ranked_serp_element?.serp_item?.url ?? '',
  })).filter(k => k.keyword && k.searchVolume > 0)

  const almostRanking = keywords.filter(k => k.position >= 4 && k.position <= 20)
    .sort((a, b) => b.searchVolume - a.searchVolume)
    .slice(0, 8)

  const estimatedMonthly = keywords
    .filter(k => k.position <= 3)
    .reduce((sum, k) => sum + Math.round(k.searchVolume * ctr(k.position)), 0)

  return { keywords, almostRanking, estimatedMonthly }
}

// ── SERP check for a single phrase ────────────────────────────────────────

export interface SerpEntry {
  position: number
  url:      string
  title:    string
}

export async function checkSerp(phrase: string): Promise<SerpEntry[]> {
  const data = await post('/serp/google/organic/live/advanced', [{
    keyword:       phrase,
    location_code: 2036,
    language_code: 'en',
    depth:         10,
  }])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = data?.tasks?.[0]?.result?.[0]?.items ?? []
  return items
    .filter(i => i.type === 'organic')
    .slice(0, 10)
    .map(i => ({
      position: i.rank_absolute ?? 0,
      url:      i.url ?? '',
      title:    i.title ?? '',
    }))
}

// ── Backlinks summary ──────────────────────────────────────────────────────

export interface BacklinkSummary {
  referringDomains: number
  backlinks:        number
}

export async function getBacklinkSummary(domain: string): Promise<BacklinkSummary> {
  const clean = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '')
  const data  = await post('/backlinks/domain_pages_summary/live', [{
    target:             clean,
    limit:              1,
    include_subdomains: true,
  }])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = data?.tasks?.[0]?.result?.[0] ?? {}
  return {
    referringDomains: result.referring_domains ?? 0,
    backlinks:        result.backlinks          ?? 0,
  }
}
