'use client'

import { useState } from 'react'

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

const CHECKLIST = [
  {
    section: 'First Impressions',
    subtitle: 'What visitors judge in the first 5 seconds',
    color: 'indigo',
    items: [
      {
        num: 1,
        title: 'Clear headline',
        detail: 'Visitors know within 5 seconds what you do and who you serve. "Plumber serving Geelong & Surf Coast" beats "Welcome to our website."',
      },
      {
        num: 2,
        title: 'Professional imagery',
        detail: 'Real photos of your work, team, or premises. Stock photos signal inauthenticity — local customers can tell.',
      },
      {
        num: 3,
        title: 'Mobile-friendly design',
        detail: 'The site looks and works correctly on a phone. Over 60% of local business searches happen on mobile.',
      },
    ],
  },
  {
    section: 'Trust Signals',
    subtitle: 'What makes visitors comfortable enough to contact you',
    color: 'emerald',
    items: [
      {
        num: 4,
        title: 'Contact details on every page',
        detail: 'Your phone number is visible in the header or footer on every page — not just the contact page. Customers ready to call shouldn\'t have to hunt.',
      },
      {
        num: 5,
        title: 'Reviews or testimonials visible',
        detail: 'At least 3 customer reviews or testimonials on your homepage. Google reviews embedded directly are the most trusted format.',
      },
      {
        num: 6,
        title: 'SSL certificate (HTTPS)',
        detail: 'A padlock icon appears in the browser address bar. Without it, browsers display a "Not Secure" warning — which kills trust immediately.',
      },
      {
        num: 7,
        title: 'About page with real information',
        detail: 'A photo of the owner or team, a short story about the business, and why you started it. People buy from people, not logos.',
      },
    ],
  },
  {
    section: 'Getting Found on Google',
    subtitle: 'The basics that determine whether you show up',
    color: 'amber',
    items: [
      {
        num: 8,
        title: 'Page title and description',
        detail: 'Every page has a unique, descriptive title tag and meta description. These are what Google shows in search results — if they\'re missing, Google guesses, and it usually guesses wrong.',
      },
      {
        num: 9,
        title: 'Google Business Profile claimed',
        detail: 'Your Google Business Profile is claimed, verified, and linked to your website. This is the single highest-leverage thing a local business can do for Google visibility.',
      },
      {
        num: 10,
        title: 'Site loads in under 3 seconds on mobile',
        detail: 'Test free at pagespeed.web.dev. Google uses page speed as a ranking factor, and 53% of mobile visitors leave if a page takes more than 3 seconds to load.',
      },
    ],
  },
  {
    section: 'Converting Visitors',
    subtitle: 'Turning interest into enquiries',
    color: 'violet',
    items: [
      {
        num: 11,
        title: 'Clear call to action on every page',
        detail: 'One obvious next step — "Call now", "Get a free quote", "Book online". Visitors who are ready to act should never have to wonder what to do next.',
      },
      {
        num: 12,
        title: 'Privacy policy page',
        detail: 'Required under the Australian Privacy Act 1988 for any website that collects personal information (contact forms, email signups). A missing policy is a legal exposure.',
      },
    ],
  },
]

