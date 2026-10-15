'use client'

import { useState, useRef, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────

type Platform  = 'google' | 'facebook' | 'custom'
type Tab       = 'send' | 'log' | 'responses'

interface Recipient { name: string; email: string }

interface SendLog {
  id: string
  fromBusiness:   string
  platform:       string
  recipientCount: number
  createdAt:      string
}

interface RatingResponse {
  id:             string
  recipientName:  string
  recipientEmail: string
  fromBusiness:   string
  platform:       string
  rating:         number | null
  feedback:       string | null
  clickedReview:  boolean
  ratedAt:        string | null
  createdAt:      string
}

// ── Platform config ────────────────────────────────────────────────────────

const PLATFORMS: { value: Platform; label: string; color: string; placeholder: string }[] = [
  { value: 'google',   label: 'Google Reviews', color: '#4285F4', placeholder: 'https://g.page/r/XXXX/review' },
  { value: 'facebook', label: 'Facebook',        color: '#1877F2', placeholder: 'https://www.facebook.com/your-page/reviews' },
  { value: 'custom',   label: 'Trustpilot',      color: '#00B67A', placeholder: 'https://www.trustpilot.com/evaluate/yourbusiness.com' },
]

// ── CSV parser ─────────────────────────────────────────────────────────────

function parseCsv(text: string): Recipient[] {
  return text.trim().split('\n').flatMap(raw => {
    const cols = raw.trim().split(',').map(c => c.trim().replace(/^["']|["']$/g, ''))
    if (cols.length >= 2) {
      const [name, email] = cols
      if (name && email && email.includes('@')) return [{ name, email }]
    }
    return []
  })
}

// ── Preview modal ──────────────────────────────────────────────────────────

function PreviewModal({ html, onClose }: { html: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-[#0A0F1E] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">Email preview</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="flex-1 overflow-auto bg-white rounded-b-2xl">
          <iframe srcDoc={html} className="w-full h-full min-h-[600px] border-0" title="Email preview" />
        </div>
      </div>
    </div>
  )
}

// ── Send form ──────────────────────────────────────────────────────────────

// ── Image resizer ──────────────────────────────────────────────────────────

function resizeToBase64(file: File, maxPx = 300): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = e => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const ratio  = Math.min(maxPx / img.width, maxPx / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width  = Math.round(img.width  * ratio)
        canvas.height = Math.round(img.height * ratio)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/png'))
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

// ── Send form ──────────────────────────────────────────────────────────────

function SendForm() {
  const [fromBusiness, setFromBusiness]   = useState('')
  const [platform, setPlatform]           = useState<Platform>('google')
  const [reviewUrl, setReviewUrl]         = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [useFilter, setUseFilter]         = useState(false)
  const [logoBase64, setLogoBase64]       = useState<string | null>(null)
  const [recipients, setRecipients]       = useState<Recipient[]>([{ name: '', email: '' }])
  const [mode, setMode]                   = useState<'single' | 'bulk'>('single')
  const [csvText, setCsvText]             = useState('')
  const [preview, setPreview]             = useState<string | null>(null)
  const [confirming, setConfirming]       = useState(false)
  const [sending, setSending]             = useState(false)
  const [result, setResult]               = useState<{ sent: number; errors: string[] } | null>(null)
  const fileRef    = useRef<HTMLInputElement>(null)
  const logoRef    = useRef<HTMLInputElement>(null)

  const selectedPlatform = PLATFORMS.find(p => p.value === platform)!

  const activeRecipients: Recipient[] = mode === 'single'
    ? recipients.filter(r => r.name.trim() && r.email.trim())
    : parseCsv(csvText)

  async function handlePreview() {
    const res = await fetch('/api/admin/reviews/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromBusiness:  fromBusiness || 'Your Business',
        platform,
        reviewUrl:     reviewUrl || 'https://example.com',
        customMessage,
        recipientName: activeRecipients[0]?.name || 'Customer',
        useFilter,
        logoBase64:    logoBase64 || undefined,
      }),
    })
    if (res.ok) {
      const { html } = await res.json()
      setPreview(html)
    }
  }

  async function handleSend() {
    setSending(true)
    setConfirming(false)
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromBusiness, platform, reviewUrl, customMessage, recipients: activeRecipients, useFilter, logoBase64: logoBase64 || undefined }),
      })
      const data = await res.json()
      if (data.success) {
        setResult({ sent: data.sent, errors: data.errors || [] })
        setRecipients([{ name: '', email: '' }])
        setCsvText('')
      } else {
        alert(data.error || 'Something went wrong.')
      }
    } finally {
      setSending(false)
    }
  }

  async function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const b64 = await resizeToBase64(file, 300)
      setLogoBase64(b64)
    } catch {
      alert('Could not read image. Please try a different PNG file.')
    }
    e.target.value = ''
  }

  function handleCsvFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setCsvText(ev.target?.result as string)
    reader.readAsText(file)
  }

  const addRow    = () => setRecipients(r => [...r, { name: '', email: '' }])
  const removeRow = (i: number) => setRecipients(r => r.filter((_, idx) => idx !== i))
  const updateRow = useCallback((i: number, field: keyof Recipient, val: string) => {
    setRecipients(r => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row))
  }, [])

  if (result) {
    return (
      <div className="bg-[#0A0F1E] border border-white/10 rounded-2xl p-8 text-center">
        <div className="text-4xl font-black text-indigo-400 mb-3">{result.sent}</div>
        <p className="text-white font-semibold mb-2">emails sent successfully</p>
        {result.errors.length > 0 && (
          <p className="text-sm text-red-400 mb-4">{result.errors.length} batch error(s): {result.errors.join(', ')}</p>
        )}
        <button
          onClick={() => setResult(null)}
          className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-semibold transition-colors"
        >
          Send another batch
        </button>
      </div>
    )
  }

  return (
    <>
      {preview && <PreviewModal html={preview} onClose={() => setPreview(null)} />}

      <div className="space-y-6">

        {/* From business + logo */}
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">From business name</label>
            <input
              type="text"
              value={fromBusiness}
              onChange={e => setFromBusiness(e.target.value)}
              placeholder="Acme Electrical"
              className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1.5">The business name the email is sent on behalf of</p>
          </div>

          {/* Logo upload */}
          <div className="flex-shrink-0">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Logo <span className="normal-case font-normal text-slate-600">(PNG)</span>
            </label>
            <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoFile} className="hidden" />
            <button
              type="button"
              onClick={() => logoRef.current?.click()}
              className="relative w-20 h-20 rounded-xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 transition-colors overflow-hidden flex items-center justify-center bg-[#111827]"
              title="Upload client logo"
            >
              {logoBase64 ? (
                <>
                  <img src={logoBase64} alt="Logo preview" className="w-full h-full object-contain p-1.5" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">Change</span>
                  </div>
                </>
              ) : (
                <span className="text-slate-600 text-xs text-center leading-snug px-1">Upload<br/>logo</span>
              )}
            </button>
            {logoBase64 && (
              <button type="button" onClick={() => setLogoBase64(null)} className="block text-xs text-red-400 hover:text-red-300 mt-1.5 transition-colors">
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Platform */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Review platform</label>
          <div className="flex gap-3 flex-wrap">
            {PLATFORMS.map(p => (
              <button
                key={p.value}
                onClick={() => setPlatform(p.value)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                  platform === p.value ? 'text-white border-transparent' : 'bg-transparent text-slate-400 border-white/10 hover:border-white/30'
                }`}
                style={platform === p.value ? { backgroundColor: p.color, borderColor: p.color } : {}}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Review URL */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Review link</label>
          <input
            type="url"
            value={reviewUrl}
            onChange={e => setReviewUrl(e.target.value)}
            placeholder={selectedPlatform.placeholder}
            className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <p className="text-xs text-slate-500 mt-1.5">Direct link to the review form. Customers click this in the email.</p>
        </div>

        {/* Personal note */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Personal note <span className="normal-case font-normal text-slate-600 ml-1">(optional)</span>
          </label>
          <textarea
            value={customMessage}
            onChange={e => setCustomMessage(e.target.value)}
            rows={3}
            placeholder="It was a pleasure working with you on your home renovation last month."
            className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />
        </div>

        {/* Satisfaction filter toggle */}
        <div className={`rounded-2xl border p-4 transition-colors ${useFilter ? 'border-indigo-500/40 bg-indigo-950/20' : 'border-white/10 bg-[#111827]'}`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-white">Satisfaction filter</p>
              <p className="text-xs text-slate-500 mt-0.5">Route 7+ to review link · Route &lt;7 to private feedback</p>
            </div>
            {/* Toggle switch */}
            <button
              onClick={() => setUseFilter(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${useFilter ? 'bg-indigo-600' : 'bg-slate-700'}`}
              aria-label="Toggle satisfaction filter"
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${useFilter ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {useFilter && (
            <div className="mt-3 p-3 bg-amber-950/40 border border-amber-600/20 rounded-xl text-xs text-amber-300 leading-relaxed">
              <strong className="font-semibold">Legal note —</strong> Google explicitly prohibits review gating (selectively routing only happy customers to the review page) in their Terms of Service, and the ACCC has similar guidance. Businesses have had their Google profiles penalised for it. This filter addresses that from a legal standpoint by always offering the public review link to all respondents, regardless of score.
            </div>
          )}
        </div>

        {/* Recipients */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Recipients</label>
            <div className="flex gap-1 bg-[#111827] rounded-lg p-0.5 border border-white/10">
              {(['single', 'bulk'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${mode === m ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  {m === 'single' ? 'Single' : 'Bulk CSV'}
                </button>
              ))}
            </div>
          </div>

          {mode === 'single' ? (
            <div className="space-y-2">
              {recipients.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={r.name}
                    onChange={e => updateRow(i, 'name', e.target.value)}
                    placeholder="Name"
                    className="flex-1 bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <input
                    type="email"
                    value={r.email}
                    onChange={e => updateRow(i, 'email', e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {recipients.length > 1 && (
                    <button onClick={() => removeRow(i)} className="text-slate-600 hover:text-red-400 px-2 text-lg transition-colors">×</button>
                  )}
                </div>
              ))}
              <button onClick={addRow} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-1">+ Add another recipient</button>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500/50 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleCsvFile} className="hidden" />
                <p className="text-sm text-slate-400">
                  {csvText ? `${parseCsv(csvText).length} recipients loaded` : 'Click to upload CSV'}
                </p>
                <p className="text-xs text-slate-600 mt-1">Format: Name, Email (one per line)</p>
              </div>
              {csvText && (
                <textarea
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                  rows={6}
                  className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Name, email@example.com"
                />
              )}
              {csvText && parseCsv(csvText).length > 0 && (
                <p className="text-xs text-slate-500">{parseCsv(csvText).length} valid recipient{parseCsv(csvText).length !== 1 ? 's' : ''} parsed</p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handlePreview}
            disabled={!fromBusiness.trim() || !reviewUrl.trim()}
            className="px-5 py-2.5 border border-white/20 text-white rounded-full text-sm font-semibold hover:border-white/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Preview email
          </button>

          {confirming ? (
            <div className="flex items-center gap-3 bg-amber-950/50 border border-amber-600/30 rounded-2xl px-4 py-2.5">
              <p className="text-sm text-amber-300">
                Send to <strong>{activeRecipients.length}</strong> recipient{activeRecipients.length !== 1 ? 's' : ''}?
              </p>
              <button
                onClick={handleSend}
                disabled={sending}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {sending ? 'Sending…' : 'Confirm & send'}
              </button>
              <button onClick={() => setConfirming(false)} className="text-slate-400 hover:text-white text-sm transition-colors">Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              disabled={!fromBusiness.trim() || !reviewUrl.trim() || activeRecipients.length === 0}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Send {activeRecipients.length > 0 ? `to ${activeRecipients.length}` : 'emails'}
            </button>
          )}
        </div>
      </div>
    </>
  )
}

// ── Send log ───────────────────────────────────────────────────────────────

function platformLabel(p: string): string {
  return { google: 'Google', facebook: 'Facebook', custom: 'Trustpilot' }[p] ?? p
}

function platformBadgeColor(p: string): string {
  return {
    google:   'bg-blue-900/40 text-blue-300 border-blue-700/30',
    facebook: 'bg-blue-900/40 text-blue-400 border-blue-700/30',
    custom:   'bg-green-900/40 text-green-300 border-green-700/30',
  }[p] ?? 'bg-slate-800 text-slate-400 border-slate-700'
}

function SendLog() {
  const [logs, setLogs]     = useState<SendLog[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/reviews')
    const data = await res.json()
    setLogs(data.logs || [])
    setLoaded(true)
    setLoading(false)
  }

  if (!loaded) {
    return (
      <div className="text-center py-12">
        <button onClick={load} disabled={loading} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-semibold transition-colors">
          {loading ? 'Loading…' : 'Load send log'}
        </button>
      </div>
    )
  }

  if (!logs || logs.length === 0) {
    return <div className="text-center py-12"><p className="text-slate-500 text-sm">No review requests sent yet.</p></div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {['Business', 'Platform', 'Sent to', 'Date'].map(h => (
              <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} className="border-b border-white/5">
              <td className="py-3 pr-4 text-white font-medium">{log.fromBusiness}</td>
              <td className="py-3 pr-4">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${platformBadgeColor(log.platform)}`}>
                  {platformLabel(log.platform)}
                </span>
              </td>
              <td className="py-3 pr-4 text-slate-300">{log.recipientCount} recipient{log.recipientCount !== 1 ? 's' : ''}</td>
              <td className="py-3 text-slate-500 text-xs">
                {new Date(log.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Responses tab ──────────────────────────────────────────────────────────

function ratingBadge(r: number | null) {
  if (r === null) return <span className="text-xs text-slate-600">—</span>
  const color = r >= 7 ? 'bg-green-900/40 text-green-300' : r >= 4 ? 'bg-amber-900/40 text-amber-300' : 'bg-red-900/40 text-red-300'
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>{r}/10</span>
}

function Responses() {
  const [data, setData]       = useState<RatingResponse[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded]   = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/reviews/responses')
    const json = await res.json()
    setData(json.responses || [])
    setLoaded(true)
    setLoading(false)
  }

  if (!loaded) {
    return (
      <div className="text-center py-12">
        <button onClick={load} disabled={loading} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-semibold transition-colors">
          {loading ? 'Loading…' : 'Load responses'}
        </button>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-12"><p className="text-slate-500 text-sm">No satisfaction responses yet.</p></div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {['Recipient', 'Business', 'Rating', 'Feedback', 'Clicked review', 'Date'].map(h => (
              <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(r => (
            <tr key={r.id} className="border-b border-white/5 align-top">
              <td className="py-3 pr-4">
                <div className="text-white font-medium text-xs">{r.recipientName}</div>
                <div className="text-slate-500 text-xs">{r.recipientEmail}</div>
              </td>
              <td className="py-3 pr-4">
                <div className="text-slate-300 text-xs">{r.fromBusiness}</div>
                <span className={`px-1.5 py-0.5 rounded text-xs font-semibold border ${platformBadgeColor(r.platform)}`}>
                  {platformLabel(r.platform)}
                </span>
              </td>
              <td className="py-3 pr-4">{ratingBadge(r.rating)}</td>
              <td className="py-3 pr-4 max-w-xs">
                {r.feedback
                  ? <p className="text-xs text-slate-300 leading-relaxed">{r.feedback}</p>
                  : <span className="text-xs text-slate-600">—</span>}
              </td>
              <td className="py-3 pr-4">
                <span className={`text-xs font-semibold ${r.clickedReview ? 'text-green-400' : 'text-slate-600'}`}>
                  {r.clickedReview ? 'Yes' : 'No'}
                </span>
              </td>
              <td className="py-3 text-slate-500 text-xs whitespace-nowrap">
                {r.ratedAt ? new Date(r.ratedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ReviewsPage() {
  const [tab, setTab] = useState<Tab>('send')

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex gap-1 mb-8 bg-[#0A0F1E] rounded-xl p-1 border border-white/10 w-fit">
        {([
          { value: 'send',      label: 'Send reviews' },
          { value: 'log',       label: 'Send log' },
          { value: 'responses', label: 'Responses' },
        ] as const).map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === t.value ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-[#0A0F1E] border border-white/10 rounded-2xl p-6 md:p-8">
        {tab === 'send'      && <SendForm />}
        {tab === 'log'       && <SendLog />}
        {tab === 'responses' && <Responses />}
      </div>
    </div>
  )
}
