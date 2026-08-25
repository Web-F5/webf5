'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'
import { WizardData, defaultWizardData } from '../../types'
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from '@clerk/nextjs'

// ── Validation config ────────────────────────────────────────────────────────

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

async function firePartialCapture(data: WizardData) {
  try {
    await fetch('/api/brief/partial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contactName:  data.contactName,
        bizName:      data.bizName,
        bizEmail:     data.bizEmail,
        bizPhone:     data.bizPhone,
        startType:    data.startType,
        domainStatus: data.domainStatus,
        bizTagline:   data.bizTagline,
        bizDesc:      data.bizDesc,
      }),
    })
  } catch {
    // Intentionally silent
  }
}

// ── Autosave helper ───────────────────────────────────────────────────────────

function serializeForSave(data: WizardData): Record<string, unknown> {
  const skip = new Set([
    'logoFiles', 'heroLandscapeFiles', 'heroPortraitFiles',
    'aboutImageFile', 'existingCopyFiles', 'photoFiles',
  ])
  return Object.fromEntries(
    Object.entries(data).filter(([k]) => !skip.has(k))
  )
}

async function autosave(opts: {
  userId: string | null | undefined
  guestToken: string
  currentStep: number
  data: WizardData
  sendInactivityEmail?: boolean
}) {
  try {
    await fetch('/api/brief/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guestToken: opts.guestToken,
        currentStep: opts.currentStep,
        data: serializeForSave(opts.data),
        consentFollowup: opts.data.consentFollowup,
        sendInactivityEmail: opts.sendInactivityEmail ?? false,
      }),
    })
  } catch {
    // Intentionally silent — autosave must not affect UX
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function WizardProvider({ children }: { children: ReactNode }) {
  const { userId, isLoaded } = useAuth()
  const hydratedRef = useRef(false)
  const [data, setData]               = useState<WizardData>(defaultWizardData)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [stepErrors, setStepErrors]   = useState<StepErrors>({})
  const [partialSent, setPartialSent] = useState(false)
  const [guestToken, setGuestToken]   = useState('')
  const totalSteps = 11

  // Inactivity timer — fires after 5 min without a step advance
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const INACTIVITY_MS = 5 * 60 * 1000

  // ── Init: guest token + one-time hydration from resume or saved draft ─────────
  useEffect(() => {
    let token = localStorage.getItem('guestBriefToken') ?? ''
    if (!token) {
      token = uuidv4()
      localStorage.setItem('guestBriefToken', token)
    }
    setGuestToken(token)

    // Guest resume via email link — takes priority, runs immediately
    const resumeRaw = localStorage.getItem('resumeBriefData')
    if (resumeRaw) {
      try {
        const { currentStep: resumeStep, data: resumeData } = JSON.parse(resumeRaw)
        setData(prev => ({ ...prev, ...resumeData }))
        setCurrentStep(resumeStep ?? 1)
      } catch { /* ignore */ }
      localStorage.removeItem('resumeBriefData')
      hydratedRef.current = true
    }
  }, [])

  // Signed-in user: fetch saved draft once when Clerk finishes loading
  useEffect(() => {
    if (!isLoaded) return              // Clerk still initialising
    if (hydratedRef.current) return    // already hydrated from resume link
    hydratedRef.current = true         // only fetch once, even if userId changes

    if (!userId) return                // guest — nothing to fetch

    fetch('/api/brief/save')
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (json?.draft) {
          setData(prev => ({ ...prev, ...json.draft.data }))
          setCurrentStep(json.draft.currentStep ?? 1)
        }
      })
      .catch(() => {})
  }, [isLoaded, userId])

  const resetInactivityTimer = useCallback((step: number, currentData: WizardData, token: string) => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    inactivityTimer.current = setTimeout(() => {
      autosave({ userId, guestToken: token, currentStep: step, data: currentData, sendInactivityEmail: true })
    }, INACTIVITY_MS)
  }, [userId])

  useEffect(() => {
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    }
  }, [])

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

  const validateStep = useCallback((step: number, currentData: WizardData): StepErrors => {
    const errors: StepErrors = {}
    const required = STEP_REQUIRED[step]
    if (required) {
      for (const { field, label } of required) {
        const value = (currentData[field] as string) ?? ''
        if (!value.trim()) {
          errors[field as string] = `${label} is required`
        } else if (field === 'bizEmail' && !isValidEmail(value)) {
          errors[field as string] = 'Please enter a valid email address'
        }
      }
    }
    if (step === 4 && currentData.serviceReach === 'local') {
      if (!currentData.bizAddress.trim()) {
        errors['bizAddress'] = 'Please enter your business address so we can calculate your service area'
      }
    }
    return errors
  }, [])

  const getErrorScrollPosition = useCallback((step: number, errors: StepErrors): ScrollLogicalPosition => {
    const required = STEP_REQUIRED[step] ?? []
    const hasBottomError = required.some(r => errors[r.field as string] && r.scrollTo === 'end')
    return hasBottomError ? 'end' : 'start'
  }, [])

  const pendingScroll = useRef<ScrollLogicalPosition | null>(null)

  useEffect(() => {
    if (pendingScroll.current === null) return
    const block = pendingScroll.current
    pendingScroll.current = null
    document.getElementById('brief')?.scrollIntoView({ behavior: 'smooth', block })
  }, [currentStep, stepErrors])

  const goNext = useCallback(() => {
    const errors = validateStep(currentStep, data)
    if (Object.keys(errors).length > 0) {
      setStepErrors(errors)
      pendingScroll.current = getErrorScrollPosition(currentStep, errors)
      return
    }
    setStepErrors({})

    if (currentStep === 3 && !partialSent) {
      setPartialSent(true)
      firePartialCapture(data)
    }

    const nextStep = Math.min(currentStep + 1, totalSteps)

    // Autosave after each step advance (if we have a token)
    if (guestToken) {
      autosave({ userId, guestToken, currentStep: nextStep, data })
      resetInactivityTimer(nextStep, data, guestToken)
    }

    pendingScroll.current = 'start'
    setCurrentStep(nextStep)
  }, [currentStep, data, totalSteps, validateStep, getErrorScrollPosition, partialSent, guestToken, userId, resetInactivityTimer])

  const goBack = useCallback(() => {
    setStepErrors({})
    pendingScroll.current = 'start'
    setCurrentStep(s => Math.max(s - 1, 1))
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
