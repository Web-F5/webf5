'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TIER_COLORS, STAGE_NAMES } from '@/lib/triple-seed'

interface Account {
  id:           string
  name:         string
  tier:         string
  triggerText:  string | null
  triggerDate:  string | null
  currentStage: number
  notes:        string | null
  createdAt:    string
  updatedAt:    string
}

interface NextStepRow {
  dealId:       string
  dealName:     string
  dealStatus:   string
  nextStep:     string | null
  nextStepDate: string | null
  accountId:    string
  accountName:  string
  accountTier:  string
}

const TIERS = ['A', 'B', 'C']

export default function CrmPage() {
  const [accounts, setAccounts]   = useState<Account[]>([])
  const [nextSteps, setNextSteps] = useState<NextStepRow[]>([])
  const [loading, setLoading]     = useState(true)
  const [showNew, setShowNew]     = useState(false)
  const [form, setForm]           = useState({ name: '', tier: 'B', triggerText: '', triggerDate: '' })
  const [saving, setSaving]       = useState(false)
  const [filter, setFilter]       = useState<string>('all')

  const load = useCallback(async () => {
    const [accRes, nsRes] = await Promise.all([
      fetch('/api/admin/crm/accounts'),
      fetch('/api/admin/crm/next-steps'),
    ])
    setAccounts(await accRes.json())
    setNextSteps(await nsRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    await fetch('/api/admin/crm/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ name: '', tier: 'B', triggerText: '', triggerDate: '' })
    setShowNew(false)
    setSaving(false)
    load()
  }

  const filtered = filter === 'all' ? accounts : accounts.filter(a => a.tier === filter)
  const tierCount = (t: string) => accounts.filter(a => a.tier === t).length

  if (loading) return <div className="p-8 text-slate-400">Loading...</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">TRIPLE CRM</h1>
          <p className="text-sm text-slate-400 mt-1">Target · Reach · Investigate · Prove · Lock · Expand</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500 transition-colors"
        >
          + Add Account
        </button>
      </div>

      {/* Tier filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: `All (${accounts.length})` },
          { key: 'A',   label: `Tier A (${tierCount('A')})`, color: TIER_COLORS.A },
          { key: 'B',   label: `Tier B (${tierCount('B')})`, color: TIER_COLORS.B },
          { key: 'C',   label: `Tier C (${tierCount('C')})`, color: TIER_COLORS.C },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
              filter === tab.key
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* New account form */}
      {showNew && (
        <form onSubmit={create} className="mb-6 bg-[#111827] border border-white/10 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">New Account</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Company name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="Acme Corp"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tier</label>
              <select
                value={form.tier}
                onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}
                className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {TIERS.map(t => <option key={t} value={t}>Tier {t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Trigger event</label>
            <input
              value={form.triggerText}
              onChange={e => setForm(f => ({ ...f, triggerText: e.target.value }))}
              className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. New CTO hired, funding round announced"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Trigger date</label>
            <input
              type="date"
              value={form.triggerDate}
              onChange={e => setForm(f => ({ ...f, triggerDate: e.target.value }))}
              className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : 'Save account'}
            </button>
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Account list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          {filter === 'all' ? 'No accounts yet. Add your first account above.' : `No Tier ${filter} accounts.`}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(account => {
            const tc = TIER_COLORS[account.tier] ?? '#64748B'
            const stageName = STAGE_NAMES[account.currentStage - 1] ?? 'Target'
            return (
              <Link
                key={account.id}
                href={`/admin/crm/${account.id}`}
                className="flex items-center gap-4 bg-[#111827] border border-white/10 rounded-xl px-5 py-4 hover:border-indigo-500/50 transition-colors group"
              >
                {/* Tier badge */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: tc + '22', color: tc, border: `1.5px solid ${tc}` }}
                >
                  {account.tier}
                </div>

                {/* Name + trigger */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                    {account.name}
                  </div>
                  {account.triggerText && (
                    <div className="text-xs text-slate-400 truncate mt-0.5">{account.triggerText}</div>
                  )}
                </div>

                {/* Stage pill */}
                <div className="text-xs font-medium text-slate-400 flex-shrink-0">
                  Stage {account.currentStage}: {stageName}
                </div>

                {/* Trigger date */}
                {account.triggerDate && (
                  <div className="text-xs text-slate-500 flex-shrink-0">
                    {new Date(account.triggerDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                  </div>
                )}

                <span className="text-slate-600 group-hover:text-slate-400 transition-colors">→</span>
              </Link>
            )
          })}
        </div>
      )}

      {/* Next Steps dashboard */}
      {nextSteps.length > 0 && (() => {
        const today = new Date().toISOString().slice(0, 10)
        const overdue  = nextSteps.filter(r => r.nextStepDate && r.nextStepDate < today)
        const upcoming = nextSteps.filter(r => !r.nextStepDate || r.nextStepDate >= today)
        return (
          <div className="mt-8 bg-[#111827] border border-white/10 rounded-xl p-5">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-4">Next Steps</p>
            {overdue.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-red-400 font-semibold mb-2">Overdue ({overdue.length})</p>
                <div className="space-y-2">
                  {overdue.map(r => (
                    <NextStepCard key={r.dealId} row={r} overdue />
                  ))}
                </div>
              </div>
            )}
            {upcoming.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-2">Upcoming ({upcoming.length})</p>
                <div className="space-y-2">
                  {upcoming.sort((a, b) => (a.nextStepDate ?? '9') < (b.nextStepDate ?? '9') ? -1 : 1).map(r => (
                    <NextStepCard key={r.dealId} row={r} overdue={false} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* Seven Laws footer */}
      <div className="mt-12 border border-white/5 rounded-xl p-5 bg-[#0D1321]">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">Seven Laws</p>
        <ol className="space-y-1">
          {[
            'Evidence over optimism. A good feeling is a signal, not data.',
            'Let the milestone guide you. If it\'s not met, the stage is still open.',
            'Put a number on it. A problem without a number is just a conversation.',
            'A clear no beats an uncertain maybe.',
            'Sell the problem, not the product.',
            'You\'re paid to advance the deal. Close every interaction with a next step.',
            'If it\'s not written down, it\'s hard to rely on.',
          ].map((law, i) => (
            <li key={i} className="text-xs text-slate-500">
              <span className="text-slate-600 mr-2">{i + 1}.</span>{law}
            </li>
          ))}
        </ol>
      </div>

    </div>
  )
}

function NextStepCard({ row, overdue }: { row: NextStepRow; overdue: boolean }) {
  const tc = TIER_COLORS[row.accountTier] ?? '#64748B'
  return (
    <Link
      href={`/admin/crm/${row.accountId}`}
      className="flex items-start gap-3 bg-[#0A0F1E] rounded-lg px-4 py-3 hover:bg-[#0d1225] transition-colors group"
    >
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
        style={{ backgroundColor: tc + '22', color: tc, border: `1.5px solid ${tc}` }}>
        {row.accountTier}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
          {row.accountName} — <span className="text-slate-400 font-normal">{row.dealName}</span>
        </div>
        {row.nextStep && <div className="text-xs text-slate-400 mt-0.5 truncate">{row.nextStep}</div>}
      </div>
      {row.nextStepDate && (
        <div className={`text-xs font-medium flex-shrink-0 ${overdue ? 'text-red-400' : 'text-slate-400'}`}>
          {new Date(row.nextStepDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
        </div>
      )}
    </Link>
  )
}