const COLOR: Record<string, { badge: string; dot: string; border: string }> = {
  indigo:  { badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',  dot: 'bg-indigo-500',  border: 'border-indigo-500/30' },
  emerald: { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20', dot: 'bg-emerald-500', border: 'border-emerald-500/30' },
  amber:   { badge: 'bg-amber-500/15 text-amber-300 border-amber-500/20',   dot: 'bg-amber-500',   border: 'border-amber-500/30' },
  violet:  { badge: 'bg-violet-500/15 text-violet-300 border-violet-500/20',  dot: 'bg-violet-500',  border: 'border-violet-500/30' },
}

function ChecklistFull() {
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const total   = CHECKLIST.flatMap(s => s.items).length
  const ticked  = Object.values(checked).filter(Boolean).length

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl px-6 py-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-white">Your progress</p>
          <p className="text-sm text-slate-400">
            <span className="text-white font-bold">{ticked}</span> / {total} checked
          </p>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${(ticked / total) * 100}%` }}
          />
        </div>
        {ticked === total && (
          <p className="text-sm text-emerald-400 mt-3 font-medium">
            ✓ All 12 checks passed — your site is well set up.
          </p>
        )}
        {ticked > 0 && ticked < total && (
          <p className="text-sm text-amber-300 mt-3">
            {total - ticked} item{total - ticked !== 1 ? 's' : ''} left — want help fixing {total - ticked === 1 ? 'it' : 'them'}?{' '}
            <a href="/brief" className="text-indigo-400 hover:underline">Start your brief →</a>
          </p>
        )}
      </div>

      {/* Print button */}
      <div className="flex justify-end">
        <button
          onClick={() => window.print()}
          className="text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print / Save as PDF
        </button>
      </div>

      {/* Checklist sections */}
      {CHECKLIST.map(section => {
        const c = COLOR[section.color]
        return (
          <div key={section.section} className={`bg-[#111827] border rounded-2xl overflow-hidden ${c.border}`}>
            <div className="px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                <div>
                  <h3 className="font-bold text-white">{section.section}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{section.subtitle}</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {section.items.map(item => (
                <label
                  key={item.num}
                  className="flex gap-4 px-6 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className={`text-xs font-mono mt-0.5 shrink-0 w-5 text-right ${checked[item.num] ? 'text-slate-600' : 'text-slate-500'}`}>
                      {item.num < 10 ? `0${item.num}` : item.num}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold transition-colors ${checked[item.num] ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {item.title}
                      </p>
                      <p className={`text-xs leading-relaxed mt-1 transition-colors ${checked[item.num] ? 'text-slate-600' : 'text-slate-400'}`}>
                        {item.detail}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={!!checked[item.num]}
                      onChange={e => setChecked(prev => ({ ...prev, [item.num]: e.target.checked }))}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </label>
              ))}
            </div>
          </div>
        )
      })}

      {/* Bottom CTA */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 text-center">
        <h3 className="font-bold text-white text-lg mb-2">Found gaps in your checklist?</h3>
        <p className="text-slate-300 text-sm mb-5 max-w-md mx-auto leading-relaxed">
          We fix exactly these issues for local Australian businesses — fast load times, professional design, Google-ready setup. Tell us about your project and we'll give you a fixed-price quote within 1 business day.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/brief" className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
            Start your brief →
          </a>
          <a href="/audit" className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
            Get a free site audit
          </a>
        </div>
      </div>
    </div>
  )
}

export default function ChecklistPage() {
  const [unlocked, setUnlocked] = useState(false)
  const [form, setForm]         = useState({ name: '', businessName: '', email: '', industry: '' })
  const [status, setStatus]     = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setUnlocked(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white print:bg-white print:text-black">
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-10">

        {/* Hero */}
        <div className="text-center space-y-4">
          <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest print:hidden">
            Free resource
          </p>
          <h1 className="text-4xl font-black leading-tight">
            The 12-Point Website Checklist<br />
            <span className="text-indigo-400">for Australian Small Businesses</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-lg mx-auto print:text-gray-600">
            The exact checks we run on every website before recommending changes. Work through each one — any red flags you find are costing you customers right now.
          </p>
        </div>

        {unlocked ? (
          <ChecklistFull />
        ) : (
          <>
            {/* Teaser — first 3 items blurred */}
            <div className="relative bg-[#111827] border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <h3 className="font-bold text-white">First Impressions</h3>
                </div>
              </div>
              {CHECKLIST[0].items.map(item => (
                <div key={item.num} className="flex gap-4 px-6 py-4 border-b border-white/5 last:border-0">
                  <span className="text-xs font-mono mt-0.5 shrink-0 w-5 text-right text-slate-500">
                    {`0${item.num}`}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
              {/* Blur overlay for remaining 9 */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#111827] to-transparent" />
            </div>

            <div className="text-center text-slate-500 text-sm">
              + 9 more checks across Trust Signals, Google Visibility & Conversions
            </div>

            {/* Gate form */}
            <form onSubmit={submit} className="bg-[#111827] border border-indigo-500/20 rounded-2xl p-7 space-y-5">
              <div className="text-center mb-2">
                <h2 className="text-lg font-bold text-white">Get the full checklist — free</h2>
                <p className="text-sm text-slate-400 mt-1">We'll send a copy to your email as well.</p>
              </div>

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
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Business name</label>
                  <input
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
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Industry <span className="text-slate-600 font-normal">(optional)</span>
                </label>
                <select
                  value={form.industry}
                  onChange={e => set('industry', e.target.value)}
                  className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select your industry…</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>

              {status === 'error' && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-colors text-base"
              >
                {status === 'loading' ? 'Sending…' : 'Get the free checklist →'}
              </button>

              <p className="text-xs text-slate-600 text-center">No spam. Unsubscribe any time.</p>
            </form>
          </>
        )}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          button { display: none !important; }
          a[href="/brief"], a[href="/audit"] { display: none !important; }
        }
      `}</style>
    </main>
  )
}
