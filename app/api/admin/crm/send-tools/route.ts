import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { buildChecklistEmailHtml } from '@/lib/checklist-email'
import { renderChecklistPdf } from '@/lib/checklist-pdf'
import { buildAuditEmailHtml } from '@/lib/audit-email'
import { generateAuditPdf } from '@/lib/audit-pdf'
import { buildReviewInviteEmailHtml } from '@/lib/review-invite-email'
import { db, appSettings } from '@/lib/db'
import type { EmailSignature } from '@/lib/utils'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = 'contact@webf5.au'

async function getEmailSignature(): Promise<EmailSignature | null> {
  const rows = await db.select().from(appSettings)
  const map: Record<string, string> = {}
  for (const r of rows) map[r.key] = r.value
  const sig: EmailSignature = {
    senderName:    map.sender_name,
    senderTitle:   map.sender_title,
    senderCompany: map.sender_company,
    senderSlogan:  map.sender_slogan,
    senderPhone:   map.sender_phone,
    senderWebsite: map.sender_website,
  }
  const hasAny = Object.values(sig).some(v => v?.trim())
  return hasAny ? sig : null
}

// ── Inline audit helpers (same as public audit route) ─────────────────────

async function fetchPageSpeedBoth(url: string) {
  const key  = process.env.PAGESPEED_API_KEY ? `&key=${process.env.PAGESPEED_API_KEY}` : ''
  const cats = 'category=performance&category=accessibility&category=best-practices'
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

function extractMetrics(psData: unknown) {
  if (!psData) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lr = (psData as any).lighthouseResult
  const audits = lr?.audits
  const cats   = lr?.categories
  if (!audits) return null
  return {
    score:         cats?.performance?.score    != null ? Math.round(cats.performance.score * 100)    : null,
    lcp:           audits['largest-contentful-paint']?.numericValue != null ? audits['largest-contentful-paint'].numericValue / 1000 : null,
    cls:           audits['cumulative-layout-shift']?.numericValue  ?? null,
    fcp:           audits['first-contentful-paint']?.numericValue   != null ? audits['first-contentful-paint'].numericValue / 1000   : null,
    tbt:           audits['total-blocking-time']?.numericValue      ?? null,
    pageWeightKb:  audits['total-byte-weight']?.numericValue        != null ? Math.round(audits['total-byte-weight'].numericValue / 1024) : null,
    accessibility: cats?.accessibility?.score       != null ? Math.round(cats.accessibility.score * 100)       : null,
    bestPractices: cats?.['best-practices']?.score  != null ? Math.round(cats['best-practices'].score * 100)   : null,
  }
}

async function checkUrlExists(baseUrl: string, path: string): Promise<boolean> {
  try {
    const origin = new URL(baseUrl).origin
    const res = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(6000) })
    return res.ok
  } catch { return false }
}

async function checkSitemap(baseUrl: string): Promise<boolean> {
  try {
    const origin = new URL(baseUrl).origin
    const res  = await fetch(`${origin}/sitemap.xml`, { signal: AbortSignal.timeout(6000) })
    if (!res.ok) return false
    const text = await res.text()
    return text.includes('<urlset') || text.includes('<sitemapindex')
  } catch { return false }
}

function decodeEntities(str: string) {
  return str.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ')
}

