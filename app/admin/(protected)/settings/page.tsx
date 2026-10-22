'use client'

import { useEffect, useState } from 'react'
import { Save, CheckCircle, HelpCircle, X, ExternalLink } from 'lucide-react'

type Settings = {
  sender_name:    string
  sender_title:   string
  sender_company: string
  sender_slogan:  string
  sender_phone:   string
  sender_website: string
  github_repo:    string
  github_token:   string
}

const DEFAULTS: Settings = {
  sender_name:    '',
  sender_title:   '',
  sender_company: '',
  sender_slogan:  '',
  sender_phone:   '',
  sender_website: '',
  github_repo:    '',
  github_token:   '',
}

export default function SettingsPage() {
  const [settings,    setSettings]    = useState<Settings>(DEFAULTS)
  const [saved,       setSaved]       = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [loaded,      setLoaded]      = useState(false)
  const [tokenHelp,   setTokenHelp]   = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then((data: Partial<Settings>) => {
        setSettings({ ...DEFAULTS, ...data })
        setLoaded(true)
      })
  }, [])

  function set(key: keyof Settings, value: string) {
    setSettings(s => ({ ...s, [key]: value }))
    setSaved(false)
  }

  async function save() {
    setSaving(true)
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaving(false)
    setSaved(true)
  }

  const hasPreview = Object.values(settings).some(Boolean)

  if (!loaded) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-slate-500 text-sm">Loading…</div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">

      <div>
        <h1 className="text-xl font-bold text-white mb-1">Settings</h1>
        <p className="text-slate-400 text-sm">Configure defaults used across your send tools.</p>
      </div>

      {/* Email signature */}
      <section className="bg-[#111827] border border-white/10 rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-white mb-0.5">Email signature</h2>
          <p className="text-xs text-slate-500">Appended to every outreach email sent from the CRM Send Tools.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Your name"   placeholder="Josh"              value={settings.sender_name}    onChange={v => set('sender_name', v)} />
          <Field label="Title / role" placeholder="Web Developer"    value={settings.sender_title}   onChange={v => set('sender_title', v)}
            hint="Appears in indigo" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Company name" placeholder="Web F5"           value={settings.sender_company} onChange={v => set('sender_company', v)}
            hint="Appears in indigo" />
          <Field label="Slogan"       placeholder="Built to perform" value={settings.sender_slogan}  onChange={v => set('sender_slogan', v)}
            hint="Appears in amber" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Phone number" placeholder="0419 510 206"    value={settings.sender_phone}   onChange={v => set('sender_phone', v)}
            hint="Tap-to-call in email" />
          <Field label="Website"      placeholder="webf5.com.au"    value={settings.sender_website} onChange={v => set('sender_website', v)}
            hint="Becomes a hyperlink" />
        </div>

        {/* Preview */}
        {hasPreview && (
          <div className="bg-white/[0.03] border border-white/5 rounded-xl px-5 py-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Preview</p>
            <div className="text-sm space-y-0.5 font-sans">
              <p className="text-slate-400 italic">Cheers,</p>
              {settings.sender_name    && <p className="font-semibold text-white">{settings.sender_name}</p>}
              {settings.sender_title   && <p style={{ color: '#6366F1' }}>{settings.sender_title}</p>}
              {settings.sender_company && <p style={{ color: '#6366F1' }}>{settings.sender_company}</p>}
              {settings.sender_slogan  && <p style={{ color: '#F5A623' }} className="italic">{settings.sender_slogan}</p>}
              {settings.sender_phone   && (
                <a href={`tel:${settings.sender_phone.replace(/\s/g, '')}`} className="block text-slate-400 hover:text-white transition-colors">
                  {settings.sender_phone}
                </a>
              )}
              {settings.sender_website && (
                <a href={settings.sender_website.startsWith('http') ? settings.sender_website : `https://${settings.sender_website}`}
                  target="_blank" rel="noreferrer" className="block text-slate-400 hover:text-white transition-colors">
                  {settings.sender_website}
                </a>
              )}
            </div>
          </div>
        )}
      </section>

      {/* GitHub integration */}
      <section className="bg-[#111827] border border-white/10 rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-white mb-0.5">GitHub Integration</h2>
          <p className="text-xs text-slate-500">Used by the SEO Tool to scan and fix Next.js repositories.</p>
        </div>
        <Field label="Repository URL" placeholder="https://github.com/owner/repo" value={settings.github_repo} onChange={v => set('github_repo', v)} />
        <Field label="Personal access token" placeholder="github_pat_..." value={settings.github_token} onChange={v => set('github_token', v)} type="password"
          hint="Needs repo scope (read + write contents)" />
        <button
          type="button"
          onClick={() => setTokenHelp(true)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors"
        >
          <HelpCircle size={12} />
          How to create a Personal Access Token
        </button>
      </section>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
        >
          {saved ? (
            <><CheckCircle size={15} /> Saved</>
          ) : (
            <><Save size={15} /> {saving ? 'Saving…' : 'Save settings'}</>
          )}
        </button>
      </div>

      {/* Token help modal */}
      {tokenHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 max-w-lg w-full space-y-5">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-white font-semibold">How to create a Personal Access Token</h3>
              <button onClick={() => setTokenHelp(false)} className="text-slate-500 hover:text-white transition-colors flex-shrink-0">
                <X size={16} />
              </button>
            </div>

            <ol className="space-y-3 text-sm text-slate-300">
              <Step n={1}>
                Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-1">github.com <ExternalLink size={11} /></a> and sign in, then click your profile photo (top right) and go to <strong className="text-white">Settings</strong>.
              </Step>
              <Step n={2}>
                Scroll to the bottom of the left sidebar and click <strong className="text-white">Developer settings</strong>.
              </Step>
              <Step n={3}>
                Click <strong className="text-white">Personal access tokens</strong> then <strong className="text-white">Tokens (classic)</strong>.
              </Step>
              <Step n={4}>
                Click <strong className="text-white">Generate new token (classic)</strong>. Give it a name like <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-xs">Web F5 SEO Tool</span> and set an expiration.
              </Step>
              <Step n={5}>
                Under <strong className="text-white">Select scopes</strong>, tick the <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-xs">repo</span> checkbox — this gives read and write access to repository contents.
              </Step>
              <Step n={6}>
                Click <strong className="text-white">Generate token</strong>. <span className="text-amber-400">Copy it immediately</span> — GitHub only shows it once.
              </Step>
              <Step n={7}>
                Paste it into the Personal access token field above and click <strong className="text-white">Save settings</strong>.
              </Step>
            </ol>

            <button
              onClick={() => setTokenHelp(false)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 text-xs font-bold flex items-center justify-center mt-0.5">
        {n}
      </span>
      <span className="leading-relaxed">{children}</span>
    </li>
  )
}

function Field({
  label, placeholder, value, onChange, hint, type = 'text',
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  hint?: string
  type?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
      />
      {hint && <p className="text-xs text-slate-600">{hint}</p>}
    </div>
  )
}
