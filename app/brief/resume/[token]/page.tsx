'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { WizardData } from '@/types'

export default function ResumePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'resuming' | 'expired' | 'not_found' | 'error'>('loading')

  useEffect(() => {
    if (!token) return

    fetch(`/api/brief/save?token=${token}`)
      .then(async (res) => {
        if (res.status === 410) { setStatus('expired'); return }
        if (res.status === 404) { setStatus('not_found'); return }
        if (!res.ok) { setStatus('error'); return }

        const { draft } = await res.json()
        if (!draft) { setStatus('not_found'); return }

        // Store the token in localStorage so the wizard picks it up
        if (typeof window !== 'undefined') {
          localStorage.setItem('guestBriefToken', token)
          // Store the step and data for WizardContext to hydrate from
          localStorage.setItem('resumeBriefData', JSON.stringify({
            currentStep: draft.currentStep,
            data: draft.data,
          }))
        }

        setStatus('resuming')
        // Use window.location so the hash is preserved — Next.js router strips it
        window.location.href = '/brief'
      })
      .catch(() => setStatus('error'))
  }, [token, router])

  const msgs: Record<typeof status, string> = {
    loading: 'Finding your brief…',
    resuming: 'Got it — taking you back to your brief…',
    expired: 'This link has expired. Guest briefs are saved for 30 days.',
    not_found: 'We couldn\'t find a brief for this link. It may have already been submitted.',
    error: 'Something went wrong. Please try again or start a new brief.',
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0A0F1E',
      color: '#fff',
      fontFamily: 'sans-serif',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div>
        {(status === 'loading' || status === 'resuming') && (
          <div style={{ marginBottom: '1.5rem' }}>
            <svg width="48" height="48" viewBox="0 0 48 48" style={{ animation: 'spin 1s linear infinite' }}>
              <circle cx="24" cy="24" r="20" fill="none" stroke="#6366f1" strokeWidth="4" strokeDasharray="80 40" />
            </svg>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}
        <p style={{ fontSize: '1.25rem', maxWidth: '420px' }}>{msgs[status]}</p>
        {(status === 'expired' || status === 'not_found' || status === 'error') && (
          <a href="/brief" style={{
            display: 'inline-block',
            marginTop: '1.5rem',
            padding: '0.75rem 1.5rem',
            background: '#6366f1',
            color: '#fff',
            borderRadius: '8px',
            textDecoration: 'none',
          }}>
            Start a new brief
          </a>
        )}
      </div>
    </div>
  )
}
