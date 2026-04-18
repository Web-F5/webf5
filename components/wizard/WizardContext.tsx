'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { WizardData, defaultWizardData } from '../../types'

// ── Validation config ────────────────────────────────────────────────────────
// key = step number
// scrollTo: 'start' scrolls to top of #brief, 'end' scrolls to bottom
// (use 'end' when required fields are near the bottom of the step)

const STEP_REQUIRED: Record<number, {
  field: keyof WizardData
  label: string
  scrollTo?: 'start' | 'end'
}[]> = {
  3: [
    { field: 'contactName', label: 'Contact name',  scrollTo: 'start' },
    { field: 'bizName',     label: 'Business name', scrollTo: 'start' },
    { field: 'bizEmail',    label: 'Email address', scrollTo: 'start' },
    { field: 'bizPhone',    label: 'Phone number',  scrollTo: 'start' },
  ],
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export type StepErrors = Record<string, string>

interface WizardContextType {
  data: WizardData
  update: (partial: Partial<WizardData>) => void
  toggleArray: (field: keyof WizardData, value: string) => void
  currentStep: number
  totalSteps: number
  goNext: () => void
  goBack: () => void
  isSubmitted: boolean
  setIsSubmitted: (v: boolean) => void
  stepErrors: StepErrors
  clearError: (field: string) => void
}

const WizardContext = createContext<WizardContextType | null>(null)

// ── Partial capture ───────────────────────────────────────────────────────────
// Fires silently on Step 3 Continue when all three required fields are present.
// Errors are swallowed — this must never block the wizard progressing.

async function firePartialCapture(data: WizardData) {
  try {
    await fetch('/api/brief/partial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bizName:     data.bizName,
        bizEmail:    data.bizEmail,
        bizPhone:    data.bizPhone,
        startType:   data.startType,
        domainStatus: data.domainStatus,
        bizTagline:  data.bizTagline,
        bizDesc:     data.bizDesc,
      }),
    })
  } catch {
    // Intentionally silent — partial capture failure must not affect UX
  }
}

export function WizardProvider({ children }: { children: ReactNode }) {
  const [data, setData]           = useState<WizardData>(defaultWizardData)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [stepErrors, setStepErrors]   = useState<StepErrors>({})
  const [partialSent, setPartialSent] = useState(false)
  const totalSteps = 11

  const update = useCallback((partial: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...partial }))
  }, [])

  const toggleArray = useCallback((field: keyof WizardData, value: string) => {
    setData(prev => {
      const arr = (prev[field] as string[]) ?? []
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter(v => v !== value)
          : [...arr, value],
      }
    })
  }, [])

  const clearError = useCallback((field: string) => {
    setStepErrors(prev => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const validateStep = useCallback((
    step: number,
    currentData: WizardData
  ): StepErrors => {
    const required = STEP_REQUIRED[step]
    if (!required) return {}

    const errors: StepErrors = {}
    for (const { field, label } of required) {
      const value = (currentData[field] as string) ?? ''
      if (!value.trim()) {
        errors[field as string] = `${label} is required`
      } else if (field === 'bizEmail' && !isValidEmail(value)) {
        errors[field as string] = 'Please enter a valid email address'
      }
    }
    return errors
  }, [])

  // Determine where to scroll when errors exist on this step.
  // If any failing field has scrollTo:'end', scroll to bottom of section.
  const getErrorScrollPosition = useCallback((
    step: number,
    errors: StepErrors
  ): ScrollLogicalPosition => {
    const required = STEP_REQUIRED[step] ?? []
    const hasBottomError = required.some(
      r => errors[r.field as string] && r.scrollTo === 'end'
    )
    return hasBottomError ? 'end' : 'start'
  }, [])

  const scrollToBrief = (block: ScrollLogicalPosition = 'start') => {
    document.getElementById('brief')?.scrollIntoView({
      behavior: 'smooth',
      block,
    })
  }

  const goNext = useCallback(() => {
    const errors = validateStep(currentStep, data)

    if (Object.keys(errors).length > 0) {
      setStepErrors(errors)
      const block = getErrorScrollPosition(currentStep, errors)
      scrollToBrief(block)
      return
    }

    setStepErrors({})

    // Fire partial capture once on Step 3 success — never again
    if (currentStep === 3 && !partialSent) {
      setPartialSent(true)
      firePartialCapture(data)
    }

    setCurrentStep(s => Math.min(s + 1, totalSteps))
    scrollToBrief('start')
  }, [currentStep, data, totalSteps, validateStep, getErrorScrollPosition, partialSent])

  const goBack = useCallback(() => {
    setStepErrors({})
    setCurrentStep(s => Math.max(s - 1, 1))
    scrollToBrief('start')
  }, [])

  return (
    <WizardContext.Provider value={{
      data, update, toggleArray,
      currentStep, totalSteps,
      goNext, goBack,
      isSubmitted, setIsSubmitted,
      stepErrors, clearError,
    }}>
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizard must be used within WizardProvider')
  return ctx
}