function checkContent(html: string) {
  const lower = html.toLowerCase()
  const rawTitle  = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? null
  const metaTitle = rawTitle ? decodeEntities(rawTitle) : null
  const metaDesc  = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() ?? null
  const h1Match   = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? null
  const h1        = h1Match ? decodeEntities(h1Match.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()) || null : null
  const imgTags   = html.match(/<img\b[^>]*>/gi) || []
  return {
    metaTitle, metaDesc, h1,
    metaTitleLen:   metaTitle?.length ?? null,
    metaDescLen:    metaDesc?.length  ?? null,
    hasCanonical:   /<link[^>]+rel=["']canonical["']/i.test(html),
    hasFavicon:     /<link[^>]+rel=["'][^"']*(?:icon|apple-touch-icon)[^"']*["']/i.test(html),
    hasLang:        /<html[^>]+lang=["'][a-z]/i.test(html),
    imagesTotal:    imgTags.length,
    imagesMissingAlt: imgTags.filter(t => { const m = t.match(/\balt=["']([^"']*)["']/i); return !m || !m[1].trim() }).length,
    hasSchema:      lower.includes('application/ld+json'),
    hasOpenGraph:   /<meta[^>]+property=["']og:/i.test(html),
    hasTwitterCard: /<meta[^>]+name=["']twitter:/i.test(html),
    linkCount:      (html.match(/<a\s/gi) || []).length,
    hasViewport:    lower.includes('name="viewport"') || lower.includes("name='viewport'"),
    hasNoindex:     /content=["'][^"']*noindex[^"']*["']/i.test(html),
    hasAnalytics:   lower.includes('googletagmanager.com') || lower.includes('google-analytics.com') || lower.includes('gtag(') || /['"]G-[A-Z0-9]{4,}['"]/.test(html),
    hasMetaPixel:   lower.includes('connect.facebook.net') || lower.includes('fbevents.js'),
    hasGoogleAds:   lower.includes('googleadservices.com') || /['"]AW-[0-9]+['"]/.test(html),
    hasTapToCall:   lower.includes('href="tel:') || lower.includes("href='tel:"),
    hasPhone:       /(\+?61|0)[2-9]\d{8}|(\+?61|0)4\d{8}/.test(html),
    hasEmail:       /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(lower),
    hasContact:     /(\+?61|0)[2-9]\d{8}|(\+?61|0)4\d{8}/.test(html) || /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(lower) || lower.includes('contact') || lower.includes('get in touch'),
    hasCta:         lower.includes('get a quote') || lower.includes('book') || lower.includes('contact us') || lower.includes('call us') || lower.includes('get started') || lower.includes('enquire') || lower.includes('request'),
  }
}

function computeScore(c: Record<string, boolean>) {
  const vals = Object.values(c)
  return Math.round(vals.filter(Boolean).length / vals.length * 100)
}

function gradeFromScore(s: number) {
  if (s >= 85) return 'A'; if (s >= 65) return 'B'; if (s >= 45) return 'C'; return 'D'
}

// ── Route handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { type, name, businessName, email, url, preview, reviewCount } = await req.json()

    if (!type || !name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'type, name and email required' }, { status: 400 })
    }

    const nameClean = name.trim()
    const firstName = nameClean.split(/\s+/)[0]
    const bizClean  = businessName?.trim() || nameClean
    const sig       = await getEmailSignature()

    // ── Checklist send / preview ────────────────────────────────────────────
    if (type === 'checklist') {
      const emailHtml = buildChecklistEmailHtml(firstName, sig)
      if (preview) return NextResponse.json({ html: emailHtml })
      const pdfBuffer = await renderChecklistPdf(firstName)
      await resend.emails.send({
        from:    FROM,
        to:      email.trim(),
        replyTo: 'contact@webf5.au',
        subject: 'Your 12-Point Website Checklist — Web F5',
        html:    emailHtml,
        attachments: [{ filename: 'website-checklist-web-f5.pdf', content: pdfBuffer }],
      })
      return NextResponse.json({ success: true, type: 'checklist' })
    }

    // ── Audit send ──────────────────────────────────────────────────────────
    if (type === 'audit') {
      if (!url?.trim()) return NextResponse.json({ error: 'url required for audit' }, { status: 400 })
      let normUrl = url.trim()
      if (!/^https?:\/\//i.test(normUrl)) normUrl = 'https://' + normUrl

      const [psData, htmlContent, hasSitemap, hasRobotsTxt, hasLlmsTxt] = await Promise.all([
        fetchPageSpeedBoth(normUrl),
        fetch(normUrl, { signal: AbortSignal.timeout(10000) }).then(r => r.text()).catch(() => null),
        checkSitemap(normUrl),
        checkUrlExists(normUrl, '/robots.txt'),
        checkUrlExists(normUrl, '/llms.txt'),
      ])

      const mobileM  = extractMetrics(psData.mobile)
      const desktopM = extractMetrics(psData.desktop)
      const lcp      = mobileM?.lcp ?? 5.0
      const content  = htmlContent ? checkContent(htmlContent) : {
        metaTitle: null, metaDesc: null, h1: null, metaTitleLen: null, metaDescLen: null,
        hasCanonical: false, hasFavicon: false, hasLang: false, hasPhone: false, hasEmail: false,
        hasContact: false, hasCta: false, hasTapToCall: false, hasSchema: false, hasViewport: false,
        hasNoindex: false, hasOpenGraph: false, hasTwitterCard: false, hasAnalytics: false,
        hasMetaPixel: false, hasGoogleAds: false, imagesTotal: 0, imagesMissingAlt: 0, linkCount: 0,
      }
      const desktopScore = desktopM?.score ?? null
      const lighthouseAccessibility = mobileM?.accessibility ?? null
      const lighthouseBestPractices = mobileM?.bestPractices ?? null

      const checks = {
        ssl:              normUrl.startsWith('https://'),
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
        accessibilityPass: (lighthouseAccessibility ?? 0) >= 80,
        hasTapToCall:     content.hasTapToCall,
        hasContact:       content.hasContact,
        hasCta:           content.hasCta,
      }

      const overallScore = computeScore(checks)
      const grade        = gradeFromScore(overallScore)
      const onPageChecks    = [checks.hasMetaTitle, checks.hasMetaDesc, checks.hasH1, checks.hasCanonical, checks.hasSchema, checks.allImagesHaveAlt, checks.hasRobotsTxt, checks.hasSitemap, content.hasFavicon, content.hasLang]
      const performChecks   = [checks.ssl, checks.speedPass, checks.desktopSpeedPass, mobileM?.pageWeightKb != null ? mobileM.pageWeightKb < 2048 : true]
      const usabilityChecks = [content.hasViewport, checks.hasTapToCall, checks.accessibilityPass, (lighthouseBestPractices ?? 0) >= 80]
      const socialChecks    = [checks.hasOpenGraph, checks.hasTwitterCard, checks.hasMetaPixel]
      const pct = (arr: boolean[]) => Math.round(arr.filter(Boolean).length / arr.length * 100)

      const report = {
        lcp, pageSpeedScore: mobileM?.score ?? null, desktopScore,
        mobileCls: mobileM?.cls ?? null, mobileFcp: mobileM?.fcp ?? null, mobileTbt: mobileM?.tbt ?? null,
        desktopLcp: desktopM?.lcp ?? null, desktopCls: desktopM?.cls ?? null, desktopFcp: desktopM?.fcp ?? null, desktopTbt: desktopM?.tbt ?? null,
        pageWeightKb: mobileM?.pageWeightKb ?? null, lighthouseAccessibility, lighthouseBestPractices,
        grade, overallScore,
        subScores: { onPage: pct(onPageChecks), performance: pct(performChecks), usability: pct(usabilityChecks), social: pct(socialChecks) },
        ssl: checks.ssl, hasSitemap, hasRobotsTxt, hasLlmsTxt, content, url: normUrl,
      }

      const emailHtml = buildAuditEmailHtml(firstName, bizClean, report, sig)
      if (preview) return NextResponse.json({ html: emailHtml, grade, overallScore })

      const pdfBuffer = await generateAuditPdf(report, firstName, bizClean)
      await resend.emails.send({
        from:    FROM,
        to:      email.trim(),
        replyTo: 'contact@webf5.au',
        subject: `Your website audit — ${bizClean} (Grade ${grade})`,
        html:    emailHtml,
        attachments: [{ filename: `website-audit-${bizClean.toLowerCase().replace(/\s+/g,'-')}.pdf`, content: pdfBuffer }],
      })

      return NextResponse.json({ success: true, type: 'audit', grade, overallScore })
    }

    // ── Review invite send / preview ────────────────────────────────────────
    if (type === 'review') {
      const emailHtml = buildReviewInviteEmailHtml(firstName, bizClean, reviewCount ?? null, sig)
      if (preview) return NextResponse.json({ html: emailHtml })
      await resend.emails.send({
        from:    FROM,
        to:      email.trim(),
        replyTo: 'contact@webf5.au',
        subject: `A free tool for ${bizClean} — Web F5`,
        html:    emailHtml,
      })
      return NextResponse.json({ success: true, type: 'review' })
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 })

  } catch (err) {
    console.error('Send tools error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
