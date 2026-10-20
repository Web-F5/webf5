'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Target Business Prospects', href: '/admin/outreach/sender' },
  { label: 'Outreach Sequences',        href: '/admin/outreach/sequences' },
]

export default function OutreachLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div>
      <div className="border-b border-white/10 bg-[#0D1220]">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {tabs.map(tab => {
              const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    active
                      ? 'border-indigo-400 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
      {children}
    </div>
  )
}
