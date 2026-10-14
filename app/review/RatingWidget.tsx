'use client'

import { useState } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────

type Stage = 'rating' | 'submitting' | 'positive' | 'feedback' | 'feedback_submitting' | 'done'

interface Props {
  token:         string
  recipientName: string
  fromBusiness:  string
  platform:      string
  reviewUrl:     string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function ratingColor(n: number): string {
  if (n <= 3)  return 'bg-red-500 text-white border-red-500'
  if (n <= 6)  return 'bg-amber-400 text-white border-amber-400'
  return 'bg-green-500 text-white border-green-500'
}

function ratingHover(n: number): string {
  if (n <= 3)  return 'hover:bg-red-500 hover:text-white hover:border-red-500'
  if (n <= 6)  return 'hover:bg-amber-400 hover:text-white hover:border-amber-400'
  return 'hover:bg-green-500 hover:text-white hover:border-green-500'
}

function platformLabel(p: string): string {
  return { google: 'Google', facebook: 'Facebook', custom: 'Trustpilot' }[p] ?? 'Review'
}

function platformButtonStyle(p: string): string {
  return {
    google:   'bg-[#4285F4] hover:bg-[#3574e2]',
    facebook: 'bg-[#1877F2] hover:bg-[#0d65d9]',
    custom:   'bg-[#00B67A] hover:bg-[#009a68]',
  }[p] ?? 'bg-indigo-600 hover:bg-indigo-500'
}

// ── Component ──────────────────────────────────────────────────────────────

export function RatingWidget({ token, recipientName, fromBusiness, platform, reviewUrl }: Props) {
  const [stage, setStage]       = useState<Stage>('rating')
  const [selected, setSelected] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const firstName = recipientName.split(' ')[0]

  async function submitRating() {
    if (selected === null) return
    setStage('submitting')
    const res = await fetch('/api/review/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, rating: selected }),
    })
    const data = await res.json()
    if (data.success) {
      setStage(data.positive ? 'positive' : 'feedback')
    }
  }

