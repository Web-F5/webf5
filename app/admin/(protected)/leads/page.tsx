import { db, auditLeads, checklistLeads, reviewSenderLeads } from '@/lib/db'
import { desc } from 'drizzle-orm'
import { DeleteAuditLead, DeleteChecklistLead } from './DeleteButton'

export const dynamic = 'force-dynamic'

const GRADE_STYLE: Record<string, string> = {
  A: 'bg-green-500/20 text-green-300 border-green-500/30',
  B: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
  C: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  D: 'bg-red-500/20 text-red-300 border-red-500/30',
}

interface ReportShape {
  grade:          string
  overallScore?:  number
  lcp:            number
  pageSpeedScore?: number | null
  desktopScore?:  number | null
  lighthouseAccessibility?: number | null
  lighthouseBestPractices?: number | null
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
    metaTitle:    string | null
    metaDesc:     string | null
    h1:           string | null
    metaTitleLen?: number | null
    metaDescLen?:  number | null
    hasContact:   boolean
    hasCta:       boolean
    hasTapToCall?: boolean
    hasSchema?:   boolean
    hasCanonical?: boolean
    hasFavicon?:  boolean
    hasLang?:     boolean
    hasViewport?: boolean
    hasAnalytics?: boolean
    hasMetaPixel?: boolean
    hasGoogleAds?: boolean
    hasOpenGraph?: boolean
    hasTwitterCard?: boolean
    imagesTotal?:   number
    imagesMissingAlt?: number
    linkCount?:    number
  }
}

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000)
  if (secs < 60)    return `${secs}s ago`
  if (secs < 3600)  return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

function T({ v }: { v: boolean | null | undefined }) {
  if (v == null) return <span className="text-slate-700 text-xs">—</span>
  return <span className="text-sm">{v ? '✅' : '❌'}</span>
}

function Num({ v, good, ok }: { v: number | null | undefined; good: number; ok: number }) {
  if (v == null) return <span className="text-slate-700 text-xs">—</span>
  const cls = v >= good ? 'text-emerald-400' : v >= ok ? 'text-amber-400' : 'text-red-400'
  return <span className={`text-xs font-mono font-semibold ${cls}`}>{v}</span>
}

