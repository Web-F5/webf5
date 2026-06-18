'use client'

import { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

// ── Field wrapper ────────────────────────────────────────────────────────────

interface FieldProps {
  label: string
  hint?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function Field({ label, hint, required, children, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-sm font-medium text-slate-300">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
        {hint && <span className="ml-1.5 font-normal text-slate-500">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

// ── Text input ───────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500',
        'transition-colors focus:outline-none focus:ring-1',
        error
          ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20'
          : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/40',
        className
      )}
      {...props}
    />
  )
}

// ── Textarea ─────────────────────────────────────────────────────────────────

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      className={cn(
        'w-full resize-y rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500',
        'transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40',
        className
      )}
      {...props}
    />
  )
}

// ── Select ───────────────────────────────────────────────────────────────────

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white',
        'transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40',
        '[&>option]:bg-slate-900',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

// ── Option card (single select) ───────────────────────────────────────────────

interface OptionCardProps {
  selected: boolean
  onClick: () => void
  icon?: string
  title: string
  subtitle?: string
  className?: string
}

export function OptionCard({ selected, onClick, icon, title, subtitle, className }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-150',
        selected
          ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
          : 'border-slate-700 bg-slate-800/40 hover:border-slate-500 hover:bg-slate-800/80',
        className
      )}
    >
      {icon && (
        <span className={cn('mt-0.5 text-base leading-none', selected ? 'text-indigo-400' : 'text-slate-400')}>
          {icon}
        </span>
      )}
      <div>
        <p className={cn('text-sm font-medium', selected ? 'text-indigo-200' : 'text-white')}>{title}</p>
        {subtitle && (
          <p className={cn('mt-0.5 text-xs', selected ? 'text-indigo-400' : 'text-slate-500')}>{subtitle}</p>
        )}
      </div>
    </button>
  )
}

// ── Checkbox row ─────────────────────────────────────────────────────────────

interface CheckRowProps {
  checked: boolean
  onChange: () => void
  label: string
  sublabel?: string
}

export function CheckRow({ checked, onChange, label, sublabel }: CheckRowProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-150',
        checked
          ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
          : 'border-slate-700 bg-slate-800/40 hover:border-slate-500'
      )}
    >
      <span
        className={cn(
          'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border text-xs transition-colors',
          checked ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-600 bg-transparent text-transparent'
        )}
      >
        ✓
      </span>
      <div>
        <span className={cn('text-sm', checked ? 'text-indigo-200' : 'text-white')}>{label}</span>
        {sublabel && <p className="mt-0.5 text-xs text-slate-500">{sublabel}</p>}
      </div>
    </button>
  )
}

// ── Add-on row ───────────────────────────────────────────────────────────────

interface AddOnRowProps {
  checked: boolean
  onChange: () => void
  name: string
  description: string
  price: string
}

export function AddOnRow({ checked, onChange, name, description, price }: AddOnRowProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl border px-4 py-4 text-left transition-all duration-150',
        checked
          ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
          : 'border-slate-700 bg-slate-800/40 hover:border-slate-500'
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border text-xs transition-colors',
          checked ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-600 text-transparent'
        )}
      >
        ✓
      </span>
      <div className="flex-1">
        <p className={cn('text-sm font-medium', checked ? 'text-indigo-200' : 'text-white')}>{name}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        <p className={cn('mt-1.5 text-xs font-medium', checked ? 'text-indigo-400' : 'text-slate-400')}>{price}</p>
      </div>
    </button>
  )
}

// ── Upload zone ───────────────────────────────────────────────────────────────

interface UploadZoneProps {
  id: string
  label: string
  sublabel: string
  accept: string
  multiple?: boolean
  files: File[]
  onFiles: (files: File[]) => void
}