  async function submitFeedback() {
    setStage('feedback_submitting')
    await fetch('/api/review/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, feedback }),
    })
    setStage('done')
  }

  async function handleReviewClick() {
    // Fire-and-forget click tracking
    fetch('/api/review/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).catch(() => {})
    window.open(reviewUrl, '_blank', 'noopener,noreferrer')
  }

  const card = 'bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-10'

  // ── Stage: rating ──────────────────────────────────────────────────────

  if (stage === 'rating' || stage === 'submitting') {
    return (
      <div className={card}>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{fromBusiness}</p>
        <h1 className="text-xl font-bold text-slate-800 mb-2 leading-snug">
          Hi {firstName} — how would you rate your experience?
        </h1>
        <p className="text-sm text-slate-500 mb-8">Select a number from 1 (poor) to 10 (excellent)</p>

        {/* Rating buttons — two rows of 5 */}
        <div className="grid grid-cols-5 gap-2 mb-8">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => setSelected(n)}
              className={`aspect-square rounded-2xl border-2 text-base font-bold transition-all ${
                selected === n
                  ? ratingColor(n)
                  : `bg-white border-slate-200 text-slate-600 ${ratingHover(n)}`
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Labels */}
        <div className="flex justify-between text-xs text-slate-400 mb-8 px-1">
          <span>Poor</span>
          <span>Excellent</span>
        </div>

        <button
          onClick={submitRating}
          disabled={selected === null || stage === 'submitting'}
          className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {stage === 'submitting' ? 'Saving…' : 'Submit rating'}
        </button>

        <p className="text-center text-xs text-slate-400 mt-6">
          Sent by <span className="font-medium">{fromBusiness}</span> via{' '}
          <a href="https://webf5.com.au" className="text-indigo-400 hover:text-indigo-600 transition-colors" target="_blank" rel="noopener noreferrer">Web F5</a>
        </p>
      </div>
    )
  }

  // ── Stage: positive (7+) ───────────────────────────────────────────────

  if (stage === 'positive') {
    return (
      <div className={card + ' text-center'}>
        <div className="text-5xl mb-5">🌟</div>
        <h1 className="text-xl font-bold text-slate-800 mb-3">That's great to hear!</h1>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-sm mx-auto">
          Thank you so much — it was a pleasure working with you. If you have a minute, a review on{' '}
          {platformLabel(platform)} would mean the world to us as a small business.
        </p>

        <button
          onClick={handleReviewClick}
          className={`w-full py-4 ${platformButtonStyle(platform)} text-white rounded-2xl font-bold text-sm transition-colors mb-4`}
        >
          Leave us a review on {platformLabel(platform)} →
        </button>

        <p className="text-xs text-slate-400">No pressure — we appreciate your rating either way.</p>

        <p className="text-center text-xs text-slate-300 mt-8">
          Sent by <span className="font-medium text-slate-400">{fromBusiness}</span> via{' '}
          <a href="https://webf5.com.au" className="text-indigo-400 hover:text-indigo-600 transition-colors" target="_blank" rel="noopener noreferrer">Web F5</a>
        </p>
      </div>
    )
  }

  // ── Stage: feedback (<7) ───────────────────────────────────────────────

  if (stage === 'feedback' || stage === 'feedback_submitting') {
    return (
      <div className={card}>
        <div className="text-4xl mb-5">💬</div>
        <h1 className="text-xl font-bold text-slate-800 mb-3 leading-snug">
          Thank you for your honesty
        </h1>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          We're sorry your experience wasn't a 10. Your feedback helps us do better — could you tell us what we could have done differently?
        </p>

        <textarea
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          rows={4}
          placeholder="Tell us what we could do better…"
          className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors resize-none mb-4"
        />

        <button
          onClick={submitFeedback}
          disabled={!feedback.trim() || stage === 'feedback_submitting'}
          className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-6"
        >
          {stage === 'feedback_submitting' ? 'Sending…' : 'Submit feedback'}
        </button>

        <div className="border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            If you can give us a chance to address your concerns, it would be very much appreciated. If you'd like to share publicly, you still can here.
          </p>
          <button
            onClick={handleReviewClick}
            className="text-sm font-semibold text-slate-500 hover:text-slate-700 underline underline-offset-4 transition-colors"
          >
            Leave a public review on {platformLabel(platform)}
          </button>
        </div>

        <p className="text-center text-xs text-slate-300 mt-8">
          Sent by <span className="font-medium text-slate-400">{fromBusiness}</span> via{' '}
          <a href="https://webf5.com.au" className="text-indigo-400 hover:text-indigo-600 transition-colors" target="_blank" rel="noopener noreferrer">Web F5</a>
        </p>
      </div>
    )
  }

  // ── Stage: done (feedback submitted) ──────────────────────────────────

  return (
    <div className={card + ' text-center'}>
      <div className="text-5xl mb-5">🙏</div>
      <h1 className="text-xl font-bold text-slate-800 mb-3">Thank you for your feedback</h1>
      <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-sm mx-auto">
        We really do appreciate you taking the time. We'll review your comments and do better next time.
      </p>

      <div className="border-t border-slate-100 pt-6">
        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          If you can give us a chance to address your concerns, it would be very much appreciated.
          If you'd like to share publicly, you still can here.
        </p>
        <button
          onClick={handleReviewClick}
          className="text-sm font-semibold text-slate-500 hover:text-slate-700 underline underline-offset-4 transition-colors"
        >
          Leave a public review on {platformLabel(platform)}
        </button>
      </div>

      <p className="text-center text-xs text-slate-300 mt-8">
        Sent by <span className="font-medium text-slate-400">{fromBusiness}</span> via{' '}
        <a href="https://webf5.com.au" className="text-indigo-400 hover:text-indigo-600 transition-colors" target="_blank" rel="noopener noreferrer">Web F5</a>
      </p>
    </div>
  )
}
