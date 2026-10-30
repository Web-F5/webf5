'use client'

import { useState, useEffect, useCallback } from 'react'
import { findTouch } from '@/lib/outreach-sequences-full'

interface Touch {
  id: string
  prospectId: string
  sendId: string | null
  sequenceName: string
  touchName: string
  touchNumber: number
  channel: string
  scheduledFor: string
  status: string
  completedAt: string | null
  prospectName: string
  prospectCompany: string
  prospectEmail: string
  prospectNotes: string | null
}

function parseCrmAccountId(notes: string | null): string | null {
  return notes?.match(/^CrmAccountId:\s*(.+)/im)?.[1]?.trim() ?? null
}

const CHANNEL_ICON: Record<string, string> = {
  email: '📧', phone: '📞', linkedin: '💼', video: '🎥', note: '📝',
}

const CHANNEL_COLOUR: Record<string, string> = {
  email:    'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
  phone:    'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  linkedin: 'bg-sky-500/20 border-sky-500/40 text-sky-300',
  video:    'bg-purple-500/20 border-purple-500/40 text-purple-300',
  note:     'bg-amber-500/20 border-amber-500/40 text-amber-300',
}

function googleCalLink(touch: Touch): string {
  const start = new Date(touch.scheduledFor)
  start.setHours(9, 0, 0, 0)
  const end = new Date(start.getTime() + 30 * 60000)
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
  const title = encodeURIComponent(`${touch.touchName} — ${touch.prospectCompany}`)
  const details = encodeURIComponent(`Sequence: ${touch.sequenceName}\nContact: ${touch.prospectName} (${touch.prospectEmail})\nChannel: ${touch.channel}`)
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(start)}/${fmt(end)}&details=${details}`
}

function outlookLink(touch: Touch): string {
  const start = new Date(touch.scheduledFor)
  start.setHours(9, 0, 0, 0)
  const end = new Date(start.getTime() + 30 * 60000)
  const fmt = (d: Date) => d.toISOString().slice(0, 19)
  const subject = encodeURIComponent(`${touch.touchName} — ${touch.prospectCompany}`)
  const body = encodeURIComponent(`Sequence: ${touch.sequenceName}\nContact: ${touch.prospectName} (${touch.prospectEmail})\nChannel: ${touch.channel}`)
  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${subject}&startdt=${fmt(start)}&enddt=${fmt(end)}&body=${body}`
}

function dayKey(iso: string): string {
  return iso.slice(0, 10)
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}

