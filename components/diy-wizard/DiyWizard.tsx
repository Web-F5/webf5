'use client'

import { ReactElement } from 'react'
import { DiyWizardProvider, useDiyWizard } from './DiyWizardContext'
import { DiyStep1, DiyStep2, DiyStep3, DiyStep4, DiyStep5, DiyStep6, DiyStep7, DiyStep8 } from './DiyWizardSteps'

function DiyWizardInner() {
  const { currentStep, totalSteps, goNext, goBack, isSubmitted } = useDiyWizard()

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center py-12 text-center gap-6">
        <div className="text-5xl">✓</div>
        <h2 className="text-2xl font-bold text-white">Brief sent!</h2>
        <p className="text-slate-400 max-w-sm leading-relaxed">
          We've emailed you a copy of your brief and your personalised Claude prompt.
          Open Claude Code, paste the prompt, and start building.
        </p>


        <div className="w-full mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-widest text-emerald-400">Need a hand?</p>
          <h3 className="text-lg font-bold text-white leading-snug">
            Our step-by-step DIY guide will walk you through everything.
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            From opening Claude to deploying on Vercel, connecting your domain, setting up email, and getting found on Google - every step covered in plain English.
          </p>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <span className="text-2xl font-bold text-white">Only <span className="text-emerald-400">$19</span></span>
            <a
              href="/diy-guide"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
            >
              Get the guide →
            </a>
          </div>
        </div>
      </div>
    )
  }

  const steps: Record<number, ReactElement> = {
    1: <DiyStep1 />,
    2: <DiyStep2 />,
    3: <DiyStep3 />,
    4: <DiyStep4 />,
    5: <DiyStep5 />,
    6: <DiyStep6 />,
    7: <DiyStep7 />,
    8: <DiyStep8 />,
  }

  return (
    <div id="diy-brief" className="flex flex-col gap-6">
      {steps[currentStep] ?? null}

      <div className="flex items-center justify-between pt-2">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-5 py-3 text-sm font-medium text-slate-300 hover:border-slate-600 hover:text-white transition-colors"
          >
            ← Back
          </button>
        ) : <div />}

        {currentStep < totalSteps && (
          <button
            type="button"
            onClick={goNext}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors active:scale-[0.98]"
          >
            Continue →
          </button>
        )}
      </div>

      <div className="flex gap-1.5 justify-center pt-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i + 1 === currentStep
                ? 'w-6 bg-indigo-500'
                : i + 1 < currentStep
                ? 'w-3 bg-indigo-500/40'
                : 'w-3 bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default function DiyWizard() {
  return (
    <DiyWizardProvider>
      <DiyWizardInner />
    </DiyWizardProvider>
  )
}
