'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [secret, setSecret] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(false)

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret }),
    })

    if (res.ok) {
      router.replace('/admin/briefs')
    } else {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E] px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-white">Admin access</h1>
        <input
          type="password"
          placeholder="Admin secret"
          value={secret}
          onChange={e => setSecret(e.target.value)}
          autoFocus
          required
          className="w-full px-4 py-2.5 rounded-lg bg-[#111827] border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
        />
        {error && (
          <p className="text-red-400 text-sm">Incorrect secret.</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? 'Checking…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
