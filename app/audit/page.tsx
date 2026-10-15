'use client'

import { useState } from 'react'
import { Navigation } from '@/components/sections/navigation'

const INDUSTRIES = [
  'Trades & Construction',
  'Health & Allied Health',
  'Retail & E-commerce',
  'Hospitality & Tourism',
  'Professional Services',
  'Agriculture & Rural',
  'Real Estate',
  'Automotive',
  'Education & Training',
  'Other',
]

interface Report {
  lcp:            number
  pageSpeedScore?: number | null
  desktopScore?:  number | null
  mobileCls?:     number | null
  mobileFcp?:     number | null
  mobileTbt?:     number | null
  desktopLcp?:    number | null
  desktopCls?:    number | null
  desktopFcp?:    number | null
  desktopTbt?:    number | null
  pageWeightKb?:  number | null
  lighthouseAccessibility?: number | null
  lighthouseBestPractices?: number | null
  grade:          string
  overallScore?:  number
  subScores?: {
    onPage:      number
    performance: number
    usability:   number
    social:      number
  }
  ssl:          boolean
  hasSitemap?:  boolean
  hasRobotsTxt?: boolean
  hasLlmsTxt?:  boolean
  content: {
    metaTitle:       string | null
    metaDesc:        string | null
    h1:              string | null
    metaTitleLen?:   number | null
    metaDescLen?:    number | null
    hasPhone:        boolean
    hasEmail:        boolean
    hasContact:      boolean
    hasCta:          boolean
    hasTapToCall?:   boolean
    hasSchema?:      boolean
    hasCanonical?:   boolean
    hasFavicon?:     boolean
    hasLang?:        boolean
    hasViewport?:    boolean
    hasAnalytics?:   boolean
    hasMetaPixel?:   boolean
    hasGoogleAds?:   boolean
    hasOpenGraph?:   boolean
    hasTwitterCard?: boolean
    imagesTotal?:    number
    imagesMissingAlt?: number
    linkCount?:      number
  }
  url: string
}

const GRADE_COLOR: Record<string, string> = {
  A: '#22C55E', B: '#84CC16', C: '#F59E0B', D: '#EF4444',
}

