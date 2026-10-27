'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const included = [
  'Step 1 - Choosing your primary and secondary categories (the most impactful change you can make)',
  'Step 2 - Adding services with descriptions that match how people actually search',
  'Step 3 - Photos: what to post, how often, and why Google rewards it',
  'Step 4 - Google Posts: how to write them, what to include, and a simple fortnightly habit',
  'Step 5 - Getting reviews: the right way to ask without sounding pushy',
  'Step 6 - Responding to reviews: what to say and what to avoid',
  'Step 7 - The Web F5 Review Request Sender: email review requests in seconds',
  'Step 8 - Why asking for reviews is not gate-keeping (and what actually is)',
  'Subject to Change reference - up-to-date notes on Google Business Profile changes',
]

export default function GbpOptimisePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleBuy() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout/gbp-optimise', { method: 'POST' })
      if (res.status === 401) {
        router.push('/sign-in?redirect_url=/guides/gbp-optimise')
        return
      }
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <p className="text-emerald-400 text-sm font-medium tracking-widest uppercase mb-3">GBP Guide 2 of 2 · $19</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5 leading-tight text-balance">
            Optimise Your Google Business Profile
          </h1>
          <p className="text-foreground/60 text-lg leading-relaxed">
            You've got a profile. Now make it work. This guide covers every lever that improves your local ranking and turns profile views into enquiries.
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

        {/* Also want Guide 1? */}
        <div className="mb-6 border border-emerald-500/20 rounded-xl p-4 bg-emerald-500/5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-foreground/80">Also want Guide 1?</p>
            <p className="text-xs text-foreground/50 mt-0.5">Get both guides for $29 - save $9</p>
          </div>
          <a
            href="/guides/gbp-setup"
            className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors whitespace-nowrap"
          >
            View bundle →
          </a>
        </div>

        {/* Pricing card */}
        <div className="border border-border rounded-2xl p-6 bg-card/30 mb-6">
          <div className="flex flex-col gap-0.5 mb-1">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">$19</span>
              <span className="text-foreground/40 mb-1">AUD · one-time</span>
            </div>
          </div>
          <p className="text-foreground/50 text-sm mb-6 mt-2">Lifetime access. No subscription.</p>

          <button
            onClick={handleBuy}
            disabled={loading}
            className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-base"
          >
            {loading ? 'Redirecting to checkout...' : 'Get Guide 2 - $19'}
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
