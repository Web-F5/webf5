'use client'

import { WizardProvider, useWizard } from './WizardContext'
import { WizardProgress } from './WizardProgress'
import { WizardNav } from './WizardNav'
import { WizardSuccess } from './WizardSuccess'
import {
  Step1, Step2, Step3, Step4, Step5, Step6,
  Step7, Step8, Step9, Step10, Step11,
} from './WizardSteps'

const STEPS = [Step1, Step2, Step3, Step4, Step5, Step6, Step7, Step8, Step9, Step10, Step11]

function WizardInner() {
  const { currentStep, isSubmitted } = useWizard()
  const StepComponent = STEPS[currentStep - 1]

  if (isSubmitted) return <WizardSuccess />

  return (
    <div>
      <WizardProgress />
      <StepComponent />
      <WizardNav />
    </div>
  )
}

/**
 * DiscoveryWizard
 *
 * Drop this component anywhere on your page. It is fully self-contained
 * and manages all state internally via React context.
 *
 * Usage:
 *   import { DiscoveryWizard } from '@/components/wizard/DiscoveryWizard'
 *
 *   <section id="brief">
 *     <DiscoveryWizard />
 *   </section>
 *
 * To handle form submission, edit the `handleSubmit` function inside
 * WizardSteps.tsx → Step11 → handleSubmit().
 * Replace the console.log with your fetch/API call.
 */
export function DiscoveryWizard() {
  return (
    <WizardProvider>
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-sm sm:p-10">
        <WizardInner />
      </div>
    </WizardProvider>
  )
}