function subScoreColor(score: number): string {
  if (score >= 80) return '#22C55E'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

function speedColor(v: number | null | undefined, good: number, ok: number): string {
  if (v == null) return 'text-slate-500'
  if (v <= good) return 'text-green-400'
  if (v <= ok)   return 'text-amber-400'
  return 'text-red-400'
}

function MetricBox({ val, label, colorClass }: { val: string; label: string; colorClass: string }) {
  return (
    <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
      <p className={`text-base font-bold tabular-nums ${colorClass}`}>{val}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}

function Check({ pass, label, detail, tag }: { pass: boolean; label: string; detail: string; tag?: string }) {
  return (
    <div className="flex gap-3 py-3 border-b border-white/5 last:border-0">
      <span className="text-base shrink-0 mt-0.5">{pass ? '✅' : '❌'}</span>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm font-semibold ${pass ? 'text-white' : 'text-red-300'}`}>{label}</p>
          {tag && <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono">{tag}</span>}
        </div>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{detail}</p>
      </div>
    </div>
  )
}

function Info({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex gap-3 py-3 border-b border-white/5 last:border-0">
      <span className="text-base shrink-0 mt-0.5 text-slate-500">●</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{detail}</p>
      </div>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111827] border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-6 py-3 border-b border-white/5 bg-white/[0.02]">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">{title}</p>
      </div>
      <div className="px-6 py-1">{children}</div>
    </div>
  )
}

function ReportPanel({ report, name, biz }: { report: Report; name: string; biz: string }) {
  const { lcp, grade, overallScore, ssl, hasSitemap, content } = report
  const gradeColor    = GRADE_COLOR[grade] ?? '#6366F1'
  const allImagesAlt  = (content.imagesTotal ?? 0) === 0 || (content.imagesMissingAlt ?? 0) === 0
  const mobilePass    = lcp < 4
  const desktopPass   = (report.desktopScore ?? 0) >= 80
  const accessPass    = (report.lighthouseAccessibility ?? 0) >= 80
  const bestPractPass = (report.lighthouseBestPractices ?? 0) >= 80

  const lcpDetail = lcp < 2.5
    ? `${lcp.toFixed(1)}s: fast. Visitors stay and explore.`
    : lcp < 4
    ? `${lcp.toFixed(1)}s: acceptable, but there's room to improve.`
    : `${lcp.toFixed(1)}s: slow. Roughly ${Math.min(Math.round((lcp - 2) * 10), 70)}% of mobile visitors leave before the page finishes loading.`

  const mailtoHref = `mailto:contact@webf5.au?subject=${encodeURIComponent(`${biz} - request for a 15 minute call.`)}&body=${encodeURIComponent(`Please contact ${biz} regarding the items identified on the website audit.`)}`

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Summary */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
        <div className="flex items-start gap-5 mb-5">
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center justify-center w-20 h-20 rounded-full border-4" style={{ borderColor: gradeColor }}>
              <span className="text-4xl font-black" style={{ color: gradeColor }}>{grade}</span>
            </div>
            {overallScore != null && (
              <div>
                <p className="text-3xl font-black" style={{ color: gradeColor }}>{overallScore}</p>
                <p className="text-xs text-slate-500">/100</p>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400 mb-1">Website audit for</p>
            <h2 className="text-xl font-bold text-white leading-tight">{biz}</h2>
            <p className="text-xs text-slate-500 mt-0.5 break-all">{report.url}</p>
          </div>
        </div>

        {/* Sub-scores */}
        {report.subScores && (
          <div className="grid grid-cols-4 gap-2 mb-5">
            {([
              ['On-Page', report.subScores.onPage],
              ['Performance', report.subScores.performance],
              ['Usability', report.subScores.usability],
              ['Social', report.subScores.social],
            ] as [string, number][]).map(([label, score]) => (
              <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-xl font-black" style={{ color: subScoreColor(score) }}>{score}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        <p className="text-sm text-slate-300 leading-relaxed border-t border-white/10 pt-4">
          {grade === 'A'
            ? `Good news, ${name}. Your site is solid across the basics. There may still be conversion and design improvements worth exploring.`
            : `${name}, these are fixable problems. The checks below show exactly what's holding your site back, and what to fix first.`}
        </p>
      </div>

      {/* Performance */}
      <SectionCard title="Performance">
        <div className="flex gap-2 pt-3 pb-1">
          <MetricBox val={`${lcp.toFixed(1)}s`}  label="Mobile LCP"  colorClass={speedColor(lcp, 2.5, 4)} />
          <MetricBox val={report.mobileFcp != null ? `${report.mobileFcp.toFixed(1)}s` : '—'} label="Mobile FCP" colorClass={speedColor(report.mobileFcp, 1.8, 3)} />
          <MetricBox val={report.mobileCls != null ? report.mobileCls.toFixed(3) : '—'}        label="Mobile CLS" colorClass={speedColor(report.mobileCls, 0.1, 0.25)} />
          <MetricBox val={report.mobileTbt != null ? `${Math.round(report.mobileTbt)}ms` : '—'} label="Mobile TBT" colorClass={speedColor(report.mobileTbt, 200, 600)} />
        </div>
        <div className="flex gap-2 pb-3">
          <MetricBox val={report.desktopLcp != null ? `${report.desktopLcp.toFixed(1)}s` : '—'} label="Desktop LCP" colorClass={speedColor(report.desktopLcp, 2.5, 4)} />
          <MetricBox val={report.desktopFcp != null ? `${report.desktopFcp.toFixed(1)}s` : '—'} label="Desktop FCP" colorClass={speedColor(report.desktopFcp, 1.8, 3)} />
          <MetricBox val={report.desktopCls != null ? report.desktopCls.toFixed(3) : '—'}        label="Desktop CLS" colorClass={speedColor(report.desktopCls, 0.1, 0.25)} />
          <MetricBox val={report.pageWeightKb != null ? `${report.pageWeightKb} KB` : '—'}       label="Page Weight" colorClass={report.pageWeightKb != null ? (report.pageWeightKb < 1024 ? 'text-green-400' : report.pageWeightKb < 2048 ? 'text-amber-400' : 'text-red-400') : 'text-slate-500'} />
        </div>
        <Check pass={mobilePass}  label={`Mobile PageSpeed: ${report.pageSpeedScore ?? '—'}/100`}  tag={`LCP ${lcp.toFixed(1)}s`}      detail={lcpDetail} />
        <Check pass={desktopPass} label={`Desktop PageSpeed: ${report.desktopScore ?? '—'}/100`}   tag={report.desktopLcp != null ? `LCP ${report.desktopLcp.toFixed(1)}s` : undefined} detail={desktopPass ? 'Desktop speed is good.' : 'Desktop score is below 80. Check image sizes and render-blocking resources.'} />
        <Check pass={ssl}         label="Secure connection (HTTPS)" detail={ssl ? 'Your site is secure. Visitors and Google trust it.' : 'Browsers display a "Not Secure" warning. This loses visitors and hurts your Google ranking.'} />
      </SectionCard>

      {/* On-Page SEO */}
      <SectionCard title="On-Page SEO">
        <Check pass={!!content.metaTitle}    label="Page title"              tag={content.metaTitleLen != null ? `${content.metaTitleLen} chars` : undefined} detail={content.metaTitle ? `"${content.metaTitle}"` : 'Missing. Google has nothing to show in search results.'} />
        <Check pass={!!content.metaDesc}     label="Meta description"        tag={content.metaDescLen != null ? `${content.metaDescLen} chars${(content.metaDescLen < 120 || content.metaDescLen > 155) ? ' · aim 120–155' : ' · good'}` : undefined} detail={content.metaDesc ? 'Set. You control what people read before clicking your result.' : 'Missing. Google will choose what to display instead of you.'} />
        <Check pass={!!content.h1}           label="Page heading (H1)"       detail={content.h1 ? `"${content.h1}"` : 'Missing. No clear message for visitors or search engines.'} />
        <Check pass={!!content.hasCanonical} label="Canonical tag"           detail={content.hasCanonical ? 'Set. Prevents duplicate-content issues.' : 'Missing. Add a canonical tag to tell Google which URL is authoritative.'} />
        <Check pass={!!hasSitemap}           label="XML sitemap"             detail={hasSitemap ? 'Found. Google can discover every page on your site.' : 'Not found. Google has a harder time finding and indexing all your pages.'} />
        <Check pass={!!report.hasRobotsTxt}  label="robots.txt"             detail={report.hasRobotsTxt ? 'Found. Search engine crawlers have guidance on your site.' : 'Not found. Add a robots.txt file to guide crawlers.'} />
        <Check pass={!!content.hasSchema}    label="Structured data (schema)" detail={content.hasSchema ? 'Found. Google and AI assistants can read your business details.' : 'Not found. Adding LocalBusiness schema helps you appear in local results and AI assistant answers.'} />
        <Check pass={allImagesAlt}           label="Image alt text"          tag={content.imagesTotal != null ? `${(content.imagesTotal ?? 0) - (content.imagesMissingAlt ?? 0)}/${content.imagesTotal} described` : undefined} detail={allImagesAlt ? 'All images are described. Good for accessibility and search engines.' : `${content.imagesMissingAlt} image${(content.imagesMissingAlt ?? 0) > 1 ? 's' : ''} missing alt text.`} />
        {content.hasFavicon != null && <Check pass={!!content.hasFavicon}  label="Favicon"               detail={content.hasFavicon ? 'Set. Brand recognition in tabs and search results.' : 'No favicon detected. Add one for brand recognition in browser tabs.'} />}
        {content.hasLang    != null && <Check pass={!!content.hasLang}     label="Language declaration"  detail={content.hasLang    ? 'Page declares its language. Helps search engines serve the right audience.' : 'No lang attribute on <html>. Add lang="en".'} />}
        {content.linkCount  != null && <Info label={`${content.linkCount} links on page`} detail="Total anchor links: internal and external combined." />}
        {report.hasLlmsTxt  != null && <Check pass={!!report.hasLlmsTxt}  label="llms.txt (AI readiness)" detail={report.hasLlmsTxt ? 'Found. Helps AI assistants understand your site content.' : 'No llms.txt file. This emerging standard helps AI models like ChatGPT better understand your business.'} />}
      </SectionCard>

      {/* Usability */}
      <SectionCard title="Usability">
        <Check pass={accessPass}     label={`Accessibility: ${report.lighthouseAccessibility ?? '—'}/100`}   detail={accessPass    ? 'Good accessibility score. Your site works well for all users and search engines.' : 'Score below 80. Fix contrast, missing labels, and alt text.'} />
        <Check pass={bestPractPass}  label={`Best Practices: ${report.lighthouseBestPractices ?? '—'}/100`}  detail={bestPractPass ? 'Site follows best practices.' : 'Some best-practice issues detected. Check browser console errors, HTTPS, and deprecated APIs.'} />
        {content.hasViewport != null && <Check pass={!!content.hasViewport} label="Mobile viewport"  detail={content.hasViewport ? 'Responsive viewport is set. The site scales correctly on mobile.' : 'No viewport meta tag. The site may not display correctly on mobile.'} />}
        <Check pass={!!content.hasTapToCall} label="Tap-to-call phone link"  detail={content.hasTapToCall ? 'A tap-to-call link is in place. Mobile visitors can call with one tap.' : "Not found. Mobile visitors have to manually copy-paste your number, and most won't bother."} />
      </SectionCard>

      {/* Social & Sharing */}
      <SectionCard title="Social &amp; Sharing">
        <Check pass={!!content.hasOpenGraph}   label="Open Graph tags"       detail={content.hasOpenGraph   ? 'Set. Your site shows a rich preview when shared on Facebook, LinkedIn, and iMessage.' : 'Missing. Without OG tags, shared links show a plain URL. Add og:title, og:description, and og:image.'} />
        <Check pass={!!content.hasTwitterCard} label="Twitter / X card tags" detail={content.hasTwitterCard ? 'Set. Links shared on X/Twitter show a rich card.' : 'Missing. Add Twitter card meta tags for better link previews.'} />
        <Check pass={!!content.hasMetaPixel}   label="Meta (Facebook) Pixel" detail={content.hasMetaPixel   ? 'Found. You can retarget visitors with Facebook and Instagram ads.' : 'Not found. Adding the Pixel lets you retarget website visitors with social ads.'} />
      </SectionCard>

      {/* Tracking */}
      <SectionCard title="Tracking">
        <Check pass={!!content.hasAnalytics} label="Google Analytics / Tag Manager" detail={content.hasAnalytics ? 'Found. You can see which pages and sources bring in enquiries.' : 'Not found. Without analytics there is no way to know what brings in enquiries.'} />
        <Check pass={!!content.hasGoogleAds} label="Google Ads conversion tag"      detail={content.hasGoogleAds ? 'Found. You can measure which ad clicks become enquiries.' : 'Not found. If you run Google Ads, a conversion tag shows which keywords generate leads.'} />
      </SectionCard>

      {/* Enquiry Path */}
      <SectionCard title="Enquiry Path">
        <Check pass={content.hasContact} label="Contact details on page" detail={content.hasContact ? 'Contact details are visible on the page.' : "Not found. Visitors who can't reach you quickly will call your competitor."} />
        <Check pass={content.hasCta}     label="Clear call to action"    detail={content.hasCta ? 'Your page has a clear next step for visitors.' : 'Not found. Visitors who are ready to enquire may not know what to do next.'} />
      </SectionCard>

      {/* CTA */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 text-center">
        <h3 className="font-bold text-white text-lg mb-2">
          {grade === 'A' ? 'Want to go further?' : 'Ready to fix this?'}
        </h3>
        <p className="text-slate-300 text-sm mb-5 leading-relaxed max-w-md mx-auto">
          {grade === 'A'
            ? 'We can review your conversion flow, design, and content to find growth opportunities beyond the basics.'
            : "We fix exactly these problems for local businesses. Book a free 15-minute call and we'll walk through your site together, no obligation."}
        </p>
        <a
          href={mailtoHref}
          className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-7 py-3 rounded-xl transition-colors"
        >
          Book a free 15-minute call
        </a>
        <p className="text-xs text-slate-500 mt-3">A copy of this report has been sent to your email.</p>
      </div>
    </div>
  )
}

export default function AuditPage() {
  const [form, setForm] = useState({
    name: '', businessName: '', email: '', url: '', industry: '', biggestFrustration: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [report, setReport] = useState<Report | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setReport(data.report)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white">
      <Navigation />
      <div className="max-w-2xl mx-auto px-4 pt-28 pb-16 space-y-10">

        {/* Hero */}
        <div className="text-center space-y-4">
          <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest">Free · Instant · No obligation</p>
          <h1 className="text-4xl font-black leading-tight">
            Is your website<br />
            <span className="text-indigo-400">costing you customers?</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-lg mx-auto">
            Enter your website below and get an instant audit. In plain English, not tech jargon. We'll show you exactly what's working and what's costing you business.
          </p>
        </div>

        {status === 'done' && report ? (
          <ReportPanel report={report} name={form.name} biz={form.businessName || form.name} />
        ) : (
          <form onSubmit={submit} className="bg-[#111827] border border-white/10 rounded-2xl p-7 space-y-5">

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Your name *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Josh Smith"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Business name *</label>
                <input
                  required
                  value={form.businessName}
                  onChange={e => set('businessName', e.target.value)}
                  placeholder="Smith Plumbing"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Email address *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="you@yourbusiness.com.au"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Your website URL *</label>
              <input
                required
                value={form.url}
                onChange={e => set('url', e.target.value)}
                placeholder="yourbusiness.com.au"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Industry</label>
              <select
                value={form.industry}
                onChange={e => set('industry', e.target.value)}
                className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">Select your industry…</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                What's your biggest frustration with your current website?
                <span className="text-slate-600 font-normal ml-1">(optional)</span>
              </label>
              <textarea
                value={form.biggestFrustration}
                onChange={e => set('biggestFrustration', e.target.value)}
                placeholder="e.g. It doesn't show up on Google, it looks outdated, I get no enquiries from it…"
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            {status === 'error' && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors text-base"
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Analysing your website…
                </span>
              ) : 'Get my free audit →'}
            </button>

            <p className="text-xs text-slate-600 text-center">
              We'll email you a copy of this report. No spam, no obligation.
            </p>
          </form>
        )}
      </div>
    </main>
  )
}
