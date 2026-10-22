'use client'

import { useEffect, useState } from 'react'
import { Save, CheckCircle } from 'lucide-react'

type Settings = {
  sender_name:    string
  sender_title:   string
  sender_company: string
  sender_slogan:  string
  sender_phone:   string
  sender_website: string
}

const DEFAULTS: Settings = {
  sender_name:    '',
  sender_title:   '',
  sender_company: '',
  sender_slogan:  '',
  sender_phone:   '',
  sender_website: '',
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [saved, setSaved]       = useState(false)
  const [saving, setSaving]     = useState(false)
  const [loaded, setLoaded]     = useState(false)

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
    </div>
  )
}

function Field({
  label, placeholder, value, onChange, hint,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
      />
      {hint && <p className="text-xs text-slate-600">{hint}</p>}
    </div>
  )
}
