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
  lcp:          number
  pageSpeedScore?: number | null
  grade:        string
  overallScore?: number
  ssl:          boolean
  hasSitemap?:  boolean
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
    hasAnalytics?:   boolean
    hasMetaPixel?:   boolean
    hasGoogleAds?:   boolean
    imagesTotal?:    number
    imagesMissingAlt?: number
  }
  url: string
}

const GRADE_COLOR: Record<string, string> = {
  A: '#22C55E', B: '#84CC16', C: '#F59E0B', D: '#EF4444',
}

function ScoreBadge({ grade, score }: { grade: string; score?: number }) {
  const color = GRADE_COLOR[grade] ?? '#6366F1'
  return (
    <div className="flex items-center gap-4 shrink-0">
      <div className="flex items-center justify-center w-20 h-20 rounded-full border-4" style={{ borderColor: color }}>
        <span className="text-4xl font-black" style={{ color }}>{grade}</span>
      </div>
      {score != null && (
        <div>
          <p className="text-3xl font-black" style={{ color }}>{score}</p>
          <p className="text-xs text-slate-500">/100</p>
        </div>
      )}
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
          {tag && <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-slate-500 font-mono">{tag}</span>}
        </div>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{detail}</p>
      </div>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111827] border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-6 py-3 border-b border-white/5 bg-white/[0.02]">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{title}</p>
      </div>
      <div className="px-6 py-1">{children}</div>
    </div>
  )
}

