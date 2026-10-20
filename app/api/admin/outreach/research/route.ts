import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db, outreachProspects } from '@/lib/db'
import { eq } from 'drizzle-orm'

// ── Auth check ─────────────────────────────────────────────────────────────

async function isAdmin(): Promise<boolean> {
  const jar = await cookies()
  return jar.get('admin_session')?.value === process.env.ADMIN_SECRET
}

// ── PageSpeed helpers (same as send-tools route) ───────────────────────────

async function fetchPageSpeedBoth(url: string) {
  const key  = process.env.PAGESPEED_API_KEY ? `&key=${process.env.PAGESPEED_API_KEY}` : ''
  const cats = 'category=performance&category=accessibility&category=best-practices&category=seo'
  const base = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&${cats}`
  const doFetch = (strategy: string) =>
    fetch(`${base}&strategy=${strategy}${key}`, { next: { revalidate: 0 } })
      .then(r => r.ok ? r.json() : null).catch(() => null)
  const [mobile, desktop] = await Promise.allSettled([doFetch('mobile'), doFetch('desktop')])
  return {
    mobile:  mobile.status  === 'fulfilled' ? mobile.value  : null,
    desktop: desktop.status === 'fulfilled' ? desktop.value : null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractMetrics(psData: any) {
  if (!psData) return null
  const lr    = psData.lighthouseResult
  const audits = lr?.audits
  const cats   = lr?.categories
  if (!audits) return null
  return {
    score:         cats?.performance?.score    != null ? Math.round(cats.performance.score * 100)    : null,
    seo:           cats?.seo?.score            != null ? Math.round(cats.seo.score * 100)            : null,
    accessibility: cats?.accessibility?.score  != null ? Math.round(cats.accessibility.score * 100)  : null,
    bestPractices: cats?.['best-practices']?.score != null ? Math.round(cats['best-practices'].score * 100) : null,
    lcp: audits['largest-contentful-paint']?.numericValue != null ? audits['largest-contentful-paint'].numericValue / 1000 : null,
    cls: audits['cumulative-layout-shift']?.numericValue ?? null,
    tbt: audits['total-blocking-time']?.numericValue ?? null,
    pageWeightKb: audits['total-byte-weight']?.numericValue != null ? Math.round(audits['total-byte-weight'].numericValue / 1024) : null,
    // Collect top opportunities
    opportunities: Object.values(audits)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((a: any) => a.details?.type === 'opportunity' && a.score != null && a.score < 0.9)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((a: any) => ({ id: a.id, title: a.title, score: a.score }))
      .slice(0, 5),
  }
}

function decodeEntities(str: string) {
  return str.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ')
}

function scrapeHomepage(html: string) {
  const strip = (s: string) => s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()
  const title     = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? null
  const metaDesc  = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() ?? null
  const h1Raw     = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? null
  const h1        = h1Raw ? decodeEntities(strip(h1Raw)) || null : null

  // Extract first few paragraphs of visible text
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html
  const cleaned   = bodyMatch
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
  const visibleText = decodeEntities(strip(cleaned)).slice(0, 1200)

  // Check for mobile viewport
  const hasMobileViewport = /<meta[^>]+name=["']viewport["']/i.test(html)
  const hasSSL = true // we can infer from URL
  const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(html)

  return { title, metaDesc, h1, visibleText, hasMobileViewport, hasSSL, hasCanonical }
}

function computeGrade(score: number | null): string {
  if (score == null) return '?'
  if (score >= 90) return 'A'
  if (score >= 70) return 'B'
  if (score >= 50) return 'C'
  return 'D'
}

// ── Website age lookup ─────────────────────────────────────────────────────

async function lookupDomainAge(url: string): Promise<{ registeredAt: string | null; firstArchived: string | null }> {
  let domain: string
  try {
    domain = new URL(url).hostname.replace(/^www\./, '')
  } catch { return { registeredAt: null, firstArchived: null } }

  // RDAP — standardised domain registration data, no API key needed
  let registeredAt: string | null = null
  try {
    const rdap = await fetch(`https://rdap.org/domain/${domain}`, { signal: AbortSignal.timeout(6000) })
    if (rdap.ok) {
      const data = await rdap.json()
      const regEvent = (data.events ?? []).find((e: { eventAction: string; eventDate: string }) =>
        e.eventAction === 'registration'
      )
      if (regEvent?.eventDate) registeredAt = regEvent.eventDate
    }
  } catch { /* RDAP unavailable */ }

  // Wayback Machine CDX — earliest snapshot date, no API key needed
  let firstArchived: string | null = null
  try {
    const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(domain)}&output=json&limit=1&fl=timestamp&from=19960101&fastLatest=false`
    const cdx = await fetch(cdxUrl, { signal: AbortSignal.timeout(8000) })
    if (cdx.ok) {
      const rows: string[][] = await cdx.json()
      // rows[0] is the header ["timestamp"], rows[1] is the first result
      if (rows.length >= 2 && rows[1][0]) {
        const ts = rows[1][0] // e.g. "20050312143022"
        const y = ts.slice(0, 4), mo = ts.slice(4, 6), d = ts.slice(6, 8)
        firstArchived = `${y}-${mo}-${d}`
      }
    }
  } catch { /* Wayback unavailable */ }

  return { registeredAt, firstArchived }
}

// ── POST — run research on a prospect's website ────────────────────────────

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { prospectId, url } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  let normalizedUrl = url.trim()
  if (!/^https?:\/\//i.test(normalizedUrl)) normalizedUrl = `https://${normalizedUrl}`

  // Run PageSpeed + homepage fetch + domain age in parallel
  const [psResults, homepageRes, domainAge] = await Promise.allSettled([
    fetchPageSpeedBoth(normalizedUrl),
    fetch(normalizedUrl, { signal: AbortSignal.timeout(10000), headers: { 'User-Agent': 'Mozilla/5.0' } })
      .then(r => r.ok ? r.text() : null).catch(() => null),
    lookupDomainAge(normalizedUrl),
  ])

  const ps        = psResults.status   === 'fulfilled' ? psResults.value   : { mobile: null, desktop: null }
  const homepage  = homepageRes.status === 'fulfilled' ? homepageRes.value : null
  const ageData   = domainAge.status   === 'fulfilled' ? domainAge.value   : { registeredAt: null, firstArchived: null }

  const mobileMetrics  = extractMetrics(ps.mobile)
  const desktopMetrics = extractMetrics(ps.desktop)
  const scraped        = homepage ? scrapeHomepage(homepage) : null

  const perfScore = mobileMetrics?.score ?? desktopMetrics?.score ?? null
  const seoScore  = mobileMetrics?.seo   ?? desktopMetrics?.seo   ?? null

  const researchData = {
    url: normalizedUrl,
    researchedAt: new Date().toISOString(),
    scraped,
    mobile:  mobileMetrics,
    desktop: desktopMetrics,
    grade: computeGrade(perfScore),
    perfScore,
    seoScore,
    domainAge: ageData,
  }

  // Persist if prospectId given
  if (prospectId) {
    await db.update(outreachProspects)
      .set({ researchData, updatedAt: new Date() })
      .where(eq(outreachProspects.id, prospectId))
  }

  return NextResponse.json(researchData)
}
