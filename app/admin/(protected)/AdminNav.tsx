'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Brief drafts', href: '/admin/briefs' },
  { label: 'Quote builder', href: '/admin/quotes' },
  { label: 'Outreach', href: '/admin/outreach' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <div className="bg-[#0A0F1E] border-b border-white/10 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
        <nav className="flex gap-1">
          {tabs.map(tab => {
            const active = pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
        <a
          href="/api/admin/logout"
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors py-3.5"
        >
          Sign out
        </a>
      </div>
    </div>
  )
}
