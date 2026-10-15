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

function sliderColor(n: number): string {
  if (n <= 3)  return '#EF4444'
  if (n <= 6)  return '#F59E0B'
  return '#22C55E'
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
  const [stage, setStage]           = useState<Stage>('rating')
  const [sliderValue, setSliderValue] = useState(5)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [feedback, setFeedback]     = useState('')
  const firstName = recipientName.split(' ')[0]
  const selected  = hasInteracted ? sliderValue : null

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
    fetch('/api/review/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).catch(() => {})
    window.open(reviewUrl, '_blank', 'noopener,noreferrer')
  }

  const card       = 'bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-10'
  const color      = hasInteracted ? sliderColor(sliderValue) : '#94A3B8'
  const pct        = ((sliderValue - 1) / 9) * 100

  // Shared review button used in both positive and feedback/done stages
  const ReviewButton = () => (
    <button
      onClick={handleReviewClick}
      className={`w-full py-4 ${platformButtonStyle(platform)} text-white rounded-2xl font-bold text-sm transition-colors`}
    >
      Leave us a public review on {platformLabel(platform)}.
    </button>
  )

  // ── Stage: rating ──────────────────────────────────────────────────────

  if (stage === 'rating' || stage === 'submitting') {
    return (
      <div className={card}>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{fromBusiness}</p>
        <h1 className="text-xl font-bold text-slate-800 mb-2 leading-snug">
          Hi {firstName}, how would you rate your experience?
        </h1>
        <p className="text-sm text-slate-500 mb-8">Drag the slider from 1 (poor) to 10 (excellent)</p>

        {/* Value display */}
        <div className="flex items-center justify-center mb-6">
          <span
            className="text-6xl font-extrabold tabular-nums transition-colors duration-150"
            style={{ color }}
          >
            {hasInteracted ? sliderValue : '←→'}
          </span>
        </div>

        {/* Slider */}
        <div className="mb-2 px-1">
          <style>{`
            .rating-slider {
              -webkit-appearance: none;
              appearance: none;
              width: 100%;
              height: 8px;
              border-radius: 4px;
              outline: none;
              cursor: pointer;
              background: linear-gradient(
                to right,
                ${color} 0%,
                ${color} ${pct}%,
                #E2E8F0 ${pct}%,
                #E2E8F0 100%
              );
              transition: background 0.1s;
            }
            .rating-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: ${color};
              cursor: pointer;
              border: 3px solid white;
              box-shadow: 0 1px 6px rgba(0,0,0,0.2);
              transition: background 0.1s, transform 0.1s;
            }
            .rating-slider::-webkit-slider-thumb:active {
              transform: scale(1.15);
            }
            .rating-slider::-moz-range-thumb {
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: ${color};
              cursor: pointer;
              border: 3px solid white;
              box-shadow: 0 1px 6px rgba(0,0,0,0.2);
            }
          `}</style>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={sliderValue}
            onChange={e => {
              setSliderValue(Number(e.target.value))
              setHasInteracted(true)
            }}
            className="rating-slider"
          />
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

        <p className="text-center text-xs text-slate-500 mt-6">
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
          Thank you so much! it was a pleasure working with you. If you have a minute, a review on{' '}
          {platformLabel(platform)} would mean the world to us as a small business.
        </p>

        <ReviewButton />

        <p className="text-xs text-slate-600 mt-4">No pressure, we appreciate your rating either way.</p>

        <p className="text-center text-xs text-slate-500 mt-8">
          Sent by <span className="font-medium text-slate-600">{fromBusiness}</span> via{' '}
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
          We're sorry your experience wasn't a 10. Your feedback helps us do better. Could you tell us what we could have done differently?
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
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-6"
        >
          {stage === 'feedback_submitting' ? 'Sending…' : 'Submit feedback'}
        </button>

        <div className="border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-600 mb-4 leading-relaxed">
            If you can give us a chance to address your concerns, it would be very much appreciated. If you'd like to share publicly, you still can here.
          </p>
          <ReviewButton />
        </div>

        <p className="text-center text-xs text-slate-500 mt-8">
          Sent by <span className="font-medium text-slate-600">{fromBusiness}</span> via{' '}
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
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          If you can give us a chance to address your concerns, it would be very much appreciated.
          If you'd like to share publicly, you still can here.
        </p>
        <ReviewButton />
      </div>

      <p className="text-center text-xs text-slate-500 mt-8">
        Sent by <span className="font-medium text-slate-600">{fromBusiness}</span> via{' '}
        <a href="https://webf5.com.au" className="text-indigo-400 hover:text-indigo-600 transition-colors" target="_blank" rel="noopener noreferrer">Web F5</a>
      </p>
    </div>
  )
}
