'use client'

import { useWizard } from './WizardContext'
import { cn } from '@/lib/utils'

export function WizardNav() {
  const { currentStep, totalSteps, goNext, goBack } = useWizard()
  const isLast = currentStep === totalSteps

  return (
    <div className="mt-10 flex items-center justify-between gap-4">
      <button
        type="button"
        onClick={goBack}
        disabled={currentStep === 1}
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

      {isLast && (
        <div className="w-28" /> // spacer so Back button doesn't shift
      )}
    </div>
  )
}