function ReportPanel({ report, name, biz }: { report: Report; name: string; biz: string }) {
  const { lcp, grade, overallScore, ssl, hasSitemap, content } = report
  const speedPass       = lcp < 4
  const allImagesAlt    = (content.imagesTotal ?? 0) === 0 || (content.imagesMissingAlt ?? 0) === 0
  const gradeColor      = GRADE_COLOR[grade] ?? '#6366F1'

  const totalChecks  = 14
  const passCount    = [
    ssl, speedPass,
    !!content.metaTitle, !!content.metaDesc, !!content.h1,
    !!hasSitemap, !!content.hasSchema, allImagesAlt,
    !!content.hasAnalytics, !!content.hasMetaPixel, !!content.hasGoogleAds,
    !!content.hasTapToCall, content.hasContact, content.hasCta,
  ].filter(Boolean).length

  const lcpDetail = lcp < 2.5
    ? `${lcp.toFixed(1)}s — fast. Visitors stay and explore.`
    : lcp < 4
    ? `${lcp.toFixed(1)}s — acceptable, but there's room to improve.`
    : `${lcp.toFixed(1)}s — slow. Roughly ${Math.min(Math.round((lcp - 2) * 10), 70)}% of mobile visitors leave before the page finishes loading.`

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Summary */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
        <div className="flex items-start gap-5">
          <ScoreBadge grade={grade} score={overallScore} />
          <div className="min-w-0">
            <p className="text-xs text-slate-400 mb-1">Website audit for</p>
            <h2 className="text-xl font-bold text-white leading-tight">{biz}</h2>
            <p className="text-xs text-slate-500 mt-0.5 break-all">{report.url}</p>
            <p className="text-sm mt-3">
              <span className="font-bold text-lg" style={{ color: gradeColor }}>{passCount}</span>
              <span className="text-slate-400"> of {totalChecks} checks passed</span>
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-300 mt-5 leading-relaxed border-t border-white/10 pt-4">
          {grade === 'A'
            ? `Good news, ${name} — your site is solid across the basics. There may still be conversion and design improvements worth exploring.`
            : `${name}, these are fixable problems. The checks below show exactly what's holding your site back — and what to fix first.`}
        </p>
      </div>

      {/* Mobile Speed */}
      <SectionCard title="Mobile Speed">
        <Check
          pass={speedPass}
          label={`Load time — ${lcp.toFixed(1)}s`}
          tag={report.pageSpeedScore != null ? `PageSpeed ${report.pageSpeedScore}/100` : undefined}
          detail={lcpDetail}
        />
      </SectionCard>

      {/* Search & SEO */}
      <SectionCard title="Search &amp; SEO">
        <Check
          pass={ssl}
          label="Secure connection (HTTPS)"
          detail={ssl
            ? 'Your site is secure. Visitors and Google trust it.'
            : 'Browsers display a "Not Secure" warning — this loses visitors and hurts your Google ranking.'}
        />
        <Check
          pass={!!content.metaTitle}
          label="Page title"
          tag={content.metaTitleLen != null ? `${content.metaTitleLen} chars` : undefined}
          detail={content.metaTitle
            ? `"${content.metaTitle}"`
            : 'No page title found. Google has nothing to show in search results.'}
        />
        <Check
          pass={!!content.metaDesc}
          label="Meta description"
          tag={content.metaDescLen != null
            ? `${content.metaDescLen} chars${content.metaDescLen < 120 || content.metaDescLen > 155 ? ' · aim 120–155' : ' · good'}`
            : undefined}
          detail={content.metaDesc
            ? 'Your search snippet description is set — this controls what people read before clicking your result.'
            : 'Missing. Google will choose what to show instead of you.'}
        />
        <Check
          pass={!!content.h1}
          label="Page heading (H1)"
          detail={content.h1
            ? `"${content.h1}"`
            : 'No H1 heading. Visitors and search engines get no clear message about what your business does.'}
        />
        <Check
          pass={!!hasSitemap}
          label="XML sitemap"
          detail={hasSitemap
            ? 'Sitemap found — Google can find every page on your site.'
            : 'No sitemap found. Without one, Google has a harder time finding and indexing all your pages.'}
        />
        <Check
          pass={!!content.hasSchema}
          label="Structured data (schema)"
          detail={content.hasSchema
            ? 'Structured data found — Google and AI assistants can read your business details.'
            : 'No schema markup found. Adding LocalBusiness schema helps you appear in local search results and AI assistant answers.'}
        />
        <Check
          pass={allImagesAlt}
          label="Image alt text"
          tag={content.imagesTotal != null
            ? `${(content.imagesTotal ?? 0) - (content.imagesMissingAlt ?? 0)}/${content.imagesTotal} described`
            : undefined}
          detail={allImagesAlt
            ? 'All images have descriptions — good for accessibility and search engines.'
            : `${content.imagesMissingAlt} image${(content.imagesMissingAlt ?? 0) > 1 ? 's' : ''} missing alt text. Screen readers and Google can't read these images.`}
        />
      </SectionCard>

      {/* Tracking */}
      <SectionCard title="Tracking">
        <Check
          pass={!!content.hasAnalytics}
          label="Google Analytics / Tag Manager"
          detail={content.hasAnalytics
            ? 'Tracking found — you can see which pages and sources bring in enquiries.'
            : 'Not found. Without analytics, there\'s no way to tell which pages or ads bring in enquiries — marketing money gets spent on guesswork.'}
        />
        <Check
          pass={!!content.hasMetaPixel}
          label="Meta (Facebook) Pixel"
          detail={content.hasMetaPixel
            ? 'Meta Pixel found — you can retarget website visitors with Facebook/Instagram ads.'
            : 'Not found. Adding the Meta Pixel lets you retarget people who visited your site with Facebook and Instagram ads.'}
        />
        <Check
          pass={!!content.hasGoogleAds}
          label="Google Ads conversion tag"
          detail={content.hasGoogleAds
            ? 'Google Ads tracking found — you can measure which ad clicks become enquiries.'
            : 'Not found. If you run Google Ads, a conversion tag lets you see which keywords and ads are actually generating leads.'}
        />
      </SectionCard>

      {/* Enquiry Path */}
      <SectionCard title="Enquiry Path">
        <Check
          pass={!!content.hasTapToCall}
          label="Tap-to-call phone link"
          detail={content.hasTapToCall
            ? 'A tap-to-call link is in place — mobile visitors can call with one tap.'
            : 'No tap-to-call link found. Mobile visitors have to manually copy-paste your number — most won\'t bother.'}
        />
        <Check
          pass={content.hasContact}
          label="Contact details on page"
          detail={content.hasContact
            ? 'Contact details are visible on the page.'
            : 'We couldn\'t find a phone number or email on the page. Visitors who can\'t reach you quickly will call your competitor.'}
        />
        <Check
          pass={content.hasCta}
          label="Clear call to action"
          detail={content.hasCta
            ? 'Your page has a clear next step for visitors.'
            : 'No obvious call to action found. Visitors who are ready to enquire may not know what to do next.'}
        />
      </SectionCard>

      {/* CTA */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 text-center">
        <h3 className="font-bold text-white text-lg mb-2">
          {grade === 'A' ? 'Want to go further?' : 'Ready to fix this?'}
        </h3>
        <p className="text-slate-300 text-sm mb-5 leading-relaxed max-w-md mx-auto">
          {grade === 'A'
            ? 'We can review your conversion flow, design, and content to find growth opportunities beyond the basics.'
            : 'We fix exactly these problems for local businesses. Book a free 15-minute call and we\'ll walk through your site together — no obligation.'}
        </p>
        <a
          href="/brief"
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
            Enter your website below and get an instant audit — in plain English, not tech jargon. We'll show you exactly what's working and what's costing you business.
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
