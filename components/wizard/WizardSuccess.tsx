'use client'

import { useWizard } from './WizardContext'

export function WizardSuccess() {
  const { data } = useWizard()
  const name = data.bizName || 'there'

  return (
    <div className="flex flex-col items-center py-12 text-center">
      {/* Success icon */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/10">
        <span className="text-2xl text-indigo-400">✓</span>
      </div>

      <h2 className="mb-3 text-2xl font-semibold text-white">
        Brief submitted, {name}!
      </h2>
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-slate-400">
        Thanks for taking the time — you've given us everything we need to get started.
        We'll review your brief and come back to you within{' '}
        <strong className="text-white">1 business day</strong> with a clear plan and a real quote.
      </p>

      {/* What happens next */}
      <div className="mb-8 w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-left">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-indigo-400">
          What happens next
        </p>
        <ol className="flex flex-col gap-3">
          {[
            'We review your brief and research your industry and local market',
            'We prepare a tailored recommendation and fixed-price quote',
            'We reach out to schedule a 30-minute call to walk you through it',
            'You approve the scope — and we get building',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-medium text-indigo-400">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <p className="text-xs text-slate-500">
        Questions in the meantime?{' '}
        <a
          href="mailto:contact@webf5.com.au"
          className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300 transition-colors"
        >
          contact@webf5.com.au
        </a>
      </p>
    </div>
  )
}