import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { db, auditLeads } from '@/lib/db'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = 'contact@webf5.au'
const NOTIFY = 'leads@webf5.au'

// ── PageSpeed ──────────────────────────────────────────────────────────────

async function fetchPageSpeed(url: string) {
  const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile`
  const res = await fetch(api, { next: { revalidate: 0 } })
  if (!res.ok) return null
  return res.json()
}

// ── Page content checks ────────────────────────────────────────────────────

async function fetchPageContent(url: string) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebF5AuditBot/1.0)' },
      signal: AbortSignal.timeout(10000),
    })
    return await res.text()
  } catch {
    return null
  }
}

async function checkSitemap(baseUrl: string): Promise<boolean> {
  try {
    const origin = new URL(baseUrl).origin
    const res = await fetch(`${origin}/sitemap.xml`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebF5AuditBot/1.0)' },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return false
    const text = await res.text()
    return text.includes('<urlset') || text.includes('<sitemapindex')
  } catch {
    return false
  }
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
}

function checkContent(html: string) {
  const lower = html.toLowerCase()

  // ── SEO basics ──────────────────────────────────────────────────────────
  const rawTitle   = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? null
  const metaTitle  = rawTitle ? decodeEntities(rawTitle) : null
  const metaDesc   = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() ?? null
  const h1Match    = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? null
  const h1         = h1Match ? decodeEntities(h1Match.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()) || null : null

  const metaTitleLen = metaTitle ? metaTitle.length : null
  const metaDescLen  = metaDesc  ? metaDesc.length  : null

  // ── Images ──────────────────────────────────────────────────────────────
  const imgTags        = html.match(/<img\b[^>]*>/gi) || []
  const imagesTotal    = imgTags.length
  const imagesMissingAlt = imgTags.filter(tag => {
    const m = tag.match(/\balt=["']([^"']*)["']/i)
    return !m || m[1].trim() === ''
  }).length

  // ── Schema ──────────────────────────────────────────────────────────────
  const hasSchema = lower.includes('application/ld+json')

  // ── Technical ───────────────────────────────────────────────────────────
  const hasViewport = lower.includes('name="viewport"') || lower.includes("name='viewport'")
  const hasNoindex  = /content=["'][^"']*noindex[^"']*["']/i.test(html)

  // ── Tracking ────────────────────────────────────────────────────────────
  const hasAnalytics =
    lower.includes('googletagmanager.com') ||
    lower.includes('google-analytics.com') ||
    lower.includes('gtag(') ||
    /['"]G-[A-Z0-9]{4,}['"]/.test(html)

  const hasMetaPixel =
    lower.includes('connect.facebook.net') ||
    lower.includes('fbevents.js') ||
    lower.includes('fbq(')

  const hasGoogleAds =
    lower.includes('googleadservices.com') ||
    /['"]AW-[0-9]+['"]/.test(html)

  // ── Enquiry path ─────────────────────────────────────────────────────────
  const phonePattern = /(\+?61|0)[2-9]\d{8}|(\+?61|0)4\d{8}/
  const emailPattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
  const hasTapToCall  = lower.includes('href="tel:') || lower.includes("href='tel:")
  const hasPhone      = phonePattern.test(html)
  const hasEmail      = emailPattern.test(lower)
  const hasContact    = hasPhone || hasEmail || lower.includes('contact') || lower.includes('get in touch')
  const hasCta        = lower.includes('get a quote') || lower.includes('book') || lower.includes('contact us') ||
                        lower.includes('call us') || lower.includes('free') || lower.includes('get started') ||
                        lower.includes('enquire') || lower.includes('request')

  return {
    metaTitle, metaDesc, h1,
    metaTitleLen, metaDescLen,
    hasPhone, hasEmail, hasContact, hasCta, hasTapToCall,
    hasSchema, hasViewport, hasNoindex,
    hasAnalytics, hasMetaPixel, hasGoogleAds,
    imagesTotal, imagesMissingAlt,
  }
}

// ── Scoring ────────────────────────────────────────────────────────────────

interface CheckSet {
  ssl: boolean
  speedPass: boolean
  hasMetaTitle: boolean
  hasMetaDesc: boolean
  hasH1: boolean
  hasSitemap: boolean
  hasSchema: boolean
  allImagesHaveAlt: boolean
  hasAnalytics: boolean
  hasMetaPixel: boolean
  hasGoogleAds: boolean
  hasTapToCall: boolean
  hasContact: boolean
  hasCta: boolean
}

function computeScore(c: CheckSet): number {
  const values = Object.values(c)
  return Math.round(values.filter(Boolean).length / values.length * 100)
}

function gradeFromScore(score: number): string {
  if (score >= 85) return 'A'
  if (score >= 65) return 'B'
  if (score >= 45) return 'C'
  return 'D'
}

// ── Email templates ────────────────────────────────────────────────────────

function tick(pass: boolean) { return pass ? '✅' : '❌' }

function buildProspectEmail(name: string, biz: string, report: AuditReport): string {
  const { lcp, overallScore, grade, ssl, hasSitemap, content, url } = report
  const speedLabel = lcp < 2.5 ? 'Fast ✅' : lcp < 4 ? 'Acceptable' : `Slow (${lcp.toFixed(1)}s) ❌`
  const gaps: string[] = []
  if (!ssl) gaps.push('switch to HTTPS — browsers show a "Not Secure" warning')
  if (lcp >= 4) gaps.push(`speed up your site — ${lcp.toFixed(1)}s load time loses visitors on mobile`)
  if (!content.hasAnalytics) gaps.push('add Google Analytics — without it you can\'t tell what brings in enquiries')
  if (!content.hasSchema) gaps.push('add structured data (schema) — helps Google show your business in local results')
  if (!hasSitemap) gaps.push('add an XML sitemap — helps Google find every page on your site')
  if (content.imagesMissingAlt > 0) gaps.push(`add alt text to ${content.imagesMissingAlt} image${content.imagesMissingAlt > 1 ? 's' : ''} — required for accessibility and SEO`)

  return `Hi ${name},

Here's your free Website Audit for ${biz}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  OVERALL SCORE: ${overallScore}/100 · GRADE ${grade}
  ${url}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 MOBILE SPEED
${speedLabel}${lcp >= 2.5 ? `\nYour site's main content takes ${lcp.toFixed(1)}s to load on mobile. Most visitors leave after 3 seconds — that's potential customers gone before they see your phone number.` : ''}

🔒 SECURITY & SEARCH BASICS
${tick(ssl)} HTTPS (secure connection)
${tick(!!content.metaTitle)} Page title${content.metaTitleLen ? ` (${content.metaTitleLen} chars)` : ''}
${tick(!!content.metaDesc)} Meta description${content.metaDescLen ? ` (${content.metaDescLen} chars${content.metaDescLen < 120 || content.metaDescLen > 155 ? ' — aim for 120–155' : ''})` : ''}
${tick(!!content.h1)} H1 heading${content.h1 ? `: "${content.h1}"` : ''}
${tick(hasSitemap)} XML sitemap
${tick(content.hasSchema)} Structured data (schema)
${tick(content.imagesTotal === 0 || content.imagesMissingAlt === 0)} Image alt text${content.imagesTotal > 0 ? ` (${content.imagesTotal - content.imagesMissingAlt}/${content.imagesTotal} images described)` : ''}

📊 TRACKING
${tick(content.hasAnalytics)} Google Analytics / Tag Manager
${tick(content.hasMetaPixel)} Meta (Facebook) Pixel
${tick(content.hasGoogleAds)} Google Ads conversion tag

📞 ENQUIRY PATH
${tick(content.hasTapToCall)} Tap-to-call phone link
${tick(content.hasContact)} Contact details on page
${tick(content.hasCta)} Clear call to action

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${gaps.length === 0
  ? `Good news — your site is solid across the basics. There may still be conversion and design improvements worth exploring.`
  : `TOP ${Math.min(gaps.length, 3)} THINGS TO FIX FIRST:\n${gaps.slice(0, 3).map((g, i) => `${i + 1}. ${g.charAt(0).toUpperCase() + g.slice(1)}.`).join('\n')}`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reply to this email or visit webf5.com.au to book a free 15-minute call — no obligation, just practical advice on what to fix first.

Josh Ekberg
Web F5
contact@webf5.au
webf5.com.au
`
}

function buildNotifyEmail(name: string, biz: string, email: string, url: string, industry: string | undefined, frustration: string | undefined, report: AuditReport): string {
  const { lcp, overallScore, grade, ssl, hasSitemap, content } = report
  return `New audit lead — ${biz} (Grade ${grade} · ${overallScore}/100)

Contact:  ${name} <${email}>
Business: ${biz}
Industry: ${industry || '—'}
URL:      ${url}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 Speed: ${lcp.toFixed(1)}s LCP
🔒 HTTPS: ${ssl ? 'Yes' : 'NO'}

SEO: title=${content.metaTitle ? `✓ (${content.metaTitleLen}ch)` : '✗'} | desc=${content.metaDesc ? `✓ (${content.metaDescLen}ch)` : '✗'} | h1=${content.h1 ? '✓' : '✗'} | sitemap=${hasSitemap ? '✓' : '✗'} | schema=${content.hasSchema ? '✓' : '✗'}
Images: ${content.imagesTotal - content.imagesMissingAlt}/${content.imagesTotal} have alt text
Tracking: analytics=${content.hasAnalytics ? '✓' : '✗'} | pixel=${content.hasMetaPixel ? '✓' : '✗'} | gads=${content.hasGoogleAds ? '✓' : '✗'}
Enquiry: tel-link=${content.hasTapToCall ? '✓' : '✗'} | contact=${content.hasContact ? '✓' : '✗'} | cta=${content.hasCta ? '✓' : '✗'}

Frustration: ${frustration || '—'}
`
}

// ── Types ──────────────────────────────────────────────────────────────────

interface AuditReport {
  lcp:          number
  pageSpeedScore: number | null
  grade:        string
  overallScore: number
  ssl:          boolean
  hasSitemap:   boolean
  content: ReturnType<typeof checkContent>
  url:          string
}

// ── Handler ────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, businessName, email, url, industry, biggestFrustration } = body

    if (!name?.trim() || !email?.trim() || !url?.trim()) {
      return NextResponse.json({ error: 'Name, email and URL are required.' }, { status: 400 })
    }

    let normUrl = url.trim()
    if (!/^https?:\/\//i.test(normUrl)) normUrl = 'https://' + normUrl

    const [psData, htmlContent, hasSitemap] = await Promise.all([
      fetchPageSpeed(normUrl),
      fetchPageContent(normUrl),
      checkSitemap(normUrl),
    ])

    const lcp: number = psData?.lighthouseResult?.audits?.['largest-contentful-paint']?.numericValue
      ? psData.lighthouseResult.audits['largest-contentful-paint'].numericValue / 1000
      : 5.0

    const pageSpeedScore: number | null = psData?.lighthouseResult?.categories?.performance?.score != null
      ? Math.round(psData.lighthouseResult.categories.performance.score * 100)
      : null

    const ssl     = normUrl.startsWith('https://')
    const content = htmlContent ? checkContent(htmlContent) : {
      metaTitle: null, metaDesc: null, h1: null,
      metaTitleLen: null, metaDescLen: null,
      hasPhone: false, hasEmail: false, hasContact: false, hasCta: false, hasTapToCall: false,
      hasSchema: false, hasViewport: false, hasNoindex: false,
      hasAnalytics: false, hasMetaPixel: false, hasGoogleAds: false,
      imagesTotal: 0, imagesMissingAlt: 0,
    }

    const checks: CheckSet = {
      ssl,
      speedPass:        lcp < 4,
      hasMetaTitle:     !!content.metaTitle,
      hasMetaDesc:      !!content.metaDesc,
      hasH1:            !!content.h1,
      hasSitemap,
      hasSchema:        content.hasSchema,
      allImagesHaveAlt: content.imagesTotal === 0 || content.imagesMissingAlt === 0,
      hasAnalytics:     content.hasAnalytics,
      hasMetaPixel:     content.hasMetaPixel,
      hasGoogleAds:     content.hasGoogleAds,
      hasTapToCall:     content.hasTapToCall,
      hasContact:       content.hasContact,
      hasCta:           content.hasCta,
    }

    const overallScore = computeScore(checks)
    const grade        = gradeFromScore(overallScore)

    const report: AuditReport = { lcp, pageSpeedScore, grade, overallScore, ssl, hasSitemap, content, url: normUrl }

    await db.insert(auditLeads).values({
      name:               name.trim(),
      businessName:       businessName?.trim() || name.trim(),
      email:              email.trim().toLowerCase(),
      url:                normUrl,
      industry:           industry || null,
      biggestFrustration: biggestFrustration || null,
      report,
    })

    await Promise.all([
      resend.emails.send({
        from:    FROM,
        to:      email.trim(),
        replyTo: 'contact@webf5.au',
        subject: `Your free website audit — ${businessName?.trim() || name.trim()}`,
        text:    buildProspectEmail(name.trim(), businessName?.trim() || name.trim(), report),
      }),
      resend.emails.send({
        from:    FROM,
        to:      NOTIFY,
        subject: `Audit lead — ${businessName?.trim() || name.trim()} (Grade ${grade} · ${overallScore}/100)`,
        text:    buildNotifyEmail(name.trim(), businessName?.trim() || name.trim(), email.trim(), normUrl, industry, biggestFrustration, report),
      }),
    ])

    return NextResponse.json({ success: true, report })

  } catch (err) {
    console.error('Audit error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
