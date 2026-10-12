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

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
}

function checkContent(html: string) {
  const lower = html.toLowerCase()
  const phonePattern = /(\+?61|0)[2-9]\d{8}|(\+?61|0)4\d{8}/
  const emailPattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
  const rawTitle  = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? null
  const h1Match   = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? null
  const metaTitle = rawTitle ? decodeEntities(rawTitle) : null
  const metaDesc  = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() ?? null
  // Strip inner tags to get plain text, then collapse whitespace
  const h1        = h1Match
    ? decodeEntities(h1Match.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()) || null
    : null
  const hasPhone     = phonePattern.test(html)
  const hasEmail     = emailPattern.test(lower)
  const hasContact   = hasPhone || hasEmail || lower.includes('contact') || lower.includes('get in touch')
  const hasCta       = lower.includes('get a quote') || lower.includes('book') || lower.includes('contact us') ||
                       lower.includes('call us') || lower.includes('free') || lower.includes('get started') ||
                       lower.includes('enquire') || lower.includes('request')
  return { metaTitle, metaDesc, h1, hasPhone, hasEmail, hasContact, hasCta }
}

// ── Score helpers ──────────────────────────────────────────────────────────

function speedGrade(lcp: number) {
  if (lcp < 2.5) return 'A'
  if (lcp < 4.0) return 'B'
  if (lcp < 6.0) return 'C'
  return 'D'
}

function lcpImpact(lcpSec: number): string {
  if (lcpSec < 2.5) return `Your site loads quickly — visitors stay and explore.`
  const leavePercent = Math.min(Math.round((lcpSec - 2) * 10), 70)
  return `Your site's main content takes ${lcpSec.toFixed(1)}s to appear on mobile. Studies show roughly ${leavePercent}% of visitors leave after 3 seconds — that's potential customers walking away before seeing your phone number.`
}

// ── Email templates ────────────────────────────────────────────────────────

function scoreIcon(pass: boolean) { return pass ? '✅' : '❌' }

function buildProspectEmail(name: string, biz: string, report: AuditReport): string {
  const { lcp, grade, ssl, content, url } = report
  return `Hi ${name},

Here's your free Website Audit for ${biz}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  OVERALL GRADE: ${grade}  |  ${url}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 MOBILE SPEED
${lcpImpact(lcp)}

🔒 SECURITY
${scoreIcon(ssl)} ${ssl ? 'Your site is secure (HTTPS). Visitors and Google trust it.' : 'Your site is NOT secure. Browsers display a "Not Secure" warning to visitors.'}

📞 CONTACT ACCESSIBILITY
${scoreIcon(content.hasContact)} ${content.hasContact ? 'Customers can find your contact details.' : 'We couldn\'t find clear contact details on your page — visitors may leave without reaching you.'}

📋 SEARCH VISIBILITY
${scoreIcon(!!content.metaTitle)} Page title: ${content.metaTitle ? `"${content.metaTitle}"` : 'Missing — Google has nothing to show in search results.'}
${scoreIcon(!!content.metaDesc)} Search description: ${content.metaDesc ? 'Present ✓' : 'Missing — you\'re losing control of how your business appears in Google.'}
${scoreIcon(!!content.h1)} Page heading: ${content.h1 ? `"${content.h1}"` : 'Missing — no clear message for visitors or search engines.'}

🎯 CALL TO ACTION
${scoreIcon(content.hasCta)} ${content.hasCta ? 'Your page has a clear next step for visitors.' : 'We couldn\'t find a clear call to action — visitors may not know what to do next.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${grade === 'A'
  ? `Good news — your site is performing well. There may still be conversion and design improvements worth exploring.`
  : `These are fixable problems. We help businesses like yours turn a slow, invisible website into one that actually brings in customers.`}

Reply to this email or visit webf5.com.au to book a free 15-minute call — no obligation.

Josh Ekberg
Web F5
contact@webf5.au
webf5.com.au
`
}

