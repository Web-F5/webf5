'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { WizardData, defaultWizardData } from '../../types'

export type StepErrors = Record<string, string>

const STEP_REQUIRED: Record<number, { field: keyof WizardData; label: string }[]> = {
  3: [
    { field: 'contactName', label: 'Contact name' },
    { field: 'bizName',     label: 'Business name' },
    { field: 'bizEmail',    label: 'Email address' },
    { field: 'bizPhone',    label: 'Phone number' },
  ],
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

interface DiyWizardContextType {
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

const DiyWizardContext = createContext<DiyWizardContextType | null>(null)

export function DiyWizardProvider({ children }: { children: ReactNode }) {
  const [data, setData]               = useState<WizardData>(defaultWizardData)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [stepErrors, setStepErrors]   = useState<StepErrors>({})
  const totalSteps = 8

  const update = useCallback((partial: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...partial }))
  }, [])

  const toggleArray = useCallback((field: keyof WizardData, value: string) => {
    setData(prev => {
      const arr = (prev[field] as string[]) ?? []
      return { ...prev, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] }
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

  const validateStep = useCallback((step: number, d: WizardData): StepErrors => {
    const errors: StepErrors = {}
    for (const { field, label } of (STEP_REQUIRED[step] ?? [])) {
      const val = (d[field] as string) ?? ''
      if (!val.trim()) errors[field as string] = `${label} is required`
      else if (field === 'bizEmail' && !isValidEmail(val)) errors[field as string] = 'Please enter a valid email address'
    }
    if (step === 4 && d.serviceReach === 'local' && !d.bizAddress.trim()) {
      errors['bizAddress'] = 'Please enter your business address so we can calculate your service area'
    }
    return errors
  }, [])

  const goNext = useCallback(() => {
    const errors = validateStep(currentStep, data)
    if (Object.keys(errors).length > 0) {
      setStepErrors(errors)
      document.getElementById('diy-brief')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    setStepErrors({})
    document.getElementById('diy-brief')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setCurrentStep(s => Math.min(s + 1, totalSteps))
  }, [currentStep, data, totalSteps, validateStep])

  const goBack = useCallback(() => {
    setStepErrors({})
    document.getElementById('diy-brief')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setCurrentStep(s => Math.max(s - 1, 1))
  }, [])

  return (
    <DiyWizardContext.Provider value={{
      data, update, toggleArray,
      currentStep, totalSteps,
      goNext, goBack,
      isSubmitted, setIsSubmitted,
      stepErrors, clearError,
    }}>
      {children}
    </DiyWizardContext.Provider>
  )
}

export function useDiyWizard() {
  const ctx = useContext(DiyWizardContext)
  if (!ctx) throw new Error('useDiyWizard must be used within DiyWizardProvider')
  return ctx
}
