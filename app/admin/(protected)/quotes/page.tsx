'use client'

import { useState, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface HourRow { label: string; hours: number }

const DEFAULT_ROWS: HourRow[] = [
  { label: 'Discovery & scoping',         hours: 2  },
  { label: 'UI design',                   hours: 8  },
  { label: 'Frontend development',        hours: 14 },
  { label: 'CMS / backend setup',         hours: 4  },
  { label: 'Content & copy integration',  hours: 3  },
  { label: 'QA & testing',               hours: 2  },
  { label: 'Launch & project management', hours: 2  },
]

const TERMS = [12, 24, 36, 48, 60]
const PROJECT_TYPES = ['Starter', 'Professional', 'Shopify Hydrogen'] as const
type ProjectType = typeof PROJECT_TYPES[number] | ''

function fmt(n: number) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
function fmtInt(n: number) {
  return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function QuotesPage() {
  const [clientName,  setClientName]  = useState('')
  const [projectRef,  setProjectRef]  = useState('')
  const [quoteDate,   setQuoteDate]   = useState(() => new Date().toISOString().split('T')[0])
  const [quotedBy,    setQuotedBy]    = useState('')
  const [projectType, setProjectType] = useState<ProjectType>('')
  const [notes,       setNotes]       = useState('')
  const [rate,        setRate]        = useState(120)
  const [rows,        setRows]        = useState<HourRow[]>(DEFAULT_ROWS)
  const [term,        setTerm]        = useState(60)
  const [svcVercel,   setSvcVercel]   = useState(35)
  const [domainOn,    setDomainOn]    = useState(true)
  const [svcDomain,   setSvcDomain]   = useState(10)
  const [svcSupport,  setSvcSupport]  = useState(20)
  const [downloading, setDownloading] = useState(false)

  // ── Derived values ───────────────────────────────────────────────────────

  const totalHours = rows.reduce((s, r) => s + r.hours, 0)
  const buildValue = totalHours * rate
  const brc        = term > 0 ? buildValue / term : 0
  const svcTotal   = svcVercel + (domainOn ? svcDomain : 0) + svcSupport
  const monthly    = brc + svcTotal

  const etfRows = (() => {
    const out: { exitAt: number; remaining: number; disc: number; etf: number }[] = []
    const step = term <= 24 ? 3 : 6
    for (let m = step; m < term; m += step) {
      const remaining = term - m
      const disc = remaining < 24 ? 0.05 : 0.10
      out.push({ exitAt: m, remaining, disc, etf: brc * remaining * (1 - disc) })
    }
    return out
  })()

  // ── Handlers ─────────────────────────────────────────────────────────────

  const updateRow = useCallback((i: number, hours: number) => {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, hours } : r))
  }, [])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const rows2d: (string | number)[][] = [
        ['Web F5 Internal Quote — Evidence Record'],
        [],
        ['Client', clientName || '—'],
        ['Project reference', projectRef || '—'],
        ['Quote date', quoteDate],
        ['Quoted by', quotedBy || '—'],
        ['Project type', projectType || '—'],
        ['Notes', notes || '—'],
        [],
        ['BUILD COST CALCULATION'],
        ['Internal rate ($/hr)', rate],
        [],
        ['Category', 'Hours', 'Subtotal ($)'],
        ...rows.map(r => [r.label, r.hours, (r.hours * rate).toFixed(2)]),
        [],
        ['Total hours', totalHours, buildValue.toFixed(2)],
        [],
        ['PAYMENT STRUCTURE'],
        ['Payment term (months)', term],
        ['Build Recovery Component ($/mo)', brc.toFixed(2)],
        ['Service Component ($/mo)', svcTotal.toFixed(2)],
        ['Total Monthly Fee ($/mo)', monthly.toFixed(2)],
        [],
        ['ETF SCHEDULE'],
        ['Exit at month', 'Remaining months', 'Discount', 'ETF ($)'],
        ...etfRows.map(r => [`Month ${r.exitAt}`, r.remaining, r.disc < 0.06 ? '5%' : '10%', Math.round(r.etf)]),
      ]

      const csv = rows2d.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
      const filename = `WF5-Quote-${(clientName + '-' + (projectRef || quoteDate)).replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`

      const blob = new Blob([csv], { type: 'text/csv' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
    } finally {
      setDownloading(false)
    }
  }

  const handleClear = () => {
    if (!confirm('Clear all fields?')) return
    setClientName(''); setProjectRef(''); setQuotedBy('')
    setProjectType(''); setNotes(''); setRate(120)
    setRows(DEFAULT_ROWS); setTerm(60)
    setSvcVercel(35); setSvcDomain(10); setSvcSupport(20); setDomainOn(true)
  }

  // ── Styles (inline design system) ────────────────────────────────────────

  const card  = 'bg-[#111827] border border-white/10 rounded-xl overflow-hidden'
  const cHead = 'px-4 py-3 border-b border-white/10 flex items-center justify-between gap-2'
  const cBody = 'p-4 flex flex-col gap-4'
  const label = 'text-xs font-medium text-slate-400 tracking-wide mb-1 block'
  const inp   = 'w-full bg-[#1E293B] border border-white/10 rounded-lg text-white text-sm px-3 py-2 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600'
  const mono  = 'font-mono'

  const typeColour: Record<string, string> = {
    'Starter':          'border-indigo-500 bg-indigo-500/10 text-indigo-300',
    'Professional':     'border-emerald-500 bg-emerald-500/10 text-emerald-300',
    'Shopify Hydrogen': 'border-amber-500 bg-amber-500/10 text-amber-300',
  }

  return (
    <div className="text-white px-4 py-10">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Quote builder</h1>
            <p className="text-slate-400 text-sm mt-1">
              Internal tool — scope the build, calculate the BRC, generate the contract-ready quote breakdown
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="text-xs text-slate-500 hover:text-slate-300 border border-white/10 rounded-lg px-3 py-2 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => window.print()}
              className="text-xs text-slate-400 hover:text-slate-200 border border-white/10 rounded-lg px-3 py-2 transition-colors"
            >
              Print / PDF
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading || buildValue === 0}
              className="text-xs font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-900 rounded-lg px-4 py-2 transition-colors"
            >
              {downloading ? 'Preparing…' : '↓ Download CSV'}
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">

          {/* ── LEFT ── */}
          <div className="flex flex-col gap-5">

            {/* Project info */}
            <div className={card}>
              <div className={cHead}>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Project info</span>
              </div>
              <div className={cBody}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={label}>Client name</label>
                    <input className={inp} value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Smith Electrical" />
                  </div>
                  <div>
                    <label className={label}>Project reference</label>
                    <input className={inp} value={projectRef} onChange={e => setProjectRef(e.target.value)} placeholder="WF5-2026-001" />
                  </div>
                  <div>
                    <label className={label}>Quote date</label>
                    <input className={inp} type="date" value={quoteDate} onChange={e => setQuoteDate(e.target.value)} />
                  </div>
                  <div>
                    <label className={label}>Quoted by</label>
                    <input className={inp} value={quotedBy} onChange={e => setQuotedBy(e.target.value)} placeholder="Your name" />
                  </div>
                </div>
                <div>
                  <label className={label}>Project type</label>
                  <div className="flex gap-2 flex-wrap">
                    {PROJECT_TYPES.map(t => (
                      <button
                        key={t}
                        onClick={() => setProjectType(prev => prev === t ? '' : t)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                          projectType === t ? (typeColour[t] ?? 'border-indigo-500 text-indigo-300') : 'border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={label}>Notes (internal only)</label>
                  <input className={inp} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Referral from ABC Plumbing, ecommerce with 50 products" />
                </div>
              </div>
            </div>

            {/* Build cost */}
            <div className={card}>
              <div className={cHead}>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Build cost calculator</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Internal rate</span>
                  <span className="text-slate-500 text-sm">$</span>
                  <input
                    type="number" value={rate} min={0} step={5}
                    onChange={e => setRate(Number(e.target.value))}
                    className={`bg-[#1E293B] border border-white/10 rounded-lg text-amber-400 ${mono} text-sm font-semibold px-2 py-1 w-16 text-right outline-none focus:border-indigo-500`}
                  />
                  <span className="text-xs text-slate-500">/hr</span>
                </div>
              </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase tracking-wider">
                      <th className="text-left pb-3 font-medium">Category</th>
                      <th className="text-right pb-3 font-medium w-24">Hours</th>
                      <th className="text-right pb-3 font-medium w-28">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rows.map((row, i) => (
                      <tr key={row.label}>
                        <td className="py-2 text-slate-300">{row.label}</td>
                        <td className="py-2 text-right">
                          <input
                            type="number" value={row.hours} min={0} step={0.5}
                            onChange={e => updateRow(i, Number(e.target.value))}
                            className={`bg-[#1E293B] border border-white/10 rounded-md text-white ${mono} text-sm px-2 py-1 w-16 text-right outline-none focus:border-indigo-500`}
                          />
                        </td>
                        <td className={`py-2 text-right ${mono} text-xs text-slate-500`}>
                          {row.hours > 0 ? fmt(row.hours * rate) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-white/10">
                      <td className="pt-3 font-semibold text-amber-400">Total build value</td>
                      <td className={`pt-3 text-right ${mono} text-sm text-amber-400 font-semibold`}>{totalHours} hrs</td>
                      <td className={`pt-3 text-right ${mono} text-sm text-amber-400 font-semibold`}>{fmt(buildValue)}</td>
                    </tr>
                  </tfoot>
                </table>

                <div className="mt-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-2.5 text-xs text-slate-400 leading-relaxed">
                  <span className="text-indigo-400 font-medium">Evidence trail: </span>
                  This hours breakdown is your legal evidence that the Build Recovery Component is not arbitrary. Save the CSV per project — if an ETF is ever disputed, these figures are what your solicitor will rely on.
                </div>
              </div>
            </div>

            {/* Payment term */}
            <div className={card}>
              <div className={cHead}>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment term</span>
              </div>
              <div className={cBody}>
                <div>
                  <label className={label}>Subscription length</label>
                  <div className="flex gap-2 flex-wrap">
                    {TERMS.map(t => (
                      <button
                        key={t}
                        onClick={() => setTerm(t)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                          term === t
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                            : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
                        }`}
                      >
                        {t} months
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
                  <span className="text-sm text-slate-400">Build Recovery Component</span>
                  <span className={`${mono} text-lg font-semibold text-amber-400`}>{fmt(brc)}/mo</span>
                </div>
                {buildValue > 0 && (
                  <p className={`text-xs text-slate-500 ${mono}`}>
                    {fmt(buildValue)} ÷ {term} months = {fmt(brc)}/mo
                  </p>
                )}
              </div>
            </div>

            {/* Service component */}
            <div className={card}>
              <div className={cHead}>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Service component</span>
              </div>
              <div className={cBody}>
                {[
                  {
                    label: 'Vercel infrastructure hosting',
                    sub: 'Adjust for plan tier — Pro ~$50, standard ~$35',
                    val: svcVercel, set: setSvcVercel, disabled: false, toggle: null,
                  },
                  {
                    label: 'Domain & SSL management',
                    sub: 'Uncheck if client keeps their own registrar',
                    val: svcDomain, set: setSvcDomain, disabled: !domainOn,
                    toggle: { checked: domainOn, onChange: () => setDomainOn(v => !v) },
                  },
                  {
                    label: 'Maintenance & support retainer',
                    sub: 'Ongoing updates, monitoring, support',
                    val: svcSupport, set: setSvcSupport, disabled: false, toggle: null,
                  },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-none">
                    <div className="flex-1 min-w-0">
                      {row.toggle ? (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox" checked={row.toggle.checked}
                            onChange={row.toggle.onChange}
                            className="accent-indigo-500"
                          />
                          <span className="text-sm text-white">{row.label}</span>
                        </label>
                      ) : (
                        <span className="text-sm text-white">{row.label}</span>
                      )}
                      <span className="text-xs text-slate-500 block mt-0.5">{row.sub}</span>
                    </div>
                    <span className="text-slate-500 text-sm">$</span>
                    <input
                      type="number" value={row.val} min={0} step={1}
                      disabled={row.disabled}
                      onChange={e => row.set(Number(e.target.value))}
                      className={`bg-[#1E293B] border border-white/10 rounded-lg text-white ${mono} text-sm px-2 py-1.5 w-20 text-right outline-none focus:border-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed`}
                    />
                    <span className="text-xs text-slate-500 w-6">/mo</span>
                  </div>
                ))}
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
                  <span className="text-sm text-slate-400">Service Component total</span>
                  <span className={`${mono} text-lg font-semibold text-emerald-400`}>{fmt(svcTotal)}/mo</span>
                </div>
              </div>
            </div>

          </div>{/* /left */}

          {/* ── RIGHT ── */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-[57px]">

            {/* Quote output */}
            <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-emerald-500/20">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Quote breakdown — for contract & client</span>
              </div>
              <div className="p-4 flex flex-col gap-1.5 text-sm">
                {buildValue === 0 ? (
                  <p className="text-slate-500 text-xs">Enter hours to generate the quote breakdown.</p>
                ) : (
                  <>
                    <div className="text-xs text-slate-500 pb-1">
                      {clientName || '[Client]'} · {projectRef || '—'} · {quoteDate}
                      {projectType && <span className="ml-2 text-slate-600">· {projectType}</span>}
                    </div>
                    <hr className="border-emerald-500/15 my-1" />

                    <QtLine label="Total website build value"    value={fmt(buildValue)} />
                    <QtLine label="Build Recovery Component"     value={`${fmt(brc)}/mo`} highlight="amber" />
                    <div className="text-xs text-slate-600 italic pl-1">{fmt(buildValue)} ÷ {term} months</div>

                    <hr className="border-emerald-500/15 my-1" />
                    <div className="text-xs text-slate-500 uppercase tracking-wider pb-0.5">Service Component breakdown</div>
                    <QtLine label="· Vercel infrastructure hosting"       value={`${fmt(svcVercel)}/mo`} sub />
                    {domainOn
                      ? <QtLine label="· Domain registration & SSL management" value={`${fmt(svcDomain)}/mo`} sub />
                      : <QtLine label="· Domain & SSL — client self-managed"   value="—" sub dim />
                    }
                    <QtLine label="· Maintenance & support retainer"      value={`${fmt(svcSupport)}/mo`} sub />
                    <QtLine label="Service Component (total)"             value={`${fmt(svcTotal)}/mo`} highlight="emerald" />

                    <hr className="border-emerald-500/15 my-1" />
                    <div className="flex justify-between items-baseline gap-2 pt-1">
                      <span className="font-bold text-white text-base">Total Monthly Fee</span>
                      <span className={`${mono} font-bold text-emerald-400 text-base`}>{fmt(monthly)}/mo</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">Based on {term}-month term · All amounts ex GST</div>
                  </>
                )}
              </div>
            </div>

            {/* ETF schedule */}
            <div className={card}>
              <div className={cHead}>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ETF schedule</span>
              </div>
              <div className="p-4">
                {etfRows.length === 0 ? (
                  <p className="text-xs text-slate-500">Enter build cost and term to generate.</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-500 uppercase tracking-wider text-[10px]">
                        <th className="text-left pb-2 font-medium">Exit</th>
                        <th className="text-right pb-2 font-medium">Remaining</th>
                        <th className="text-right pb-2 font-medium">Disc.</th>
                        <th className="text-right pb-2 font-medium">ETF</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {etfRows.map(r => (
                        <tr key={r.exitAt} className="hover:bg-white/5">
                          <td className="py-1.5 text-slate-300">Month {r.exitAt}</td>
                          <td className={`py-1.5 text-right ${mono} text-slate-500`}>{r.remaining} mo</td>
                          <td className={`py-1.5 text-right ${mono} text-slate-500`}>{r.disc < 0.06 ? '5%' : '10%'}</td>
                          <td className={`py-1.5 text-right ${mono} text-red-400 font-medium`}>{fmtInt(r.etf)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <p className="text-[10px] text-slate-600 mt-3 leading-relaxed">
                  ETF = BRC × Remaining Months × Discount. 5% if &lt;24 mo remaining; 10% if ≥24 mo. Excludes Direct Costs (cl. 8.1A).
                </p>
              </div>
            </div>

            {/* Evidence summary */}
            <div className={card}>
              <div className={cHead}>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Evidence summary</span>
              </div>
              <div className="p-4">
                {buildValue === 0 ? (
                  <p className="text-xs text-slate-500">Complete the form to generate.</p>
                ) : (
                  <div className={`${mono} text-xs text-slate-400 leading-7 space-y-0`}>
                    <div><span className="text-slate-600">Client:  </span>{clientName || '[not set]'}</div>
                    <div><span className="text-slate-600">Ref:     </span>{projectRef || '[not set]'}</div>
                    <div><span className="text-slate-600">Date:    </span>{quoteDate}</div>
                    <div className="border-t border-white/5 mt-2 pt-2">
                      <div><span className="text-slate-600">Rate:    </span>${rate}/hr</div>
                      <div><span className="text-slate-600">Hours:   </span>{totalHours} hrs</div>
                      <div><span className="text-slate-600">Build:   </span>{fmt(buildValue)}</div>
                      <div><span className="text-slate-600">Term:    </span>{term} months</div>
                    </div>
                    <div className="border-t border-white/5 mt-2 pt-2 text-amber-400">
                      BRC = {fmt(buildValue)} ÷ {term} = {fmt(brc)}/mo
                    </div>
                    <div className="border-t border-white/5 mt-2 pt-2 text-[10px] text-slate-600 font-sans leading-relaxed">
                      Keep the downloaded CSV on file per project. If an ETF is disputed, this is the evidence that the Build Recovery Component is a genuine pre-estimate of loss.
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>{/* /right */}

        </div>
      </div>
    </div>
  )
}

// ── Small presentational component ───────────────────────────────────────────

function QtLine({ label, value, highlight, sub, dim }: {
  label: string; value: string
  highlight?: 'amber' | 'emerald'; sub?: boolean; dim?: boolean
}) {
  const valColour = highlight === 'amber' ? 'text-amber-400' : highlight === 'emerald' ? 'text-emerald-400' : dim ? 'text-slate-600' : 'text-slate-400'
  const lblColour = sub ? 'text-slate-500 pl-2 text-xs' : 'text-slate-300'
  return (
    <div className="flex justify-between items-baseline gap-2">
      <span className={lblColour}>{label}</span>
      <span className={`font-mono text-xs ${valColour} flex-shrink-0`}>{value}</span>
    </div>
  )
}
