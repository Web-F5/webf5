'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const included = [
  'Step 1 - What to do before you create the profile (category research, NAP prep)',
  'Step 2 - Create your Google Business Profile from scratch',
  'Step 3 - Choose the right verification method for your business type',
  'Step 4 - Fill in every field: hours, description, attributes, and more',
  'Step 5 - Add photos that actually improve your ranking',
  'Step 6 - Set up your service area correctly for local search',
  'Step 7 - Your first week after verification: what to do immediately',
  'Subject to Change reference - up-to-date notes on Google verification changes',
]

export default function GbpSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<null | 'single' | 'bundle'>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleBuy(type: 'single' | 'bundle') {
    setLoading(type)
    setError(null)

    const endpoint = type === 'bundle' ? '/api/checkout/gbp-bundle' : '/api/checkout/gbp-setup'

    try {
      const res = await fetch(endpoint, { method: 'POST' })
      if (res.status === 401) {
        router.push('/sign-in?redirect_url=/guides/gbp-setup')
        return
      }
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setLoading(null)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <p className="text-emerald-400 text-sm font-medium tracking-widest uppercase mb-3">GBP Guide 1 of 2 · $19</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5 leading-tight text-balance">
            Set Up Your Google Business Profile
          </h1>
          <p className="text-foreground/60 text-lg leading-relaxed">
            A step-by-step guide for Victorian tradies and local service businesses. Goes from zero to a fully verified, completely filled GBP - the right way, not the rushed way.
          </p>
        </div>

        {/* What's included */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold tracking-widest uppercase text-foreground/40 mb-5">What's included</h2>
          <ul className="flex flex-col gap-3">
            {included.map((item) => (
              <li key={item} className="flex gap-3 items-start">
                <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                <span className="text-foreground/80 text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bundle upsell */}
        <div className="mb-6 border border-emerald-500/30 rounded-2xl p-6 bg-emerald-500/5">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-emerald-400 mb-1">Best value</p>
              <h3 className="text-lg font-bold leading-snug">Get both GBP guides for $29</h3>
              <p className="text-sm text-foreground/50 mt-1">Includes this guide + Optimise Your Google Business Profile</p>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-sm text-red-400">Was <span className="line-through">$38</span></span>
              <span className="text-2xl font-bold text-emerald-400">$29</span>
              <span className="text-xs text-red-400 font-semibold">(save 24%)</span>
            </div>
          </div>
          <ul className="flex flex-col gap-1.5 mb-4">
            {[
              'Set Up Your Google Business Profile (this guide)',
              'Optimise Your GBP - categories, services, photos, posts',
              'Review strategy + the Web F5 Review Request Sender',
            ].map((item) => (
              <li key={item} className="flex gap-2 items-start text-sm text-foreground/70">
                <span className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleBuy('bundle')}
            disabled={loading !== null}
            className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {loading === 'bundle' ? 'Redirecting to checkout...' : 'Get both guides for $29 →'}
          </button>
        </div>

        {/* Single guide pricing card */}
        <div className="border border-border rounded-2xl p-6 bg-card/30 mb-6">
          <div className="flex flex-col gap-0.5 mb-1">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">$19</span>
              <span className="text-foreground/40 mb-1">AUD · one-time</span>
            </div>
          </div>
          <p className="text-foreground/50 text-sm mb-6 mt-2">This guide only. Lifetime access. No subscription.</p>

          <button
            onClick={() => handleBuy('single')}
            disabled={loading !== null}
            className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-base"
          >
            {loading === 'single' ? 'Redirecting to checkout...' : 'Get Guide 1 - $19'}
          </button>

          {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}

          <p className="text-foreground/40 text-xs text-center mt-3">
            You'll be asked to sign in or create a free account before checkout.
          </p>
        </div>

        <p className="text-center text-foreground/30 text-xs">
          Secure checkout via Stripe. Receipt sent to your email. Refunds within 7 days if you're not happy.
        </p>

      </div>
    </main>
  )
}
