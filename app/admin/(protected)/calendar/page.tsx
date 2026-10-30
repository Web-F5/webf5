'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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

interface CalSettings {
  slotMinutes: 15 | 30 | 60
  dayStart: number
  dayEnd: number
}

const DEFAULT_SETTINGS: CalSettings = { slotMinutes: 30, dayStart: 9, dayEnd: 17 }

function loadSettings(): CalSettings {
  try {
    const s = localStorage.getItem('cal_settings')
    if (s) return { ...DEFAULT_SETTINGS, ...JSON.parse(s) }
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS
}

function saveSettings(s: CalSettings) {
  try { localStorage.setItem('cal_settings', JSON.stringify(s)) } catch { /* ignore */ }
}

function parseCrmAccountId(notes: string | null): string | null {
  return notes?.match(/^CrmAccountId:\s*(.+)/im)?.[1]?.trim() ?? null
}

const ORDINALS = ['', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth']

function touchTitle(touch: Touch): string {
  const ordinal = ORDINALS[touch.touchNumber] ?? `#${touch.touchNumber}`
  return `${ordinal} contact - ${touch.touchName} for ${touch.prospectCompany}`
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
  if (start.getHours() === 0 && start.getMinutes() === 0) start.setHours(9, 0, 0, 0)
  const end = new Date(start.getTime() + 30 * 60000)
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
  const title   = encodeURIComponent(touchTitle(touch))
  const crmId   = parseCrmAccountId(touch.prospectNotes)
  const crmLine = crmId ? `\nCRM: https://www.webf5.com.au/admin/crm/${crmId}` : ''
  const details = encodeURIComponent(`Sequence: ${touch.sequenceName}\nContact: ${touch.prospectName} (${touch.prospectEmail})\nChannel: ${touch.channel}${crmLine}`)
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(start)}/${fmt(end)}&details=${details}`
}

function outlookLink(touch: Touch): string {
  const start = new Date(touch.scheduledFor)
  if (start.getHours() === 0 && start.getMinutes() === 0) start.setHours(9, 0, 0, 0)
  const end = new Date(start.getTime() + 30 * 60000)
  const fmt = (d: Date) => d.toISOString().slice(0, 19)
  const crmId   = parseCrmAccountId(touch.prospectNotes)
  const crmLine = crmId ? `\nCRM: https://www.webf5.com.au/admin/crm/${crmId}` : ''
  const subject = encodeURIComponent(touchTitle(touch))
  const body    = encodeURIComponent(`Sequence: ${touch.sequenceName}\nContact: ${touch.prospectName} (${touch.prospectEmail})\nChannel: ${touch.channel}${crmLine}`)
  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${subject}&startdt=${fmt(start)}&enddt=${fmt(end)}&body=${body}`
}

function dayKey(iso: string): string {
  return iso.slice(0, 10)
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}

function weekStart(d: Date): Date {
  const r = new Date(d)
  r.setHours(0, 0, 0, 0)
  r.setDate(r.getDate() - ((r.getDay() + 6) % 7)) // Monday
  return r
}

function formatHour(h: number, m: number): string {
  const suffix = h >= 12 ? 'pm' : 'am'
  const hh = h > 12 ? h - 12 : h === 0 ? 12 : h
  return m === 0 ? `${hh}${suffix}` : `${hh}:${String(m).padStart(2, '0')}`
}

// ── Touch card (list view) ─────────────────────────────────────────────────

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
              <span className="text-sm font-medium text-white">{touchTitle(touch)}</span>
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
                {touch.prospectName} · {touch.sequenceName}
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
                  <div className="text-xs text-slate-400 mb-1">
                    Subject: <span className="text-slate-200 italic">
                      {touchData.subject.replace(/\[FIRST NAME\]/gi, touch.prospectName)}
                    </span>
                  </div>
                )}
                <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                  {touchData.body.replace(/\[FIRST NAME\]/gi, touch.prospectName)}
                </pre>
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

// ── Week time-grid touch block ─────────────────────────────────────────────

function WeekTouchBlock({
  touch, slotH, isPast, markStatus, onDragStart,
}: {
  touch: Touch
  slotH: number
  isPast: boolean
  markStatus: (id: string, status: 'completed' | 'skipped' | 'pending') => Promise<void>
  onDragStart: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const crmAccountId = parseCrmAccountId(touch.prospectNotes)
  const touchData    = findTouch(touch.sequenceName, touch.touchNumber)
  const colourBase   = touch.channel === 'email' ? 'bg-indigo-500/25 border-indigo-500/50'
    : touch.channel === 'phone'    ? 'bg-emerald-500/25 border-emerald-500/50'
    : touch.channel === 'linkedin' ? 'bg-sky-500/25 border-sky-500/50'
    : touch.channel === 'video'    ? 'bg-purple-500/25 border-purple-500/50'
    : 'bg-amber-500/25 border-amber-500/50'

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', touch.id); onDragStart(touch.id) }}
      className={`relative border rounded-md px-1.5 py-1 text-[10px] leading-tight cursor-grab active:cursor-grabbing select-none transition-colors
        ${colourBase}
        ${isPast && touch.status === 'pending' ? 'ring-1 ring-red-500/50' : ''}
        ${touch.status === 'completed' ? 'opacity-50' : ''}
        ${touch.status === 'skipped' ? 'opacity-30' : ''}`}
      style={{ minHeight: slotH }}
      onClick={() => setOpen(o => !o)}
    >
      <div className="flex items-center gap-1 min-w-0">
        <span>{CHANNEL_ICON[touch.channel] ?? '📋'}</span>
        <span className="font-semibold text-white truncate">{touch.prospectCompany}</span>
      </div>
      <div className="text-slate-400 truncate">{touch.touchName}</div>

      {open && (
        <div
          className="absolute left-0 top-full z-30 w-64 bg-[#1E293B] border border-white/20 rounded-xl shadow-2xl p-3 mt-1 text-xs"
          onClick={e => e.stopPropagation()}
        >
          <div className="font-semibold text-white mb-1">{touchTitle(touch)}</div>
          <div className="text-slate-400 mb-2">{touch.prospectName} · {touch.sequenceName}</div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {touch.status === 'pending' && (
              <>
                <button onClick={() => { markStatus(touch.id, 'completed'); setOpen(false) }}
                  className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg">
                  Done
                </button>
                <button onClick={() => { markStatus(touch.id, 'skipped'); setOpen(false) }}
                  className="px-2 py-1 bg-white/5 border border-white/10 text-slate-400 rounded-lg">
                  Skip
                </button>
                <a href={googleCalLink(touch)} target="_blank" rel="noreferrer"
                  className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-slate-300">
                  Google Cal ↗
                </a>
              </>
            )}
            {(touch.status === 'completed' || touch.status === 'skipped') && (
              <button onClick={() => { markStatus(touch.id, 'pending'); setOpen(false) }}
                className="px-2 py-1 bg-white/5 border border-white/10 text-slate-400 rounded-lg">
                Undo
              </button>
            )}
            {crmAccountId && (
              <a href={`/admin/crm/${crmAccountId}`}
                className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg">
                CRM →
              </a>
            )}
          </div>
          {touchData && (
            <details className="text-slate-400">
              <summary className="cursor-pointer hover:text-slate-200 transition-colors">Show script</summary>
              <pre className="mt-1 text-[10px] text-slate-300 whitespace-pre-wrap font-sans leading-relaxed max-h-40 overflow-y-auto">
                {touchData.body.replace(/\[FIRST NAME\]/gi, touch.prospectName)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  )
}

// ── Settings panel ─────────────────────────────────────────────────────────

function SettingsPanel({
  settings, onChange, onClose,
}: {
  settings: CalSettings
  onChange: (s: CalSettings) => void
  onClose: () => void
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  return (
    <div className="absolute right-0 top-full mt-2 z-40 w-64 bg-[#1E293B] border border-white/20 rounded-xl shadow-2xl p-4 text-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-white">Calendar settings</span>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-lg leading-none">×</button>
      </div>

      <label className="block text-slate-400 text-xs mb-1">Slot interval</label>
      <div className="flex rounded-lg overflow-hidden border border-white/10 mb-3">
        {([15, 30, 60] as const).map(m => (
          <button key={m}
            onClick={() => onChange({ ...settings, slotMinutes: m })}
            className={`flex-1 py-1.5 text-xs transition-colors ${settings.slotMinutes === m ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
          >
            {m} min
          </button>
        ))}
      </div>

      <label className="block text-slate-400 text-xs mb-1">Day start</label>
      <select
        value={settings.dayStart}
        onChange={e => onChange({ ...settings, dayStart: Number(e.target.value) })}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white mb-3"
      >
        {hours.map(h => (
          <option key={h} value={h}>{h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}</option>
        ))}
      </select>

      <label className="block text-slate-400 text-xs mb-1">Day end</label>
      <select
        value={settings.dayEnd}
        onChange={e => onChange({ ...settings, dayEnd: Number(e.target.value) })}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
      >
        {hours.filter(h => h > settings.dayStart).map(h => (
          <option key={h} value={h}>{h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}</option>
        ))}
      </select>
    </div>
  )
}

