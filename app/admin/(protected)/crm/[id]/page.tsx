'use client'

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import { TRIPLE, STAGE_NAMES, STAGE_COLORS, TIER_COLORS, ROLE_LABELS } from '@/lib/triple-seed'
import type { Block, Task } from '@/lib/triple-seed'

// ── Send Tools panel ──────────────────────────────────────────────────────────
function SendToolsPanel({ contacts }: { contacts: Contact[] }) {
  const [open, setOpen]           = useState(false)
  const [type, setType]           = useState<'checklist' | 'audit'>('checklist')
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [bizName, setBizName]     = useState('')
  const [url, setUrl]             = useState('')
  const [sending, setSending]     = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [result, setResult]       = useState<{ ok: boolean; msg: string } | null>(null)

  // Pre-fill from contacts if one exists
  const firstContact = contacts[0]
  useEffect(() => {
    if (firstContact && !name) setName(firstContact.name)
  }, [firstContact, name])

  function buildBody(extra?: Record<string, unknown>) {
    const body: Record<string, unknown> = { type, name, email }
    if (bizName) body.businessName = bizName
    if (type === 'audit') body.url = url
    return { ...body, ...extra }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/crm/send-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildBody()),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ ok: true, msg: type === 'audit' ? `Audit sent! Grade ${data.grade} (${data.overallScore}%)` : 'Checklist sent!' })
      } else {
        setResult({ ok: false, msg: data.error ?? 'Something went wrong.' })
      }
    } catch {
      setResult({ ok: false, msg: 'Network error.' })
    } finally {
      setSending(false)
    }
  }

  async function preview() {
    if (!name.trim() || !email.trim()) {
      setResult({ ok: false, msg: 'Fill in name and email first.' })
      return
    }
    if (type === 'audit' && !url.trim()) {
      setResult({ ok: false, msg: 'Fill in the website URL first.' })
      return
    }
    setPreviewing(true)
    setResult(null)
    try {
      const res  = await fetch('/api/admin/crm/send-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildBody({ preview: true })),
      })
      const data = await res.json()
      if (!res.ok) { setResult({ ok: false, msg: data.error ?? 'Preview failed.' }); return }
      const win = window.open('', '_blank')
      if (win) { win.document.write(data.html); win.document.close() }
    } catch {
      setResult({ ok: false, msg: 'Preview failed.' })
    } finally {
      setPreviewing(false)
    }
  }

  return (
    <div className="mb-6 bg-[#111827] border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Send Tools</p>
        <div className="flex items-center gap-3">
          <a href="https://webf5.com.au/resources/review-sender" target="_blank" rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-2.5 py-1 rounded-lg transition-colors">
            Review Request Sender ↗
          </a>
          <button onClick={() => setOpen(o => !o)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            {open ? 'Close' : 'Send checklist or audit →'}
          </button>
        </div>
      </div>
      {open && (
        <form onSubmit={send} className="mt-4 space-y-3">
          {/* Type selector */}
          <div className="flex gap-2">
            {(['checklist', 'audit'] as const).map(t => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  type === t ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-white/10 text-slate-400 hover:text-white'
                }`}>
                {t === 'checklist' ? '12-Point Checklist' : 'Website Audit'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Contact name *</label>
              <input value={name} onChange={e => setName(e.target.value)} required
                list="contact-names"
                className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="Jane Smith" />
              <datalist id="contact-names">
                {contacts.map(c => <option key={c.id} value={c.name} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="jane@example.com" />
            </div>
          </div>
          {type === 'audit' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Business name</label>
                <input value={bizName} onChange={e => setBizName(e.target.value)}
                  className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Acme Corp" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Website URL *</label>
                <input value={url} onChange={e => setUrl(e.target.value)} required={type === 'audit'}
                  className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="example.com.au" />
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={sending || previewing}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors">
              {sending ? (type === 'audit' ? 'Running audit…' : 'Sending…') : `Send ${type === 'audit' ? 'audit' : 'checklist'}`}
            </button>
            <button type="button" onClick={preview} disabled={sending || previewing}
              className="px-4 py-2 bg-white/5 text-slate-300 text-sm font-semibold rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-50 transition-colors">
              {previewing ? (type === 'audit' ? 'Loading…' : 'Loading…') : 'Preview email'}
            </button>
            {result && (
              <span className={`text-xs ${result.ok ? 'text-green-400' : 'text-red-400'}`}>{result.msg}</span>
            )}
          </div>
        </form>
      )}
    </div>
  )
}

interface Account {
  id: string; name: string; tier: string; triggerText: string | null
  triggerDate: string | null; currentStage: number; notes: string | null
}
interface Contact {
  id: string; accountId: string; name: string; title: string | null
  linkedIn: string | null; role: string; notes: string | null
}
interface Deal {
  id: string; accountId: string; name: string; stage: number; status: string
  nextStep: string | null; nextStepDate: string | null
  problemText: string | null; problemValue: string | null
  compellingEvent: string | null; compellingDate: string | null
  signedAt: string | null; notes: string | null
}
interface ProgressRow {
  id: string; scopeType: string; scopeId: string; taskId: string
  checked: boolean; answer: string | null
}

type ProgressMap = Record<string, ProgressRow>

const ROLES = ['economic_buyer','champion','user','blocker','coach'] as const

export default function AccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [account,  setAccount]  = useState<Account | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [deals,    setDeals]    = useState<Deal[]>([])
  const [progress, setProgress] = useState<ProgressMap>({})
  const [activeTab, setActiveTab] = useState<'workspace' | 'deals'>('workspace')
  const [activeDeal, setActiveDeal] = useState<string | null>(null)
  const [activeStage, setActiveStage] = useState(1)
  const [editingAccount, setEditingAccount] = useState(false)
  const [accountForm, setAccountForm] = useState({ name: '', tier: 'B', triggerText: '', triggerDate: '', notes: '' })
  const [showNewContact, setShowNewContact] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', title: '', linkedIn: '', role: 'champion', notes: '' })
  const [showNewDeal, setShowNewDeal] = useState(false)
  const [dealName, setDealName] = useState('')
  const [saving, setSaving] = useState(false)
  const [dealNextStep, setDealNextStep]         = useState('')
  const [dealNextStepDate, setDealNextStepDate] = useState('')

  const loadAll = useCallback(async () => {
    const [accRes, conRes, dealRes] = await Promise.all([
      fetch('/api/admin/crm/accounts'),
      fetch(`/api/admin/crm/contacts?accountId=${id}`),
      fetch(`/api/admin/crm/deals?accountId=${id}`),
    ])
    const accs: Account[] = await accRes.json()
    const acc = accs.find(a => a.id === id) ?? null
    setAccount(acc)
    if (acc) setAccountForm({ name: acc.name, tier: acc.tier, triggerText: acc.triggerText ?? '', triggerDate: acc.triggerDate ?? '', notes: acc.notes ?? '' })
    setContacts(await conRes.json())
    const d: Deal[] = await dealRes.json()
    setDeals(d)
    if (d.length > 0 && !activeDeal) setActiveDeal(d[0].id)
  }, [id, activeDeal])

  const loadProgress = useCallback(async (scopeType: string, scopeId: string) => {
    const res = await fetch(`/api/admin/crm/progress?scopeType=${scopeType}&scopeId=${scopeId}`)
    const rows: ProgressRow[] = await res.json()
    const map: ProgressMap = {}
    rows.forEach(r => { map[r.taskId] = r })
    setProgress(map)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // Sync next step fields when active deal changes
  useEffect(() => {
    const deal = deals.find(d => d.id === activeDeal)
    setDealNextStep(deal?.nextStep ?? '')
    setDealNextStepDate(deal?.nextStepDate ?? '')
  }, [activeDeal, deals])

  async function saveDealField(dealId: string, patch: Record<string, string | null>) {
    await fetch(`/api/admin/crm/deals/${dealId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    loadAll()
  }

  useEffect(() => {
    if (activeTab === 'workspace') {
      loadProgress('workspace', 'workspace')
    } else if (activeDeal) {
      loadProgress('deal', activeDeal)
    }
  }, [activeTab, activeDeal, loadProgress])

  async function saveProgress(taskId: string, checked?: boolean, answer?: string) {
    const scopeType = activeTab === 'workspace' ? 'workspace' : 'deal'
    const scopeId   = activeTab === 'workspace' ? 'workspace' : (activeDeal ?? 'workspace')
    const res = await fetch('/api/admin/crm/progress', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ scopeType, scopeId, taskId, checked, answer }),
    })
    const row: ProgressRow = await res.json()
    setProgress(prev => ({ ...prev, [taskId]: row }))
  }

  async function saveAccount(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch(`/api/admin/crm/accounts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accountForm),
    })
    setEditingAccount(false)
    setSaving(false)
    loadAll()
  }

  async function saveContact(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/admin/crm/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: id, ...contactForm }),
    })
    setContactForm({ name: '', title: '', linkedIn: '', role: 'champion', notes: '' })
    setShowNewContact(false)
    setSaving(false)
    loadAll()
  }

  async function deleteContact(contactId: string) {
    await fetch(`/api/admin/crm/contacts?id=${contactId}`, { method: 'DELETE' })
    loadAll()
  }

  async function createDeal(e: React.FormEvent) {
    e.preventDefault()
    if (!dealName.trim()) return
    setSaving(true)
    const res = await fetch('/api/admin/crm/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: id, name: dealName.trim(), stage: 2 }),
    })
    const deal = await res.json()
    setDealName('')
    setShowNewDeal(false)
    setSaving(false)
    setActiveTab('deals')
    setActiveDeal(deal.id)
    loadAll()
  }

  // Gate check: all gate tasks for a stage must be checked
  function gateStatus(stageN: number, scopeType: string, scopeId: string): boolean {
    const stage = TRIPLE.stages.find(s => s.n === stageN)
    if (!stage) return false
    const gates = stage.blocks.filter(b => b.type === 'gate')
    for (const gate of gates) {
      for (const task of gate.tasks) {
        if (!progress[task.id]?.checked) return false
      }
    }
    return gates.length > 0
  }

  // Count checked tasks in a stage
  function stageChecked(stageN: number) {
    const stage = TRIPLE.stages.find(s => s.n === stageN)
    if (!stage) return { checked: 0, total: 0 }
    let checked = 0, total = 0
    for (const block of stage.blocks) {
      for (const task of block.tasks) {
        total++
        if (progress[task.id]?.checked) checked++
        for (const field of task.fields) {
          // fields don't count as separate checkboxes
        }
      }
    }
    return { checked, total }
  }

  if (!account) return <div className="p-8 text-slate-400">Loading account…</div>

  const tc = TIER_COLORS[account.tier] ?? '#64748B'
  const currentStageData = TRIPLE.stages.find(s => s.n === activeStage)
  const scopeType = activeTab === 'workspace' ? 'workspace' : 'deal'
  const scopeId   = activeTab === 'workspace' ? 'workspace' : (activeDeal ?? 'workspace')

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-slate-500">
        <Link href="/admin/crm" className="hover:text-indigo-400 transition-colors">CRM</Link>
        <span>/</span>
        <span className="text-slate-300">{account.name}</span>
      </div>

      {/* Account header */}
      {editingAccount ? (
        <form onSubmit={saveAccount} className="mb-6 bg-[#111827] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Company name</label>
              <input value={accountForm.name} onChange={e => setAccountForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tier</label>
              <select value={accountForm.tier} onChange={e => setAccountForm(f => ({ ...f, tier: e.target.value }))}
                className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                {['A','B','C'].map(t => <option key={t} value={t}>Tier {t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Trigger event</label>
            <input value={accountForm.triggerText} onChange={e => setAccountForm(f => ({ ...f, triggerText: e.target.value }))}
              className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Trigger date</label>
            <input type="date" value={accountForm.triggerDate} onChange={e => setAccountForm(f => ({ ...f, triggerDate: e.target.value }))}
              className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Notes</label>
            <textarea value={accountForm.notes} onChange={e => setAccountForm(f => ({ ...f, notes: e.target.value }))} rows={3}
              className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setEditingAccount(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5"
              style={{ backgroundColor: tc + '22', color: tc, border: `2px solid ${tc}` }}>
              {account.tier}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{account.name}</h1>
              {account.triggerText && <p className="text-sm text-slate-400 mt-1">{account.triggerText}</p>}
              {account.triggerDate && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Trigger: {new Date(account.triggerDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
              {account.notes && <p className="text-xs text-slate-500 mt-1 italic">{account.notes}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditingAccount(true)}
              className="px-3 py-1.5 text-xs text-slate-400 border border-white/10 rounded-lg hover:text-white hover:border-white/20 transition-colors">
              Edit
            </button>
            <button onClick={() => setShowNewDeal(true)}
              className="px-3 py-1.5 text-xs bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors">
              + New Deal
            </button>
          </div>
        </div>
      )}

      {/* Five humans */}
      <div className="mb-6 bg-[#111827] border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Five Humans (Double Wide)</p>
          <button onClick={() => setShowNewContact(true)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">+ Add contact</button>
        </div>

        {showNewContact && (
          <form onSubmit={saveContact} className="mb-4 space-y-3 border-b border-white/10 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <input value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Full name *" required
                className="bg-[#0A0F1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
              <input value={contactForm.title} onChange={e => setContactForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Job title"
                className="bg-[#0A0F1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select value={contactForm.role} onChange={e => setContactForm(f => ({ ...f, role: e.target.value }))}
                className="bg-[#0A0F1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
              <input value={contactForm.linkedIn} onChange={e => setContactForm(f => ({ ...f, linkedIn: e.target.value }))}
                placeholder="LinkedIn URL"
                className="bg-[#0A0F1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <input value={contactForm.notes} onChange={e => setContactForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="One line on what they personally care about"
              className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
            <div className="flex gap-2">
              <button type="submit" disabled={saving}
                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-500 disabled:opacity-50">
                {saving ? 'Saving…' : 'Add contact'}
              </button>
              <button type="button" onClick={() => setShowNewContact(false)} className="px-3 py-1.5 text-slate-400 hover:text-white text-xs">Cancel</button>
            </div>
          </form>
        )}

        {contacts.length === 0 ? (
          <p className="text-xs text-slate-500">No contacts yet. Map 5 humans: economic buyer, champion, day-to-day user, likely blocker, coach.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {contacts.map(c => (
              <div key={c.id} className="flex items-start gap-2 p-2 rounded-lg bg-[#0A0F1E]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white truncate">{c.name}</span>
                    {c.linkedIn && (
                      <a href={c.linkedIn} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 text-xs flex-shrink-0">↗</a>
                    )}
                  </div>
                  {c.title && <div className="text-xs text-slate-500 truncate">{c.title}</div>}
                  <div className="text-xs text-indigo-400 mt-0.5">{ROLE_LABELS[c.role] ?? c.role}</div>
                  {c.notes && <div className="text-xs text-slate-500 mt-0.5 italic truncate">{c.notes}</div>}
                </div>
                <button onClick={() => deleteContact(c.id)} className="text-slate-600 hover:text-red-400 text-xs flex-shrink-0 transition-colors">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Send Tools */}
      <SendToolsPanel contacts={contacts} />

      {/* New deal form */}
      {showNewDeal && (
        <form onSubmit={createDeal} className="mb-6 bg-[#111827] border border-indigo-500/30 rounded-xl p-4 flex gap-3">
          <input value={dealName} onChange={e => setDealName(e.target.value)} placeholder="Deal name *" required
            className="flex-1 bg-[#0A0F1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
          <button type="submit" disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500 disabled:opacity-50">
            {saving ? 'Creating…' : 'Create'}
          </button>
          <button type="button" onClick={() => setShowNewDeal(false)} className="px-3 py-2 text-slate-400 hover:text-white text-sm">✕</button>
        </form>
      )}

      {/* Workspace / Deals tabs */}
      <div className="flex gap-2 mb-4 border-b border-white/10 pb-0">
        {[
          { key: 'workspace', label: 'Stage 1: Target (workspace)' },
          ...deals.map(d => ({ key: d.id, label: d.name, isDeal: true })),
        ].map(tab => {
          const isActive = tab.key === 'workspace' ? activeTab === 'workspace' : (activeTab === 'deals' && activeDeal === tab.key)
          return (
            <button key={tab.key}
              onClick={() => {
                if (tab.key === 'workspace') { setActiveTab('workspace') }
                else { setActiveTab('deals'); setActiveDeal(tab.key); setActiveStage(2) }
              }}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
        {deals.length === 0 && (
          <span className="px-4 py-2.5 text-xs text-slate-600 italic">No deals yet — create one with "+ New Deal"</span>
        )}
      </div>

      {/* Stage nav (for deal tabs: stages 2–6) */}
      {activeTab === 'deals' && (
        <div className="flex gap-1 mb-4 flex-wrap">
          {TRIPLE.stages.filter(s => s.n >= 2).map(stage => {
            const { checked, total } = stageChecked(stage.n)
            const passed = gateStatus(stage.n, 'deal', activeDeal ?? '')
            const color = STAGE_COLORS[stage.n]
            return (
              <button key={stage.n}
                onClick={() => setActiveStage(stage.n)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  activeStage === stage.n
                    ? 'text-white border-transparent'
                    : 'text-slate-400 border-white/10 hover:text-white'
                }`}
                style={activeStage === stage.n ? { backgroundColor: color + '33', borderColor: color, color } : {}}
              >
                {stage.n}. {stage.name}
                {passed && <span className="ml-1 text-green-400">✓</span>}
                {!passed && total > 0 && <span className="ml-1 text-slate-500">{checked}/{total}</span>}
              </button>
            )
          })}
        </div>
      )}

      {/* Workspace: Stage 1 stage nav */}
      {activeTab === 'workspace' && (
        <div className="flex gap-1 mb-4">
          {TRIPLE.stages.filter(s => s.n === 1).map(stage => (
            <div key={stage.n} className="text-xs text-slate-400 px-3 py-1.5 rounded-full border border-indigo-500/30 text-indigo-300">
              Stage 1: Target — workspace level
            </div>
          ))}
        </div>
      )}

      {/* Next Step (deal tabs only) */}
      {activeTab === 'deals' && activeDeal && (
        <div className="mb-5 bg-[#111827] border border-white/10 rounded-xl p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-xs text-slate-400 mb-1">Next step</label>
            <input
              value={dealNextStep}
              onChange={e => setDealNextStep(e.target.value)}
              onBlur={() => saveDealField(activeDeal, { nextStep: dealNextStep || null })}
              placeholder="e.g. Send proposal draft"
              className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="w-40">
            <label className="block text-xs text-slate-400 mb-1">Due date</label>
            <input
              type="date"
              value={dealNextStepDate}
              onChange={e => setDealNextStepDate(e.target.value)}
              onBlur={() => saveDealField(activeDeal, { nextStepDate: dealNextStepDate || null })}
              className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          {dealNextStepDate && (() => {
            const today = new Date().toISOString().slice(0, 10)
            const overdue = dealNextStepDate < today
            return (
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${overdue ? 'bg-red-900/40 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                {overdue ? 'Overdue' : 'Upcoming'}
              </span>
            )
          })()}
        </div>
      )}

      {/* Checklist */}
      {currentStageData && (
        <StageChecklist
          stage={activeTab === 'workspace' ? TRIPLE.stages[0] : (TRIPLE.stages.find(s => s.n === activeStage) ?? TRIPLE.stages[0])}
          progress={progress}
          onCheck={(taskId, checked) => saveProgress(taskId, checked)}
          onAnswer={(taskId, answer) => saveProgress(taskId, undefined, answer)}
        />
      )}
      {!currentStageData && activeTab === 'deals' && (
        <StageChecklist
          stage={TRIPLE.stages.find(s => s.n === activeStage) ?? TRIPLE.stages[1]}
          progress={progress}
          onCheck={(taskId, checked) => saveProgress(taskId, checked)}
          onAnswer={(taskId, answer) => saveProgress(taskId, undefined, answer)}
        />
      )}
    </div>
  )
}

