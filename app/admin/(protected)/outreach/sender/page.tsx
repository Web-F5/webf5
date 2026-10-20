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
  domainAge?: {
    registeredAt: string | null
    firstArchived: string | null
  } | null
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

interface PlaceResult {
  placeId: string
  name: string
  address: string
  types: string[]
  rating: number | null
  reviewCount: number
  hasWebsite: boolean
}

interface EnrichResult {
  placeId: string
  gbpUrl: string
  name: string
  website: string
  phone: string
  address: string
  types: string[]
  rating: number | null
  reviewCount: number
  emails: string[]
  linkedin?: string
  facebook?: string
  scrapedTitle?: string
  contactNames: string[]
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
  const [prospects, setProspects]             = useState<Prospect[]>([])
  const [sendsByProspect, setSendsByProspect] = useState<Record<string, OutreachSend[]>>({})
  const [loading, setLoading]                 = useState(true)

  // Prospect form
  const [showForm, setShowForm]               = useState(false)
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null)
  const [pName, setPName]                     = useState('')
  const [pTitle, setPTitle]                   = useState('')
  const [pCompany, setPCompany]               = useState('')
  const [pWebsite, setPWebsite]               = useState('')
  const [pEmail, setPEmail]                   = useState('')
  const [pLinkedIn, setPLinkedIn]             = useState('')
  const [pNotes, setPNotes]                   = useState('')
  const [saving, setSaving]                   = useState(false)

  // Business search / enrichment
  const [searchQuery, setSearchQuery]         = useState('')
  const [searching, setSearching]             = useState(false)
  const [searchResults, setSearchResults]     = useState<PlaceResult[]>([])
  const [enriching, setEnriching]             = useState(false)
  const [enrichResult, setEnrichResult]       = useState<EnrichResult | null>(null)
  // Search filters
  const [filterWebsite, setFilterWebsite]     = useState<'any' | 'with' | 'without'>('any')
  const [filterMinReviews, setFilterMinReviews] = useState('')
  const [filterMaxReviews, setFilterMaxReviews] = useState('')

  // Research
  const [researching, setResearching]         = useState<string | null>(null)

  // Email composer
  const [composingFor, setComposingFor]       = useState<Prospect | null>(null)
  const [emailSubject, setEmailSubject]       = useState('')
  const [emailBody, setEmailBody]             = useState('')
  const [sending, setSending]                 = useState(false)
  const [sendSuccess, setSendSuccess]         = useState(false)

  // Selected prospect detail view
  const [selectedId, setSelectedId]           = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/outreach')
    const data = await res.json()
    setProspects(data.prospects ?? [])
    setSendsByProspect(data.sendsByProspect ?? {})
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // ── Business search ────────────────────────────────────────────────────

  async function searchBusiness() {
    if (!searchQuery.trim()) return
    setSearching(true)
    setSearchResults([])
    setEnrichResult(null)
    const params = new URLSearchParams({ q: searchQuery.trim() })
    if (filterWebsite !== 'any') params.set('website', filterWebsite)
    if (filterMinReviews) params.set('minReviews', filterMinReviews)
    if (filterMaxReviews) params.set('maxReviews', filterMaxReviews)
    const res  = await fetch(`/api/admin/outreach/enrich?${params}`)
    const data = await res.json()
    setSearchResults(data.results ?? [])
    setSearching(false)
  }

  async function selectPlace(place: PlaceResult) {
    setEnriching(true)
    setEnrichResult(null)
    const res  = await fetch('/api/admin/outreach/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeId: place.placeId }),
    })
    const data: EnrichResult = await res.json()
    setEnrichResult(data)
    setEnriching(false)

    // Pre-fill the form with what we found
    setPCompany(data.name || place.name)
    setPWebsite(data.website || '')
    setPLinkedIn(data.linkedin || '')

    // Pre-select the first (non-generic) email if any
    if (data.emails.length > 0) {
      setPEmail(data.emails[0])
    }

    // Build notes from address, phone, business type
    const typeLine = data.types.filter(t => !['establishment', 'point_of_interest'].includes(t))
      .map(t => t.replace(/_/g, ' ')).join(', ')
    const noteParts: string[] = []
    if (data.address)  noteParts.push(`Address: ${data.address}`)
    if (data.phone)    noteParts.push(`Phone: ${data.phone}`)
    if (typeLine)      noteParts.push(`Type: ${typeLine}`)
    if (data.facebook) noteParts.push(`Facebook: ${data.facebook}`)
    setPNotes(noteParts.join('\n'))
  }

  function applyEnrichAndOpenForm() {
    setSearchResults([])
    setSearchQuery('')
    setShowForm(true)
  }

  // ── Prospect CRUD ──────────────────────────────────────────────────────

  function openForm(prospect?: Prospect) {
    setEnrichResult(null)
    setSearchResults([])
    setSearchQuery('')
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
    setEnrichResult(null)
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
    const rd = prospect.researchData
    setEmailSubject(`quick idea for ${prospect.company}`)
    const issues: string[] = []
    if (rd?.perfScore != null && rd.perfScore < 70) issues.push(`your website speed score is ${rd.perfScore}/100`)
    if (rd?.seoScore  != null && rd.seoScore  < 70) issues.push(`there are SEO opportunities we spotted`)
    if (rd?.mobile?.opportunities?.length) issues.push(`we found ${rd.mobile.opportunities.length} performance improvements`)
    const painLine = issues.length
      ? `In reviewing ${prospect.website ?? `${prospect.company}'s site`}, we noticed ${issues[0]}.`
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

  // ── Render ────────────────────────────────────────────────────────────────

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
            <p className="text-slate-400 text-sm mt-1">
              Search a business to auto-fill prospect details, then compose targeted emails — {prospects.length} prospect{prospects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => openForm()}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Manual entry
          </button>
        </div>

        {/* ── Business search ───────────────────────────────────────────────── */}
        <div className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <h2 className="font-semibold text-sm">Find a Business</h2>
            <p className="text-xs text-slate-500 mt-0.5">Search Google Business Profile — we&apos;ll pull their website, emails, and social links automatically</p>
          </div>
          <div className="p-5 space-y-4">

            {/* Search input */}
            <div className="flex gap-2">
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchBusiness()}
                placeholder="e.g. Smith Plumbing Geelong, or Acme Cafe Belmont VIC"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={searchBusiness}
                disabled={searching || !searchQuery.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                {searching ? 'Searching…' : 'Search'}
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Website</label>
                <div className="flex rounded-lg overflow-hidden border border-white/10 text-xs font-medium">
                  {(['any', 'with', 'without'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setFilterWebsite(v)}
                      className={`px-3 py-1.5 transition-colors ${
                        filterWebsite === v
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {v === 'any' ? 'Any' : v === 'with' ? 'Has website' : 'No website'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Min reviews</label>
                <input
                  type="number" min="0" value={filterMinReviews}
                  onChange={e => setFilterMinReviews(e.target.value)}
                  placeholder="0"
                  className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Max reviews</label>
                <input
                  type="number" min="0" value={filterMaxReviews}
                  onChange={e => setFilterMaxReviews(e.target.value)}
                  placeholder="any"
                  className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              {filterWebsite !== 'any' && (
                <p className="text-xs text-amber-400 self-end pb-1.5">
                  Website filter fetches details for each result — slightly slower
                </p>
              )}
            </div>

            {/* Search results */}
            {searchResults.length > 0 && !enrichResult && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Select the right business:</p>
                {searchResults.map(place => (
                  <button
                    key={place.placeId}
                    onClick={() => selectPlace(place)}
                    disabled={enriching}
                    className="w-full text-left bg-white/5 hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-500/30 rounded-lg px-4 py-3 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-white">{place.name}</div>
                      <div className="flex items-center gap-2 shrink-0 text-xs">
                        {place.rating != null && (
                          <span className="text-amber-400">★ {place.rating.toFixed(1)}</span>
                        )}
                        {place.reviewCount > 0 && (
                          <span className="text-slate-400">({place.reviewCount} reviews)</span>
                        )}
                        {filterWebsite !== 'any' && (
                          <span className={place.hasWebsite ? 'text-emerald-400' : 'text-slate-500'}>
                            {place.hasWebsite ? '● website' : '○ no website'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{place.address}</div>
                  </button>
                ))}
              </div>
            )}

            {enriching && (
              <div className="text-sm text-slate-400 animate-pulse">
                Fetching details and scraping website for emails and social links…
              </div>
            )}

            {/* Enrichment result */}
            {enrichResult && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-sm text-white">{enrichResult.name}</h3>
                    <a
                      href={enrichResult.gbpUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-full transition-colors"
                    >
                      View on Google ↗
                    </a>
                  </div>
                  <button onClick={() => { setEnrichResult(null); setSearchResults([]) }} className="text-xs text-slate-500 hover:text-white transition-colors">✕ Clear</button>
                </div>

                {/* Found data grid */}
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  {enrichResult.website && (
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Website</div>
                      <a href={enrichResult.website} target="_blank" rel="noreferrer" className="text-indigo-300 hover:text-indigo-200 text-xs truncate block">{enrichResult.website}</a>
                    </div>
                  )}
                  {enrichResult.phone && (
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Phone</div>
                      <div className="text-slate-200 text-xs">{enrichResult.phone}</div>
                    </div>
                  )}
                  {enrichResult.address && (
                    <div className="sm:col-span-2">
                      <div className="text-xs text-slate-500 mb-0.5">Address</div>
                      <div className="text-slate-200 text-xs">{enrichResult.address}</div>
                    </div>
                  )}
                  {enrichResult.linkedin && (
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">LinkedIn</div>
                      <a href={enrichResult.linkedin} target="_blank" rel="noreferrer" className="text-sky-400 text-xs hover:text-sky-300 truncate block">{enrichResult.linkedin}</a>
                    </div>
                  )}
                  {enrichResult.facebook && (
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Facebook</div>
                      <a href={enrichResult.facebook} target="_blank" rel="noreferrer" className="text-blue-400 text-xs hover:text-blue-300 truncate block">{enrichResult.facebook}</a>
                    </div>
                  )}
                </div>

                {/* Contact name picker */}
                {enrichResult.contactNames.length > 0 && (
                  <div>
                    <div className="text-xs text-slate-500 mb-2">
                      Found {enrichResult.contactNames.length} possible contact name{enrichResult.contactNames.length > 1 ? 's' : ''} — select one to use:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {enrichResult.contactNames.map(name => (
                        <button
                          key={name}
                          onClick={() => setPName(name)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                            pName === name
                              ? 'bg-emerald-500/25 border-emerald-500/50 text-emerald-200'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                          }`}
                        >
                          {pName === name ? '✓ ' : ''}{name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Email picker */}
                {enrichResult.emails.length > 0 ? (
                  <div>
                    <div className="text-xs text-slate-500 mb-2">
                      Found {enrichResult.emails.length} email{enrichResult.emails.length > 1 ? 's' : ''} on their website — select one to use:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {enrichResult.emails.map(email => (
                        <button
                          key={email}
                          onClick={() => setPEmail(email)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                            pEmail === email
                              ? 'bg-indigo-500/25 border-indigo-500/50 text-indigo-200'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                          }`}
                        >
                          {pEmail === email ? '✓ ' : ''}{email}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-amber-400">
                    No email addresses found on their website — you&apos;ll need to add one manually.
                  </div>
                )}

                {/* LinkedIn search link if not found */}
                {!enrichResult.linkedin && (
                  <div>
                    <a
                      href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(enrichResult.name)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-sky-400 hover:text-sky-300 underline"
                    >
                      Search LinkedIn for contacts at {enrichResult.name} →
                    </a>
                  </div>
                )}

                <button
                  onClick={applyEnrichAndOpenForm}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Fill in contact details →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Add / Edit prospect form ─────────────────────────────────────── */}
        {showForm && (
          <div className="bg-[#111827] border border-indigo-500/30 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-base">{editingProspect ? 'Edit Prospect' : 'Add Prospect'}</h2>

            {enrichResult && !editingProspect && (
              <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                Auto-filled from Google Business Profile + website scrape. Edit anything below before saving.
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Name * <span className="text-slate-500">(contact person)</span></label>
                <input value={pName} onChange={e => setPName(e.target.value)} placeholder="Jane Smith"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Title / Role</label>
                <input value={pTitle} onChange={e => setPTitle(e.target.value)} placeholder="Owner, Marketing Manager…"
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
                {enrichResult && enrichResult.emails.length > 1 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {enrichResult.emails.filter(e => e !== pEmail).map(e => (
                      <button key={e} onClick={() => setPEmail(e)} className="text-xs text-slate-500 hover:text-indigo-300 transition-colors">{e}</button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">LinkedIn URL</label>
                <input value={pLinkedIn} onChange={e => setPLinkedIn(e.target.value)} placeholder="linkedin.com/in/…"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Notes <span className="text-slate-500">(pain points, trigger events, address, phone — auto-filled from GBP)</span></label>
              <textarea value={pNotes} onChange={e => setPNotes(e.target.value)} rows={4}
                placeholder="e.g. Address: 12 Main St. Phone: 03 5555 0000. Recently hired a new marketing manager."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={saveProspect} disabled={saving || !pName.trim() || !pCompany.trim() || !pEmail.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                {saving ? 'Saving…' : 'Save Prospect'}
              </button>
              <button onClick={() => { setShowForm(false); setEnrichResult(null) }} className="text-sm text-slate-400 hover:text-white px-4 py-2 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Main layout: list + detail ────────────────────────────────────── */}
        <div className="grid lg:grid-cols-[320px_1fr] gap-5 items-start">

          {/* Prospect list */}
          <div className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Prospects
            </div>
            {loading && <div className="px-4 py-8 text-center text-slate-500 text-sm">Loading…</div>}
            {!loading && prospects.length === 0 && (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">No prospects yet. Search a business above.</div>
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
                  {p.website && <div className="text-xs text-slate-500 mt-0.5 truncate">{p.website}</div>}
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
                      {selected.website && (
                        <a href={selected.website.startsWith('http') ? selected.website : `https://${selected.website}`}
                          target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                          {selected.website}
                        </a>
                      )}
                      {selected.linkedin && <a href={selected.linkedin} target="_blank" rel="noreferrer" className="text-sky-400 hover:text-sky-300">LinkedIn</a>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openForm(selected)} className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors">Edit</button>
                    <button onClick={() => deleteProspect(selected.id)} className="text-xs px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-colors">Delete</button>
                  </div>
                </div>
                {selected.notes && (
                  <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
                    <p className="text-xs text-amber-200 leading-relaxed whitespace-pre-line">
                      <span className="font-semibold">Notes: </span>{selected.notes}
                    </p>
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
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: 'Performance',    score: rd.mobile?.score },
                          { label: 'SEO',            score: rd.mobile?.seo ?? rd.seoScore },
                          { label: 'Accessibility',  score: rd.mobile?.accessibility },
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
                          <div className="flex gap-4 text-xs">
                            <span className={rd.scraped.hasMobileViewport ? 'text-emerald-400' : 'text-red-400'}>
                              {rd.scraped.hasMobileViewport ? '✓' : '✗'} Mobile viewport
                            </span>
                            <span className={rd.scraped.hasCanonical ? 'text-emerald-400' : 'text-amber-400'}>
                              {rd.scraped.hasCanonical ? '✓' : '○'} Canonical tag
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Domain age */}
                      {rd.domainAge && (rd.domainAge.registeredAt || rd.domainAge.firstArchived) && (
                        <div className="bg-white/5 rounded-lg p-3 space-y-1.5">
                          <div className="text-xs font-medium text-slate-300">Website Age</div>
                          {rd.domainAge.registeredAt && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-500 w-28 shrink-0">Domain registered</span>
                              <span className="text-slate-200 font-mono">{rd.domainAge.registeredAt.slice(0, 10)}</span>
                              <span className="text-slate-500">
                                ({Math.floor((Date.now() - new Date(rd.domainAge.registeredAt).getTime()) / (1000 * 60 * 60 * 24 * 365))} yrs old)
                              </span>
                            </div>
                          )}
                          {rd.domainAge.firstArchived && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-500 w-28 shrink-0">First archived</span>
                              <span className="text-slate-200 font-mono">{rd.domainAge.firstArchived}</span>
                              <span className="text-slate-500">(Wayback Machine)</span>
                            </div>
                          )}
                        </div>
                      )}
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
                          <label className="block text-xs text-slate-400 mb-1">Body <span className="text-slate-500">(plain text — Web F5 signature added automatically)</span></label>
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