// ── Week grid ──────────────────────────────────────────────────────────────

function WeekGrid({
  weekAnchor, touches, today, settings, markStatus, reschedule,
}: {
  weekAnchor: Date
  touches: Touch[]
  today: Date
  settings: CalSettings
  markStatus: (id: string, status: 'completed' | 'skipped' | 'pending') => Promise<void>
  reschedule: (id: string, newDate: Date) => Promise<void>
}) {
  const [dragOverSlot, setDragOverSlot] = useState<{ di: number; si: number } | null>(null)
  const draggingId = useRef<string | null>(null)

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekAnchor, i))
  const todayKey = dayKey(today.toISOString())

  const totalMinutes  = (settings.dayEnd - settings.dayStart) * 60
  const slotCount     = totalMinutes / settings.slotMinutes
  const SLOT_H        = 40 // px per slot
  const LABEL_W       = 56 // px for left time column

  const timeSlots = Array.from({ length: slotCount }, (_, i) => {
    const mins = settings.dayStart * 60 + i * settings.slotMinutes
    return { hour: Math.floor(mins / 60), min: mins % 60 }
  })

  // Group touches by day key
  const byDay: Record<string, Touch[]> = {}
  for (const t of touches) {
    const k = dayKey(t.scheduledFor)
    if (!byDay[k]) byDay[k] = []
    byDay[k].push(t)
  }

  // Position a touch in the grid: returns top offset in px based on its time
  function touchTop(touch: Touch): number {
    const d = new Date(touch.scheduledFor)
    const h = d.getHours()
    const m = d.getMinutes()
    const totalMin = (h - settings.dayStart) * 60 + m
    const clampedMin = Math.max(0, Math.min(totalMinutes - settings.slotMinutes, totalMin))
    return Math.round((clampedMin / settings.slotMinutes) * SLOT_H)
  }

  const totalH = slotCount * SLOT_H

  return (
    <div className="overflow-x-auto">
      {/* Header row */}
      <div className="flex" style={{ paddingLeft: LABEL_W }}>
        {days.map((day, i) => {
          const k = dayKey(day.toISOString())
          const isToday = k === todayKey
          const dayTouches = byDay[k] ?? []
          const pending = dayTouches.filter(t => t.status === 'pending').length
          return (
            <div key={i} className="flex-1 min-w-[120px] border-l border-white/10 px-2 py-2 text-center">
              <div className={`text-xs font-medium ${isToday ? 'text-indigo-400' : 'text-slate-400'}`}>
                {day.toLocaleDateString('en-AU', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-bold ${isToday ? 'text-white' : 'text-slate-300'}`}>
                {day.getDate()}
              </div>
              {pending > 0 && (
                <div className="text-[10px] bg-amber-500/20 text-amber-300 rounded px-1 py-0.5 inline-block">{pending} pending</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Grid body */}
      <div className="relative flex" style={{ height: totalH }}>
        {/* Time labels */}
        <div className="shrink-0 relative" style={{ width: LABEL_W, height: totalH }}>
          {timeSlots.map((slot, i) => (
            <div
              key={i}
              className="absolute right-2 text-[10px] text-slate-500 leading-none"
              style={{ top: i * SLOT_H - 6 }}
            >
              {slot.min === 0 ? formatHour(slot.hour, 0) : ''}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day, di) => {
          const k = dayKey(day.toISOString())
          const isToday = k === todayKey
          const dayTouches = byDay[k] ?? []

          return (
            <div
              key={di}
              className={`flex-1 min-w-[120px] relative border-l border-white/10 ${isToday ? 'bg-indigo-500/[0.03]' : ''}`}
              style={{ height: totalH }}
            >
              {/* Slot drop zones */}
              {timeSlots.map((slot, si) => {
                const isOver = dragOverSlot?.di === di && dragOverSlot?.si === si
                return (
                  <div
                    key={si}
                    className={`absolute left-0 right-0 border-t transition-colors
                      ${slot.min === 0 ? 'border-white/10' : 'border-white/[0.04]'}
                      ${isOver ? 'bg-indigo-500/20' : ''}`}
                    style={{ top: si * SLOT_H, height: SLOT_H }}
                    onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverSlot({ di, si }) }}
                    onDragLeave={e => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverSlot(null)
                    }}
                    onDrop={e => {
                      e.preventDefault()
                      setDragOverSlot(null)
                      const id = e.dataTransfer.getData('text/plain') || draggingId.current
                      if (!id) return
                      const target = new Date(day)
                      target.setHours(slot.hour, slot.min, 0, 0)
                      reschedule(id, target)
                    }}
                  />
                )
              })}

              {/* Touch blocks positioned by time */}
              {dayTouches.map(touch => {
                const isPast = new Date(touch.scheduledFor) < today && touch.status === 'pending'
                return (
                  <div
                    key={touch.id}
                    className="absolute left-1 right-1 z-10"
                    style={{ top: touchTop(touch) }}
                  >
                    <WeekTouchBlock
                      touch={touch}
                      slotH={SLOT_H - 2}
                      isPast={isPast}
                      markStatus={markStatus}
                      onDragStart={id => { draggingId.current = id }}
                    />
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const [touches, setTouches]   = useState<Touch[]>([])
  const [loading, setLoading]   = useState(true)
  const [today]                 = useState(() => new Date())
  const [viewDate, setViewDate] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [filter, setFilter]     = useState<'all' | 'pending' | 'completed'>('all')
  const [calView, setCalView]   = useState<'month' | 'week'>('month')
  const [weekAnchor, setWeekAnchor] = useState(() => weekStart(new Date()))
  const [settings, setSettings] = useState<CalSettings>(DEFAULT_SETTINGS)
  const [showSettings, setShowSettings] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  // Load settings from localStorage on mount
  useEffect(() => { setSettings(loadSettings()) }, [])

  // Close settings panel when clicking outside
  useEffect(() => {
    if (!showSettings) return
    function handler(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showSettings])

  function updateSettings(s: CalSettings) {
    setSettings(s)
    saveSettings(s)
  }

  const fetchRange = useCallback(() => {
    if (calView === 'month') {
      const from = new Date(viewDate); from.setMonth(from.getMonth() - 1)
      const to   = new Date(viewDate); to.setMonth(to.getMonth() + 2)
      return { from, to }
    } else {
      const from = new Date(weekAnchor)
      const to   = addDays(weekAnchor, 7)
      return { from, to }
    }
  }, [calView, viewDate, weekAnchor])

  const load = useCallback(async () => {
    setLoading(true)
    const { from, to } = fetchRange()
    const res  = await fetch(`/api/admin/outreach/touches?from=${from.toISOString()}&to=${to.toISOString()}`)
    const data = await res.json()
    setTouches(data.touches ?? [])
    setLoading(false)
  }, [fetchRange])

  useEffect(() => { load() }, [load])

  async function markStatus(id: string, status: 'completed' | 'skipped' | 'pending') {
    await fetch('/api/admin/outreach/touches', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    await load()
  }

  async function reschedule(touchId: string, newDate: Date) {
    const d = new Date(newDate)
    await fetch('/api/admin/outreach/touches', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: touchId, scheduledFor: d.toISOString() }),
    })
    await load()
  }

  // Month grid
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const lastDay  = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0)
  const startGrid = addDays(firstDay, -((firstDay.getDay() + 6) % 7))
  const days: Date[] = []
  for (let d = new Date(startGrid); d <= lastDay || days.length % 7 !== 0; d = addDays(d, 1)) {
    days.push(new Date(d))
    if (days.length > 42) break
  }

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

  const weekEnd    = addDays(weekAnchor, 6)
  const weekLabel  = weekAnchor.getMonth() === weekEnd.getMonth()
    ? `${weekAnchor.toLocaleDateString('en-AU', { day: 'numeric', month: 'long' })} - ${weekEnd.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}`
    : `${weekAnchor.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}`

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
          <div className="flex gap-2 flex-wrap items-center">
            {/* View toggle */}
            <div className="flex rounded-lg overflow-hidden border border-white/10 text-xs font-medium">
              {(['month', 'week'] as const).map(v => (
                <button key={v}
                  onClick={() => setCalView(v)}
                  className={`px-3 py-1.5 capitalize transition-colors ${calView === v ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Settings */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setShowSettings(o => !o)}
                className={`text-xs px-3 py-1.5 border rounded-lg transition-colors ${showSettings ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                title="Calendar settings"
              >
                ⚙
              </button>
              {showSettings && (
                <SettingsPanel
                  settings={settings}
                  onChange={updateSettings}
                  onClose={() => setShowSettings(false)}
                />
              )}
            </div>

            <a
              href="/api/admin/outreach/touches/ics"
              className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              ⬇ Export ICS
            </a>
          </div>
        </div>

        {/* ── Month view ── */}
        {calView === 'month' && (
          <div className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <button onClick={() => setViewDate(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n })}
                className="text-slate-400 hover:text-white px-2 py-1 rounded transition-colors">‹</button>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm">{monthLabel}</span>
                <button onClick={() => setViewDate(new Date())}
                  className="text-xs px-2 py-0.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors">
                  Today
                </button>
              </div>
              <button onClick={() => setViewDate(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n })}
                className="text-slate-400 hover:text-white px-2 py-1 rounded transition-colors">›</button>
            </div>

            <div className="grid grid-cols-7 border-b border-white/10">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="text-center text-xs text-slate-500 py-2 font-medium">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {days.map((day, i) => {
                const k          = dayKey(day.toISOString())
                const isToday    = k === todayKey
                const isMonth    = day.getMonth() === viewDate.getMonth()
                const dayTouches = byDay[k] ?? []
                const pending    = dayTouches.filter(t => t.status === 'pending').length
                const done       = dayTouches.filter(t => t.status === 'completed').length

                return (
                  <div key={i}
                    className={`min-h-[80px] p-1.5 border-b border-r border-white/5 ${isMonth ? '' : 'opacity-30'} ${isToday ? 'bg-indigo-500/5' : ''}`}
                  >
                    <div className={`text-xs font-mono mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-500 text-white' : 'text-slate-400'}`}>
                      {day.getDate()}
                    </div>
                    {pending > 0 && (
                      <div className="text-xs bg-amber-500/20 text-amber-300 rounded px-1 py-0.5 mb-0.5 leading-tight">{pending} pending</div>
                    )}
                    {done > 0 && (
                      <div className="text-xs bg-emerald-500/20 text-emerald-300 rounded px-1 py-0.5 leading-tight">{done} done</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Week view ── */}
        {calView === 'week' && (
          <div className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <button onClick={() => setWeekAnchor(d => addDays(d, -7))}
                className="text-slate-400 hover:text-white px-2 py-1 rounded transition-colors">‹</button>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm">{weekLabel}</span>
                <button onClick={() => setWeekAnchor(weekStart(new Date()))}
                  className="text-xs px-2 py-0.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors">
                  Today
                </button>
              </div>
              <button onClick={() => setWeekAnchor(d => addDays(d, 7))}
                className="text-slate-400 hover:text-white px-2 py-1 rounded transition-colors">›</button>
            </div>

            {loading ? (
              <div className="px-5 py-10 text-center text-slate-500 text-sm">Loading…</div>
            ) : (
              <WeekGrid
                weekAnchor={weekAnchor}
                touches={touches}
                today={today}
                settings={settings}
                markStatus={markStatus}
                reschedule={reschedule}
              />
            )}
          </div>
        )}

        {/* ── Touch list (month view only) ── */}
        {calView === 'month' && (
          <div className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 gap-4 flex-wrap">
              <h2 className="font-semibold text-sm">Upcoming Touches</h2>
              <div className="flex rounded-lg overflow-hidden border border-white/10 text-xs font-medium">
                {(['all', 'pending', 'completed'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 capitalize transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
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
                  <TouchCard key={touch.id} touch={touch} date={date} isPast={isPast}
                    crmAccountId={crmAccountId} touchData={touchData} markStatus={markStatus} />
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
