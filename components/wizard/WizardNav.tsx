'use client'

import { useWizard } from './WizardContext'
import { cn } from '@/lib/utils'

export function WizardNav() {
  const { currentStep, totalSteps, goNext, goBack, stepErrors } = useWizard()
  const isLast = currentStep === totalSteps
  const errorMessages = Object.values(stepErrors)

  return (
    <div className="mt-10 flex flex-col gap-3">

      {/* Validation error banner — only visible when errors exist */}
      {errorMessages.length > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          {errorMessages.map((msg, i) => (
            <p key={i} className="text-sm text-red-300">
              {msg}
            </p>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={goBack}
          disabled={currentStep === 1 || undefined}
          className={cn(
            'rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition-all duration-150',
            'hover:border-slate-500 hover:text-white active:scale-[0.98]',
            'disabled:cursor-not-allowed disabled:opacity-30'
          )}
        >
          ← Back
        </button>

        <span className="text-xs text-slate-600">
          {currentStep} / {totalSteps}
        </span>

        {!isLast && (
          <button
            type="button"
            onClick={goNext}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-150 hover:bg-indigo-500 active:scale-[0.98]"
          >
            Continue →
          </button>
        )}

        {isLast && <div className="w-28" />}
      </div>
    </div>
  )
}