export default async function AdminLeadsPage() {
  const [leads, checklistDownloads, reviewLeads] = await Promise.all([
    db.select().from(auditLeads).orderBy(desc(auditLeads.createdAt)).limit(200),
    db.select().from(checklistLeads).orderBy(desc(checklistLeads.createdAt)).limit(200),
    db.select().from(reviewSenderLeads).orderBy(desc(reviewSenderLeads.createdAt)).limit(200),
  ])

  const grades = leads.map(l => (l.report as ReportShape)?.grade ?? '?')
  const stats = {
    total: leads.length,
    gradeA: grades.filter(g => g === 'A').length,
    gradeD: grades.filter(g => g === 'D').length,
    withFrustration: leads.filter(l => l.biggestFrustration).length,
  }

  return (
    <div className="text-white px-4 py-10">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold">Audit Leads</h1>
            <p className="text-slate-400 text-sm mt-1">Website audit submissions · most recent first · last 200</p>
          </div>
          <a
            href="/audit"
            target="_blank"
            className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/50 px-3 py-1.5 rounded-lg transition-colors"
          >
            View audit page ↗
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Audit leads',        value: stats.total },
            { label: 'Grade A sites',       value: stats.gradeA },
            { label: 'Grade D sites',       value: stats.gradeD },
            { label: 'With frustration',    value: stats.withFrustration },
          ].map(s => (
            <div key={s.label} className="bg-[#111827] border border-white/10 rounded-xl px-5 py-4">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-slate-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-[#111827] text-slate-400 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Business / URL</th>
                <th className="px-4 py-3 text-left">Industry</th>
                <th className="px-4 py-3 text-center">Grade</th>
                <th className="px-4 py-3 text-center" title="Overall score">Score</th>
                {/* Sub-scores */}
                <th className="px-3 py-3 text-center" title="On-Page sub-score">On-Pg</th>
                <th className="px-3 py-3 text-center" title="Performance sub-score">Perf</th>
                <th className="px-3 py-3 text-center" title="Usability sub-score">Usab</th>
                <th className="px-3 py-3 text-center" title="Social sub-score">Social</th>
                {/* Performance */}
                <th className="px-3 py-3 text-center" title="Mobile LCP">LCP</th>
                <th className="px-3 py-3 text-center" title="Mobile PageSpeed">Mob</th>
                <th className="px-3 py-3 text-center" title="Desktop PageSpeed">Dsk</th>
                <th className="px-3 py-3 text-center" title="Lighthouse Accessibility">A11y</th>
                <th className="px-3 py-3 text-center" title="Lighthouse Best Practices">BP</th>
                {/* SEO */}
                <th className="px-3 py-3 text-center" title="HTTPS / SSL">SSL</th>
                <th className="px-3 py-3 text-center" title="Page title">Title</th>
                <th className="px-3 py-3 text-center" title="Meta description">Desc</th>
                <th className="px-3 py-3 text-center" title="H1 heading">H1</th>
                <th className="px-3 py-3 text-center" title="Canonical tag">Can</th>
                <th className="px-3 py-3 text-center" title="XML sitemap">Sitemap</th>
                <th className="px-3 py-3 text-center" title="robots.txt">Robots</th>
                <th className="px-3 py-3 text-center" title="Structured data / schema">Schema</th>
                <th className="px-3 py-3 text-center" title="Image alt text">Alt</th>
                <th className="px-3 py-3 text-center" title="Favicon">Fav</th>
                <th className="px-3 py-3 text-center" title="lang attribute">Lang</th>
                <th className="px-3 py-3 text-center" title="Viewport meta tag">Vp</th>
                <th className="px-3 py-3 text-center" title="llms.txt">LLMs</th>
                {/* Tracking & Social */}
                <th className="px-3 py-3 text-center" title="Google Analytics / GTM">GA</th>
                <th className="px-3 py-3 text-center" title="Meta Pixel">Pixel</th>
                <th className="px-3 py-3 text-center" title="Google Ads tag">GAds</th>
                <th className="px-3 py-3 text-center" title="Open Graph tags">OG</th>
                <th className="px-3 py-3 text-center" title="Twitter/X card">TW</th>
                {/* Enquiry */}
                <th className="px-3 py-3 text-center" title="Tap-to-call link">Tel</th>
                <th className="px-3 py-3 text-center" title="Contact details">Cntct</th>
                <th className="px-3 py-3 text-center" title="Call to action">CTA</th>
                <th className="px-4 py-3 text-left">Frustration</th>
                <th className="px-4 py-3 text-left">Received</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.map(lead => {
                const r = lead.report as ReportShape
                const grade = r?.grade ?? '?'
                const allImagesAlt = (r?.content?.imagesTotal ?? 0) === 0 || (r?.content?.imagesMissingAlt ?? 0) === 0
                return (
                  <tr key={lead.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{lead.name}</p>
                      <a href={`mailto:${lead.email}`} className="text-xs text-indigo-400 hover:underline">{lead.email}</a>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-200 font-medium">{lead.businessName}</p>
                      <a
                        href={lead.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-500 hover:text-indigo-300 transition-colors max-w-[180px] truncate block"
                      >
                        {lead.url.replace(/^https?:\/\//, '')}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{lead.industry || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${GRADE_STYLE[grade] ?? 'bg-slate-500/20 text-slate-300 border-slate-500/30'}`}>
                        {grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r?.overallScore != null
                        ? <Num v={r.overallScore} good={85} ok={65} />
                        : <span className="text-slate-700 text-xs">—</span>}
                    </td>
                    {/* Sub-scores */}
                    <td className="px-3 py-3 text-center"><Num v={r?.subScores?.onPage}      good={80} ok={60} /></td>
                    <td className="px-3 py-3 text-center"><Num v={r?.subScores?.performance} good={80} ok={60} /></td>
                    <td className="px-3 py-3 text-center"><Num v={r?.subScores?.usability}   good={80} ok={60} /></td>
                    <td className="px-3 py-3 text-center"><Num v={r?.subScores?.social}      good={80} ok={60} /></td>
                    {/* Performance */}
                    <td className="px-3 py-3 text-center">
                      {r?.lcp != null
                        ? <span className={`text-xs font-mono font-semibold ${r.lcp < 2.5 ? 'text-emerald-400' : r.lcp < 4 ? 'text-amber-400' : 'text-red-400'}`}>{r.lcp.toFixed(1)}s</span>
                        : <span className="text-slate-700 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-3 text-center"><Num v={r?.pageSpeedScore} good={90} ok={70} /></td>
                    <td className="px-3 py-3 text-center"><Num v={r?.desktopScore}   good={90} ok={70} /></td>
                    <td className="px-3 py-3 text-center"><Num v={r?.lighthouseAccessibility} good={90} ok={80} /></td>
                    <td className="px-3 py-3 text-center"><Num v={r?.lighthouseBestPractices} good={90} ok={80} /></td>
                    {/* SEO */}
                    <td className="px-3 py-3 text-center"><T v={r?.ssl} /></td>
                    <td className="px-3 py-3 text-center" title={r?.content?.metaTitle ?? undefined}><T v={!!r?.content?.metaTitle} /></td>
                    <td className="px-3 py-3 text-center"><T v={!!r?.content?.metaDesc} /></td>
                    <td className="px-3 py-3 text-center" title={r?.content?.h1 ?? undefined}><T v={!!r?.content?.h1} /></td>
                    <td className="px-3 py-3 text-center"><T v={r?.content?.hasCanonical} /></td>
                    <td className="px-3 py-3 text-center"><T v={r?.hasSitemap} /></td>
                    <td className="px-3 py-3 text-center"><T v={r?.hasRobotsTxt} /></td>
                    <td className="px-3 py-3 text-center"><T v={r?.content?.hasSchema} /></td>
                    <td className="px-3 py-3 text-center"><T v={allImagesAlt} /></td>
                    <td className="px-3 py-3 text-center"><T v={r?.content?.hasFavicon} /></td>
                    <td className="px-3 py-3 text-center"><T v={r?.content?.hasLang} /></td>
                    <td className="px-3 py-3 text-center"><T v={r?.content?.hasViewport} /></td>
                    <td className="px-3 py-3 text-center"><T v={r?.hasLlmsTxt} /></td>
                    {/* Tracking & Social */}
                    <td className="px-3 py-3 text-center"><T v={r?.content?.hasAnalytics} /></td>
                    <td className="px-3 py-3 text-center"><T v={r?.content?.hasMetaPixel} /></td>
                    <td className="px-3 py-3 text-center"><T v={r?.content?.hasGoogleAds} /></td>
                    <td className="px-3 py-3 text-center"><T v={r?.content?.hasOpenGraph} /></td>
                    <td className="px-3 py-3 text-center"><T v={r?.content?.hasTwitterCard} /></td>
                    {/* Enquiry */}
                    <td className="px-3 py-3 text-center"><T v={r?.content?.hasTapToCall} /></td>
                    <td className="px-3 py-3 text-center"><T v={r?.content?.hasContact} /></td>
                    <td className="px-3 py-3 text-center"><T v={r?.content?.hasCta} /></td>
                    <td className="px-4 py-3">
                      {lead.biggestFrustration
                        ? <p className="text-xs text-slate-300 max-w-[180px] truncate" title={lead.biggestFrustration}>{lead.biggestFrustration}</p>
                        : <span className="text-slate-600 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{timeAgo(new Date(lead.createdAt))}</td>
                    <td className="px-4 py-3"><DeleteAuditLead id={lead.id} /></td>
                  </tr>
                )
              })}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={40} className="px-4 py-16 text-center text-slate-500">
                    No audit leads yet. Share <span className="text-indigo-400">/audit</span> to start collecting them.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Checklist Downloads */}
        <div>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">Checklist Downloads</h2>
              <p className="text-slate-400 text-sm mt-0.5">12-Point Website Checklist lead magnet · most recent first</p>
            </div>
            <a
              href="/resources/website-checklist"
              target="_blank"
              className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/50 px-3 py-1.5 rounded-lg transition-colors"
            >
              View checklist page ↗
            </a>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#111827] text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Business</th>
                  <th className="px-4 py-3 text-left">Industry</th>
                  <th className="px-4 py-3 text-left">Downloaded</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {checklistDownloads.map(lead => (
                  <tr key={lead.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-white">{lead.name}</p>
                      <a href={`mailto:${lead.email}`} className="text-xs text-indigo-400 hover:underline">{lead.email}</a>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">{lead.businessName || '—'}</td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs">{lead.industry || '—'}</td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                      {timeAgo(new Date(lead.createdAt))}
                    </td>
                    <td className="px-4 py-3.5">
                      <DeleteChecklistLead id={lead.id} />
                    </td>
                  </tr>
                ))}
                {checklistDownloads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                      No checklist downloads yet. Share <span className="text-indigo-400">/resources/website-checklist</span> to start collecting them.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review Sender Leads */}
        <div>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">Review Sender Leads</h2>
              <p className="text-slate-400 text-sm mt-0.5">Businesses using the public Review Request Sender · most recent first</p>
            </div>
            <a
              href="/resources/review-sender"
              target="_blank"
              className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/50 px-3 py-1.5 rounded-lg transition-colors"
            >
              View tool ↗
            </a>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#111827] text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Business</th>
                  <th className="px-4 py-3 text-left">Platform</th>
                  <th className="px-4 py-3 text-center">Sent to</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reviewLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-white">{lead.senderName}</p>
                      <a href={`mailto:${lead.senderEmail}`} className="text-xs text-indigo-400 hover:underline">{lead.senderEmail}</a>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">{lead.businessName}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        lead.platform === 'google'   ? 'bg-blue-900/40 text-blue-300 border-blue-700/30' :
                        lead.platform === 'facebook' ? 'bg-blue-900/40 text-blue-400 border-blue-700/30' :
                        'bg-green-900/40 text-green-300 border-green-700/30'
                      }`}>
                        {{ google: 'Google', facebook: 'Facebook', custom: 'Trustpilot' }[lead.platform] ?? lead.platform}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center text-slate-300">{lead.recipientCount}</td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">{timeAgo(new Date(lead.createdAt))}</td>
                  </tr>
                ))}
                {reviewLeads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                      No review sender leads yet. Share <span className="text-indigo-400">/resources/review-sender</span> to start collecting them.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
