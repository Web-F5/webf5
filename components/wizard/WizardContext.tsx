'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { WizardData, defaultWizardData } from '../../types'

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
}

const WizardContext = createContext<WizardContextType | null>(null)

export function WizardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WizardData>(defaultWizardData)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const totalSteps = 11

  const update = useCallback((partial: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...partial }))
  }, [])

  const toggleArray = useCallback((field: keyof WizardData, value: string) => {
    setData(prev => {
      const arr = (prev[field] as string[]) ?? []
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      }
    })
  }, [])

  const goNext = useCallback(() => {
    setCurrentStep(s => Math.min(s + 1, totalSteps))
    window.scrollTo({ top: 2, behavior: 'smooth' })
  }, [totalSteps])

  const goBack = useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 1))
    window.scrollTo({ top: 2, behavior: 'smooth' })
  }, [])

  return (
    <WizardContext.Provider value={{ data, update, toggleArray, currentStep, totalSteps, goNext, goBack, isSubmitted, setIsSubmitted }}>
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizard must be used within WizardProvider')
  return ctx
}
