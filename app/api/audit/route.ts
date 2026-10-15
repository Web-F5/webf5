import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { db, auditLeads } from '@/lib/db'
import { generateAuditPdf } from '@/lib/audit-pdf'
import { buildAuditEmailHtml } from '@/lib/audit-email'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = 'contact@webf5.au'
const NOTIFY = 'leads@webf5.au'

// ── PageSpeed (mobile + desktop in parallel) ───────────────────────────────

async function fetchPageSpeedBoth(url: string) {
  const key  = process.env.PAGESPEED_API_KEY ? `&key=${process.env.PAGESPEED_API_KEY}` : ''
  const base = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}`
  const doFetch = (strategy: string) =>
    fetch(`${base}&strategy=${strategy}${key}`, { next: { revalidate: 0 } })
      .then(r => { if (!r.ok) { console.warn(`PageSpeed ${strategy} HTTP ${r.status}`); return null } return r.json() })
      .catch(e => { console.warn(`PageSpeed ${strategy} error:`, e); return null })
  const [mobile, desktop] = await Promise.allSettled([doFetch('mobile'), doFetch('desktop')])
  return {
    mobile:  mobile.status  === 'fulfilled' ? mobile.value  : null,
    desktop: desktop.status === 'fulfilled' ? desktop.value : null,
  }
}

function extractMetrics(psData: unknown) {
  if (!psData) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lr     = (psData as any).lighthouseResult
  const audits = lr?.audits
  const cats   = lr?.categories
  if (!audits) return null
  return {
    score:          cats?.performance?.score != null    ? Math.round(cats.performance.score * 100)          : null,
    lcp:            audits['largest-contentful-paint']?.numericValue != null ? audits['largest-contentful-paint'].numericValue / 1000 : null,
    cls:            audits['cumulative-layout-shift']?.numericValue  ?? null,
    fcp:            audits['first-contentful-paint']?.numericValue   != null ? audits['first-contentful-paint'].numericValue / 1000   : null,
    tbt:            audits['total-blocking-time']?.numericValue      ?? null,
    pageWeightKb:   audits['total-byte-weight']?.numericValue        != null ? Math.round(audits['total-byte-weight'].numericValue / 1024) : null,
    accessibility:  cats?.accessibility?.score          != null ? Math.round(cats.accessibility.score * 100)          : null,
    bestPractices:  cats?.['best-practices']?.score     != null ? Math.round(cats['best-practices'].score * 100)      : null,
  }
}

// ── URL existence checks ───────────────────────────────────────────────────

async function checkUrlExists(baseUrl: string, path: string): Promise<boolean> {
  try {
    const origin = new URL(baseUrl).origin
    const res = await fetch(`${origin}${path}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebF5AuditBot/1.0)' },
      signal: AbortSignal.timeout(6000),
    })
    return res.ok
  } catch {
    return false
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

// ── Page content fetch ─────────────────────────────────────────────────────

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

  // ── Technical SEO ────────────────────────────────────────────────────────
  const hasCanonical  = /<link[^>]+rel=["']canonical["']/i.test(html)
  const hasFavicon    = /<link[^>]+rel=["'][^"']*(?:icon|apple-touch-icon)[^"']*["']/i.test(html)
  const hasLang       = /<html[^>]+lang=["'][a-z]/i.test(html)

  // ── Images ──────────────────────────────────────────────────────────────
  const imgTags          = html.match(/<img\b[^>]*>/gi) || []
  const imagesTotal      = imgTags.length
  const imagesMissingAlt = imgTags.filter(tag => {
    const m = tag.match(/\balt=["']([^"']*)["']/i)
    return !m || m[1].trim() === ''
  }).length

  // ── Schema ──────────────────────────────────────────────────────────────
  const hasSchema = lower.includes('application/ld+json')

  // ── Social / OG ─────────────────────────────────────────────────────────
  const hasOpenGraph  = /<meta[^>]+property=["']og:/i.test(html)
  const hasTwitterCard = /<meta[^>]+name=["']twitter:/i.test(html)

  // ── Links ───────────────────────────────────────────────────────────────
  const linkCount = (html.match(/<a\s/gi) || []).length

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
  const hasTapToCall  = lower.includes('href="tel:') || lower.includes("href='tel:")
  const hasPhone      = /(\+?61|0)[2-9]\d{8}|(\+?61|0)4\d{8}/.test(html)
  const hasEmail      = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(lower)
  const hasContact    = hasPhone || hasEmail || lower.includes('contact') || lower.includes('get in touch')
  const hasCta        = lower.includes('get a quote') || lower.includes('book') || lower.includes('contact us') ||
                        lower.includes('call us') || lower.includes('free') || lower.includes('get started') ||
                        lower.includes('enquire') || lower.includes('request')

  return {
    metaTitle, metaDesc, h1,
    metaTitleLen, metaDescLen,
    hasCanonical, hasFavicon, hasLang,
    hasPhone, hasEmail, hasContact, hasCta, hasTapToCall,
    hasSchema, hasViewport, hasNoindex,
    hasOpenGraph, hasTwitterCard,
    hasAnalytics, hasMetaPixel, hasGoogleAds,
    imagesTotal, imagesMissingAlt,
    linkCount,
  }
}

// ── Scoring ────────────────────────────────────────────────────────────────

interface CheckSet {
  ssl:              boolean
  speedPass:        boolean   // mobile LCP < 4s
  desktopSpeedPass: boolean   // desktop PageSpeed score ≥ 80
  hasMetaTitle:     boolean
  hasMetaDesc:      boolean
  hasH1:            boolean
  hasCanonical:     boolean
  hasSitemap:       boolean
  hasRobotsTxt:     boolean
  hasSchema:        boolean
  allImagesHaveAlt: boolean
  hasOpenGraph:     boolean
  hasTwitterCard:   boolean
  hasAnalytics:     boolean
  hasMetaPixel:     boolean
  hasGoogleAds:     boolean
  accessibilityPass: boolean  // Lighthouse accessibility ≥ 80
  hasTapToCall:     boolean
  hasContact:       boolean
  hasCta:           boolean
}

function computeScore(c: CheckSet): number {
  const values = Object.values(c)
  return Math.round(values.filter(Boolean).length / values.length * 100)
}

function computeSubScores(c: CheckSet, content: ReturnType<typeof checkContent>, bestPracticesPass: boolean, pageWeightPass: boolean) {
  const onPageChecks    = [c.hasMetaTitle, c.hasMetaDesc, c.hasH1, c.hasCanonical, c.hasSchema, c.allImagesHaveAlt, c.hasRobotsTxt, c.hasSitemap, content.hasFavicon, content.hasLang]
  const performChecks   = [c.ssl, c.speedPass, c.desktopSpeedPass, pageWeightPass]
  const usabilityChecks = [content.hasViewport, c.hasTapToCall, c.accessibilityPass, bestPracticesPass]
  const socialChecks    = [c.hasOpenGraph, c.hasTwitterCard, c.hasMetaPixel]

  const pct = (arr: boolean[]) => Math.round(arr.filter(Boolean).length / arr.length * 100)
  return {
    onPage:      pct(onPageChecks),
    performance: pct(performChecks),
    usability:   pct(usabilityChecks),
    social:      pct(socialChecks),
  }
}

function gradeFromScore(score: number): string {
  if (score >= 85) return 'A'
  if (score >= 65) return 'B'
  if (score >= 45) return 'C'
  return 'D'
}

// ── Types ──────────────────────────────────────────────────────────────────

interface AuditReport {
  lcp:            number
  pageSpeedScore: number | null
  desktopScore:   number | null
  mobileCls:      number | null
  mobileFcp:      number | null
  mobileTbt:      number | null
  desktopLcp:     number | null
  desktopCls:     number | null
  desktopFcp:     number | null
  desktopTbt:     number | null
  pageWeightKb:   number | null
  lighthouseAccessibility: number | null
  lighthouseBestPractices: number | null
  grade:          string
  overallScore:   number
  subScores: {
    onPage:      number
    performance: number
    usability:   number
    social:      number
  }
  ssl:          boolean
  hasSitemap:   boolean
  hasRobotsTxt: boolean
  hasLlmsTxt:   boolean
  content:      ReturnType<typeof checkContent>
  url:          string
}

// ── Plain-text email helpers ───────────────────────────────────────────────

function tick(pass: boolean) { return pass ? '✅' : '❌' }

function buildProspectEmail(name: string, biz: string, report: AuditReport): string {
  const { lcp, pageSpeedScore, desktopScore, overallScore, grade, ssl, hasSitemap, hasRobotsTxt, content, url, subScores, mobileCls, mobileFcp } = report
  const speedLabel = lcp < 2.5 ? 'Fast ✅' : lcp < 4 ? 'Acceptable' : `Slow (${lcp.toFixed(1)}s) ❌`
  const gaps: string[] = []
  if (!ssl) gaps.push('switch to HTTPS — browsers show a "Not Secure" warning')
  if (lcp >= 4) gaps.push(`speed up your site — ${lcp.toFixed(1)}s load time loses visitors on mobile`)
  if (!content.hasAnalytics) gaps.push('add Google Analytics — without it you can\'t tell what brings in enquiries')
  if (!content.hasSchema) gaps.push('add structured data (schema) — helps Google show your business in local results')
  if (!hasSitemap) gaps.push('add an XML sitemap — helps Google find every page on your site')
  if (!content.hasCanonical) gaps.push('add a canonical tag — prevents duplicate-content issues in Google')
  if (!hasRobotsTxt) gaps.push('add a robots.txt file — helps search engines crawl your site correctly')
  if (!content.hasOpenGraph) gaps.push('add Open Graph tags — controls how your site looks when shared on social media')
  if (content.imagesMissingAlt > 0) gaps.push(`add alt text to ${content.imagesMissingAlt} image${content.imagesMissingAlt > 1 ? 's' : ''} — required for accessibility and SEO`)

  return `Hi ${name},

Here's your free Website Audit for ${biz}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  OVERALL SCORE: ${overallScore}/100 · GRADE ${grade}
  ${url}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  On-Page SEO: ${subScores.onPage}/100
  Performance: ${subScores.performance}/100
  Usability:   ${subScores.usability}/100
  Social:      ${subScores.social}/100

📱 MOBILE SPEED
${speedLabel}${lcp >= 2.5 ? `\nYour site's main content takes ${lcp.toFixed(1)}s to load on mobile. Most visitors leave after 3 seconds.` : ''}
${pageSpeedScore != null ? `Mobile PageSpeed: ${pageSpeedScore}/100` : ''}
${desktopScore != null ? `Desktop PageSpeed: ${desktopScore}/100` : ''}
${mobileCls != null ? `CLS: ${mobileCls.toFixed(3)}  FCP: ${mobileFcp != null ? mobileFcp.toFixed(1) + 's' : '—'}` : ''}

🔒 SECURITY & SEARCH BASICS
${tick(ssl)} HTTPS (secure connection)
${tick(!!content.metaTitle)} Page title${content.metaTitleLen ? ` (${content.metaTitleLen} chars)` : ''}
${tick(!!content.metaDesc)} Meta description${content.metaDescLen ? ` (${content.metaDescLen} chars)` : ''}
${tick(!!content.h1)} H1 heading
${tick(!!content.hasCanonical)} Canonical tag
${tick(hasSitemap)} XML sitemap
${tick(hasRobotsTxt)} robots.txt
${tick(content.hasSchema)} Structured data (schema)
${tick(content.imagesTotal === 0 || content.imagesMissingAlt === 0)} Image alt text

🌐 SOCIAL & SHARING
${tick(content.hasOpenGraph)} Open Graph tags
${tick(content.hasTwitterCard)} Twitter / X card tags

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
  const { lcp, pageSpeedScore, desktopScore, overallScore, grade, ssl, hasSitemap, hasRobotsTxt, content, subScores } = report
  return `New audit lead — ${biz} (Grade ${grade} · ${overallScore}/100)

Contact:  ${name} <${email}>
Business: ${biz}
Industry: ${industry || '—'}
URL:      ${url}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sub-scores: On-Page ${subScores.onPage} · Performance ${subScores.performance} · Usability ${subScores.usability} · Social ${subScores.social}

📱 Speed: ${lcp.toFixed(1)}s LCP · Mobile ${pageSpeedScore ?? '—'}/100 · Desktop ${desktopScore ?? '—'}/100
🔒 HTTPS: ${ssl ? 'Yes' : 'NO'}

SEO: title=${content.metaTitle ? `✓ (${content.metaTitleLen}ch)` : '✗'} | desc=${content.metaDesc ? `✓ (${content.metaDescLen}ch)` : '✗'} | h1=${content.h1 ? '✓' : '✗'} | canonical=${content.hasCanonical ? '✓' : '✗'} | sitemap=${hasSitemap ? '✓' : '✗'} | robots=${hasRobotsTxt ? '✓' : '✗'} | schema=${content.hasSchema ? '✓' : '✗'}
Social: og=${content.hasOpenGraph ? '✓' : '✗'} | twitter=${content.hasTwitterCard ? '✓' : '✗'}
Images: ${content.imagesTotal - content.imagesMissingAlt}/${content.imagesTotal} have alt text · ${content.linkCount} links on page
Tracking: analytics=${content.hasAnalytics ? '✓' : '✗'} | pixel=${content.hasMetaPixel ? '✓' : '✗'} | gads=${content.hasGoogleAds ? '✓' : '✗'}
Enquiry: tel-link=${content.hasTapToCall ? '✓' : '✗'} | contact=${content.hasContact ? '✓' : '✗'} | cta=${content.hasCta ? '✓' : '✗'}

Frustration: ${frustration || '—'}
`
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

    // Fetch everything in parallel
    const [psData, htmlContent, hasSitemap, hasRobotsTxt, hasLlmsTxt] = await Promise.all([
      fetchPageSpeedBoth(normUrl),
      fetchPageContent(normUrl),
      checkSitemap(normUrl),
      checkUrlExists(normUrl, '/robots.txt'),
      checkUrlExists(normUrl, '/llms.txt'),
    ])

    const mobileM  = extractMetrics(psData.mobile)
    const desktopM = extractMetrics(psData.desktop)

    const lcp: number        = mobileM?.lcp  ?? 5.0
    const pageSpeedScore      = mobileM?.score  ?? null
    const desktopScore        = desktopM?.score ?? null
    const mobileCls           = mobileM?.cls   ?? null
    const mobileFcp           = mobileM?.fcp   ?? null
    const mobileTbt           = mobileM?.tbt   ?? null
    const desktopLcp          = desktopM?.lcp  ?? null
    const desktopCls          = desktopM?.cls  ?? null
    const desktopFcp          = desktopM?.fcp  ?? null
    const desktopTbt          = desktopM?.tbt  ?? null
    const pageWeightKb        = mobileM?.pageWeightKb ?? null
    const lighthouseAccessibility = mobileM?.accessibility ?? null
    const lighthouseBestPractices = mobileM?.bestPractices ?? null

    const ssl     = normUrl.startsWith('https://')
    const content = htmlContent ? checkContent(htmlContent) : {
      metaTitle: null, metaDesc: null, h1: null,
      metaTitleLen: null, metaDescLen: null,
      hasCanonical: false, hasFavicon: false, hasLang: false,
      hasPhone: false, hasEmail: false, hasContact: false, hasCta: false, hasTapToCall: false,
      hasSchema: false, hasViewport: false, hasNoindex: false,
      hasOpenGraph: false, hasTwitterCard: false,
      hasAnalytics: false, hasMetaPixel: false, hasGoogleAds: false,
      imagesTotal: 0, imagesMissingAlt: 0, linkCount: 0,
    }

    const accessibilityPass  = (lighthouseAccessibility ?? 0) >= 80
    const bestPracticesPass  = (lighthouseBestPractices ?? 0) >= 80
    const pageWeightPass     = pageWeightKb != null ? pageWeightKb < 2048 : true

    const checks: CheckSet = {
      ssl,
      speedPass:        lcp < 4,
      desktopSpeedPass: (desktopScore ?? 0) >= 80,
      hasMetaTitle:     !!content.metaTitle,
      hasMetaDesc:      !!content.metaDesc,
      hasH1:            !!content.h1,
      hasCanonical:     content.hasCanonical,
      hasSitemap,
      hasRobotsTxt,
      hasSchema:        content.hasSchema,
      allImagesHaveAlt: content.imagesTotal === 0 || content.imagesMissingAlt === 0,
      hasOpenGraph:     content.hasOpenGraph,
      hasTwitterCard:   content.hasTwitterCard,
      hasAnalytics:     content.hasAnalytics,
      hasMetaPixel:     content.hasMetaPixel,
      hasGoogleAds:     content.hasGoogleAds,
      accessibilityPass,
      hasTapToCall:     content.hasTapToCall,
      hasContact:       content.hasContact,
      hasCta:           content.hasCta,
    }

    const overallScore = computeScore(checks)
    const grade        = gradeFromScore(overallScore)
    const subScores    = computeSubScores(checks, content, bestPracticesPass, pageWeightPass)

    const report: AuditReport = {
      lcp, pageSpeedScore, desktopScore,
      mobileCls, mobileFcp, mobileTbt,
      desktopLcp, desktopCls, desktopFcp, desktopTbt,
      pageWeightKb, lighthouseAccessibility, lighthouseBestPractices,
      grade, overallScore, subScores,
      ssl, hasSitemap, hasRobotsTxt, hasLlmsTxt,
      content, url: normUrl,
    }

    await db.insert(auditLeads).values({
      name:               name.trim(),
      businessName:       businessName?.trim() || name.trim(),
      email:              email.trim().toLowerCase(),
      url:                normUrl,
      industry:           industry || null,
      biggestFrustration: biggestFrustration || null,
      report,
    })

    const bizDisplay = businessName?.trim() || name.trim()
    const [pdfBuffer, emailHtml] = await Promise.all([
      generateAuditPdf(report, name.trim(), bizDisplay),
      Promise.resolve(buildAuditEmailHtml(name.trim(), bizDisplay, report)),
    ])

    await Promise.all([
      resend.emails.send({
        from:    FROM,
        to:      email.trim(),
        replyTo: 'contact@webf5.au',
        subject: `Your website audit — ${bizDisplay} (Grade ${grade})`,
        html:    emailHtml,
        attachments: [{
          filename: `website-audit-${bizDisplay.toLowerCase().replace(/\s+/g, '-')}.pdf`,
          content:  pdfBuffer,
        }],
      }),
      resend.emails.send({
        from:    FROM,
        to:      NOTIFY,
        subject: `Audit lead — ${bizDisplay} (Grade ${grade} · ${overallScore}/100)`,
        text:    buildNotifyEmail(name.trim(), bizDisplay, email.trim(), normUrl, industry, biggestFrustration, report),
      }),
    ])

    return NextResponse.json({ success: true, report })

  } catch (err) {
    console.error('Audit error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
