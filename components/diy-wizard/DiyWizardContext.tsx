'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { WizardData, defaultWizardData } from '../../types'

const STORAGE_KEY = 'diy-wizard-draft'

function loadDraft(): { data: WizardData; step: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveDraft(data: WizardData, step: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, step }))
  } catch {}
}

function clearDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

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
  const draft = typeof window !== 'undefined' ? loadDraft() : null
  const [data, setData]               = useState<WizardData>(draft?.data ?? defaultWizardData)
  const [currentStep, setCurrentStep] = useState(draft?.step ?? 1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [stepErrors, setStepErrors]   = useState<StepErrors>({})
  const [partialSent, setPartialSent] = useState(false)
  const [briefSaved, setBriefSaved]   = useState(false)
  const totalSteps = 8

  // Auto-save on every data or step change
  useEffect(() => {
    if (!isSubmitted) saveDraft(data, currentStep)
  }, [data, currentStep, isSubmitted])

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

    // Step 3 → fire partial lead email (once)
    if (currentStep === 3 && !partialSent && data.bizName && data.bizEmail && data.bizPhone) {
      setPartialSent(true)
      fetch('/api/brief/partial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bizName:     data.bizName,
          bizEmail:    data.bizEmail,
          contactName: data.contactName,
          bizPhone:    data.bizPhone,
          startType:   data.startType,
          domainStatus: data.domainStatus,
          bizTagline:  data.bizTagline,
          bizDesc:     data.bizDesc,
          source:      'diy',
        }),
      }).catch(() => {})
    }

    // Step 7 → save to briefDrafts DB + email briefs@webf5.au (once)
    if (currentStep === 7 && !briefSaved) {
      setBriefSaved(true)
      clearDraft()
      fetch('/api/diy-brief/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => {})
    }

    setCurrentStep(s => Math.min(s + 1, totalSteps))
  }, [currentStep, data, totalSteps, validateStep, partialSent, briefSaved])

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
