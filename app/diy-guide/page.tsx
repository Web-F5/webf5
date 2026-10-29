'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

const included = [
  'Module 1 - Run the Web F5 discovery wizard and build a brief that drives every decision',
  'Module 2 - Set up GitHub, Vercel, Cloudflare, and Formspree (all free)',
  'Module 3 - The Web F5 Claude prompt template: paste your brief, get a complete site',
  'Module 4 - Purchase and connect your .com.au domain',
  'Module 5 - Set up email routing with no mail server needed',
  'Module 6 - Google Search Console, Analytics, and Business Profile',
  'Module 7 - Go-live checklist (interactive, saves progress)',
  'Module 8 - How to make updates after launch, and when to upgrade',
  'Subject to Change reference - up-to-date notes on every third-party service used',
]

export default function DiyGuidePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const playerDivRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initPlayer = () => {
      if (!playerDivRef.current) return
      new window.YT.Player(playerDivRef.current, {
        videoId: '2ZvURkc2HrU',
        playerVars: { rel: 0 },
        events: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onReady: (e: any) => e.target.setPlaybackRate(1.1),
        },
      })
    }

    if (window.YT?.Player) {
      initPlayer()
    } else {
      window.onYouTubeIframeAPIReady = initPlayer
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(script)
    }
  }, [])

  async function handleBuy() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/checkout/diy-guide', { method: 'POST' })
      if (res.status === 401) {
        router.push('/sign-in?redirect_url=/diy-guide')
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
          <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3">DIY Guide · $27</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5 leading-tight text-balance">
            Build Your Business Website in a Day.
          </h1>
          <p className="text-foreground/60 text-lg leading-relaxed">
            A step-by-step guide for Australian tradies and local service businesses. No coding experience needed. You get to create your own live website using your new brief, connect your domain, set up an email form, setup email routing, and Google visibility; all done by yourself.
          </p>
        </div>

        {/* Video overview */}
        <div className="mb-10">
          <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
            <div
              ref={playerDivRef}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            />
          </div>
        </div>

        {/* What's included */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold tracking-widest uppercase text-foreground/40 mb-5">What's included</h2>
          <ul className="flex flex-col gap-3">
            {included.map((item) => (
              <li key={item} className="flex gap-3 items-start">
                <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
                <span className="text-foreground/80 text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing card */}
        <div className="border border-border rounded-2xl p-6 bg-card/30 mb-6">
          <div className="flex flex-col gap-0.5 mb-1">
            <span className="text-sm text-red-400">Was <span className="line-through">$54</span></span>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">$27</span>
              <span className="text-foreground/40 mb-1">AUD · one-time</span>
            </div>
            <span className="text-sm font-semibold text-red-400">(save 50%)</span>
          </div>
          <p className="text-foreground/50 text-sm mb-6 mt-2">12 months access. One-time payment. No subscription.</p>

          <button
            onClick={handleBuy}
            disabled={loading}
            className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-base"
          >
            {loading ? 'Redirecting to checkout…' : 'Get the guide - $27'}
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
