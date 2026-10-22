'use client'

import { useState } from 'react'
import { Search, CheckCircle, AlertTriangle, AlertCircle, Wrench, ExternalLink, RefreshCw, FileCode } from 'lucide-react'
import type { Finding } from '@/app/api/admin/seo-tool/scan/route'

type ScanResult = {
  findings: Finding[]
  stats: { files: number; issues: number; fixable: number }
  owner: string
  repo: string
}

const SEVERITY_ORDER = { error: 0, warning: 1 }

const TYPE_LABELS: Record<string, string> = {
  missing_metadata:    'Missing metadata',
  missing_title:       'Missing title',
  missing_description: 'Missing description',
  missing_og:          'Missing Open Graph',
  missing_alt:         'Missing alt text',
  missing_robots:      'No robots.txt',
  missing_sitemap:     'No sitemap',
}

export default function SeoToolPage() {
  const [result,   setResult]   = useState<ScanResult | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [fixing,   setFixing]   = useState<string | null>(null)
  const [fixed,    setFixed]    = useState<Set<string>>(new Set())
  const [confirm,  setConfirm]  = useState<Finding | null>(null)

  async function runScan() {
    setScanning(true)
    setError(null)
    setResult(null)
    setFixed(new Set())
    try {
      const res = await fetch('/api/admin/seo-tool/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Scan failed')
      setResult(data)
    } catch (e) {
      setError(String(e))
    } finally {
      setScanning(false)
    }
  }

  async function applyFix(finding: Finding) {
    if (!finding.fix) return
    setFixing(finding.id)
    setConfirm(null)
    try {
      const res = await fetch('/api/admin/seo-tool/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path:          finding.file,
          newContent:    finding.fix.newContent,
          sha:           finding.fix.sha,
          commitMessage: finding.fix.commitMessage,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Fix failed')
      setFixed(prev => new Set([...prev, finding.id]))
    } catch (e) {
      setError(String(e))
    } finally {
      setFixing(null)
    }
  }

  const visible = result?.findings
    .filter(f => !fixed.has(f.id))
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
  ?? []

  const errors   = visible.filter(f => f.severity === 'error')
  const warnings = visible.filter(f => f.severity === 'warning')

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">SEO Tool</h1>
          <p className="text-slate-400 text-sm">Scan a Next.js GitHub repo for SEO issues and apply fixes directly via commit.</p>
        </div>
        <button
          onClick={runScan}
          disabled={scanning}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm flex-shrink-0"
        >
          {scanning
            ? <><RefreshCw size={14} className="animate-spin" /> Scanning…</>
            : <><Search size={14} /> Run scan</>}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Stats */}
      {result && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pages scanned', value: result.stats.files },
            { label: 'Issues found',  value: result.stats.issues - fixed.size },
            { label: 'Auto-fixable',  value: visible.filter(f => f.fixable).length },
          ].map(s => (
            <div key={s.label} className="bg-[#111827] border border-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* All clear */}
      {result && visible.length === 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-5 py-6 text-center">
          <CheckCircle size={28} className="text-emerald-400 mx-auto mb-2" />
          <p className="text-emerald-300 font-semibold">No issues found</p>
          <p className="text-slate-400 text-sm mt-1">
            {result.owner}/{result.repo} looks good.
          </p>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <FindingGroup
          label="Errors"
          icon={<AlertCircle size={15} className="text-red-400" />}
          findings={errors}
          fixing={fixing}
          onFix={setConfirm}
        />
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <FindingGroup
          label="Warnings"
          icon={<AlertTriangle size={15} className="text-amber-400" />}
          findings={warnings}
          fixing={fixing}
          onFix={setConfirm}
        />
      )}

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-white font-semibold">Apply fix?</h3>
            <p className="text-slate-400 text-sm">This will commit the following change directly to your repository:</p>
            <div className="bg-white/5 rounded-lg px-4 py-3 text-xs font-mono text-slate-300 break-all">
              {confirm.fix?.commitMessage}
            </div>
            <p className="text-xs text-slate-500">File: {confirm.file}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirm(null)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={() => applyFix(confirm)}
                disabled={fixing === confirm.id}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors"
              >
                <Wrench size={13} /> Commit fix
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

function FindingGroup({
  label, icon, findings, fixing, onFix,
}: {
  label: string
  icon: React.ReactNode
  findings: Finding[]
  fixing: string | null
  onFix: (f: Finding) => void
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="text-sm font-semibold text-white">{label}</h2>
        <span className="text-xs text-slate-500">({findings.length})</span>
      </div>
      {findings.map(f => (
        <FindingRow key={f.id} finding={f} fixing={fixing} onFix={onFix} />
      ))}
    </section>
  )
}

function FindingRow({
  finding, fixing, onFix,
}: {
  finding: Finding
  fixing: string | null
  onFix: (f: Finding) => void
}) {
  const isFixing = fixing === finding.id
  const isGlobal = finding.id.startsWith('global:')

  return (
    <div className="bg-[#111827] border border-white/8 rounded-xl px-4 py-3.5 flex items-start gap-3">
      <FileCode size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            finding.severity === 'error'
              ? 'bg-red-500/15 text-red-400'
              : 'bg-amber-500/15 text-amber-400'
          }`}>
            {TYPE_LABELS[finding.type] ?? finding.type}
          </span>
          {!isGlobal && (
            <span className="text-xs text-slate-500 font-mono truncate max-w-xs">{finding.file}</span>
          )}
        </div>
        <p className="text-sm text-slate-300">{finding.message}</p>
      </div>
      {finding.fixable && finding.fix && (
        <button
          onClick={() => onFix(finding)}
          disabled={isFixing}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/10 disabled:opacity-50 rounded-lg px-3 py-1.5 transition-colors flex-shrink-0"
        >
          {isFixing
            ? <><RefreshCw size={11} className="animate-spin" /> Fixing…</>
            : <><Wrench size={11} /> Fix</>}
        </button>
      )}
      {!isGlobal && (
        <a
          href={`https://github.com`}
          className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0 mt-0.5"
          title="View on GitHub"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink size={13} />
        </a>
      )}
    </div>
  )
}
