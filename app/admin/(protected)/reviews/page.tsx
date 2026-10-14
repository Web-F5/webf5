'use client'

import { useState, useRef, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────

type Platform = 'google' | 'facebook' | 'custom'
type Tab = 'send' | 'log'

interface Recipient { name: string; email: string }

interface SendLog {
  id: string
  fromBusiness: string
  platform: string
  reviewUrl: string
  customMessage: string | null
  recipientCount: number
  createdAt: string
}

// ── Platform config ────────────────────────────────────────────────────────

const PLATFORMS: { value: Platform; label: string; color: string; placeholder: string }[] = [
  {
    value: 'google',
    label: 'Google Reviews',
    color: '#4285F4',
    placeholder: 'https://g.page/r/XXXX/review',
  },
  {
    value: 'facebook',
    label: 'Facebook',
    color: '#1877F2',
    placeholder: 'https://www.facebook.com/your-page/reviews',
  },
  {
    value: 'custom',
    label: 'Trustpilot',
    color: '#00B67A',
    placeholder: 'https://www.trustpilot.com/evaluate/yourbusiness.com',
  },
]

// ── CSV parser ─────────────────────────────────────────────────────────────

function parseCsv(text: string): Recipient[] {
  const lines = text.trim().split('\n')
  const results: Recipient[] = []
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''))
    if (cols.length >= 2) {
      const [name, email] = cols
      if (name && email && email.includes('@')) {
        results.push({ name, email })
      }
    }
  }
  return results
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

function SendForm() {
  const [fromBusiness, setFromBusiness] = useState('')
  const [platform, setPlatform]         = useState<Platform>('google')
  const [reviewUrl, setReviewUrl]       = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [recipients, setRecipients]     = useState<Recipient[]>([{ name: '', email: '' }])
  const [mode, setMode]                 = useState<'single' | 'bulk'>('single')
  const [csvText, setCsvText]           = useState('')
  const [preview, setPreview]           = useState<string | null>(null)
  const [confirming, setConfirming]     = useState(false)
  const [sending, setSending]           = useState(false)
  const [result, setResult]             = useState<{ sent: number; errors: string[] } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const selectedPlatform = PLATFORMS.find(p => p.value === platform)!

  const activeRecipients: Recipient[] = mode === 'single'
    ? recipients.filter(r => r.name.trim() && r.email.trim())
    : parseCsv(csvText)

  // ── Preview ──────────────────────────────────────────────────────────────

  async function handlePreview() {
    const res = await fetch('/api/admin/reviews/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromBusiness: fromBusiness || 'Your Business',
        platform,
        reviewUrl: reviewUrl || 'https://example.com',
        customMessage,
        recipientName: activeRecipients[0]?.name || 'Customer',
      }),
    })
    if (res.ok) {
      const { html } = await res.json()
      setPreview(html)
    }
  }

  // ── Send ─────────────────────────────────────────────────────────────────

  async function handleSend() {
    setSending(true)
    setConfirming(false)
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromBusiness, platform, reviewUrl, customMessage, recipients: activeRecipients }),
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

  function handleCsvFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setCsvText(ev.target?.result as string)
    reader.readAsText(file)
  }

  const addRow = () => setRecipients(r => [...r, { name: '', email: '' }])
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

        {/* From business */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            From business name
          </label>
          <input
            type="text"
            value={fromBusiness}
            onChange={e => setFromBusiness(e.target.value)}
            placeholder="Acme Electrical"
            className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <p className="text-xs text-slate-500 mt-1.5">The business name the email is sent on behalf of</p>
        </div>

        {/* Platform */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Review platform
          </label>
          <div className="flex gap-3 flex-wrap">
            {PLATFORMS.map(p => (
              <button
                key={p.value}
                onClick={() => setPlatform(p.value)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                  platform === p.value
                    ? 'text-white border-transparent'
                    : 'bg-transparent text-slate-400 border-white/10 hover:border-white/30'
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
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Review link
          </label>
          <input
            type="url"
            value={reviewUrl}
            onChange={e => setReviewUrl(e.target.value)}
            placeholder={selectedPlatform.placeholder}
            className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <p className="text-xs text-slate-500 mt-1.5">
            Direct link to the review form. Customers click this in the email.
          </p>
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
          <p className="text-xs text-slate-500 mt-1.5">
            A short personal note inserted into the email body. Leave blank for the default.
          </p>
        </div>

        {/* Recipients */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Recipients
            </label>
            <div className="flex gap-1 bg-[#111827] rounded-lg p-0.5 border border-white/10">
              {(['single', 'bulk'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    mode === m ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
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
                    <button
                      onClick={() => removeRow(i)}
                      className="text-slate-600 hover:text-red-400 px-2 text-lg transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addRow}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-1"
              >
                + Add another recipient
              </button>
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
                <p className="text-xs text-slate-600 mt-1">Format: Name, Email (one per line, no header row needed)</p>
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
                <p className="text-xs text-slate-500">
                  {parseCsv(csvText).length} valid recipient{parseCsv(csvText).length !== 1 ? 's' : ''} parsed
                </p>
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
              <button
                onClick={() => setConfirming(false)}
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
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
        <button
          onClick={load}
          disabled={loading}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-semibold transition-colors"
        >
          {loading ? 'Loading…' : 'Load send log'}
        </button>
      </div>
    )
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-sm">No review requests sent yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4">Business</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4">Platform</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4">Sent to</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
              <td className="py-3 pr-4 text-white font-medium">{log.fromBusiness}</td>
              <td className="py-3 pr-4">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${platformBadgeColor(log.platform)}`}>
                  {platformLabel(log.platform)}
                </span>
              </td>
              <td className="py-3 pr-4 text-slate-300">{log.recipientCount} recipient{log.recipientCount !== 1 ? 's' : ''}</td>
              <td className="py-3 text-slate-500 text-xs">
                {new Date(log.createdAt).toLocaleDateString('en-AU', {
                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
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
      {/* Sub-tabs */}
      <div className="flex gap-1 mb-8 bg-[#0A0F1E] rounded-xl p-1 border border-white/10 w-fit">
        {([
          { value: 'send', label: 'Send reviews' },
          { value: 'log',  label: 'Send log' },
        ] as const).map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${
              tab === t.value
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-[#0A0F1E] border border-white/10 rounded-2xl p-6 md:p-8">
        {tab === 'send' ? <SendForm /> : <SendLog />}
      </div>
    </div>
  )
}