function buildNotifyEmail(name: string, biz: string, email: string, url: string, industry: string | undefined, frustration: string | undefined, report: AuditReport): string {
  const { lcp, grade, ssl, content } = report
  return `New audit lead — ${biz} (Grade ${grade})

Contact:  ${name} <${email}>
Business: ${biz}
Industry: ${industry || '—'}
URL:      ${url}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  OVERALL GRADE: ${grade}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 MOBILE SPEED
${scoreIcon(lcp < 4)} ${lcpImpact(lcp)}

🔒 SECURITY
${scoreIcon(ssl)} ${ssl ? 'Secure (HTTPS).' : 'NOT secure — browsers show a "Not Secure" warning.'}

📞 CONTACT ACCESSIBILITY
${scoreIcon(content.hasContact)} ${content.hasContact ? 'Contact details found on page.' : 'No contact details found — visitors may leave without reaching them.'}
   Phone on page: ${content.hasPhone ? 'Yes' : 'No'}
   Email on page: ${content.hasEmail ? 'Yes' : 'No'}

📋 SEARCH VISIBILITY
${scoreIcon(!!content.metaTitle)} Page title: ${content.metaTitle ? `"${content.metaTitle}"` : 'Missing'}
${scoreIcon(!!content.metaDesc)} Meta description: ${content.metaDesc ? 'Present' : 'Missing'}
${scoreIcon(!!content.h1)} H1 heading: ${content.h1 ? `"${content.h1}"` : 'Missing'}

🎯 CALL TO ACTION
${scoreIcon(content.hasCta)} ${content.hasCta ? 'CTA found on page.' : 'No clear call to action found.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Biggest frustration: ${frustration || '—'}
`
}

// ── Types ──────────────────────────────────────────────────────────────────

interface AuditReport {
  lcp:     number
  grade:   string
  ssl:     boolean
  content: {
    metaTitle:  string | null
    metaDesc:   string | null
    h1:         string | null
    hasPhone:   boolean
    hasEmail:   boolean
    hasContact: boolean
    hasCta:     boolean
  }
  url:     string
}

// ── Handler ────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, businessName, email, url, industry, biggestFrustration } = body

    if (!name?.trim() || !email?.trim() || !url?.trim()) {
      return NextResponse.json({ error: 'Name, email and URL are required.' }, { status: 400 })
    }

    // Normalise URL
    let normUrl = url.trim()
    if (!/^https?:\/\//i.test(normUrl)) normUrl = 'https://' + normUrl

    // Run checks in parallel
    const [psData, htmlContent] = await Promise.all([
      fetchPageSpeed(normUrl),
      fetchPageContent(normUrl),
    ])

    // Parse PageSpeed
    const lcp: number = psData?.lighthouseResult?.audits?.['largest-contentful-paint']?.numericValue
      ? psData.lighthouseResult.audits['largest-contentful-paint'].numericValue / 1000
      : 5.0
    const ssl = normUrl.startsWith('https://')
    const content = htmlContent ? checkContent(htmlContent) : {
      metaTitle: null, metaDesc: null, h1: null,
      hasPhone: false, hasEmail: false, hasContact: false, hasCta: false,
    }

    const report: AuditReport = { lcp, grade: speedGrade(lcp), ssl, content, url: normUrl }

    // Save to DB
    await db.insert(auditLeads).values({
      name:               name.trim(),
      businessName:       businessName?.trim() || name.trim(),
      email:              email.trim().toLowerCase(),
      url:                normUrl,
      industry:           industry || null,
      biggestFrustration: biggestFrustration || null,
      report,
    })

    // Send emails in parallel
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
        subject: `Audit lead — ${businessName?.trim() || name.trim()} (Grade ${report.grade})`,
        text:    buildNotifyEmail(name.trim(), businessName?.trim() || name.trim(), email.trim(), normUrl, industry, biggestFrustration, report),
      }),
    ])

    return NextResponse.json({ success: true, report })

  } catch (err) {
    console.error('Audit error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