export function UploadZone({ id, label, sublabel, accept, multiple, files, onFiles }: UploadZoneProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFiles(multiple ? Array.from(e.target.files) : [e.target.files[0]])
    }
  }
  return (
    <div>
      <label
        htmlFor={id}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/30 px-6 py-8 text-center transition-colors hover:border-indigo-500/60 hover:bg-slate-800/60"
      >
        <span className="text-2xl text-slate-500">↑</span>
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className="text-xs text-slate-500">{sublabel}</span>
        <input id={id} type="file" accept={accept} multiple={multiple} className="sr-only" onChange={handleChange} />
      </label>
      {files.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <span key={i} className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-400">
              {f.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Info box ─────────────────────────────────────────────────────────────────

export function InfoBox({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-400">
      {children}
    </div>
  )
}

// ── Step header ───────────────────────────────────────────────────────────────

interface StepHeaderProps {
  step: number
  total: number
  title: string
  description: string
}

export function StepHeader({ step, total, title, description }: StepHeaderProps) {
  return (
    <div className="mb-8">
      <p className="mb-2 text-xs font-medium uppercase tracking-widest text-indigo-400">
        Step {step} of {total}
      </p>
      <h2 className="mb-2 text-2xl font-semibold text-white">{title}</h2>
      <p className="text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────

export function Divider() {
  return <hr className="my-6 border-slate-800" />
}

// ── Section heading (used in Step 7 page content cards) ──────────────────────

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-widest text-indigo-400">{children}</p>
  )
}

// ── Page content card (wrapper for Step 7 page-specific sections) ─────────────

export function PageCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04] p-5 flex flex-col gap-4">
      {children}
    </div>
  )
}

// ── Add button ────────────────────────────────────────────────────────────────

interface AddButtonProps {
  onClick: () => void
  label: string
}

export function AddButton({ onClick, label }: AddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg border border-dashed border-slate-600 px-4 py-2.5 text-sm text-slate-400 transition-colors hover:border-indigo-500/60 hover:text-indigo-400 w-full justify-center"
    >
      <span className="text-base leading-none">+</span>
      {label}
    </button>
  )
}

// ── Remove button ─────────────────────────────────────────────────────────────

interface RemoveButtonProps {
  onClick: () => void
}

export function RemoveButton({ onClick }: RemoveButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ml-auto text-xs text-slate-600 hover:text-red-400 transition-colors px-2 py-1 rounded"
    >
      Remove ×
    </button>
  )
}

// ── Dynamic item card ─────────────────────────────────────────────────────────

interface ItemCardProps {
  label: string
  onRemove: () => void
  children: ReactNode
}

export function ItemCard({ label, onRemove, children }: ItemCardProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
        <RemoveButton onClick={onRemove} />
      </div>
      {children}
    </div>
  )
}

// ── Colour utilities ──────────────────────────────────────────────────────────

