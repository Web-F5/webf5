'use client'

import { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
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