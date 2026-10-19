'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// ── Types ──────────────────────────────────────────────────────────────────

interface ResearchData {
  url?: string
  researchedAt?: string
  grade?: string
  perfScore?: number | null
  seoScore?: number | null
  scraped?: {
    title?: string | null
    metaDesc?: string | null
    h1?: string | null
    visibleText?: string
    hasMobileViewport?: boolean
    hasCanonical?: boolean
  } | null
  mobile?: {
    score?: number | null
    seo?: number | null
    accessibility?: number | null
    bestPractices?: number | null
    lcp?: number | null
    cls?: number | null
    tbt?: number | null
    pageWeightKb?: number | null
    opportunities?: { id: string; title: string; score: number }[]
  } | null
}

interface Prospect {
  id: string
  name: string
  title?: string | null
  company: string
  website?: string | null
  email: string
  linkedin?: string | null
  notes?: string | null
  researchData: ResearchData
  createdAt: string
  updatedAt: string
}

interface OutreachSend {
  id: string
  prospectId: string
  subject: string
  body: string
  sequenceName?: string | null
  touchType?: string | null
  status: string
  createdAt: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'just now'
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function gradeColor(grade?: string): string {
  return { A: 'text-emerald-400', B: 'text-lime-400', C: 'text-amber-400', D: 'text-red-400' }[grade ?? ''] ?? 'text-slate-400'
}

function scoreBar(score?: number | null): string {
  if (score == null) return 'bg-slate-600'
  if (score >= 90) return 'bg-emerald-500'
  if (score >= 70) return 'bg-lime-500'
  if (score >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

// ── Main component ─────────────────────────────────────────────────────────

export default function OutreachSenderPage() {
  const [prospects, setProspects]         = useState<Prospect[]>([])
  const [sendsByProspect, setSendsByProspect] = useState<Record<string, OutreachSend[]>>({})
  const [loading, setLoading]             = useState(true)

  // Prospect form
  const [showForm, setShowForm]           = useState(false)
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null)
  const [pName, setPName]                 = useState('')
  const [pTitle, setPTitle]               = useState('')
  const [pCompany, setPCompany]           = useState('')
  const [pWebsite, setPWebsite]           = useState('')
  const [pEmail, setPEmail]               = useState('')
  const [pLinkedIn, setPLinkedIn]         = useState('')
  const [pNotes, setPNotes]               = useState('')
  const [saving, setSaving]               = useState(false)

  // Research
  const [researching, setResearching]     = useState<string | null>(null)

  // Email composer
  const [composingFor, setComposingFor]   = useState<Prospect | null>(null)
  const [emailSubject, setEmailSubject]   = useState('')
  const [emailBody, setEmailBody]         = useState('')
  const [sending, setSending]             = useState(false)
  const [sendSuccess, setSendSuccess]     = useState(false)

  // Selected prospect detail view
  const [selectedId, setSelectedId]       = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/outreach')
    const data = await res.json()
    setProspects(data.prospects ?? [])
    setSendsByProspect(data.sendsByProspect ?? {})
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function openForm(prospect?: Prospect) {
    if (prospect) {
      setEditingProspect(prospect)
      setPName(prospect.name)
      setPTitle(prospect.title ?? '')
      setPCompany(prospect.company)
      setPWebsite(prospect.website ?? '')
      setPEmail(prospect.email)
      setPLinkedIn(prospect.linkedin ?? '')
      setPNotes(prospect.notes ?? '')
    } else {
      setEditingProspect(null)
      setPName(''); setPTitle(''); setPCompany(''); setPWebsite('')
      setPEmail(''); setPLinkedIn(''); setPNotes('')
    }
    setShowForm(true)
  }

  async function saveProspect() {
    if (!pName.trim() || !pCompany.trim() || !pEmail.trim()) return
    setSaving(true)
    await fetch('/api/admin/outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save_prospect',
        id: editingProspect?.id,
        name: pName, title: pTitle, company: pCompany,
        website: pWebsite, email: pEmail, linkedin: pLinkedIn, notes: pNotes,
      }),
    })
    await load()
    setSaving(false)
    setShowForm(false)
  }

  async function deleteProspect(id: string) {
    if (!confirm('Delete this prospect and all their email history?')) return
    await fetch('/api/admin/outreach', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (selectedId === id) setSelectedId(null)
    await load()
  }

  async function runResearch(prospect: Prospect) {
    if (!prospect.website) return alert('Add a website URL first.')
    setResearching(prospect.id)
    await fetch('/api/admin/outreach/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prospectId: prospect.id, url: prospect.website }),
    })
    await load()
    setResearching(null)
  }

  function openComposer(prospect: Prospect) {
    setComposingFor(prospect)
    setSendSuccess(false)
    // Pre-fill subject using research data
    const rd = prospect.researchData
    const site = rd?.scraped?.title ?? prospect.company
    setEmailSubject(`quick idea for ${prospect.company}`)
    // Generate a personalised opener using research
    const issues: string[] = []
    if (rd?.perfScore != null && rd.perfScore < 70) issues.push(`your website speed score is ${rd.perfScore}/100`)
    if (rd?.seoScore  != null && rd.seoScore  < 70) issues.push(`there are SEO opportunities we spotted`)
    if (rd?.mobile?.opportunities?.length) issues.push(`we found ${rd.mobile.opportunities.length} performance improvements`)
    const painLine = issues.length
      ? `In reviewing ${prospect.website ?? prospect.company + '\\'s site'}, we noticed ${issues[0]}.`
      : `We work with businesses like ${prospect.company} to improve their online presence.`

    setEmailBody(`Hi ${prospect.name.split(' ')[0]},

${painLine}

We help businesses in your space build faster, better-converting websites that rank higher on Google — without the typical agency runaround.

We've done this for clients similar to ${prospect.company} and typically see measurable results within 60 days.

Worth a quick 15-minute chat to see if there's a fit?

Josh Ekberg
Web F5
webf5.com.au`)
  }

  async function sendEmail() {
    if (!composingFor || !emailSubject.trim() || !emailBody.trim()) return
    setSending(true)
    const res = await fetch('/api/admin/outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send',
        prospectId: composingFor.id,
        subject: emailSubject,
        emailBody,
      }),
    })
    const data = await res.json()
    if (data.success) {
      setSendSuccess(true)
      await load()
      setTimeout(() => { setComposingFor(null); setSendSuccess(false) }, 2000)
    } else {
      alert(data.error ?? 'Send failed.')
    }
    setSending(false)
  }

  const selected = prospects.find(p => p.id === selectedId)

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="text-white px-4 py-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Back link */}
        <div>
          <Link href="/admin/outreach" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← Sequences reference
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Cold Outreach Sender</h1>
            <p className="text-slate-400 text-sm mt-1">Research prospects, then send targeted emails — {prospects.length} prospect{prospects.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => openForm()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Add Prospect
          </button>
        </div>

        {/* Add / Edit prospect form */}
        {showForm && (
          <div className="bg-[#111827] border border-white/10 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-base">{editingProspect ? 'Edit Prospect' : 'New Prospect'}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Name *</label>
                <input value={pName} onChange={e => setPName(e.target.value)} placeholder="Jane Smith"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Title / Role</label>
                <input value={pTitle} onChange={e => setPTitle(e.target.value)} placeholder="Marketing Manager"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Company *</label>
                <input value={pCompany} onChange={e => setPCompany(e.target.value)} placeholder="Acme Corp"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Website</label>
                <input value={pWebsite} onChange={e => setPWebsite(e.target.value)} placeholder="acmecorp.com.au"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Email *</label>
                <input value={pEmail} onChange={e => setPEmail(e.target.value)} placeholder="jane@acmecorp.com.au" type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">LinkedIn URL</label>
                <input value={pLinkedIn} onChange={e => setPLinkedIn(e.target.value)} placeholder="linkedin.com/in/..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Manual notes (pain points, trigger events, context)</label>
              <textarea value={pNotes} onChange={e => setPNotes(e.target.value)} rows={3}
                placeholder="e.g. Recently hired a new marketing manager. Their site looks outdated. They run Google Ads but landing page is slow."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={saveProspect} disabled={saving || !pName.trim() || !pCompany.trim() || !pEmail.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                {saving ? 'Saving…' : 'Save Prospect'}
              </button>
              <button onClick={() => setShowForm(false)} className="text-sm text-slate-400 hover:text-white px-4 py-2 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Main layout: list + detail */}
        <div className="grid lg:grid-cols-[320px_1fr] gap-5 items-start">

          {/* Prospect list */}
          <div className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Prospects
            </div>
            {loading && (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">Loading…</div>
            )}
            {!loading && prospects.length === 0 && (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">No prospects yet. Add one above.</div>
            )}
            {prospects.map(p => {
              const rd = p.researchData as ResearchData
              const sends = sendsByProspect[p.id] ?? []
              return (
                <button key={p.id} onClick={() => setSelectedId(p.id === selectedId ? null : p.id)}
                  className={`w-full text-left px-4 py-3.5 border-b border-white/5 last:border-0 transition-colors ${
                    p.id === selectedId
                      ? 'bg-indigo-500/15 border-l-2 border-l-indigo-500'
                      : 'hover:bg-white/5 border-l-2 border-l-transparent'
                  }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white truncate">{p.name}</div>
                      <div className="text-xs text-slate-400 truncate">{p.title ? `${p.title} · ` : ''}{p.company}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                      {rd?.grade && rd.grade !== '?' && (
                        <span className={`text-xs font-bold font-mono ${gradeColor(rd.grade)}`}>{rd.grade}</span>
                      )}
                      {sends.length > 0 && (
                        <span className="text-xs bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full">{sends.length}</span>
                      )}
                    </div>
                  </div>
                  {p.website && (
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{p.website}</div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Prospect detail panel */}
          {selected ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-[#111827] border border-white/10 rounded-xl px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">{selected.name}</h2>
                    {selected.title && <p className="text-sm text-slate-400 mt-0.5">{selected.title}</p>}
                    <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-300">
                      <span>{selected.company}</span>
                      {selected.email && <a href={`mailto:${selected.email}`} className="text-indigo-400 hover:text-indigo-300">{selected.email}</a>}
                      {selected.website && <a href={selected.website.startsWith('http') ? selected.website : `https://${selected.website}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">{selected.website}</a>}
                      {selected.linkedin && <a href={selected.linkedin} target="_blank" rel="noreferrer" className="text-sky-400 hover:text-sky-300">LinkedIn</a>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openForm(selected)} className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors">
                      Edit
                    </button>
                    <button onClick={() => deleteProspect(selected.id)} className="text-xs px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
                {selected.notes && (
                  <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
                    <p className="text-xs text-amber-200 leading-relaxed"><span className="font-semibold">Notes: </span>{selected.notes}</p>
                  </div>
                )}
              </div>

              {/* Research panel */}
              <div className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
                  <div>
                    <h3 className="font-semibold text-sm">Website Research</h3>
                    {(selected.researchData as ResearchData)?.researchedAt && (
                      <p className="text-xs text-slate-500 mt-0.5">Last run {timeAgo((selected.researchData as ResearchData).researchedAt!)}</p>
                    )}
                  </div>
                  <button
                    onClick={() => runResearch(selected)}
                    disabled={researching === selected.id || !selected.website}
                    className="text-xs px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {researching === selected.id ? 'Researching…' : selected.website ? '⟳ Run Research' : 'Add website first'}
                  </button>
                </div>

                {(() => {
                  const rd = selected.researchData as ResearchData
                  if (!rd?.researchedAt) {
                    return (
                      <div className="px-5 py-8 text-center text-slate-500 text-sm">
                        No research data yet. Click &ldquo;Run Research&rdquo; to analyse their website.
                      </div>
                    )
                  }
                  return (
                    <div className="p-5 space-y-4">
                      {/* Scores row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: 'Performance', score: rd.mobile?.score },
                          { label: 'SEO',         score: rd.mobile?.seo ?? rd.seoScore },
                          { label: 'Accessibility', score: rd.mobile?.accessibility },
                          { label: 'Best Practices', score: rd.mobile?.bestPractices },
                        ].map(({ label, score }) => (
                          <div key={label} className="bg-white/5 rounded-lg p-3 text-center">
                            <div className="text-xs text-slate-400 mb-1">{label}</div>
                            <div className={`text-2xl font-bold font-mono ${score == null ? 'text-slate-600' : score >= 90 ? 'text-emerald-400' : score >= 70 ? 'text-lime-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                              {score ?? '—'}
                            </div>
                            {score != null && (
                              <div className="mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${scoreBar(score)}`} style={{ width: `${score}%` }} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Scraped content */}
                      {rd.scraped && (
                        <div className="space-y-2">
                          {rd.scraped.title && (
                            <div className="flex gap-2 text-sm">
                              <span className="text-slate-500 w-24 shrink-0">Page title</span>
                              <span className="text-slate-200">{rd.scraped.title}</span>
                            </div>
                          )}
                          {rd.scraped.h1 && (
                            <div className="flex gap-2 text-sm">
                              <span className="text-slate-500 w-24 shrink-0">Main heading</span>
                              <span className="text-slate-200">{rd.scraped.h1}</span>
                            </div>
                          )}
                          {rd.scraped.metaDesc && (
                            <div className="flex gap-2 text-sm">
                              <span className="text-slate-500 w-24 shrink-0">Meta desc</span>
                              <span className="text-slate-400 text-xs leading-relaxed">{rd.scraped.metaDesc}</span>
                            </div>
                          )}
                          {rd.scraped.visibleText && (
                            <div>
                              <div className="text-xs text-slate-500 mb-1">Homepage text (excerpt)</div>
                              <div className="text-xs text-slate-400 bg-white/5 rounded-lg p-3 leading-relaxed max-h-28 overflow-y-auto">
                                {rd.scraped.visibleText}
                              </div>
                            </div>
                          )}
                          <div className="flex gap-4 text-xs text-slate-500">
                            <span className={rd.scraped.hasMobileViewport ? 'text-emerald-400' : 'text-red-400'}>
                              {rd.scraped.hasMobileViewport ? '✓' : '✗'} Mobile viewport
                            </span>
                            <span className={rd.scraped.hasCanonical ? 'text-emerald-400' : 'text-amber-400'}>
                              {rd.scraped.hasCanonical ? '✓' : '○'} Canonical tag
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Opportunities */}
                      {rd.mobile?.opportunities && rd.mobile.opportunities.length > 0 && (
                        <div>
                          <div className="text-xs text-slate-500 mb-2">Top opportunities to mention</div>
                          <ul className="space-y-1">
                            {rd.mobile.opportunities.map(op => (
                              <li key={op.id} className="text-xs text-amber-200 flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5">▸</span> {op.title}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>

              {/* Email composer */}
              <div className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
                  <h3 className="font-semibold text-sm">Compose Email</h3>
                  {composingFor?.id !== selected.id && (
                    <button
                      onClick={() => openComposer(selected)}
                      className="text-xs px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-lg transition-colors"
                    >
                      ✏ Compose
                    </button>
                  )}
                </div>

                {composingFor?.id === selected.id ? (
                  <div className="p-5 space-y-4">
                    {sendSuccess ? (
                      <div className="text-center py-6 text-emerald-400 font-medium">✓ Email sent successfully!</div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Subject</label>
                          <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Body (plain text — signature added automatically)</label>
                          <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={12}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-indigo-500 resize-y" />
                        </div>
                        <div className="flex gap-3 items-center">
                          <button onClick={sendEmail} disabled={sending || !emailSubject.trim() || !emailBody.trim()}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                            {sending ? 'Sending…' : `Send to ${selected.email}`}
                          </button>
                          <button onClick={() => setComposingFor(null)} className="text-sm text-slate-400 hover:text-white transition-colors">
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="px-5 py-4 text-sm text-slate-500">
                    Click &ldquo;Compose&rdquo; to draft a personalised email using the research data above.
                  </div>
                )}
              </div>

              {/* Send history */}
              {(sendsByProspect[selected.id] ?? []).length > 0 && (
                <div className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-white/10">
                    <h3 className="font-semibold text-sm">Send History</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {(sendsByProspect[selected.id] ?? []).map(s => (
                      <div key={s.id} className="px-5 py-3.5">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-white">{s.subject}</p>
                            {s.sequenceName && <p className="text-xs text-slate-500 mt-0.5">{s.sequenceName} · {s.touchType}</p>}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${
                              s.status === 'replied'
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                : 'bg-slate-500/15 border-slate-500/30 text-slate-400'
                            }`}>{s.status}</span>
                            <span className="text-xs text-slate-500">{timeAgo(s.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#111827] border border-white/10 rounded-xl px-6 py-12 text-center text-slate-500">
              <p className="text-sm">Select a prospect from the list to view their profile, run research, and compose emails.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