export function lightenHex(hex: string, pct: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  if (isNaN(n)) return hex
  const r = Math.min(255, Math.round(((n >> 16) & 0xff) + (255 - ((n >> 16) & 0xff)) * pct / 100))
  const g = Math.min(255, Math.round(((n >> 8)  & 0xff) + (255 - ((n >> 8)  & 0xff)) * pct / 100))
  const b = Math.min(255, Math.round(( n         & 0xff) + (255 - ( n         & 0xff)) * pct / 100))
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`
}

function isValidHex(v: string) {
  return /^#[0-9a-fA-F]{6}$/.test(v)
}

// ── Colour swatch ─────────────────────────────────────────────────────────────

interface ColourSwatchProps {
  label: string
  hint?: string
  value: string
  onChange: (hex: string) => void
  autoNote?: string
}

export function ColourSwatch({ label, hint, value, onChange, autoNote }: ColourSwatchProps) {
  const safe = isValidHex(value) ? value : '#6366f1'
  const [hex, setHex] = useState(safe)

  useEffect(() => {
    setHex(isValidHex(value) ? value : '#6366f1')
  }, [value])

  const handlePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value
    if (v && !v.startsWith('#')) v = '#' + v
    setHex(v)
    if (isValidHex(v)) onChange(v)
  }

  return (
    <div className="flex items-center gap-3 py-1.5">
      <div
        className="relative w-10 h-10 flex-shrink-0 rounded-lg border border-white/10 cursor-pointer shadow-inner overflow-hidden"
        style={{ backgroundColor: safe }}
        title="Click to open colour picker"
      >
        <input
          type="color"
          value={safe}
          onChange={handlePicker}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-300">{label}</p>
        {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
        {autoNote && <p className="text-xs text-indigo-400/70 mt-0.5">{autoNote}</p>}
      </div>
      <input
        type="text"
        value={hex}
        onChange={handleText}
        maxLength={7}
        placeholder="#000000"
        className="w-24 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs text-white font-mono text-center focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-colors"
      />
    </div>
  )
}

// ── Palette preview ───────────────────────────────────────────────────────────

interface PalettePreviewProps {
  colours: { label: string; value: string }[]
}

export function PalettePreview({ colours }: PalettePreviewProps) {
  const valid = colours.filter(c => isValidHex(c.value))
  if (valid.length < 2) return null
  return (
    <div className="rounded-xl border border-slate-700 overflow-hidden">
      <div className="flex h-12">
        {valid.map(c => (
          <div key={c.label} className="flex-1" style={{ backgroundColor: c.value }} title={`${c.label}: ${c.value}`} />
        ))}
      </div>
      <div className="flex bg-slate-900/60 divide-x divide-slate-800">
        {valid.map(c => (
          <div key={c.label} className="flex-1 py-1.5 px-1 text-center min-w-0">
            <p className="text-[10px] text-slate-500 font-mono truncate">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Font selector ─────────────────────────────────────────────────────────────

const POPULAR_FONTS = [
  'Barlow', 'Barlow Condensed', 'Bebas Neue', 'Cabin', 'Chakra Petch',
  'Cormorant Garamond', 'DM Sans', 'EB Garamond', 'Exo 2', 'Figtree',
  'Fredoka One', 'Inter', 'Kanit', 'Lato', 'Lora', 'Merriweather',
  'Montserrat', 'Nunito', 'Open Sans', 'Oswald', 'Outfit', 'Pacifico',
  'Playfair Display', 'Plus Jakarta Sans', 'Poppins', 'Quicksand',
  'Raleway', 'Roboto', 'Rubik', 'Space Grotesk', 'Ubuntu',
]

interface FontSelectorProps {
  label: string
  hint?: string
  value: string
  onChange: (font: string) => void
  suggested?: string
}

export function FontSelector({ label, hint, value, onChange, suggested }: FontSelectorProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const loaded = useRef(new Set<string>())

  const loadFont = useCallback((font: string) => {
    if (!font || loaded.current.has(font) || typeof document === 'undefined') return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.replace(/ /g, '+'))}:wght@400;700&display=swap`
    document.head.appendChild(link)
    loaded.current.add(font)
  }, [])

  useEffect(() => {
    if (value) loadFont(value)
    if (suggested) loadFont(suggested)
  }, [value, suggested, loadFont])

  const filtered = search
    ? POPULAR_FONTS.filter(f => f.toLowerCase().includes(search.toLowerCase()))
    : POPULAR_FONTS

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-300">
        {label}
        {hint && <span className="ml-1.5 font-normal text-slate-500">{hint}</span>}
      </label>

      {suggested && (
        <p className="text-xs text-indigo-400/80">
          Suggested for your style:{' '}
          <button
            type="button"
            className="underline hover:text-indigo-300"
            onClick={() => { onChange(suggested); loadFont(suggested) }}
          >
            {suggested}
          </button>
        </p>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex items-center justify-between w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white hover:border-slate-500 transition-colors"
        >
          <span style={{ fontFamily: value || 'inherit' }}>{value || 'Select a font…'}</span>
          <span className="text-slate-500 text-xs ml-2">▾</span>
        </button>

        {open && (
          <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden">
            <div className="p-2 border-b border-slate-700">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search fonts…"
                className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                onClick={e => e.stopPropagation()}
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.map(font => (
                <button
                  key={font}
                  type="button"
                  onMouseEnter={() => loadFont(font)}
                  onClick={() => { onChange(font); loadFont(font); setOpen(false); setSearch('') }}
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-sm hover:bg-slate-700 border-b border-slate-800 last:border-0 transition-colors',
                    value === font ? 'bg-indigo-500/10 text-indigo-200' : 'text-white'
                  )}
                  style={{ fontFamily: loaded.current.has(font) ? font : 'inherit' }}
                >
                  {font}
                </button>
              ))}
            </div>
            <div className="p-2 border-t border-slate-700">
              <input
                type="text"
                placeholder="Or type any Google Font name + Enter…"
                className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const v = (e.target as HTMLInputElement).value.trim()
                    if (v) { onChange(v); loadFont(v); setOpen(false) }
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {value && (
        <div className="rounded-lg bg-slate-900/40 border border-slate-700 px-4 py-3">
          <p className="text-xs text-slate-500 mb-1.5">Preview</p>
          <p className="text-base text-white leading-snug" style={{ fontFamily: value }}>
            The quick brown fox jumps over the lazy dog
          </p>
          <p className="text-sm text-slate-400 mt-1 font-medium" style={{ fontFamily: value }}>
            ABCDEFGHIJKLMNOPQRSTUVWXYZ · 0123456789
          </p>
        </div>
      )}
    </div>
  )
}