function TouchCard({
  touch, date, isPast, crmAccountId, touchData, markStatus,
}: {
  touch: Touch
  date: Date
  isPast: boolean
  crmAccountId: string | null
  touchData: ReturnType<typeof findTouch>
  markStatus: (id: string, status: 'completed' | 'skipped' | 'pending') => Promise<void>
}) {
  const [scriptOpen, setScriptOpen] = useState(false)

  return (
    <div className={`px-5 py-4 ${isPast ? 'bg-red-500/5' : ''}`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <div className="text-lg shrink-0 mt-0.5">{CHANNEL_ICON[touch.channel] ?? '📋'}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-white">{touch.touchName}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${CHANNEL_COLOUR[touch.channel] ?? 'bg-white/10 border-white/20 text-slate-300'}`}>
                {touch.channel}
              </span>
              {isPast && (
                <span className="text-xs bg-red-500/20 border border-red-500/30 text-red-300 px-2 py-0.5 rounded-full">overdue</span>
              )}
              {touch.status === 'completed' && (
                <span className="text-xs bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full">done</span>
              )}
              {touch.status === 'skipped' && (
                <span className="text-xs bg-slate-500/20 border border-slate-500/30 text-slate-400 px-2 py-0.5 rounded-full">skipped</span>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap mt-0.5">
              <span className="text-xs text-slate-400">
                {touch.prospectCompany} · {touch.prospectName} · {touch.sequenceName}
              </span>
              {crmAccountId && (
                <a href={`/admin/crm/${crmAccountId}`}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  View in CRM →
                </a>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            {touchData && (
              <button
                onClick={() => setScriptOpen(o => !o)}
                className="text-xs text-slate-500 hover:text-slate-300 mt-1 transition-colors"
              >
                {scriptOpen ? '- Hide script' : '+ Show script'}
              </button>
            )}
            {scriptOpen && touchData && (
              <div className="mt-2 bg-[#0A0F1E] border border-white/10 rounded-lg p-3 max-w-xl">
                {touchData.subject && (
                  <div className="text-xs text-slate-400 mb-1">Subject: <span className="text-slate-200 italic">{touchData.subject}</span></div>
                )}
                <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">{touchData.body}</pre>
                {touchData.note && (
                  <p className="text-xs text-amber-400/80 mt-2 italic">{touchData.note}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {touch.status === 'pending' && (
            <>
              <a href={googleCalLink(touch)} target="_blank" rel="noreferrer"
                className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors whitespace-nowrap">
                Google Cal ↗
              </a>
              <a href={outlookLink(touch)} target="_blank" rel="noreferrer"
                className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors whitespace-nowrap">
                Outlook ↗
              </a>
              <button onClick={() => markStatus(touch.id, 'completed')}
                className="text-xs px-2 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-lg transition-colors">
                Done
              </button>
              <button onClick={() => markStatus(touch.id, 'skipped')}
                className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 rounded-lg transition-colors">
                Skip
              </button>
            </>
          )}
          {(touch.status === 'completed' || touch.status === 'skipped') && (
            <button onClick={() => markStatus(touch.id, 'pending')}
              className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 rounded-lg transition-colors">
              Undo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const [touches, setTouches]   = useState<Touch[]>([])
  const [loading, setLoading]   = useState(true)
  const [today]                 = useState(() => new Date())
  const [viewDate, setViewDate] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [filter, setFilter]     = useState<'all' | 'pending' | 'completed'>('all')

  const load = useCallback(async () => {
    setLoading(true)
    // fetch 3 months of touches
    const from = new Date(viewDate); from.setMonth(from.getMonth() - 1)
    const to   = new Date(viewDate); to.setMonth(to.getMonth() + 2)
    const res  = await fetch(`/api/admin/outreach/touches?from=${from.toISOString()}&to=${to.toISOString()}`)
    const data = await res.json()
    setTouches(data.touches ?? [])
    setLoading(false)
  }, [viewDate])

  useEffect(() => { load() }, [load])

  async function markStatus(id: string, status: 'completed' | 'skipped' | 'pending') {
    await fetch('/api/admin/outreach/touches', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    await load()
  }

  // Build calendar grid for viewDate's month
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const lastDay  = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0)
  const startGrid = addDays(firstDay, -((firstDay.getDay() + 6) % 7)) // Mon-start
  const days: Date[] = []
  for (let d = new Date(startGrid); d <= lastDay || days.length % 7 !== 0; d = addDays(d, 1)) {
    days.push(new Date(d))
    if (days.length > 42) break
  }

  // Group touches by day
  const byDay: Record<string, Touch[]> = {}
  for (const t of touches) {
    const k = dayKey(t.scheduledFor)
    if (!byDay[k]) byDay[k] = []
    byDay[k].push(t)
  }

  const todayKey = dayKey(today.toISOString())

  const filteredTouches = touches.filter(t =>
    filter === 'all' ? true : t.status === filter
  )

  const monthLabel = viewDate.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })

  const pendingCount   = touches.filter(t => t.status === 'pending').length
  const completedCount = touches.filter(t => t.status === 'completed').length

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Outreach Calendar</h1>
            <p className="text-slate-400 text-sm mt-1">
              {pendingCount} pending · {completedCount} completed this period
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <a
              href="/api/admin/outreach/touches/ics"
              className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              ⬇ Export ICS (all pending)
            </a>
          </div>
        </div>

        {/* Month view */}
        <div className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
          {/* Nav */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
            <button onClick={() => setViewDate(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n })}
              className="text-slate-400 hover:text-white px-2 py-1 rounded transition-colors">‹</button>
            <span className="font-semibold text-sm">{monthLabel}</span>
            <button onClick={() => setViewDate(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n })}
              className="text-slate-400 hover:text-white px-2 py-1 rounded transition-colors">›</button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 border-b border-white/10">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="text-center text-xs text-slate-500 py-2 font-medium">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const k       = dayKey(day.toISOString())
              const isToday = k === todayKey
              const isMonth = day.getMonth() === viewDate.getMonth()
              const dayTouches = byDay[k] ?? []
              const pending    = dayTouches.filter(t => t.status === 'pending').length
              const done       = dayTouches.filter(t => t.status === 'completed').length

              return (
                <div
                  key={i}
                  className={`min-h-[80px] p-1.5 border-b border-r border-white/5 ${
                    isMonth ? '' : 'opacity-30'
                  } ${isToday ? 'bg-indigo-500/5' : ''}`}
                >
                  <div className={`text-xs font-mono mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-indigo-500 text-white' : 'text-slate-400'
                  }`}>
                    {day.getDate()}
                  </div>
                  {pending > 0 && (
                    <div className="text-xs bg-amber-500/20 text-amber-300 rounded px-1 py-0.5 mb-0.5 leading-tight">
                      {pending} pending
                    </div>
                  )}
                  {done > 0 && (
                    <div className="text-xs bg-emerald-500/20 text-emerald-300 rounded px-1 py-0.5 leading-tight">
                      {done} done
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Touch list */}
        <div className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 gap-4 flex-wrap">
            <h2 className="font-semibold text-sm">Upcoming Touches</h2>
            <div className="flex rounded-lg overflow-hidden border border-white/10 text-xs font-medium">
              {(['all', 'pending', 'completed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 capitalize transition-colors ${
                    filter === f ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >{f}</button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="px-5 py-10 text-center text-slate-500 text-sm">Loading touches…</div>
          )}

          {!loading && filteredTouches.length === 0 && (
            <div className="px-5 py-10 text-center text-slate-500 text-sm">
              No {filter === 'all' ? '' : filter} touches found.{' '}
              {filter === 'pending' && 'Select a sequence when sending an outreach email to auto-schedule touches.'}
            </div>
          )}

          <div className="divide-y divide-white/5">
            {filteredTouches.map(touch => {
              const date = new Date(touch.scheduledFor)
              const isPast = date < today && touch.status === 'pending'
              const crmAccountId = parseCrmAccountId(touch.prospectNotes)
              const touchData = findTouch(touch.sequenceName, touch.touchNumber)
              return (
                <TouchCard
                  key={touch.id}
                  touch={touch}
                  date={date}
                  isPast={isPast}
                  crmAccountId={crmAccountId}
                  touchData={touchData}
                  markStatus={markStatus}
                />
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
