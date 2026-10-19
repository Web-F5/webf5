'use client'

import { useState, useRef, useCallback } from 'react'
import { Navigation } from '@/components/sections/navigation'

type Platform = 'google' | 'facebook' | 'custom'

interface Recipient { name: string; email: string }

const PLATFORMS: { value: Platform; label: string; color: string; placeholder: string }[] = [
  { value: 'google',   label: 'Google Reviews', color: '#4285F4', placeholder: 'https://g.page/r/XXXX/review' },
  { value: 'facebook', label: 'Facebook',        color: '#1877F2', placeholder: 'https://www.facebook.com/your-page/reviews' },
  { value: 'custom',   label: 'Trustpilot',      color: '#00B67A', placeholder: 'https://www.trustpilot.com/evaluate/yourbusiness.com' },
]

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

export default function ReviewSenderPage() {
  const [senderName, setSenderName]       = useState('')
  const [fromBusiness, setFromBusiness]   = useState('')
  const [fromEmail, setFromEmail]         = useState('')
  const [platform, setPlatform]           = useState<Platform>('google')
  const [reviewUrl, setReviewUrl]         = useState('')
  const [customMessage, setCustomMessage] = useState('It was a pleasure working with you.')
  const [logoBase64, setLogoBase64]       = useState<string | null>(null)
  const [placeSearch, setPlaceSearch]     = useState('')
  const [placeResults, setPlaceResults]   = useState<{ placeId: string; name: string; address: string; reviewUrl: string }[]>([])
  const [placesLoading, setPlacesLoading] = useState(false)
  const [placesError, setPlacesError]     = useState('')
  const [recipients, setRecipients]       = useState<Recipient[]>([{ name: '', email: '' }])
  const [preview, setPreview]             = useState<string | null>(null)
  const [confirming, setConfirming]       = useState(false)
  const [sending, setSending]             = useState(false)
  const [result, setResult]               = useState<{ sent: number; errors: string[] } | null>(null)
  const logoRef = useRef<HTMLInputElement>(null)

  const selectedPlatform = PLATFORMS.find(p => p.value === platform)!
  const activeRecipients = recipients.filter(r => r.name.trim() && r.email.trim())

  async function handlePreview() {
    const res = await fetch('/api/reviews/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromBusiness:  fromBusiness || 'Your Business',
        fromEmail:     fromEmail || undefined,
        platform,
        reviewUrl:     reviewUrl || 'https://example.com',
        customMessage,
        recipientName: activeRecipients[0]?.name || 'Customer',
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
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderName, fromBusiness, fromEmail, platform, reviewUrl, customMessage, recipients: activeRecipients, logoBase64: logoBase64 || undefined }),
      })
      const data = await res.json()
      if (data.success) {
        setResult({ sent: data.sent, errors: data.errors || [] })
        setRecipients([{ name: '', email: '' }])
      } else {
        alert(data.error || 'Something went wrong.')
      }
    } finally {
      setSending(false)
    }
  }

  async function searchPlaces() {
    if (!placeSearch.trim()) return
    setPlacesLoading(true)
    setPlacesError('')
    setPlaceResults([])
    const res  = await fetch(`/api/admin/places?q=${encodeURIComponent(placeSearch.trim())}`)
    const data = await res.json()
    setPlacesLoading(false)
    if (data.error) {
      setPlacesError(res.status === 503
        ? 'Google Places API key not configured.'
        : data.error)
    } else {
      setPlaceResults(data.results || [])
      if ((data.results || []).length === 0) setPlacesError('No businesses found. Try adding a suburb or city name.')
    }
  }

  async function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowed.includes(file.type)) {
      alert('Please upload an image file: PNG, JPG, WebP, GIF, or SVG.')
      e.target.value = ''
      return
    }
    try {
      const b64 = await resizeToBase64(file, 300)
      setLogoBase64(b64)
    } catch {
      alert('Could not read image. Please try a different file.')
    }
    e.target.value = ''
  }

  const addRow    = () => setRecipients(r => [...r, { name: '', email: '' }])
  const removeRow = (i: number) => setRecipients(r => r.filter((_, idx) => idx !== i))
  const updateRow = useCallback((i: number, field: keyof Recipient, val: string) => {
    setRecipients(r => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row))
  }, [])

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-[#0A0F1E] pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4">

          {/* Header */}
          <div className="mb-10">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">Free Tool</p>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4">Review Request Sender</h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Send a personalised review request email to your customers — Google, Facebook, or Trustpilot. Upload your logo, add a personal note, and it sends in seconds.
            </p>
          </div>

          {result ? (
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-10 text-center">
              <div className="text-5xl font-black text-indigo-400 mb-4">{result.sent}</div>
              <p className="text-white font-semibold text-lg mb-2">
                email{result.sent !== 1 ? 's' : ''} sent
              </p>
              {result.errors.length > 0 && (
                <p className="text-sm text-red-400 mb-4">{result.errors.length} error(s): {result.errors.join(', ')}</p>
              )}
              <button
                onClick={() => setResult(null)}
                className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-semibold transition-colors"
              >
                Send another
              </button>
            </div>
          ) : (
            <>
              {preview && <PreviewModal html={preview} onClose={() => setPreview(null)} />}

              <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 md:p-8 space-y-7">

                {/* Your details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your name *</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={e => setSenderName(e.target.value)}
                      placeholder="Jane Smith"
                      className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your email *</label>
                    <input
                      type="email"
                      value={fromEmail}
                      onChange={e => setFromEmail(e.target.value)}
                      placeholder="jane@acmeelectrical.com.au"
                      className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <p className="text-xs text-slate-500 mt-1.5">Customers can reply to you directly</p>
                  </div>
                </div>

                {/* Business name + logo */}
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Business name *</label>
                    <input
                      type="text"
                      value={fromBusiness}
                      onChange={e => { setFromBusiness(e.target.value); setPlaceSearch(e.target.value) }}
                      placeholder="Acme Electrical"
                      className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <p className="text-xs text-slate-500 mt-1.5">Appears in the subject line and email body</p>
                  </div>

                  {/* Logo upload */}
                  <div className="flex-shrink-0">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Logo <span className="normal-case font-normal text-slate-600">(optional)</span>
                    </label>
                    <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml" onChange={handleLogoFile} className="hidden" />
                    <button
                      type="button"
                      onClick={() => logoRef.current?.click()}
                      className="relative w-20 h-20 rounded-xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 transition-colors overflow-hidden flex items-center justify-center bg-[#0A0F1E]"
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
                      <button type="button" onClick={() => setLogoBase64(null)} className="block text-xs text-red-400 hover:text-red-300 mt-1.5 transition-colors">Remove</button>
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

                {/* Find Google review link (Google platform only) */}
                {platform === 'google' && (
                  <div className="bg-[#0A0F1E] border border-white/10 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Find your Google review link</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={placeSearch}
                        onChange={e => setPlaceSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && searchPlaces()}
                        placeholder="Business name + suburb, e.g. Acme Electrical Bendigo"
                        className="flex-1 bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={searchPlaces}
                        disabled={placesLoading || !placeSearch.trim()}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 whitespace-nowrap"
                      >
                        {placesLoading ? 'Searching…' : 'Find'}
                      </button>
                    </div>
                    {placesError && <p className="text-xs text-red-400 mt-2">{placesError}</p>}
                    {placeResults.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {placeResults.map(r => (
                          <button
                            key={r.placeId}
                            type="button"
                            onClick={() => { setReviewUrl(r.reviewUrl); setPlaceResults([]); setPlaceSearch('') }}
                            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors border border-white/5"
                          >
                            <div className="text-sm font-medium text-white">{r.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{r.address}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Review link */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Review link *</label>
                  <input
                    type="url"
                    value={reviewUrl}
                    onChange={e => setReviewUrl(e.target.value)}
                    placeholder={selectedPlatform.placeholder}
                    className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">The link customers click to leave their review</p>
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
                    className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>

                {/* Recipients */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recipients</label>
                  <div className="space-y-2">
                    {recipients.map((r, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={r.name}
                          onChange={e => updateRow(i, 'name', e.target.value)}
                          placeholder="Customer name"
                          className="flex-1 bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <input
                          type="email"
                          value={r.email}
                          onChange={e => updateRow(i, 'email', e.target.value)}
                          placeholder="email@example.com"
                          className="flex-1 bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        {recipients.length > 1 && (
                          <button onClick={() => removeRow(i)} className="text-slate-600 hover:text-red-400 px-2 text-lg transition-colors">×</button>
                        )}
                      </div>
                    ))}
                    <button onClick={addRow} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-1">+ Add another recipient</button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-1">
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
                      disabled={!senderName.trim() || !fromEmail.trim() || !fromBusiness.trim() || !reviewUrl.trim() || activeRecipients.length === 0}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Send {activeRecipients.length > 0 ? `to ${activeRecipients.length}` : 'emails'}
                    </button>
                  )}
                </div>

              </div>
            </>
          )}

        </div>
      </main>
    </>
  )
}
