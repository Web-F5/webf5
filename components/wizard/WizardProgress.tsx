'use client'

import { useWizard } from './WizardContext'

const STEP_LABELS = [
  'Starting point',
  'Domain',
  'Your business',
  'Location',
  'Online presence',
  'Branding',
  'Pages',
  'Features',
  'Add-ons',
  'Timeline',
  'Review',
]

export function WizardProgress() {
  const { currentStep, totalSteps } = useWizard()
  const pct = Math.round((currentStep / totalSteps) * 100)

  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-slate-500">{STEP_LABELS[currentStep - 1]}</span>
        <span className="text-xs text-slate-500">{pct}% complete</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-3 flex gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i + 1 < currentStep
                ? 'bg-indigo-500'
                : i + 1 === currentStep
                ? 'bg-indigo-400'
                : 'bg-slate-800'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
