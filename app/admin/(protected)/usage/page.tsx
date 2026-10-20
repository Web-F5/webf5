'use client'

import { useEffect, useState } from 'react'

interface UsageData {
  reviewSends:    { total: number; thisMonth: number; emailsTotal: number; emailsThisMonth: number }
  outreachSends:  { total: number; thisMonth: number }
  prospects:      { total: number; thisMonth: number; researched: number }
  auditLeads:     { total: number; thisMonth: number }
  checklistLeads: { total: number; thisMonth: number }
  reviewLeads:    { total: number; thisMonth: number }
  costs:          { estimatedPlacesCost: number; pagespeedCost: number }
  generatedAt:    string
}

function StatCard({ label, total, thisMonth, sub }: { label: string; total: number; thisMonth: number; sub?: string }) {
  return (
    <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-3xl font-bold text-white tabular-nums">{total.toLocaleString()}</div>
      <div className="text-sm text-indigo-400 mt-1">+{thisMonth} this month</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  )
}

function CostCard({ label, amount, note }: { label: string; amount: number; note: string }) {
  return (
    <div className="bg-slate-800/50 border border-amber-500/20 rounded-xl p-5">
      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-3xl font-bold text-amber-400 tabular-nums">${amount.toFixed(2)}</div>
      <div className="text-xs text-slate-500 mt-1">{note}</div>
    </div>
  )
}

function QuickLink({ label, href, desc }: { label: string; href: string; desc: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between bg-slate-800/50 border border-white/10 rounded-xl p-4 hover:border-indigo-500/50 hover:bg-slate-700/50 transition-colors group"
    >
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
      </div>
      <span className="text-slate-500 group-hover:text-indigo-400 transition-colors text-lg">↗</span>
    </a>
  )
}

export default function UsagePage() {
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/usage')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
      <div className="text-slate-400 text-sm">Loading usage data…</div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
      <div className="text-red-400 text-sm">Failed to load usage data.</div>
    </div>
  )

  const refreshedAt = new Date(data.generatedAt).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Usage Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Activity across all Web F5 tools</p>
          </div>
          <div className="text-xs text-slate-500">Refreshed at {refreshedAt}</div>
        </div>

        {/* Leads section */}
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Lead Capture</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Audit Leads"
            total={data.auditLeads.total}
            thisMonth={data.auditLeads.thisMonth}
            sub="Free site audit tool"
          />
          <StatCard
            label="Checklist Leads"
            total={data.checklistLeads.total}
            thisMonth={data.checklistLeads.thisMonth}
            sub="SEO checklist download"
          />
          <StatCard
            label="Review Sender Leads"
            total={data.reviewLeads.total}
            thisMonth={data.reviewLeads.thisMonth}
            sub="Review tool signups"
          />
        </div>

        {/* Email section */}
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Emails Sent (Resend)</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Review Campaigns"
            total={data.reviewSends.total}
            thisMonth={data.reviewSends.thisMonth}
            sub={`${data.reviewSends.emailsTotal.toLocaleString()} total recipients`}
          />
          <StatCard
            label="Review Emails Sent"
            total={data.reviewSends.emailsTotal}
            thisMonth={data.reviewSends.emailsThisMonth}
            sub="Individual recipient emails"
          />
          <StatCard
            label="Cold Outreach Sent"
            total={data.outreachSends.total}
            thisMonth={data.outreachSends.thisMonth}
            sub="Outreach sender tool"
          />
        </div>

        {/* Outreach section */}
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Cold Outreach</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Prospects Added"
            total={data.prospects.total}
            thisMonth={data.prospects.thisMonth}
          />
          <StatCard
            label="Prospects Researched"
            total={data.prospects.researched}
            thisMonth={0}
            sub="PageSpeed + domain audit run"
          />
          <StatCard
            label="Emails Sent"
            total={data.outreachSends.total}
            thisMonth={data.outreachSends.thisMonth}
          />
        </div>

        {/* Cost estimates */}
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Estimated API Costs</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-2">
          <CostCard
            label="Google Places (est.)"
            amount={data.costs.estimatedPlacesCost}
            note={`~$0.049/prospect · ${data.prospects.total} prospects total`}
          />
          <CostCard
            label="PageSpeed Insights"
            amount={0}
            note="Free up to 25,000 calls/day"
          />
          <CostCard
            label="Resend"
            amount={0}
            note="3,000 free emails/month — check dashboard for overage"
          />
        </div>
        <p className="text-xs text-slate-500 mb-8">
          Places cost = 1 Text Search ($0.032) + 1 Details ($0.017) per prospect. Google gives $200 free credit/month.
          Actual usage may differ based on search volume and filter pagination.
        </p>

        {/* Quick links */}
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">External Dashboards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <QuickLink
            label="Google Cloud Console — Places API"
            href="https://console.cloud.google.com/apis/api/places-backend.googleapis.com/quotas"
            desc="View quota usage, billing and API keys"
          />
          <QuickLink
            label="Google Cloud Billing"
            href="https://console.cloud.google.com/billing"
            desc="View current charges and free credit remaining"
          />
          <QuickLink
            label="Resend Dashboard"
            href="https://resend.com/overview"
            desc="Email delivery stats, bounces and billing"
          />
          <QuickLink
            label="Resend Emails Log"
            href="https://resend.com/emails"
            desc="Full send history and individual email status"
          />
          <QuickLink
            label="PageSpeed Insights API"
            href="https://console.cloud.google.com/apis/api/pagespeedonline.googleapis.com/quotas"
            desc="View PageSpeed quota usage"
          />
          <QuickLink
            label="Neon Database"
            href="https://console.neon.tech"
            desc="Postgres usage, storage and compute hours"
          />
        </div>

      </div>
    </div>
  )
}