// ── Checklist components ─────────────────────────────────────────────────────

function StageChecklist({ stage, progress, onCheck, onAnswer }: {
  stage:    typeof TRIPLE.stages[0]
  progress: ProgressMap
  onCheck:  (taskId: string, checked: boolean) => void
  onAnswer: (taskId: string, answer: string) => void
}) {
  const color = STAGE_COLORS[stage.n]
  return (
    <div className="space-y-6">
      <div className="bg-[#0D1321] rounded-xl p-4 border-l-4" style={{ borderColor: color }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color }}>
          Stage {stage.n}: {stage.name}
        </p>
        <p className="text-sm text-slate-300">{stage.job}</p>
      </div>

      {stage.blocks.map((block, bi) => (
        <BlockSection key={bi} block={block} progress={progress} onCheck={onCheck} onAnswer={onAnswer} stageColor={color} />
      ))}

      {stage.pitfalls.length > 0 && (
        <div className="bg-[#1a0e0e] border border-red-900/30 rounded-xl p-4">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">How this stage fails</p>
          <ul className="space-y-1">
            {stage.pitfalls.map((p, i) => (
              <li key={i} className="text-xs text-red-300/70 flex gap-2">
                <span className="text-red-600 flex-shrink-0">×</span>{p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function BlockSection({ block, progress, onCheck, onAnswer, stageColor }: {
  block:       Block
  progress:    ProgressMap
  onCheck:     (taskId: string, checked: boolean) => void
  onAnswer:    (taskId: string, answer: string) => void
  stageColor:  string
}) {
  const isGate = block.type === 'gate'
  return (
    <div className={`rounded-xl border ${isGate ? 'border-amber-500/30 bg-[#1a150a]' : 'border-white/10 bg-[#111827]'}`}>
      <div className={`px-4 py-3 border-b ${isGate ? 'border-amber-500/20' : 'border-white/10'}`}>
        <p className={`text-xs font-semibold uppercase tracking-wider ${isGate ? 'text-amber-400' : ''}`}
          style={isGate ? {} : { color: stageColor }}>
          {isGate ? '🚦 Gate: ' : ''}{block.title}
        </p>
        {isGate && block.note && <p className="text-xs text-amber-300/60 mt-1 italic">{block.note}</p>}
      </div>
      <div className="divide-y divide-white/5">
        {block.tasks.map(task => (
          <TaskRow key={task.id} task={task} progress={progress} onCheck={onCheck} onAnswer={onAnswer} />
        ))}
        {block.tasks.length === 0 && (
          <div className="px-4 py-3 text-xs text-slate-600 italic">Reference section — no checkboxes.</div>
        )}
      </div>
    </div>
  )
}

function TaskRow({ task, progress, onCheck, onAnswer }: {
  task:     Task
  progress: ProgressMap
  onCheck:  (taskId: string, checked: boolean) => void
  onAnswer: (taskId: string, answer: string) => void
}) {
  const row     = progress[task.id]
  const checked = row?.checked ?? false
  const [showNote, setShowNote] = useState(!!row?.answer || task.fields.length > 0)
  const [note, setNote]         = useState(row?.answer ?? '')

  // Sync note state when progress loads
  useEffect(() => {
    setNote(progress[task.id]?.answer ?? '')
  }, [progress, task.id])

  return (
    <div className={`px-4 py-3 ${checked ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onCheck(task.id, !checked)}
          className={`w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
            checked ? 'bg-green-500 border-green-500 text-white' : 'border-white/20 hover:border-indigo-400'
          }`}
        >
          {checked && <span className="text-xs">✓</span>}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${checked ? 'line-through text-slate-500' : 'text-slate-200'}`}>
            <span className="text-slate-600 text-xs mr-1.5">{task.id}</span>
            {task.text}
          </p>

          {/* Sub-fields */}
          {task.fields.length > 0 && (
            <div className="mt-2 space-y-2">
              {task.fields.map(field => {
                const fr     = progress[field.id]
                const fNote  = fr?.answer ?? ''
                return (
                  <div key={field.id} className="flex gap-2 items-start">
                    <span className="text-xs text-slate-500 w-36 flex-shrink-0 pt-2">{field.label}</span>
                    <AnswerField
                      value={fNote}
                      onChange={v => onAnswer(field.id, v)}
                    />
                  </div>
                )
              })}
            </div>
          )}

          {/* Notes toggle for tasks without sub-fields */}
          {task.fields.length === 0 && (
            <div className="mt-1.5">
              {showNote ? (
                <AnswerField
                  value={note}
                  onChange={v => { setNote(v); onAnswer(task.id, v) }}
                  placeholder="Add a note…"
                  onBlur={() => !note && setShowNote(false)}
                />
              ) : (
                <button onClick={() => setShowNote(true)} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                  + note
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AnswerField({ value, onChange, placeholder = '', onBlur }: {
  value:       string
  onChange:    (v: string) => void
  placeholder?: string
  onBlur?:     () => void
}) {
  const [local, setLocal] = useState(value)

  useEffect(() => { setLocal(value) }, [value])

  return (
    <textarea
      value={local}
      onChange={e => { setLocal(e.target.value) }}
      onBlur={() => { onChange(local); onBlur?.() }}
      placeholder={placeholder}
      rows={2}
      className="flex-1 w-full bg-[#0A0F1E] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none placeholder-slate-600"
    />
  )
}
